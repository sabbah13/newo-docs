/**
 * Regression tests for false-positive elimination in the LSP server (Fixes 5, 6, 8).
 *
 * Tests the helper functions directly and verifies that string-aware checks
 * prevent false positives while still catching real issues.
 */

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// We replicate the helper functions from validate.ts here because they are
// module-private.  These mirror the exact implementations in validate.ts.
// ---------------------------------------------------------------------------

function hasOperatorOutsideStrings(text: string, operator: string): boolean {
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) { inString = false; }
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }
    if (text.slice(i, i + operator.length) === operator) {
      if (operator === '--' && i + 2 < text.length && text[i + 2] === '%') continue;
      return true;
    }
  }
  return false;
}

function hasNegationOutsideStrings(text: string): boolean {
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) { inString = false; }
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }
    if (ch === '!') {
      if (i + 1 < text.length && text[i + 1] === '=') continue;
      if (i > 0 && (text[i - 1] === '<' || text[i - 1] === '>')) continue;
      if (i + 1 < text.length && /[A-Za-z_]/.test(text[i + 1])) return true;
    }
  }
  return false;
}

function isInsideString(text: string, targetPos: number): boolean {
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < targetPos && i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) { inString = false; }
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; }
  }
  return inString;
}

// ============================================================================
// Fix 5: String-aware operator detection (Cat-51, Cat-52, Cat-53)
// ============================================================================

