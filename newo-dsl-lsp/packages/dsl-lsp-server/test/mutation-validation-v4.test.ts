/**
 * Mutation Validation V4: False Positive Regression Tests
 *
 * Verifies 5 fixes that eliminate ~2,500 false positives from production scans:
 *   Fix 1: Self-suggestion downgraded (Hint, not Warning)
 *   Fix 2: -- and || checks are string-aware
 *   Fix 3: Guidance block boundaries in unreachable scanner
 *   Fix 4: GetValueJSON returns 'any' not 'string'
 *   Fix 5: Lenient undefined-var for Guidance templates without params
 */

import { describe, it, expect } from 'vitest';
import { DiagnosticSeverity } from 'vscode-languageserver/node';
import type { Diagnostic as LspDiagnostic } from 'vscode-languageserver/node';

import { validateTemplateText, type ValidateOptions } from '../src/validate';
import type { SkillInfo } from '../src/format-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function opts(overrides?: Partial<ValidateOptions>): ValidateOptions {
  return {
    uri: 'file:///test/template.jinja',
    skillIndex: new Map<string, SkillInfo>(),
    skillIndexBuilt: true,
    ...overrides,
  };
}

function validate(text: string, overrides?: Partial<ValidateOptions>) {
  return validateTemplateText(text, opts(overrides));
}

function warnings(diags: LspDiagnostic[]) {
  return diags.filter(d => d.severity === DiagnosticSeverity.Warning);
}
function hints(diags: LspDiagnostic[]) {
  return diags.filter(d => d.severity === DiagnosticSeverity.Hint);
}

function hasDiag(diags: LspDiagnostic[], pattern: RegExp, severity?: number): boolean {
  const filtered = severity !== undefined ? diags.filter(d => d.severity === severity) : diags;
  return filtered.some(d => pattern.test(d.message));
}

// ===========================================================================
// Fix 1: Self-suggestion false positives (~983 FPs)
// ===========================================================================

describe('Fix 1: Self-suggestion downgrade', () => {

  it('V4-01: Self-suggestion downgraded to Hint', () => {
    // Variable 'x' is defined via Set() action (appears in allNames) but the
    // reference comes before the definition line - use-before-define.
    // findSimilar should return 'x' as the top suggestion (identical name).
    const text = [
      '{{SendMessage(message=x)}}',
      '{% set x = "hello" %}',
    ].join('\n');

    const { diagnostics } = validate(text);

    // Should be a Hint, not a Warning
    const selfSuggest = hints(diagnostics).filter(d => /used before its definition|skill parameter/.test(d.message));
    expect(selfSuggest.length).toBeGreaterThanOrEqual(1);

    // Should NOT be a Warning with "Did you mean 'x'?"
    const warning = warnings(diagnostics).filter(d => /Undefined variable 'x'/.test(d.message));
    expect(warning.length).toBe(0);
  });

  it('V4-02: Real typo kept as Warning with suggestion', () => {
    const text = [
      '{% set user_name = "Alice" %}',
      '{{SendMessage(message=usr_name)}}',
    ].join('\n');

    const { diagnostics } = validate(text);

    // Should remain a Warning with "Did you mean 'user_name'?"
    const typoWarning = warnings(diagnostics).filter(d =>
      /Undefined variable 'usr_name'/.test(d.message) && /Did you mean/.test(d.message)
    );
    expect(typoWarning.length).toBe(1);
  });
});

// ===========================================================================
// Fix 2: String-aware -- and || checks (~81 FPs)
// ===========================================================================

