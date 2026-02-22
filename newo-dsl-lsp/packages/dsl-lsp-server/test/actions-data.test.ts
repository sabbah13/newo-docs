import { describe, it, expect } from 'vitest';
import { ACTIONS, JINJA_BUILTINS, VALIDATION_RULES } from '@newo-dsl/data';

describe('ACTIONS data integrity', () => {
  const actionNames = Object.keys(ACTIONS);
  const ruleNames = Object.keys(VALIDATION_RULES);

  it('should have at least 60 actions defined', () => {
    expect(actionNames.length).toBeGreaterThanOrEqual(60);
  });

  it('should have validation rules for at least 60 actions', () => {
    expect(ruleNames.length).toBeGreaterThanOrEqual(60);
  });

  it('should have a validation rule for EVERY action', () => {
    const missingRules = actionNames.filter(name => !ruleNames.includes(name));
    expect(missingRules, `Actions missing validation rules: ${missingRules.join(', ')}`).toHaveLength(0);
  });

  it('should not have orphaned validation rules', () => {
    for (const ruleName of ruleNames) {
      expect(actionNames).toContain(ruleName);
    }
  });

  it('should have required action fields', () => {
    const requiredFields = ['description', 'category', 'syntax', 'parameters', 'returns', 'example'] as const;
    for (const action of Object.values(ACTIONS)) {
      for (const field of requiredFields) {
        expect(action).toHaveProperty(field);
      }
    }
  });

  it('should include V2-era actions', () => {
    expect(actionNames).toContain('GetSessionInfo');
    expect(actionNames).toContain('DisableFollowUp');
    expect(actionNames).toContain('EnableFollowUp');
    expect(actionNames).toContain('SetCustomerInfo');
    expect(actionNames).toContain('FastPrompt');
    expect(actionNames).toContain('Error');
    expect(actionNames).toContain('ResultError');
    expect(actionNames).toContain('ConnectorResultError');
  });

  it('should have paramConstraints that reference valid parameter names', () => {
    for (const [ruleName, rule] of Object.entries(VALIDATION_RULES)) {
      if (!rule.paramConstraints) continue;
      const action = ACTIONS[ruleName];
      if (!action) continue;
      for (const paramName of Object.keys(rule.paramConstraints)) {
        expect(
          Object.keys(action.parameters),
          `${ruleName}: paramConstraint references unknown param '${paramName}'`
        ).toContain(paramName);
      }
    }
  });
});

describe('JINJA_BUILTINS data integrity', () => {
  it('should have Jinja builtins defined', () => {
    const builtinNames = Object.keys(JINJA_BUILTINS);
    expect(builtinNames.length).toBeGreaterThan(70);
  });

  it('should have description, syntax, and returns for each builtin', () => {
    for (const [name, builtin] of Object.entries(JINJA_BUILTINS)) {
      expect(builtin, `builtin '${name}' missing description`).toHaveProperty('description');
      expect(builtin, `builtin '${name}' missing syntax`).toHaveProperty('syntax');
      expect(builtin, `builtin '${name}' missing returns`).toHaveProperty('returns');
    }
  });
});
