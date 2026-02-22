/**
 * Pure validation logic for Newo DSL templates.
 *
 * Extracted from server.ts so that the real production validation
 * can be tested directly without an LSP transport.
 *
 * Every diagnostic produced by the LSP server passes through
 * validateTemplateText() - there is no separate code path.
 */

import {
  Diagnostic as LspDiagnostic,
  DiagnosticSeverity,
} from 'vscode-languageserver/node';

import {
  ACTIONS,
  JINJA_BUILTINS,
  VALIDATION_RULES,
  findSimilar,
} from '@newo-dsl/data';

import {
  buildVariableTable,
  getUndefinedReferences,
  getUnusedDefinitions,
  ACTION_RETURN_TYPES,
  IMPLICIT_VARIABLES,
  type VariableTable,
} from './variable-tracker';

import type { SkillInfo, SkillParameter } from './format-utils';

// Set of all Jinja built-in names for quick lookup
const JINJA_BUILTIN_NAMES = new Set(Object.keys(JINJA_BUILTINS));

// Platform-injected functions available in the Newo Jinja environment.
// These are runtime-provided and have no corresponding skill files.
const PLATFORM_FUNCTIONS = new Set([
  'get_memory',
  'get_prompt_memory',
  'structured_generation',
  'uuid4',
]);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ValidateOptions {
  uri: string;
  skillIndex: Map<string, SkillInfo>;
  skillIndexBuilt: boolean;
  skillParams?: SkillParameter[];
}

export interface ValidateResult {
  diagnostics: LspDiagnostic[];
  varTable: VariableTable;
}

/**
 * Pure validation function - returns diagnostics without sending them.
 * This is the exact same logic that runs in the LSP server.
 */
