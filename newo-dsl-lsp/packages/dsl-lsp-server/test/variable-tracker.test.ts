/**
 * Tests for the Variable Tracker module.
 *
 * Covers: variable extraction from set/Set()/for-loop/parameters,
 * type inference, scope tracking, dot-access resolution,
 * undefined/unused detection, literal value tracking, and branch analysis.
 */

import { describe, it, expect } from 'vitest';
import {
  buildVariableTable,
  getVariablesAtLine,
  findDefinition,
  getUndefinedReferences,
  getUnusedDefinitions,
} from '../src/variable-tracker';

// ---------------------------------------------------------------------------
// 1. Basic variable extraction
// ---------------------------------------------------------------------------

describe('Variable Tracker - Basic Extraction', () => {
  it('extracts {% set %} variable definitions', () => {
    const text = '{% set user = GetUser() %}\n{{ user.name }}';
    const table = buildVariableTable(text);

    expect(table.definitions.has('user')).toBe(true);
    const defs = table.definitions.get('user')!;
    expect(defs.length).toBeGreaterThanOrEqual(1);
    expect(defs[0].source).toBe('set');
    expect(defs[0].name).toBe('user');
  });

  it('extracts Set(name="x") variable definitions', () => {
    const text = '{{ Set(name="prefix", value="_") }}\n{{ prefix }}';
    const table = buildVariableTable(text);

    expect(table.definitions.has('prefix')).toBe(true);
    const defs = table.definitions.get('prefix')!;
    expect(defs.some(d => d.source === 'set-action')).toBe(true);
  });

  it('extracts for-loop variables with loop context', () => {
    const text = '{% for item in items %}\n{{ item }}\n{{ loop.index }}\n{% endfor %}';
    const table = buildVariableTable(text);

    expect(table.definitions.has('item')).toBe(true);
    const itemDefs = table.definitions.get('item')!;
    expect(itemDefs.some(d => d.source === 'for-loop')).toBe(true);

    expect(table.definitions.has('loop')).toBe(true);
    const loopDefs = table.definitions.get('loop')!;
    expect(loopDefs.some(d => d.source === 'for-loop-context')).toBe(true);
  });

  it('registers skill parameters as pre-defined variables', () => {
    const text = '{{ greeting }}';
    const table = buildVariableTable(text, [
      { name: 'greeting', required: true },
      { name: 'tone', required: false, defaultValue: 'friendly' },
    ]);

    expect(table.definitions.has('greeting')).toBe(true);
    expect(table.definitions.has('tone')).toBe(true);

    const greetingDefs = table.definitions.get('greeting')!;
    expect(greetingDefs[0].source).toBe('parameter');
    expect(greetingDefs[0].line).toBe(0);
  });

  it('extracts multiple variables from a single file', () => {
    const text = [
      '{% set user = GetUser() %}',
      '{% set actor = GetActor() %}',
      '{{ Set(name="state", value="active") }}',
      '{% for item in GetActors() %}',
      '{{ item.name }}',
      '{% endfor %}',
    ].join('\n');

    const table = buildVariableTable(text);

    expect(table.definitions.has('user')).toBe(true);
    expect(table.definitions.has('actor')).toBe(true);
    expect(table.definitions.has('state')).toBe(true);
    expect(table.definitions.has('item')).toBe(true);
    expect(table.definitions.has('loop')).toBe(true);
  });

  it('handles whitespace-trimming syntax (-%} and {%- )', () => {
    const text = '{%- set user = GetUser() -%}\n{{ user.name }}';
    const table = buildVariableTable(text);

    expect(table.definitions.has('user')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Type inference
// ---------------------------------------------------------------------------

describe('Variable Tracker - Type Inference', () => {
  it('infers object type from GetUser()', () => {
    const text = '{% set user = GetUser() %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('user')![0];
    expect(def.inferredType).toBe('object');
    expect(def.shapeKey).toBe('User');
  });

  it('infers array type from GetActors()', () => {
    const text = '{% set actors = GetActors() %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('actors')![0];
    expect(def.inferredType).toBe('array');
    expect(def.elementShapeKey).toBe('Actor');
  });

  it('infers string type from string literal', () => {
    const text = '{% set greeting = "hello" %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('greeting')![0];
    expect(def.inferredType).toBe('string');
    expect(def.literalValues).toEqual(['hello']);
  });

  it('infers number type from numeric literal', () => {
    const text = '{% set count = 42 %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('count')![0];
    expect(def.inferredType).toBe('number');
    expect(def.literalValues).toEqual(['42']);
  });

  it('infers boolean type', () => {
    const text = '{% set active = true %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('active')![0];
    expect(def.inferredType).toBe('boolean');
  });

  it('infers any type from GetState() (Fix 7: can return any JSON type)', () => {
    const text = '{% set val = GetState(name="key") %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('val')![0];
    expect(def.inferredType).toBe('any');
  });

  it('infers boolean type from IsEmpty()', () => {
    const text = '{% set empty = IsEmpty(value=x) %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('empty')![0];
    expect(def.inferredType).toBe('boolean');
  });

  it('infers type from GetTriggeredAct()', () => {
    const text = '{% set act = GetTriggeredAct() %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('act')![0];
    expect(def.inferredType).toBe('object');
    expect(def.shapeKey).toBe('Act');
  });

  it('infers string type from concatenation operator', () => {
    const text = '{% set full = first ~ " " ~ last %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('full')![0];
    expect(def.inferredType).toBe('string');
  });

  it('infers any type for unknown functions', () => {
    const text = '{% set result = CustomSkill(param="val") %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('result')![0];
    expect(def.inferredType).toBe('any');
  });

  it('infers array type from list literal', () => {
    const text = '{% set items = [1, 2, 3] %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('items')![0];
    expect(def.inferredType).toBe('array');
  });

  it('infers element type for for-loop over typed array', () => {
    const text = '{% for actor in GetActors() %}\n{{ actor.id }}\n{% endfor %}';
    const table = buildVariableTable(text);

    const actorDef = table.definitions.get('actor')!.find(d => d.source === 'for-loop');
    expect(actorDef).toBeDefined();
    expect(actorDef!.elementShapeKey).toBe('Actor');
  });
});

// ---------------------------------------------------------------------------
// 3. Scope tracking
// ---------------------------------------------------------------------------

describe('Variable Tracker - Scope Tracking', () => {
  it('for-loop variables have bounded scope', () => {
    const text = '{% for item in list %}\n{{ item }}\n{% endfor %}\n{{ item }}';
    const table = buildVariableTable(text);

    const itemDef = table.definitions.get('item')!.find(d => d.source === 'for-loop');
    expect(itemDef).toBeDefined();
    expect(itemDef!.scopeEndLine).toBeGreaterThan(itemDef!.line);
    // scopeEndLine should be the endfor line
    expect(itemDef!.scopeEndLine).toBe(2); // line 2 is {% endfor %}
  });

  it('set variables have file scope', () => {
    const text = '{% set x = 1 %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('x')![0];
    expect(def.scopeEndLine).toBe(-1); // file scope
  });

  it('getVariablesAtLine respects scope', () => {
    const text = '{% set x = 1 %}\n{% for item in list %}\n{{ item }}\n{% endfor %}\n{{ x }}';
    const table = buildVariableTable(text);

    // At line 2 (inside for-loop), both x and item should be available
    const varsInLoop = getVariablesAtLine(table, 2);
    const varNames = varsInLoop.map(v => v.name);
    expect(varNames).toContain('item');
    expect(varNames).toContain('x');

    // At line 4 (after endfor), only x should be available
    const varsAfterLoop = getVariablesAtLine(table, 4);
    const afterNames = varsAfterLoop.map(v => v.name);
    expect(afterNames).toContain('x');
    // item should NOT be in scope
    const itemDef = varsAfterLoop.find(v => v.name === 'item');
    expect(itemDef).toBeUndefined();
  });

  it('parameters are available at all lines', () => {
    const text = '{% set x = 1 %}\n{{ param1 }}';
    const table = buildVariableTable(text, [{ name: 'param1', required: true }]);

    const varsAtEnd = getVariablesAtLine(table, 1);
    const names = varsAtEnd.map(v => v.name);
    expect(names).toContain('param1');
  });
});

// ---------------------------------------------------------------------------
// 4. Variable references
// ---------------------------------------------------------------------------

describe('Variable Tracker - Reference Extraction', () => {
  it('extracts references from expression blocks', () => {
    const text = '{% set actor = GetActor() %}\n{{ actor.name }}';
    const table = buildVariableTable(text);

    const refs = table.references.filter(r => r.name === 'actor');
    expect(refs.length).toBeGreaterThanOrEqual(1);
  });

  it('extracts property chain from dot-access', () => {
    const text = '{% set act = GetTriggeredAct() %}\n{{ act.arguments.fieldName }}';
    const table = buildVariableTable(text);

    const actRefs = table.references.filter(r => r.name === 'act');
    expect(actRefs.length).toBeGreaterThanOrEqual(1);
    const refWithChain = actRefs.find(r => r.propertyChain && r.propertyChain.length > 0);
    expect(refWithChain).toBeDefined();
    expect(refWithChain!.propertyChain).toContain('arguments');
  });

  it('does not count function calls as variable references', () => {
    const text = '{{ GetUser() }}';
    const table = buildVariableTable(text);

    const refs = table.references.filter(r => r.name === 'GetUser');
    expect(refs.length).toBe(0);
  });

  it('does not count keywords as references', () => {
    const text = '{% if true %}\n{% endif %}';
    const table = buildVariableTable(text);

    const refs = table.references.filter(r => r.name === 'if' || r.name === 'true');
    expect(refs.length).toBe(0);
  });

  it('extracts references from set value expressions', () => {
    const text = '{% set x = 1 %}\n{% set y = x + 1 %}';
    const table = buildVariableTable(text);

    const xRefs = table.references.filter(r => r.name === 'x');
    expect(xRefs.length).toBeGreaterThanOrEqual(1);
  });

  it('extracts references from if conditions', () => {
    const text = '{% set flag = true %}\n{% if flag %}\nhello\n{% endif %}';
    const table = buildVariableTable(text);

    const flagRefs = table.references.filter(r => r.name === 'flag');
    expect(flagRefs.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// 5. Undefined / Unused detection
// ---------------------------------------------------------------------------

describe('Variable Tracker - Diagnostics', () => {
  it('detects undefined variable references', () => {
    const text = '{{ undefined_var }}';
    const table = buildVariableTable(text);

    const undefined_refs = getUndefinedReferences(table);
    const names = undefined_refs.map(r => r.name);
    expect(names).toContain('undefined_var');
  });

  it('does not flag defined variables as undefined', () => {
    const text = '{% set x = 1 %}\n{{ x }}';
    const table = buildVariableTable(text);

    const undefined_refs = getUndefinedReferences(table);
    const names = undefined_refs.map(r => r.name);
    expect(names).not.toContain('x');
  });

  it('does not flag skill parameters as undefined', () => {
    const text = '{{ greeting }}';
    const table = buildVariableTable(text, [{ name: 'greeting', required: true }]);

    const undefined_refs = getUndefinedReferences(table);
    const names = undefined_refs.map(r => r.name);
    expect(names).not.toContain('greeting');
  });

  it('does not flag implicit variables as undefined', () => {
    const text = '{% if none %}\n{{ json }}\n{% endif %}';
    const table = buildVariableTable(text);

    const undefined_refs = getUndefinedReferences(table);
    const names = undefined_refs.map(r => r.name);
    expect(names).not.toContain('none');
    expect(names).not.toContain('json');
  });

  it('does not flag keyword argument names as undefined variables', () => {
    const text = '{{ SendSystemEvent(eventIdn="extend_session", connectorIdn="system") }}';
    const table = buildVariableTable(text);

    const undefined_refs = getUndefinedReferences(table);
    const names = undefined_refs.map(r => r.name);
    expect(names).not.toContain('eventIdn');
    expect(names).not.toContain('connectorIdn');
  });

  it('does not flag keyword args in multi-param action calls', () => {
    const text = '{{ SendCommand(commandIdn="stop_call", integrationIdn="vapi", actorId=actor.id) }}';
    const table = buildVariableTable(text);

    const undefined_refs = getUndefinedReferences(table);
    const names = undefined_refs.map(r => r.name);
    expect(names).not.toContain('commandIdn');
    expect(names).not.toContain('integrationIdn');
    expect(names).not.toContain('actorId');
  });

  it('still detects real variable references in action call values', () => {
    const text = '{% set my_var = "test" %}\n{{ SendCommand(commandIdn=my_var) }}';
    const table = buildVariableTable(text);

    // my_var should be a reference (value side of keyword arg), not flagged as undefined
    const undefined_refs = getUndefinedReferences(table);
    const names = undefined_refs.map(r => r.name);
    expect(names).not.toContain('my_var');
    // commandIdn should not be a reference (it's the keyword arg name)
    expect(names).not.toContain('commandIdn');
  });

  it('detects unused variable definitions', () => {
    const text = '{% set unused = "x" %}';
    const table = buildVariableTable(text);

    const unused = getUnusedDefinitions(table);
    const names = unused.map(d => d.name);
    expect(names).toContain('unused');
  });

  it('does not flag used variables as unused', () => {
    const text = '{% set x = 1 %}\n{{ x }}';
    const table = buildVariableTable(text);

    const unused = getUnusedDefinitions(table);
    const names = unused.map(d => d.name);
    expect(names).not.toContain('x');
  });

  it('does not flag parameters as unused', () => {
    const text = 'no references here';
    const table = buildVariableTable(text, [{ name: 'param1', required: true }]);

    const unused = getUnusedDefinitions(table);
    const names = unused.map(d => d.name);
    expect(names).not.toContain('param1');
  });

  it('does not flag loop context as unused', () => {
    const text = '{% for item in list %}\n{{ item }}\n{% endfor %}';
    const table = buildVariableTable(text);

    const unused = getUnusedDefinitions(table);
    const names = unused.map(d => d.name);
    expect(names).not.toContain('loop');
  });
});

// ---------------------------------------------------------------------------
// 6. findDefinition
// ---------------------------------------------------------------------------

describe('Variable Tracker - findDefinition', () => {
  it('finds the most recent definition before the usage line', () => {
    const text = '{% set x = 1 %}\n{% set x = 2 %}\n{{ x }}';
    const table = buildVariableTable(text);

    const def = findDefinition(table, 'x', 2);
    expect(def).toBeDefined();
    expect(def!.line).toBe(1); // The second set on line 1
  });

  it('finds parameter definition when no set exists', () => {
    const text = '{{ param1 }}';
    const table = buildVariableTable(text, [{ name: 'param1', required: true }]);

    const def = findDefinition(table, 'param1', 0);
    expect(def).toBeDefined();
    expect(def!.source).toBe('parameter');
  });

  it('returns undefined for unknown variables', () => {
    const text = '{{ x }}';
    const table = buildVariableTable(text);

    const def = findDefinition(table, 'unknown', 0);
    expect(def).toBeUndefined();
  });

  it('respects for-loop scope', () => {
    const text = '{% for item in list %}\n{{ item }}\n{% endfor %}\n{{ item }}';
    const table = buildVariableTable(text);

    // Inside loop - should find it
    const defInLoop = findDefinition(table, 'item', 1);
    expect(defInLoop).toBeDefined();

    // After loop - should NOT find it (out of scope)
    const defAfterLoop = findDefinition(table, 'item', 3);
    expect(defAfterLoop).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 7. Literal value tracking + branch analysis
// ---------------------------------------------------------------------------

describe('Variable Tracker - Literal Values & Branches', () => {
  it('tracks literal string value', () => {
    const text = '{% set x = "hello" %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('x')![0];
    expect(def.literalValues).toEqual(['hello']);
  });

  it('tracks literal number value', () => {
    const text = '{% set x = 42 %}';
    const table = buildVariableTable(text);

    const def = table.definitions.get('x')![0];
    expect(def.literalValues).toEqual(['42']);
  });

  it('merges literal values from multiple assignments', () => {
    const text = '{% set x = "a" %}\n{% set x = "b" %}';
    const table = buildVariableTable(text);

    const defs = table.definitions.get('x')!;
    // The last definition should have merged literals from branch analysis
    const lastDef = defs[defs.length - 1];
    expect(lastDef.literalValues).toBeDefined();
    expect(lastDef.literalValues!.length).toBe(2);
    expect(lastDef.literalValues).toContain('a');
    expect(lastDef.literalValues).toContain('b');
  });

  it('does not merge non-literal values', () => {
    const text = '{% set x = "a" %}\n{% set x = GetUser() %}';
    const table = buildVariableTable(text);

    const defs = table.definitions.get('x')!;
    // The second definition has no literal, so no merge should happen
    const lastDef = defs[defs.length - 1];
    // Since not all defs have literals, the last one keeps its own state
    expect(lastDef.literalValues).toBeUndefined();
  });

  it('handles Set(name="x", value="lit") literal tracking', () => {
    const text = '{{ Set(name="mode", value="active") }}';
    const table = buildVariableTable(text);

    const defs = table.definitions.get('mode');
    expect(defs).toBeDefined();
    expect(defs!.some(d => d.source === 'set-action')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. Edge cases
// ---------------------------------------------------------------------------

describe('Variable Tracker - Edge Cases', () => {
  it('handles empty file', () => {
    const table = buildVariableTable('');
    expect(table.definitions.size).toBe(0);
    expect(table.references.length).toBe(0);
  });

  it('handles file with only text (no template syntax)', () => {
    const table = buildVariableTable('Hello world, this is plain text.');
    expect(table.definitions.size).toBe(0);
    expect(table.references.length).toBe(0);
  });

  it('handles nested function calls in set', () => {
    const text = '{% set x = Concat(a=GetUser().name, b=" test") %}';
    const table = buildVariableTable(text);

    expect(table.definitions.has('x')).toBe(true);
  });

  it('handles multiple for-loops', () => {
    const text = [
      '{% for a in list1 %}{{ a }}{% endfor %}',
      '{% for b in list2 %}{{ b }}{% endfor %}',
    ].join('\n');

    const table = buildVariableTable(text);

    expect(table.definitions.has('a')).toBe(true);
    expect(table.definitions.has('b')).toBe(true);
  });

  it('handles Guidance-style templates', () => {
    const text = '{{#system}}\nYou are helpful.\n{{/system}}\n{{#user}}\n{{ user_message }}\n{{/user}}';
    const table = buildVariableTable(text);

    // Should extract user_message as a reference
    const refs = table.references.filter(r => r.name === 'user_message');
    expect(refs.length).toBeGreaterThanOrEqual(1);
  });

  it('handles variables inside filters', () => {
    const text = '{% set items = [1, 2, 3] %}\n{{ items | join(", ") }}';
    const table = buildVariableTable(text);

    const refs = table.references.filter(r => r.name === 'items');
    expect(refs.length).toBeGreaterThanOrEqual(1);
  });

  it('allNames includes all defined variable names', () => {
    const text = '{% set x = 1 %}\n{% for y in list %}\n{% endfor %}';
    const table = buildVariableTable(text, [{ name: 'param', required: true }]);

    expect(table.allNames.has('x')).toBe(true);
    expect(table.allNames.has('y')).toBe(true);
    expect(table.allNames.has('param')).toBe(true);
    expect(table.allNames.has('loop')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 9. Guard condition pattern (if-not-var)
// ---------------------------------------------------------------------------

describe('Variable Tracker - Guard Condition Pattern', () => {
  it('does not flag variable in {% if not X %} guard pattern', () => {
    const text = [
      '{% if not myvar %}',
      '    {% set myvar = "default" %}',
      '{% endif %}',
      '{{ myvar }}',
    ].join('\n');

    const table = buildVariableTable(text);
    const undef = getUndefinedReferences(table);
    const names = undef.map(r => r.name);

    // Neither the condition reference nor the post-condition usage should be flagged
    expect(names).not.toContain('myvar');
  });

  it('tags condition references with inCondition flag', () => {
    const text = [
      '{% if not myvar %}',
      '    {% set myvar = "default" %}',
      '{% endif %}',
      '{{ myvar }}',
    ].join('\n');

    const table = buildVariableTable(text);

    // The reference in the if-condition should have inCondition=true
    const condRef = table.references.find(r => r.name === 'myvar' && r.line === 0);
    expect(condRef).toBeDefined();
    expect(condRef!.inCondition).toBe(true);

    // The reference at {{ myvar }} should NOT have inCondition
    const usageRef = table.references.find(r => r.name === 'myvar' && r.line === 3);
    expect(usageRef).toBeDefined();
    expect(usageRef!.inCondition).toBeUndefined();
  });

  it('does not flag variable in {% elif %} condition', () => {
    const text = [
      '{% if something %}',
      '    {% set x = 1 %}',
      '{% elif x %}',
      '    {% set x = 2 %}',
      '{% endif %}',
    ].join('\n');

    const table = buildVariableTable(text);
    const undef = getUndefinedReferences(table);
    const names = undef.map(r => r.name);

    expect(names).not.toContain('x');
  });

  it('still flags truly undefined variables in conditions', () => {
    const text = '{% if not totally_unknown %}\nhello\n{% endif %}';
    const table = buildVariableTable(text);
    const undef = getUndefinedReferences(table);
    const names = undef.map(r => r.name);

    // totally_unknown is never defined anywhere - should still be flagged
    expect(names).toContain('totally_unknown');
  });

  it('handles guard pattern with else branch', () => {
    const text = [
      '{% if not actors %}',
      '    {% set actors = [] %}',
      '{% else %}',
      '    {% if actors is string %}',
      '        {% set actors = [] %}',
      '    {% endif %}',
      '{% endif %}',
      '{{ actors }}',
    ].join('\n');

    const table = buildVariableTable(text);
    const undef = getUndefinedReferences(table);
    const names = undef.map(r => r.name);

    expect(names).not.toContain('actors');
  });

  it('keeps Cat-41 scoping for non-guard conditional sets', () => {
    const text = [
      '{% if some_condition %}',
      '    {% set only_sometimes = "value" %}',
      '{% endif %}',
      '{{ only_sometimes }}',
    ].join('\n');

    const table = buildVariableTable(text);
    const undef = getUndefinedReferences(table);
    const names = undef.map(r => r.name);

    // only_sometimes is conditionally set (not a guard pattern)
    // so it should be scoped to the endif and flagged at line 3
    expect(names).toContain('only_sometimes');
  });
});