describe('Fix 2: String-aware operator checks', () => {

  it('V4-03: -- inside string literal not flagged', () => {
    const text = '{% set entry_prefix = "---\\n\\n**Append Log Entry [" %}';
    const { diagnostics } = validate(text);

    const dashDiag = hasDiag(diagnostics, /--.*not valid in Jinja/, DiagnosticSeverity.Warning);
    expect(dashDiag).toBe(false);
  });

  it('V4-04: -- outside string still flagged', () => {
    const text = '{% set counter-- %}';
    const { diagnostics } = validate(text);

    const dashDiag = hasDiag(diagnostics, /--.*not valid in Jinja/, DiagnosticSeverity.Warning);
    expect(dashDiag).toBe(true);
  });

  it('V4-05: || inside string literal not flagged', () => {
    const text = '{% set prompt = prompt_text.replace("<||rag_placeholder||>", rag_content) %}';
    const { diagnostics } = validate(text);

    const pipeDiag = hasDiag(diagnostics, /\|\|.*not valid in Jinja/, DiagnosticSeverity.Warning);
    expect(pipeDiag).toBe(false);
  });

  it('V4-06: || outside string still flagged', () => {
    const text = '{% set x = y || z %}';
    const { diagnostics } = validate(text);

    const pipeDiag = hasDiag(diagnostics, /\|\|.*not valid in Jinja/, DiagnosticSeverity.Warning);
    expect(pipeDiag).toBe(true);
  });
});

// ===========================================================================
// Fix 3: Guidance block boundaries in unreachable scanner (~200 FPs)
// ===========================================================================

describe('Fix 3: Guidance block boundaries', () => {

  it('V4-07: Return inside Guidance {{#if}} does not flag subsequent code', () => {
    const text = [
      '{{#if needs_reconfirmation}}',
      '{{Return()}}',
      '{{/if}}',
      '{{Set(name="adults", value="2")}}',
    ].join('\n');

    const { diagnostics } = validate(text);

    // Set after {{/if}} should NOT be flagged as unreachable
    const unreachable = hasDiag(diagnostics, /Unreachable code after Return/, DiagnosticSeverity.Warning);
    expect(unreachable).toBe(false);
  });

  it('V4-08: Return outside conditional still flags unreachable code', () => {
    const text = [
      '{{Return()}}',
      '{{Set(name="y", value="never")}}',
    ].join('\n');

    const { diagnostics } = validate(text);

    const unreachable = hasDiag(diagnostics, /Unreachable code after Return/, DiagnosticSeverity.Warning);
    expect(unreachable).toBe(true);
  });
});

// ===========================================================================
// Fix 4: GetValueJSON return type inference (~16 FPs)
// ===========================================================================

describe('Fix 4: GetValueJSON type inference', () => {

  it('V4-09: GetValueJSON iteration not flagged as string iteration', () => {
    const text = [
      '{% set items = GetValueJSON(json=data, path="results") %}',
      '{% for item in items %}',
      '  {{SendMessage(message=item)}}',
      '{% endfor %}',
    ].join('\n');

    const { diagnostics } = validate(text);

    // Should NOT warn about iterating over a string
    const stringIter = hasDiag(diagnostics, /type 'string'.*iterate over individual characters/, DiagnosticSeverity.Warning);
    expect(stringIter).toBe(false);
  });
});

// ===========================================================================
// Fix 5: Lenient undefined-var for Guidance templates (~1,000 FPs)
// ===========================================================================

describe('Fix 5: Guidance template lenient mode', () => {

  it('V4-10: Guidance file undefined var without params is Hint', () => {
    const text = '{{SendMessage(message=userId)}}';

    const { diagnostics } = validate(text, {
      uri: 'file:///project/flow/skill.nslg',
      // No skillParams provided
    });

    // Should be Hint (not Warning) since guidance file has no param info
    const hintDiag = hints(diagnostics).filter(d =>
      /Possibly undefined variable 'userId'/.test(d.message) ||
      /used before its definition/.test(d.message)
    );
    expect(hintDiag.length).toBeGreaterThanOrEqual(1);

    // Should NOT be a Warning
    const warnDiag = warnings(diagnostics).filter(d => /Undefined variable 'userId'/.test(d.message));
    expect(warnDiag.length).toBe(0);
  });

  it('V4-11: Guidance file typo still Warning when close suggestion exists', () => {
    const text = [
      '{% set user_name = "Alice" %}',
      '{{SendMessage(message=usr_name)}}',
    ].join('\n');

    const { diagnostics } = validate(text, {
      uri: 'file:///project/flow/skill.guidance',
      // No skillParams provided
    });

    // Typo should remain a Warning even in guidance file (close suggestion exists)
    const typoWarning = warnings(diagnostics).filter(d =>
      /Undefined variable 'usr_name'/.test(d.message) && /Did you mean/.test(d.message)
    );
    expect(typoWarning.length).toBe(1);
  });

  it('V4-12: Jinja file undefined var stays Warning', () => {
    const text = '{{SendMessage(message=userId)}}';

    const { diagnostics } = validate(text, {
      uri: 'file:///project/flow/skill.jinja',
      // No skillParams - but jinja file, so strict mode
    });

    // In a .jinja file, should remain Warning
    const warnDiag = warnings(diagnostics).filter(d => /Undefined variable 'userId'/.test(d.message));
    expect(warnDiag.length).toBe(1);
  });
});