export function validateTemplateText(
  text: string,
  options: ValidateOptions,
): ValidateResult {
  const { uri, skillIndex, skillIndexBuilt, skillParams } = options;
  const diagnostics: LspDiagnostic[] = [];
  const lines = text.split('\n');

  // Detect guidance files and whether skill params are available (Fix 5)
  const isGuidanceFile = /\.(nslg|guidance)$/i.test(uri);
  const hasSkillParams = skillParams !== undefined && skillParams.length > 0;

  // Build variable table for this document
  const varTable = buildVariableTable(text, skillParams);

  // -------------------------------------------------------------------------
  // Brace balance checks (Fix 8: context-aware - skips strings, comments,
  // and statement blocks to avoid FPs from dict literals and JSON strings)
  // -------------------------------------------------------------------------
  const exprBraces = countExpressionBracePairs(text);

  if (exprBraces.open !== exprBraces.close) {
    const bracePos = findLastUnmatchedBrace(text, '{{', '}}', exprBraces.open > exprBraces.close);
    const braceLine = bracePos >= 0 ? text.substring(0, bracePos).split('\n').length - 1 : 0;
    const braceLineStart = bracePos >= 0 ? text.lastIndexOf('\n', bracePos) + 1 : 0;
    const braceCol = bracePos >= 0 ? bracePos - braceLineStart : 0;
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: { start: { line: braceLine, character: braceCol }, end: { line: braceLine, character: braceCol + 2 } },
      message: `Unbalanced expression braces: ${exprBraces.open} {{ vs ${exprBraces.close} }}`,
      source: 'newo-dsl',
    });
  }

  const stmtBraces = countStatementBracePairs(text);
  const openStmt = stmtBraces.open;
  const closeStmt = stmtBraces.close;

  if (openStmt !== closeStmt) {
    const bracePos = findLastUnmatchedBrace(text, '{%', '%}', openStmt > closeStmt);
    const braceLine = bracePos >= 0 ? text.substring(0, bracePos).split('\n').length - 1 : 0;
    const braceLineStart = bracePos >= 0 ? text.lastIndexOf('\n', bracePos) + 1 : 0;
    const braceCol = bracePos >= 0 ? bracePos - braceLineStart : 0;
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: { start: { line: braceLine, character: braceCol }, end: { line: braceLine, character: braceCol + 2 } },
      message: `Unbalanced statement braces: ${openStmt} {% vs ${closeStmt} %}`,
      source: 'newo-dsl',
    });
  }

  // -------------------------------------------------------------------------
  // Structural checks: triple braces, reversed braces, empty expressions,
  // action-without-parens
  // -------------------------------------------------------------------------

  // Cat-31: Triple (or more) braces - {{{ or }}}
  const tripleBraceOpen = /\{\{\{/g;
  const tripleBraceClose = /\}\}\}/g;
  let tbMatch;
  while ((tbMatch = tripleBraceOpen.exec(text)) !== null) {
    const pos = positionFromOffset(text, tbMatch.index);
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: { start: { line: pos.line, character: pos.col }, end: { line: pos.line, character: pos.col + 3 } },
      message: 'Stray brace: found {{{ (triple opening braces). Use {{ for expressions.',
      source: 'newo-dsl',
    });
  }
  while ((tbMatch = tripleBraceClose.exec(text)) !== null) {
    const pos = positionFromOffset(text, tbMatch.index);
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: { start: { line: pos.line, character: pos.col }, end: { line: pos.line, character: pos.col + 3 } },
      message: 'Stray brace: found }}} (triple closing braces). Use }} for expressions.',
      source: 'newo-dsl',
    });
  }

  // Cat-32: Reversed braces - }} appears before any {{ (Fix 11: string-aware)
  {
    const firstOpen = firstOutsideStringsAndBlocks(text, '{{');
    const firstClose = firstOutsideStringsAndBlocks(text, '}}');
    if (firstClose !== -1 && (firstOpen === -1 || firstClose < firstOpen)) {
      const pos = positionFromOffset(text, firstClose);
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: { start: { line: pos.line, character: pos.col }, end: { line: pos.line, character: pos.col + 2 } },
        message: 'Reversed braces: }} appears before any matching {{.',
        source: 'newo-dsl',
      });
    }
  }

  // Cat-35: Empty expressions {{ }} or {{}}
  {
    const emptyExprRe = /\{\{-?\s*-?\}\}/g;
    let emptyMatch;
    while ((emptyMatch = emptyExprRe.exec(text)) !== null) {
      const pos = positionFromOffset(text, emptyMatch.index);
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: { start: { line: pos.line, character: pos.col }, end: { line: pos.line, character: pos.col + emptyMatch[0].length } },
        message: 'Empty expression braces {{ }}. Did you forget the content?',
        source: 'newo-dsl',
      });
    }
  }

  // Cat-33/58: Action name without parentheses - {{ActionName}} or {{ActionName | filter}}
  {
    // Match bare action at start of expression (with optional filter/text after, before }})
    const bareActionRe2 = /\{\{-?\s*([A-Z][A-Za-z0-9_]*)\s*(?:\|[^}]*)?\s*-?\}\}/g;
    let bareMatch;
    while ((bareMatch = bareActionRe2.exec(text)) !== null) {
      const name = bareMatch[1];
      if (ACTIONS.hasOwnProperty(name)) {
        // Make sure it's not followed by ( (which is handled by the expression pass)
        const afterName = bareMatch[0].substring(bareMatch[0].indexOf(name) + name.length).trimStart();
        if (afterName.startsWith('(')) continue;
        const nameOffset = bareMatch.index + bareMatch[0].indexOf(name);
        const pos = positionFromOffset(text, nameOffset);
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: { start: { line: pos.line, character: pos.col }, end: { line: pos.line, character: pos.col + name.length } },
          message: `Action '${name}' used without parentheses. Did you mean '${name}(...)'?`,
          source: 'newo-dsl',
        });
      }
    }
  }

  // Cat-54: JavaScript template literal ${variable} in raw text
  {
    const jsLiteralRe = /\$\{([A-Za-z_][A-Za-z0-9_.]*)\}/g;
    let jlMatch;
    while ((jlMatch = jsLiteralRe.exec(text)) !== null) {
      // Make sure it's not inside a Jinja block or string
      const before = text.substring(0, jlMatch.index);
      const lastOpen = Math.max(before.lastIndexOf('{{'), before.lastIndexOf('{%'));
      const lastClose = Math.max(before.lastIndexOf('}}'), before.lastIndexOf('%}'));
      if (lastOpen > lastClose) continue; // inside a Jinja block, skip
      const pos = positionFromOffset(text, jlMatch.index);
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: { start: { line: pos.line, character: pos.col }, end: { line: pos.line, character: pos.col + jlMatch[0].length } },
        message: `JavaScript template literal '\${${jlMatch[1]}}' found. Use Jinja syntax '{{ ${jlMatch[1]} }}' instead.`,
        source: 'newo-dsl',
      });
    }
  }

  // Cat-56: Action name used as Jinja filter: {{ value | ActionName }}
  {
    const actionFilterRe = /\{\{-?\s*[\s\S]*?\|\s*([A-Z][A-Za-z0-9_]*)\s*(?:-?\}\})/g;
    let afMatch;
    while ((afMatch = actionFilterRe.exec(text)) !== null) {
      const name = afMatch[1];
      if (ACTIONS.hasOwnProperty(name)) {
        const nameOffset = afMatch.index + afMatch[0].lastIndexOf(name);
        const pos = positionFromOffset(text, nameOffset);
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: { start: { line: pos.line, character: pos.col }, end: { line: pos.line, character: pos.col + name.length } },
          message: `Action '${name}' used as a Jinja filter. Actions must be called with parentheses: '${name}(...)'.`,
          source: 'newo-dsl',
        });
      }
    }
  }

  // Cat-57: Trailing pipe with no filter name: {{ var | }}
  {
    const trailingPipeRe = /\{\{-?\s*[\s\S]*?\|\s*-?\}\}/g;
    let tpMatch;
    while ((tpMatch = trailingPipeRe.exec(text)) !== null) {
      // Make sure there's really nothing after the pipe (not just matching a valid filter)
      const content = tpMatch[0].replace(/^\{\{-?\s*/, '').replace(/-?\}\}$/, '').trim();
      if (content.endsWith('|') || /\|\s*$/.test(content)) {
        const pos = positionFromOffset(text, tpMatch.index);
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: { start: { line: pos.line, character: pos.col }, end: { line: pos.line, character: pos.col + tpMatch[0].length } },
          message: `Trailing pipe '|' with no filter name. Add a filter after '|' or remove it.`,
          source: 'newo-dsl',
        });
      }
    }
  }

  // Cat-65: Empty statement blocks {% %}
  {
    const emptyStmtRe = /\{%-?\s*-?%\}/g;
    let esMatch;
    while ((esMatch = emptyStmtRe.exec(text)) !== null) {
      const pos = positionFromOffset(text, esMatch.index);
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: { start: { line: pos.line, character: pos.col }, end: { line: pos.line, character: pos.col + esMatch[0].length } },
        message: `Empty statement block {% %}. Did you forget the content?`,
        source: 'newo-dsl',
      });
    }
  }

  // -------------------------------------------------------------------------
  // First pass: expression-style calls  {{ Action( }}
  // -------------------------------------------------------------------------
  let match;
  const expressionPattern = /\{\{([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  while ((match = expressionPattern.exec(text)) !== null) {
    const actionName = match[1];
    const matchPos = match.index;

    // Find line number
    let charCount = 0;
    let lineNum = 0;
    let colNum = 0;
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= matchPos) {
        lineNum = i;
        colNum = matchPos - charCount + 2;
        break;
      }
      charCount += lines[i].length + 1;
    }

    // Check if this is a known built-in action, Jinja built-in, or platform function
    const isKnownAction = ACTIONS.hasOwnProperty(actionName);
    const isJinjaBuiltin = JINJA_BUILTIN_NAMES.has(actionName);
    const isPlatformFunc = PLATFORM_FUNCTIONS.has(actionName);

    // Skip platform-injected functions entirely (no param validation available)
    if (isPlatformFunc) continue;

    // Extract the full call to analyze parameters (string-aware - Cat-34)
    const { callText, hasUnclosedString } = extractCallText(text, matchPos);

    if (hasUnclosedString) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: { line: lineNum, character: colNum },
          end: { line: lineNum, character: colNum + actionName.length },
        },
        message: `${actionName}: unclosed string literal in arguments.`,
        source: 'newo-dsl',
      });
    }

    // Extract passed parameter names (depth-aware to skip nested calls)
    const passedParams = extractTopLevelParams(callText);

    // Cat-63: Tab or non-standard whitespace in argument region
    {
      const argStart = callText.indexOf('(');
      if (argStart !== -1) {
        const argRegion = callText.substring(argStart + 1);
        if (/\t/.test(argRegion)) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
              start: { line: lineNum, character: colNum },
              end: { line: lineNum, character: colNum + actionName.length },
            },
            message: `${actionName}: tab character found in arguments. This may break parameter parsing. Use spaces instead.`,
            source: 'newo-dsl',
          });
        }
      }
    }

    // Cat-36: Duplicate parameter detection
    const seen = new Set<string>();
    for (const p of passedParams) {
      if (seen.has(p)) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: lineNum, character: colNum },
            end: { line: lineNum, character: colNum + actionName.length },
          },
          message: `${actionName}: duplicate parameter '${p}'. Only the last value will be used.`,
          source: 'newo-dsl',
        });
      }
      seen.add(p);
    }

    // Cat-50: Semicolons as separators detection
    if (callText.includes(';')) {
      // Check if semicolons are used between params (not inside strings)
      if (hasSemicolonOutsideStrings(callText)) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: lineNum, character: colNum },
            end: { line: lineNum, character: colNum + actionName.length },
          },
          message: `${actionName}: semicolons found in arguments. Use commas to separate parameters.`,
          source: 'newo-dsl',
        });
      }
    }

    // Cat-38: Validate nested action calls
    validateNestedCalls(callText, actionName, lineNum, colNum, diagnostics);

    // If NOT a known action and NOT a Jinja built-in, it must be a skill call
    if (!isKnownAction && !isJinjaBuiltin && skillIndexBuilt) {
      const skillInfo = getSkillInfo(skillIndex, actionName);
      if (!skillInfo) {
        const allKnown = [
          ...Object.keys(ACTIONS),
          ...Array.from(skillIndex.keys()),
        ];
        const suggestions = findSimilar(actionName, allKnown, 3);

        // Fix 12: For lowercase names (get_memory, structured_generation, etc.),
        // only report as unknown if there's a close typo suggestion (e.g.
        // sendMessage -> SendMessage). Lowercase names with no close match are
        // typically platform-injected functions or cross-skill calls that the
        // skill index may not discover.
        const isPascalCase = /^[A-Z]/.test(actionName);
        if (isPascalCase || suggestions.length > 0) {
          const didYouMean = suggestions.length > 0
            ? `. Did you mean '${suggestions[0]}'?`
            : '';
          diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
              start: { line: lineNum, character: colNum },
              end: { line: lineNum, character: colNum + actionName.length },
            },
            message: `Unknown function '${actionName}'${didYouMean}`,
            source: 'newo-dsl',
            data: suggestions.length > 0 ? { suggestions, original: actionName } : undefined,
          } as LspDiagnostic);
        }
      } else if (skillInfo.parameters.length > 0) {
        // Skills accept extra user-defined params beyond their schema definition
        // (users pass custom context data to skills), so we skip unknown-param checks.
        // Only check for missing required parameters.
        const hasPositional = hasPositionalArgs(callText);
        let positionalIndex = 0;
        for (const param of skillInfo.parameters) {
          if (param.required && !passedParams.includes(param.name)) {
            // Positional args can satisfy required params in order
            if (hasPositional && positionalIndex < passedParams.length) {
              positionalIndex++;
              continue;
            }
            diagnostics.push({
              severity: DiagnosticSeverity.Warning,
              range: {
                start: { line: lineNum, character: colNum },
                end: { line: lineNum, character: colNum + actionName.length },
              },
              message: `${actionName}: missing parameter '${param.name}'`,
              source: 'newo-dsl',
            });
          }
        }
      }
    }

    // Validate required parameters for known actions
    const rule = VALIDATION_RULES[actionName];
    if (rule) {
      const missingParams: string[] = [];
      const hasPositional = hasPositionalArgs(callText);
      if (rule.requiredParams.length > 0) {
        for (const param of rule.requiredParams) {
          if (!passedParams.includes(param)) {
            // Positional args can satisfy required params - don't flag as missing
            if (hasPositional) continue;
            missingParams.push(param);
            diagnostics.push({
              severity: DiagnosticSeverity.Warning,
              range: {
                start: { line: lineNum, character: colNum },
                end: { line: lineNum, character: colNum + actionName.length },
              },
              message: `${actionName}: missing required parameter '${param}'`,
              source: 'newo-dsl',
            });
          }
        }
      }

      // Validate parameter constraints (allowed values, min/max)
      diagnostics.push(...validateParamConstraints(actionName, callText, lineNum, colNum, actionName.length));
    }

    // Cat-75: Check for recursive skill calls (skill calling itself in its args)
    // String-aware: verify the match is not inside a string literal
    if (!isKnownAction && !isJinjaBuiltin && skillIndexBuilt) {
      const nestedRe75 = new RegExp(`\\b${actionName}\\s*\\(`, 'g');
      const argStart = callText.indexOf('(');
      if (argStart !== -1) {
        const argRegion = callText.substring(argStart + 1);
        let m75;
        while ((m75 = nestedRe75.exec(argRegion)) !== null) {
          if (!isInsideString(argRegion, m75.index)) {
            diagnostics.push({
              severity: DiagnosticSeverity.Warning,
              range: {
                start: { line: lineNum, character: colNum },
                end: { line: lineNum, character: colNum + actionName.length },
              },
              message: `${actionName}: recursive call detected. '${actionName}' calls itself in its own arguments, which may cause infinite recursion.`,
              source: 'newo-dsl',
            });
            break;
          }
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Second pass: statement-style calls  {% set x = Action() %}
  // -------------------------------------------------------------------------
  const stmtBlockPattern = /\{%[\s\S]*?%\}/g;
  let stmtMatch;
  while ((stmtMatch = stmtBlockPattern.exec(text)) !== null) {
    const stmtBlock = stmtMatch[0];
    const stmtPos = stmtMatch.index;

    // Find all function calls within this statement block
    const funcCallPattern = /([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
    let funcMatch;
    while ((funcMatch = funcCallPattern.exec(stmtBlock)) !== null) {
      const funcName = funcMatch[1];

      // Skip method calls on objects (e.g., zoneinfo.ZoneInfo(), datetime.timedelta(),
      // parts.append(), re.sub()). The char before the identifier is a dot.
      if (funcMatch.index > 0 && stmtBlock[funcMatch.index - 1] === '.') {
        continue;
      }

      // Skip Jinja keywords and built-ins
      const jinjaKeywords = ['set', 'if', 'elif', 'else', 'endif', 'for', 'endfor', 'block', 'endblock', 'macro', 'endmacro', 'call', 'filter', 'raw', 'include', 'import', 'from', 'extends', 'with', 'autoescape', 'range', 'loop', 'not', 'and', 'or', 'in', 'is', 'true', 'false', 'none', 'True', 'False', 'None'];
      if (jinjaKeywords.includes(funcName) || jinjaKeywords.includes(funcName.toLowerCase())) {
        continue;
      }

      // Skip Jinja built-in filters/functions
      if (JINJA_BUILTIN_NAMES.has(funcName)) {
        continue;
      }

      // Calculate the actual position in the original text
      const funcPosInBlock = funcMatch.index;
      const actualPos = stmtPos + funcPosInBlock;

      // Find line number and column
      let charCount = 0;
      let lineNum = 0;
      let colNum = 0;
      for (let i = 0; i < lines.length; i++) {
        if (charCount + lines[i].length >= actualPos) {
          lineNum = i;
          colNum = actualPos - charCount;
          break;
        }
        charCount += lines[i].length + 1;
      }

      // Check if this is a known action
      const isKnownAction = ACTIONS.hasOwnProperty(funcName);

      // Skip platform-injected functions entirely
      if (PLATFORM_FUNCTIONS.has(funcName)) continue;

      // Extract the full call to analyze parameters (string-aware - Cat-34)
      const { callText, hasUnclosedString: stmtUnclosed } = extractCallText(stmtBlock, funcMatch.index);

      // Only report unclosed string for real function calls (PascalCase actions/skills
      // or known platform functions), not random words followed by parens in JSON/text
      const isLikelyFunction = /^[A-Z]/.test(funcName) || isKnownAction || PLATFORM_FUNCTIONS.has(funcName);
      if (stmtUnclosed && isLikelyFunction) {
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: {
            start: { line: lineNum, character: colNum },
            end: { line: lineNum, character: colNum + funcName.length },
          },
          message: `${funcName}: unclosed string literal in arguments.`,
          source: 'newo-dsl',
        });
      }

      // Extract passed parameter names (depth-aware to skip nested calls)
      const passedParams = extractTopLevelParams(callText);

      // Cat-36: Duplicate parameter detection
      {
        const seen = new Set<string>();
        for (const p of passedParams) {
          if (seen.has(p)) {
            diagnostics.push({
              severity: DiagnosticSeverity.Warning,
              range: {
                start: { line: lineNum, character: colNum },
                end: { line: lineNum, character: colNum + funcName.length },
              },
              message: `${funcName}: duplicate parameter '${p}'. Only the last value will be used.`,
              source: 'newo-dsl',
            });
          }
          seen.add(p);
        }
      }

      // Cat-50: Semicolons as separators
      if (callText.includes(';') && hasSemicolonOutsideStrings(callText)) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: lineNum, character: colNum },
            end: { line: lineNum, character: colNum + funcName.length },
          },
          message: `${funcName}: semicolons found in arguments. Use commas to separate parameters.`,
          source: 'newo-dsl',
        });
      }

      // Cat-38: Validate nested action calls
      validateNestedCalls(callText, funcName, lineNum, colNum, diagnostics);

      // If NOT a known action, check if it's a skill
      if (!isKnownAction && skillIndexBuilt) {
        const skillInfo = getSkillInfo(skillIndex, funcName);
        if (!skillInfo) {
          // Unknown function - only report if it looks like an action (PascalCase)
          if (/^[A-Z]/.test(funcName)) {
            const allKnown = [
              ...Object.keys(ACTIONS),
              ...Array.from(skillIndex.keys()),
            ];
            const suggestions = findSimilar(funcName, allKnown, 3);
            const didYouMean = suggestions.length > 0
              ? `. Did you mean '${suggestions[0]}'?`
              : '';
            diagnostics.push({
              severity: DiagnosticSeverity.Error,
              range: {
                start: { line: lineNum, character: colNum },
                end: { line: lineNum, character: colNum + funcName.length },
              },
              message: `Unknown function '${funcName}'${didYouMean}`,
              source: 'newo-dsl',
              data: suggestions.length > 0 ? { suggestions, original: funcName } : undefined,
            } as LspDiagnostic);
          }
        } else if (skillInfo.parameters.length > 0) {
          // Skills accept extra user-defined params beyond their schema definition
          // (users pass custom context data to skills), so we skip unknown-param checks.
          // Only check for missing required parameters.
          const hasPositional = hasPositionalArgs(callText);
          let positionalIndex = 0;
          for (const param of skillInfo.parameters) {
            if (param.required && !passedParams.includes(param.name)) {
              // Positional args can satisfy required params in order
              if (hasPositional && positionalIndex < passedParams.length) {
                positionalIndex++;
                continue;
              }
              diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: {
                  start: { line: lineNum, character: colNum },
                  end: { line: lineNum, character: colNum + funcName.length },
                },
                message: `${funcName}: missing parameter '${param.name}'`,
                source: 'newo-dsl',
              });
            }
          }
        }
      }

      // Validate required parameters for known actions
      const rule = VALIDATION_RULES[funcName];
      if (rule) {
        const hasPositionalAction = hasPositionalArgs(callText);
        if (rule.requiredParams.length > 0) {
          for (const param of rule.requiredParams) {
            if (!passedParams.includes(param)) {
              // Positional args can satisfy required params - don't flag as missing
              if (hasPositionalAction) continue;
              diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: {
                  start: { line: lineNum, character: colNum },
                  end: { line: lineNum, character: colNum + funcName.length },
                },
                message: `${funcName}: missing required parameter '${param}'`,
                source: 'newo-dsl',
              });
            }
          }
        }

        // Validate parameter constraints (allowed values, min/max)
        diagnostics.push(...validateParamConstraints(funcName, callText, lineNum, colNum, funcName.length));
      }
    }
  }

  // -------------------------------------------------------------------------
  // Variable diagnostics
  // -------------------------------------------------------------------------
  const undefinedRefs = getUndefinedReferences(varTable);
  for (const ref of undefinedRefs) {
    // Skip PascalCase names - they're likely function/skill calls, not variables
    if (/^[A-Z]/.test(ref.name)) continue;

    const allVarNames = Array.from(varTable.allNames);
    // Fix 6: Filter implicit variables from suggestion pool to avoid false
    // "Did you mean 'user'?" for 'userId', etc. Only user-defined names should
    // be suggested as typo corrections.
    const userDefinedVarNames = allVarNames.filter(n => !IMPLICIT_VARIABLES.has(n));
    const suggestions = findSimilar(ref.name, userDefinedVarNames, 2);

    // Fix 1: Self-suggestion - variable IS known but not in scope (likely skill param)
    if (suggestions.length > 0 && suggestions[0] === ref.name) {
      diagnostics.push({
        severity: DiagnosticSeverity.Hint,
        range: {
          start: { line: ref.line, character: ref.column },
          end: { line: ref.line, character: ref.column + ref.name.length },
        },
        message: `Variable '${ref.name}' is used before its definition or may be a skill parameter`,
        source: 'newo-dsl',
      });
      continue;
    }

    // Fix 5: Guidance files without skill params - downgrade unknown vars to Hint
    // Keep Warning for vars with close suggestions from user-defined names (likely real typos)
    if (isGuidanceFile && !hasSkillParams) {
      const hasCloseSuggestion = suggestions.length > 0 && suggestions[0] !== ref.name;
      if (!hasCloseSuggestion) {
        diagnostics.push({
          severity: DiagnosticSeverity.Hint,
          range: {
            start: { line: ref.line, character: ref.column },
            end: { line: ref.line, character: ref.column + ref.name.length },
          },
          message: `Possibly undefined variable '${ref.name}' (skill parameters not available)`,
          source: 'newo-dsl',
        });
        continue;
      }
    }

    // Standard undefined variable warning (kept for real errors)
    const didYouMean = suggestions.length > 0
      ? `. Did you mean '${suggestions[0]}'?`
      : '';

    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      range: {
        start: { line: ref.line, character: ref.column },
        end: { line: ref.line, character: ref.column + ref.name.length },
      },
      message: `Undefined variable '${ref.name}'${didYouMean}`,
      source: 'newo-dsl',
      data: suggestions.length > 0 ? { suggestions, original: ref.name } : undefined,
    } as LspDiagnostic);
  }

  const unusedDefs = getUnusedDefinitions(varTable);
  for (const def of unusedDefs) {
    // Skip variables from Set() actions - they often have side effects
    if (def.source === 'set-action') continue;

    diagnostics.push({
      severity: DiagnosticSeverity.Hint,
      range: {
        start: { line: def.line, character: def.column },
        end: { line: def.line, character: def.column + def.name.length },
      },
      message: `Variable '${def.name}' is defined but never referenced`,
      source: 'newo-dsl',
    });
  }

  // Cat-48: Variable name shadows a built-in action name
  for (const [name, defs] of varTable.definitions) {
    if (ACTIONS.hasOwnProperty(name)) {
      for (const def of defs) {
        if (def.source === 'set' || def.source === 'set-action') {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
              start: { line: def.line, character: def.column },
              end: { line: def.line, character: def.column + name.length },
            },
            message: `Variable '${name}' shadows the built-in action '${name}'. This may cause confusion.`,
            source: 'newo-dsl',
          });
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Cat-37: Consecutive SetState dead store detection
  // -------------------------------------------------------------------------
  {
    const setStateRe = /\{\{-?\s*SetState\s*\(\s*name\s*=\s*["']([^"']+)["']/g;
    const setStateCalls: Array<{ key: string; line: number }> = [];
    let ssMatch;
    while ((ssMatch = setStateRe.exec(text)) !== null) {
      const key = ssMatch[1];
      const pos = positionFromOffset(text, ssMatch.index);
      setStateCalls.push({ key, line: pos.line });
    }
    // Find consecutive writes to the same key with nothing in between
    for (let i = 0; i < setStateCalls.length - 1; i++) {
      if (setStateCalls[i].key === setStateCalls[i + 1].key) {
        // Fix 13: Skip if the two SetState calls are separated by a
        // conditional boundary (endif/else/elif). This means they're in
        // different branches and may be mutually exclusive - not a dead store.
        const lineA = setStateCalls[i].line;
        const lineB = setStateCalls[i + 1].line;
        let hasConditionalBoundary = false;
        for (let ln = lineA + 1; ln < lineB; ln++) {
          if (/\{%-?\s*(?:endif|else|elif)\b/.test(lines[ln])) {
            hasConditionalBoundary = true;
            break;
          }
        }
        if (hasConditionalBoundary) continue;

        const pos = positionFromOffset(text, text.indexOf('SetState', lineOffset(text, setStateCalls[i].line)));
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: setStateCalls[i].line, character: 0 },
            end: { line: setStateCalls[i].line, character: lines[setStateCalls[i].line]?.length || 0 },
          },
          message: `SetState: key '${setStateCalls[i].key}' is immediately overwritten on line ${setStateCalls[i + 1].line + 1}. First value is never used (dead store).`,
          source: 'newo-dsl',
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // Cat-46: Python-style colon in Jinja conditional
  // Cat-47: Assignment = instead of comparison == in conditional
  // -------------------------------------------------------------------------
  {
    const condRe = /\{%-?\s*(?:if|elif)\s+([\s\S]*?)\s*-?%\}/g;
    let condMatch;
    while ((condMatch = condRe.exec(text)) !== null) {
      const condition = condMatch[1];
      const condPos = positionFromOffset(text, condMatch.index);

      // Cat-51: && instead of 'and' (string-aware to avoid FPs from string literals)
      if (hasOperatorOutsideStrings(condition, '&&')) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: condPos.line, character: condPos.col },
            end: { line: condPos.line, character: condPos.col + condMatch[0].length },
          },
          message: `Use 'and' instead of '&&' in Jinja conditionals. '&&' is not a valid Jinja operator.`,
          source: 'newo-dsl',
        });
      }

      // Cat-52/59: || instead of 'or' (string-aware)
      if (hasOperatorOutsideStrings(condition, '||')) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: condPos.line, character: condPos.col },
            end: { line: condPos.line, character: condPos.col + condMatch[0].length },
          },
          message: `Use 'or' instead of '||' in Jinja conditionals. '||' is not a valid Jinja operator.`,
          source: 'newo-dsl',
        });
      }

      // Cat-53: ! instead of 'not' (but not != which is valid) - string-aware
      if (hasNegationOutsideStrings(condition)) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: condPos.line, character: condPos.col },
            end: { line: condPos.line, character: condPos.col + condMatch[0].length },
          },
          message: `Use 'not' instead of '!' in Jinja conditionals. '!' is not a valid Jinja operator.`,
          source: 'newo-dsl',
        });
      }

      // Cat-46: trailing colon before %}
      if (condition.trimEnd().endsWith(':')) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: condPos.line, character: condPos.col },
            end: { line: condPos.line, character: condPos.col + condMatch[0].length },
          },
          message: `Python-style colon in Jinja conditional. Remove the trailing ':' - Jinja uses {% endif %} instead.`,
          source: 'newo-dsl',
        });
      }

      // Cat-47: single = that is not == or != or >=  or <=
      // Look for `identifier = "value"` pattern (assignment-style in condition)
      const assignRe = /\b([A-Za-z_]\w*)\s*=\s*(?!=)/g;
      let aMatch;
      while ((aMatch = assignRe.exec(condition)) !== null) {
        // Make sure it's not preceded by !, <, > (part of !=, <=, >=)
        const before = aMatch.index > 0 ? condition[aMatch.index - 1] : '';
        if (before === '!' || before === '<' || before === '>') continue;
        // Skip if the identifier is a keyword argument (inside a function call)
        // by checking if there's an open paren before with no matching close
        const prefix = condition.substring(0, aMatch.index);
        const openParens = (prefix.match(/\(/g) || []).length;
        const closeParens = (prefix.match(/\)/g) || []).length;
        if (openParens > closeParens) continue; // inside a function call's kwargs

        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: condPos.line, character: condPos.col },
            end: { line: condPos.line, character: condPos.col + condMatch[0].length },
          },
          message: `Possible assignment '=' in conditional. Did you mean '==' for comparison?`,
          source: 'newo-dsl',
        });
        break; // only report once per conditional
      }
    }
  }

  // -------------------------------------------------------------------------
  // Cat-55: ++ / -- increment/decrement operators (C/JS habit)
  // Cat-59: || in {% set %} expressions (JS default pattern)
  // -------------------------------------------------------------------------
  {
    const setStmtRe = /\{%-?\s*set\s+([A-Za-z_][A-Za-z0-9_]*)\s*([\s\S]*?)\s*-?%\}/g;
    let setM;
    while ((setM = setStmtRe.exec(text)) !== null) {
      const rest = setM[2]; // everything after the var name
      const setPos = positionFromOffset(text, setM.index);

      // Cat-55: {% set counter++ %} or {% set ++counter %}
      if (/\+\+/.test(setM[0])) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: setPos.line, character: setPos.col },
            end: { line: setPos.line, character: setPos.col + setM[0].length },
          },
          message: `'++' is not valid in Jinja. Use '{% set x = x + 1 %}' instead.`,
          source: 'newo-dsl',
        });
      }
      if (hasOperatorOutsideStrings(setM[0], '--')) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: setPos.line, character: setPos.col },
            end: { line: setPos.line, character: setPos.col + setM[0].length },
          },
          message: `'--' is not valid in Jinja. Use '{% set x = x - 1 %}' instead.`,
          source: 'newo-dsl',
        });
      }

      // Cat-59: || inside set value expression
      if (rest.includes('=') && hasOperatorOutsideStrings(rest, '||')) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: setPos.line, character: setPos.col },
            end: { line: setPos.line, character: setPos.col + setM[0].length },
          },
          message: `'||' is not valid in Jinja. Use the 'default' filter: '{{ var | default("fallback") }}' or 'or' keyword.`,
          source: 'newo-dsl',
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // Cat-66: Unreachable code after Return()
  // -------------------------------------------------------------------------
  {
    const returnRe = /\{\{-?\s*Return\s*\(/g;
    let retMatch;
    while ((retMatch = returnRe.exec(text)) !== null) {
      const retPos = positionFromOffset(text, retMatch.index);
      const retLine = retPos.line;

      // Fix 8b: Check if Return is inside a same-line conditional block.
      // e.g. {{#if cond}}{{Return()}}{{/if}} or {% if cond %}{{Return()}}{% endif %}
      const currentLine = lines[retLine] || '';
      const retColInLine = retMatch.index - lineOffset(text, retLine);
      const beforeReturn = currentLine.substring(0, retColInLine);
      const afterReturn = currentLine.substring(retColInLine);
      const hasCondBefore = /\{\{#if\b/.test(beforeReturn) || /\{%-?\s*if\b/.test(beforeReturn);
      const hasCondClose = /\{\{\/if\}\}/.test(afterReturn) || /\{%-?\s*endif\s*-?%\}/.test(afterReturn);
      if (hasCondBefore && hasCondClose) continue; // conditional Return on same line

      // Check if there are action calls on subsequent lines (outside control flow)
      // Simple heuristic: look for {{ on subsequent lines before any {% endif/endfor %}
      for (let ln = retLine + 1; ln < lines.length; ln++) {
        const line = lines[ln].trim();
        if (!line) continue;
        // Stop at Jinja control flow boundaries
        if (/\{%-?\s*(?:endif|endfor|else|elif)\b/.test(line)) break;
        // Stop at Guidance control flow boundaries ({{/if}}, {{/each}}, {{else}}, etc.)
        if (/\{\{~?(?:\/(?:if|each|unless)|else)\b/.test(line)) break;
        // Found an action call after Return
        if (/\{\{.*[A-Z][A-Za-z0-9_]*\s*\(/.test(line)) {
          const pos = positionFromOffset(text, lineOffset(text, ln));
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
              start: { line: ln, character: 0 },
              end: { line: ln, character: lines[ln].length },
            },
            message: `Unreachable code after Return() on line ${retLine + 1}. This code will never execute.`,
            source: 'newo-dsl',
          });
          break; // only report once per Return
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Cat-68: {% break %} and {% continue %} are not standard Jinja
  // -------------------------------------------------------------------------
  {
    const loopCtrlRe = /\{%-?\s*(break|continue)\s*-?%\}/g;
    let lcMatch;
    while ((lcMatch = loopCtrlRe.exec(text)) !== null) {
      const keyword = lcMatch[1];
      const pos = positionFromOffset(text, lcMatch.index);
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: { line: pos.line, character: pos.col },
          end: { line: pos.line, character: pos.col + lcMatch[0].length },
        },
        message: `'{%  ${keyword} %}' is not supported in standard Jinja2. It requires the 'jinja2.ext.loopcontrols' extension which may not be available.`,
        source: 'newo-dsl',
      });
    }
  }

  // -------------------------------------------------------------------------
  // Cat-69: Loop variable shadowing (inner for reuses outer for's variable)
  // -------------------------------------------------------------------------
  {
    const forVarRe = /\{%-?\s*for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\b/g;
    const endForRe2 = /\{%-?\s*endfor\s*-?%\}/g;
    const forItems: Array<{ name: string; offset: number; line: number }> = [];
    const endForItems: Array<{ offset: number }> = [];
    let fvM;
    while ((fvM = forVarRe.exec(text)) !== null) {
      forItems.push({ name: fvM[1], offset: fvM.index, line: positionFromOffset(text, fvM.index).line });
    }
    while ((fvM = endForRe2.exec(text)) !== null) {
      endForItems.push({ offset: fvM.index });
    }
    // Pair by nesting depth
    const fStack: typeof forItems = [];
    const allFE = [
      ...forItems.map(f => ({ ...f, kind: 'for' as const })),
      ...endForItems.map(e => ({ ...e, kind: 'endfor' as const, name: '', line: 0 })),
    ].sort((a, b) => a.offset - b.offset);
    for (const item of allFE) {
      if (item.kind === 'for') {
        // Check if any ancestor in the stack uses the same variable name
        for (const ancestor of fStack) {
          if (ancestor.name === item.name) {
            diagnostics.push({
              severity: DiagnosticSeverity.Warning,
              range: {
                start: { line: item.line, character: 0 },
                end: { line: item.line, character: lines[item.line]?.length || 0 },
              },
              message: `Loop variable '${item.name}' shadows the outer loop variable '${item.name}' (defined on line ${ancestor.line + 1}). Use a different name to avoid confusion.`,
              source: 'newo-dsl',
            });
            break;
          }
        }
        fStack.push(item);
      } else if (item.kind === 'endfor' && fStack.length > 0) {
        fStack.pop();
      }
    }
  }

  // -------------------------------------------------------------------------
  // Cat-70: Iterating over a string-typed variable
  // -------------------------------------------------------------------------
  {
    const forIterRe = /\{%-?\s*for\s+[A-Za-z_][A-Za-z0-9_]*\s+in\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\||\s*-?%\})/g;
    let fiMatch;
    while ((fiMatch = forIterRe.exec(text)) !== null) {
      const iterName = fiMatch[1];
      const defs = varTable.definitions.get(iterName);
      if (defs) {
        // Check if any definition has inferredType === 'string'
        const stringDef = defs.find(d => d.inferredType === 'string');
        if (stringDef) {
          const pos = positionFromOffset(text, fiMatch.index);
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
              start: { line: pos.line, character: 0 },
              end: { line: pos.line, character: lines[pos.line]?.length || 0 },
            },
            message: `Iterating over '${iterName}' which has type 'string'. This will iterate over individual characters. Did you mean to use a list?`,
            source: 'newo-dsl',
          });
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Cat-72: Assigning void action result to a variable
  // -------------------------------------------------------------------------
  {
    // Actions that return void (no meaningful return value)
    const VOID_ACTIONS = new Set([
      'SendMessage', 'SetState', 'Sleep', 'Return', 'StopFlow',
      'RaiseEvent', 'GoToFlow', 'GoToSkill', 'EndConversation', 'TransferCall',
      'SendEmail', 'SendSms', 'Log', 'SetCustomerAttribute', 'SetProjectAttribute',
      'SetCustomerMetadataAttribute', 'SetProjectMetadataAttribute',
      'DeleteCustomerAttribute', 'DeletePersonaAttribute', 'DeleteConnector', 'DeleteAkb',
      'SendTypingStart', 'SendTypingStop',
      'DisableFollowUp', 'EnableFollowUp',
      'SetConnectorInfo', 'SetPersonaAttribute',
      'SendSystemEvent', 'SendCommand', 'DUMMY',
      'StartNotInterruptibleBlock', 'StopNotInterruptibleBlock',
    ]);
    const setActionRe = /\{%-?\s*set\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([A-Z][A-Za-z0-9_]*)\s*\(/g;
    let vaMatch;
    while ((vaMatch = setActionRe.exec(text)) !== null) {
      const varName = vaMatch[1];
      const actionName = vaMatch[2];
      if (VOID_ACTIONS.has(actionName)) {
        const pos = positionFromOffset(text, vaMatch.index);
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: { line: pos.line, character: pos.col },
            end: { line: pos.line, character: pos.col + vaMatch[0].length },
          },
          message: `Action '${actionName}' does not return a meaningful value. Assigning its result to '${varName}' is likely a mistake.`,
          source: 'newo-dsl',
        });
      }
    }
  }

  return { diagnostics, varTable };
}

// ---------------------------------------------------------------------------
// Exported utility functions
// ---------------------------------------------------------------------------

/**
 * Extract top-level parameter names from a function call text.
 * Only captures `name=` patterns at parenthesis depth 1,
 * ignoring parameters belonging to nested function calls.
 */
export function extractTopLevelParams(callText: string): string[] {
  const params: string[] = [];
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < callText.length; i++) {
    const char = callText[i];

    // Handle string boundaries
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      continue;
    }
    if (inString) {
      if (char === '\\') { i++; continue; } // skip escaped chars
      if (char === stringChar) { inString = false; }
      continue;
    }

    if (char === '(') { depth++; continue; }
    if (char === ')') { depth--; continue; }

    // Only match `word=` at depth 1 (direct args of the outer function)
    if (depth === 1 && /[A-Za-z_]/.test(char)) {
      const rest = callText.substring(i);
      const m = rest.match(/^([A-Za-z_]\w*)\s*=/);
      if (m) {
        // Make sure the '=' is not '==' (comparison, not assignment)
        const afterEq = rest.substring(m[0].length);
        if (!afterEq.startsWith('=')) {
          params.push(m[1]);
        }
        i += m[0].length - 1;
      }
    }
  }

  return params;
}

/**
 * Validate parameter constraints (allowed values) for a function call.
 * Returns diagnostics for invalid parameter values.
 */
export function validateParamConstraints(
  funcName: string,
  callText: string,
  lineNum: number,
  colNum: number,
  nameLength: number,
): LspDiagnostic[] {
  const diagnostics: LspDiagnostic[] = [];
  const rule = VALIDATION_RULES[funcName];
  if (!rule?.paramConstraints) return diagnostics;

  for (const [paramName, constraint] of Object.entries(rule.paramConstraints)) {
    const paramValueMatch = callText.match(
      new RegExp(`${paramName}\\s*=\\s*["']([^"']*)["']`),
    );
    if (!paramValueMatch) continue;

    const paramValue = paramValueMatch[1];

    // Check allowed values
    if (constraint.allowed && !constraint.allowed.includes(paramValue)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: { line: lineNum, character: colNum },
          end: { line: lineNum, character: colNum + nameLength },
        },
        message: `${funcName}: invalid value '${paramValue}' for parameter '${paramName}'. Allowed: ${constraint.allowed.join(', ')}`,
        source: 'newo-dsl',
      });
    }

    // Check min/max constraints (for numeric values)
    if (constraint.min !== undefined || constraint.max !== undefined) {
      const numValue = parseFloat(paramValue);
      if (!isNaN(numValue)) {
        if (constraint.min !== undefined && numValue < constraint.min) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
              start: { line: lineNum, character: colNum },
              end: { line: lineNum, character: colNum + nameLength },
            },
            message: `${funcName}: value ${numValue} for '${paramName}' is below minimum ${constraint.min}`,
            source: 'newo-dsl',
          });
        }
        if (constraint.max !== undefined && numValue > constraint.max) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
              start: { line: lineNum, character: colNum },
              end: { line: lineNum, character: colNum + nameLength },
            },
            message: `${funcName}: value ${numValue} for '${paramName}' exceeds maximum ${constraint.max}`,
            source: 'newo-dsl',
          });
        }
      }
    }
  }

  return diagnostics;
}

