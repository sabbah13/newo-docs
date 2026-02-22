/**
 * Targeted test: filters (pipe operator) inside function call arguments.
 * Reproduces the false error on: {% for i in range(0, actors | length, 36) %}
 */

import { describe, it, expect } from 'vitest';
import {
  buildVariableTable,
  getUndefinedReferences,
  getUnusedDefinitions,
} from '../src/variable-tracker';
import {
  validateTemplateText,
  extractTopLevelParams,
} from '../src/validate';

describe('Filters inside function arguments', () => {
  const template = [
    '{% if not actors %}',
    '    {% set actors = [] %}',
    '{% else %}',
    '    {% if actors is string %}',
    '        {% set transformed_array = [] %}',
    '        {% for i in range(0, actors | length, 36) %}',
    '            {{transformed_array.append(actors[i:i+36])}}',
    '        {% endfor %}',
    '        {% set actors = transformed_array %}',
    '    {% endif %}',
    '{% endif %}',
    '{{ actors }}',
  ].join('\n');

  it('variable tracker should not flag actors as undefined in range(0, actors | length, 36)', () => {
    const table = buildVariableTable(template);
    const undef = getUndefinedReferences(table);
    const undefNames = undef.map(r => r.name);

    console.log('Undefined refs:', undef.map(r => ({ name: r.name, line: r.line, col: r.column })));
    console.log('All names:', [...table.allNames]);

    // actors is defined via {% set %} earlier - should NOT be undefined
    // (the first branch sets it, so it's in allNames)
    expect(undefNames).not.toContain('actors');
  });

  it('variable tracker should not flag i as undefined inside for-loop body', () => {
    const table = buildVariableTable(template);
    const undef = getUndefinedReferences(table);
    const undefNames = undef.map(r => r.name);

    // i is the for-loop variable - should be in scope inside the loop
    expect(undefNames).not.toContain('i');
  });

  it('variable tracker should not flag transformed_array as undefined', () => {
    const table = buildVariableTable(template);
    const undef = getUndefinedReferences(table);
    const undefNames = undef.map(r => r.name);

    expect(undefNames).not.toContain('transformed_array');
  });

  it('full validation should produce no errors on filter-in-args pattern', () => {
    const result = validateTemplateText(template, {
      uri: 'test.nsl',
      skillIndex: new Map(),
      skillIndexBuilt: false,
    });

    console.log('Diagnostics:', result.diagnostics.map(d => ({
      line: d.range.start.line,
      col: d.range.start.character,
      msg: d.message,
      severity: d.severity,
    })));

    // Should have NO errors (severity 1 = Error)
    const errors = result.diagnostics.filter(d => d.severity === 1);
    expect(errors).toEqual([]);
  });

  it('full validation should produce no warnings for defined variables', () => {
    const result = validateTemplateText(template, {
      uri: 'test.nsl',
      skillIndex: new Map(),
      skillIndexBuilt: false,
    });

    // Filter out expected warnings (unused vars are OK)
    const undefinedWarnings = result.diagnostics.filter(d =>
      d.message.includes('Undefined variable')
    );
    console.log('Undefined variable warnings:', undefinedWarnings.map(d => d.message));

    // actors, i, transformed_array should all be recognized
    for (const w of undefinedWarnings) {
      expect(w.message).not.toContain("'actors'");
      expect(w.message).not.toContain("'i'");
      expect(w.message).not.toContain("'transformed_array'");
    }
  });

  // Test the specific real-world file pattern
  it('should handle the full get_memory.nsl pattern without false positives', () => {
    const realTemplate = [
      '{% set actors = [] %}',
      '{% set actors = actors | map(attribute=\'id\') | map(\'string\') | list %}',
      '{% if actors is string %}',
      '    {% set transformed_array = [] %}',
      '    {% for i in range(0, actors | length, 36) %}',
      '        {{transformed_array.append(actors[i:i+36])}}',
      '    {% endfor %}',
      '    {% set actors = transformed_array %}',
      '{% endif %}',
    ].join('\n');

    const result = validateTemplateText(realTemplate, {
      uri: 'test.nsl',
      skillIndex: new Map(),
      skillIndexBuilt: false,
    });

    const errors = result.diagnostics.filter(d => d.severity === 1);
    console.log('Errors on real pattern:', errors.map(d => ({
      line: d.range.start.line,
      msg: d.message,
    })));
    expect(errors).toEqual([]);
  });

  // Test with actors as a skill parameter (realistic scenario)
  it('should not flag actors as undefined when passed as skill parameter', () => {
    const result = validateTemplateText(template, {
      uri: 'test.nsl',
      skillIndex: new Map(),
      skillIndexBuilt: false,
      skillParams: [
        { name: 'actors', required: false },
      ],
    });

    const undefinedWarnings = result.diagnostics.filter(d =>
      d.message.includes('Undefined variable')
    );
    console.log('With skillParams - warnings:', undefinedWarnings.map(d => d.message));
    expect(undefinedWarnings).toEqual([]);
  });

  // Test the CORE issue: if-not-var pattern uses var before set
  it('should handle if-not-var guard pattern (use-before-define for conditionally-set variables)', () => {
    const guardPattern = [
      '{% if not myvar %}',
      '    {% set myvar = "default" %}',
      '{% endif %}',
      '{{ myvar }}',
    ].join('\n');

    const table = buildVariableTable(guardPattern);
    const undef = getUndefinedReferences(table);
    const undefNames = undef.map(r => r.name);
    console.log('Guard pattern undefined:', undef.map(r => ({ name: r.name, line: r.line })));

    // myvar is used in the guard condition BEFORE it's set - this is a known pattern
    // that should NOT be flagged as undefined
    expect(undefNames).not.toContain('myvar');
  });

  // Test filter-in-args specifically with defined variables
  it('should correctly parse filter pipe in function args without false errors', () => {
    const filterInArgs = [
      '{% set items = "abcdef" %}',
      '{% for i in range(0, items | length, 2) %}',
      '    {{ items[i:i+2] }}',
      '{% endfor %}',
    ].join('\n');

    const result = validateTemplateText(filterInArgs, {
      uri: 'test.nsl',
      skillIndex: new Map(),
      skillIndexBuilt: false,
    });

    const allDiags = result.diagnostics;
    console.log('Filter-in-args diagnostics:', allDiags.map(d => ({
      line: d.range.start.line,
      msg: d.message,
      severity: d.severity,
    })));

    const errors = allDiags.filter(d => d.severity === 1);
    const undefinedWarnings = allDiags.filter(d => d.message.includes('Undefined variable'));
    expect(errors).toEqual([]);
    expect(undefinedWarnings).toEqual([]);
  });
});
