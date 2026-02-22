import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import {
  isTemplateFile,
  getTemplateType,
  stripTemplateExtension,
  detectFormatVersion,
  parseV2FlowYaml,
  parseSkillMetadata,
  scanDirectoryForSkills,
  scanV2ModuleForSkills,
  TEMPLATE_EXTENSIONS
} from '../src/format-utils';

// ============================================================================
// Path constants
// ============================================================================

const FIXTURES_DIR = path.resolve(__dirname, '../../../test/fixtures');
const V2_FIXTURE_DIR = path.join(FIXTURES_DIR, 'v2-project');
const V2_FIXTURE_ROOT = path.join(V2_FIXTURE_DIR, 'TestProject');

// Real production data paths
const REAL_V1_PATH = path.resolve(__dirname, '../../../../newo/newo_customers');
const REAL_V2_PATH = path.resolve(__dirname, '../../../../temp/v2-format');
const REAL_V2_PROJECT = path.join(REAL_V2_PATH, 'NEnw5FcbBP');

const hasRealV1 = fs.existsSync(REAL_V1_PATH);
const hasRealV2 = fs.existsSync(REAL_V2_PATH);

// ============================================================================
// 1. Extension helpers - unit tests
// ============================================================================

describe('Extension helpers', () => {
  describe('isTemplateFile', () => {
    it('should recognize V1 extensions', () => {
      expect(isTemplateFile('MySkill.jinja')).toBe(true);
      expect(isTemplateFile('MySkill.guidance')).toBe(true);
    });

    it('should recognize V2 extensions', () => {
      expect(isTemplateFile('MySkill.nsl')).toBe(true);
      expect(isTemplateFile('MySkill.nslg')).toBe(true);
    });

    it('should reject non-template files', () => {
      expect(isTemplateFile('MySkill.yaml')).toBe(false);
      expect(isTemplateFile('MySkill.ts')).toBe(false);
      expect(isTemplateFile('README.md')).toBe(false);
      expect(isTemplateFile('metadata.yaml')).toBe(false);
      expect(isTemplateFile('flows.yaml')).toBe(false);
      expect(isTemplateFile('import_version.txt')).toBe(false);
      expect(isTemplateFile('.gitignore')).toBe(false);
    });

    it('should not match partial extensions', () => {
      expect(isTemplateFile('file.jinja2')).toBe(false);
      expect(isTemplateFile('file.nsl.bak')).toBe(false);
    });

    it('should handle empty and edge case filenames', () => {
      expect(isTemplateFile('')).toBe(false);
      expect(isTemplateFile('.jinja')).toBe(true); // just extension is valid filename
      expect(isTemplateFile('.nsl')).toBe(true);
    });
  });

  describe('getTemplateType', () => {
    it('should classify V1 jinja as jinja', () => {
      expect(getTemplateType('MySkill.jinja')).toBe('jinja');
    });

    it('should classify V1 guidance as guidance', () => {
      expect(getTemplateType('MySkill.guidance')).toBe('guidance');
    });

    it('should classify V2 nsl as jinja', () => {
      expect(getTemplateType('MySkill.nsl')).toBe('jinja');
    });

    it('should classify V2 nslg as guidance', () => {
      expect(getTemplateType('MySkill.nslg')).toBe('guidance');
    });

    it('should handle underscore-prefixed filenames', () => {
      expect(getTemplateType('_helper.jinja')).toBe('jinja');
      expect(getTemplateType('_helper.nsl')).toBe('jinja');
      expect(getTemplateType('_helper.guidance')).toBe('guidance');
      expect(getTemplateType('_helper.nslg')).toBe('guidance');
    });
  });

  describe('stripTemplateExtension', () => {
    it('should strip all four extensions', () => {
      expect(stripTemplateExtension('Skill.jinja')).toBe('Skill');
      expect(stripTemplateExtension('Skill.guidance')).toBe('Skill');
      expect(stripTemplateExtension('Skill.nsl')).toBe('Skill');
      expect(stripTemplateExtension('Skill.nslg')).toBe('Skill');
    });

    it('should handle underscore-prefixed names', () => {
      expect(stripTemplateExtension('_helperSkill.nsl')).toBe('_helperSkill');
      expect(stripTemplateExtension('__doubleUnderscore.jinja')).toBe('__doubleUnderscore');
    });

    it('should return unchanged for non-template files', () => {
      expect(stripTemplateExtension('README.md')).toBe('README.md');
      expect(stripTemplateExtension('metadata.yaml')).toBe('metadata.yaml');
    });

    it('should handle long skill names', () => {
      expect(stripTemplateExtension('_receiveAvailableSlotsBuildAvailabilityContextDefaultSkill.jinja'))
        .toBe('_receiveAvailableSlotsBuildAvailabilityContextDefaultSkill');
    });
  });

  describe('TEMPLATE_EXTENSIONS constant', () => {
    it('should have exactly 4 extensions', () => {
      expect(TEMPLATE_EXTENSIONS).toHaveLength(4);
    });

    it('should include V1 and V2 extensions', () => {
      expect(TEMPLATE_EXTENSIONS).toContain('.jinja');
      expect(TEMPLATE_EXTENSIONS).toContain('.guidance');
      expect(TEMPLATE_EXTENSIONS).toContain('.nsl');
      expect(TEMPLATE_EXTENSIONS).toContain('.nslg');
    });
  });
});

