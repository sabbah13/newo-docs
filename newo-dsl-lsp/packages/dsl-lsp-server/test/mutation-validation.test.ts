/**
 * Mutation-based validation tests for the Newo DSL LSP server.
 *
 * Each test takes a known-good template (or synthetic snippet), applies a
 * specific mutation to introduce an error, and verifies that
 * validateTemplateText() - the real production validation function -
 * produces the expected diagnostic.
 *
 * 30 categories across 6 groups:
 *   A: Brace/Block Errors (1-7)
 *   B: Function Name Errors (8-13)
 *   C: Parameter Errors (14-17)
 *   D: Constraint Violations (18-24)
 *   E: Variable Errors (25-27)
 *   F: Combined/Complex Errors (28-30)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { DiagnosticSeverity } from 'vscode-languageserver/node';
import type { Diagnostic as LspDiagnostic } from 'vscode-languageserver/node';

import { validateTemplateText, type ValidateOptions } from '../src/validate';
import { JinjaParser } from '@newo-dsl/analyzer';
import type { SkillInfo, SkillParameter } from '../src/format-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '../../../..');
const TEMP_DIR = path.resolve(__dirname, '../../../temp/mutation-test');

/** Default options: empty skill index, skill index marked as built. */
function opts(overrides?: Partial<ValidateOptions>): ValidateOptions {
  return {
    uri: 'file:///test/template.jinja',
    skillIndex: new Map<string, SkillInfo>(),
    skillIndexBuilt: true,
    ...overrides,
  };
}

/** Shorthand: run validation on a template string with default options. */
function validate(text: string, overrides?: Partial<ValidateOptions>) {
  return validateTemplateText(text, opts(overrides));
}

/** Filter diagnostics by severity. */
function errors(diags: LspDiagnostic[]) {
  return diags.filter(d => d.severity === DiagnosticSeverity.Error);
}
function warnings(diags: LspDiagnostic[]) {
  return diags.filter(d => d.severity === DiagnosticSeverity.Warning);
}
function hints(diags: LspDiagnostic[]) {
  return diags.filter(d => d.severity === DiagnosticSeverity.Hint);
}

/** Check if any diagnostic message matches a regex (returns boolean). */
function hasDiag(diags: LspDiagnostic[], pattern: RegExp, severity?: number): boolean {
  const filtered = severity !== undefined ? diags.filter(d => d.severity === severity) : diags;
  return filtered.some(d => pattern.test(d.message));
}

/** Assert at least one diagnostic message matches a regex. */
function expectDiag(diags: LspDiagnostic[], pattern: RegExp, severity?: number) {
  const filtered = severity !== undefined ? diags.filter(d => d.severity === severity) : diags;
  const found = filtered.some(d => pattern.test(d.message));
  if (!found) {
    const msgs = filtered.map(d => `  [${d.severity}] ${d.message}`).join('\n');
    expect.fail(
      `Expected diagnostic matching ${pattern}\nGot:\n${msgs || '  (none)'}`,
    );
  }
}

const parser = new JinjaParser();

// Source template paths (for real-file mutations)
const SOURCE_FILES = {
  v1_guidance_simple: path.join(ROOT, 'project/ConvoAgent/CAActionCallTransferFlow/AnalyzeConversationSkill.guidance'),
  v1_guidance_complex: path.join(ROOT, 'project/ConvoAgent/CAActionCallTransferFlow/_transferCallSkill.guidance'),
};

// Loaded templates (available if files exist)
const templates: Record<string, string> = {};

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeAll(() => {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  for (const [key, filePath] of Object.entries(SOURCE_FILES)) {
    if (fs.existsSync(filePath)) {
      templates[key] = fs.readFileSync(filePath, 'utf-8');
    }
  }
});

afterAll(() => {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
});

// ===========================================================================
// A: Brace / Block Errors (1-7)
// ===========================================================================

