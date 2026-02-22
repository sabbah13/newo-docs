/**
 * Mutation Validation V3: 25 More Error Categories (Cat 51-75)
 *
 * Focus areas inspired by real codebase patterns:
 *   L: Language Confusion (51-55)     - syntax habits from other languages
 *   M: Filter & Pipe Errors (56-60)   - Jinja filter misuse
 *   N: Whitespace & Format (61-65)    - formatting edge cases
 *   O: Control Flow Errors (66-70)    - return/loop/branch mistakes
 *   P: Advanced Composition (71-75)   - complex nesting patterns from real templates
 */

import { describe, it, expect } from 'vitest';
import { DiagnosticSeverity } from 'vscode-languageserver/node';
import type { Diagnostic as LspDiagnostic } from 'vscode-languageserver/node';

import { validateTemplateText, extractTopLevelParams, type ValidateOptions } from '../src/validate';
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

// ===========================================================================
// L: Language Confusion Errors (51-55)
// Developers importing habits from C/JS/Python into Jinja templates
// ===========================================================================

describe('Category L: Language Confusion Errors', () => {

  it('Cat-51: Using && instead of "and" in Jinja conditional', () => {
    const text = '{% if x && y %}\n  {{SendMessage(message="both")}}\n{% endif %}';
    const { diagnostics } = validate(text);

    // CAUGHT: && is flagged with suggestion to use 'and'
    const wrongOp = hasDiag(diagnostics, /'and'.*'&&'/, DiagnosticSeverity.Warning);
    expect(wrongOp).toBe(true);
  });

  it('Cat-52: Using || instead of "or" in Jinja conditional', () => {
    const text = '{% if x || y %}\n  {{SendMessage(message="either")}}\n{% endif %}';
    const { diagnostics } = validate(text);

    // CAUGHT: || is flagged with suggestion to use 'or'
    const wrongOp = hasDiag(diagnostics, /\|\|.*or/, DiagnosticSeverity.Warning);
    expect(wrongOp).toBe(true);
  });

  it('Cat-53: Using ! instead of "not" in Jinja conditional', () => {
    const text = '{% if !show_greeting %}\n  {{SendMessage(message="hidden")}}\n{% endif %}';
    const { diagnostics } = validate(text);

    // CAUGHT: ! is flagged with suggestion to use 'not'
    const wrongOp = hasDiag(diagnostics, /!.*not/, DiagnosticSeverity.Warning);
    expect(wrongOp).toBe(true);
  });

  it('Cat-54: JavaScript template literal ${variable} in template text', () => {
    const text = 'Hello ${user_name}, welcome!\n{{SendMessage(message="hi")}}';
    const { diagnostics } = validate(text);

    // CAUGHT: ${} is flagged with suggestion to use {{ }}
    const jsLiteral = hasDiag(diagnostics, /template literal|Jinja syntax/, DiagnosticSeverity.Warning);
    expect(jsLiteral).toBe(true);
  });

  it('Cat-55: Using ++ increment operator from C/JS', () => {
    const text = '{% set counter = 0 %}\n{% set counter++ %}\n{{SendMessage(message=counter)}}';
    const { diagnostics } = validate(text);

    // CAUGHT: ++ is flagged with suggestion to use set x = x + 1
    const incError = hasDiag(diagnostics, /\+\+.*not valid/, DiagnosticSeverity.Warning);
    expect(incError).toBe(true);
  });
});

// ===========================================================================
// M: Filter & Pipe Errors (56-60)
// Real codebase uses | string, | tojson, | int extensively
// ===========================================================================

describe('Category M: Filter & Pipe Errors', () => {

  it('Cat-56: Action name used as Jinja filter: {{"hello" | SendMessage}}', () => {
    const text = '{{"hello" | SendMessage}}';
    const { diagnostics } = validate(text);

    // CAUGHT: action used as filter is flagged
    const actionAsFilter = hasDiag(diagnostics, /SendMessage.*filter|filter.*SendMessage/, DiagnosticSeverity.Warning);
    expect(actionAsFilter).toBe(true);
  });

  it('Cat-57: Trailing pipe with no filter name: {{my_var | }}', () => {
    const text = '{% set my_var = "hello" %}\n{{my_var | }}';
    const { diagnostics } = validate(text);

    // CAUGHT: trailing pipe is flagged
    const trailingPipe = hasDiag(diagnostics, /[Tt]railing pipe/, DiagnosticSeverity.Warning);
    expect(trailingPipe).toBe(true);
  });

  it('Cat-58: Filter applied to bare action name: {{SendMessage | upper}}', () => {
    const text = '{{SendMessage | upper}}';
    const { diagnostics } = validate(text);

    // CAUGHT: bare action with filter is now detected by expanded regex
    const bareAction = hasDiag(diagnostics, /without parentheses|used as a Jinja filter/, DiagnosticSeverity.Error)
      || hasDiag(diagnostics, /without parentheses|used as a Jinja filter/, DiagnosticSeverity.Warning);
    expect(bareAction).toBe(true);
  });

  it('Cat-59: Double pipe || used as default value (JS pattern)', () => {
    const text = '{% set name = user_name || "Guest" %}\n{{SendMessage(message=name)}}';
    const { diagnostics } = validate(text);

    // CAUGHT: || in set expression is flagged
    const doubleOr = hasDiag(diagnostics, /\|\|.*not valid/, DiagnosticSeverity.Warning);
    expect(doubleOr).toBe(true);
  });

  it('Cat-60: Using Jinja filter "default" with action - misunderstood pattern', () => {
    const text = '{% set result = GetCustomerAttribute(field="status") | default("unknown") %}\n{{SendMessage(message=result)}}';
    const { diagnostics } = validate(text);

    // This IS actually valid Jinja - no errors expected
    expect(errors(diagnostics)).toHaveLength(0); // OK: this is valid Jinja
  });
});