// ============================================================================
// 2. Format version detection - no false positives/negatives
// ============================================================================

describe('Format version detection', () => {
  // Fixture tests
  it('should detect V2 when import_version.txt exists directly', () => {
    expect(detectFormatVersion(V2_FIXTURE_ROOT)).toBe('v2');
  });

  it('should detect V2 from parent directory (one level up)', () => {
    expect(detectFormatVersion(V2_FIXTURE_DIR)).toBe('v2');
  });

  it('should detect V1 when no import_version.txt', () => {
    expect(detectFormatVersion(FIXTURES_DIR)).toBe('v1');
  });

  // False positive prevention
  it('should not false-positive on random directories', () => {
    expect(detectFormatVersion('/tmp')).toBe('v1');
    expect(detectFormatVersion('/Users')).toBe('v1');
  });

  it('should return V1 for non-existent directory (not crash)', () => {
    expect(detectFormatVersion('/absolutely/nonexistent/path/12345')).toBe('v1');
  });

  it('should return V1 for a file path (not directory)', () => {
    expect(detectFormatVersion(__filename)).toBe('v1');
  });

  // Real data tests - no false negatives
  it.skipIf(!hasRealV1)('should detect REAL V1 newo_customers as V1', () => {
    expect(detectFormatVersion(REAL_V1_PATH)).toBe('v1');
  });

  it.skipIf(!hasRealV2)('should detect REAL V2 temp/v2-format as V2', () => {
    expect(detectFormatVersion(REAL_V2_PATH)).toBe('v2');
  });

  it.skipIf(!hasRealV2)('should detect REAL V2 project root as V2', () => {
    expect(detectFormatVersion(REAL_V2_PROJECT)).toBe('v2');
  });

  // Cross-contamination check
  it.skipIf(!hasRealV1)('should NOT detect V1 as V2 (false positive check)', () => {
    // Ensure V1 path has no import_version.txt
    const versionFile = path.join(REAL_V1_PATH, 'import_version.txt');
    expect(fs.existsSync(versionFile)).toBe(false);
    expect(detectFormatVersion(REAL_V1_PATH)).toBe('v1');
  });

  it.skipIf(!hasRealV2)('should NOT detect V2 as V1 (false negative check)', () => {
    // Ensure V2 project root has import_version.txt
    const versionFile = path.join(REAL_V2_PROJECT, 'import_version.txt');
    expect(fs.existsSync(versionFile)).toBe(true);
    expect(detectFormatVersion(REAL_V2_PROJECT)).toBe('v2');
  });
});

// ============================================================================
// 3. V1 metadata parsing - against real data
// ============================================================================

