/**
 * Semantic Token Highlighting for Newo DSL Language Server
 *
 * Classifies tokens in Jinja/Guidance templates so editors can color them
 * by type (function, variable, property, keyword, etc.) using the standard
 * LSP Semantic Tokens protocol. No hardcoded colors - the editor theme picks
 * the palette.
 */

import {
  SemanticTokensBuilder,
  SemanticTokens,
} from 'vscode-languageserver/node';

import type { VariableTable } from './variable-tracker';

// ---------------------------------------------------------------------------
// Legend: token types and modifiers registered with the client
// ---------------------------------------------------------------------------

/** Token type indices - order matters (used as index into the legend). */
export const TOKEN_TYPES = [
  'function',   // 0 - action/skill calls, filters
  'variable',   // 1 - variable definitions and references
  'property',   // 2 - dot-access properties
  'parameter',  // 3 - keyword argument names
  'keyword',    // 4 - Jinja/Guidance control keywords
  'comment',    // 5 - {# #} and {{!-- --}} comments
  'string',     // 6 - string literals
  'number',     // 7 - numeric literals
  'operator',   // 8 - operators (==, ~, +, etc.)
] as const;

/** Token modifier bit flags - order matters (used as bit position). */
export const TOKEN_MODIFIERS = [
  'declaration',     // 0 - variable definition site
  'defaultLibrary',  // 1 - built-in action (GetUser, SendCommand, etc.)
] as const;

// Precomputed lookup maps for fast index access
const TOKEN_TYPE_INDEX = new Map<string, number>(
  TOKEN_TYPES.map((t, i) => [t, i])
);
const TOKEN_MODIFIER_INDEX = new Map<string, number>(
  TOKEN_MODIFIERS.map((m, i) => [m, i])
);

// ---------------------------------------------------------------------------
// Token collector
// ---------------------------------------------------------------------------

interface RawToken {
  line: number;
  col: number;
  length: number;
  typeIndex: number;
  modifierBits: number;
}

// ---------------------------------------------------------------------------
// Context passed from server.ts
// ---------------------------------------------------------------------------

export interface SemanticTokenContext {
  /** Set of built-in action names (from ACTIONS) */
  actionNames: Set<string>;
  /** Set of skill names (from skillIndex) */
  skillNames: Set<string>;
  /** Set of Jinja built-in names */
  jinjaBuiltinNames: Set<string>;
}

// ---------------------------------------------------------------------------
// Position utilities
// ---------------------------------------------------------------------------

/** Build array of byte offsets where each line starts. */
function buildLineStarts(text: string): number[] {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') {
      starts.push(i + 1);
    }
  }
  return starts;
}

/** Binary search to convert a byte offset to (line, col). */
function offsetToLineCol(
  offset: number,
  lineStarts: number[],
): { line: number; col: number } {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineStarts[mid] <= offset) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return { line: lo, col: offset - lineStarts[lo] };
}

// ---------------------------------------------------------------------------
// Mini-tokenizer for expression/statement interiors
// ---------------------------------------------------------------------------

const JINJA_KEYWORDS_SET = new Set([
  'if', 'else', 'elif', 'endif', 'for', 'endfor', 'in', 'not', 'and', 'or',
  'set', 'macro', 'endmacro', 'block', 'endblock', 'extends', 'include',
  'import', 'from', 'as', 'with', 'without', 'context', 'is',
  'defined', 'undefined', 'raw', 'endraw', 'do',
  'call', 'filter', 'endfilter', 'autoescape', 'endautoescape',
  'true', 'false', 'none', 'True', 'False', 'None',
  // Guidance template helpers
  'gen', 'geneach', 'select', 'each', 'unless',
]);

const OPERATOR_RE = /^(?:==|!=|<=|>=|<|>|\+|-|\*{1,2}|\/\/?|%|~|\|(?!=)|=(?!=))/;
const STRING_RE = /^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/;
const NUMBER_RE = /^-?\d+(?:\.\d+)?/;
const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*/;

/**
 * Tokenize the interior of a template block and push raw tokens.
 * `baseOffset` is the byte offset of `interior` within the full document.
 */