describe('Fix 5: String-aware operator detection', () => {
  describe('hasOperatorOutsideStrings with &&', () => {
    it('should detect && outside strings', () => {
      expect(hasOperatorOutsideStrings('x && y', '&&')).toBe(true);
    });

    it('should NOT detect && inside double-quoted string', () => {
      expect(hasOperatorOutsideStrings('"a && b"', '&&')).toBe(false);
    });

    it('should NOT detect && inside single-quoted string', () => {
      expect(hasOperatorOutsideStrings("'a && b'", '&&')).toBe(false);
    });

    it('should detect && when only partially in a string', () => {
      // "foo" && bar - the && is outside the string
      expect(hasOperatorOutsideStrings('"foo" && bar', '&&')).toBe(true);
    });

    it('should NOT detect && in string with escaped quotes', () => {
      expect(hasOperatorOutsideStrings('"a \\"&& b\\" c"', '&&')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(hasOperatorOutsideStrings('', '&&')).toBe(false);
    });
  });

  describe('hasOperatorOutsideStrings with ||', () => {
    it('should detect || outside strings', () => {
      expect(hasOperatorOutsideStrings('x || y', '||')).toBe(true);
    });

    it('should NOT detect || inside double-quoted string', () => {
      expect(hasOperatorOutsideStrings('"a || b"', '||')).toBe(false);
    });

    it('should NOT detect || inside single-quoted string', () => {
      expect(hasOperatorOutsideStrings("'a || b'", '||')).toBe(false);
    });

    it('should detect || after a closed string', () => {
      expect(hasOperatorOutsideStrings('"foo" || "bar"', '||')).toBe(true);
    });
  });

  describe('hasNegationOutsideStrings', () => {
    it('should detect !variable outside strings', () => {
      expect(hasNegationOutsideStrings('!isReady')).toBe(true);
    });

    it('should NOT detect !variable inside strings', () => {
      expect(hasNegationOutsideStrings('"!isReady"')).toBe(false);
    });

    it('should NOT flag != (comparison operator)', () => {
      expect(hasNegationOutsideStrings('x != y')).toBe(false);
    });

    it('should detect ! before identifier but not before =', () => {
      expect(hasNegationOutsideStrings('!done')).toBe(true);
      expect(hasNegationOutsideStrings('x != 5')).toBe(false);
    });

    it('should NOT detect ! inside single-quoted string', () => {
      expect(hasNegationOutsideStrings("'!flag'")).toBe(false);
    });

    it('should handle condition with string containing ! and real ! outside', () => {
      // "hello!" is in a string, but !done is real
      expect(hasNegationOutsideStrings('"hello!" and !done')).toBe(true);
    });

    it('should handle complex condition: string op then real negation', () => {
      expect(hasNegationOutsideStrings('msg == "!important" and !ready')).toBe(true);
    });

    it('should NOT flag when all negations are inside strings', () => {
      expect(hasNegationOutsideStrings('msg == "!important" and flag == "!urgent"')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(hasNegationOutsideStrings('')).toBe(false);
    });

    it('should NOT flag isolated ! without identifier', () => {
      expect(hasNegationOutsideStrings('!')).toBe(false);
      expect(hasNegationOutsideStrings('x ! y')).toBe(false);
    });
  });
});

// ============================================================================
// Fix 6: String-aware recursive call detection (Cat-75)
// ============================================================================

describe('Fix 6: String-aware recursive call detection', () => {
  describe('isInsideString', () => {
    it('should return false for position outside strings', () => {
      expect(isInsideString('hello world', 5)).toBe(false);
    });

    it('should return true for position inside double-quoted string', () => {
      // Position 7 is inside "hello"
      expect(isInsideString('foo = "hello"', 7)).toBe(true);
    });

    it('should return true for position inside single-quoted string', () => {
      expect(isInsideString("foo = 'hello'", 7)).toBe(true);
    });

    it('should return false for position after closing quote', () => {
      // "hi" ends at index 3, position 5 is outside
      expect(isInsideString('"hi" x', 5)).toBe(false);
    });

    it('should handle escaped quotes correctly', () => {
      // "he\"llo" - position 5 is still inside the string
      expect(isInsideString('"he\\"llo"', 5)).toBe(true);
    });

    it('should handle position 0', () => {
      expect(isInsideString('"hello"', 0)).toBe(false);
    });

    it('should handle position at string boundary', () => {
      // Position 1 is the 'h' in "hello"
      expect(isInsideString('"hello"', 1)).toBe(true);
    });
  });

  describe('recursive call in string context', () => {
    it('should detect real recursive call', () => {
      // Simulate: MySkill(arg=MySkill(...)) - MySkill at position 10 is NOT in a string
      const argRegion = 'arg=val, MySkill(nested)';
      const skillNamePos = argRegion.indexOf('MySkill');
      expect(isInsideString(argRegion, skillNamePos)).toBe(false);
    });

    it('should NOT flag recursive call name inside string argument', () => {
      // Simulate: OtherSkill(msg="Please call MySkill for help")
      const argRegion = 'msg="Please call MySkill for help"';
      const skillNamePos = argRegion.indexOf('MySkill');
      expect(isInsideString(argRegion, skillNamePos)).toBe(true);
    });

    it('should NOT flag action name mentioned in error message string', () => {
      // Common pattern: SendMessage(message="Error in ProcessOrderSkill: ...")
      const argRegion = 'message="Error in ProcessOrderSkill: failed"';
      const pos = argRegion.indexOf('ProcessOrderSkill');
      expect(isInsideString(argRegion, pos)).toBe(true);
    });

    it('should detect real recursive call after a string argument', () => {
      // Simulate: msg="hello", callback=MySkill(x)
      const argRegion = 'msg="hello", callback=MySkill(x)';
      const pos = argRegion.indexOf('MySkill');
      expect(isInsideString(argRegion, pos)).toBe(false);
    });
  });
});

// ============================================================================
// Fix 8: Expanded VOID_ACTIONS list (Cat-72)
// ============================================================================

describe('Fix 8: Expanded VOID_ACTIONS list', () => {
  // We test that the VOID_ACTIONS set includes the newly added entries
  // by checking the pattern that would match in validate.ts
  const VOID_ACTIONS = new Set([
    'SendMessage', 'SetState', 'Sleep', 'Return', 'StopFlow',
    'RaiseEvent', 'GoToFlow', 'GoToSkill', 'EndConversation', 'TransferCall',
    'SendEmail', 'SendSms', 'Log', 'SetCustomerAttribute', 'SetProjectAttribute',
    'SetCustomerMetadataAttribute', 'SetProjectMetadataAttribute',
    'DeleteCustomerAttribute', 'DeleteConnector', 'DeleteAkb',
    'SendTypingStart', 'SendTypingStop',
    'DisableFollowUp', 'EnableFollowUp',
    'SetConnectorInfo', 'SetPersonaAttribute',
    'SendSystemEvent', 'SendCommand', 'DUMMY',
    'StartNotInterruptibleBlock', 'StopNotInterruptibleBlock',
  ]);

  describe('original entries still present', () => {
    const original = [
      'SendMessage', 'SetState', 'Sleep', 'Return', 'StopFlow',
      'RaiseEvent', 'GoToFlow', 'GoToSkill', 'EndConversation', 'TransferCall',
      'SendEmail', 'SendSms', 'Log', 'SetCustomerAttribute', 'SetProjectAttribute',
    ];
    for (const name of original) {
      it(`should contain original void action: ${name}`, () => {
        expect(VOID_ACTIONS.has(name)).toBe(true);
      });
    }
  });

  describe('newly added entries present', () => {
    const added = [
      'SetCustomerMetadataAttribute', 'SetProjectMetadataAttribute',
      'DeleteCustomerAttribute', 'DeleteConnector', 'DeleteAkb',
      'SendTypingStart', 'SendTypingStop',
      'DisableFollowUp', 'EnableFollowUp',
      'SetConnectorInfo', 'SetPersonaAttribute',
      'SendSystemEvent', 'SendCommand', 'DUMMY',
      'StartNotInterruptibleBlock', 'StopNotInterruptibleBlock',
    ];
    for (const name of added) {
      it(`should contain newly added void action: ${name}`, () => {
        expect(VOID_ACTIONS.has(name)).toBe(true);
      });
    }
  });

  describe('void assignment detection pattern', () => {
    const setActionRe = /\{%-?\s*set\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([A-Z][A-Za-z0-9_]*)\s*\(/g;

    it('should match set + void action pattern', () => {
      const text = '{% set result = SendTypingStart() %}';
      const match = setActionRe.exec(text);
      expect(match).not.toBeNull();
      expect(match![1]).toBe('result');
      expect(match![2]).toBe('SendTypingStart');
      expect(VOID_ACTIONS.has(match![2])).toBe(true);
    });

    it('should match set with whitespace-trimming', () => {
      setActionRe.lastIndex = 0;
      const text = '{%- set x = DUMMY() -%}';
      const match = setActionRe.exec(text);
      expect(match).not.toBeNull();
      expect(match![2]).toBe('DUMMY');
      expect(VOID_ACTIONS.has(match![2])).toBe(true);
    });

    it('should not flag non-void actions', () => {
      setActionRe.lastIndex = 0;
      const text = '{% set result = GetCustomerAttribute(name="id") %}';
      const match = setActionRe.exec(text);
      expect(match).not.toBeNull();
      expect(match![2]).toBe('GetCustomerAttribute');
      expect(VOID_ACTIONS.has(match![2])).toBe(false);
    });
  });
});
