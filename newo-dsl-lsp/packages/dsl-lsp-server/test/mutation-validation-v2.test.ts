/**
 * Mutation Validation V2: 20 "Out-of-the-Box" Error Categories
 *
 * These test creative, real-world mistakes that developers actually make
 * but that the original 30 categories didn't cover. Each test verifies
 * that the validator CATCHES the error.
 *
 * Categories G-K:
 *   G: Structural Oddities (31-35)       - weird brace/syntax patterns
 *   H: Copy-Paste & Redundancy (36-39)   - duplicate code mistakes
 *   I: Scope & Lifecycle (40-43)          - variable scoping mistakes
 *   J: Cross-Syntax Confusion (44-47)    - mixing Jinja/Guidance/Python syntax
 *   K: Sneaky Edge Cases (48-50)         - subtle errors that look correct
 */

import { describe, it, expect } from 'vitest';
import { DiagnosticSeverity } from 'vscode-languageserver/node';
import type { Diagnostic as LspDiagnostic } from 'vscode-languageserver/node';

import { validateTemplateText, type ValidateOptions } from '../src/validate';
import { JinjaParser } from '@newo-dsl/analyzer';
import type { SkillInfo } from '../src/format-utils';

// ---------------------------------------------------------------------------
// Helpers (same as v1)
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