/**
 * Find the position of the last unmatched brace in the text.
 * If moreOpens=true, finds the last opening brace without a match.
 * If moreOpens=false, finds the last closing brace without a match.
 */
export function findLastUnmatchedBrace(text: string, openStr: string, closeStr: string, moreOpens: boolean): number {
  if (moreOpens) {
    const openPositions: number[] = [];
    let idx = 0;
    while (idx < text.length) {
      if (text.slice(idx, idx + openStr.length) === openStr) {
        openPositions.push(idx);
        idx += openStr.length;
      } else if (text.slice(idx, idx + closeStr.length) === closeStr) {
        if (openPositions.length > 0) openPositions.pop();
        idx += closeStr.length;
      } else {
        idx++;
      }
    }
    return openPositions.length > 0 ? openPositions[openPositions.length - 1] : -1;
  } else {
    const closePositions: number[] = [];
    let idx = text.length - closeStr.length;
    while (idx >= 0) {
      if (text.slice(idx, idx + closeStr.length) === closeStr) {
        closePositions.push(idx);
        idx--;
      } else if (text.slice(idx, idx + openStr.length) === openStr) {
        if (closePositions.length > 0) closePositions.pop();
        idx--;
      } else {
        idx--;
      }
    }
    return closePositions.length > 0 ? closePositions[closePositions.length - 1] : -1;
  }
}

