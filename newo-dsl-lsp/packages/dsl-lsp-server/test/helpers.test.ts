import { describe, it, expect } from 'vitest';

// Test the formatActionDoc helper by extracting its logic
// (Since server.ts is a single-file module, we test the formatting pattern directly)

interface ActionDefinition {
  description: string;
  category: string;
  syntax: string;
  parameters: Record<string, {
    type: string;
    required: boolean;
    default?: string;
    description: string;
    allowed?: string[];
  }>;
  returns: string;
  example: string;
}

function formatActionDoc(name: string, action: ActionDefinition): string {
  let doc = `## ${name}\n\n`;
  doc += `${action.description}\n\n`;
  doc += `**Category:** ${action.category}\n\n`;
  doc += `**Syntax:**\n\`\`\`newo\n${action.syntax}\n\`\`\`\n\n`;

  if (Object.keys(action.parameters).length > 0) {
    doc += `**Parameters:**\n`;
    for (const [pName, param] of Object.entries(action.parameters)) {
      const req = param.required ? '*(required)*' : '*(optional)*';
      const def = param.default ? ` Default: \`${param.default}\`` : '';
      const allowed = param.allowed ? ` Options: \`${param.allowed.join('`, `')}\`` : '';
      doc += `- \`${pName}\` (${param.type}) ${req}: ${param.description}${def}${allowed}\n`;
    }
    doc += '\n';
  }

  doc += `**Returns:** ${action.returns}\n\n`;
  doc += `**Example:**\n\`\`\`newo\n${action.example}\n\`\`\``;

  return doc;
}

describe('formatActionDoc', () => {
  const sampleAction: ActionDefinition = {
    description: 'Send direct messages to actors',
    category: 'messaging',
    syntax: 'SendMessage(message, actorIds?)',
    parameters: {
      message: { type: 'string', required: true, description: 'The message content' },
      actorIds: { type: 'List[str]', required: false, default: 'GetActors()', description: 'Target actor IDs' }
    },
    returns: 'void',
    example: '{{SendMessage(message="Hello!")}}'
  };

  it('should produce valid markdown', () => {
    const doc = formatActionDoc('SendMessage', sampleAction);
    expect(doc).toContain('## SendMessage');
    expect(doc).toContain('**Category:** messaging');
    expect(doc).toContain('**Returns:** void');
  });

  it('should include all parameters', () => {
    const doc = formatActionDoc('SendMessage', sampleAction);
    expect(doc).toContain('`message`');
    expect(doc).toContain('`actorIds`');
    expect(doc).toContain('*(required)*');
    expect(doc).toContain('*(optional)*');
  });

  it('should include default values', () => {
    const doc = formatActionDoc('SendMessage', sampleAction);
    expect(doc).toContain('Default: `GetActors()`');
  });

  it('should include syntax block', () => {
    const doc = formatActionDoc('SendMessage', sampleAction);
    expect(doc).toContain('```newo');
    expect(doc).toContain('SendMessage(message, actorIds?)');
  });

  it('should include example', () => {
    const doc = formatActionDoc('SendMessage', sampleAction);
    expect(doc).toContain('**Example:**');
    expect(doc).toContain('{{SendMessage(message="Hello!")}}');
  });

  it('should handle actions with no parameters', () => {
    const noParamAction: ActionDefinition = {
      description: 'Exit skill execution',
      category: 'flow',
      syntax: 'Return(val?)',
      parameters: {},
      returns: 'void',
      example: '{{Return()}}'
    };
    const doc = formatActionDoc('Return', noParamAction);
    expect(doc).not.toContain('**Parameters:**');
    expect(doc).toContain('## Return');
  });

  it('should include allowed values', () => {
    const constrainedAction: ActionDefinition = {
      description: 'Get datetime',
      category: 'datetime',
      syntax: 'GetDateTime(format?)',
      parameters: {
        format: {
          type: 'string',
          required: false,
          default: 'datetime',
          description: 'Format type',
          allowed: ['datetime', 'date', 'time']
        }
      },
      returns: 'string',
      example: '{{GetDateTime(format="date")}}'
    };
    const doc = formatActionDoc('GetDateTime', constrainedAction);
    expect(doc).toContain('Options: `datetime`, `date`, `time`');
  });
});

// ============================================================================
// extractTopLevelParams - depth-aware parameter extraction
// (Duplicated from server.ts for testing, same as formatActionDoc pattern above)
// ============================================================================

function extractTopLevelParams(callText: string): string[] {
  const params: string[] = [];
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < callText.length; i++) {
    const char = callText[i];

    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      continue;
    }
    if (inString) {
      if (char === '\\') { i++; continue; }
      if (char === stringChar) { inString = false; }
      continue;
    }

    if (char === '(') { depth++; continue; }
    if (char === ')') { depth--; continue; }

    if (depth === 1 && /[A-Za-z_]/.test(char)) {
      const rest = callText.substring(i);
      const m = rest.match(/^([A-Za-z_]\w*)\s*=/);
      if (m) {
        const afterEq = rest.substring(m[0].length);
        if (!afterEq.startsWith('=')) {
          params.push(m[1]);
        }
        i += m[0].length - 1;
      }
    }
  }

  return params;
}

describe('extractTopLevelParams', () => {
  it('should extract simple params', () => {
    const result = extractTopLevelParams('get_memory(user_id=userId, from_date="2024-01-01")');
    expect(result).toEqual(['user_id', 'from_date']);
  });

  it('should only extract top-level params, not nested ones', () => {
    const result = extractTopLevelParams(
      'get_memory(user_id=userId, from_date=GetPersonaAttribute(id=userId, field="last_call_ended_datetime_utc"))'
    );
    expect(result).toEqual(['user_id', 'from_date']);
    expect(result).not.toContain('id');
    expect(result).not.toContain('field');
  });

  it('should handle multiple nested calls with "or" operator', () => {
    const result = extractTopLevelParams(
      'get_memory(user_id=userId, from_date=GetPersonaAttribute(id=userId, field="last_call") or GetPersonaAttribute(id=userId, field="last_session"))'
    );
    expect(result).toEqual(['user_id', 'from_date']);
  });

  it('should handle deeply nested calls', () => {
    const result = extractTopLevelParams(
      'Outer(a=Inner1(b=Inner2(c=val)), d="test")'
    );
    expect(result).toEqual(['a', 'd']);
  });

  it('should not treat == as a parameter assignment', () => {
    const result = extractTopLevelParams(
      'SomeFunc(x=val, y=="comparison")'
    );
    expect(result).toEqual(['x']);
  });

  it('should handle no parameters', () => {
    const result = extractTopLevelParams('Return()');
    expect(result).toEqual([]);
  });

  it('should handle string values containing parens', () => {
    const result = extractTopLevelParams('Func(msg="hello (world)", count=5)');
    expect(result).toEqual(['msg', 'count']);
  });
});