function errors(diags: LspDiagnostic[]) {
  return diags.filter(d => d.severity === DiagnosticSeverity.Error);
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

const parser = new JinjaParser();

// ===========================================================================
// G: Structural Oddities (31-35)
// ===========================================================================

describe('Category G: Structural Oddities', () => {

  it('Cat-31: Triple braces {{{ }}} detected as stray braces', () => {
    const text = '{{{SendMessage(message="hi")}}}';
    const { diagnostics } = validate(text);

    // CAUGHT: triple braces are now detected as stray braces
    const strayBrace = hasDiag(diagnostics, /Stray brace/, DiagnosticSeverity.Error);
    expect(strayBrace).toBe(true);
  });

  it('Cat-32: Reversed braces }} before {{ detected', () => {
    const text = '}}SendMessage(message="hi"){{';
    const { diagnostics } = validate(text);

    // CAUGHT: reversed brace ordering is now detected
    const reversedError = hasDiag(diagnostics, /Reversed braces/, DiagnosticSeverity.Error);
    expect(reversedError).toBe(true);
  });

  it('Cat-33: Action without parentheses detected', () => {
    const text = '{{SendMessage}}';
    const { diagnostics } = validate(text);

    // CAUGHT: known action used without () is now flagged
    const bareAction = hasDiag(diagnostics, /without parentheses/, DiagnosticSeverity.Error);
    expect(bareAction).toBe(true);
  });

  it('Cat-34: Unclosed string literal detected', () => {
    const text = '{{SendMessage(message="hello)}}\n{{SetState(name="x", value="y")}}';
    const { diagnostics } = validate(text);

    // CAUGHT: unclosed string literal inside function args is now detected
    const unclosedString = hasDiag(diagnostics, /unclosed string literal/, DiagnosticSeverity.Error);
    expect(unclosedString).toBe(true);
  });

  it('Cat-35: Empty expression braces {{ }} detected', () => {
    const text = 'Some text {{ }} more text\n{{SendMessage(message="hi")}}';
    const { diagnostics } = validate(text);

    // CAUGHT: empty expression braces are now flagged
    const emptyError = hasDiag(diagnostics, /Empty expression/, DiagnosticSeverity.Warning);
    expect(emptyError).toBe(true);
  });
});

// ===========================================================================
// H: Copy-Paste & Redundancy Errors (36-39)
// ===========================================================================

describe('Category H: Copy-Paste & Redundancy Errors', () => {

  it('Cat-36: Duplicate parameter in same function call detected', () => {
    const text = '{{SendMessage(message="hello", message="goodbye")}}';
    const { diagnostics } = validate(text);

    // CAUGHT: duplicate parameter is now flagged
    const dupError = hasDiag(diagnostics, /duplicate parameter/, DiagnosticSeverity.Warning);
    expect(dupError).toBe(true);
  });

  it('Cat-37: Consecutive SetState dead store detected', () => {
    const text = [
      '{{SetState(name="status", value="pending")}}',
      '{{SetState(name="status", value="active")}}',
      '{{SendMessage(message="done")}}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // CAUGHT: consecutive writes to the same key are now flagged as dead store
    const deadStore = hasDiag(diagnostics, /dead store/, DiagnosticSeverity.Warning);
    expect(deadStore).toBe(true);
  });

  it('Cat-38: Nested action call missing params detected', () => {
    const text = '{{SendMessage(message=GetCustomerAttribute())}}';
    const { diagnostics } = validate(text);

    // CAUGHT: nested GetCustomerAttribute() missing required 'field' param
    const innerMissing = hasDiag(diagnostics, /GetCustomerAttribute.*missing required parameter.*field/, DiagnosticSeverity.Warning);
    expect(innerMissing).toBe(true);
  });

  it('Cat-39: Same skill called with contradictory params (not a validator concern)', () => {
    const text = [
      '{{GetDateTime(format="date")}}',
      '{{GetDateTime(format="time")}}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // Both calls are individually valid - not a validator concern
    expect(errors(diagnostics)).toHaveLength(0);
  });
});

// ===========================================================================
// I: Scope & Lifecycle Errors (40-43)
// ===========================================================================

describe('Category I: Scope & Lifecycle Errors', () => {

  it('Cat-40: Variable defined in loop used AFTER endfor (scope escape) detected', () => {
    const text = [
      '{% for item in items %}',
      '  {% set last_item = item %}',
      '{% endfor %}',
      '{{SendMessage(message=last_item)}}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // CAUGHT: last_item is scoped to the for-loop. Downgraded to Hint (V4 Fix 1)
    // because the variable IS known (self-suggestion), likely a skill param pattern.
    const detected = hasDiag(diagnostics, /used before its definition|skill parameter/, DiagnosticSeverity.Hint);
    expect(detected).toBe(true);
  });

  it('Cat-41: Variable defined in one if-branch referenced unconditionally detected', () => {
    const text = [
      '{% if show_greeting %}',
      '  {% set greeting = "Hello!" %}',
      '{% endif %}',
      '{{SendMessage(message=greeting)}}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // CAUGHT: greeting is only in if-without-else. Downgraded to Hint (V4 Fix 1)
    // because the variable IS known (self-suggestion).
    const detected = hasDiag(diagnostics, /used before its definition|skill parameter/, DiagnosticSeverity.Hint);
    expect(detected).toBe(true);
  });

  it('Cat-42: Variable used before it is defined detected', () => {
    const text = [
      '{{SendMessage(message=my_var)}}',
      '{% set my_var = "hello" %}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // CAUGHT: my_var is used on line 0 but defined on line 1. Downgraded to Hint
    // (V4 Fix 1) because the variable IS known (self-suggestion).
    const detected = hasDiag(diagnostics, /used before its definition|skill parameter/, DiagnosticSeverity.Hint);
    expect(detected).toBe(true);
  });

  it('Cat-43: Self-referencing variable in its own definition detected', () => {
    const text = [
      '{% set counter = counter + 1 %}',
      '{{SendMessage(message="count is " ~ counter)}}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // CAUGHT: counter references itself in its own definition (same line).
    // Downgraded to Hint (V4 Fix 1) because the variable IS known (self-suggestion).
    const selfRef = hasDiag(diagnostics, /used before its definition|skill parameter/, DiagnosticSeverity.Hint);
    expect(selfRef).toBe(true);
  });
});

// ===========================================================================
// J: Cross-Syntax Confusion (44-47)
// ===========================================================================

describe('Category J: Cross-Syntax Confusion', () => {

  it('Cat-44: Using {% endif %} to close {{#if}} caught by JinjaParser', () => {
    const text = '{{#if condition}}Hello{% endif %}';
    const { diagnostics } = validate(text);
    const parserResult = parser.parse(text, 'test.guidance');

    // JinjaParser catches this as E010 (unclosed guidance block)
    const e010 = parserResult.diagnostics.filter(d => d.code === 'E010');
    expect(e010.length).toBeGreaterThan(0);
    // validateTemplateText doesn't check guidance blocks (JinjaParser's job)
    const braceError = hasDiag(diagnostics, /Unbalanced|Unclosed/, DiagnosticSeverity.Error);
    expect(braceError).toBe(false);
  });

  it('Cat-45: Using {{endif}} instead of {{/if}} caught by JinjaParser', () => {
    const text = '{{#if condition}}Hello{{endif}}';
    const parserResult = parser.parse(text, 'test.guidance');

    // JinjaParser catches the unclosed {{#if}} as E010
    const e010 = parserResult.diagnostics.filter(d => d.code === 'E010');
    expect(e010.length).toBeGreaterThan(0);
  });

  it('Cat-46: Python-style colon in Jinja conditional detected', () => {
    const text = '{% if condition: %}\n  {{SendMessage(message="hi")}}\n{% endif %}';
    const { diagnostics } = validate(text);

    // CAUGHT: trailing colon in conditional is now detected
    const colonError = hasDiag(diagnostics, /colon/, DiagnosticSeverity.Warning);
    expect(colonError).toBe(true);
  });

  it('Cat-47: Using = instead of == in Jinja conditional detected', () => {
    const text = '{% if status = "active" %}\n  {{SendMessage(message="hi")}}\n{% endif %}';
    const { diagnostics } = validate(text);

    // CAUGHT: single = in conditional is now flagged
    const assignError = hasDiag(diagnostics, /==/, DiagnosticSeverity.Warning);
    expect(assignError).toBe(true);
  });
});

// ===========================================================================
// K: Sneaky Edge Cases (48-50)
// ===========================================================================

describe('Category K: Sneaky Edge Cases', () => {

  it('Cat-48: Variable name shadows a built-in action name detected', () => {
    const text = [
      '{% set SendMessage = "hello" %}',
      '{{SendMessage(message="hi")}}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // CAUGHT: variable shadows action name (warning) + unused variable (hint)
    const shadowWarning = hasDiag(diagnostics, /shadows the built-in action/, DiagnosticSeverity.Warning);
    expect(shadowWarning).toBe(true);
    const unusedVar = hasDiag(diagnostics, /Variable 'SendMessage' is defined but never referenced/, DiagnosticSeverity.Hint);
    expect(unusedVar).toBe(true);
  });

  it('Cat-49: Missing equals sign treated as positional args (no false missing-param)', () => {
    const text = '{{SendMessage(message "hello")}}';
    const { diagnostics } = validate(text);

    // With positional arg detection, 'message' without '=' is treated as positional,
    // so the required param check is skipped (positional args satisfy required params)
    const missingParam = hasDiag(diagnostics, /missing required parameter 'message'/, DiagnosticSeverity.Warning);
    expect(missingParam).toBe(false);
  });

  it('Cat-50: Semicolons used as parameter separators detected', () => {
    const text = '{{IsSimilar(val1="hello"; val2="world")}}';
    const { diagnostics } = validate(text);

    // CAUGHT: semicolons as separators are now flagged
    const semiWarning = hasDiag(diagnostics, /semicolons/, DiagnosticSeverity.Warning);
    expect(semiWarning).toBe(true);
    // Params are still extracted (no missing param errors)
    const missingParams = warnings(diagnostics).filter(d =>
      d.message.includes('missing required parameter'),
    );
    expect(missingParams.length).toBe(0);
  });
});