/**
 * Get skill info by name (handles both _SkillName and SkillName patterns)
 */
export function getSkillInfo(skillIndex: Map<string, SkillInfo>, skillName: string): SkillInfo | undefined {
  // Direct match
  if (skillIndex.has(skillName)) {
    return skillIndex.get(skillName);
  }

  // Try without leading underscore
  if (skillName.startsWith('_')) {
    const withoutUnderscore = skillName.substring(1);
    if (skillIndex.has(withoutUnderscore)) {
      return skillIndex.get(withoutUnderscore);
    }
  }

  // Try with leading underscore
  const withUnderscore = '_' + skillName;
  if (skillIndex.has(withUnderscore)) {
    return skillIndex.get(withUnderscore);
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function positionFromOffset(text: string, offset: number): { line: number; col: number } {
  let charCount = 0;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (charCount + lines[i].length >= offset) {
      return { line: i, col: offset - charCount };
    }
    charCount += lines[i].length + 1;
  }
  return { line: lines.length - 1, col: 0 };
}

/** Get the character offset of the start of a given line number. */
function lineOffset(text: string, lineNum: number): number {
  let offset = 0;
  const lines = text.split('\n');
  for (let i = 0; i < lineNum && i < lines.length; i++) {
    offset += lines[i].length + 1;
  }
  return offset;
}

/**
 * String-aware call text extraction (Cat-34 fix).
 * Scans from the match position forward, tracking string boundaries
 * so that `)` inside a string does not end the paren scan.
 * Also detects unclosed string literals.
 */
function extractCallText(
  source: string,
  startPos: number,
): { callText: string; hasUnclosedString: boolean } {
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let hasUnclosedString = false;
  let callEnd = startPos;

  for (let i = startPos; i < source.length; i++) {
    const ch = source[i];

    if (inString) {
      if (ch === '\\') { i++; continue; } // skip escaped
      if (ch === stringChar) { inString = false; }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === '(') { depth++; continue; }
    if (ch === ')') {
      depth--;
      if (depth === 0) {
        callEnd = i + 1;
        break;
      }
    }

    // Stop at }} or %} boundaries to avoid scanning past the expression
    if (depth === 0 && i > startPos && (
      (ch === '}' && i + 1 < source.length && source[i + 1] === '}') ||
      (ch === '%' && i + 1 < source.length && source[i + 1] === '}')
    )) {
      break;
    }
  }

  if (inString) {
    hasUnclosedString = true;
  }

  return { callText: source.substring(startPos, callEnd), hasUnclosedString };
}

/**
 * Context-aware expression brace counter (Fix 8).
 * Counts {{ and }} pairs while skipping:
 * - String literals (both " and ')
 * - Comment blocks {# ... #}
 * - Statement blocks {% ... %} (where {} are dict/object braces)
 * - Dict literal braces {} inside {{ }} expression blocks
 */
function countExpressionBracePairs(text: string): { open: number; close: number } {
  let open = 0;
  let close = 0;
  let inString = false;
  let stringChar = '';
  let inJinjaComment = false;  // {# ... #}
  let inStatement = false;     // {% ... %}
  let inExpression = false;    // {{ ... }}
  let braceDepth = 0;          // dict/object {} depth inside expressions

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = i + 1 < text.length ? text[i + 1] : '';

    // String handling - ONLY inside expressions and statements, never at top level.
    // Top-level text in guidance templates contains natural apostrophes (user's, can't)
    // that must not be treated as string delimiters.
    if ((inExpression || inStatement) && !inJinjaComment) {
      if (!inString && (ch === '"' || ch === "'")) {
        inString = true;
        stringChar = ch;
        continue;
      }
      if (inString) {
        if (ch === '\\') { i++; continue; }
        if (ch === stringChar) { inString = false; }
        continue;
      }
    }

    // Jinja comment blocks {# ... #}
    if (!inJinjaComment && !inStatement && !inExpression && ch === '{' && next === '#') {
      inJinjaComment = true;
      i++;
      continue;
    }
    if (inJinjaComment) {
      if (ch === '#' && next === '}') { inJinjaComment = false; i++; }
      continue;
    }

    // Statement blocks {% ... %}
    if (!inStatement && !inExpression && ch === '{' && next === '%') {
      inStatement = true;
      i++;
      continue;
    }
    if (inStatement) {
      if (ch === '%' && next === '}') { inStatement = false; inString = false; i++; }
      continue;
    }

    // Expression blocks {{ ... }}
    if (!inExpression && ch === '{' && next === '{') {
      open++;
      inExpression = true;
      braceDepth = 0;
      inString = false;
      i++; // skip second {

      // Guidance comment: {{!-- ... --}} - skip to closing --}}
      // Also handle {{! ... }} short comments.
      if (i + 1 < text.length && text[i + 1] === '!') {
        if (i + 3 < text.length && text[i + 2] === '-' && text[i + 3] === '-') {
          // Long comment {{!-- ... --}}
          const closeIdx = text.indexOf('--}}', i + 4);
          if (closeIdx !== -1) {
            close++;
            inExpression = false;
            i = closeIdx + 3; // past --}}
          }
        } else {
          // Short comment {{! ... }}
          const closeIdx = text.indexOf('}}', i + 2);
          if (closeIdx !== -1) {
            close++;
            inExpression = false;
            i = closeIdx + 1; // past }}
          }
        }
      }
      continue;
    }

    if (inExpression) {
      if (ch === '{') { braceDepth++; continue; }
      if (ch === '}') {
        if (braceDepth > 0) { braceDepth--; continue; }
        // At depth 0: closing }} ends the expression
        if (next === '}') {
          close++;
          inExpression = false;
          inString = false;
          i++; // skip second }
          continue;
        }
        // Single } at depth 0 - anomalous but don't count
        continue;
      }
      continue;
    }

    // Orphaned }} at top level (no matching {{ before)
    if (ch === '}' && next === '}') {
      close++;
      i++;
    }
  }

  return { open, close };
}

