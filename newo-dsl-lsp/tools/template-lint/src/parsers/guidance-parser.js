/**
 * Guidance Template Parser for Newo DSL
 *
 * Guidance templates use a Handlebars-like syntax with LLM-specific blocks.
 *
 * Extracts:
 * - Function calls (Set, Return, skill calls)
 * - Block structures (#system, #user, #assistant, #if)
 * - Variable references
 */

class GuidanceParser {
  /**
   * @param {string[]|null} builtinNames - Built-in function names from schema (null = use hardcoded fallback)
   */
  constructor(builtinNames = null) {
    const defaultBuiltins = [
      'Return', 'Set', 'GetTriggeredAct', 'GetCurrentPrompt',
      'GetCustomerAttribute', 'SetCustomerAttribute', 'GetPersonaAttribute', 'SetPersonaAttribute',
      'SendSystemEvent', 'SendCommand', 'SendMessage', 'CreateConnector', 'SetConnectorInfo',
      'GetDatetime', 'GetValueJSON', 'GetItemsArrayByIndexesJSON', 'Stringify', 'Concat', 'IsEmpty',
      'StartNotInterruptibleBlock', 'StopNotInterruptibleBlock', 'DUMMY'
    ];
    const names = builtinNames || defaultBuiltins;
    const builtinPattern = names.join('|');

    this.patterns = {
      // {{ expression }} - function calls and expressions (excludes blocks, comments, whitespace control)
      expression: /\{\{([^}#/~!][^}]*)\}\}/g,

      // {{#block}} ... {{/block}} - block structures (with optional ~ whitespace control)
      // Args capture allows } inside quoted strings (e.g. {{#if schema != "{}"}})
      blockOpen: /\{\{~?#(\w+)((?:[^}"']|"[^"]*"|'[^']*')*)~?\}\}/g,
      blockClose: /\{\{~?\/(\w+)~?\}\}/g,

      // {{~}} - whitespace control
      whitespaceControl: /\{\{~\}\}|\{\{~|~\}\}/g,

      // {{Set(...)}} - variable assignment
      setCall: /\{\{Set\s*\(([^)]+)\)\}\}/g,

      // {{Return(...)}} - return statement
      returnCall: /\{\{Return\s*\(([^)]*)\)\}\}/g,

      // Function call: FunctionName(args)
      functionCall: /([A-Za-z_][A-Za-z0-9_]*)\s*\(/g,

      // Skill call pattern
      skillCall: /\b(_?[A-Za-z][A-Za-z0-9_]*Skill)\s*\(/g,

      // Variable reference: {{variable}}
      variableRef: /\{\{([a-z_][a-z0-9_]*)\}\}/gi,

      // Built-in function pattern (dynamically built from schema)
      builtinCall: new RegExp(`(${builtinPattern})\\s*\\(`, 'g')
    };

    // Valid block types in Guidance
    this.validBlocks = ['system', 'user', 'assistant', 'if', 'else', 'each', 'unless', 'with'];
  }

  /**
   * Parse a Guidance template file
   * @param {string} content - Template content
   * @param {string} filePath - File path for error reporting
   * @returns {object} Parse result
   */
  parse(content, filePath = 'unknown') {
    const result = {
      filePath,
      expressions: [],
      blocks: [],
      functionCalls: [],
      skillCalls: [],
      builtinCalls: [],
      variables: {
        defined: [],
        referenced: []
      },
      diagnostics: []
    };

    const lines = content.split('\n');
    const blockStack = [];
    const definedVars = new Set();

    lines.forEach((line, lineIndex) => {
      const lineNum = lineIndex + 1;

      // Extract blocks
      this.extractBlocks(line, lineNum, result, blockStack);

      // Extract expressions
      this.extractExpressions(line, lineNum, result, definedVars);
    });

    // Document-level brace balance checks (context-aware to avoid FPs)
    this.checkDocumentBraces(content, result);

    // Check for unclosed blocks
    if (blockStack.length > 0) {
      for (const block of blockStack) {
        result.diagnostics.push({
          severity: 'error',
          code: 'E010',
          message: `Unclosed block: {{#${block.name}}}`,
          line: block.line,
          column: block.column
        });
      }
    }

    return result;
  }

  /**
   * Extract block structures.
   * Processes opens and closes in left-to-right document order within each line
   * to correctly handle patterns like {{~/system}}{{#assistant~}}{{~/assistant}}.
   */
  extractBlocks(line, lineNum, result, blockStack) {
    // Collect all block events (opens and closes) with their positions
    const events = [];
    let match;

    const openPattern = new RegExp(this.patterns.blockOpen.source, 'g');
    while ((match = openPattern.exec(line)) !== null) {
      events.push({
        type: 'open',
        name: match[1],
        args: match[2].trim(),
        index: match.index,
        col: match.index + 1
      });
    }

    const closePattern = new RegExp(this.patterns.blockClose.source, 'g');
    while ((match = closePattern.exec(line)) !== null) {
      events.push({
        type: 'close',
        name: match[1],
        index: match.index,
        col: match.index + 1
      });
    }

    // Sort by position (left to right)
    events.sort((a, b) => a.index - b.index);

    // Process in document order
    for (const event of events) {
      if (event.type === 'open') {
        // Validate block name
        if (!this.validBlocks.includes(event.name) && event.name !== 'if') {
          result.diagnostics.push({
            severity: 'warning',
            code: 'W010',
            message: `Unknown block type: ${event.name}`,
            line: lineNum,
            column: event.col
          });
        }

        const block = {
          name: event.name,
          args: event.args,
          line: lineNum,
          column: event.col,
          type: 'open'
        };

        result.blocks.push(block);

        // Don't push 'else' to stack as it's part of 'if'
        if (event.name !== 'else') {
          blockStack.push(block);
        }
      } else {
        // Close event
        result.blocks.push({
          name: event.name,
          line: lineNum,
          column: event.col,
          type: 'close'
        });

        // Pop from stack and validate
        if (blockStack.length > 0) {
          const expected = blockStack.pop();
          if (expected.name !== event.name) {
            result.diagnostics.push({
              severity: 'error',
              code: 'E011',
              message: `Mismatched block close: expected {{/${expected.name}}}, got {{/${event.name}}}`,
              line: lineNum,
              column: event.col
            });
            // Push back if mismatched
            blockStack.push(expected);
          }
        } else {
          result.diagnostics.push({
            severity: 'error',
            code: 'E012',
            message: `Unexpected block close: {{/${event.name}}}`,
            line: lineNum,
            column: event.col
          });
        }
      }
    }
  }

  /**
   * Extract expressions and function calls
   */
  extractExpressions(line, lineNum, result, definedVars) {
    let match;
    const pattern = new RegExp(this.patterns.expression.source, 'g');

    while ((match = pattern.exec(line)) !== null) {
      const expr = match[1].trim();
      const col = match.index + 1;

      // Skip whitespace control markers
      if (expr === '~' || expr.startsWith('~') || expr.endsWith('~')) {
        continue;
      }

      result.expressions.push({
        content: expr,
        line: lineNum,
        column: col,
        raw: match[0]
      });

      // Extract Set calls for variable tracking
      const setMatch = /^Set\s*\(\s*name\s*=\s*["']([^"']+)["']/.exec(expr);
      if (setMatch) {
        definedVars.add(setMatch[1]);
        result.variables.defined.push({
          name: setMatch[1],
          line: lineNum,
          column: col
        });
      }

      // Extract function calls
      this.extractFunctionCalls(expr, lineNum, col, result);
    }

    // Extract simple variable references
    const varPattern = new RegExp(this.patterns.variableRef.source, 'g');
    while ((match = varPattern.exec(line)) !== null) {
      const varName = match[1];
      const col = match.index + 1;

      // Skip if it's a function call or block
      if (!line.substring(match.index).match(/^\{\{[a-z_][a-z0-9_]*\s*\(/i) &&
          !line.substring(match.index).match(/^\{\{[#\/]/)) {
        result.variables.referenced.push({
          name: varName,
          line: lineNum,
          column: col,
          defined: definedVars.has(varName)
        });
      }
    }
  }

  /**
   * Extract function calls from an expression
   */
  extractFunctionCalls(expr, lineNum, baseCol, result) {
    let match;

    // Extract skill calls
    const skillPattern = new RegExp(this.patterns.skillCall.source, 'g');
    while ((match = skillPattern.exec(expr)) !== null) {
      const funcName = match[1];
      const params = this.extractParameters(expr, match.index + funcName.length);

      result.skillCalls.push({
        name: funcName,
        parameters: params,
        line: lineNum,
        column: baseCol + match.index
      });

      result.functionCalls.push({
        name: funcName,
        type: 'skill',
        parameters: params,
        line: lineNum,
        column: baseCol + match.index
      });
    }

    // Extract built-in calls
    const builtinPattern = new RegExp(this.patterns.builtinCall.source, 'g');
    while ((match = builtinPattern.exec(expr)) !== null) {
      const funcName = match[1];
      const params = this.extractParameters(expr, match.index + funcName.length);

      result.builtinCalls.push({
        name: funcName,
        parameters: params,
        line: lineNum,
        column: baseCol + match.index
      });

      result.functionCalls.push({
        name: funcName,
        type: 'builtin',
        parameters: params,
        line: lineNum,
        column: baseCol + match.index
      });
    }

    // Extract other function calls (skip if inside string literals)
    const funcPattern = new RegExp(this.patterns.functionCall.source, 'g');
    while ((match = funcPattern.exec(expr)) !== null) {
      const funcName = match[1];

      // Skip function-like patterns inside string arguments
      if (this._isInsideString(expr, match.index)) continue;

      const alreadyCaptured = result.functionCalls.some(
        fc => fc.name === funcName && fc.line === lineNum
      );

      if (!alreadyCaptured && !this.isGuidanceKeyword(funcName)) {
        result.functionCalls.push({
          name: funcName,
          type: 'unknown',
          line: lineNum,
          column: baseCol + match.index
        });
      }
    }
  }

  /**
   * Check if a position in text is inside a string literal.
   */
  _isInsideString(text, pos) {
    let inString = false;
    let stringChar = '';
    for (let i = 0; i < pos && i < text.length; i++) {
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
   * Extract parameters from function call
   */
  extractParameters(expr, startIndex) {
    const params = [];
    let depth = 0;
    let currentParam = '';
    let inString = false;
    let stringChar = '';

    for (let i = startIndex; i < expr.length; i++) {
      const char = expr[i];

      if ((char === '"' || char === "'") && (i === 0 || expr[i - 1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (!inString) {
        if (char === '(') {
          if (depth === 0) {
            depth++;
            continue;
          }
          depth++;
        } else if (char === ')') {
          depth--;
          if (depth === 0) {
            if (currentParam.trim()) {
              params.push(this.parseParameter(currentParam.trim()));
            }
            break;
          }
        } else if (char === ',' && depth === 1) {
          if (currentParam.trim()) {
            params.push(this.parseParameter(currentParam.trim()));
          }
          currentParam = '';
          continue;
        }
      }

      if (depth > 0) {
        currentParam += char;
      }
    }

    return params;
  }

  /**
   * Parse a single parameter.
   * Only recognizes name=value if name is a simple identifier (no parens, dots, etc.)
   */
  parseParameter(param) {
    const eqIndex = param.indexOf('=');
    if (eqIndex > 0 && !param.startsWith('"') && !param.startsWith("'")) {
      const name = param.substring(0, eqIndex).trim();
      // Only treat as keyword if name is a simple identifier (no parens or nested calls)
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
        const value = param.substring(eqIndex + 1).trim();
        return { name, value, type: 'keyword' };
      }
    }
    return { value: param, type: 'positional' };
  }

  /**
   * Document-level brace balance checking (context-aware).
   * Counts {{ / }} pairs while skipping:
   * - String literals (" and ')
   * - Guidance comments {{!-- ... --}}
   * - Whitespace control markers ({{~ and ~}})
   */
  checkDocumentBraces(content, result) {
    const braces = this._countExpressionBraces(content);
    if (braces.open !== braces.close) {
      result.diagnostics.push({
        severity: 'error',
        code: 'E020',
        message: `Unbalanced expression braces: ${braces.open} {{ vs ${braces.close} }}`,
        line: 1,
        column: 1
      });
    }
  }

  /**
   * Context-aware expression brace counter for Guidance templates.
   * Handles Guidance comments ({{!-- ... --}} and {{! ... }}), ~ whitespace control.
   * Only tracks string state inside expressions (not at top level, where
   * apostrophes in natural language text would cause false string mode).
   */
  _countExpressionBraces(text) {
    let open = 0;
    let close = 0;
    let inExpression = false;
    let inString = false;
    let stringChar = '';
    let braceDepth = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = i + 1 < text.length ? text[i + 1] : '';

      // At top level (outside expressions), only look for {{ and }}
      if (!inExpression) {
        if (ch === '{' && next === '{') {
          open++;
          i++; // skip second {

          // Check for Guidance comment patterns
          const afterOpen = i + 1 < text.length ? text[i + 1] : '';

          // {{!-- ... --}} long comment
          if (afterOpen === '!' && i + 3 < text.length && text[i + 2] === '-' && text[i + 3] === '-') {
            // Find the outermost --}} by scanning for --}} that is not followed by more comment content
            // Handle nested comments by counting depth
            let commentDepth = 1;
            let j = i + 4;
            while (j < text.length && commentDepth > 0) {
              if (j + 3 < text.length && text[j] === '{' && text[j + 1] === '{' &&
                  text[j + 2] === '!' && text[j + 3] === '-' && j + 4 < text.length && text[j + 4] === '-') {
                commentDepth++;
                j += 5;
              } else if (j + 3 < text.length && text[j] === '-' && text[j + 1] === '-' &&
                         text[j + 2] === '}' && text[j + 3] === '}') {
                commentDepth--;
                if (commentDepth === 0) {
                  close++;
                  i = j + 3;
                  break;
                }
                j += 4;
              } else {
                j++;
              }
            }
            continue;
          }

          // {{! ... }} short comment (single !)
          if (afterOpen === '!') {
            // Scan forward for the closing }}
            let j = i + 2;
            let cBraceDepth = 0;
            while (j < text.length) {
              if (text[j] === '{') { cBraceDepth++; }
              else if (text[j] === '}') {
                if (cBraceDepth > 0) { cBraceDepth--; }
                else if (j + 1 < text.length && text[j + 1] === '}') {
                  close++;
                  i = j + 1;
                  break;
                }
              }
              j++;
            }
            continue;
          }

          // Regular expression - enter expression mode
          inExpression = true;
          inString = false;
          braceDepth = 0;
          continue;
        }

        // Orphaned }} at top level
        if (ch === '}' && next === '}') {
          close++;
          i++;
        }
        continue;
      }

      // Inside an expression - track strings here (safe from natural language)
      if (inString) {
        if (ch === '\\') { i++; continue; }
        if (ch === stringChar) { inString = false; }
        continue;
      }
      if (ch === '"' || ch === "'") {
        inString = true;
        stringChar = ch;
        continue;
      }

      // Handle ~ whitespace control
      if (ch === '~' && next === '}') {
        continue;
      }
      if (ch === '{') { braceDepth++; continue; }
      if (ch === '}') {
        if (braceDepth > 0) { braceDepth--; continue; }
        if (next === '}') {
          close++;
          inExpression = false;
          i++;
          continue;
        }
        continue;
      }
    }

    return { open, close };
  }

  /**
   * Check if name is a Guidance keyword
   */
  isGuidanceKeyword(name) {
    const keywords = [
      'if', 'else', 'unless', 'each', 'with', 'system', 'user', 'assistant',
      'true', 'false', 'null', 'this'
    ];
    return keywords.includes(name.toLowerCase());
  }
}

module.exports = GuidanceParser;
