/**
 * Newo DSL Analyzer
 *
 * Core analysis library for Newo DSL templates (.jinja, .guidance)
 * Used by the CLI linter and LSP server.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

import { JinjaParser } from './parsers/jinja-parser';
import { levenshteinDistance, findSimilar } from '@newo-dsl/data';
import {
  Diagnostic,
  ParseResult,
  SchemaRegistry,
  SkillSchema,
  BuiltinSchema,
  AttributeSchema,
  CompletionItem,
  HoverInfo,
  DefinitionLocation,
  FunctionCall
} from './types';

export * from './types';
export { JinjaParser } from './parsers/jinja-parser';
export { adaptForLint } from './adapters/template-lint-adapter';
export type { LintParseResult } from './adapters/template-lint-adapter';

/**
 * Main analyzer class that provides all analysis capabilities
 */
export class NewoDslAnalyzer {
  private schemas: SchemaRegistry = {
    skills: new Map(),
    builtins: new Map(),
    attributes: new Set(),
    events: new Set()
  };

  private jinjaParser = new JinjaParser();
  private schemasDir: string;

  constructor(schemasDir?: string) {
    this.schemasDir = schemasDir || '';
  }

  /**
   * Load schemas from directory
   */
  loadSchemas(schemasDir?: string): void {
    const dir = schemasDir || this.schemasDir;
    if (!dir) return;

    this.schemasDir = dir;

    // Load skills schema
    const skillsPath = path.join(dir, 'skills.schema.yaml');
    if (fs.existsSync(skillsPath)) {
      const content = fs.readFileSync(skillsPath, 'utf8');
      const data = yaml.load(content) as any;
      if (data?.skills) {
        for (const skill of data.skills) {
          this.schemas.skills.set(skill.idn, skill);
        }
      }
    }

    // Load builtins schema
    const builtinsPath = path.join(dir, 'builtins.schema.yaml');
    if (fs.existsSync(builtinsPath)) {
      const content = fs.readFileSync(builtinsPath, 'utf8');
      const data = yaml.load(content) as any;
      if (data?.functions) {
        for (const func of data.functions) {
          this.schemas.builtins.set(func.name, func);
        }
      }
    }

    // Load attributes schema
    const attributesPath = path.join(dir, 'attributes.schema.yaml');
    if (fs.existsSync(attributesPath)) {
      const content = fs.readFileSync(attributesPath, 'utf8');
      const data = yaml.load(content) as any;
      if (data?.attributes) {
        for (const attr of data.attributes) {
          this.schemas.attributes.add(attr.name);
        }
      }
    }

    // Load events schema
    const eventsPath = path.join(dir, 'events.schema.yaml');
    if (fs.existsSync(eventsPath)) {
      const content = fs.readFileSync(eventsPath, 'utf8');
      const data = yaml.load(content) as any;
      if (data?.events) {
        for (const event of data.events) {
          this.schemas.events.add(event.idn);
        }
      }
    }
  }

  /**
   * Get schema statistics
   */
  getSchemaStats(): { skills: number; builtins: number; attributes: number; events: number } {
    return {
      skills: this.schemas.skills.size,
      builtins: this.schemas.builtins.size,
      attributes: this.schemas.attributes.size,
      events: this.schemas.events.size
    };
  }

  /**
   * Parse a template file
   */
  parseTemplate(content: string, filePath: string): ParseResult {
    const ext = path.extname(filePath);

    if (ext === '.jinja') {
      return this.jinjaParser.parse(content, filePath);
    } else if (ext === '.guidance') {
      // For now, use Jinja parser for guidance too (similar syntax)
      const result = this.jinjaParser.parse(content, filePath);
      result.languageId = 'newo-guidance';
      return result;
    }

    // Default to Jinja
    return this.jinjaParser.parse(content, filePath);
  }

