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
    this.builtinNames = new Set(names);
    const builtinPattern = names.join('|');

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

      // Built-in function calls (dynamically built from schema)
      builtinCall: new RegExp(`(${builtinPattern})\\s*\\(`, 'g'),

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

    // Track multi-line {# ... #} comment state
    let inBlockComment = false;

    // Parse line by line for accurate position reporting
    lines.forEach((line, lineIndex) => {
      const lineNum = lineIndex + 1;

      // Handle multi-line {# ... #} comments
      if (inBlockComment) {
        const closeIdx = line.indexOf('#}');
        if (closeIdx >= 0) {
          inBlockComment = false;
          // Process only the portion after the comment close
          line = line.substring(closeIdx + 2);
        } else {
          return; // Entire line inside comment, skip
        }
      }

      // Check for comment open on this line
      const commentOpenIdx = line.indexOf('{#');
      if (commentOpenIdx >= 0) {
        const commentCloseIdx = line.indexOf('#}', commentOpenIdx + 2);
        if (commentCloseIdx >= 0) {
          // Single-line comment: strip it out and process the rest
          line = line.substring(0, commentOpenIdx) + line.substring(commentCloseIdx + 2);
        } else {
          // Multi-line comment starts: process only the portion before it
          line = line.substring(0, commentOpenIdx);
          inBlockComment = true;
        }
      }

      // Extract expressions {{ ... }}
      this.extractExpressions(line, lineNum, result);

      // Extract statements {% ... %}
      this.extractStatements(line, lineNum, result, definedVars);

      // Check for per-line syntax errors (typos only - brace checks moved to document level)
      this.checkSyntaxErrors(line, lineNum, result);
    });

    // Document-level brace balance checks (context-aware to avoid FPs)
    this.checkDocumentBraces(content, result);

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

    // Extract other function calls (skip if inside string literals)
    const funcPattern = new RegExp(this.patterns.functionCall.source, 'g');
    while ((match = funcPattern.exec(expr)) !== null) {
      const funcName = match[1];

      // Skip function-like patterns inside string arguments
      if (this._isInsideString(expr, match.index)) continue;

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
      // Only treat as keyword if name is a simple identifier (no parens or nested calls)
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
        const value = param.substring(eqIndex + 1).trim();
        return { name, value, type: 'keyword' };
      }
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
   * Check for per-line syntax errors (typos only)
   */
  checkSyntaxErrors(line, lineNum, result) {
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
   * Document-level brace balance checking (context-aware).
   * Counts {{ / }} and {% / %} pairs while skipping:
   * - String literals (" and ')
   * - Comment blocks {# ... #}
   * - Statement blocks when counting expressions (and vice versa)
   * - Dict literal braces {} inside {{ }} expressions
   */
  checkDocumentBraces(content, result) {
    // Count expression braces {{ }}
    const expr = this._countExpressionBraces(content);
    if (expr.open !== expr.close) {
      result.diagnostics.push({
        severity: 'error',
        code: 'E001',
        message: `Unbalanced expression braces: ${expr.open} {{ vs ${expr.close} }}`,
        line: 1,
        column: 1
      });
    }

    // Count statement braces {% %}
    const stmt = this._countStatementBraces(content);
    if (stmt.open !== stmt.close) {
      result.diagnostics.push({
        severity: 'error',
        code: 'E002',
        message: `Unbalanced statement braces: ${stmt.open} {% vs ${stmt.close} %}`,
        line: 1,
        column: 1
      });
    }
  }

  /**
   * Context-aware expression brace counter.
   * Tracks string, comment, statement, and dict contexts.
   */
  _countExpressionBraces(text) {
    let open = 0;
    let close = 0;
    let inString = false;
    let stringChar = '';
    let inComment = false;    // {# ... #}
    let inStatement = false;  // {% ... %}
    let inExpression = false; // {{ ... }}
    let braceDepth = 0;       // dict {} depth inside expressions

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = i + 1 < text.length ? text[i + 1] : '';

      // String handling (not inside comments)
      if (!inComment) {
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

      // Comment blocks {# ... #}
      if (!inComment && !inStatement && !inExpression && ch === '{' && next === '#') {
        inComment = true;
        i++;
        continue;
      }
      if (inComment) {
        if (ch === '#' && next === '}') { inComment = false; i++; }
        continue;
      }

      // Statement blocks {% ... %}
      if (!inStatement && !inExpression && ch === '{' && next === '%') {
        // Check for block-form {% set var %}...{% endset %} (no = sign)
        // Content between is raw text where }} should not be counted
        const stmtEnd = text.indexOf('%}', i + 2);
        if (stmtEnd !== -1) {
          const stmtContent = text.substring(i + 2, stmtEnd).trim();
          // Block-form set: {% set varname %} (no = sign, just "set varname")
          if (/^-?\s*set\s+[A-Za-z_]\w*\s*-?$/.test(stmtContent)) {
            // Skip to {% endset %}
            const endsetRe = /\{%-?\s*endset\s*-?%\}/g;
            endsetRe.lastIndex = stmtEnd + 2;
            const endsetMatch = endsetRe.exec(text);
            if (endsetMatch) {
              i = endsetMatch.index + endsetMatch[0].length - 1;
              continue;
            }
          }
        }
        inStatement = true;
        i++;
        continue;
      }
      if (inStatement) {
        if (ch === '%' && next === '}') { inStatement = false; i++; }
        continue;
      }

      // Expression blocks {{ ... }}
      if (!inExpression && ch === '{' && next === '{') {
        open++;
        inExpression = true;
        braceDepth = 0;
        i++; // skip second {
        continue;
      }

      if (inExpression) {
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
        continue;
      }

      // Orphaned }} at top level
      if (ch === '}' && next === '}') {
        close++;
        i++;
      }
    }

    return { open, close };
  }

  /**
   * Context-aware statement brace counter.
   * Skips string literals, comments, and expression blocks.
   */
  _countStatementBraces(text) {
    let open = 0;
    let close = 0;
    let inString = false;
    let stringChar = '';
    let inComment = false;
    let inExpression = false;
    let exprBraceDepth = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = i + 1 < text.length ? text[i + 1] : '';

      // String handling (not inside comments)
      if (!inComment) {
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

      // Comments {# ... #}
      if (!inComment && !inExpression && ch === '{' && next === '#') {
        inComment = true;
        i++;
        continue;
      }
      if (inComment) {
        if (ch === '#' && next === '}') { inComment = false; i++; }
        continue;
      }

      // Expression blocks {{ ... }} - skip entirely
      if (!inExpression && ch === '{' && next === '{') {
        inExpression = true;
        exprBraceDepth = 0;
        i++;
        continue;
      }
      if (inExpression) {
        if (ch === '{') { exprBraceDepth++; continue; }
        if (ch === '}') {
          if (exprBraceDepth > 0) { exprBraceDepth--; continue; }
          if (next === '}') { inExpression = false; i++; }
        }
        continue;
      }

      // Count statement braces
      if (ch === '{' && next === '%') { open++; i++; continue; }
      if (ch === '%' && next === '}') { close++; i++; continue; }
    }

    return { open, close };
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
    if (this.builtinNames.has(name)) return true;
    const jinjaGlobals = ['json', 'range', 'dict', 'list'];
    return jinjaGlobals.includes(name);
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