/**
 * Context-aware statement brace counter (Fix 10).
 * Counts {% and %} pairs while skipping string literals and Jinja comments.
 * Simpler than countExpressionBracePairs since {% %} blocks don't nest
 * and don't contain dict literals.
 */
function countStatementBracePairs(text: string): { open: number; close: number } {
  let open = 0;
  let close = 0;
  let inString = false;
  let stringChar = '';
  let inJinjaComment = false;
  let inExpression = false;  // skip {{ ... }} blocks
  let inStatement = false;   // inside {% ... %}
  let exprBraceDepth = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = i + 1 < text.length ? text[i + 1] : '';

    // String handling - ONLY inside expressions and statements, never at top level.
    if ((inExpression || inStatement) && !inJinjaComment) {
      if (!inString && (ch === '"' || ch === "'")) {
        inString = true;
        stringChar = ch;
        continue;
      }
      if (inString) {
        if (ch === '\\') { i++; continue; }
        if (ch === stringChar) { inString = false; }
        continue;
      }
    }

    // Jinja comments {# ... #}
    if (!inJinjaComment && !inExpression && !inStatement && ch === '{' && next === '#') {
      inJinjaComment = true;
      i++;
      continue;
    }
    if (inJinjaComment) {
      if (ch === '#' && next === '}') { inJinjaComment = false; i++; }
      continue;
    }

    // Expression blocks {{ ... }} - skip entirely
    if (!inExpression && !inStatement && ch === '{' && next === '{') {
      inExpression = true;
      exprBraceDepth = 0;
      inString = false;
      i++; // skip second {
      // Handle Guidance comments {{!-- ... --}} and {{! ... }}
      if (i + 1 < text.length && text[i + 1] === '!') {
        if (i + 3 < text.length && text[i + 2] === '-' && text[i + 3] === '-') {
          const closeIdx = text.indexOf('--}}', i + 4);
          if (closeIdx !== -1) { inExpression = false; i = closeIdx + 3; }
        } else {
          const closeIdx = text.indexOf('}}', i + 2);
          if (closeIdx !== -1) { inExpression = false; i = closeIdx + 1; }
        }
      }
      continue;
    }
    if (inExpression) {
      if (ch === '{') { exprBraceDepth++; continue; }
      if (ch === '}') {
        if (exprBraceDepth > 0) { exprBraceDepth--; continue; }
        if (next === '}') { inExpression = false; inString = false; i++; }
      }
      continue;
    }

    // Count statement braces
    if (ch === '{' && next === '%') { open++; inStatement = true; i++; continue; }
    if (inStatement && ch === '%' && next === '}') { close++; inStatement = false; inString = false; i++; continue; }
  }

  return { open, close };
}

