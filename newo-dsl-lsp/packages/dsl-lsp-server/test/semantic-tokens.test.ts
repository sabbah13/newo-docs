/**
 * Tests for the Semantic Tokens module.
 *
 * Covers: comment tokens, keyword tokens, built-in action calls,
 * skill calls, variable definitions/references, property chains,
 * keyword arguments, string/number literals, operators, filters,
 * empty documents, and document ordering.
 */

import { describe, it, expect } from 'vitest';
import { computeSemanticTokens, TOKEN_TYPES, TOKEN_MODIFIERS } from '../src/semantic-tokens';
import { buildVariableTable } from '../src/variable-tracker';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TOKEN_TYPE_INDEX = new Map(TOKEN_TYPES.map((t, i) => [t, i]));
const TOKEN_MODIFIER_INDEX = new Map(TOKEN_MODIFIERS.map((m, i) => [m, i]));

const EMPTY_CTX = {
  actionNames: new Set<string>(),
  skillNames: new Set<string>(),
  jinjaBuiltinNames: new Set<string>(),
};

const SAMPLE_CTX = {
  actionNames: new Set(['GetUser', 'SendCommand', 'Return', 'Set', 'GetMemory']),
  skillNames: new Set(['AnalyzeSkill', 'CustomSkill']),
  jinjaBuiltinNames: new Set(['range', 'length', 'upper', 'lower', 'trim']),
};

/** Decode the delta-encoded semantic tokens data into readable objects. */
function decodeTokens(data: number[]) {
  const tokens: Array<{
    line: number;
    col: number;
    length: number;
    type: string;
    modifiers: string[];
  }> = [];

  let prevLine = 0;
  let prevCol = 0;

  for (let i = 0; i < data.length; i += 5) {
    const deltaLine = data[i];
    const deltaCol = data[i + 1];
    const length = data[i + 2];
    const typeIndex = data[i + 3];
    const modBits = data[i + 4];

    const line = prevLine + deltaLine;
    const col = deltaLine === 0 ? prevCol + deltaCol : deltaCol;

    const modifiers: string[] = [];
    for (let bit = 0; bit < TOKEN_MODIFIERS.length; bit++) {
      if (modBits & (1 << bit)) {
        modifiers.push(TOKEN_MODIFIERS[bit]);
      }
    }

    tokens.push({
      line,
      col,
      length,
      type: TOKEN_TYPES[typeIndex] || `unknown(${typeIndex})`,
      modifiers,
    });

    prevLine = line;
    prevCol = col;
  }

  return tokens;
}

/** Find a token at a specific position. */
function findToken(tokens: ReturnType<typeof decodeTokens>, line: number, col: number) {
  return tokens.find(t => t.line === line && t.col === col);
}

/** Find all tokens of a specific type. */
function findTokensByType(tokens: ReturnType<typeof decodeTokens>, type: string) {
  return tokens.filter(t => t.type === type);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Semantic Tokens - Empty/Trivial', () => {
  it('returns empty data for empty document', () => {
    const result = computeSemanticTokens('', undefined, EMPTY_CTX);
    expect(result.data).toEqual([]);
  });

  it('returns empty data for plain text without template blocks', () => {
    const result = computeSemanticTokens('Hello world', undefined, EMPTY_CTX);
    expect(result.data).toEqual([]);
  });
});

describe('Semantic Tokens - Comments', () => {
  it('tokenizes Jinja comments {# ... #}', () => {
    const text = '{# This is a comment #}';
    const result = computeSemanticTokens(text, undefined, EMPTY_CTX);
    const tokens = decodeTokens(result.data);
    const commentTokens = findTokensByType(tokens, 'comment');
    expect(commentTokens.length).toBeGreaterThanOrEqual(1);
    expect(commentTokens[0].line).toBe(0);
    expect(commentTokens[0].col).toBe(0);
  });

  it('tokenizes Guidance comments {{!-- ... --}}', () => {
    const text = '{{!-- This is a guidance comment --}}';
    const result = computeSemanticTokens(text, undefined, EMPTY_CTX);
    const tokens = decodeTokens(result.data);
    const commentTokens = findTokensByType(tokens, 'comment');
    expect(commentTokens.length).toBeGreaterThanOrEqual(1);
    expect(commentTokens[0].line).toBe(0);
  });
});

