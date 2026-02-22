/**
 * Adapter for template-lint compatibility.
 *
 * Translates between the template-lint CLI parser interface and
 * the @newo-dsl/analyzer JinjaParser, allowing the CLI linter
 * to use the same parser as the LSP server.
 */

import { JinjaParser } from '../parsers/jinja-parser';
import type { ParseResult, FunctionCall, Diagnostic, Block } from '../types';

export interface LintParseResult {
  expressions: Array<{
    content: string;
    line: number;
    column: number;
  }>;
  statements: Array<{
    content: string;
    type: string;
    line: number;
    column: number;
  }>;
  functionCalls: Array<{
    name: string;
    params: Array<{ name?: string; value: string }>;
    line: number;
    column: number;
  }>;
  variables: {
    defined: string[];
    referenced: string[];
  };
  blocks: Array<{
    name: string;
    type: 'open' | 'close';
    args?: string;
    line: number;
    column: number;
  }>;
  errors: Array<{
    code: string;
    message: string;
    severity: string;
    line: number;
    column: number;
  }>;
}

/**
 * Adapt JinjaParser output to template-lint format.
 */
export function adaptForLint(content: string, filePath?: string): LintParseResult {
  const parser = new JinjaParser();
  const result = parser.parse(content, filePath);

  return {
    expressions: [],
    statements: [],
    functionCalls: result.functionCalls.map(fc => ({
      name: fc.name,
      params: fc.parameters.map(p => ({ name: p.name, value: p.value })),
      line: fc.range.start.line,
      column: fc.range.start.column,
    })),
    variables: {
      defined: result.variables.defined.map(v => v.name),
      referenced: result.variables.referenced.map(v => v.name),
    },
    blocks: result.blocks.map(b => ({
      name: b.name,
      type: b.type,
      args: b.args,
      line: b.range.start.line,
      column: b.range.start.column,
    })),
    errors: result.diagnostics.map(d => ({
      code: d.code,
      message: d.message,
      severity: d.severity,
      line: d.range.start.line,
      column: d.range.start.column,
    })),
  };
}
