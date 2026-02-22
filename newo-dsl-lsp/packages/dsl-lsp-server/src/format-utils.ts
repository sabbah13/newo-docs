/**
 * Format detection and skill scanning utilities.
 *
 * Supports both V1 (CLI2: .jinja/.guidance) and V2 (modules: .nsl/.nslg) formats.
 */

import * as path from 'path';
import * as fs from 'fs';

// ============================================================================
// Types
// ============================================================================

export interface SkillParameter {
  name: string;
  defaultValue?: string;
  required: boolean;
}

export interface SkillInfo {
  name: string;
  filePath: string;
  metadataPath?: string;
  type: 'jinja' | 'guidance';
  parameters: SkillParameter[];
}

// ============================================================================
// Extension helpers
// ============================================================================

/** All recognized template file extensions (V1 + V2) */
export const TEMPLATE_EXTENSIONS = ['.jinja', '.guidance', '.nsl', '.nslg'];

/** Check if a filename is a recognized template file */
export function isTemplateFile(filename: string): boolean {
  return TEMPLATE_EXTENSIONS.some(ext => filename.endsWith(ext));
}

/** Determine template type from filename extension */
export function getTemplateType(filename: string): 'jinja' | 'guidance' {
  if (filename.endsWith('.guidance') || filename.endsWith('.nslg')) {
    return 'guidance';
  }
  return 'jinja';
}

/** Remove the template extension from a filename to get the skill name */
export function stripTemplateExtension(filename: string): string {
  for (const ext of TEMPLATE_EXTENSIONS) {
    if (filename.endsWith(ext)) {
      return filename.slice(0, -ext.length);
    }
  }
  return filename;
}

// ============================================================================
// Format version detection
// ============================================================================

/**
 * Detect project format version.
 * Returns 'v2' if import_version.txt exists, 'v1' otherwise.
 */
export function detectFormatVersion(dir: string): 'v1' | 'v2' {
  // V2: Look for import_version.txt in dir or immediate children
  if (fs.existsSync(path.join(dir, 'import_version.txt'))) {
    return 'v2';
  }
  // Check one level down (common for V2 exports: projectId/import_version.txt)
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (fs.existsSync(path.join(dir, entry.name, 'import_version.txt'))) {
          return 'v2';
        }
      }
    }
  } catch { /* ignore */ }
  return 'v1';
}

// ============================================================================
// V2 YAML parsing
// ============================================================================

/**
 * Parse V2 flow YAML to extract skill parameters.
 * V2 flow YAML contains inline skill definitions with parameters.
 */
export function parseV2FlowYaml(flowYamlPath: string): Map<string, SkillParameter[]> {
  const skillParams = new Map<string, SkillParameter[]>();

  try {
    const content = fs.readFileSync(flowYamlPath, 'utf-8');

    // Extract skills section - each skill has idn and parameters
    const skillMatches = content.matchAll(/^\s+-\s+(?:title:[^\n]*\n\s+)?idn:\s*(\w+)/gm);
    for (const match of skillMatches) {
      const skillIdn = match[1];
      // Find the parameters section for this skill
      const skillStart = match.index!;
      const nextSkillOrEnd = content.indexOf('\n  - ', skillStart + 1);
      const skillSection = nextSkillOrEnd > -1
        ? content.substring(skillStart, nextSkillOrEnd)
        : content.substring(skillStart);

      const params: SkillParameter[] = [];
      const paramMatches = skillSection.matchAll(/^\s+-\s+name:\s*(\w+)/gm);
      for (const pm of paramMatches) {
        const paramName = pm[1];
        // Check for default_value in the same parameter block
        const pmStart = pm.index!;
        const nextParam = skillSection.indexOf('\n      - ', pmStart + 1);
        const paramBlock = nextParam > -1
          ? skillSection.substring(pmStart, nextParam)
          : skillSection.substring(pmStart);
        const defaultMatch = paramBlock.match(/default_value:\s*["']?([^"'\n]*)["']?/);
        // A parameter with default_value is optional, even if empty string or whitespace.
        // Only default_value: null means "no default" (truly required).
        const hasDefault = !!defaultMatch && defaultMatch[1].trim() !== 'null';

        params.push({
          name: paramName,
          defaultValue: hasDefault ? defaultMatch![1].trim() : undefined,
          required: !hasDefault
        });
      }

      if (params.length > 0) {
        skillParams.set(skillIdn, params);
      }
    }
  } catch { /* ignore */ }

  return skillParams;
}

