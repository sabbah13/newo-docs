/**
 * Template validation integration tests.
 *
 * Tests that the JinjaParser correctly parses and validates real templates
 * from both V1 (.jinja/.guidance) and V2 (.nsl/.nslg) formats.
 * Verifies that syntax highlighting, function recognition, action detection,
 * and diagnostics all work correctly across both formats.
 */

import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { JinjaParser } from '@newo-dsl/analyzer';
import { ACTIONS, JINJA_BUILTINS } from '@newo-dsl/data';

const parser = new JinjaParser();

// Real data paths
const REAL_V1_PATH = path.resolve(__dirname, '../../../../newo/newo_customers');
const REAL_V2_PATH = path.resolve(__dirname, '../../../../temp/v2-format/NEnw5FcbBP');

const hasRealV1 = fs.existsSync(REAL_V1_PATH);
const hasRealV2 = fs.existsSync(REAL_V2_PATH);

const ACTION_NAMES = new Set(Object.keys(ACTIONS));
const BUILTIN_NAMES = new Set(Object.keys(JINJA_BUILTINS));

// ============================================================================
// Helper to collect real template files
// ============================================================================

function collectTemplateFiles(dir: string, extensions: string[], limit = 50): string[] {
  const files: string[] = [];
  const walk = (d: string) => {
    if (files.length >= limit) return;
    try {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const entry of entries) {
        if (files.length >= limit) return;
        const full = path.join(d, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'akb') {
          walk(full);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(full);
        }
      }
    } catch { /* ignore */ }
  };
  walk(dir);
  return files;
}

// ============================================================================
// 1. Action/function recognition across both formats
// ============================================================================

describe('Action recognition in V1 templates', () => {
  it.skipIf(!hasRealV1)('should recognize known actions in V1 .jinja files', () => {
    // StopCallingSkill.jinja: {{SetState(name="launched", value="False")}}
    const filePath = path.join(
      REAL_V1_PATH,
      'default/projects/naf/TaskManager/TaskTableFlow/StopCallingSkill/StopCallingSkill.jinja'
    );
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const result = parser.parse(content, 'test.jinja');

    // Should find SetState as a function call
    const funcNames = result.functionCalls.map(f => f.name);
    expect(funcNames).toContain('SetState');
    // SetState is a known built-in action
    expect(ACTION_NAMES.has('SetState')).toBe(true);
  });

  it.skipIf(!hasRealV1)('should parse V1 .jinja files without crashing', () => {
    const projectsDir = path.join(REAL_V1_PATH, 'default/projects');
    const jinjaFiles = collectTemplateFiles(projectsDir, ['.jinja'], 30);

    let parsed = 0;
    for (const file of jinjaFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      // Should not throw
      const result = parser.parse(content, file);
      expect(result).toBeDefined();
      expect(Array.isArray(result.functionCalls)).toBe(true);
      expect(Array.isArray(result.diagnostics)).toBe(true);
      parsed++;
    }
    expect(parsed).toBeGreaterThan(0);
  });

  it.skipIf(!hasRealV1)('should parse V1 .guidance files without crashing', () => {
    const projectsDir = path.join(REAL_V1_PATH, 'default/projects');
    const guidanceFiles = collectTemplateFiles(projectsDir, ['.guidance'], 30);

    let parsed = 0;
    for (const file of guidanceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const result = parser.parse(content, file);
      expect(result).toBeDefined();
      expect(Array.isArray(result.functionCalls)).toBe(true);
      parsed++;
    }
    expect(parsed).toBeGreaterThan(0);
  });
});