describe('Category A: Brace/Block Errors', () => {
  it('Cat-01: Missing closing }} produces unbalanced expression error', () => {
    // Remove one }} from a Set call
    const text = '{{Set(name="x", value="y")\nsome text\n{{SendMessage(message="hi")}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Unbalanced expression braces/, DiagnosticSeverity.Error);
  });

  it('Cat-02: Missing closing %} produces unbalanced statement error', () => {
    const text = '{% if condition\n  {{SendMessage(message="hi")}}\n{% endif %}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Unbalanced statement braces/, DiagnosticSeverity.Error);
  });

  it('Cat-03: Missing closing #} detected by JinjaParser (E003)', () => {
    const text = '{# This is a comment without closing\n{{SendMessage(message="hi")}}';
    const result = parser.parse(text, 'test.jinja');
    const e003 = result.diagnostics.filter(d => d.code === 'E003');
    expect(e003.length).toBeGreaterThan(0);
    expect(e003[0].message).toMatch(/Unbalanced comment braces/);
  });

  it('Cat-04: Extra opening {{ produces unbalanced expression error', () => {
    const text = '{{ {{Set(name="x", value="y")}}\n{{SendMessage(message="hi")}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Unbalanced expression braces/, DiagnosticSeverity.Error);
  });

  it('Cat-05: Unclosed guidance block detected by JinjaParser (E010)', () => {
    const text = '{{#if condition}}Hello{{#if nested}}world{{/if}}';
    // Missing {{/if}} for the outer block
    const result = parser.parse(text, 'test.guidance');
    const e010 = result.diagnostics.filter(d => d.code === 'E010');
    expect(e010.length).toBeGreaterThan(0);
    expect(e010[0].message).toMatch(/Unclosed guidance block/);
  });

  it('Cat-06: Mismatched guidance block detected by JinjaParser (E012)', () => {
    const text = '{{#if condition}}Hello{{/user}}';
    const result = parser.parse(text, 'test.guidance');
    const e012 = result.diagnostics.filter(d => d.code === 'E012');
    expect(e012.length).toBeGreaterThan(0);
    expect(e012[0].message).toMatch(/Mismatched block/);
  });

  it('Cat-07: Orphan closing block detected by JinjaParser (E011)', () => {
    const text = '{{/assistant}}\n{{SendMessage(message="hi")}}';
    const result = parser.parse(text, 'test.guidance');
    const e011 = result.diagnostics.filter(d => d.code === 'E011');
    expect(e011.length).toBeGreaterThan(0);
    expect(e011[0].message).toMatch(/Unexpected closing block/);
  });
});

// ===========================================================================
// B: Function Name Errors (8-13)
// ===========================================================================

describe('Category B: Function Name Errors', () => {
  it('Cat-08: Typo SendMessge suggests SendMessage', () => {
    const text = '{{SendMessge(message="Hello")}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Unknown function 'SendMessge'.*Did you mean 'SendMessage'/, DiagnosticSeverity.Error);
  });

  it('Cat-09: Typo GetCustomeAttribute suggests GetCustomerAttribute', () => {
    const text = '{{GetCustomeAttribute(field="name")}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Unknown function 'GetCustomeAttribute'.*Did you mean 'GetCustomerAttribute'/, DiagnosticSeverity.Error);
  });

  it('Cat-10: Wrong case sendMessage suggests SendMessage (expression context)', () => {
    const text = '{{sendMessage(message="Hello")}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Unknown function 'sendMessage'.*Did you mean 'SendMessage'/, DiagnosticSeverity.Error);
  });

  it('Cat-11: Completely unknown function - no suggestion', () => {
    const text = '{{DoSomethingWeird()}}';
    const { diagnostics } = validate(text);
    const unknownDiag = errors(diagnostics).filter(d => d.message.includes("Unknown function 'DoSomethingWeird'"));
    expect(unknownDiag.length).toBeGreaterThan(0);
    // Should NOT have "Did you mean" since distance is too large
    expect(unknownDiag[0].message).not.toMatch(/Did you mean/);
  });

  it('Cat-12: Swapped letters GetDateTmie suggests GetDateTime', () => {
    const text = '{{GetDateTmie(format="date")}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Unknown function 'GetDateTmie'.*Did you mean/, DiagnosticSeverity.Error);
  });

  it('Cat-13: Truncated name SetStat suggests SetState', () => {
    const text = '{{SetStat(name="x", value="y")}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Unknown function 'SetStat'.*Did you mean 'SetState'/, DiagnosticSeverity.Error);
  });
});

// ===========================================================================
// C: Parameter Errors (14-17)
// ===========================================================================

