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
  constructor() {
    this.patterns = {
      // {{ expression }} - function calls and expressions
      expression: /\{\{([^}#/~][^}]*)\}\}/g,

      // {{#block}} ... {{/block}} - block structures
      blockOpen: /\{\{#(\w+)([^}]*)\}\}/g,
      blockClose: /\{\{\/(\w+)\}\}/g,

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

      // Built-in function pattern
      builtinCall: /(Return|Set|GetTriggeredAct|GetCurrentPrompt|GetCustomerAttribute|SetCustomerAttribute|GetPersonaAttribute|SetPersonaAttribute|SendSystemEvent|SendCommand|SendMessage|CreateConnector|SetConnectorInfo|GetDatetime|GetValueJSON|GetItemsArrayByIndexesJSON|Stringify|Concat|IsEmpty|StartNotInterruptibleBlock|StopNotInterruptibleBlock|DUMMY)\s*\(/g
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

      // Check for syntax errors
      this.checkSyntaxErrors(line, lineNum, result);
    });

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
   * Extract block structures
   */
  extractBlocks(line, lineNum, result, blockStack) {
    // Find block opens
    let match;
    const openPattern = new RegExp(this.patterns.blockOpen.source, 'g');

    while ((match = openPattern.exec(line)) !== null) {
      const blockName = match[1];
      const blockArgs = match[2].trim();
      const col = match.index + 1;

      // Validate block name
      if (!this.validBlocks.includes(blockName) && blockName !== 'if') {
        result.diagnostics.push({
          severity: 'warning',
          code: 'W010',
          message: `Unknown block type: ${blockName}`,
          line: lineNum,
          column: col
        });
      }

      const block = {
        name: blockName,
        args: blockArgs,
        line: lineNum,
        column: col,
        type: 'open'
      };

      result.blocks.push(block);

      // Don't push 'else' to stack as it's part of 'if'
      if (blockName !== 'else') {
        blockStack.push(block);
      }
    }

    // Find block closes
    const closePattern = new RegExp(this.patterns.blockClose.source, 'g');

    while ((match = closePattern.exec(line)) !== null) {
      const blockName = match[1];
      const col = match.index + 1;

      result.blocks.push({
        name: blockName,
        line: lineNum,
        column: col,
        type: 'close'
      });

      // Pop from stack and validate
      if (blockStack.length > 0) {
        const expected = blockStack.pop();
        if (expected.name !== blockName) {
          result.diagnostics.push({
            severity: 'error',
            code: 'E011',
            message: `Mismatched block close: expected {{/${expected.name}}}, got {{/${blockName}}}`,
            line: lineNum,
            column: col
          });
          // Push back if mismatched
          blockStack.push(expected);
        }
      } else {
        result.diagnostics.push({
          severity: 'error',
          code: 'E012',
          message: `Unexpected block close: {{/${blockName}}}`,
          line: lineNum,
          column: col
        });
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

    // Extract other function calls
    const funcPattern = new RegExp(this.patterns.functionCall.source, 'g');
    while ((match = funcPattern.exec(expr)) !== null) {
      const funcName = match[1];

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
   * Parse a single parameter
   */
  parseParameter(param) {
    const eqIndex = param.indexOf('=');
    if (eqIndex > 0 && !param.startsWith('"') && !param.startsWith("'")) {
      const name = param.substring(0, eqIndex).trim();
      const value = param.substring(eqIndex + 1).trim();
      return { name, value, type: 'keyword' };
    }
    return { value: param, type: 'positional' };
  }

  /**
   * Check for syntax errors
   */
  checkSyntaxErrors(line, lineNum, result) {
    // Check for unbalanced braces
    const openCount = (line.match(/\{\{/g) || []).length;
    const closeCount = (line.match(/\}\}/g) || []).length;

    if (openCount !== closeCount) {
      result.diagnostics.push({
        severity: 'error',
        code: 'E020',
        message: 'Unbalanced expression braces {{ }}',
        line: lineNum,
        column: 1
      });
    }

    // Check for {{# without matching }}
    const blockOpens = (line.match(/\{\{#/g) || []).length;
    const hasProperClose = line.match(/\{\{#[^}]+\}\}/g)?.length || 0;
    if (blockOpens > hasProperClose) {
      result.diagnostics.push({
        severity: 'error',
        code: 'E021',
        message: 'Unclosed block tag on line',
        line: lineNum,
        column: line.indexOf('{{#') + 1
      });
    }
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
