import { describe, it, expect, beforeEach } from 'vitest';
import SchemaValidator from '../src/validators/schema-validator';
import path from 'path';

describe('template-lint SchemaValidator', () => {
  let validator;
  const schemasDir = path.resolve(__dirname, '../../dsl-spec');

  beforeEach(() => {
    validator = new SchemaValidator(schemasDir);
  });

  describe('schema loading', () => {
    it('should initialize with empty indexes', () => {
      const stats = validator.getStats();
      expect(stats.skills).toBe(0);
      expect(stats.builtins).toBe(0);
      expect(stats.attributes).toBe(0);
      expect(stats.events).toBe(0);
    });

    it('should handle non-existent schemas directory', () => {
      const badValidator = new SchemaValidator('/nonexistent/path');
      expect(() => badValidator.loadSchemas()).not.toThrow();
    });
  });

  describe('skill validation', () => {
    it('should report unknown skills (E100)', () => {
      const parseResult = {
        skillCalls: [{
          name: 'NonExistentSkill',
          parameters: [],
          line: 1,
          column: 1
        }],
        builtinCalls: [],
        functionCalls: []
      };
      const diagnostics = validator.validate(parseResult);
      const errors = diagnostics.filter(d => d.code === 'E100');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Unknown skill');
    });
  });

  describe('builtin validation', () => {
    it('should report unknown builtins (W100)', () => {
      const parseResult = {
        skillCalls: [],
        builtinCalls: [{
          name: 'NonExistentBuiltin',
          parameters: [],
          line: 1,
          column: 1
        }],
        functionCalls: []
      };
      const diagnostics = validator.validate(parseResult);
      const warnings = diagnostics.filter(d => d.code === 'W100');
      expect(warnings).toHaveLength(1);
    });
  });

  describe('parameter validation', () => {
    it('should report unknown parameters (W102) for builtins', () => {
      // Use a builtin (not a skill) because skills intentionally accept extra params
      validator.builtinIndex.set('TestBuiltin', {
        name: 'TestBuiltin',
        parameters: [{ name: 'validParam', required: true }],
        accepts_extra_params: false
      });

      const parseResult = {
        skillCalls: [],
        builtinCalls: [{
          name: 'TestBuiltin',
          parameters: [{ name: 'invalidParam', value: 'test', type: 'keyword' }],
          line: 1,
          column: 1
        }],
        functionCalls: []
      };
      const diagnostics = validator.validate(parseResult);
      const warnings = diagnostics.filter(d => d.code === 'W102');
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toContain('Unknown parameter');
    });

    it('should not report unknown parameters for skills (skills accept extra params)', () => {
      validator.skillIndex.set('TestSkill', {
        name: 'TestSkill',
        parameters: [{ name: 'validParam', required: true }]
      });

      const parseResult = {
        skillCalls: [{
          name: 'TestSkill',
          parameters: [{ name: 'customUserParam', value: 'test', type: 'keyword' }],
          line: 1,
          column: 1
        }],
        builtinCalls: [],
        functionCalls: []
      };
      const diagnostics = validator.validate(parseResult);
      const warnings = diagnostics.filter(d => d.code === 'W102');
      expect(warnings).toHaveLength(0);
    });

    it('should report missing required parameters (E101)', () => {
      validator.skillIndex.set('TestSkill', {
        name: 'TestSkill',
        parameters: [{ name: 'requiredParam', required: true }]
      });

      const parseResult = {
        skillCalls: [{
          name: 'TestSkill',
          parameters: [],
          line: 1,
          column: 1
        }],
        builtinCalls: [],
        functionCalls: []
      };
      const diagnostics = validator.validate(parseResult);
      const errors = diagnostics.filter(d => d.code === 'E101');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Missing required parameter');
    });

    it('should not report optional parameters as missing', () => {
      validator.skillIndex.set('TestSkill', {
        name: 'TestSkill',
        parameters: [
          { name: 'requiredParam', required: true },
          { name: 'optionalParam', required: false }
        ]
      });

      const parseResult = {
        skillCalls: [{
          name: 'TestSkill',
          parameters: [{ name: 'requiredParam', value: 'test', type: 'keyword' }],
          line: 1,
          column: 1
        }],
        builtinCalls: [],
        functionCalls: []
      };
      const diagnostics = validator.validate(parseResult);
      const missingErrors = diagnostics.filter(d => d.code === 'E101');
      expect(missingErrors).toHaveLength(0);
    });
  });

  describe('Levenshtein suggestions', () => {
    it('should suggest similar skill names', () => {
      validator.skillIndex.set('SendMessage', {
        name: 'SendMessage',
        parameters: []
      });

      const suggestions = validator.findSimilarSkills('SendMessge');
      expect(suggestions).toContain('SendMessage');
    });

    it('should suggest similar builtin names', () => {
      validator.builtinIndex.set('Return', {
        name: 'Return',
        parameters: []
      });

      const suggestions = validator.findSimilarBuiltins('Retrun');
      expect(suggestions).toContain('Return');
    });

    it('should suggest similar parameter names', () => {
      const params = [{ name: 'message' }, { name: 'actorIds' }];
      const suggestions = validator.findSimilarParams('mesage', params);
      expect(suggestions).toContain('message');
    });

    it('should return empty for very different names', () => {
      validator.skillIndex.set('SendMessage', {
        name: 'SendMessage',
        parameters: []
      });

      const suggestions = validator.findSimilarSkills('CompletelyDifferentName');
      expect(suggestions).toHaveLength(0);
    });
  });

  describe('unknown function validation', () => {
    it('should report unknown functions (W101)', () => {
      const parseResult = {
        skillCalls: [],
        builtinCalls: [],
        functionCalls: [{
          name: 'RandomFunction',
          type: 'unknown',
          line: 1,
          column: 1
        }]
      };
      const diagnostics = validator.validate(parseResult);
      const warnings = diagnostics.filter(d => d.code === 'W101');
      expect(warnings).toHaveLength(1);
    });

    it('should skip common function patterns', () => {
      const parseResult = {
        skillCalls: [],
        builtinCalls: [],
        functionCalls: [{
          name: 'utils_helper',
          type: 'unknown',
          line: 1,
          column: 1
        }]
      };
      const diagnostics = validator.validate(parseResult);
      const warnings = diagnostics.filter(d => d.code === 'W101');
      expect(warnings).toHaveLength(0);
    });

    it('should not report functions found in skill index', () => {
      validator.skillIndex.set('MyFunc', { name: 'MyFunc', parameters: [] });

      const parseResult = {
        skillCalls: [],
        builtinCalls: [],
        functionCalls: [{
          name: 'MyFunc',
          type: 'unknown',
          line: 1,
          column: 1
        }]
      };
      const diagnostics = validator.validate(parseResult);
      expect(diagnostics).toHaveLength(0);
    });
  });
});