describe('Category C: Parameter Errors', () => {
  it('Cat-14: Typo in param name results in missing required param warning', () => {
    // SendMessage requires 'message'; 'mesage' is ignored as an unknown-on-builtin
    const text = '{{SendMessage(mesage="Hello")}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /SendMessage: missing required parameter 'message'/, DiagnosticSeverity.Warning);
  });

  it('Cat-15: Missing required param on GetCustomerAttribute', () => {
    const text = '{{GetCustomerAttribute()}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /GetCustomerAttribute: missing required parameter 'field'/, DiagnosticSeverity.Warning);
  });

  it('Cat-16: Multiple missing params on IsSimilar', () => {
    const text = '{{IsSimilar()}}';
    const { diagnostics } = validate(text);
    const missingVal1 = warnings(diagnostics).filter(d => d.message.includes("missing required parameter 'val1'"));
    const missingVal2 = warnings(diagnostics).filter(d => d.message.includes("missing required parameter 'val2'"));
    expect(missingVal1.length).toBeGreaterThan(0);
    expect(missingVal2.length).toBeGreaterThan(0);
  });

  it('Cat-17: Skills accept extra params - only missing required params flagged', () => {
    // Create a mock skill index with GreetingSkill
    const mockSkillIndex = new Map<string, SkillInfo>();
    mockSkillIndex.set('GreetingSkill', {
      name: 'GreetingSkill',
      filePath: '/skills/GreetingSkill.jinja',
      type: 'jinja',
      parameters: [
        { name: 'user_name', required: true },
        { name: 'language', required: false, defaultValue: 'en' },
      ],
    });

    const text = '{{GreetingSkill(usr_name="Alice")}}';
    const { diagnostics } = validate(text, { skillIndex: mockSkillIndex });

    // Skills accept extra user-defined params - 'usr_name' should NOT be flagged as unknown
    const unknownParam = hasDiag(diagnostics, /unknown parameter 'usr_name'/, DiagnosticSeverity.Error);
    expect(unknownParam).toBe(false);
    // But missing required 'user_name' should still be flagged
    expectDiag(diagnostics, /GreetingSkill: missing parameter 'user_name'/, DiagnosticSeverity.Warning);
  });
});

// ===========================================================================
// D: Constraint Violations (18-24)
// ===========================================================================

describe('Category D: Constraint Violations', () => {
  it('Cat-18: Invalid IsSimilar strategy', () => {
    const text = '{{IsSimilar(val1="a", val2="b", strategy="cosine")}}';
    const { diagnostics } = validate(text);
    expectDiag(
      diagnostics,
      /IsSimilar: invalid value 'cosine' for parameter 'strategy'. Allowed: hamming, levenshtein, symbols/,
      DiagnosticSeverity.Warning,
    );
  });

  it('Cat-19: Invalid GetDateTime format', () => {
    const text = '{{GetDateTime(format="timestamp")}}';
    const { diagnostics } = validate(text);
    expectDiag(
      diagnostics,
      /GetDateTime: invalid value 'timestamp' for parameter 'format'. Allowed: datetime, date, time/,
      DiagnosticSeverity.Warning,
    );
  });

  it('Cat-20: IsSimilar threshold too high (1.5 > max 1)', () => {
    const text = '{{IsSimilar(val1="a", val2="b", threshold="1.5")}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /IsSimilar: value 1\.5 for 'threshold' exceeds maximum 1/, DiagnosticSeverity.Warning);
  });

  it('Cat-21: IsSimilar threshold too low (-0.1 < min 0)', () => {
    const text = '{{IsSimilar(val1="a", val2="b", threshold="-0.1")}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /IsSimilar: value -0\.1 for 'threshold' is below minimum 0/, DiagnosticSeverity.Warning);
  });

  it('Cat-22: Invalid GetMemory fromPerson', () => {
    const text = '{{GetMemory(fromPerson="System")}}';
    const { diagnostics } = validate(text);
    expectDiag(
      diagnostics,
      /GetMemory: invalid value 'System' for parameter 'fromPerson'. Allowed: User, Agent, Both/,
      DiagnosticSeverity.Warning,
    );
  });

  it('Cat-23: Invalid Sleep interruptible', () => {
    const text = '{{Sleep(duration="10", interruptible="maybe")}}';
    const { diagnostics } = validate(text);
    expectDiag(
      diagnostics,
      /Sleep: invalid value 'maybe' for parameter 'interruptible'. Allowed: True, False, y, n/,
      DiagnosticSeverity.Warning,
    );
  });

  it('Cat-24: Invalid CreateMessageAct from', () => {
    const text = '{{CreateMessageAct(text="hello", from="system")}}';
    const { diagnostics } = validate(text);
    expectDiag(
      diagnostics,
      /CreateMessageAct: invalid value 'system' for parameter 'from'. Allowed: user, agent/,
      DiagnosticSeverity.Warning,
    );
  });
});

// ===========================================================================
// E: Variable Errors (25-27)
// ===========================================================================

describe('Category E: Variable Errors', () => {
  it('Cat-25: Undefined variable reference', () => {
    const text = '{% set x = "ok" %}\n{{SendMessage(message=undefinded_var)}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Undefined variable 'undefinded_var'/, DiagnosticSeverity.Warning);
  });

  it('Cat-26: Typo in variable ref suggests correct name', () => {
    const text = '{% set user_name = "Alice" %}\n{{SendMessage(message=usr_name)}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Undefined variable 'usr_name'.*Did you mean 'user_name'/, DiagnosticSeverity.Warning);
  });

  it('Cat-27: Unused variable definition', () => {
    const text = '{% set unused_var = "value" %}\n{{SendMessage(message="hello")}}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Variable 'unused_var' is defined but never referenced/, DiagnosticSeverity.Hint);
  });
});