// ============================================================================
// V1 metadata parsing
// ============================================================================

/**
 * Parse metadata.yaml to extract skill parameters (V1 format)
 */
export function parseSkillMetadata(metadataPath: string): SkillParameter[] {
  const params: SkillParameter[] = [];

  try {
    if (!fs.existsSync(metadataPath)) return params;

    const content = fs.readFileSync(metadataPath, 'utf-8');

    // Check for empty parameters: [] first
    if (content.match(/parameters:\s*\[\]/)) {
      return params;
    }

    // Extract all parameter names from the file
    const nameMatches = content.matchAll(/^\s+name:\s*(\w+)/gm);
    for (const match of nameMatches) {
      const paramName = match[1];
      const paramSectionMatch = content.match(/parameters:/);
      if (paramSectionMatch) {
        const paramSection = content.substring(paramSectionMatch.index!);
        if (paramSection.includes(`name: ${paramName}`)) {
          const defaultMatch = paramSection.match(new RegExp(`name:\\s*${paramName}[\\s\\S]*?default_value:\\s*["']?([^"'\\n]*)["']?`));
          // Any parameter with a default_value key is optional
          const hasDefault = !!defaultMatch;
          params.push({
            name: paramName,
            defaultValue: hasDefault ? defaultMatch[1].trim() : undefined,
            required: !hasDefault
          });
        }
      }
    }
  } catch (err) {
    // Ignore parsing errors
  }

  return params;
}

// ============================================================================
// Skill scanning
// ============================================================================

/**
 * Recursively scan directory for template files (.jinja, .guidance, .nsl, .nslg).
 * Supports both V1 and V2 directory structures.
 * For V2, also loads parameters from flow YAML files.
 */
export function scanDirectoryForSkills(dir: string, v2FlowParams?: Map<string, SkillParameter[]>): SkillInfo[] {
  const skills: SkillInfo[] = [];

  try {
    if (!fs.existsSync(dir)) return skills;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // V2 detection: if this looks like a flow directory (has a .yaml file matching dir name),
    // parse the flow YAML for skill parameters
    let flowParams = v2FlowParams;
    const dirName = path.basename(dir);
    const flowYaml = path.join(dir, `${dirName}.yaml`);
    if (!flowParams && fs.existsSync(flowYaml)) {
      flowParams = parseV2FlowYaml(flowYaml);
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, hidden directories, and akb directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'akb') {
          skills.push(...scanDirectoryForSkills(fullPath, flowParams));
        }
      } else if (entry.isFile()) {
        // Check for template files (V1: .jinja/.guidance, V2: .nsl/.nslg)
        if (isTemplateFile(entry.name)) {
          const skillName = stripTemplateExtension(entry.name);
          const type = getTemplateType(entry.name);

          // Try to get parameters from multiple sources:
          // 1. V2 flow YAML (inline skill definitions)
          // 2. V1b metadata.yaml in same directory (newo_customers format)
          // 3. V1b metadata.yaml in skill subdirectory (newo_customers format)
          let parameters: SkillParameter[] = [];

          if (flowParams?.has(skillName)) {
            parameters = flowParams.get(skillName)!;
          } else {
            // V1b: metadata.yaml in same dir or skill subdir
            const metadataPath = path.join(path.dirname(fullPath), 'metadata.yaml');
            const skillSubdirMeta = path.join(path.dirname(fullPath), skillName, 'metadata.yaml');

            if (fs.existsSync(metadataPath)) {
              parameters = parseSkillMetadata(metadataPath);
            } else if (fs.existsSync(skillSubdirMeta)) {
              parameters = parseSkillMetadata(skillSubdirMeta);
            }
          }

          skills.push({
            name: skillName,
            filePath: fullPath,
            metadataPath: undefined,
            type,
            parameters
          });
        }
      }
    }
  } catch (err) {
    // Ignore permission errors and continue
  }

  return skills;
}

