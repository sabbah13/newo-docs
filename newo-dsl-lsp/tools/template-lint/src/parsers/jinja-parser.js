/**
 * Jinja Template Parser for Newo DSL
 *
 * Extracts:
 * - Function calls (skill invocations, built-ins)
 * - Variable assignments and references
 * - Control flow structures
 * - Comments
 */

class JinjaParser {
  constructor() {
    // Regex patterns for Jinja syntax
    this.patterns = {
      // {{ expression }} - expressions/function calls
      expression: /\{\{([^}]+)\}\}/g,

      // {% statement %} - control flow
      statement: /\{%([^%]+)%\}/g,

      // {# comment #} - comments
      comment: /\{#([^#]+)#\}/g,

      // {{!-- comment --}} - alternative comments
      altComment: /\{\{!--([^-]+)--\}\}/g,

      // Function call pattern: FunctionName(args)
      functionCall: /([A-Za-z_][A-Za-z0-9_]*)\s*\(/g,

      // Variable assignment: {% set var = value %}
      setStatement: /set\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/gi,

      // For loop: {% for item in iterable %}
      forLoop: /for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+([^%]+)/gi,

      // If statement: {% if condition %}
      ifStatement: /if\s+(.+)/gi,

      // Variable reference (simple): just a name
      variable: /\b([A-Za-z_][A-Za-z0-9_]*)\b/g,

      // Skill call pattern: _skillName() or SkillName()
      skillCall: /\b(_?[A-Za-z][A-Za-z0-9_]*Skill)\s*\(/g,

      // Built-in function calls
      builtinCall: /(Return|Set|GetTriggeredAct|GetCurrentPrompt|GetCustomerAttribute|SetCustomerAttribute|GetPersonaAttribute|SetPersonaAttribute|SendSystemEvent|SendCommand|SendMessage|CreateConnector|SetConnectorInfo|GetDatetime|GetValueJSON|GetItemsArrayByIndexesJSON|Stringify|Concat|IsEmpty|StartNotInterruptibleBlock|StopNotInterruptibleBlock|DUMMY)\s*\(/g,

      // Parameter pattern: name=value
      parameter: /([A-Za-z_][A-Za-z0-9_]*)\s*=/g
    };
  }

  /**
   * Parse a Jinja template file
   * @param {string} content - Template content
   * @param {string} filePath - File path for error reporting
   * @returns {object} Parse result with extracted elements and diagnostics
   */
  parse(content, filePath = 'unknown') {
    const result = {
      filePath,
      expressions: [],
      statements: [],
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

    // Track defined variables for reference checking
    const definedVars = new Set(['true', 'false', 'none', 'json']);

    // Parse line by line for accurate position reporting
    lines.forEach((line, lineIndex) => {
      const lineNum = lineIndex + 1;

      // Extract expressions {{ ... }}
      this.extractExpressions(line, lineNum, result);

      // Extract statements {% ... %}
      this.extractStatements(line, lineNum, result, definedVars);

      // Check for syntax errors
      this.checkSyntaxErrors(line, lineNum, result);
    });

    // Cross-reference variables
    this.analyzeVariables(result, definedVars);

    return result;
  }

  /**
   * Extract expression blocks {{ ... }}
   */
  extractExpressions(line, lineNum, result) {
    let match;
    const pattern = new RegExp(this.patterns.expression.source, 'g');

    while ((match = pattern.exec(line)) !== null) {
      const expr = match[1].trim();
      const col = match.index + 1;

      result.expressions.push({
        content: expr,
        line: lineNum,
        column: col,
        raw: match[0]
      });

      // Extract function calls from expression
      this.extractFunctionCalls(expr, lineNum, col, result);
    }
  }

  /**
   * Extract statement blocks {% ... %}
   */
  extractStatements(line, lineNum, result, definedVars) {
    let match;
    const pattern = new RegExp(this.patterns.statement.source, 'g');

    while ((match = pattern.exec(line)) !== null) {
      const stmt = match[1].trim();
      const col = match.index + 1;

      result.statements.push({
        content: stmt,
        line: lineNum,
        column: col,
        type: this.getStatementType(stmt)
      });

      // Extract variable definitions from set statements
      const setMatch = /^set\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/i.exec(stmt);
      if (setMatch) {
        const varName = setMatch[1];
        definedVars.add(varName);
        result.variables.defined.push({
          name: varName,
          line: lineNum,
          column: col
        });
      }

      // Extract loop variables
      const forMatch = /^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in/i.exec(stmt);
      if (forMatch) {
        definedVars.add(forMatch[1]);
        // Also add the underscore variable convention
        definedVars.add('_');
      }
    }
  }

  /**
   * Extract function calls from an expression
   */
  extractFunctionCalls(expr, lineNum, baseCol, result) {
    // Extract skill calls
    let match;
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

    // Extract other function calls (potentially custom functions)
    const funcPattern = new RegExp(this.patterns.functionCall.source, 'g');
    while ((match = funcPattern.exec(expr)) !== null) {
      const funcName = match[1];

      // Skip if already captured as skill or builtin
      const alreadyCaptured = result.functionCalls.some(
        fc => fc.name === funcName && fc.line === lineNum
      );

      if (!alreadyCaptured && !this.isJinjaKeyword(funcName)) {
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
   * Extract parameters from a function call
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
   * Parse a single parameter (name=value or positional)
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
   * Determine statement type
   */
  getStatementType(stmt) {
    const lower = stmt.toLowerCase();
    if (lower.startsWith('set ')) return 'set';
    if (lower.startsWith('if ')) return 'if';
    if (lower.startsWith('elif ')) return 'elif';
    if (lower === 'else') return 'else';
    if (lower === 'endif') return 'endif';
    if (lower.startsWith('for ')) return 'for';
    if (lower === 'endfor') return 'endfor';
    if (lower.startsWith('macro ')) return 'macro';
    if (lower === 'endmacro') return 'endmacro';
    if (lower.startsWith('block ')) return 'block';
    if (lower === 'endblock') return 'endblock';
    if (lower.startsWith('extends ')) return 'extends';
    if (lower.startsWith('include ')) return 'include';
    if (lower.startsWith('import ')) return 'import';
    return 'unknown';
  }

  /**
   * Check for syntax errors
   */
  checkSyntaxErrors(line, lineNum, result) {
    // Check for unclosed braces
    const openExpr = (line.match(/\{\{/g) || []).length;
    const closeExpr = (line.match(/\}\}/g) || []).length;
    if (openExpr !== closeExpr) {
      result.diagnostics.push({
        severity: 'error',
        code: 'E001',
        message: 'Unbalanced expression braces {{ }}',
        line: lineNum,
        column: 1
      });
    }

    const openStmt = (line.match(/\{%/g) || []).length;
    const closeStmt = (line.match(/%\}/g) || []).length;
    if (openStmt !== closeStmt) {
      result.diagnostics.push({
        severity: 'error',
        code: 'E002',
        message: 'Unbalanced statement braces {% %}',
        line: lineNum,
        column: 1
      });
    }

    // Check for common typos
    if (line.includes('{%if') || line.includes('{%for')) {
      result.diagnostics.push({
        severity: 'warning',
        code: 'W001',
        message: 'Missing space after {% in statement',
        line: lineNum,
        column: line.indexOf('{%') + 1
      });
    }
  }

  /**
   * Analyze variable usage
   */
  analyzeVariables(result, definedVars) {
    // Find all variable references in expressions
    for (const expr of result.expressions) {
      const refs = this.findVariableReferences(expr.content);
      for (const ref of refs) {
        if (!definedVars.has(ref) && !this.isBuiltinOrKeyword(ref)) {
          result.variables.referenced.push({
            name: ref,
            line: expr.line,
            column: expr.column,
            defined: false
          });
        }
      }
    }
  }

  /**
   * Find variable references in an expression
   */
  findVariableReferences(expr) {
    const refs = new Set();
    const pattern = /\b([a-z_][a-z0-9_]*)\b/gi;
    let match;

    while ((match = pattern.exec(expr)) !== null) {
      const name = match[1];
      if (!this.isBuiltinOrKeyword(name) && !this.isJinjaFilter(name)) {
        refs.add(name);
      }
    }

    return Array.from(refs);
  }

  /**
   * Check if name is a Jinja keyword
   */
  isJinjaKeyword(name) {
    const keywords = [
      'if', 'else', 'elif', 'endif', 'for', 'endfor', 'in', 'not', 'and', 'or',
      'set', 'macro', 'endmacro', 'block', 'endblock', 'extends', 'include',
      'import', 'from', 'as', 'with', 'without', 'context', 'true', 'false',
      'none', 'is', 'defined', 'undefined'
    ];
    return keywords.includes(name.toLowerCase());
  }

  /**
   * Check if name is a built-in or keyword
   */
  isBuiltinOrKeyword(name) {
    if (this.isJinjaKeyword(name)) return true;

    const builtins = [
      'Return', 'Set', 'GetTriggeredAct', 'GetCurrentPrompt',
      'GetCustomerAttribute', 'SetCustomerAttribute',
      'GetPersonaAttribute', 'SetPersonaAttribute',
      'SendSystemEvent', 'SendCommand', 'SendMessage',
      'CreateConnector', 'SetConnectorInfo',
      'GetDatetime', 'GetValueJSON', 'GetItemsArrayByIndexesJSON',
      'Stringify', 'Concat', 'IsEmpty',
      'StartNotInterruptibleBlock', 'StopNotInterruptibleBlock',
      'DUMMY', 'json', 'range', 'dict', 'list'
    ];
    return builtins.includes(name);
  }

  /**
   * Check if name is a Jinja filter
   */
  isJinjaFilter(name) {
    const filters = [
      'abs', 'attr', 'batch', 'capitalize', 'center', 'default', 'd',
      'dictsort', 'escape', 'e', 'filesizeformat', 'first', 'float',
      'forceescape', 'format', 'groupby', 'indent', 'int', 'join',
      'last', 'length', 'list', 'lower', 'map', 'max', 'min', 'pprint',
      'random', 'reject', 'rejectattr', 'replace', 'reverse', 'round',
      'safe', 'select', 'selectattr', 'slice', 'sort', 'string', 'striptags',
      'sum', 'title', 'trim', 'truncate', 'unique', 'upper', 'urlencode',
      'urlize', 'wordcount', 'wordwrap', 'xmlattr', 'tojson', 'strip',
      'loads', 'dumps', 'append'
    ];
    return filters.includes(name.toLowerCase());
  }
}

module.exports = JinjaParser;