describe('Semantic Tokens - Keywords', () => {
  it('tokenizes Jinja keywords (set, if, for, in, else)', () => {
    const text = '{% set x = 42 %}';
    const varTable = buildVariableTable(text);
    const result = computeSemanticTokens(text, varTable, EMPTY_CTX);
    const tokens = decodeTokens(result.data);

    const setToken = tokens.find(t => t.type === 'keyword' && t.length === 3);
    expect(setToken).toBeDefined();
  });

  it('tokenizes if/else keywords', () => {
    const text = '{% if active %}\nyes\n{% else %}\nno\n{% endif %}';
    const lines = text.split('\n');
    const varTable = buildVariableTable(text);
    const result = computeSemanticTokens(text, varTable, EMPTY_CTX);
    const tokens = decodeTokens(result.data);
    const kwTokens = findTokensByType(tokens, 'keyword');
    const kwNames = kwTokens.map(t => lines[t.line].slice(t.col, t.col + t.length));
    expect(kwNames).toContain('if');
    expect(kwNames).toContain('else');
    expect(kwNames).toContain('endif');
  });
});

describe('Semantic Tokens - Built-in Actions', () => {
  it('tokenizes built-in action calls with defaultLibrary modifier', () => {
    const text = '{{ GetUser() }}';
    const result = computeSemanticTokens(text, undefined, SAMPLE_CTX);
    const tokens = decodeTokens(result.data);

    const getUserToken = tokens.find(t => t.length === 'GetUser'.length && t.type === 'function');
    expect(getUserToken).toBeDefined();
    expect(getUserToken!.modifiers).toContain('defaultLibrary');
  });

  it('tokenizes built-in action in statement block', () => {
    const text = '{% set user = GetUser() %}';
    const varTable = buildVariableTable(text);
    const result = computeSemanticTokens(text, varTable, SAMPLE_CTX);
    const tokens = decodeTokens(result.data);

    const funcTokens = findTokensByType(tokens, 'function');
    const getUserToken = funcTokens.find(t => t.length === 'GetUser'.length);
    expect(getUserToken).toBeDefined();
    expect(getUserToken!.modifiers).toContain('defaultLibrary');
  });
});

describe('Semantic Tokens - Skill Calls', () => {
  it('tokenizes skill calls as function without defaultLibrary', () => {
    const text = '{{ AnalyzeSkill() }}';
    const result = computeSemanticTokens(text, undefined, SAMPLE_CTX);
    const tokens = decodeTokens(result.data);

    const skillToken = tokens.find(t => t.length === 'AnalyzeSkill'.length && t.type === 'function');
    expect(skillToken).toBeDefined();
    expect(skillToken!.modifiers).not.toContain('defaultLibrary');
  });
});