/**
 * Find the first occurrence of `needle` outside string literals, comments,
 * and statement blocks (Fix 11). Used for the reversed-brace check.
 */
function firstOutsideStringsAndBlocks(text: string, needle: string): number {
  let inString = false;
  let stringChar = '';

  for (let i = 0; i <= text.length - needle.length; i++) {
    const ch = text[i];

    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) { inString = false; }
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }

    // Skip Jinja comments {# ... #}
    if (ch === '{' && i + 1 < text.length && text[i + 1] === '#') {
      const end = text.indexOf('#}', i + 2);
      if (end !== -1) { i = end + 1; continue; }
    }

    // Skip statement blocks {% ... %} (may contain }} in string values)
    if (ch === '{' && i + 1 < text.length && text[i + 1] === '%') {
      const end = text.indexOf('%}', i + 2);
      if (end !== -1) { i = end + 1; continue; }
    }

    if (text.slice(i, i + needle.length) === needle) return i;
  }
  return -1;
}

/**
 * Check if an operator (e.g. '--', '||') appears outside string literals (Fix 2).
 * For '--', also excludes --%} (Jinja whitespace trim).
 */
function hasOperatorOutsideStrings(text: string, operator: string): boolean {
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) { inString = false; }
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }
    if (text.slice(i, i + operator.length) === operator) {
      // For '--', exclude --%} (Jinja whitespace control)
      if (operator === '--' && i + 2 < text.length && text[i + 2] === '%') continue;
      return true;
    }
  }
  return false;
}