  /**
   * Get diagnostics for a template
   */
  getDiagnostics(content: string, filePath: string): Diagnostic[] {
    const parseResult = this.parseTemplate(content, filePath);
    const diagnostics = [...parseResult.diagnostics];

    // Validate skill calls
    for (const skillCall of parseResult.skillCalls) {
      const skillDiags = this.validateSkillCall(skillCall);
      diagnostics.push(...skillDiags);
    }

    // Validate builtin calls
    for (const builtinCall of parseResult.builtinCalls) {
      const builtinDiags = this.validateBuiltinCall(builtinCall);
      diagnostics.push(...builtinDiags);
    }

    // Validate unknown calls
    for (const call of parseResult.functionCalls) {
      if (call.type === 'unknown') {
        const unknownDiags = this.validateUnknownCall(call);
        diagnostics.push(...unknownDiags);
      }
    }

    return diagnostics;
  }

  /**
   * Validate a skill call
   */
  private validateSkillCall(call: FunctionCall): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const skillInfo = this.schemas.skills.get(call.name);

    if (!skillInfo) {
      const suggestions = findSimilar(call.name, Array.from(this.schemas.skills.keys()));
      let message = `Unknown skill: ${call.name}`;
      if (suggestions.length > 0) {
        message += `. Did you mean: ${suggestions.slice(0, 3).join(', ')}?`;
      }

      diagnostics.push({
        severity: 'error',
        code: 'E100',
        message,
        range: call.range,
        source: 'newo-lint'
      });
      return diagnostics;
    }

    // Validate parameters
    const paramDiags = this.validateParameters(call, skillInfo.parameters);
    diagnostics.push(...paramDiags);

