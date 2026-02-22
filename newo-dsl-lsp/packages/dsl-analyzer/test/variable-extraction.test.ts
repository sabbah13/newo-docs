/**
 * Tests for variable extraction in the Jinja parser.
 *
 * Covers: {% set %} extraction, Set(name="x") extraction,
 * for-loop variable tracking, and reference population.
 */

import { describe, it, expect } from 'vitest';
import { JinjaParser } from '../src/parsers/jinja-parser';

const parser = new JinjaParser();

// ---------------------------------------------------------------------------
// 1. {% set %} variable definitions
// ---------------------------------------------------------------------------

describe('Parser Variable Extraction - set statements', () => {
  it('extracts variable from simple set statement', () => {
    const result = parser.parse('{% set x = 1 %}');
    expect(result.variables.defined.length).toBeGreaterThanOrEqual(1);
    expect(result.variables.defined.some(v => v.name === 'x')).toBe(true);
  });

  it('extracts variable from set with function call', () => {
    const result = parser.parse('{% set user = GetUser() %}');
    expect(result.variables.defined.some(v => v.name === 'user')).toBe(true);
  });

  it('extracts variable from set with string value', () => {
    const result = parser.parse('{% set greeting = "hello world" %}');
    expect(result.variables.defined.some(v => v.name === 'greeting')).toBe(true);
  });

  it('extracts multiple set variables', () => {
    const result = parser.parse('{% set a = 1 %}\n{% set b = 2 %}\n{% set c = 3 %}');
    const names = result.variables.defined.map(v => v.name);
    expect(names).toContain('a');
    expect(names).toContain('b');
    expect(names).toContain('c');
  });

  it('extracts function calls from set value', () => {
    const result = parser.parse('{% set user = GetUser() %}');
    expect(result.builtinCalls.some(c => c.name === 'GetUser')).toBe(true);
  });

  it('handles whitespace-trimming set statements', () => {
    const result = parser.parse('{%- set x = 1 -%}');
    expect(result.variables.defined.some(v => v.name === 'x')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Set(name="x") variable definitions
// ---------------------------------------------------------------------------

describe('Parser Variable Extraction - Set() action calls', () => {
  it('extracts variable from Set(name="x") in expression', () => {
    const result = parser.parse('{{ Set(name="prefix", value="_") }}');
    expect(result.variables.defined.some(v => v.name === 'prefix')).toBe(true);
  });

  it('extracts variable from Set with single quotes', () => {
    const result = parser.parse("{{ Set(name='mode', value='active') }}");
    expect(result.variables.defined.some(v => v.name === 'mode')).toBe(true);
  });

  it('also registers Set() as a builtin function call', () => {
    const result = parser.parse('{{ Set(name="x", value="1") }}');
    expect(result.builtinCalls.some(c => c.name === 'Set')).toBe(true);
  });

  it('extracts Set() from statement context', () => {
    const result = parser.parse('{% set _ = Set(name="state", value="active") %}');
    // Should have both the {% set _ %} and the Set(name="state") variable
    expect(result.variables.defined.some(v => v.name === '_')).toBe(true);
    expect(result.variables.defined.some(v => v.name === 'state')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. For-loop variable definitions
// ---------------------------------------------------------------------------

describe('Parser Variable Extraction - for loops', () => {
  it('extracts loop variable from for statement', () => {
    const result = parser.parse('{% for item in items %}\n{{ item }}\n{% endfor %}');
    expect(result.variables.defined.some(v => v.name === 'item')).toBe(true);
  });

  it('adds loop context variable', () => {
    const result = parser.parse('{% for x in list %}\n{{ loop.index }}\n{% endfor %}');
    expect(result.variables.defined.some(v => v.name === 'loop')).toBe(true);
  });

  it('handles nested for loops', () => {
    const text = '{% for outer in list1 %}\n{% for inner in list2 %}\n{% endfor %}\n{% endfor %}';
    const result = parser.parse(text);
    expect(result.variables.defined.some(v => v.name === 'outer')).toBe(true);
    expect(result.variables.defined.some(v => v.name === 'inner')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Variable references
// ---------------------------------------------------------------------------

describe('Parser Variable Extraction - references', () => {
  it('extracts references from expression blocks', () => {
    const result = parser.parse('{% set x = 1 %}\n{{ x }}');
    expect(result.variables.referenced.length).toBeGreaterThan(0);
    expect(result.variables.referenced.some(v => v.name === 'x')).toBe(true);
  });

  it('extracts references from multiple expressions', () => {
    const result = parser.parse('{% set a = 1 %}\n{% set b = 2 %}\n{{ a + b }}');
    const refNames = result.variables.referenced.map(v => v.name);
    expect(refNames).toContain('a');
    expect(refNames).toContain('b');
  });

  it('does not include function names as references', () => {
    const result = parser.parse('{{ GetUser() }}');
    // GetUser should NOT be in referenced (it's a function call)
    expect(result.variables.referenced.every(v => v.name !== 'GetUser')).toBe(true);
  });

  it('does not include keywords as references', () => {
    const result = parser.parse('{% if true %}\nhello\n{% endif %}');
    expect(result.variables.referenced.every(v => v.name !== 'if')).toBe(true);
    expect(result.variables.referenced.every(v => v.name !== 'true')).toBe(true);
  });

  it('does not include filters as references', () => {
    const result = parser.parse('{{ items | join(", ") }}');
    expect(result.variables.referenced.every(v => v.name !== 'join')).toBe(true);
  });

  it('extracts references from set value side', () => {
    const result = parser.parse('{% set x = 1 %}\n{% set y = x + 1 %}');
    const xRefs = result.variables.referenced.filter(v => v.name === 'x');
    expect(xRefs.length).toBeGreaterThan(0);
  });

  it('extracts references from if conditions', () => {
    const result = parser.parse('{% set flag = true %}\n{% if flag %}\nhello\n{% endif %}');
    const flagRefs = result.variables.referenced.filter(v => v.name === 'flag');
    expect(flagRefs.length).toBeGreaterThan(0);
  });

  it('extracts references from for-loop iterables', () => {
    const result = parser.parse('{% set items = [1, 2] %}\n{% for x in items %}\n{% endfor %}');
    const itemRefs = result.variables.referenced.filter(v => v.name === 'items');
    expect(itemRefs.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 5. Edge cases
// ---------------------------------------------------------------------------

describe('Parser Variable Extraction - edge cases', () => {
  it('handles empty template', () => {
    const result = parser.parse('');
    expect(result.variables.defined.length).toBe(0);
    expect(result.variables.referenced.length).toBe(0);
  });

  it('handles template with only comments', () => {
    const result = parser.parse('{# this is a comment #}');
    expect(result.variables.defined.length).toBe(0);
    expect(result.variables.referenced.length).toBe(0);
  });

  it('handles complex expressions', () => {
    const result = parser.parse('{% set x = GetUser() %}\n{{ x.name if x else "anonymous" }}');
    expect(result.variables.defined.some(v => v.name === 'x')).toBe(true);
    const xRefs = result.variables.referenced.filter(v => v.name === 'x');
    expect(xRefs.length).toBeGreaterThan(0);
  });

  it('handles multi-line set statement', () => {
    const result = parser.parse('{% set long_var = \n  GetUser() %}');
    expect(result.variables.defined.some(v => v.name === 'long_var')).toBe(true);
  });

  it('does not extract variables from plain text', () => {
    const result = parser.parse('This is just plain text with no template syntax');
    expect(result.variables.defined.length).toBe(0);
    expect(result.variables.referenced.length).toBe(0);
  });
});