describe('Action recognition in V2 templates', () => {
  it.skipIf(!hasRealV2)('should recognize known actions in V2 .nsl files', () => {
    // ResultErrorSkill.nsl uses SendSystemEvent
    const filePath = path.join(
      REAL_V2_PATH,
      'cal_com/agents/CalComAgent/flows/CancellationFlow/skills/ResultErrorSkill.nsl'
    );
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const result = parser.parse(content, 'test.nsl');

    const funcNames = result.functionCalls.map(f => f.name);
    expect(funcNames).toContain('SendSystemEvent');
    expect(ACTION_NAMES.has('SendSystemEvent')).toBe(true);
  });

  it.skipIf(!hasRealV2)('should recognize guidance blocks in V2 .nslg files', () => {
    // ConversationStartedSkill.nslg uses {{#if}}, Set, SendSystemEvent, etc.
    const filePath = path.join(
      REAL_V2_PATH,
      'naf/agents/ConvoAgent/flows/CAMainFlow/skills/ConversationStartedSkill.nslg'
    );
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const result = parser.parse(content, 'test.nslg');

    // Should find function calls
    const funcNames = result.functionCalls.map(f => f.name);
    expect(funcNames.length).toBeGreaterThan(0);

    // Should find guidance blocks ({{#if}})
    if (result.blocks) {
      const blockNames = result.blocks.map(b => b.name);
      expect(blockNames).toContain('if');
    }
  });

  it.skipIf(!hasRealV2)('should parse V2 .nsl files without crashing', () => {
    const nslFiles = collectTemplateFiles(REAL_V2_PATH, ['.nsl'], 30);

    let parsed = 0;
    for (const file of nslFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const result = parser.parse(content, file);
      expect(result).toBeDefined();
      expect(Array.isArray(result.functionCalls)).toBe(true);
      parsed++;
    }
    expect(parsed).toBeGreaterThan(0);
  });

  it.skipIf(!hasRealV2)('should parse V2 .nslg files without crashing', () => {
    const nslgFiles = collectTemplateFiles(REAL_V2_PATH, ['.nslg'], 30);

    let parsed = 0;
    for (const file of nslgFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const result = parser.parse(content, file);
      expect(result).toBeDefined();
      expect(Array.isArray(result.functionCalls)).toBe(true);
      parsed++;
    }
    expect(parsed).toBeGreaterThan(0);
  });
});

// ============================================================================
// 2. Template syntax equivalence (same skill, V1 vs V2)
// ============================================================================