/**
 * Scan a V2 module directory for skills.
 * V2 structure: module/agents/AgentName/flows/FlowName/skills/Skill.nsl
 * Also scans: module/libraries/LibName/skills/Skill.nsl
 */
export function scanV2ModuleForSkills(moduleDir: string): SkillInfo[] {
  const skills: SkillInfo[] = [];

  // Scan agents directory
  const agentsDir = path.join(moduleDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    skills.push(...scanDirectoryForSkills(agentsDir));
  }

  // Scan libraries directory (V2 shared skill libraries)
  const librariesDir = path.join(moduleDir, 'libraries');
  if (fs.existsSync(librariesDir)) {
    skills.push(...scanDirectoryForSkills(librariesDir));
  }

  return skills;
}

// ============================================================================
// Attribute discovery
// ============================================================================

/**
 * Attribute catalog - maps function category to discovered field/name values.
 * Categories: 'customer', 'project', 'persona', 'state'
 */
export type AttributeCatalog = Map<string, Set<string>>;

// Patterns to match attribute field/name values in template files
const ATTRIBUTE_PATTERNS: Array<{ category: string; pattern: RegExp }> = [
  { category: 'customer', pattern: /(?:Get|Set)CustomerAttribute\s*\([^)]*field\s*=\s*["']([^"']+)["']/g },
  { category: 'customer', pattern: /(?:Get|Set)CustomerMetadataAttribute\s*\([^)]*field\s*=\s*["']([^"']+)["']/g },
  { category: 'project', pattern: /(?:Get|Set)ProjectAttribute\s*\([^)]*field\s*=\s*["']([^"']+)["']/g },
  { category: 'project', pattern: /(?:Get|Set)ProjectMetadataAttribute\s*\([^)]*field\s*=\s*["']([^"']+)["']/g },
  { category: 'persona', pattern: /(?:Get|Set)PersonaAttribute\s*\([^)]*field\s*=\s*["']([^"']+)["']/g },
  { category: 'state', pattern: /(?:Get|Set)State\s*\([^)]*name\s*=\s*["']([^"']+)["']/g },
];

/**
 * Scan a single file's content for attribute field/name values.
 */
function scanContentForAttributes(content: string, catalog: AttributeCatalog): void {
  for (const { category, pattern } of ATTRIBUTE_PATTERNS) {
    // Reset lastIndex since we reuse patterns across calls
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const value = match[1];
      if (!catalog.has(category)) {
        catalog.set(category, new Set());
      }
      catalog.get(category)!.add(value);
    }
  }
}

/**
 * Scan project template files for attribute field/name values.
 * Recursively scans the directory for template files and extracts
 * string literals used as field/name arguments.
 */
export function scanDirectoryForAttributes(dir: string): AttributeCatalog {
  const catalog: AttributeCatalog = new Map();

  function recurse(directory: string): void {
    try {
      if (!fs.existsSync(directory)) return;
      const entries = fs.readdirSync(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'akb') {
            recurse(fullPath);
          }
        } else if (entry.isFile() && isTemplateFile(entry.name)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            scanContentForAttributes(content, catalog);
          } catch { /* ignore */ }
        }
      }
    } catch { /* ignore */ }
  }

  recurse(dir);
  return catalog;
}