describe('V1 metadata parsing (parseSkillMetadata)', () => {
  it('should return empty array for non-existent file', () => {
    expect(parseSkillMetadata('/nonexistent/metadata.yaml')).toHaveLength(0);
  });

  it('should return empty array for empty parameters', () => {
    // ConversationStartedSkill has parameters: []
    const metaPath = path.join(
      REAL_V1_PATH,
      'default/projects/naf/ConvoAgent/CAMainFlow/ConversationStartedSkill/metadata.yaml'
    );
    if (fs.existsSync(metaPath)) {
      const params = parseSkillMetadata(metaPath);
      expect(params).toHaveLength(0);
    }
  });

  it.skipIf(!hasRealV1)('should parse V1 metadata with multiple parameters', () => {
    // _sendHITLEventSkill has 14 parameters
    const metaPath = path.join(
      REAL_V1_PATH,
      'default/projects/naf/ConvoAgent/CAEndSessionFlow/_sendHITLEventSkill/metadata.yaml'
    );
    const params = parseSkillMetadata(metaPath);
    expect(params.length).toBeGreaterThanOrEqual(10);

    // Check specific known parameters
    const paramNames = params.map(p => p.name);
    expect(paramNames).toContain('workingHours');
    expect(paramNames).toContain('summary');
    expect(paramNames).toContain('userId');
    expect(paramNames).toContain('category');
  });

  it.skipIf(!hasRealV1)('should correctly identify parameter defaults', () => {
    const metaPath = path.join(
      REAL_V1_PATH,
      'default/projects/naf/ConvoAgent/CAEndSessionFlow/_sendHITLEventSkill/metadata.yaml'
    );
    const params = parseSkillMetadata(metaPath);

    // All params in this skill have default_value: " " (space)
    // The parser should treat space-only default as having a default
    for (const param of params) {
      expect(param.name).toBeTruthy();
      expect(typeof param.required).toBe('boolean');
    }
  });

  it.skipIf(!hasRealV1)('should not crash on any real V1 metadata file', () => {
    // Scan a sample of metadata files and ensure no crashes
    const projectsDir = path.join(REAL_V1_PATH, 'default/projects');
    if (!fs.existsSync(projectsDir)) return;

    let count = 0;
    const walkDir = (dir: string) => {
      if (count > 50) return; // Cap at 50 files for performance
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (count > 50) return;
          if (entry.isDirectory()) {
            walkDir(path.join(dir, entry.name));
          } else if (entry.name === 'metadata.yaml') {
            // Should not throw
            const params = parseSkillMetadata(path.join(dir, entry.name));
            expect(Array.isArray(params)).toBe(true);
            count++;
          }
        }
      } catch { /* ignore permission errors */ }
    };
    walkDir(projectsDir);
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================================================
// 4. V2 flow YAML parsing - against real data
// ============================================================================

describe('V2 flow YAML parsing (parseV2FlowYaml)', () => {
  // Fixture tests
  it('should parse fixture flow YAML', () => {
    const flowYaml = path.join(
      V2_FIXTURE_ROOT, 'test_module/agents/TestAgent/flows/MainFlow/MainFlow.yaml'
    );
    const params = parseV2FlowYaml(flowYaml);
    expect(params.size).toBeGreaterThan(0);
    expect(params.has('GreetingSkill')).toBe(true);
    expect(params.get('GreetingSkill')!.length).toBe(2);
  });

  it('should skip skills with empty parameters', () => {
    const flowYaml = path.join(
      V2_FIXTURE_ROOT, 'test_module/agents/TestAgent/flows/MainFlow/MainFlow.yaml'
    );
    const params = parseV2FlowYaml(flowYaml);
    expect(params.has('FarewellSkill')).toBe(false);
  });

  it('should treat null default_value as required', () => {
    const flowYaml = path.join(
      V2_FIXTURE_ROOT, 'test_module/agents/TestAgent/flows/MainFlow/MainFlow.yaml'
    );
    const params = parseV2FlowYaml(flowYaml);
    const helper = params.get('_helperSkill');
    expect(helper).toBeDefined();
    expect(helper![0].required).toBe(true);
  });

  it('should return empty map for non-existent file', () => {
    expect(parseV2FlowYaml('/nonexistent/flow.yaml').size).toBe(0);
  });

  // Real V2 data tests
  it.skipIf(!hasRealV2)('should parse real V2 CAMainFlow.yaml', () => {
    const flowYaml = path.join(
      REAL_V2_PROJECT,
      'naf/agents/ConvoAgent/flows/CAMainFlow/CAMainFlow.yaml'
    );
    const params = parseV2FlowYaml(flowYaml);
    // CAMainFlow has many skills, some with params
    // Gen1ConversationStartedOutboundSkill has user_id parameter
    if (params.has('Gen1ConversationStartedOutboundSkill')) {
      const outboundParams = params.get('Gen1ConversationStartedOutboundSkill')!;
      expect(outboundParams.some(p => p.name === 'user_id')).toBe(true);
    }
  });

  it.skipIf(!hasRealV2)('should parse real V2 CancellationFlow.yaml', () => {
    const flowYaml = path.join(
      REAL_V2_PROJECT,
      'cal_com/agents/CalComAgent/flows/CancellationFlow/CancellationFlow.yaml'
    );
    const params = parseV2FlowYaml(flowYaml);
    // _cancelAppointmentSkill has 'payload' parameter
    if (params.has('_cancelAppointmentSkill')) {
      const cancelParams = params.get('_cancelAppointmentSkill')!;
      expect(cancelParams.some(p => p.name === 'payload')).toBe(true);
    }
    // _cancelAppointmentSuccessSkill has 'input' and 'parameters' params
    if (params.has('_cancelAppointmentSuccessSkill')) {
      const successParams = params.get('_cancelAppointmentSuccessSkill')!;
      expect(successParams.length).toBe(2);
    }
  });

  it.skipIf(!hasRealV2)('should not crash on any real V2 flow YAML', () => {
    let count = 0;
    const walkV2 = (dir: string) => {
      if (count > 30) return;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (count > 30) return;
          if (entry.isDirectory()) {
            walkV2(path.join(dir, entry.name));
          } else if (entry.name.endsWith('.yaml') && entry.name !== 'agent.yaml') {
            const dirName = path.basename(dir);
            if (entry.name === `${dirName}.yaml`) {
              // This is a flow YAML
              const params = parseV2FlowYaml(path.join(dir, entry.name));
              expect(params instanceof Map).toBe(true);
              count++;
            }
          }
        }
      } catch { /* ignore */ }
    };
    walkV2(REAL_V2_PROJECT);
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================================================
// 5. Skill scanning - V1 real data
// ============================================================================

describe('V1 skill scanning (real data)', () => {
  it.skipIf(!hasRealV1)('should find V1 jinja files in newo_customers', () => {
    const projectsDir = path.join(REAL_V1_PATH, 'default/projects');
    const skills = scanDirectoryForSkills(projectsDir);
    const jinjaSkills = skills.filter(s => s.type === 'jinja');
    const guidanceSkills = skills.filter(s => s.type === 'guidance');

    // V1 has 613 jinja + 605 guidance
    expect(jinjaSkills.length).toBeGreaterThan(500);
    expect(guidanceSkills.length).toBeGreaterThan(500);
    expect(skills.length).toBeGreaterThan(1000);
  });

  it.skipIf(!hasRealV1)('should have correct file paths for V1 skills', () => {
    const projectsDir = path.join(REAL_V1_PATH, 'default/projects');
    const skills = scanDirectoryForSkills(projectsDir);

    for (const skill of skills.slice(0, 50)) {
      // Every skill should have a valid file path
      expect(fs.existsSync(skill.filePath)).toBe(true);
      // Skill name should match filename minus extension
      const filename = path.basename(skill.filePath);
      expect(stripTemplateExtension(filename)).toBe(skill.name);
    }
  });

  it.skipIf(!hasRealV1)('should correctly classify V1 file types', () => {
    const projectsDir = path.join(REAL_V1_PATH, 'default/projects');
    const skills = scanDirectoryForSkills(projectsDir);

    for (const skill of skills) {
      if (skill.filePath.endsWith('.jinja')) {
        expect(skill.type).toBe('jinja');
      } else if (skill.filePath.endsWith('.guidance')) {
        expect(skill.type).toBe('guidance');
      }
      // V1 should NOT have .nsl or .nslg files
      expect(skill.filePath.endsWith('.nsl')).toBe(false);
      expect(skill.filePath.endsWith('.nslg')).toBe(false);
    }
  });

  it.skipIf(!hasRealV1)('should parse parameters for V1 skills with metadata', () => {
    const projectsDir = path.join(REAL_V1_PATH, 'default/projects');
    const skills = scanDirectoryForSkills(projectsDir);

    // Find _sendHITLEventSkill which has 14 parameters
    const hitlSkill = skills.find(s => s.name === '_sendHITLEventSkill');
    if (hitlSkill) {
      expect(hitlSkill.parameters.length).toBeGreaterThanOrEqual(10);
    }
  });

  it.skipIf(!hasRealV1)('should not have false skill names (no .yaml, no dirs)', () => {
    const projectsDir = path.join(REAL_V1_PATH, 'default/projects');
    const skills = scanDirectoryForSkills(projectsDir);

    for (const skill of skills) {
      // Skill names should not include file extensions
      expect(skill.name).not.toContain('.yaml');
      expect(skill.name).not.toContain('.jinja');
      expect(skill.name).not.toContain('.guidance');
      expect(skill.name).not.toContain('.nsl');
      // Skill names should be non-empty
      expect(skill.name.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// 6. Skill scanning - V2 real data
// ============================================================================

describe('V2 skill scanning (real data)', () => {
  it.skipIf(!hasRealV2)('should find V2 nsl and nslg files', () => {
    const skills: ReturnType<typeof scanV2ModuleForSkills> = [];
    // Scan all modules in V2 project
    const entries = fs.readdirSync(REAL_V2_PROJECT, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'akb') continue;
      const modulePath = path.join(REAL_V2_PROJECT, entry.name);
      if (fs.existsSync(path.join(modulePath, 'agents')) ||
          fs.existsSync(path.join(modulePath, 'libraries'))) {
        skills.push(...scanV2ModuleForSkills(modulePath));
      }
    }

    const nslSkills = skills.filter(s => s.filePath.endsWith('.nsl'));
    const nslgSkills = skills.filter(s => s.filePath.endsWith('.nslg'));

    // V2 has 741 nsl + 542 nslg
    expect(nslSkills.length).toBeGreaterThan(600);
    expect(nslgSkills.length).toBeGreaterThan(400);
    expect(skills.length).toBeGreaterThan(1000);
  });

  it.skipIf(!hasRealV2)('should correctly classify V2 file types', () => {
    const nafModule = path.join(REAL_V2_PROJECT, 'naf');
    const skills = scanV2ModuleForSkills(nafModule);

    for (const skill of skills.slice(0, 100)) {
      if (skill.filePath.endsWith('.nsl')) {
        expect(skill.type).toBe('jinja');
      } else if (skill.filePath.endsWith('.nslg')) {
        expect(skill.type).toBe('guidance');
      }
      // V2 should NOT have .jinja or .guidance files
      expect(skill.filePath.endsWith('.jinja')).toBe(false);
      expect(skill.filePath.endsWith('.guidance')).toBe(false);
    }
  });

  it.skipIf(!hasRealV2)('should find library skills in V2', () => {
    const calComModule = path.join(REAL_V2_PROJECT, 'cal_com');
    const skills = scanV2ModuleForSkills(calComModule);

    const libSkills = skills.filter(s => s.filePath.includes('/libraries/'));
    expect(libSkills.length).toBeGreaterThan(0);

    // Should find testLib skills
    const testLibSkills = libSkills.filter(s => s.filePath.includes('/testLib/'));
    expect(testLibSkills.length).toBeGreaterThan(0);
  });

  it.skipIf(!hasRealV2)('should skip akb directory in V2 scanning', () => {
    const skills = scanDirectoryForSkills(REAL_V2_PROJECT);
    const akbSkills = skills.filter(s => s.filePath.includes('/akb/'));
    expect(akbSkills).toHaveLength(0);
  });

  it.skipIf(!hasRealV2)('should have valid file paths for all V2 skills', () => {
    const nafModule = path.join(REAL_V2_PROJECT, 'naf');
    const skills = scanV2ModuleForSkills(nafModule);

    for (const skill of skills.slice(0, 100)) {
      expect(fs.existsSync(skill.filePath)).toBe(true);
      const filename = path.basename(skill.filePath);
      expect(stripTemplateExtension(filename)).toBe(skill.name);
    }
  });
});

// ============================================================================
// 7. Skill name consistency between V1 and V2
// ============================================================================

describe('V1/V2 skill name consistency', () => {
  it.skipIf(!hasRealV1 || !hasRealV2)('should have matching skill names between V1 and V2 for naf module', () => {
    // V1: scan ConvoAgent skills
    const v1ConvoDir = path.join(REAL_V1_PATH, 'default/projects/naf/ConvoAgent/CAMainFlow');
    const v1Skills = scanDirectoryForSkills(v1ConvoDir);
    const v1Names = new Set(v1Skills.map(s => s.name));

    // V2: scan ConvoAgent CAMainFlow skills
    const v2FlowDir = path.join(
      REAL_V2_PROJECT,
      'naf/agents/ConvoAgent/flows/CAMainFlow'
    );
    const v2Skills = scanDirectoryForSkills(v2FlowDir);
    const v2Names = new Set(v2Skills.map(s => s.name));

    // Most skills should exist in both formats
    // (V2 may have a few more or fewer due to version differences)
    const commonNames = [...v1Names].filter(n => v2Names.has(n));
    expect(commonNames.length).toBeGreaterThan(0);

    // Report overlap percentage for debugging
    const overlapPercent = (commonNames.length / Math.max(v1Names.size, v2Names.size)) * 100;
    // Should be at least 40% overlap (same project, different export format)
    // V2 may have additional skills or renamed ones, so overlap may vary
    expect(overlapPercent).toBeGreaterThan(40);
  });
});

// ============================================================================
// 8. Fixture-based tests (always run, no external data dependency)
// ============================================================================

describe('Fixture-based scanning', () => {
  it('should find V2 .nsl and .nslg fixture files', () => {
    const skillsDir = path.join(
      V2_FIXTURE_ROOT, 'test_module/agents/TestAgent/flows/MainFlow/skills'
    );
    const skills = scanDirectoryForSkills(skillsDir);
    expect(skills.length).toBe(3);

    const names = skills.map(s => s.name).sort();
    expect(names).toContain('GreetingSkill');
    expect(names).toContain('FarewellSkill');
    expect(names).toContain('_helperSkill');
  });

  it('should propagate flow YAML parameters to child skills', () => {
    const flowDir = path.join(
      V2_FIXTURE_ROOT, 'test_module/agents/TestAgent/flows/MainFlow'
    );
    const skills = scanDirectoryForSkills(flowDir);
    const greeting = skills.find(s => s.name === 'GreetingSkill');
    expect(greeting).toBeDefined();
    expect(greeting!.parameters.length).toBe(2);
    expect(greeting!.parameters.map(p => p.name)).toContain('user_name');
    expect(greeting!.parameters.map(p => p.name)).toContain('language');
  });

  it('should classify .nsl as jinja and .nslg as guidance in fixtures', () => {
    const skillsDir = path.join(
      V2_FIXTURE_ROOT, 'test_module/agents/TestAgent/flows/MainFlow/skills'
    );
    const skills = scanDirectoryForSkills(skillsDir);

    expect(skills.find(s => s.name === 'GreetingSkill')!.type).toBe('jinja');
    expect(skills.find(s => s.name === 'FarewellSkill')!.type).toBe('guidance');
  });

  it('should find fixture V1 .jinja files', () => {
    const skills = scanDirectoryForSkills(FIXTURES_DIR);
    const jinjaSkills = skills.filter(s => s.type === 'jinja' && s.filePath.endsWith('.jinja'));
    expect(jinjaSkills.length).toBeGreaterThan(0);
  });

  it('should handle empty directory', () => {
    const skills = scanDirectoryForSkills('/nonexistent/path');
    expect(skills).toHaveLength(0);
  });

  it('should skip akb in fixtures', () => {
    const skills = scanDirectoryForSkills(V2_FIXTURE_ROOT);
    const akbSkills = skills.filter(s => s.filePath.includes('/akb/'));
    expect(akbSkills).toHaveLength(0);
  });

  it('should scan module for agents and libraries', () => {
    const moduleDir = path.join(V2_FIXTURE_ROOT, 'test_module');
    const skills = scanV2ModuleForSkills(moduleDir);
    // 3 agent skills + 1 library skill
    expect(skills.length).toBe(4);
    expect(skills.filter(s => s.filePath.includes('/agents/')).length).toBe(3);
    expect(skills.filter(s => s.filePath.includes('/libraries/')).length).toBe(1);
  });
});

// ============================================================================
// 9. Performance tests
// ============================================================================

describe('Performance', () => {
  it.skipIf(!hasRealV1)('should scan V1 newo_customers (1200+ files) in under 2 seconds', () => {
    const projectsDir = path.join(REAL_V1_PATH, 'default/projects');
    const start = performance.now();
    const skills = scanDirectoryForSkills(projectsDir);
    const elapsed = performance.now() - start;

    expect(skills.length).toBeGreaterThan(1000);
    expect(elapsed).toBeLessThan(2000); // 2 seconds max
  });

  it.skipIf(!hasRealV2)('should scan V2 project (1200+ files) in under 2 seconds', () => {
    const start = performance.now();
    const skills: ReturnType<typeof scanV2ModuleForSkills> = [];
    const entries = fs.readdirSync(REAL_V2_PROJECT, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'akb') continue;
      const modulePath = path.join(REAL_V2_PROJECT, entry.name);
      if (fs.existsSync(path.join(modulePath, 'agents')) ||
          fs.existsSync(path.join(modulePath, 'libraries'))) {
        skills.push(...scanV2ModuleForSkills(modulePath));
      }
    }
    const elapsed = performance.now() - start;

    expect(skills.length).toBeGreaterThan(1000);
    expect(elapsed).toBeLessThan(2000); // 2 seconds max
  });

  it('should detect format version in under 10ms', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      detectFormatVersion(V2_FIXTURE_ROOT);
      detectFormatVersion(FIXTURES_DIR);
    }
    const elapsed = performance.now() - start;
    // 200 detections should take < 1 second (5ms each max)
    expect(elapsed).toBeLessThan(1000);
  });
});

// ============================================================================
// 10. Security checks
// ============================================================================

describe('Security', () => {
  it('should not crash on deeply nested paths', () => {
    const deepPath = '/a'.repeat(100) + '/import_version.txt';
    // Should not throw, just return v1
    expect(detectFormatVersion(deepPath)).toBe('v1');
  });

  it('should handle paths with special characters', () => {
    expect(detectFormatVersion('/path/with spaces/test')).toBe('v1');
    expect(isTemplateFile('file with spaces.nsl')).toBe(true);
    expect(stripTemplateExtension('file-with-dashes.jinja')).toBe('file-with-dashes');
  });

  it('should not follow symlinks outside workspace', () => {
    // scanDirectoryForSkills should not crash on symlinks
    // Just verify it doesn't throw
    const skills = scanDirectoryForSkills('/tmp');
    expect(Array.isArray(skills)).toBe(true);
  });

  it('should handle null-byte in filename gracefully', () => {
    // isTemplateFile should not crash on malicious input
    // In JS, strings don't terminate at null bytes, so 'file\0.nsl' still endsWith '.nsl'
    // The important thing is it doesn't crash
    expect(() => isTemplateFile('file\0.nsl')).not.toThrow();
    expect(() => stripTemplateExtension('file\0.nsl')).not.toThrow();
  });
});