// ===========================================================================
// Fix 6: Filter implicit variables from suggestion pool (~196 FPs)
// ===========================================================================

describe('Fix 6: Implicit variable filtering from suggestions', () => {

  it('V4-13: userId does not suggest implicit "user"', () => {
    const text = '{{SendMessage(message=userId)}}';
    const { diagnostics } = validate(text);

    // userId should NOT get "Did you mean 'user'?" since 'user' is implicit
    const falseTypo = warnings(diagnostics).filter(d =>
      /Did you mean 'user'/.test(d.message)
    );
    expect(falseTypo.length).toBe(0);
  });

  it('V4-14: loopCount does not suggest implicit "loop"', () => {
    const text = '{{SendMessage(message=loopCount)}}';
    const { diagnostics } = validate(text);

    const falseTypo = warnings(diagnostics).filter(d =>
      /Did you mean 'loop'/.test(d.message)
    );
    expect(falseTypo.length).toBe(0);
  });

  it('V4-15: Real typo near user-defined name still suggested', () => {
    const text = [
      '{% set customer_name = "Alice" %}',
      '{{SendMessage(message=custmer_name)}}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // custmer_name should suggest customer_name (a user-defined var)
    const realTypo = warnings(diagnostics).filter(d =>
      /Did you mean 'customer_name'/.test(d.message)
    );
    expect(realTypo.length).toBe(1);
  });
});

// ===========================================================================
// Fix 7: GetState/GetCustomerAttribute/etc. return type 'any' (~10 FPs)
// ===========================================================================

describe('Fix 7: Attribute getter return types', () => {

  it('V4-16: GetState iteration not flagged as string iteration', () => {
    const text = [
      '{% set items = GetState(name="cart_items") %}',
      '{% for item in items %}',
      '  {{SendMessage(message=item)}}',
      '{% endfor %}',
    ].join('\n');
    const { diagnostics } = validate(text);

    const stringIter = hasDiag(diagnostics, /type 'string'.*iterate/, DiagnosticSeverity.Warning);
    expect(stringIter).toBe(false);
  });

  it('V4-17: GetCustomerAttribute iteration not flagged', () => {
    const text = [
      '{% set attributes = GetCustomerAttribute(field="tags") %}',
      '{% for attr in attributes %}',
      '  {{SendMessage(message=attr)}}',
      '{% endfor %}',
    ].join('\n');
    const { diagnostics } = validate(text);

    const stringIter = hasDiag(diagnostics, /type 'string'.*iterate/, DiagnosticSeverity.Warning);
    expect(stringIter).toBe(false);
  });

  it('V4-18: GetPersonaAttribute iteration not flagged', () => {
    const text = [
      '{% set blocked = GetPersonaAttribute(id=userId, field="blocked_numbers") %}',
      '{% for number in blocked %}',
      '  {{SendMessage(message=number)}}',
      '{% endfor %}',
    ].join('\n');
    const { diagnostics } = validate(text);

    const stringIter = hasDiag(diagnostics, /type 'string'.*iterate/, DiagnosticSeverity.Warning);
    expect(stringIter).toBe(false);
  });
});

// ===========================================================================
// Fix 8: Context-aware brace counting (~11 FPs)
// ===========================================================================

describe('Fix 8: Context-aware brace counting', () => {

  it('V4-19: Dict literal in {% set %} does not cause brace error', () => {
    const text = '{% set tools_object = {"tools": {}} %}';
    const { diagnostics } = validate(text);

    const braceError = hasDiag(diagnostics, /Unbalanced expression braces/, DiagnosticSeverity.Error);
    expect(braceError).toBe(false);
  });

  it('V4-20: Dict update in {{ }} expression does not cause brace error', () => {
    const text = [
      '{% set conflict_dict = {} %}',
      '{{conflict_dict.update({"tools": {"name": "content"}})}}',
    ].join('\n');
    const { diagnostics } = validate(text);

    const braceError = hasDiag(diagnostics, /Unbalanced expression braces/, DiagnosticSeverity.Error);
    expect(braceError).toBe(false);
  });

  it('V4-21: JSON string inside {% set %} does not cause brace error', () => {
    const text = '{% set schema = \'{"type": "object", "properties": {"name": {"type": "string"}}}\' %}';
    const { diagnostics } = validate(text);

    const braceError = hasDiag(diagnostics, /Unbalanced expression braces/, DiagnosticSeverity.Error);
    expect(braceError).toBe(false);
  });

  it('V4-22: Real unbalanced braces still detected', () => {
    const text = '{{SendMessage(message="hello")}\n{{Set(name="x", value="y")}}';
    const { diagnostics } = validate(text);

    // Missing closing }} on first expression
    const braceError = hasDiag(diagnostics, /Unbalanced expression braces/, DiagnosticSeverity.Error);
    expect(braceError).toBe(true);
  });

  it('V4-23: Same-line conditional Return not flagged as unreachable', () => {
    const text = [
      '{{#if IsEmpty(text=schema)}}{{Return()}}{{/if}}',
      '{{Set(name="x", value="y")}}',
    ].join('\n');
    const { diagnostics } = validate(text);

    const unreachable = hasDiag(diagnostics, /Unreachable code after Return/, DiagnosticSeverity.Warning);
    expect(unreachable).toBe(false);
  });

  it('V4-24: Same-line Jinja conditional Return not flagged', () => {
    const text = [
      '{% if not data %}{{Return()}}{% endif %}',
      '{{SendMessage(message="hi")}}',
    ].join('\n');
    const { diagnostics } = validate(text);

    const unreachable = hasDiag(diagnostics, /Unreachable code after Return/, DiagnosticSeverity.Warning);
    expect(unreachable).toBe(false);
  });
});

// ===========================================================================
// Fix 10: String-aware statement brace counting
// ===========================================================================

describe('Fix 10: String-aware statement brace counting', () => {

  it('V4-25: Statement braces inside string literal not flagged', () => {
    const text = '{% set msg = "use {% if %} syntax for conditionals" %}';
    const { diagnostics } = validate(text);

    const braceError = hasDiag(diagnostics, /Unbalanced statement braces/, DiagnosticSeverity.Error);
    expect(braceError).toBe(false);
  });

  it('V4-26: Real unbalanced statement braces still detected', () => {
    const text = '{% if x\n{{SendMessage(message="hi")}}';
    const { diagnostics } = validate(text);

    const braceError = hasDiag(diagnostics, /Unbalanced statement braces/, DiagnosticSeverity.Error);
    expect(braceError).toBe(true);
  });
});

// ===========================================================================
// Fix 11: String-aware reversed brace check
// ===========================================================================

describe('Fix 11: String-aware reversed brace check', () => {

  it('V4-27: }} inside string before {{ not flagged as reversed', () => {
    const text = '{% set x = "}}" %}\n{{SendMessage(message=x)}}';
    const { diagnostics } = validate(text);

    const reversed = hasDiag(diagnostics, /Reversed braces/, DiagnosticSeverity.Error);
    expect(reversed).toBe(false);
  });

  it('V4-28: Real reversed braces still detected', () => {
    const text = '}} {{SendMessage(message="hi")}}';
    const { diagnostics } = validate(text);

    const reversed = hasDiag(diagnostics, /Reversed braces/, DiagnosticSeverity.Error);
    expect(reversed).toBe(true);
  });
});