// ===========================================================================
// N: Whitespace & Format Errors (61-65)
// ===========================================================================

describe('Category N: Whitespace & Format Errors', () => {

  it('Cat-61: Space between function name and paren: {{SendMessage (message="hi")}}', () => {
    const text = '{{SendMessage (message="hi")}}';
    const { diagnostics } = validate(text);

    // SendMessage is a known action, should NOT be flagged as unknown
    const unknownFunc = hasDiag(diagnostics, /Unknown function 'SendMessage'/, DiagnosticSeverity.Error);
    expect(unknownFunc).toBe(false);
    expect(errors(diagnostics)).toHaveLength(0); // OK: space before paren is handled
  });

  it('Cat-62: Multi-line action call spanning two lines', () => {
    const text = '{{SendMessage(\n  message="hello world"\n)}}';
    const { diagnostics } = validate(text);

    const missingMsg = hasDiag(diagnostics, /missing required parameter 'message'/, DiagnosticSeverity.Warning);
    expect(missingMsg).toBe(false); // OK: multi-line params ARE extracted
  });

  it('Cat-63: Tab character embedded in parameter name', () => {
    const text = '{{SendMessage(mes\tsage="hi")}}';
    const { diagnostics } = validate(text);

    // CAUGHT: tab character is now explicitly detected with a clear message
    const tabWarning = hasDiag(diagnostics, /tab character/, DiagnosticSeverity.Warning);
    expect(tabWarning).toBe(true);
    // Symptom also caught: message= not found
    const missingMsg = hasDiag(diagnostics, /missing required parameter 'message'/, DiagnosticSeverity.Warning);
    expect(missingMsg).toBe(true);
  });

  it('Cat-64: Trailing comma after last parameter', () => {
    const text = '{{SendMessage(message="hi",)}}';
    const { diagnostics } = validate(text);

    // In Jinja, trailing comma is actually syntactically valid
    const syntaxError = diagnostics.filter(d =>
      d.message.includes('trailing') || d.message.includes('comma'),
    );
    expect(syntaxError).toHaveLength(0); // OK: trailing comma is valid in Jinja
    const missingMsg = hasDiag(diagnostics, /missing required parameter 'message'/, DiagnosticSeverity.Warning);
    expect(missingMsg).toBe(false); // Good: param IS extracted
  });

  it('Cat-65: Empty statement block {% %} (no content)', () => {
    const text = '{% %}\n{{SendMessage(message="hi")}}';
    const { diagnostics } = validate(text);

    // CAUGHT: empty statement block is now flagged
    const emptyStmt = hasDiag(diagnostics, /[Ee]mpty statement/, DiagnosticSeverity.Warning);
    expect(emptyStmt).toBe(true);
  });
});

// ===========================================================================
// O: Control Flow Errors (66-70)
// ===========================================================================

