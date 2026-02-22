/**
 * Variable Tracker for Newo DSL Language Server
 *
 * Performs single-file variable analysis: tracks definitions, references,
 * inferred types, scopes, and literal values. Provides the data needed
 * for variable completions, hover, go-to-definition, and diagnostics.
 */

import { ACTIONS } from '@newo-dsl/data';
import type { SkillParameter } from './format-utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VariableSource = 'set' | 'set-action' | 'parameter' | 'for-loop' | 'for-loop-context';

export interface VariableDefinition {
  name: string;
  /** Line number (0-based, matching LSP convention) */
  line: number;
  /** Column where the variable name starts (0-based) */
  column: number;
  /** How this variable was introduced */
  source: VariableSource;
  /** The raw RHS expression (e.g. "GetUser()" or '"hello"') */
  valueExpr?: string;
  /** Inferred type string (e.g. "User", "string", "any") */
  inferredType?: string;
  /** For object types, the shape key into OBJECT_SHAPES */
  shapeKey?: string;
  /** For array types, the element shape key */
  elementShapeKey?: string;
  /** Tracked literal value(s). Multiple values = union from branches. */
  literalValues?: string[];
  /** End of scope line for scoped variables (for-loop vars). -1 = file scope. */
  scopeEndLine: number;
}

export interface VariableReference {
  name: string;
  line: number;
  column: number;
  /** Property access chain after the variable, e.g. ["arguments", "name"] for var.arguments.name */
  propertyChain?: string[];
  /** True when this reference appears inside an {% if %} or {% elif %} condition expression */
  inCondition?: boolean;
}

export interface VariableTable {
  definitions: Map<string, VariableDefinition[]>;
  references: VariableReference[];
  /** All variable names available at any point in the file (for completions) */
  allNames: Set<string>;
  /** Raw lines of the source text (for contextual checks in diagnostics) */
  _lines: string[];
}

// ---------------------------------------------------------------------------
// Well-known implicit variables (never flagged as undefined)
// ---------------------------------------------------------------------------

const IMPLICIT_VARIABLES = new Set([
  // Jinja/Guidance language built-ins
  'true', 'false', 'none', 'True', 'False', 'None',
  'json', '_', 'loop', 'caller', 'varargs', 'kwargs',
  'self', 'super', 'namespace',
  // Python standard library modules injected into the template environment
  're', 'datetime', 'zoneinfo', 'uuid',
  // Guidance role markers - special block structures, not variables
  // Used as {{system}}...{{end}}, {{assistant}}...{{end}}, {{user}}...{{end}}
  'system', 'assistant', 'user', 'end',
]);

// ---------------------------------------------------------------------------
// Regex patterns used during extraction
// ---------------------------------------------------------------------------

// {% set varName = expr %}
const SET_STMT_RE = /\{%-?\s*set\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]*?)\s*-?%\}/g;

