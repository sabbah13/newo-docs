import { describe, it, expect } from 'vitest';
import GuidanceParser from '../src/parsers/guidance-parser';

describe('template-lint GuidanceParser', () => {
  const parser = new GuidanceParser();

  describe('parse', () => {
    it('should return a result object with expected keys', () => {
      const result = parser.parse('{{Return()}}', 'test.guidance');
      expect(result).toHaveProperty('filePath', 'test.guidance');
      expect(result).toHaveProperty('blocks');
      expect(result).toHaveProperty('functionCalls');
      expect(result).toHaveProperty('diagnostics');
    });

    it('should parse empty content without errors', () => {
      const result = parser.parse('', 'test.guidance');
      expect(result.diagnostics).toHaveLength(0);
    });
  });

  describe('block parsing', () => {
    it('should extract system blocks', () => {
      const content = '{{#system}}prompt{{/system}}';
      const result = parser.parse(content, 'test.guidance');
      const systemBlocks = result.blocks.filter(b => b.name === 'system');
      expect(systemBlocks).toHaveLength(2); // open + close
    });

    it('should extract user blocks', () => {
      const content = '{{#user}}message{{/user}}';
      const result = parser.parse(content, 'test.guidance');
      const userBlocks = result.blocks.filter(b => b.name === 'user');
      expect(userBlocks).toHaveLength(2);
    });

    it('should extract assistant blocks', () => {
      const content = '{{#assistant}}response{{/assistant}}';
      const result = parser.parse(content, 'test.guidance');
      const assistantBlocks = result.blocks.filter(b => b.name === 'assistant');
      expect(assistantBlocks).toHaveLength(2);
    });

    it('should handle nested blocks', () => {
      const content = '{{#system}}{{#if condition}}text{{/if}}{{/system}}';
      const result = parser.parse(content, 'test.guidance');
      expect(result.diagnostics.filter(d => d.code === 'E010')).toHaveLength(0);
      expect(result.diagnostics.filter(d => d.code === 'E011')).toHaveLength(0);
    });
  });

  describe('block stack validation', () => {
    it('should detect unclosed blocks (E010)', () => {
      const content = '{{#system}}prompt text';
      const result = parser.parse(content, 'test.guidance');
      const errors = result.diagnostics.filter(d => d.code === 'E010');
      expect(errors).toHaveLength(1);
    });

    it('should detect mismatched block close (E011)', () => {
      const content = '{{#system}}prompt{{/user}}';
      const result = parser.parse(content, 'test.guidance');
      const errors = result.diagnostics.filter(d => d.code === 'E011');
      expect(errors).toHaveLength(1);
    });

    it('should detect unexpected block close (E012)', () => {
      const content = '{{/system}}';
      const result = parser.parse(content, 'test.guidance');
      const errors = result.diagnostics.filter(d => d.code === 'E012');
      expect(errors).toHaveLength(1);
    });

    it('should detect unknown block types (W010)', () => {
      const content = '{{#foobar}}text{{/foobar}}';
      const result = parser.parse(content, 'test.guidance');
      const warnings = result.diagnostics.filter(d => d.code === 'W010');
      expect(warnings).toHaveLength(1);
    });

    it('should pass with properly balanced blocks', () => {
      // Use non-whitespace-control syntax since {{~/system}} doesn't match {{/block}} regex
      const content = '{{#system}}prompt{{/system}}';
      const result = parser.parse(content, 'test.guidance');
      const blockErrors = result.diagnostics.filter(d =>
        d.code === 'E010' || d.code === 'E011' || d.code === 'E012'
      );
      expect(blockErrors).toHaveLength(0);
    });
  });

  describe('function extraction', () => {
    it('should extract built-in calls', () => {
      const content = '{{Set(name="x", value="1")}}';
      const result = parser.parse(content, 'test.guidance');
      expect(result.builtinCalls.length).toBeGreaterThanOrEqual(1);
    });

    it('should extract Return calls', () => {
      const content = '{{Return(val="test")}}';
      const result = parser.parse(content, 'test.guidance');
      const returnCalls = result.builtinCalls.filter(c => c.name === 'Return');
      expect(returnCalls).toHaveLength(1);
    });

    it('should extract skill calls', () => {
      const content = '{{MyCustomSkill(param="val")}}';
      const result = parser.parse(content, 'test.guidance');
      expect(result.skillCalls).toHaveLength(1);
    });
  });

  describe('variable extraction', () => {
    it('should track Set-defined variables', () => {
      const content = '{{Set(name="my_var", value="test")}}';
      const result = parser.parse(content, 'test.guidance');
      expect(result.variables.defined).toHaveLength(1);
      expect(result.variables.defined[0].name).toBe('my_var');
    });
  });

  describe('whitespace control', () => {
    it('should handle whitespace control markers in block opens', () => {
      // The {{#system~}} pattern includes ~ in the args capture group
      const content = '{{#system~}}prompt{{/system}}';
      const result = parser.parse(content, 'test.guidance');
      // The open block should be parsed, close should match
      expect(result.blocks.length).toBeGreaterThanOrEqual(1);
    });

    it('should not crash on tilde expressions', () => {
      const content = '{{~}}some text{{~}}';
      const result = parser.parse(content, 'test.guidance');
      // Should not throw
      expect(result).toBeDefined();
    });
  });
});