describe('Category O: Control Flow Errors', () => {

  it('Cat-66: Unreachable code after Return()', () => {
    const text = [
      '{{Return(val="done")}}',
      '{{SendMessage(message="this never runs")}}',
      '{{SetState(name="status", value="active")}}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // CAUGHT: unreachable code after Return() is flagged
    const unreachable = hasDiag(diagnostics, /[Uu]nreachable.*after Return/, DiagnosticSeverity.Warning);
    expect(unreachable).toBe(true);
  });

  it('Cat-67: Return() without val= (positional arg instead of keyword)', () => {
    const text = '{{Return("hello")}}';
    const { diagnostics } = validate(text);

    // val IS optional on Return, so no missing param error
    const missingVal = hasDiag(diagnostics, /missing.*val/, DiagnosticSeverity.Warning);
    expect(missingVal).toBe(false); // OK: val IS optional on Return
  });

  it('Cat-68: Using Python break/continue in Jinja for loop', () => {
    const text = [
      '{% for item in items %}',
      '  {% if item == "skip" %}',
      '    {% break %}',
      '  {% endif %}',
      '  {{SendMessage(message=item)}}',
      '{% endfor %}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // CAUGHT: break is flagged as not supported in standard Jinja2
    const breakError = hasDiag(diagnostics, /break.*not supported|break.*loopcontrols/, DiagnosticSeverity.Warning);
    expect(breakError).toBe(true);
  });

  it('Cat-69: Nested for-loop inner variable shadows outer variable', () => {
    const text = [
      '{% for item in outer_list %}',
      '  {% for item in inner_list %}',
      '    {{SendMessage(message=item)}}',
      '  {% endfor %}',
      '  {{SendMessage(message=item)}}',
      '{% endfor %}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // CAUGHT: inner loop variable shadowing is flagged
    const shadowWarning = hasDiag(diagnostics, /shadow/, DiagnosticSeverity.Warning);
    expect(shadowWarning).toBe(true);
  });

  it('Cat-70: For loop over a string value (not iterable)', () => {
    // Use Concat() which always returns 'string' type (GetState now returns 'any' per Fix 7)
    const text = [
      '{% set my_list = Concat(val1="a", val2="b") %}',
      '{% for item in my_list %}',
      '  {{SendMessage(message=item)}}',
      '{% endfor %}',
    ].join('\n');
    const { diagnostics } = validate(text);

    // CAUGHT: iterating over string type is flagged
    const typeError = hasDiag(diagnostics, /string.*iterate|iterate.*characters/, DiagnosticSeverity.Warning);
    expect(typeError).toBe(true);
  });
});

// ===========================================================================
// P: Advanced Composition Errors (71-75)
// Inspired by real triple-nested patterns in the codebase:
//   Set(name="x", value=Stringify(GetActors(personaId=CreatePersona(name=...))))
// ===========================================================================

describe('Category P: Advanced Composition Errors', () => {

  it('Cat-71: Triple-nested call with deeply nested missing param', () => {
    const text = '{{Set(name="x", value=Stringify(GetActors(personaId=CreatePersona())))}}';
    const { diagnostics } = validate(text);

    // CAUGHT: nested validation reaches depth 3
    const missingName = hasDiag(diagnostics, /CreatePersona.*missing.*name/, DiagnosticSeverity.Warning);
    expect(missingName).toBe(true);
  });

  it('Cat-72: Void action result assigned to variable', () => {
    const text = '{% set result = SendMessage(message="hello") %}\n{{SendMessage(message=result)}}';
    const { diagnostics } = validate(text);

    // CAUGHT: void action assigned to variable is flagged
    const voidAssign = hasDiag(diagnostics, /does not return a meaningful value/, DiagnosticSeverity.Warning);
    expect(voidAssign).toBe(true);
  });

  it('Cat-73: Action in {% if %} conditional is validated for params', () => {
    const text = '{% if GetCustomerAttribute() == "active" %}\n  {{SendMessage(message="active")}}\n{% endif %}';
    const { diagnostics } = validate(text);

    // CAUGHT: action in conditional IS validated
    const missingField = hasDiag(diagnostics, /GetCustomerAttribute.*missing required parameter 'field'/, DiagnosticSeverity.Warning);
    expect(missingField).toBe(true);
  });

  it('Cat-74: Positional args satisfy required params (no false warnings)', () => {
    const text = '{{SendMessage("hello")}}';
    const { diagnostics } = validate(text);

    // Positional args now satisfy required params - no missing-param warning
    const missingMsg = hasDiag(diagnostics, /missing required parameter 'message'/, DiagnosticSeverity.Warning);
    expect(missingMsg).toBe(false);
    // No positional args hint either
    const positionalHint = hasDiag(diagnostics, /positional arguments/, DiagnosticSeverity.Warning);
    expect(positionalHint).toBe(false);
  });

  it('Cat-75: Recursive skill call inside its own arguments', () => {
    const mySkillIndex = new Map<string, SkillInfo>([
      ['CalculatePrice', {
        name: 'CalculatePrice',
        filePath: '/test/CalculatePrice.jinja',
        fileType: 'jinja' as const,
        parameters: [
          { name: 'base_price', required: true },
          { name: 'discount', required: false },
        ],
      }],
    ]);

    const text = '{{CalculatePrice(base_price=CalculatePrice(base_price="100"))}}';
    const { diagnostics } = validate(text, { skillIndex: mySkillIndex });

    // CAUGHT: recursive skill call is flagged
    const recursive = hasDiag(diagnostics, /recursive/, DiagnosticSeverity.Warning);
    expect(recursive).toBe(true);
  });
});