/**
 * Check if a negation operator (!) appears outside string literals (Cat-53 fix).
 * Matches !identifier but not != (which is valid).
 */
function hasNegationOutsideStrings(text: string): boolean {
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) { inString = false; }
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }
    if (ch === '!') {
      // Skip != (valid comparison)
      if (i + 1 < text.length && text[i + 1] === '=') continue;
      // Skip if preceded by < or > (<=, >=)
      if (i > 0 && (text[i - 1] === '<' || text[i - 1] === '>')) continue;
      // Check if followed by an identifier character
      if (i + 1 < text.length && /[A-Za-z_]/.test(text[i + 1])) return true;
    }
  }
  return false;
}

/**
 * Check if a position in a string is inside a string literal.
 * Scans from the start tracking quote boundaries.
 */
function isInsideString(text: string, targetPos: number): boolean {
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < targetPos && i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) { inString = false; }
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; }
  }
  return inString;
}

/**
 * Check if there are semicolons outside of string literals in a call text (Cat-50).
 */
function hasSemicolonOutsideStrings(callText: string): boolean {
  let inString = false;
  let stringChar = '';
  let depth = 0;
  for (let i = 0; i < callText.length; i++) {
    const ch = callText[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) { inString = false; }
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }
    if (ch === '(') { depth++; continue; }
    if (ch === ')') { depth--; continue; }
    if (ch === ';' && depth === 1) return true;
  }
  return false;
}