// ===========================================================================
// F: Combined / Complex Errors (28-30)
// ===========================================================================

describe('Category F: Combined/Complex Errors', () => {
  it('Cat-28: Multiple errors in one file (brace + typo + missing param)', () => {
    const text = [
      '{{SendMessge(message="hi")}}',       // Unknown function (typo)
      '{{GetCustomerAttribute()}}',          // Missing required param
      '{{Set(name="x", value="y")',          // Missing }}
    ].join('\n');
    const { diagnostics } = validate(text);

    // Should have at least 3 diagnostics
    expect(diagnostics.length).toBeGreaterThanOrEqual(3);

    // Check each error type is present
    expectDiag(diagnostics, /Unknown function 'SendMessge'/, DiagnosticSeverity.Error);
    expectDiag(diagnostics, /missing required parameter 'field'/, DiagnosticSeverity.Warning);
    expectDiag(diagnostics, /Unbalanced expression braces/, DiagnosticSeverity.Error);
  });

  it('Cat-29: Undefined variable inside a for loop', () => {
    const text = [
      '{% set items = "list" %}',
      '{% for item in items %}',
      '  {{SendMessage(message=undefined_loop_var)}}',
      '{% endfor %}',
    ].join('\n');
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Undefined variable 'undefined_loop_var'/, DiagnosticSeverity.Warning);
  });

  it('Cat-30: Typo in function inside nested guidance conditional', () => {
    const text = [
      '{{#if condition1}}',
      '  {{#if condition2}}',
      '    {{SendMessge(message="nested error")}}',
      '  {{/if}}',
      '{{/if}}',
    ].join('\n');
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Unknown function 'SendMessge'.*Did you mean 'SendMessage'/, DiagnosticSeverity.Error);
  });
});

// ===========================================================================
// Bonus: Real template smoke tests (if source files available)
// ===========================================================================

describe('Real template smoke tests', () => {
  it.skipIf(!templates.v1_guidance_simple)(
    'V1 guidance template should produce zero false errors',
    () => {
      const { diagnostics } = validate(templates.v1_guidance_simple!, {
        uri: 'file:///project/ConvoAgent/CAActionCallTransferFlow/AnalyzeConversationSkill.guidance',
      });
      // Known-good template should not produce errors (only hints/warnings for unused vars are acceptable)
      const errDiags = errors(diagnostics);
      expect(errDiags).toHaveLength(0);
    },
  );

  it.skipIf(!templates.v1_guidance_complex)(
    'V1 complex guidance template should produce zero false errors',
    () => {
      const { diagnostics } = validate(templates.v1_guidance_complex!, {
        uri: 'file:///project/ConvoAgent/CAActionCallTransferFlow/_transferCallSkill.guidance',
      });
      const errDiags = errors(diagnostics);
      expect(errDiags).toHaveLength(0);
    },
  );
});

// ===========================================================================
// Regression: statement-style validation
// ===========================================================================

describe('Statement-style validation', () => {
  it('Statement-style function call with typo is detected (PascalCase)', () => {
    const text = '{% set result = SendMessge(message="hi") %}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /Unknown function 'SendMessge'/, DiagnosticSeverity.Error);
  });

  it('Statement-style known action validates required params', () => {
    const text = '{% set result = GetCustomerAttribute() %}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /GetCustomerAttribute: missing required parameter 'field'/, DiagnosticSeverity.Warning);
  });

  it('Statement-style constraint violation detected', () => {
    const text = '{% set dt = GetDateTime(format="invalid") %}';
    const { diagnostics } = validate(text);
    expectDiag(diagnostics, /GetDateTime: invalid value 'invalid'/, DiagnosticSeverity.Warning);
  });

  it('Known gap: lowercase function in statement block not flagged (PascalCase check)', () => {
    // This documents the known gap: statement-style unknown function detection
    // only fires for PascalCase names
    const text = '{% set x = sendMessage(message="hi") %}';
    const { diagnostics } = validate(text);
    // sendMessage is NOT PascalCase, so the statement-style pass skips it
    const unknownDiags = errors(diagnostics).filter(d => d.message.includes("Unknown function 'sendMessage'"));
    expect(unknownDiags).toHaveLength(0); // Documents the gap
  });
});
