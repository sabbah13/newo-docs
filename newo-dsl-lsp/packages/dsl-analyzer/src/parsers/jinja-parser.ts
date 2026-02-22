/**
 * Improved Jinja Template Parser for Newo DSL
 *
 * Handles multi-line statements properly by tokenizing the entire content.
 */

import {
  Diagnostic,
  ParseResult,
  FunctionCall,
  Variable,
  Parameter,
  Range,
  Position
} from '../types';

import { ACTIONS } from '@newo-dsl/data';

interface Token {
  type: 'expression' | 'statement' | 'comment' | 'text' | 'guidance_open' | 'guidance_close';
  content: string;
  range: Range;
}

// Guidance block names (used in {{#block}} / {{/block}} syntax)
const GUIDANCE_BLOCKS = new Set([
  'system', 'user', 'assistant', 'each', 'if', 'unless',
  'select', 'gen', 'geneach', 'block', 'role'
]);

// Built-in function names - derived from @newo-dsl/data to stay in sync
const BUILTINS = new Set(Object.keys(ACTIONS));

// Jinja keywords
const KEYWORDS = new Set([
  'if', 'else', 'elif', 'endif', 'for', 'endfor', 'in', 'not', 'and', 'or',
  'set', 'macro', 'endmacro', 'block', 'endblock', 'extends', 'include',
  'import', 'from', 'as', 'with', 'without', 'context', 'true', 'false',
  'none', 'is', 'defined', 'undefined', 'range', 'dict', 'list'
]);

// Python/Jinja filters
const FILTERS = new Set([
  'abs', 'attr', 'batch', 'capitalize', 'center', 'default', 'd',
  'dictsort', 'escape', 'e', 'filesizeformat', 'first', 'float',
  'forceescape', 'format', 'groupby', 'indent', 'int', 'join',
  'last', 'length', 'list', 'lower', 'map', 'max', 'min', 'pprint',
  'random', 'reject', 'rejectattr', 'replace', 'reverse', 'round',
  'safe', 'select', 'selectattr', 'slice', 'sort', 'string', 'striptags',
  'sum', 'title', 'trim', 'truncate', 'unique', 'upper', 'urlencode',
  'urlize', 'wordcount', 'wordwrap', 'xmlattr', 'tojson', 'strip',
  'loads', 'dumps', 'append', 'startswith', 'endswith', 'split'
]);

export class JinjaParser {
  private content: string = '';
  private lines: string[] = [];

