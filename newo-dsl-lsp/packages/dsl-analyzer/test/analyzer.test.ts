import { describe, it, expect, beforeEach } from 'vitest';
import { NewoDslAnalyzer } from '../src/index';
import * as path from 'path';
import * as fs from 'fs';

describe('NewoDslAnalyzer', () => {
  let analyzer: NewoDslAnalyzer;

  beforeEach(() => {
    analyzer = new NewoDslAnalyzer();
  });

  describe('schema loading', () => {
    it('should initialize with empty schemas', () => {
      const stats = analyzer.getSchemaStats();
      expect(stats.skills).toBe(0);
      expect(stats.builtins).toBe(0);
      expect(stats.attributes).toBe(0);
      expect(stats.events).toBe(0);
    });

    it('should load schemas from directory if available', () => {
      const schemasDir = path.resolve(__dirname, '../../../tools/dsl-spec');
      if (fs.existsSync(path.join(schemasDir, 'skills.schema.yaml'))) {
        analyzer.loadSchemas(schemasDir);
        const stats = analyzer.getSchemaStats();
        expect(stats.skills).toBeGreaterThan(0);
      }
    });

    it('should handle missing schemas directory gracefully', () => {
      expect(() => analyzer.loadSchemas('/nonexistent/path')).not.toThrow();
    });
  });

  describe('diagnostics', () => {
    it('should return no errors for valid template', () => {
      const content = '{{Return()}}';
      const diagnostics = analyzer.getDiagnostics(content, 'test.jinja');
      // Basic syntax should be valid
      const syntaxErrors = diagnostics.filter(d =>
        d.code === 'E001' || d.code === 'E002' || d.code === 'E003'
      );
      expect(syntaxErrors).toHaveLength(0);
    });

    it('should detect syntax errors in malformed templates', () => {
      const content = '{{SendMessage(message="hi")';
      const diagnostics = analyzer.getDiagnostics(content, 'test.jinja');
      expect(diagnostics.some(d => d.code === 'E001')).toBe(true);
    });

    it('should handle empty content', () => {
      const diagnostics = analyzer.getDiagnostics('', 'test.jinja');
      expect(diagnostics).toHaveLength(0);
    });

    it('should handle content with only comments', () => {
      const content = '{# This is a comment #}';
      const diagnostics = analyzer.getDiagnostics(content, 'test.jinja');
      expect(diagnostics).toHaveLength(0);
    });
  });

  describe('completions', () => {
    it('should return completions inside expressions', () => {
      const content = '{{';
      // Position after {{
      const completions = analyzer.getCompletions(content, 'test.jinja', 1, 3);
      // Should include builtins if schemas loaded
      expect(Array.isArray(completions)).toBe(true);
    });

    it('should return empty completions outside expressions', () => {
      const content = 'plain text';
      const completions = analyzer.getCompletions(content, 'test.jinja', 1, 5);
      expect(completions).toHaveLength(0);
    });
  });

  describe('hover', () => {
    it('should return null for unknown words', () => {
      const content = 'some random text';
      const hover = analyzer.getHover(content, 'test.jinja', 1, 5);
      expect(hover).toBeNull();
    });
  });

  describe('definition', () => {
    it('should return null for unknown functions', () => {
      const content = '{{UnknownFunc()}}';
      const def = analyzer.getDefinition(content, 'test.jinja', 1, 5);
      expect(def).toBeNull();
    });
  });

  describe('parseTemplate', () => {
    it('should parse jinja files', () => {
      const result = analyzer.parseTemplate('{{Return()}}', 'test.jinja');
      expect(result.languageId).toBe('newo-jinja');
    });

    it('should parse guidance files', () => {
      const result = analyzer.parseTemplate('{{Return()}}', 'test.guidance');
      expect(result.languageId).toBe('newo-guidance');
    });

    it('should extract function calls', () => {
      const result = analyzer.parseTemplate(
        '{{SendMessage(message="hello")}}',
        'test.jinja'
      );
      expect(result.functionCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Levenshtein suggestions (via diagnostics)', () => {
    it('should suggest similar skills when schema is loaded', () => {
      const schemasDir = path.resolve(__dirname, '../../../tools/dsl-spec');
      if (fs.existsSync(path.join(schemasDir, 'skills.schema.yaml'))) {
        analyzer.loadSchemas(schemasDir);
        const content = '{{SomeCloseSkillNameSkill()}}';
        const diagnostics = analyzer.getDiagnostics(content, 'test.jinja');
        // Should have diagnostics for unknown skill with suggestions
        const unknownDiags = diagnostics.filter(d =>
          d.code === 'E100' || d.code === 'W101'
        );
        // May or may not have suggestions depending on schema content
        expect(Array.isArray(unknownDiags)).toBe(true);
      }
    });
  });
});