/**
 * Check if a function call has positional arguments (values not preceded by name=).
 * Used by Cat-74 to suggest keyword argument syntax.
 */
function hasPositionalArgs(callText: string): boolean {
  const firstParen = callText.indexOf('(');
  if (firstParen === -1) return false;
  const argRegion = callText.substring(firstParen + 1);
  // Check if there's a string literal or identifier at depth 0 not preceded by name=
  let depth = 0;
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < argRegion.length; i++) {
    const ch = argRegion[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) { inString = false; }
      continue;
    }
    if (ch === '"' || ch === "'") {
      if (depth === 0) {
        // Check if preceded by =
        const before = argRegion.substring(0, i).trimEnd();
        if (!before.endsWith('=')) return true;
      }
      inString = true; stringChar = ch; continue;
    }
    if (ch === '(') { depth++; continue; }
    if (ch === ')') { if (depth === 0) break; depth--; continue; }
  }
  return false;
}

/**
 * Validate nested action calls within a function's arguments (Cat-38).
 * Finds function-call patterns inside the argument list and validates them.
 */
function validateNestedCalls(
  callText: string,
  outerName: string,
  lineNum: number,
  colNum: number,
  diagnostics: LspDiagnostic[],
): void {
  // Extract argument region (inside the outer parens)
  const firstParen = callText.indexOf('(');
  if (firstParen === -1) return;
  const argRegion = callText.substring(firstParen + 1);

  // Find nested function calls: Name( pattern
  const nestedRe = /([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  let m;
  while ((m = nestedRe.exec(argRegion)) !== null) {
    const nestedName = m[1];
    const isKnownAction = ACTIONS.hasOwnProperty(nestedName);
    if (!isKnownAction) continue;

    // Extract the nested call text (string-aware)
    const nestedStart = m.index;
    let depth = 0;
    let inStr = false;
    let strChar = '';
    let nestedEnd = nestedStart;
    for (let i = nestedStart; i < argRegion.length; i++) {
      const ch = argRegion[i];
      if (inStr) {
        if (ch === '\\') { i++; continue; }
        if (ch === strChar) { inStr = false; }
        continue;
      }
      if (ch === '"' || ch === "'") { inStr = true; strChar = ch; continue; }
      if (ch === '(') { depth++; continue; }
      if (ch === ')') {
        depth--;
        if (depth === 0) { nestedEnd = i + 1; break; }
      }
    }
    const nestedCallText = argRegion.substring(nestedStart, nestedEnd);
    const nestedParams = extractTopLevelParams(nestedCallText);

    const rule = VALIDATION_RULES[nestedName];
    if (rule) {
      for (const param of rule.requiredParams) {
        if (!nestedParams.includes(param)) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
              start: { line: lineNum, character: colNum },
              end: { line: lineNum, character: colNum + outerName.length },
            },
            message: `${nestedName}: missing required parameter '${param}' (in nested call within ${outerName})`,
            source: 'newo-dsl',
          });
        }
      }
    }
  }
}