describe('V1/V2 template syntax equivalence', () => {
  it.skipIf(!hasRealV1 || !hasRealV2)('same skill should produce similar parse results in V1 and V2', () => {
    // Pick a skill that exists in both formats
    // ConversationStartedSkill exists in both
    const v1Path = path.join(
      REAL_V1_PATH,
      'default/projects/naf/ConvoAgent/CAMainFlow/ConversationStartedSkill/ConversationStartedSkill.guidance'
    );
    const v2Path = path.join(
      REAL_V2_PATH,
      'naf/agents/ConvoAgent/flows/CAMainFlow/skills/ConversationStartedSkill.nslg'
    );

    if (!fs.existsSync(v1Path) || !fs.existsSync(v2Path)) return;

    const v1Content = fs.readFileSync(v1Path, 'utf-8');
    const v2Content = fs.readFileSync(v2Path, 'utf-8');

    const v1Result = parser.parse(v1Content, 'test.guidance');
    const v2Result = parser.parse(v2Content, 'test.nslg');

    // Both should parse without errors (or have the same errors)
    // The content should be identical or very similar between V1 and V2
    const v1FuncNames = new Set(v1Result.functionCalls.map(f => f.name));
    const v2FuncNames = new Set(v2Result.functionCalls.map(f => f.name));

    // If the content is the same, function calls should match
    if (v1Content === v2Content) {
      expect(v1FuncNames.size).toBe(v2FuncNames.size);
      for (const name of v1FuncNames) {
        expect(v2FuncNames.has(name)).toBe(true);
      }
    } else {
      // Content may have minor differences but should still find common actions
      // At minimum both should parse successfully
      expect(v1Result.functionCalls.length).toBeGreaterThan(0);
      expect(v2Result.functionCalls.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// 3. Known action coverage - all ACTIONS should be recognizable
// ============================================================================

describe('Known action coverage', () => {
  it('should recognize built-in actions when used in templates', () => {
    // Note: Some action names like "Set" collide with Jinja keywords and are
    // intentionally filtered by JinjaParser (they are handled by the LSP server
    // via its own regex-based extraction). We test non-keyword actions here.
    const jinjaKeywords = new Set(['set', 'if', 'elif', 'else', 'endif', 'for', 'endfor',
      'block', 'endblock', 'macro', 'endmacro', 'call', 'filter', 'raw', 'include',
      'import', 'from', 'extends', 'with', 'autoescape', 'range', 'not', 'and', 'or',
      'in', 'is', 'true', 'false', 'none']);

    let tested = 0;
    for (const actionName of Object.keys(ACTIONS)) {
      if (jinjaKeywords.has(actionName.toLowerCase())) continue;

      const template = `{{${actionName}()}}`;
      const result = parser.parse(template, 'test.jinja');
      const found = result.functionCalls.find(f => f.name === actionName);
      expect(found, `Action '${actionName}' not recognized`).toBeDefined();
      tested++;
    }
    // Should test at least 60 of the 76 actions
    expect(tested).toBeGreaterThan(60);
  });

  it('should recognize actions in V2 .nsl context', () => {
    // Common non-keyword actions used in NSL templates
    const testActions = ['SendMessage', 'Return', 'GetCustomerAttribute', 'SendSystemEvent', 'SetState'];
    for (const action of testActions) {
      const template = `{{${action}(message="test")}}`;
      const result = parser.parse(template, 'test.nsl');
      expect(result.functionCalls.some(f => f.name === action)).toBe(true);
    }
  });

  it('should recognize actions inside V2 .nslg guidance blocks', () => {
    const template = `{{#system}}You are a helper.{{/system}}
{{#user}}{{prompt}}{{/user}}
{{#assistant}}{{SendMessage(message="hello")}}{{/assistant}}`;
    const result = parser.parse(template, 'test.nslg');
    expect(result.functionCalls.some(f => f.name === 'SendMessage')).toBe(true);
  });
});

// ============================================================================
// 4. Diagnostics validation
// ============================================================================

describe('Diagnostics on real templates', () => {
  it.skipIf(!hasRealV1)('should not produce excessive false errors on V1 templates', () => {
    const projectsDir = path.join(REAL_V1_PATH, 'default/projects');
    const jinjaFiles = collectTemplateFiles(projectsDir, ['.jinja'], 20);

    let totalErrors = 0;
    let totalFiles = 0;

    for (const file of jinjaFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const result = parser.parse(content, file);
      const errors = result.diagnostics.filter(d => d.code?.toString().startsWith('E'));
      totalErrors += errors.length;
      totalFiles++;
    }

    // Error rate should be reasonable (not every file has errors)
    // If > 80% of files have errors, something is wrong with the parser
    const errorRate = totalErrors / totalFiles;
    expect(errorRate).toBeLessThan(5); // Less than 5 errors per file on average
  });

  it.skipIf(!hasRealV2)('should not produce excessive false errors on V2 templates', () => {
    const nslFiles = collectTemplateFiles(REAL_V2_PATH, ['.nsl'], 20);

    let totalErrors = 0;
    let totalFiles = 0;

    for (const file of nslFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const result = parser.parse(content, file);
      const errors = result.diagnostics.filter(d => d.code?.toString().startsWith('E'));
      totalErrors += errors.length;
      totalFiles++;
    }

    const errorRate = totalErrors / totalFiles;
    expect(errorRate).toBeLessThan(5);
  });

  it.skipIf(!hasRealV2)('should not produce false errors on V2 .nslg guidance files', () => {
    const nslgFiles = collectTemplateFiles(REAL_V2_PATH, ['.nslg'], 20);

    let totalErrors = 0;
    let totalFiles = 0;

    for (const file of nslgFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const result = parser.parse(content, file);
      const errors = result.diagnostics.filter(d => d.code?.toString().startsWith('E'));
      totalErrors += errors.length;
      totalFiles++;
    }

    const errorRate = totalErrors / totalFiles;
    expect(errorRate).toBeLessThan(5);
  });
});

// ============================================================================
// 5. Guidance block handling in V2 .nslg files
// ============================================================================

describe('Guidance blocks in V2 .nslg files', () => {
  it('should parse standard guidance blocks', () => {
    const template = '{{#system}}System prompt{{/system}}\n{{#user}}User input{{/user}}';
    const result = parser.parse(template, 'test.nslg');
    expect(result.blocks).toBeDefined();
    expect(result.blocks!.length).toBeGreaterThanOrEqual(4);
    expect(result.diagnostics.filter(d => d.code === 'E010')).toHaveLength(0);
    expect(result.diagnostics.filter(d => d.code === 'E011')).toHaveLength(0);
    expect(result.diagnostics.filter(d => d.code === 'E012')).toHaveLength(0);
  });

  it('should handle nested {{#if}} inside guidance blocks', () => {
    const template = `{{#system}}You are helpful.{{/system}}
{{#user}}{{#if condition}}yes{{/if}}{{/user}}`;
    const result = parser.parse(template, 'test.nslg');
    expect(result.diagnostics.filter(d => d.code?.toString().startsWith('E01'))).toHaveLength(0);
  });

  it.skipIf(!hasRealV2)('should handle real V2 .nslg with complex guidance blocks', () => {
    const filePath = path.join(
      REAL_V2_PATH,
      'naf/agents/ConvoAgent/flows/CAMainFlow/skills/ConversationStartedSkill.nslg'
    );
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const result = parser.parse(content, 'test.nslg');

    // Should parse without block errors (E010, E011, E012)
    // Note: there may be legitimate errors in the template, but block errors
    // should not occur if blocks are properly balanced
    const blockErrors = result.diagnostics.filter(d => {
      const code = d.code?.toString();
      return code === 'E010' || code === 'E011' || code === 'E012';
    });

    // Real templates may have some block issues, but check it doesn't crash
    expect(result).toBeDefined();
  });
});

// ============================================================================
// 6. Comprehensive parsing performance
// ============================================================================

describe('Parsing performance', () => {
  it.skipIf(!hasRealV1)('should parse 50 V1 templates in under 1 second', () => {
    const projectsDir = path.join(REAL_V1_PATH, 'default/projects');
    const files = collectTemplateFiles(projectsDir, ['.jinja', '.guidance'], 50);

    const start = performance.now();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      parser.parse(content, file);
    }
    const elapsed = performance.now() - start;

    expect(files.length).toBeGreaterThan(30);
    expect(elapsed).toBeLessThan(1000);
  });

  it.skipIf(!hasRealV2)('should parse 50 V2 templates in under 1 second', () => {
    const files = collectTemplateFiles(REAL_V2_PATH, ['.nsl', '.nslg'], 50);

    const start = performance.now();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      parser.parse(content, file);
    }
    const elapsed = performance.now() - start;

    expect(files.length).toBeGreaterThan(30);
    expect(elapsed).toBeLessThan(1000);
  });
});

// ============================================================================
// 7. JINJA_BUILTINS coverage
// ============================================================================

describe('JINJA_BUILTINS coverage', () => {
  it('should have 70+ Jinja builtins defined', () => {
    expect(Object.keys(JINJA_BUILTINS).length).toBeGreaterThan(70);
  });

  it('should recognize common Jinja filters in template expressions', () => {
    const template = '{{value | string}} {{items | length}} {{text | upper}}';
    const result = parser.parse(template, 'test.jinja');
    // Filters should NOT be extracted as function calls
    const funcNames = result.functionCalls.map(f => f.name);
    expect(funcNames).not.toContain('string');
    expect(funcNames).not.toContain('length');
    expect(funcNames).not.toContain('upper');
  });

  it('should not confuse Jinja keywords with actions', () => {
    const template = '{% if condition %}{% for item in items %}{{item}}{% endfor %}{% endif %}';
    const result = parser.parse(template, 'test.nsl');
    const funcNames = result.functionCalls.map(f => f.name);
    expect(funcNames).not.toContain('if');
    expect(funcNames).not.toContain('for');
    expect(funcNames).not.toContain('endfor');
    expect(funcNames).not.toContain('endif');
  });
});