function tokenizeInterior(
  interior: string,
  baseOffset: number,
  lineStarts: number[],
  tokens: RawToken[],
  ctx: SemanticTokenContext,
  variableNames: Set<string>,
): void {
  let pos = 0;

  while (pos < interior.length) {
    // Skip whitespace
    const wsMatch = interior.slice(pos).match(/^\s+/);
    if (wsMatch) {
      pos += wsMatch[0].length;
      continue;
    }

    const remaining = interior.slice(pos);
    const absOffset = baseOffset + pos;

    // --- String literal ---
    const strMatch = remaining.match(STRING_RE);
    if (strMatch) {
      const { line, col } = offsetToLineCol(absOffset, lineStarts);
      tokens.push({
        line, col,
        length: strMatch[0].length,
        typeIndex: TOKEN_TYPE_INDEX.get('string')!,
        modifierBits: 0,
      });
      pos += strMatch[0].length;
      continue;
    }

    // --- Number literal ---
    const numMatch = remaining.match(NUMBER_RE);
    if (numMatch && (pos === 0 || !/[A-Za-z_.]/.test(interior[pos - 1]))) {
      const { line, col } = offsetToLineCol(absOffset, lineStarts);
      tokens.push({
        line, col,
        length: numMatch[0].length,
        typeIndex: TOKEN_TYPE_INDEX.get('number')!,
        modifierBits: 0,
      });
      pos += numMatch[0].length;
      continue;
    }

    // --- Operator ---
    const opMatch = remaining.match(OPERATOR_RE);
    if (opMatch) {
      const { line, col } = offsetToLineCol(absOffset, lineStarts);
      tokens.push({
        line, col,
        length: opMatch[0].length,
        typeIndex: TOKEN_TYPE_INDEX.get('operator')!,
        modifierBits: 0,
      });
      pos += opMatch[0].length;
      continue;
    }

    // --- Identifier ---
    const identMatch = remaining.match(IDENT_RE);
    if (identMatch) {
      const name = identMatch[0];
      const { line, col } = offsetToLineCol(absOffset, lineStarts);

      // Look ahead for context
      const afterIdent = interior.slice(pos + name.length);
      const followedByParen = /^\s*\(/.test(afterIdent);
      const precededByDot = pos > 0 && interior[pos - 1] === '.';
      const precededByPipe = isPrecededByPipe(interior, pos);
      const followedByEquals = /^\s*=(?!=)/.test(afterIdent);

      if (precededByDot) {
        // Property access: user.name -> "name" is a property
        tokens.push({
          line, col,
          length: name.length,
          typeIndex: TOKEN_TYPE_INDEX.get('property')!,
          modifierBits: 0,
        });
      } else if (followedByEquals && !followedByParen) {
        // Keyword argument: eventIdn="..." -> "eventIdn" is a parameter
        tokens.push({
          line, col,
          length: name.length,
          typeIndex: TOKEN_TYPE_INDEX.get('parameter')!,
          modifierBits: 0,
        });
      } else if (JINJA_KEYWORDS_SET.has(name) || JINJA_KEYWORDS_SET.has(name.toLowerCase())) {
        // Jinja/Guidance keyword
        tokens.push({
          line, col,
          length: name.length,
          typeIndex: TOKEN_TYPE_INDEX.get('keyword')!,
          modifierBits: 0,
        });
      } else if (followedByParen || precededByPipe) {
        // Function call or filter
        let modBits = 0;
        if (ctx.actionNames.has(name)) {
          modBits = 1 << TOKEN_MODIFIER_INDEX.get('defaultLibrary')!;
        }
        tokens.push({
          line, col,
          length: name.length,
          typeIndex: TOKEN_TYPE_INDEX.get('function')!,
          modifierBits: modBits,
        });
      } else if (ctx.actionNames.has(name) || ctx.skillNames.has(name)) {
        // Known action/skill name used without parens (rare but possible)
        let modBits = 0;
        if (ctx.actionNames.has(name)) {
          modBits = 1 << TOKEN_MODIFIER_INDEX.get('defaultLibrary')!;
        }
        tokens.push({
          line, col,
          length: name.length,
          typeIndex: TOKEN_TYPE_INDEX.get('function')!,
          modifierBits: modBits,
        });
      } else if (ctx.jinjaBuiltinNames.has(name)) {
        // Jinja built-in function/filter (used without pipe)
        tokens.push({
          line, col,
          length: name.length,
          typeIndex: TOKEN_TYPE_INDEX.get('function')!,
          modifierBits: 0,
        });
      } else {
        // Variable reference (fallback)
        tokens.push({
          line, col,
          length: name.length,
          typeIndex: TOKEN_TYPE_INDEX.get('variable')!,
          modifierBits: 0,
        });
      }

      pos += name.length;
      continue;
    }

    // Skip any other character (parentheses, brackets, commas, etc.)
    pos++;
  }
}

/** Check if the identifier at `pos` is preceded by a pipe operator. */
function isPrecededByPipe(text: string, pos: number): boolean {
  let i = pos - 1;
  while (i >= 0 && (text[i] === ' ' || text[i] === '\t')) i--;
  return i >= 0 && text[i] === '|';
}

// ---------------------------------------------------------------------------
// Variable tokens from VariableTable
// ---------------------------------------------------------------------------

/**
 * Collect tokens for variable definitions (with declaration modifier).
 * These come from the precomputed VariableTable - zero extra parsing.
 */
function collectVariableDefinitionTokens(
  varTable: VariableTable | undefined,
  tokens: RawToken[],
): void {
  if (!varTable) return;

  const declBit = 1 << TOKEN_MODIFIER_INDEX.get('declaration')!;
  const varTypeIdx = TOKEN_TYPE_INDEX.get('variable')!;

  for (const [, defs] of varTable.definitions) {
    for (const def of defs) {
      // Skip synthetic definitions (parameters at line 0, col 0)
      if (def.source === 'parameter') continue;
      // Skip loop context (synthetic 'loop' variable)
      if (def.source === 'for-loop-context') continue;
      // Skip Set() action definitions - the name is inside a string literal;
      // tokenizeInterior already handles Set() calls with proper string tokens
      if (def.source === 'set-action') continue;

      tokens.push({
        line: def.line,
        col: def.column,
        length: def.name.length,
        typeIndex: varTypeIdx,
        modifierBits: declBit,
      });
    }
  }
}

/**
 * Collect tokens for variable references and their property chains.
 */
function collectVariableReferenceTokens(
  varTable: VariableTable | undefined,
  tokens: RawToken[],
): void {
  if (!varTable) return;

  const varTypeIdx = TOKEN_TYPE_INDEX.get('variable')!;
  const propTypeIdx = TOKEN_TYPE_INDEX.get('property')!;

  for (const ref of varTable.references) {
    tokens.push({
      line: ref.line,
      col: ref.column,
      length: ref.name.length,
      typeIndex: varTypeIdx,
      modifierBits: 0,
    });

    // Add property chain tokens
    if (ref.propertyChain) {
      // Calculate starting column after "varName."
      let propOffset = ref.column + ref.name.length + 1; // +1 for the dot
      for (const prop of ref.propertyChain) {
        tokens.push({
          line: ref.line,
          col: propOffset,
          length: prop.length,
          typeIndex: propTypeIdx,
          modifierBits: 0,
        });
        propOffset += prop.length + 1; // +1 for the next dot
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Comment token extraction
// ---------------------------------------------------------------------------

/** Extract tokens for Jinja comments {# ... #} */
function collectJinjaCommentTokens(
  text: string,
  lineStarts: number[],
  tokens: RawToken[],
): void {
  const commentRe = /\{#[\s\S]*?#\}/g;
  let match: RegExpExecArray | null;
  while ((match = commentRe.exec(text)) !== null) {
    const { line, col } = offsetToLineCol(match.index, lineStarts);
    // Comments can span multiple lines
    const commentText = match[0];
    const commentLines = commentText.split('\n');
    if (commentLines.length === 1) {
      tokens.push({
        line, col,
        length: commentText.length,
        typeIndex: TOKEN_TYPE_INDEX.get('comment')!,
        modifierBits: 0,
      });
    } else {
      // Multi-line comment: emit one token per line
      for (let i = 0; i < commentLines.length; i++) {
        const lineLen = commentLines[i].length;
        if (lineLen === 0) continue;
        tokens.push({
          line: line + i,
          col: i === 0 ? col : 0,
          length: lineLen,
          typeIndex: TOKEN_TYPE_INDEX.get('comment')!,
          modifierBits: 0,
        });
      }
    }
  }
}

/** Extract tokens for Guidance comments {{!-- ... --}} */
function collectGuidanceCommentTokens(
  text: string,
  lineStarts: number[],
  tokens: RawToken[],
): void {
  const commentRe = /\{\{!--[\s\S]*?--\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = commentRe.exec(text)) !== null) {
    const { line, col } = offsetToLineCol(match.index, lineStarts);
    const commentText = match[0];
    const commentLines = commentText.split('\n');
    if (commentLines.length === 1) {
      tokens.push({
        line, col,
        length: commentText.length,
        typeIndex: TOKEN_TYPE_INDEX.get('comment')!,
        modifierBits: 0,
      });
    } else {
      for (let i = 0; i < commentLines.length; i++) {
        const lineLen = commentLines[i].length;
        if (lineLen === 0) continue;
        tokens.push({
          line: line + i,
          col: i === 0 ? col : 0,
          length: lineLen,
          typeIndex: TOKEN_TYPE_INDEX.get('comment')!,
          modifierBits: 0,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Template block scanning
// ---------------------------------------------------------------------------

/** Regions covered by comments (to avoid double-tokenizing). */
interface CommentRegion {
  start: number;
  end: number;
}

function buildCommentRegions(text: string): CommentRegion[] {
  const regions: CommentRegion[] = [];
  // Jinja comments
  const jinjaRe = /\{#[\s\S]*?#\}/g;
  let m: RegExpExecArray | null;
  while ((m = jinjaRe.exec(text)) !== null) {
    regions.push({ start: m.index, end: m.index + m[0].length });
  }
  // Guidance comments
  const guidanceRe = /\{\{!--[\s\S]*?--\}\}/g;
  while ((m = guidanceRe.exec(text)) !== null) {
    regions.push({ start: m.index, end: m.index + m[0].length });
  }
  return regions;
}

function isInCommentRegion(offset: number, regions: CommentRegion[]): boolean {
  for (const r of regions) {
    if (offset >= r.start && offset < r.end) return true;
  }
  return false;
}

/**
 * Scan template expression blocks {{ ... }} and statement blocks {% ... %}
 * and tokenize their interiors for non-variable tokens.
 */
function collectBlockTokens(
  text: string,
  lineStarts: number[],
  tokens: RawToken[],
  ctx: SemanticTokenContext,
  variableNames: Set<string>,
  commentRegions: CommentRegion[],
): void {
  // Expression blocks: {{ ... }}
  const exprRe = /\{\{-?\s*([\s\S]*?)\s*-?\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = exprRe.exec(text)) !== null) {
    if (isInCommentRegion(match.index, commentRegions)) continue;

    const interior = match[1];
    const trimmed = interior.trimStart();

    // Skip Guidance comments: {{!-- ... --}}
    if (trimmed.startsWith('!--')) continue;

    // Skip closing tags: {{/tag}}, {{~/tag}}
    if (/^~?\//.test(trimmed)) continue;

    // Handle Guidance block opens: {{#tag expr}}
    const blockOpenMatch = trimmed.match(/^~?#(\w+)\s*/);
    if (blockOpenMatch) {
      const tagName = blockOpenMatch[1];
      // For control flow blocks, tokenize the expression after the tag name
      const controlFlowTags = new Set(['if', 'unless', 'each', 'elseif']);
      if (controlFlowTags.has(tagName)) {
        const exprPart = trimmed.slice(blockOpenMatch[0].length);
        if (exprPart.length > 0) {
          // Strip trailing ~ (Guidance whitespace trim)
          const cleanExpr = exprPart.replace(/~$/, '').trimEnd();
          const exprStartOffset = match.index + match[0].indexOf(trimmed) + blockOpenMatch[0].length;
          tokenizeInterior(cleanExpr, exprStartOffset, lineStarts, tokens, ctx, variableNames);
        }
      }
      // Role/structural blocks (system, user, assistant, block) - skip
      continue;
    }

    // Strip leading/trailing ~ (Guidance whitespace trim) for regular expressions
    const cleanInterior = trimmed.replace(/~$/, '').trimEnd();
    const interiorOffset = match.index + match[0].indexOf(trimmed);
    tokenizeInterior(cleanInterior, interiorOffset, lineStarts, tokens, ctx, variableNames);
  }

  // Statement blocks: {% ... %}
  const stmtRe = /\{%-?\s*([\s\S]*?)\s*-?%\}/g;
  while ((match = stmtRe.exec(text)) !== null) {
    if (isInCommentRegion(match.index, commentRegions)) continue;

    const interior = match[1];
    const interiorOffset = match.index + match[0].indexOf(interior);
    tokenizeInterior(interior, interiorOffset, lineStarts, tokens, ctx, variableNames);
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Compute semantic tokens for a Newo DSL template document.
 *
 * Algorithm:
 * 1. Collect variable tokens from cached VariableTable (zero parsing cost)
 * 2. Collect comment tokens (Jinja {# #} and Guidance {{!-- --}})
 * 3. Scan template blocks and mini-tokenize interiors
 * 4. Deduplicate at same (line, col) keeping the most specific token
 * 5. Sort by (line, col) - required by SemanticTokensBuilder
 * 6. Build via SemanticTokensBuilder.push() and return
 */
export function computeSemanticTokens(
  text: string,
  varTable: VariableTable | undefined,
  ctx: SemanticTokenContext,
): SemanticTokens {
  if (!text || text.length === 0) {
    return { data: [] };
  }

  const lineStarts = buildLineStarts(text);
  const tokens: RawToken[] = [];

  // Collect all variable names for context
  const variableNames = varTable ? varTable.allNames : new Set<string>();

  // 1. Variable definition tokens (from cached table)
  collectVariableDefinitionTokens(varTable, tokens);

  // 2. Variable reference tokens (from cached table)
  collectVariableReferenceTokens(varTable, tokens);

  // 3. Comment tokens
  collectJinjaCommentTokens(text, lineStarts, tokens);
  collectGuidanceCommentTokens(text, lineStarts, tokens);

  // 4. Block interior tokens (functions, keywords, strings, numbers, operators, etc.)
  const commentRegions = buildCommentRegions(text);
  collectBlockTokens(text, lineStarts, tokens, ctx, variableNames, commentRegions);

  // 5. Deduplicate: at same (line, col), keep the token with highest specificity
  //    Specificity order: variable+declaration > property > parameter > function > variable > keyword > rest
  const specificity: Record<number, number> = {};
  specificity[TOKEN_TYPE_INDEX.get('comment')!] = 10;
  specificity[TOKEN_TYPE_INDEX.get('property')!] = 8;
  specificity[TOKEN_TYPE_INDEX.get('parameter')!] = 7;
  specificity[TOKEN_TYPE_INDEX.get('function')!] = 6;
  specificity[TOKEN_TYPE_INDEX.get('variable')!] = 5;
  specificity[TOKEN_TYPE_INDEX.get('keyword')!] = 4;
  specificity[TOKEN_TYPE_INDEX.get('string')!] = 3;
  specificity[TOKEN_TYPE_INDEX.get('number')!] = 2;
  specificity[TOKEN_TYPE_INDEX.get('operator')!] = 1;

  const deduped = new Map<string, RawToken>();
  for (const t of tokens) {
    const key = `${t.line}:${t.col}`;
    const existing = deduped.get(key);
    if (!existing) {
      deduped.set(key, t);
    } else {
      // Prefer declaration modifier
      const existingSpec = (specificity[existing.typeIndex] || 0)
        + (existing.modifierBits > 0 ? 20 : 0);
      const newSpec = (specificity[t.typeIndex] || 0)
        + (t.modifierBits > 0 ? 20 : 0);
      if (newSpec > existingSpec) {
        deduped.set(key, t);
      }
    }
  }

  // 6. Sort by (line, col)
  const sorted = Array.from(deduped.values()).sort((a, b) => {
    if (a.line !== b.line) return a.line - b.line;
    return a.col - b.col;
  });

  // 7. Build using SemanticTokensBuilder
  const builder = new SemanticTokensBuilder();
  for (const t of sorted) {
    builder.push(t.line, t.col, t.length, t.typeIndex, t.modifierBits);
  }

  return builder.build();
}
