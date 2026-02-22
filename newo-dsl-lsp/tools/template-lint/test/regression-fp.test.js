/**
 * Regression tests for false-positive elimination (Fixes 1-4, 7).
 *
 * Each describe block corresponds to one fix from the FP elimination plan.
 * Tests verify that previously-false-positive scenarios no longer produce
 * spurious diagnostics, while real errors are still caught.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import JinjaParser from '../src/parsers/jinja-parser.js';
import GuidanceParser from '../src/parsers/guidance-parser.js';
import SchemaValidator from '../src/validators/schema-validator.js';

// ============================================================================
// Fix 1: Document-level brace checking in jinja-parser.js
// Eliminates ~2,778 FPs from line-by-line E001/E002 counting
// ============================================================================

describe('Fix 1: Jinja document-level brace checking', () => {
  const parser = new JinjaParser();

  describe('no false positives on valid templates', () => {
    it('should not flag dict literals inside expressions', () => {
      const content = '{{ {"key": "value", "key2": 123} }}';
      const result = parser.parse(content, 'test.jinja');
      const braceErrors = result.diagnostics.filter(d =>
        d.code === 'E001' || d.code === 'E002'
      );
      expect(braceErrors).toHaveLength(0);
    });

    it('should not flag nested dict literals', () => {
      const content = '{{ {"outer": {"inner": "value"}} }}';
      const result = parser.parse(content, 'test.jinja');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E001');
      expect(braceErrors).toHaveLength(0);
    });

    it('should not flag braces inside string literals', () => {
      const content = '{{ "this has {{ and }} inside" }}';
      const result = parser.parse(content, 'test.jinja');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E001');
      expect(braceErrors).toHaveLength(0);
    });

    it('should not flag braces inside Jinja comments', () => {
      const content = '{# This comment has {{ unbalanced braces #}\n{{ Return() }}';
      const result = parser.parse(content, 'test.jinja');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E001');
      expect(braceErrors).toHaveLength(0);
    });

    it('should not flag multi-line expressions', () => {
      const content = [
        '{{ SendMessage(',
        '  message="hello",',
        '  actorIds=GetActors()',
        ') }}'
      ].join('\n');
      const result = parser.parse(content, 'test.jinja');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E001');
      expect(braceErrors).toHaveLength(0);
    });

    it('should not flag multi-line statements', () => {
      const content = [
        '{% set data = {',
        '  "name": "test",',
        '  "value": 42',
        '} %}'
      ].join('\n');
      const result = parser.parse(content, 'test.jinja');
      const stmtErrors = result.diagnostics.filter(d => d.code === 'E002');
      expect(stmtErrors).toHaveLength(0);
    });

    it('should not flag expression braces inside statement blocks', () => {
      const content = '{% set x = "{{ not an expression }}" %}';
      const result = parser.parse(content, 'test.jinja');
      const braceErrors = result.diagnostics.filter(d =>
        d.code === 'E001' || d.code === 'E002'
      );
      expect(braceErrors).toHaveLength(0);
    });

    it('should handle mixed expression and statement blocks', () => {
      const content = [
        '{% if condition %}',
        '  {{ SendMessage(message="hello") }}',
        '{% else %}',
        '  {{ Return() }}',
        '{% endif %}'
      ].join('\n');
      const result = parser.parse(content, 'test.jinja');
      const braceErrors = result.diagnostics.filter(d =>
        d.code === 'E001' || d.code === 'E002'
      );
      expect(braceErrors).toHaveLength(0);
    });

    it('should handle escaped quotes in strings', () => {
      const content = '{{ "she said \\"hello\\"" }}';
      const result = parser.parse(content, 'test.jinja');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E001');
      expect(braceErrors).toHaveLength(0);
    });
  });

  describe('true positives still caught', () => {
    it('should flag actually unbalanced expression braces', () => {
      const content = '{{ SendMessage(message="hi")';
      const result = parser.parse(content, 'test.jinja');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E001');
      expect(braceErrors.length).toBeGreaterThan(0);
    });

    it('should flag actually unbalanced statement braces', () => {
      const content = '{% set x = 1';
      const result = parser.parse(content, 'test.jinja');
      const stmtErrors = result.diagnostics.filter(d => d.code === 'E002');
      expect(stmtErrors.length).toBeGreaterThan(0);
    });

    it('should flag orphaned closing braces', () => {
      const content = 'some text }} here';
      const result = parser.parse(content, 'test.jinja');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E001');
      expect(braceErrors.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Fix 2: Document-level brace checking in guidance-parser.js
// Eliminates ~526 FPs from line-by-line E020 counting
// ============================================================================

describe('Fix 2: Guidance document-level brace checking', () => {
  const parser = new GuidanceParser();

  describe('no false positives on valid templates', () => {
    it('should not flag balanced braces across multiple lines', () => {
      const content = [
        '{{#system}}',
        'You are a helpful assistant.',
        '{{/system}}',
        '{{#user}}',
        '{{input}}',
        '{{/user}}',
        '{{#assistant}}',
        '{{Return(val=response)}}',
        '{{/assistant}}'
      ].join('\n');
      const result = parser.parse(content, 'test.guidance');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E020');
      expect(braceErrors).toHaveLength(0);
    });

    it('should not flag Guidance comments', () => {
      const content = '{{!-- This is a comment --}}{{Return()}}';
      const result = parser.parse(content, 'test.guidance');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E020');
      expect(braceErrors).toHaveLength(0);
    });

    it('should not flag braces inside string arguments', () => {
      const content = '{{Set(name="x", value="has {{ inside")}}';
      const result = parser.parse(content, 'test.guidance');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E020');
      expect(braceErrors).toHaveLength(0);
    });

    it('should handle whitespace control markers', () => {
      const content = '{{~#system~}}prompt{{~/system}}{{~Return()~}}';
      const result = parser.parse(content, 'test.guidance');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E020');
      expect(braceErrors).toHaveLength(0);
    });
  });

  describe('true positives still caught', () => {
    it('should flag actually unbalanced braces', () => {
      const content = '{{Return()';
      const result = parser.parse(content, 'test.guidance');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E020');
      expect(braceErrors.length).toBeGreaterThan(0);
    });

    it('should flag orphaned closing braces', () => {
      const content = 'some text }} here';
      const result = parser.parse(content, 'test.guidance');
      const braceErrors = result.diagnostics.filter(d => d.code === 'E020');
      expect(braceErrors.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Fix 3: Handle ~ whitespace control in guidance block detection
// Eliminates ~200 FPs from E010/E011 block mismatch
// ============================================================================

describe('Fix 3: Guidance whitespace control in blocks', () => {
  const parser = new GuidanceParser();

  describe('no false positives with ~ syntax', () => {
    it('should match {{~#system~}} with {{~/system}}', () => {
      const content = '{{~#system~}}prompt{{~/system}}';
      const result = parser.parse(content, 'test.guidance');
      const blockErrors = result.diagnostics.filter(d =>
        d.code === 'E010' || d.code === 'E011' || d.code === 'E012'
      );
      expect(blockErrors).toHaveLength(0);
    });

    it('should match {{#system~}} with {{/system}}', () => {
      const content = '{{#system~}}prompt{{/system}}';
      const result = parser.parse(content, 'test.guidance');
      const blockErrors = result.diagnostics.filter(d =>
        d.code === 'E010' || d.code === 'E011'
      );
      expect(blockErrors).toHaveLength(0);
    });

    it('should match {{~#user}} with {{~/user}}', () => {
      const content = '{{~#user}}message{{~/user}}';
      const result = parser.parse(content, 'test.guidance');
      const blockErrors = result.diagnostics.filter(d =>
        d.code === 'E010' || d.code === 'E011'
      );
      expect(blockErrors).toHaveLength(0);
    });

    it('should handle nested blocks with ~ on all positions', () => {
      const content = [
        '{{~#system~}}',
        '{{~#if condition~}}',
        'text',
        '{{~/if~}}',
        '{{~/system~}}'
      ].join('\n');
      const result = parser.parse(content, 'test.guidance');
      const blockErrors = result.diagnostics.filter(d =>
        d.code === 'E010' || d.code === 'E011'
      );
      expect(blockErrors).toHaveLength(0);
    });

    it('should handle mixed ~ and non-~ blocks', () => {
      const content = [
        '{{#system~}}',
        'prompt',
        '{{~/system}}',
        '{{#user}}',
        'message',
        '{{/user}}'
      ].join('\n');
      const result = parser.parse(content, 'test.guidance');
      const blockErrors = result.diagnostics.filter(d =>
        d.code === 'E010' || d.code === 'E011'
      );
      expect(blockErrors).toHaveLength(0);
    });
  });

  describe('true positives still caught', () => {
    it('should still flag unclosed blocks with ~', () => {
      const content = '{{~#system~}}prompt text but no close';
      const result = parser.parse(content, 'test.guidance');
      const errors = result.diagnostics.filter(d => d.code === 'E010');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should still flag mismatched blocks with ~', () => {
      const content = '{{~#system~}}prompt{{~/user~}}';
      const result = parser.parse(content, 'test.guidance');
      const errors = result.diagnostics.filter(d => d.code === 'E011');
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Fix 4: Expanded function whitelist in schema-validator.js
// Eliminates ~640 FPs from W101 unknown function warnings
// ============================================================================

describe('Fix 4: Expanded function/method whitelist', () => {
  let validator;

  beforeEach(() => {
    validator = new SchemaValidator('/nonexistent');
  });

  describe('Python builtins - no W101', () => {
    const pythonBuiltins = [
      'len', 'type', 'print', 'sorted', 'reversed', 'enumerate',
      'zip', 'map', 'filter', 'isinstance', 'hasattr', 'getattr',
      'setattr', 'callable', 'any', 'all', 'min', 'max', 'sum',
      'abs', 'round', 'pow', 'divmod', 'format', 'chr', 'ord',
      'hex', 'oct', 'bin', 'hash', 'id', 'repr',
    ];

    for (const name of pythonBuiltins) {
      it(`should not flag Python builtin: ${name}()`, () => {
        const parseResult = {
          skillCalls: [],
          builtinCalls: [],
          functionCalls: [{
            name,
            type: 'unknown',
            line: 1,
            column: 1
          }]
        };
        const diagnostics = validator.validate(parseResult);
        const warnings = diagnostics.filter(d => d.code === 'W101');
        expect(warnings).toHaveLength(0);
      });
    }
  });

  describe('Python string/list/dict methods - no W101', () => {
    const methods = [
      'replace', 'split', 'join', 'strip', 'lower', 'upper',
      'startswith', 'endswith', 'find', 'count', 'append',
      'extend', 'insert', 'pop', 'remove', 'update', 'items',
      'keys', 'values', 'get', 'sort', 'reverse', 'index',
    ];

    for (const name of methods) {
      it(`should not flag Python method: ${name}()`, () => {
        const parseResult = {
          skillCalls: [],
          builtinCalls: [],
          functionCalls: [{
            name,
            type: 'unknown',
            line: 1,
            column: 1
          }]
        };
        const diagnostics = validator.validate(parseResult);
        const warnings = diagnostics.filter(d => d.code === 'W101');
        expect(warnings).toHaveLength(0);
      });
    }
  });

  describe('Jinja filters - no W101', () => {
    const filters = [
      'tojson', 'fromjson', 'default', 'first', 'last',
      'length', 'unique', 'batch', 'reject', 'select',
      'groupby', 'trim', 'striptags', 'truncate', 'wordcount',
      'capitalize', 'title', 'urlencode', 'escape', 'safe', 'indent',
    ];

    for (const name of filters) {
      it(`should not flag Jinja filter: ${name}()`, () => {
        const parseResult = {
          skillCalls: [],
          builtinCalls: [],
          functionCalls: [{
            name,
            type: 'unknown',
            line: 1,
            column: 1
          }]
        };
        const diagnostics = validator.validate(parseResult);
        const warnings = diagnostics.filter(d => d.code === 'W101');
        expect(warnings).toHaveLength(0);
      });
    }
  });

  describe('Python datetime/re methods - no W101', () => {
    const methods = [
      'fromisoformat', 'strftime', 'strptime', 'isoformat',
      'timestamp', 'now', 'utcnow', 'today', 'timedelta', 'timezone',
      'sub', 'search', 'match', 'findall', 'compile',
    ];

    for (const name of methods) {
      it(`should not flag method: ${name}()`, () => {
        const parseResult = {
          skillCalls: [],
          builtinCalls: [],
          functionCalls: [{
            name,
            type: 'unknown',
            line: 1,
            column: 1
          }]
        };
        const diagnostics = validator.validate(parseResult);
        const warnings = diagnostics.filter(d => d.code === 'W101');
        expect(warnings).toHaveLength(0);
      });
    }
  });

  describe('Module prefix functions - no W101', () => {
    const prefixed = [
      'datetime_parse', 'json_encode', 'math_floor',
      're_match', 'zoneinfo_get',
    ];

    for (const name of prefixed) {
      it(`should not flag module-prefixed function: ${name}()`, () => {
        const parseResult = {
          skillCalls: [],
          builtinCalls: [],
          functionCalls: [{
            name,
            type: 'unknown',
            line: 1,
            column: 1
          }]
        };
        const diagnostics = validator.validate(parseResult);
        const warnings = diagnostics.filter(d => d.code === 'W101');
        expect(warnings).toHaveLength(0);
      });
    }
  });

  describe('truly unknown functions still flagged', () => {
    it('should flag completely unknown functions', () => {
      const parseResult = {
        skillCalls: [],
        builtinCalls: [],
        functionCalls: [{
          name: 'XyzBlahFunction',
          type: 'unknown',
          line: 1,
          column: 1
        }]
      };
      const diagnostics = validator.validate(parseResult);
      const warnings = diagnostics.filter(d => d.code === 'W101');
      expect(warnings).toHaveLength(1);
    });

    it('should flag misspelled functions with suggestions', () => {
      validator.builtinIndex.set('SendMessage', {
        name: 'SendMessage',
        parameters: []
      });

      const parseResult = {
        skillCalls: [],
        builtinCalls: [],
        functionCalls: [{
          name: 'SndMessage',
          type: 'unknown',
          line: 1,
          column: 1
        }]
      };
      const diagnostics = validator.validate(parseResult);
      const warnings = diagnostics.filter(d => d.code === 'W101');
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toContain('Did you mean');
    });
  });
});

// ============================================================================
// Fix 7: Concat/SendMessage parameter validation
// Eliminates ~400 FPs from E101 missing required param
// ============================================================================

describe('Fix 7: Positional parameter acceptance', () => {
  let validator;

  beforeEach(() => {
    validator = new SchemaValidator('/nonexistent');
  });

  it('should not flag Concat with positional args as missing required param', () => {
    validator.builtinIndex.set('Concat', {
      name: 'Concat',
      parameters: [{ name: 'arguments', required: false }]
    });

    const parseResult = {
      skillCalls: [],
      builtinCalls: [{
        name: 'Concat',
        parameters: [
          { value: '"hello"', type: 'positional' },
          { value: '" "', type: 'positional' },
          { value: '"world"', type: 'positional' }
        ],
        line: 1,
        column: 1
      }],
      functionCalls: []
    };
    const diagnostics = validator.validate(parseResult);
    const errors = diagnostics.filter(d => d.code === 'E101');
    expect(errors).toHaveLength(0);
  });

  it('should not flag DUMMY with positional args', () => {
    validator.builtinIndex.set('DUMMY', {
      name: 'DUMMY',
      parameters: [{ name: 'value', required: false }]
    });

    const parseResult = {
      skillCalls: [],
      builtinCalls: [{
        name: 'DUMMY',
        parameters: [
          { value: '"test"', type: 'positional' }
        ],
        line: 1,
        column: 1
      }],
      functionCalls: []
    };
    const diagnostics = validator.validate(parseResult);
    const errors = diagnostics.filter(d => d.code === 'E101');
    expect(errors).toHaveLength(0);
  });

  it('should still flag truly missing required params', () => {
    validator.builtinIndex.set('TestFunc', {
      name: 'TestFunc',
      parameters: [{ name: 'requiredArg', required: true }]
    });

    const parseResult = {
      skillCalls: [],
      builtinCalls: [{
        name: 'TestFunc',
        parameters: [],
        line: 1,
        column: 1
      }],
      functionCalls: []
    };
    const diagnostics = validator.validate(parseResult);
    const errors = diagnostics.filter(d => d.code === 'E101');
    expect(errors).toHaveLength(1);
  });
});

// ============================================================================
// Fix: Multi-line {# ... #} comment handling in jinja-parser
// Eliminates FPs from code inside block comments
// ============================================================================

describe('Jinja multi-line comment handling', () => {
  const parser = new JinjaParser();

  it('should not extract expressions from inside multi-line {# ... #} comments', () => {
    const content = `{# This is a comment block
{{ SomeFunc(arg=1) }}
{% set x = 5 %}
{{Do(actionName=SomeSkill)}}
#}
{{ ValidExpression() }}`;
    const result = parser.parse(content, 'test.nsl');
    // Only the expression outside the comment should be extracted
    expect(result.expressions).toHaveLength(1);
    expect(result.expressions[0].content).toContain('ValidExpression');
  });

  it('should handle single-line comments correctly', () => {
    const content = `{# This is a single-line comment #}
{{ AfterComment() }}`;
    const result = parser.parse(content, 'test.nsl');
    expect(result.expressions).toHaveLength(1);
    expect(result.expressions[0].content).toContain('AfterComment');
  });

  it('should handle entire file inside comment', () => {
    const content = `{# TODO: This entire file is commented out
{{ SetState(name="x", value="y") }}
{{ Do(actionName=OldSkill) }}
{% for item in list %}
  {{ item }}
{% endfor %}
#}`;
    const result = parser.parse(content, 'test.nsl');
    expect(result.expressions).toHaveLength(0);
    expect(result.statements).toHaveLength(0);
    expect(result.diagnostics.filter(d => d.code !== 'E001' && d.code !== 'E002')).toHaveLength(0);
  });

  it('should process code after comment close on same line', () => {
    const content = `{# comment
spanning multiple lines
#}{{ ValidCall() }}`;
    const result = parser.parse(content, 'test.nsl');
    expect(result.expressions).toHaveLength(1);
    expect(result.expressions[0].content).toContain('ValidCall');
  });

  it('should handle comment with inline comment on first line', () => {
    const content = `{# migration deprecated #}
{{ StillValid() }}`;
    const result = parser.parse(content, 'test.nsl');
    expect(result.expressions).toHaveLength(1);
    expect(result.expressions[0].content).toContain('StillValid');
  });
});

// ============================================================================
// Fix: String-aware function extraction
// Eliminates FPs where English words in strings look like function calls
// ============================================================================

describe('String-aware function extraction', () => {
  const parser = new JinjaParser();

  it('should not flag function-like words inside strings', () => {
    const content = '{{ SendMessage(text="Please book(a reservation) for the worker(s)") }}';
    const result = parser.parse(content, 'test.nsl');
    // Should find SendMessage but NOT book or worker
    const funcNames = result.functionCalls.map(f => f.name);
    expect(funcNames).not.toContain('book');
    expect(funcNames).not.toContain('worker');
  });

  it('should extract functions outside strings', () => {
    const content = '{{ Concat("hello ", get_name()) }}';
    const result = parser.parse(content, 'test.nsl');
    const funcNames = result.functionCalls.map(f => f.name);
    expect(funcNames).toContain('get_name');
  });
});

// ============================================================================
// Fix: parseParameter - nested calls not parsed as keyword args
// ============================================================================

describe('parseParameter nested function handling', () => {
  const parser = new JinjaParser();

  it('should treat Stringify(GetValueJSON(...)) as positional arg, not keyword', () => {
    const content = '{{ Stringify(GetValueJSON(obj=data, key="name")) }}';
    const result = parser.parse(content, 'test.nsl');
    // The inner call should not be parsed as a keyword param of Stringify
    const stringifyCalls = result.builtinCalls.filter(c => c.name === 'Stringify');
    if (stringifyCalls.length > 0) {
      const params = stringifyCalls[0].parameters;
      const keywordParams = params.filter(p => p.type === 'keyword');
      // 'GetValueJSON(obj' should NOT be a keyword param name
      expect(keywordParams.every(p => /^[A-Za-z_][A-Za-z0-9_]*$/.test(p.name))).toBe(true);
    }
  });
});
