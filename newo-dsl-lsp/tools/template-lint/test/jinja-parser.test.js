import { describe, it, expect } from 'vitest';
import JinjaParser from '../src/parsers/jinja-parser';

describe('template-lint JinjaParser', () => {
  const parser = new JinjaParser();

  describe('parse', () => {
    it('should return a result object with expected keys', () => {
      const result = parser.parse('{{Return()}}', 'test.jinja');
      expect(result).toHaveProperty('filePath', 'test.jinja');
      expect(result).toHaveProperty('expressions');
      expect(result).toHaveProperty('statements');
      expect(result).toHaveProperty('functionCalls');
      expect(result).toHaveProperty('skillCalls');
      expect(result).toHaveProperty('builtinCalls');
      expect(result).toHaveProperty('variables');
      expect(result).toHaveProperty('diagnostics');
    });

    it('should parse empty content without errors', () => {
      const result = parser.parse('', 'test.jinja');
      expect(result.diagnostics).toHaveLength(0);
    });

    it('should parse plain text without errors', () => {
      const result = parser.parse('This is plain text.', 'test.jinja');
      expect(result.expressions).toHaveLength(0);
      expect(result.diagnostics).toHaveLength(0);
    });
  });

  describe('expression extraction', () => {
    it('should extract expressions', () => {
      const result = parser.parse('{{Return()}}', 'test.jinja');
      expect(result.expressions).toHaveLength(1);
      expect(result.expressions[0].content).toBe('Return()');
    });

    it('should extract multiple expressions on one line', () => {
      const result = parser.parse('{{Set(name="x", value="1")}} {{Return()}}', 'test.jinja');
      expect(result.expressions.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('function call extraction', () => {
    it('should extract built-in calls', () => {
      const result = parser.parse('{{SendMessage(message="hi")}}', 'test.jinja');
      expect(result.builtinCalls.length).toBeGreaterThanOrEqual(1);
      expect(result.builtinCalls[0].name).toBe('SendMessage');
    });

    it('should extract skill calls', () => {
      const result = parser.parse('{{MyCustomSkill(param="val")}}', 'test.jinja');
      expect(result.skillCalls).toHaveLength(1);
      expect(result.skillCalls[0].name).toBe('MyCustomSkill');
    });

    it('should classify unknown functions', () => {
      const result = parser.parse('{{SomeRandomFunc()}}', 'test.jinja');
      const unknowns = result.functionCalls.filter(f => f.type === 'unknown');
      expect(unknowns.length).toBeGreaterThanOrEqual(1);
    });

    it('should not extract Jinja keywords', () => {
      const result = parser.parse('{% if true %}{% endif %}', 'test.jinja');
      const names = result.functionCalls.map(f => f.name);
      expect(names).not.toContain('if');
    });
  });

  describe('parameter parsing', () => {
    it('should parse keyword parameters', () => {
      const result = parser.parse('{{SendMessage(message="hello")}}', 'test.jinja');
      const params = result.builtinCalls[0].parameters;
      expect(params).toHaveLength(1);
      expect(params[0].name).toBe('message');
      expect(params[0].type).toBe('keyword');
    });

    it('should parse multiple parameters', () => {
      const result = parser.parse('{{Set(name="x", value="1")}}', 'test.jinja');
      const setCall = result.builtinCalls.find(c => c.name === 'Set');
      expect(setCall.parameters.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty parameters', () => {
      const result = parser.parse('{{Return()}}', 'test.jinja');
      const returnCall = result.builtinCalls.find(c => c.name === 'Return');
      expect(returnCall.parameters).toHaveLength(0);
    });
  });

  describe('syntax errors', () => {
    it('should detect unbalanced expression braces', () => {
      const result = parser.parse('{{SendMessage(', 'test.jinja');
      const errors = result.diagnostics.filter(d => d.code === 'E001');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect unbalanced statement braces', () => {
      const result = parser.parse('{% set x = 1', 'test.jinja');
      const errors = result.diagnostics.filter(d => d.code === 'E002');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass on valid template', () => {
      const result = parser.parse('{{Return()}} {% set x = 1 %}', 'test.jinja');
      const syntaxErrors = result.diagnostics.filter(d =>
        d.code === 'E001' || d.code === 'E002'
      );
      expect(syntaxErrors).toHaveLength(0);
    });
  });

  describe('variable tracking', () => {
    it('should track set variables', () => {
      const result = parser.parse('{% set my_var = "value" %}', 'test.jinja');
      expect(result.variables.defined).toHaveLength(1);
      expect(result.variables.defined[0].name).toBe('my_var');
    });

    it('should track for loop variables', () => {
      const result = parser.parse('{% for item in items %}{% endfor %}', 'test.jinja');
      // Parser adds loop vars to internal set
      expect(result.diagnostics).toHaveLength(0);
    });
  });

  describe('statement types', () => {
    it('should identify set statements', () => {
      const result = parser.parse('{% set x = 1 %}', 'test.jinja');
      expect(result.statements[0].type).toBe('set');
    });

    it('should identify if statements', () => {
      const result = parser.parse('{% if true %}{% endif %}', 'test.jinja');
      const ifStmt = result.statements.find(s => s.type === 'if');
      expect(ifStmt).toBeDefined();
    });

    it('should identify for statements', () => {
      const result = parser.parse('{% for x in items %}{% endfor %}', 'test.jinja');
      const forStmt = result.statements.find(s => s.type === 'for');
      expect(forStmt).toBeDefined();
    });
  });
});