// {{ Set(name="varName", value=expr) }} or {% ... Set(name="varName", value=expr) ... %}
const SET_ACTION_RE = /Set\s*\(\s*name\s*=\s*["']([A-Za-z_][A-Za-z0-9_]*)["']/g;

// {% set varName %}...{% endset %} (capture block - captures rendered content as string)
const SET_CAPTURE_RE = /\{%-?\s*set\s+([A-Za-z_][A-Za-z0-9_]*)\s*-?%\}/g;

// {% for varName in expr %}
const FOR_STMT_RE = /\{%-?\s*for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+([\s\S]*?)\s*-?%\}/g;

// {% endfor %}
const ENDFOR_RE = /\{%-?\s*endfor\s*-?%\}/g;

// Variable references inside {{ expr }} - we extract the whole expression
const EXPR_RE = /\{\{-?\s*([\s\S]*?)\s*-?\}\}/g;

// Variable references inside {% stmt %} value positions
const STMT_RE = /\{%-?\s*([\s\S]*?)\s*-?%\}/g;

// Identifier with optional dot-property chain
const IDENT_CHAIN_RE = /\b([A-Za-z_][A-Za-z0-9_]*)(?:\.([A-Za-z_][A-Za-z0-9_.]*))?\b/g;

// ---------------------------------------------------------------------------
// Action return type inference
// ---------------------------------------------------------------------------

interface ReturnTypeInfo {
  type: string;
  shapeKey?: string;
  elementShapeKey?: string;
}

const ACTION_RETURN_TYPES: Record<string, ReturnTypeInfo> = {
  // Objects
  GetUser: { type: 'object', shapeKey: 'User' },
  GetActor: { type: 'object', shapeKey: 'Actor' },
  GetTriggeredAct: { type: 'object', shapeKey: 'Act' },
  GetAct: { type: 'object', shapeKey: 'Act' },
  GetAgentPersona: { type: 'object', shapeKey: 'AgentPersona' },
  GetSessionInfo: { type: 'object', shapeKey: 'SessionInfo' },
  GetConnectorInfo: { type: 'object', shapeKey: 'ConnectorInfo' },
  GetAgent: { type: 'object', shapeKey: 'AgentInfo' },
  GetCustomerInfo: { type: 'object', shapeKey: 'CustomerInfo' },
  GetCustomer: { type: 'object', shapeKey: 'Customer' },
  GetWebhook: { type: 'object', shapeKey: 'Webhook' },
  CreateMessageAct: { type: 'object', shapeKey: 'Act' },
  CreateActor: { type: 'object', shapeKey: 'Actor' },
  // Arrays of objects
  GetActors: { type: 'array', elementShapeKey: 'Actor' },
  SearchFuzzyAkb: { type: 'array', elementShapeKey: 'AkbTopic' },
  // Strings
  SendMessage: { type: 'string' },
  Concat: { type: 'string' },
  Stringify: { type: 'string' },
  GetState: { type: 'any' },
  GetCustomerAttribute: { type: 'any' },
  GetProjectAttribute: { type: 'any' },
  GetPersonaAttribute: { type: 'any' },
  GetCurrentPrompt: { type: 'string' },
  GetMemory: { type: 'string' },
  GetDateTime: { type: 'string' },
  GetDatetime: { type: 'string' },
  GetDateInterval: { type: 'string' },
  GetValueJSON: { type: 'any' },
  AsStringJSON: { type: 'string' },
  GetRandomChoice: { type: 'string' },
  Gen: { type: 'string' },
  GenStream: { type: 'string' },
  FastPrompt: { type: 'string' },
  // Booleans
  IsEmpty: { type: 'boolean' },
  IsSimilar: { type: 'boolean' },
  IsGlobal: { type: 'boolean' },
  // Numbers
  GetIndexesOfItemsArrayJSON: { type: 'array' },
  GetItemsArrayByIndexesJSON: { type: 'array' },
  // JSON
  UpdateValueJSON: { type: 'any' },
  CreateArray: { type: 'array' },
  AppendItemsArrayJSON: { type: 'array' },
};

// Jinja built-in functions/filters that should not be treated as variables
const JINJA_KEYWORDS = new Set([
  'if', 'else', 'elif', 'endif', 'for', 'endfor', 'in', 'not', 'and', 'or',
  'set', 'macro', 'endmacro', 'block', 'endblock', 'extends', 'include',
  'import', 'from', 'as', 'with', 'without', 'context', 'is',
  'defined', 'undefined', 'range', 'dict', 'list', 'raw', 'endraw',
  'call', 'filter', 'endfilter', 'autoescape', 'endautoescape',
  // Guidance template helpers (space-separated args, not parenthesized)
  'gen', 'geneach', 'select', 'each', 'unless',
]);

const JINJA_FILTERS = new Set([
  'abs', 'attr', 'batch', 'capitalize', 'center', 'default', 'd',
  'dictsort', 'escape', 'e', 'filesizeformat', 'first', 'float',
  'forceescape', 'format', 'groupby', 'indent', 'int', 'join',
  'last', 'length', 'list', 'lower', 'map', 'max', 'min', 'pprint',
  'random', 'reject', 'rejectattr', 'replace', 'reverse', 'round',
  'safe', 'select', 'selectattr', 'slice', 'sort', 'string', 'striptags',
  'sum', 'title', 'trim', 'truncate', 'unique', 'upper', 'urlencode',
  'urlize', 'wordcount', 'wordwrap', 'xmlattr', 'tojson', 'strip',
  'loads', 'dumps', 'append', 'startswith', 'endswith', 'split',
]);

const BUILTIN_ACTIONS = new Set(Object.keys(ACTIONS));

// ---------------------------------------------------------------------------
// Core: buildVariableTable
// ---------------------------------------------------------------------------

export function buildVariableTable(
  text: string,
  skillParams?: SkillParameter[],
): VariableTable {
  const definitions = new Map<string, VariableDefinition[]>();
  const references: VariableReference[] = [];
  const allNames = new Set<string>();
  const lines = text.split('\n');

  // Helper: add definition
  function addDef(def: VariableDefinition): void {
    allNames.add(def.name);
    const existing = definitions.get(def.name);
    if (existing) {
      existing.push(def);
    } else {
      definitions.set(def.name, [def]);
    }
  }

  // -----------------------------------------------------------------------
  // 1. Register skill parameters as pre-defined variables
  // -----------------------------------------------------------------------
  if (skillParams) {
    for (const param of skillParams) {
      addDef({
        name: param.name,
        line: 0,
        column: 0,
        source: 'parameter',
        inferredType: 'any',
        scopeEndLine: -1,
      });
    }
  }

  // -----------------------------------------------------------------------
  // 2. Extract {% set x = expr %} definitions
  // -----------------------------------------------------------------------
  let match: RegExpExecArray | null;
  SET_STMT_RE.lastIndex = 0;
  while ((match = SET_STMT_RE.exec(text)) !== null) {
    const varName = match[1];
    const valueExpr = match[2].trim();
    const pos = positionFromOffset(text, match.index, lines);

    // Find column of the variable name within the match
    const nameOffset = match[0].indexOf(varName, 2); // skip '{%'
    const nameCol = pos.column + nameOffset;

    const def: VariableDefinition = {
      name: varName,
      line: pos.line,
      column: nameCol,
      source: 'set',
      valueExpr,
      scopeEndLine: -1,
    };

    // Infer type from value expression
    inferType(def, valueExpr);

    addDef(def);
  }

  // -----------------------------------------------------------------------
  // 2b. Extract {% set varName %}...{% endset %} capture block definitions
  // These capture rendered content as a string variable.
  // -----------------------------------------------------------------------
  SET_CAPTURE_RE.lastIndex = 0;
  while ((match = SET_CAPTURE_RE.exec(text)) !== null) {
    const varName = match[1];
    // Skip if this match overlaps with a regular set assignment (has '=')
    // SET_STMT_RE already handles {% set x = expr %}
    const afterName = text.slice(match.index + match[0].indexOf(varName) + varName.length);
    if (/^\s*=/.test(afterName)) continue;
    const pos = positionFromOffset(text, match.index, lines);
    const nameOffset = match[0].indexOf(varName, 2);
    const nameCol = pos.column + nameOffset;
    addDef({
      name: varName,
      line: pos.line,
      column: nameCol,
      source: 'set',
      valueExpr: '{% set %}...{% endset %}',
      inferredType: 'string',
      scopeEndLine: -1,
    });
  }

  // -----------------------------------------------------------------------
  // 3. Extract Set(name="x", value=expr) definitions
  // -----------------------------------------------------------------------
  SET_ACTION_RE.lastIndex = 0;
  while ((match = SET_ACTION_RE.exec(text)) !== null) {
    const varName = match[1];
    // Point to the variable name inside the string, not to "Set"
    const nameStartInMatch = match[0].lastIndexOf(varName);
    const pos = positionFromOffset(text, match.index + nameStartInMatch, lines);

    // Try to extract the value parameter
    const fullCallMatch = text.slice(match.index).match(/Set\s*\([^)]*\)/);
    let valueExpr: string | undefined;
    if (fullCallMatch) {
      const valueMatch = fullCallMatch[0].match(/value\s*=\s*((?:"[^"]*"|'[^']*'|[^,)]+))/);
      if (valueMatch) {
        valueExpr = valueMatch[1].trim();
      }
    }

    const def: VariableDefinition = {
      name: varName,
      line: pos.line,
      column: pos.column,
      source: 'set-action',
      valueExpr,
      scopeEndLine: -1,
    };

    if (valueExpr) {
      inferType(def, valueExpr);
    }

    addDef(def);
  }

  // -----------------------------------------------------------------------
  // 4. Extract for-loop variables with scope
  // -----------------------------------------------------------------------
  // Build a list of for/endfor positions to pair them
  const forPositions: Array<{ varName: string; iterExpr: string; line: number; column: number; offset: number }> = [];
  const endforPositions: Array<{ line: number; offset: number }> = [];

  FOR_STMT_RE.lastIndex = 0;
  while ((match = FOR_STMT_RE.exec(text)) !== null) {
    const pos = positionFromOffset(text, match.index, lines);
    forPositions.push({
      varName: match[1],
      iterExpr: match[2].trim(),
      line: pos.line,
      column: pos.column,
      offset: match.index,
    });
  }

  ENDFOR_RE.lastIndex = 0;
  while ((match = ENDFOR_RE.exec(text)) !== null) {
    const pos = positionFromOffset(text, match.index, lines);
    endforPositions.push({ line: pos.line, offset: match.index });
  }

  // Pair for/endfor by matching nested depth
  const forStack: typeof forPositions = [];
  const allForEndfor = [
    ...forPositions.map(f => ({ ...f, kind: 'for' as const })),
    ...endforPositions.map(e => ({ ...e, kind: 'endfor' as const })),
  ].sort((a, b) => a.offset - b.offset);

  for (const item of allForEndfor) {
    if (item.kind === 'for') {
      forStack.push(item as typeof forPositions[0]);
    } else if (item.kind === 'endfor' && forStack.length > 0) {
      const forItem = forStack.pop()!;
      const scopeEndLine = item.line;

      // Add loop variable
      addDef({
        name: forItem.varName,
        line: forItem.line,
        column: forItem.column,
        source: 'for-loop',
        valueExpr: forItem.iterExpr,
        scopeEndLine,
        inferredType: inferElementType(forItem.iterExpr),
        elementShapeKey: inferElementShapeKey(forItem.iterExpr),
      });

      // Add `loop` context variable
      addDef({
        name: 'loop',
        line: forItem.line,
        column: forItem.column,
        source: 'for-loop-context',
        inferredType: 'LoopContext',
        shapeKey: 'LoopContext',
        scopeEndLine,
      });
    }
  }

  // -----------------------------------------------------------------------
  // 4b. Scope {% set %} variables inside for-loops (Cat-40 fix)
  // -----------------------------------------------------------------------
  // Rebuild paired for/endfor ranges
  const loopRanges: Array<{ startLine: number; endLine: number }> = [];
  {
    const fStack: Array<{ line: number }> = [];
    const allItems = [
      ...forPositions.map(f => ({ line: f.line, offset: f.offset, kind: 'for' as const })),
      ...endforPositions.map(e => ({ line: e.line, offset: e.offset, kind: 'endfor' as const })),
    ].sort((a, b) => a.offset - b.offset);
    for (const item of allItems) {
      if (item.kind === 'for') {
        fStack.push({ line: item.line });
      } else if (item.kind === 'endfor' && fStack.length > 0) {
        const forItem = fStack.pop()!;
        loopRanges.push({ startLine: forItem.line, endLine: item.line });
      }
    }
  }
  // For each 'set' definition, if it's inside a loop, scope it to the loop's end
  for (const [, defs] of definitions) {
    for (const def of defs) {
      if (def.source !== 'set' || def.scopeEndLine !== -1) continue;
      for (const lr of loopRanges) {
        if (def.line > lr.startLine && def.line < lr.endLine) {
          def.scopeEndLine = lr.endLine;
          break;
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // 4c. Track conditional-only definitions (Cat-41 fix)
  // Detect if/endif blocks without else, and mark set-vars inside as conditional
  // -----------------------------------------------------------------------
  {
    const IF_RE = /\{%-?\s*if\s+/g;
    const ELSE_RE = /\{%-?\s*else\s*-?%\}/g;
    const ENDIF_RE = /\{%-?\s*endif\s*-?%\}/g;
    const ifPositions: Array<{ line: number; offset: number }> = [];
    const elsePositions: Array<{ line: number; offset: number }> = [];
    const endifPositions: Array<{ line: number; offset: number }> = [];

    IF_RE.lastIndex = 0;
    let m;
    while ((m = IF_RE.exec(text)) !== null) {
      ifPositions.push({ line: positionFromOffset(text, m.index, lines).line, offset: m.index });
    }
    ELSE_RE.lastIndex = 0;
    while ((m = ELSE_RE.exec(text)) !== null) {
      elsePositions.push({ line: positionFromOffset(text, m.index, lines).line, offset: m.index });
    }
    ENDIF_RE.lastIndex = 0;
    while ((m = ENDIF_RE.exec(text)) !== null) {
      endifPositions.push({ line: positionFromOffset(text, m.index, lines).line, offset: m.index });
    }

    // Pair if/endif (simplified: non-nested pairing by offset)
    const ifStack: typeof ifPositions = [];
    const allIfEndif = [
      ...ifPositions.map(i => ({ ...i, kind: 'if' as const })),
      ...endifPositions.map(e => ({ ...e, kind: 'endif' as const })),
    ].sort((a, b) => a.offset - b.offset);

    const conditionalRanges: Array<{ startLine: number; endLine: number; hasElse: boolean }> = [];
    for (const item of allIfEndif) {
      if (item.kind === 'if') {
        ifStack.push(item);
      } else if (item.kind === 'endif' && ifStack.length > 0) {
        const ifItem = ifStack.pop()!;
        const hasElse = elsePositions.some(e => e.offset > ifItem.offset && e.offset < item.offset);
        conditionalRanges.push({ startLine: ifItem.line, endLine: item.line, hasElse });
      }
    }

    // For set definitions inside if-without-else, scope them to endif line.
    // Exception: guard patterns like {% if not X %}{% set X = default %}{% endif %}
    // where the condition references the same variable being set - these are
    // intentionally ensuring the variable is available after endif.
    for (const [name, defs] of definitions) {
      for (const def of defs) {
        if (def.source !== 'set' || def.scopeEndLine !== -1) continue;
        for (const cr of conditionalRanges) {
          if (!cr.hasElse && def.line > cr.startLine && def.line < cr.endLine) {
            // Guard pattern detection: if the condition references this same
            // variable, keep file scope so it's available after endif.
            const condLine = lines[cr.startLine] || '';
            const condExprMatch = condLine.match(/\{%-?\s*(?:if|elif)\s+([\s\S]*?)\s*-?%\}/);
            if (condExprMatch) {
              const condExpr = condExprMatch[1];
              const nameRe = new RegExp(`\\b${name}\\b`);
              if (nameRe.test(condExpr)) {
                break; // guard pattern - keep file scope
              }
            }
            def.scopeEndLine = cr.endLine;
            break;
          }
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // 5. Extract variable references from expressions and statements
  // -----------------------------------------------------------------------
  extractReferences(text, lines, references);

  // -----------------------------------------------------------------------
  // 6. Branch analysis: merge literal values from if/else branches
  // -----------------------------------------------------------------------
  mergeBranchLiterals(definitions);

  // Add implicit variables to allNames so they never show as undefined
  for (const name of IMPLICIT_VARIABLES) {
    allNames.add(name);
  }

  return { definitions, references, allNames, _lines: lines };
}

// ---------------------------------------------------------------------------
// Reference extraction
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Branch analysis: merge literal values for variables set in if/else branches
// ---------------------------------------------------------------------------

function mergeBranchLiterals(definitions: Map<string, VariableDefinition[]>): void {
  // For variables with multiple definitions, if they all have literal values,
  // merge them into a union. This handles patterns like:
  //   {% if condition %}{% set x = "a" %}{% else %}{% set x = "b" %}{% endif %}
  // Where x has literal values ["a", "b"]
  for (const [, defs] of definitions) {
    if (defs.length <= 1) continue;

    // Only merge set/set-action definitions (not parameters or loop vars)
    const setDefs = defs.filter(d => d.source === 'set' || d.source === 'set-action');
    if (setDefs.length <= 1) continue;

    // Collect all literal values across definitions
    const allLiterals: string[] = [];
    let allHaveLiterals = true;

    for (const def of setDefs) {
      if (def.literalValues && def.literalValues.length > 0) {
        allLiterals.push(...def.literalValues);
      } else {
        allHaveLiterals = false;
      }
    }

    // If all definitions have literal values, update the last definition
    // to show the union (this is the one hover/completion will use)
    if (allHaveLiterals && allLiterals.length > 1) {
      const uniqueLiterals = [...new Set(allLiterals)];
      const lastDef = setDefs[setDefs.length - 1];
      lastDef.literalValues = uniqueLiterals;
    }
  }
}

// ---------------------------------------------------------------------------
// Reference extraction
// ---------------------------------------------------------------------------

function extractReferences(text: string, lines: string[], references: VariableReference[]): void {
  // Pre-compute Jinja comment ranges {# ... #} so we can skip
  // expression/statement blocks that fall inside comments (Fix 14).
  const commentRanges: Array<{ start: number; end: number }> = [];
  const commentRe = /\{#[\s\S]*?#\}/g;
  let cm;
  while ((cm = commentRe.exec(text)) !== null) {
    commentRanges.push({ start: cm.index, end: cm.index + cm[0].length });
  }
  function isInsideComment(offset: number): boolean {
    for (const cr of commentRanges) {
      if (offset >= cr.start && offset < cr.end) return true;
      if (cr.start > offset) break; // ranges are ordered by offset
    }
    return false;
  }

  // Scan expression blocks {{ ... }}
  EXPR_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = EXPR_RE.exec(text)) !== null) {
    // Fix 14: Skip expressions inside {# ... #} comments
    if (isInsideComment(match.index)) continue;
    const expr = match[1];
    const trimmed = expr.trimStart();

    // Skip Guidance comments: {{!-- ... --}} and {{! ... }}
    if (trimmed.startsWith('!')) {
      continue;
    }

    // Skip Guidance closing tags: {{/tag}}, {{~/tag}}
    if (/^~?\//.test(trimmed)) {
      continue;
    }

    // Handle Guidance block opens: {{#tag expr}} - extract references from expression
    const blockOpenMatch = trimmed.match(/^~?#(\w+)\s*/);
    if (blockOpenMatch) {
      const tagName = blockOpenMatch[1];
      const controlFlowTags = new Set(['if', 'unless', 'each', 'elseif']);
      if (controlFlowTags.has(tagName)) {
        const exprPart = trimmed.slice(blockOpenMatch[0].length).replace(/~$/, '').trimEnd();
        if (exprPart.length > 0) {
          const exprOffset = match.index + match[0].indexOf(trimmed) + blockOpenMatch[0].length;
          extractIdentsFromExpr(exprPart, exprOffset, text, lines, references);
        }
      }
      continue;
    }

    const exprOffset = match.index + match[0].indexOf(expr);
    extractIdentsFromExpr(expr, exprOffset, text, lines, references);
  }

  // Scan statement blocks {% ... %}
  STMT_RE.lastIndex = 0;
  while ((match = STMT_RE.exec(text)) !== null) {
    // Fix 14: Skip statements inside {# ... #} comments
    if (isInsideComment(match.index)) continue;
    const stmt = match[1];
    const stmtOffset = match.index + match[0].indexOf(stmt);

    // For set statements, only look at the value side
    const setMatch = /^set\s+[A-Za-z_][A-Za-z0-9_]*\s*=\s*/i.exec(stmt);
    if (setMatch) {
      const valueExpr = stmt.slice(setMatch[0].length);
      const valueOffset = stmtOffset + setMatch[0].length;
      extractIdentsFromExpr(valueExpr, valueOffset, text, lines, references);
      continue;
    }

    // For for-loops, look at the iterable expression
    const forMatch = /^for\s+[A-Za-z_][A-Za-z0-9_]*\s+in\s+/i.exec(stmt);
    if (forMatch) {
      const iterExpr = stmt.slice(forMatch[0].length);
      const iterOffset = stmtOffset + forMatch[0].length;
      extractIdentsFromExpr(iterExpr, iterOffset, text, lines, references);
      continue;
    }

    // For if/elif, look at the condition expression
    const condMatch = /^(?:if|elif)\s+/i.exec(stmt);
    if (condMatch) {
      const condExpr = stmt.slice(condMatch[0].length);
      const condOffset = stmtOffset + condMatch[0].length;
      extractIdentsFromExpr(condExpr, condOffset, text, lines, references, { inCondition: true });
      continue;
    }
  }
}

function extractIdentsFromExpr(
  expr: string,
  exprOffset: number,
  fullText: string,
  lines: string[],
  references: VariableReference[],
  options?: { inCondition?: boolean },
): void {
  IDENT_CHAIN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = IDENT_CHAIN_RE.exec(expr)) !== null) {
    const name = match[1];
    const propChainStr = match[2]; // e.g. "arguments.name"

    // Skip if it's a keyword, filter, builtin action, or implicit
    if (
      JINJA_KEYWORDS.has(name.toLowerCase()) ||
      JINJA_FILTERS.has(name.toLowerCase()) ||
      BUILTIN_ACTIONS.has(name) ||
      IMPLICIT_VARIABLES.has(name)
    ) {
      continue;
    }

    // Skip if followed by ( - it's a function call (but not a builtin, so could be a skill)
    const afterIdx = match.index + name.length;
    const afterChar = expr.slice(afterIdx).match(/^\s*\(/);
    if (afterChar) {
      continue;
    }

    // Skip if preceded by . (it's a property, not a root reference)
    if (match.index > 0 && expr[match.index - 1] === '.') {
      continue;
    }

    // Skip if inside a string literal
    if (isInsideString(expr, match.index)) {
      continue;
    }

    // Skip if followed by = (it's a keyword argument name, e.g. eventIdn="...")
    // but not if followed by == (comparison)
    const afterMatchIdx = match.index + match[0].length;
    if (afterMatchIdx < expr.length) {
      if (/^\s*=(?!=)/.test(expr.slice(afterMatchIdx))) {
        continue;
      }
    }

    const absoluteOffset = exprOffset + match.index;
    const pos = positionFromOffset(fullText, absoluteOffset, lines);

    const ref: VariableReference = {
      name,
      line: pos.line,
      column: pos.column,
    };

    if (propChainStr) {
      ref.propertyChain = propChainStr.split('.');
    }

    if (options?.inCondition) {
      ref.inCondition = true;
    }

    references.push(ref);
  }
}

function isInsideString(text: string, pos: number): boolean {
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < pos && i < text.length; i++) {
    const char = text[i];
    if ((char === '"' || char === "'") && (i === 0 || text[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
  }
  return inString;
}

// ---------------------------------------------------------------------------
// Type inference helpers
// ---------------------------------------------------------------------------

function inferType(def: VariableDefinition, valueExpr: string): void {
  // Check for action calls: GetUser(), GetActor(), etc.
  const actionCallMatch = valueExpr.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
  if (actionCallMatch) {
    const actionName = actionCallMatch[1];
    const returnInfo = ACTION_RETURN_TYPES[actionName];
    if (returnInfo) {
      def.inferredType = returnInfo.type;
      def.shapeKey = returnInfo.shapeKey;
      def.elementShapeKey = returnInfo.elementShapeKey;
      return;
    }
    // Unknown action - type is 'any'
    def.inferredType = 'any';
    return;
  }

  // String literal
  if (/^["'].*["']$/.test(valueExpr)) {
    def.inferredType = 'string';
    def.literalValues = [valueExpr.slice(1, -1)];
    return;
  }

  // Numeric literal
  if (/^-?\d+(\.\d+)?$/.test(valueExpr)) {
    def.inferredType = 'number';
    def.literalValues = [valueExpr];
    return;
  }

  // Boolean
  if (/^(true|false|True|False)$/i.test(valueExpr)) {
    def.inferredType = 'boolean';
    def.literalValues = [valueExpr.toLowerCase()];
    return;
  }

  // List literal
  if (valueExpr.startsWith('[')) {
    def.inferredType = 'array';
    return;
  }

  // Dict literal
  if (valueExpr.startsWith('{')) {
    def.inferredType = 'object';
    return;
  }

  // None/null
  if (/^(none|None|null)$/.test(valueExpr)) {
    def.inferredType = 'none';
    def.literalValues = ['none'];
    return;
  }

  // Concatenation or filter chain
  if (valueExpr.includes('~') || valueExpr.includes('|')) {
    def.inferredType = 'string';
    return;
  }

  // Default
  def.inferredType = 'any';
}

function inferElementType(iterExpr: string): string {
  const actionMatch = iterExpr.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
  if (actionMatch) {
    const returnInfo = ACTION_RETURN_TYPES[actionMatch[1]];
    if (returnInfo?.elementShapeKey) {
      return 'object';
    }
  }
  return 'any';
}

function inferElementShapeKey(iterExpr: string): string | undefined {
  const actionMatch = iterExpr.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
  if (actionMatch) {
    const returnInfo = ACTION_RETURN_TYPES[actionMatch[1]];
    if (returnInfo?.elementShapeKey) {
      return returnInfo.elementShapeKey;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Position utilities
// ---------------------------------------------------------------------------

function positionFromOffset(
  text: string,
  offset: number,
  lines: string[],
): { line: number; column: number } {
  let charCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (charCount + lines[i].length >= offset) {
      return { line: i, column: offset - charCount };
    }
    charCount += lines[i].length + 1; // +1 for \n
  }
  return { line: lines.length - 1, column: 0 };
}

// ---------------------------------------------------------------------------
// Query helpers (used by LSP handlers)
// ---------------------------------------------------------------------------

/**
 * Get all variables available at a specific line (respecting scope).
 * Sorted by proximity (closer definitions rank higher).
 */
export function getVariablesAtLine(table: VariableTable, line: number): VariableDefinition[] {
  const result: VariableDefinition[] = [];

  for (const [, defs] of table.definitions) {
    for (const def of defs) {
      // Check scope: file-scope (-1) or within for-loop scope
      if (def.scopeEndLine === -1 || (line >= def.line && line <= def.scopeEndLine)) {
        result.push(def);
      }
    }
  }

  // Sort by proximity to the requested line (closest first), then by source priority
  const sourcePriority: Record<VariableSource, number> = {
    'set': 0,
    'set-action': 0,
    'for-loop': 1,
    'for-loop-context': 2,
    'parameter': 3,
  };

  result.sort((a, b) => {
    const distA = Math.abs(line - a.line);
    const distB = Math.abs(line - b.line);
    if (distA !== distB) return distA - distB;
    return (sourcePriority[a.source] || 0) - (sourcePriority[b.source] || 0);
  });

  // Deduplicate by name (keep closest definition)
  const seen = new Set<string>();
  return result.filter(def => {
    if (seen.has(def.name)) return false;
    seen.add(def.name);
    return true;
  });
}

/**
 * Find the definition of a variable at a specific line.
 * Returns the most recent definition before or at the given line that's in scope.
 */
export function findDefinition(table: VariableTable, varName: string, atLine: number): VariableDefinition | undefined {
  const defs = table.definitions.get(varName);
  if (!defs || defs.length === 0) return undefined;

  // Find the most recent definition that's in scope at the given line
  let best: VariableDefinition | undefined;
  for (const def of defs) {
    // Check scope
    const inScope = def.scopeEndLine === -1 || (atLine >= def.line && atLine <= def.scopeEndLine);
    if (!inScope) continue;

    // Prefer the definition closest before or at the given line
    if (def.line <= atLine) {
      if (!best || def.line > best.line) {
        best = def;
      }
    }
  }

  // If no definition found before the line, use the first one (e.g., parameters at line 0)
  if (!best) {
    for (const def of defs) {
      const inScope = def.scopeEndLine === -1 || (atLine >= def.line && atLine <= def.scopeEndLine);
      if (inScope) {
        best = def;
        break;
      }
    }
  }

  return best;
}

/**
 * Get references to a variable that don't have a definition in scope.
 * Handles: completely undefined, use-before-define (Cat-42),
 * scope-escaped variables (Cat-40, Cat-41), and self-references (Cat-43).
 */
export function getUndefinedReferences(table: VariableTable): VariableReference[] {
  const result: VariableReference[] = [];
  for (const ref of table.references) {
    // Completely unknown name
    if (!table.allNames.has(ref.name)) {
      result.push(ref);
      continue;
    }

    // Name exists - check if any definition is in scope AND defined before use
    const defs = table.definitions.get(ref.name);
    if (!defs || defs.length === 0) continue; // implicit variable

    // Guard pattern exception: references tagged inCondition (from {% if %} /
    // {% elif %} expressions) should not require use-before-define when the
    // variable IS defined somewhere in the file. The common pattern
    // {% if not x %}{% set x = default %}{% endif %} intentionally references
    // x before it's defined to check for existence.
    if (ref.inCondition) continue; // skip strict ordering for conditional checks

    const hasValidDef = defs.some(def => {
      // Parameters (line 0) and for-loop-context are always valid
      if (def.source === 'parameter') return true;
      if (def.source === 'for-loop-context') return true;

      // For-loop variables: valid from the for line to endfor
      if (def.source === 'for-loop') {
        return ref.line >= def.line && (def.scopeEndLine === -1 || ref.line <= def.scopeEndLine);
      }

      // Set variables: must be defined BEFORE the reference line and in scope
      const inScope = def.scopeEndLine === -1 || (ref.line >= def.line && ref.line <= def.scopeEndLine);
      if (!inScope) return false;

      // Cat-42: use-before-define - definition must be on a strictly earlier line.
      // Cat-43: same-line references (e.g. {% set x = x + 1 %}) are NOT valid
      // because the variable isn't defined until the statement completes.
      if (def.source === 'set') {
        return def.line < ref.line;
      }
      // set-action (Set(name=..., value=...)) - same logic
      if (def.source === 'set-action') {
        return def.line < ref.line;
      }
      return def.line <= ref.line;
    });

    if (!hasValidDef) {
      result.push(ref);
    }
  }
  return result;
}

/**
 * Get variables that are defined but never referenced.
 * Used for "unused variable" diagnostics.
 */
export function getUnusedDefinitions(table: VariableTable): VariableDefinition[] {
  const referencedNames = new Set(table.references.map(r => r.name));
  const unused: VariableDefinition[] = [];

  for (const [name, defs] of table.definitions) {
    // Skip parameters and implicit variables - they may be used externally
    if (defs.some(d => d.source === 'parameter' || d.source === 'for-loop-context')) continue;
    if (IMPLICIT_VARIABLES.has(name)) continue;

    if (!referencedNames.has(name)) {
      // Report the first definition as unused
      unused.push(defs[0]);
    }
  }

  return unused;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { ACTION_RETURN_TYPES, IMPLICIT_VARIABLES };