  /**
   * Parse a Jinja template
   */
  parse(content: string, filePath: string = 'unknown'): ParseResult {
    this.content = content;
    this.lines = content.split('\n');

    const result: ParseResult = {
      filePath,
      languageId: 'newo-jinja',
      functionCalls: [],
      skillCalls: [],
      builtinCalls: [],
      variables: {
        defined: [],
        referenced: []
      },
      blocks: [],
      diagnostics: []
    };

    const definedVars = new Set<string>(['true', 'false', 'none', 'json', '_']);

    // Tokenize content
    const tokens = this.tokenize();

    // Process tokens
    const blockStack: Array<{ name: string; range: Range }> = [];

    for (const token of tokens) {
      if (token.type === 'expression') {
        this.processExpression(token, result, definedVars);
      } else if (token.type === 'statement') {
        this.processStatement(token, result, definedVars);
      } else if (token.type === 'guidance_open') {
        const blockMatch = token.content.match(/^#(\w+)(.*)/);
        if (blockMatch) {
          const blockName = blockMatch[1];
          const args = blockMatch[2]?.trim() || undefined;
          result.blocks.push({
            name: blockName,
            args,
            type: 'open',
            range: token.range
          });
          blockStack.push({ name: blockName, range: token.range });
        }
      } else if (token.type === 'guidance_close') {
        const blockMatch = token.content.match(/^\/(\w+)/);
        if (blockMatch) {
          const blockName = blockMatch[1];
          result.blocks.push({
            name: blockName,
            type: 'close',
            range: token.range
          });
          if (blockStack.length === 0) {
            result.diagnostics.push({
              severity: 'error',
              code: 'E011',
              message: `Unexpected closing block '{{/${blockName}}}' - no matching opening block`,
              range: token.range,
              source: 'newo-lint'
            });
          } else {
            const top = blockStack[blockStack.length - 1];
            if (top.name !== blockName) {
              result.diagnostics.push({
                severity: 'error',
                code: 'E012',
                message: `Mismatched block: expected '{{/${top.name}}}' but found '{{/${blockName}}}'`,
                range: token.range,
                source: 'newo-lint'
              });
            }
            blockStack.pop();
          }
        }
      }
    }

    // Check for unclosed guidance blocks
    for (const unclosed of blockStack) {
      result.diagnostics.push({
        severity: 'error',
        code: 'E010',
        message: `Unclosed guidance block '{{#${unclosed.name}}}' - missing '{{/${unclosed.name}}}'`,
        range: unclosed.range,
        source: 'newo-lint'
      });
    }

    // Check for unclosed braces (document-level)
    this.checkDocumentSyntax(result);

    return result;
  }

  /**
   * Tokenize the template content
   */
  private tokenize(): Token[] {
    const tokens: Token[] = [];
    let pos = 0;

    while (pos < this.content.length) {
      // Check for guidance block open {{#blockName ...}} or close {{/blockName}}
      if (this.content.slice(pos, pos + 2) === '{{') {
        const afterBrace = this.content.slice(pos + 2).replace(/^~?\s*/, '');
        const guidanceOpenMatch = afterBrace.match(/^#(\w+)/);
        const guidanceCloseMatch = afterBrace.match(/^\/(\w+)/);

        if (guidanceOpenMatch && GUIDANCE_BLOCKS.has(guidanceOpenMatch[1])) {
          const closeIdx = this.findClosingBrace(pos + 2, '}}');
          if (closeIdx !== -1) {
            const content = this.content.slice(pos + 2, closeIdx).trim().replace(/^~?\s*/, '');
            tokens.push({
              type: 'guidance_open',
              content,
              range: this.getRange(pos, closeIdx + 2)
            });
            pos = closeIdx + 2;
            continue;
          }
        }

        if (guidanceCloseMatch && GUIDANCE_BLOCKS.has(guidanceCloseMatch[1])) {
          const closeIdx = this.findClosingBrace(pos + 2, '}}');
          if (closeIdx !== -1) {
            const content = this.content.slice(pos + 2, closeIdx).trim().replace(/^~?\s*/, '');
            tokens.push({
              type: 'guidance_close',
              content,
              range: this.getRange(pos, closeIdx + 2)
            });
            pos = closeIdx + 2;
            continue;
          }
        }

        // Regular expression {{ ... }}
        const closeIdx = this.findClosingBrace(pos + 2, '}}');
        if (closeIdx !== -1) {
          const content = this.content.slice(pos + 2, closeIdx);
          tokens.push({
            type: 'expression',
            content: content.trim(),
            range: this.getRange(pos, closeIdx + 2)
          });
          pos = closeIdx + 2;
          continue;
        }
      }

      // Check for statement {% ... %}
      if (this.content.slice(pos, pos + 2) === '{%') {
        const closeIdx = this.findClosingStatement(pos + 2);
        if (closeIdx !== -1) {
          const content = this.content.slice(pos + 2, closeIdx);
          tokens.push({
            type: 'statement',
            content: content.trim(),
            range: this.getRange(pos, closeIdx + 2)
          });
          pos = closeIdx + 2;
          continue;
        }
      }

      // Check for comment {# ... #}
      if (this.content.slice(pos, pos + 2) === '{#') {
        const closeIdx = this.content.indexOf('#}', pos + 2);
        if (closeIdx !== -1) {
          tokens.push({
            type: 'comment',
            content: this.content.slice(pos + 2, closeIdx),
            range: this.getRange(pos, closeIdx + 2)
          });
          pos = closeIdx + 2;
          continue;
        }
      }

      pos++;
    }

    return tokens;
  }

  /**
   * Find closing brace handling nested content
   */
  private findClosingBrace(start: number, closingStr: string): number {
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = start; i < this.content.length - closingStr.length + 1; i++) {
      const char = this.content[i];

      // Handle strings
      if ((char === '"' || char === "'") && (i === 0 || this.content[i - 1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
        continue;
      }

      if (inString) continue;

      // Handle nested braces
      if (char === '(' || char === '[' || char === '{') {
        depth++;
      } else if (char === ')' || char === ']' || char === '}') {
        if (depth > 0) depth--;
      }

      // Check for closing string
      if (depth === 0 && this.content.slice(i, i + closingStr.length) === closingStr) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Find closing statement tag %}
   */
  private findClosingStatement(start: number): number {
    let inString = false;
    let stringChar = '';

    for (let i = start; i < this.content.length - 1; i++) {
      const char = this.content[i];

      // Handle strings
      if ((char === '"' || char === "'") && (i === 0 || this.content[i - 1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
        continue;
      }

      if (inString) continue;

      if (this.content.slice(i, i + 2) === '%}') {
        return i;
      }
    }

    return -1;
  }

  /**
   * Convert character position to line:column range
   */
  private getRange(start: number, end: number): Range {
    let line = 0;
    let col = 0;
    let startPos: Position = { line: 1, column: 1 };
    let endPos: Position = { line: 1, column: 1 };

    for (let i = 0; i < end && i < this.content.length; i++) {
      if (i === start) {
        startPos = { line: line + 1, column: col + 1 };
      }
      if (i === end - 1) {
        endPos = { line: line + 1, column: col + 2 };
      }

      if (this.content[i] === '\n') {
        line++;
        col = 0;
      } else {
        col++;
      }
    }

    return { start: startPos, end: endPos };
  }

  /**
   * Process expression token {{ ... }}
   */
  private processExpression(token: Token, result: ParseResult, definedVars: Set<string>): void {
    const expr = token.content;

    // Extract function calls (also detects Set(name="x") as variable definitions)
    this.extractFunctionCalls(expr, token.range, result);

    // Extract variable references from expressions
    this.extractVariableReferences(expr, token.range, result, definedVars);
  }

  /**
   * Process statement token {% ... %}
   */
  private processStatement(token: Token, result: ParseResult, definedVars: Set<string>): void {
    // Strip whitespace-control operators (-) from statement content
    const stmt = token.content.replace(/^-\s*/, '').replace(/\s*-$/, '');

    // Extract variable definitions from set statements
    const setMatch = /^set\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/i.exec(stmt);
    if (setMatch) {
      const varName = setMatch[1];
      definedVars.add(varName);
      result.variables.defined.push({
        name: varName,
        range: token.range,
        defined: true
      });

      // Also extract function calls from the value part
      const valueStart = stmt.indexOf('=') + 1;
      const value = stmt.slice(valueStart);
      this.extractFunctionCalls(value, token.range, result);

      // Extract variable references from the value part
      this.extractVariableReferences(value, token.range, result, definedVars);
    } else {
      // For non-set statements (if, for, etc.), extract function calls from the whole statement
      // Skip the keyword at the start
      const keywordMatch = /^(if|elif|for)\s+/i.exec(stmt);
      if (keywordMatch) {
        const afterKeyword = stmt.slice(keywordMatch[0].length);
        this.extractFunctionCalls(afterKeyword, token.range, result);
        this.extractVariableReferences(afterKeyword, token.range, result, definedVars);
      }
    }

    // Extract loop variables
    const forMatch = /^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in/i.exec(stmt);
    if (forMatch) {
      definedVars.add(forMatch[1]);
      definedVars.add('loop');  // Jinja loop variable
      result.variables.defined.push({
        name: forMatch[1],
        range: token.range,
        defined: true
      });
      result.variables.defined.push({
        name: 'loop',
        range: token.range,
        defined: true
      });
    }
  }

  /**
   * Extract function calls from an expression.
   * Also detects Set(name="x") calls as variable definitions.
   */
  private extractFunctionCalls(expr: string, exprRange: Range, result: ParseResult): void {
    // Pattern to match function calls: FunctionName(...)
    const funcPattern = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
    let match;

    while ((match = funcPattern.exec(expr)) !== null) {
      const funcName = match[1];

      // Skip keywords and filters, but NOT if the name matches a known builtin action
      // (e.g., 'Set' is both a keyword and a builtin action - the capital S form is the action)
      if (!BUILTINS.has(funcName)) {
        if (KEYWORDS.has(funcName.toLowerCase()) || FILTERS.has(funcName.toLowerCase())) {
          continue;
        }
      }

      // Parse parameters
      const params = this.extractParameters(expr, match.index + funcName.length);

      // Determine function type
      let type: 'skill' | 'builtin' | 'unknown' = 'unknown';
      if (funcName.endsWith('Skill')) {
        type = 'skill';
      } else if (BUILTINS.has(funcName)) {
        type = 'builtin';
      }

      const funcCall: FunctionCall = {
        name: funcName,
        type,
        parameters: params,
        range: exprRange
      };

      result.functionCalls.push(funcCall);

      if (type === 'skill') {
        result.skillCalls.push(funcCall);
      } else if (type === 'builtin') {
        result.builtinCalls.push(funcCall);
      }

      // Detect Set(name="x") as a variable definition
      if (funcName === 'Set') {
        const nameParam = params.find(p => p.name === 'name');
        if (nameParam) {
          // Strip quotes from the value
          const varName = nameParam.value.replace(/^["']|["']$/g, '');
          if (varName && /^[A-Za-z_][A-Za-z0-9_]*$/.test(varName)) {
            result.variables.defined.push({
              name: varName,
              range: exprRange,
              defined: true
            });
          }
        }
      }
    }
  }

  /**
   * Extract variable references from an expression.
   * Identifies bare identifiers that are not function calls, keywords, or filters.
   */
  private extractVariableReferences(expr: string, exprRange: Range, result: ParseResult, definedVars: Set<string>): void {
    // Match identifiers that are NOT followed by ( (those are function calls)
    // Also handle dot-access (e.g., user.name - only capture the root "user")
    const identPattern = /\b([A-Za-z_][A-Za-z0-9_]*)\b/g;
    let match;
    const seen = new Set<string>();

    while ((match = identPattern.exec(expr)) !== null) {
      const name = match[1];

      // Skip if already seen in this expression
      if (seen.has(name)) continue;
      seen.add(name);

      // Skip keywords, filters, builtins, and well-known constants
      if (KEYWORDS.has(name.toLowerCase()) || FILTERS.has(name.toLowerCase()) || BUILTINS.has(name)) {
        continue;
      }

      // Skip if followed by ( - it's a function call, not a variable reference
      const afterIdx = match.index + name.length;
      const afterChar = expr.slice(afterIdx).match(/^\s*(.)/);
      if (afterChar && afterChar[1] === '(') {
        continue;
      }

      // Skip string literals - check if this match is inside quotes
      if (this.isInsideString(expr, match.index)) {
        continue;
      }

      // Skip if preceded by . (it's a property access, not a root variable)
      if (match.index > 0 && expr[match.index - 1] === '.') {
        continue;
      }

      // Skip if followed by = (it's a keyword argument name, e.g. eventIdn="...")
      // but not if followed by == (comparison)
      const afterIdentIdx = match.index + name.length;
      if (afterIdentIdx < expr.length) {
        if (/^\s*=(?!=)/.test(expr.slice(afterIdentIdx))) {
          continue;
        }
      }

      result.variables.referenced.push({
        name,
        range: exprRange,
        defined: false
      });
    }
  }

  /**
   * Check if a position in a string is inside a quoted string literal.
   */
  private isInsideString(text: string, pos: number): boolean {
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

  /**
   * Extract parameters from function call
   */
  private extractParameters(expr: string, startIndex: number): Parameter[] {
    const params: Parameter[] = [];
    let depth = 0;
    let currentParam = '';
    let inString = false;
    let stringChar = '';

    for (let i = startIndex; i < expr.length; i++) {
      const char = expr[i];

      // Handle strings
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
  private parseParameter(param: string): Parameter {
    const eqIndex = param.indexOf('=');
    if (eqIndex > 0) {
      const beforeEq = param.substring(0, eqIndex).trim();
      // Make sure it's a valid identifier (not a comparison)
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(beforeEq) && !param.includes('==')) {
        return {
          name: beforeEq,
          value: param.substring(eqIndex + 1).trim(),
          type: 'keyword'
        };
      }
    }
    return { value: param, type: 'positional' };
  }

  /**
   * Check document-level syntax
   */
  private checkDocumentSyntax(result: ParseResult): void {
    // Count opening and closing tags
    const openExpr = (this.content.match(/\{\{/g) || []).length;
    const closeExpr = (this.content.match(/\}\}/g) || []).length;
    const openStmt = (this.content.match(/\{%/g) || []).length;
    const closeStmt = (this.content.match(/%\}/g) || []).length;
    // Count comment braces, but exclude {# inside {{ (e.g., {{#system}})
    const openComment = (this.content.match(/(?<!\{)\{#/g) || []).length;
    const closeComment = (this.content.match(/#\}(?!\})/g) || []).length;

    if (openExpr !== closeExpr) {
      result.diagnostics.push({
        severity: 'error',
        code: 'E001',
        message: `Unbalanced expression braces: ${openExpr} {{ vs ${closeExpr} }}`,
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
        source: 'newo-lint'
      });
    }

    if (openStmt !== closeStmt) {
      result.diagnostics.push({
        severity: 'error',
        code: 'E002',
        message: `Unbalanced statement braces: ${openStmt} {% vs ${closeStmt} %}`,
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
        source: 'newo-lint'
      });
    }

    if (openComment !== closeComment) {
      result.diagnostics.push({
        severity: 'error',
        code: 'E003',
        message: `Unbalanced comment braces: ${openComment} {# vs ${closeComment} #}`,
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
        source: 'newo-lint'
      });
    }
  }
}

export default JinjaParser;