describe('Semantic Tokens - Variables', () => {
  it('tokenizes variable definitions with declaration modifier', () => {
    const text = '{% set user = GetUser() %}';
    const varTable = buildVariableTable(text);
    const result = computeSemanticTokens(text, varTable, SAMPLE_CTX);
    const tokens = decodeTokens(result.data);

    const varDefTokens = tokens.filter(t => t.type === 'variable' && t.modifiers.includes('declaration'));
    expect(varDefTokens.length).toBeGreaterThanOrEqual(1);
    expect(varDefTokens.some(t => t.length === 'user'.length)).toBe(true);
  });

  it('tokenizes variable references without declaration modifier', () => {
    const text = '{% set name = "test" %}\n{{ name }}';
    const varTable = buildVariableTable(text);
    const result = computeSemanticTokens(text, varTable, EMPTY_CTX);
    const tokens = decodeTokens(result.data);

    const refTokens = tokens.filter(t =>
      t.type === 'variable' && !t.modifiers.includes('declaration') && t.line === 1
    );
    expect(refTokens.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Semantic Tokens - Properties', () => {
  it('tokenizes property chains', () => {
    const text = '{% set user = GetUser() %}\n{{ user.name }}';
    const varTable = buildVariableTable(text);
    const result = computeSemanticTokens(text, varTable, SAMPLE_CTX);
    const tokens = decodeTokens(result.data);

    const propTokens = findTokensByType(tokens, 'property');
    expect(propTokens.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Semantic Tokens - Parameters', () => {
  it('tokenizes keyword argument names as parameter', () => {
    const text = '{{ SendCommand(commandIdn="test", actorId=123) }}';
    const result = computeSemanticTokens(text, undefined, SAMPLE_CTX);
    const tokens = decodeTokens(result.data);

    const paramTokens = findTokensByType(tokens, 'parameter');
    expect(paramTokens.length).toBeGreaterThanOrEqual(1);
    // commandIdn should be a parameter
    const cmdToken = paramTokens.find(t => t.length === 'commandIdn'.length);
    expect(cmdToken).toBeDefined();
  });
});

describe('Semantic Tokens - Strings', () => {
  it('tokenizes string literals', () => {
    const text = '{{ Set(name="greeting", value="hello") }}';
    const result = computeSemanticTokens(text, undefined, SAMPLE_CTX);
    const tokens = decodeTokens(result.data);

    const strTokens = findTokensByType(tokens, 'string');
    expect(strTokens.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Semantic Tokens - Numbers', () => {
  it('tokenizes numeric literals', () => {
    const text = '{% set x = 42 %}';
    const varTable = buildVariableTable(text);
    const result = computeSemanticTokens(text, varTable, EMPTY_CTX);
    const tokens = decodeTokens(result.data);

    const numTokens = findTokensByType(tokens, 'number');
    expect(numTokens.length).toBeGreaterThanOrEqual(1);
    expect(numTokens[0].length).toBe(2); // "42"
  });
});

describe('Semantic Tokens - Operators', () => {
  it('tokenizes comparison operators', () => {
    const text = '{% if x == "yes" %}{% endif %}';
    const varTable = buildVariableTable(text);
    const result = computeSemanticTokens(text, varTable, EMPTY_CTX);
    const tokens = decodeTokens(result.data);

    const opTokens = findTokensByType(tokens, 'operator');
    expect(opTokens.some(t => t.length === 2)).toBe(true); // "=="
  });

  it('tokenizes tilde concatenation operator', () => {
    const text = '{{ a ~ b }}';
    const result = computeSemanticTokens(text, undefined, EMPTY_CTX);
    const tokens = decodeTokens(result.data);

    const opTokens = findTokensByType(tokens, 'operator');
    expect(opTokens.some(t => t.length === 1)).toBe(true); // "~"
  });
});

describe('Semantic Tokens - Filters', () => {
  it('tokenizes filters after pipe as function', () => {
    const text = '{{ name | upper }}';
    const result = computeSemanticTokens(text, undefined, SAMPLE_CTX);
    const tokens = decodeTokens(result.data);

    const funcTokens = findTokensByType(tokens, 'function');
    const upperToken = funcTokens.find(t => t.length === 'upper'.length);
    expect(upperToken).toBeDefined();
  });
});

describe('Semantic Tokens - Guidance Block Tags', () => {
  it('does not produce variable tokens for Guidance block names', () => {
    const text = '{{#system~}}\nHello\n{{~/system}}';
    const varTable = buildVariableTable(text);
    const result = computeSemanticTokens(text, varTable, EMPTY_CTX);
    const tokens = decodeTokens(result.data);

    // "system" should NOT appear as a variable
    const systemVarToken = tokens.find(t =>
      t.type === 'variable' && t.length === 'system'.length
    );
    expect(systemVarToken).toBeUndefined();
  });
});

describe('Semantic Tokens - Ordering', () => {
  it('produces tokens in correct document order', () => {
    const text = '{% set x = 1 %}\n{{ x }}\n{% set y = 2 %}\n{{ y }}';
    const varTable = buildVariableTable(text);
    const result = computeSemanticTokens(text, varTable, EMPTY_CTX);
    const tokens = decodeTokens(result.data);

    // Verify monotonic (line, col) ordering
    for (let i = 1; i < tokens.length; i++) {
      const prev = tokens[i - 1];
      const curr = tokens[i];
      const ordered = curr.line > prev.line ||
        (curr.line === prev.line && curr.col >= prev.col);
      expect(ordered).toBe(true);
    }
  });
});