    return diagnostics;
  }

  /**
   * Validate a builtin call
   */
  private validateBuiltinCall(call: FunctionCall): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const funcInfo = this.schemas.builtins.get(call.name);

    if (!funcInfo) {
      // Built-in not in schema - might be valid but not documented
      return diagnostics;
    }

    // Validate parameters
    const paramDiags = this.validateParameters(call, funcInfo.parameters);
    diagnostics.push(...paramDiags);

    return diagnostics;
  }

  /**
   * Validate unknown function calls
   */
  private validateUnknownCall(call: FunctionCall): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // Check if it might be a skill or builtin
    if (this.schemas.skills.has(call.name) || this.schemas.builtins.has(call.name)) {
      return diagnostics;
    }

    // Skip common patterns
    const commonPatterns = ['utils_', 'get_', 'set_', 'check_', 'validate_', 'json', 'range'];
    const isLikelyValid = commonPatterns.some(p => call.name.toLowerCase().startsWith(p));

    if (!isLikelyValid && call.name.length > 2) {
      const allSuggestions = [
        ...findSimilar(call.name, Array.from(this.schemas.builtins.keys())),
        ...findSimilar(call.name, Array.from(this.schemas.skills.keys()))
      ];

      let message = `Unknown function: ${call.name}`;
      if (allSuggestions.length > 0) {
        message += `. Did you mean: ${allSuggestions.slice(0, 3).join(', ')}?`;
      }

      diagnostics.push({
        severity: 'warning',
        code: 'W101',
        message,
        range: call.range,
        source: 'newo-lint'
      });
    }

    return diagnostics;
  }

  /**
   * Validate function parameters
   */
  private validateParameters(call: FunctionCall, expectedParams: any[]): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // Build expected parameter map
    const expectedMap = new Map<string, any>();
    for (const param of expectedParams || []) {
      expectedMap.set(param.name, param);
    }

    // Check for unknown parameters
    for (const provided of call.parameters) {
      if (provided.type === 'keyword' && provided.name) {
        if (!expectedMap.has(provided.name)) {
          const similar = findSimilar(provided.name, Array.from(expectedMap.keys()));
          let message = `Unknown parameter '${provided.name}' for ${call.name}`;
          if (similar.length > 0) {
            message += `. Did you mean: ${similar.join(', ')}?`;
          }

          diagnostics.push({
            severity: 'warning',
            code: 'W102',
            message,
            range: call.range,
            source: 'newo-lint'
          });
        }
      }
    }

    return diagnostics;
  }

  /**
   * Get completions at position
   */
  getCompletions(content: string, filePath: string, line: number, column: number): CompletionItem[] {
    const completions: CompletionItem[] = [];

    // Get the line content and context
    const lines = content.split('\n');
    const lineContent = lines[line - 1] || '';
    const beforeCursor = lineContent.substring(0, column - 1);

    // Check if we're in an expression {{ }}
    const inExpression = this.isInExpression(beforeCursor);

    // Check if completing a function name
    if (inExpression) {
      // Add builtin completions
      for (const [name, info] of this.schemas.builtins) {
        completions.push({
          label: name,
          kind: 'builtin',
          detail: info.category,
          documentation: info.description,
          insertText: `${name}($1)`,
          sortText: `0${name}`
        });
      }

      // Add skill completions
      for (const [name, info] of this.schemas.skills) {
        completions.push({
          label: name,
          kind: 'skill',
          detail: `Skill (${info.runner_type})`,
          insertText: `${name}($1)`,
          sortText: `1${name}`
        });
      }
    }

    // Check if completing an attribute name
    const attrMatch = beforeCursor.match(/(?:GetCustomerAttribute|SetCustomerAttribute|GetPersonaAttribute|SetPersonaAttribute)\s*\(\s*(?:field\s*=\s*)?["']([^"']*)$/);
    if (attrMatch) {
      const prefix = attrMatch[1].toLowerCase();
      for (const attrName of this.schemas.attributes) {
        if (attrName.toLowerCase().startsWith(prefix)) {
          completions.push({
            label: attrName,
            kind: 'attribute',
            insertText: attrName
          });
        }
      }
    }

    return completions;
  }

  /**
   * Get hover info at position
   */
  getHover(content: string, filePath: string, line: number, column: number): HoverInfo | null {
    const lines = content.split('\n');
    const lineContent = lines[line - 1] || '';

    // Find word at position
    const word = this.getWordAtPosition(lineContent, column);
    if (!word) return null;

    // Check if it's a builtin
    const builtinInfo = this.schemas.builtins.get(word);
    if (builtinInfo) {
      const params = (builtinInfo.parameters || [])
        .map(p => `${p.name}: ${p.type}${p.required ? '' : '?'}`)
        .join(', ');

      return {
        contents: [
          `**${word}**(${params})`,
          '',
          builtinInfo.description || '',
          '',
          `Category: ${builtinInfo.category}`
        ].join('\n')
      };
    }

    // Check if it's a skill
    const skillInfo = this.schemas.skills.get(word);
    if (skillInfo) {
      const params = (skillInfo.parameters || [])
        .map(p => `${p.name}: ${p.type}`)
        .join(', ');

      return {
        contents: [
          `**${word}**(${params})`,
          '',
          `Runner: ${skillInfo.runner_type}`,
          skillInfo.path ? `Path: ${skillInfo.path}` : ''
        ].filter(Boolean).join('\n')
      };
    }

    return null;
  }

  /**
   * Get definition location
   */
  getDefinition(content: string, filePath: string, line: number, column: number): DefinitionLocation | null {
    const lines = content.split('\n');
    const lineContent = lines[line - 1] || '';
    const word = this.getWordAtPosition(lineContent, column);

    if (!word) return null;

    // Check if it's a skill with known path
    const skillInfo = this.schemas.skills.get(word);
    if (skillInfo?.path) {
      // Construct path to skill file
      const skillPath = path.join(
        path.dirname(filePath).replace(/\/[^/]+\/[^/]+$/, ''), // Go up to project root
        skillInfo.path,
        `${word}.jinja`
      );

      return {
        uri: skillPath,
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } }
      };
    }

    return null;
  }

  /**
   * Check if cursor is inside an expression
   */
  private isInExpression(text: string): boolean {
    let depth = 0;
    for (let i = 0; i < text.length - 1; i++) {
      if (text.slice(i, i + 2) === '{{') {
        depth++;
        i++;
      } else if (text.slice(i, i + 2) === '}}') {
        depth--;
        i++;
      }
    }
    return depth > 0;
  }

  /**
   * Get word at position
   */
  private getWordAtPosition(line: string, column: number): string | null {
    const before = line.substring(0, column);
    const after = line.substring(column - 1);

    const beforeMatch = before.match(/([A-Za-z_][A-Za-z0-9_]*)$/);
    const afterMatch = after.match(/^([A-Za-z0-9_]*)/);

    if (beforeMatch || afterMatch) {
      return (beforeMatch?.[1] || '') + (afterMatch?.[1]?.substring(1) || '');
    }

    return null;
  }

}

export default NewoDslAnalyzer;
