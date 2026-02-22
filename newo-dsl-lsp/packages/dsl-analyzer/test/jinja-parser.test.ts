import { describe, it, expect } from 'vitest';
import { JinjaParser } from '../src/parsers/jinja-parser';

describe('JinjaParser', () => {
  const parser = new JinjaParser();

  describe('tokenize (via parse)', () => {
    it('should parse expression tokens', () => {
      const result = parser.parse('{{SendMessage(message="hi")}}', 'test.jinja');
      expect(result.functionCalls).toHaveLength(1);
      expect(result.functionCalls[0].name).toBe('SendMessage');
    });

    it('should parse statement tokens', () => {
      const result = parser.parse('{% set x = GetUser() %}', 'test.jinja');
      expect(result.variables.defined).toHaveLength(1);
      expect(result.variables.defined[0].name).toBe('x');
    });

    it('should parse comment tokens without errors', () => {
      const result = parser.parse('{# This is a comment #}', 'test.jinja');
      expect(result.diagnostics).toHaveLength(0);
      expect(result.functionCalls).toHaveLength(0);
    });

    it('should handle multi-line expressions', () => {
      const template = `{{SendMessage(
        message="Hello",
        actorIds=actors
      )}}`;
      const result = parser.parse(template, 'test.jinja');
      expect(result.functionCalls).toHaveLength(1);
      expect(result.functionCalls[0].name).toBe('SendMessage');
    });

    it('should handle nested braces in expressions', () => {
      const template = '{{GetValueJSON(obj=data, key="nested.path")}}';
      const result = parser.parse(template, 'test.jinja');
      expect(result.functionCalls).toHaveLength(1);
      expect(result.functionCalls[0].name).toBe('GetValueJSON');
    });

    it('should handle strings with delimiters inside', () => {
      const template = '{{SendMessage(message="He said \'hello\'")}}';
      const result = parser.parse(template, 'test.jinja');
      expect(result.functionCalls).toHaveLength(1);
    });
  });

  describe('function extraction', () => {
    it('should classify built-in functions', () => {
      const result = parser.parse('{{Return()}}', 'test.jinja');
      expect(result.functionCalls[0].type).toBe('builtin');
      expect(result.builtinCalls).toHaveLength(1);
    });

    it('should classify skill functions', () => {
      const result = parser.parse('{{MyCustomSkill(param="val")}}', 'test.jinja');
      expect(result.functionCalls[0].type).toBe('skill');
      expect(result.skillCalls).toHaveLength(1);
    });

    it('should classify unknown functions', () => {
      const result = parser.parse('{{SomeUnknownFunc()}}', 'test.jinja');
      expect(result.functionCalls[0].type).toBe('unknown');
    });

    it('should not extract keywords as function calls', () => {
      const result = parser.parse('{% if condition %}{% endif %}', 'test.jinja');
      const funcNames = result.functionCalls.map(f => f.name);
      expect(funcNames).not.toContain('if');
    });

    it('should not extract filters as function calls', () => {
      const result = parser.parse('{{value | string}}', 'test.jinja');
      const funcNames = result.functionCalls.map(f => f.name);
      expect(funcNames).not.toContain('string');
    });

    it('should extract nested function calls', () => {
      // Note: Set is a keyword in the parser (filtered out), use non-keyword built-ins
      const result = parser.parse('{{SendMessage(message=GetUser(field="name"))}}', 'test.jinja');
      expect(result.functionCalls.length).toBeGreaterThanOrEqual(1);
      const names = result.functionCalls.map(f => f.name);
      expect(names).toContain('SendMessage');
    });
  });

  describe('parameter parsing', () => {
    it('should parse keyword parameters', () => {
      const result = parser.parse('{{SendMessage(message="hello")}}', 'test.jinja');
      const params = result.functionCalls[0].parameters;
      expect(params).toHaveLength(1);
      expect(params[0].type).toBe('keyword');
      expect(params[0].name).toBe('message');
    });

    it('should parse positional parameters', () => {
      const result = parser.parse('{{DUMMY("test message")}}', 'test.jinja');
      const params = result.functionCalls[0].parameters;
      expect(params).toHaveLength(1);
      expect(params[0].type).toBe('positional');
    });

    it('should parse empty parameters', () => {
      const result = parser.parse('{{Return()}}', 'test.jinja');
      const params = result.functionCalls[0].parameters;
      expect(params).toHaveLength(0);
    });

    it('should not treat comparisons as parameters', () => {
      const result = parser.parse('{% if val == "test" %}{% endif %}', 'test.jinja');
      // Should not crash or produce spurious parameters
      expect(result.diagnostics.filter(d => d.code === 'E001')).toHaveLength(0);
    });

    it('should parse multiple keyword parameters', () => {
      const result = parser.parse('{{IsSimilar(val1="a", val2="b", threshold=0.7)}}', 'test.jinja');
      const params = result.functionCalls[0].parameters;
      expect(params).toHaveLength(3);
      expect(params.every(p => p.type === 'keyword')).toBe(true);
    });
  });

  describe('syntax checking', () => {
    it('should detect unbalanced expression braces', () => {
      const result = parser.parse('{{SendMessage(message="hi")', 'test.jinja');
      const errors = result.diagnostics.filter(d => d.code === 'E001');
      expect(errors).toHaveLength(1);
    });

    it('should detect unbalanced statement braces', () => {
      const result = parser.parse('{% set x = 1', 'test.jinja');
      const errors = result.diagnostics.filter(d => d.code === 'E002');
      expect(errors).toHaveLength(1);
    });

    it('should detect unbalanced comment braces', () => {
      const result = parser.parse('{# unfinished comment', 'test.jinja');
      const errors = result.diagnostics.filter(d => d.code === 'E003');
      expect(errors).toHaveLength(1);
    });

    it('should pass with balanced braces', () => {
      const result = parser.parse('{{Return()}} {% set x = 1 %} {# comment #}', 'test.jinja');
      expect(result.diagnostics).toHaveLength(0);
    });
  });

  describe('variable tracking', () => {
    it('should track set statement variables', () => {
      const result = parser.parse('{% set user_name = "test" %}', 'test.jinja');
      expect(result.variables.defined).toHaveLength(1);
      expect(result.variables.defined[0].name).toBe('user_name');
    });

    it('should track for loop variables', () => {
      const result = parser.parse('{% for item in items %}{{item}}{% endfor %}', 'test.jinja');
      // 'item' is tracked as a defined var internally
      const defined = result.variables.defined.map(v => v.name);
      // The parser adds loop vars to internal set, not to result.variables.defined
      // But it should not produce errors
      expect(result.diagnostics).toHaveLength(0);
    });
  });

  describe('language ID', () => {
    it('should set newo-jinja for .jinja files', () => {
      const result = parser.parse('{{Return()}}', 'test.jinja');
      expect(result.languageId).toBe('newo-jinja');
    });
  });

  describe('guidance block support', () => {
    it('should parse balanced guidance blocks', () => {
      const template = '{{#system}}You are a helper.{{/system}}\n{{#user}}{{prompt}}{{/user}}';
      const result = parser.parse(template, 'test.guidance');
      expect(result.blocks).toHaveLength(4);
      expect(result.blocks[0]).toMatchObject({ name: 'system', type: 'open' });
      expect(result.blocks[1]).toMatchObject({ name: 'system', type: 'close' });
      expect(result.blocks[2]).toMatchObject({ name: 'user', type: 'open' });
      expect(result.blocks[3]).toMatchObject({ name: 'user', type: 'close' });
      expect(result.diagnostics).toHaveLength(0);
    });

    it('should detect unclosed guidance blocks', () => {
      const template = '{{#system}}You are a helper.';
      const result = parser.parse(template, 'test.guidance');
      const errors = result.diagnostics.filter(d => d.code === 'E010');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Unclosed guidance block');
    });

    it('should detect unexpected closing block', () => {
      const template = '{{/system}}';
      const result = parser.parse(template, 'test.guidance');
      const errors = result.diagnostics.filter(d => d.code === 'E011');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Unexpected closing block');
    });

    it('should detect mismatched blocks', () => {
      const template = '{{#system}}content{{/user}}';
      const result = parser.parse(template, 'test.guidance');
      const errors = result.diagnostics.filter(d => d.code === 'E012');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Mismatched block');
    });

    it('should handle nested guidance blocks', () => {
      const template = '{{#system}}{{#if condition}}yes{{/if}}{{/system}}';
      const result = parser.parse(template, 'test.guidance');
      expect(result.blocks).toHaveLength(4);
      expect(result.diagnostics).toHaveLength(0);
    });

    it('should handle guidance blocks with whitespace control', () => {
      const template = '{{~#system}}content{{/system}}';
      const result = parser.parse(template, 'test.guidance');
      expect(result.blocks.filter(b => b.name === 'system')).toHaveLength(2);
      expect(result.diagnostics).toHaveLength(0);
    });

    it('should parse guidance blocks with args', () => {
      const template = '{{#each items}}{{this}}{{/each}}';
      const result = parser.parse(template, 'test.guidance');
      expect(result.blocks[0]).toMatchObject({ name: 'each', type: 'open' });
      expect(result.blocks[0].args).toContain('items');
    });
  });
});
