#!/usr/bin/env node
/**
 * Newo DSL Template Linter CLI
 *
 * Static analyzer for Newo DSL templates (.jinja, .guidance, .nsl, .nslg)
 *
 * Usage:
 *   newo-lint [options] [files...]
 *
 * Options:
 *   --schemas <dir>   Path to schemas directory (default: ../dsl-spec)
 *   --format <fmt>    Output format: text, json, sarif (default: text)
 *   --severity <lvl>  Minimum severity: error, warning, info (default: warning)
 *   --fix             Apply automatic fixes (not yet implemented)
 *   --quiet           Only output errors
 *   --help            Show help
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const JinjaParser = require('./src/parsers/jinja-parser');
const GuidanceParser = require('./src/parsers/guidance-parser');
const SchemaValidator = require('./src/validators/schema-validator');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

class NewoLinter {
  constructor(options = {}) {
    this.options = {
      schemasDir: options.schemasDir || path.resolve(__dirname, '../dsl-spec'),
      format: options.format || 'text',
      severity: options.severity || 'warning',
      quiet: options.quiet || false,
      ...options
    };

    this.schemaValidator = new SchemaValidator(this.options.schemasDir);
    this.jinjaParser = null;
    this.guidanceParser = null;

    this.results = {
      files: 0,
      errors: 0,
      warnings: 0,
      info: 0,
      diagnostics: []
    };
  }

  /**
   * Initialize the linter (load schemas, create parsers with builtin names)
   */
  async init() {
    this.schemaValidator.loadSchemas();
    const builtinNames = [...this.schemaValidator.builtinIndex.keys()];
    this.jinjaParser = new JinjaParser(builtinNames.length > 0 ? builtinNames : null);
    this.guidanceParser = new GuidanceParser(builtinNames.length > 0 ? builtinNames : null);
    const stats = this.schemaValidator.getStats();

    if (!this.options.quiet) {
      console.log(`${colors.blue}Newo DSL Linter${colors.reset}`);
      console.log(`Loaded: ${stats.skills} skills, ${stats.builtins} builtins, ${stats.attributes} attributes\n`);
    }
  }

  /**
   * Lint files matching patterns
   * @param {string[]} patterns - File patterns to lint
   */
  async lintPatterns(patterns) {
    const files = [];

    for (const pattern of patterns) {
      const matches = await glob(pattern, { absolute: true });
      files.push(...matches);
    }

    // Filter to template files (V1: .jinja/.guidance, V2: .nsl/.nslg)
    const templateFiles = files.filter(f =>
      f.endsWith('.jinja') || f.endsWith('.guidance') ||
      f.endsWith('.nsl') || f.endsWith('.nslg')
    );

    if (templateFiles.length === 0) {
      console.log('No template files found matching patterns');
      return this.results;
    }

    // Pre-scan: build skill index from filenames so cross-skill references resolve
    this.buildProjectSkillIndex(templateFiles);

    for (const file of templateFiles) {
      await this.lintFile(file);
    }

    return this.results;
  }

  /**
   * Build a skill index from the scanned template filenames.
   * Extracts skill names from file basenames (e.g., MySkill.nsl -> MySkill)
   * so cross-skill Do() references and direct skill calls resolve correctly.
   * @param {string[]} files - Template file paths
   */
  buildProjectSkillIndex(files) {
    let count = 0;
    for (const filePath of files) {
      const ext = path.extname(filePath);
      const basename = path.basename(filePath, ext);
      // Skip if already in the index (schema-defined skills take priority)
      if (!this.schemaValidator.skillIndex.has(basename)) {
        this.schemaValidator.skillIndex.set(basename, {
          name: basename,
          parameters: [],
          path: filePath,
          runner_type: ext === '.nslg' || ext === '.guidance' ? 'guidance' : 'jinja'
        });
        count++;
      }
    }
    if (!this.options.quiet && count > 0) {
      console.log(`Discovered ${count} skills from project files\n`);
    }
  }

  /**
   * Lint a single file
   * @param {string} filePath - Path to file
   */
  async lintFile(filePath) {
    this.results.files++;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const ext = path.extname(filePath);

      // Parse based on extension
      let parseResult;
      if (ext === '.jinja' || ext === '.nsl') {
        parseResult = this.jinjaParser.parse(content, filePath);
      } else if (ext === '.guidance' || ext === '.nslg') {
        parseResult = this.guidanceParser.parse(content, filePath);
      } else {
        return;
      }

      // Collect parser diagnostics
      const diagnostics = [...parseResult.diagnostics];

      // Validate against schemas
      const schemaDiags = this.schemaValidator.validate(parseResult);
      diagnostics.push(...schemaDiags);

      // Filter by severity
      const filteredDiags = this.filterBySeverity(diagnostics);

      // Store results
      if (filteredDiags.length > 0) {
        this.results.diagnostics.push({
          file: filePath,
          diagnostics: filteredDiags
        });

        for (const diag of filteredDiags) {
          if (diag.severity === 'error') this.results.errors++;
          else if (diag.severity === 'warning') this.results.warnings++;
          else this.results.info++;
        }
      }

    } catch (e) {
      this.results.errors++;
      this.results.diagnostics.push({
        file: filePath,
        diagnostics: [{
          severity: 'error',
          code: 'E000',
          message: `Failed to read file: ${e.message}`,
          line: 1,
          column: 1
        }]
      });
    }
  }

  /**
   * Filter diagnostics by severity level
   */
  filterBySeverity(diagnostics) {
    const severityOrder = { error: 0, warning: 1, info: 2 };
    const minSeverity = severityOrder[this.options.severity] || 1;

    return diagnostics.filter(d =>
      severityOrder[d.severity] <= minSeverity
    );
  }

  /**
   * Format and output results
   */
  formatResults() {
    switch (this.options.format) {
      case 'json':
        return this.formatJson();
      case 'sarif':
        return this.formatSarif();
      default:
        return this.formatText();
    }
  }

  /**
   * Text format output
   */
  formatText() {
    const lines = [];

    for (const fileResult of this.results.diagnostics) {
      const relPath = path.relative(process.cwd(), fileResult.file);

      for (const diag of fileResult.diagnostics) {
        const severityColor = diag.severity === 'error' ? colors.red : colors.yellow;
        const location = `${relPath}:${diag.line}:${diag.column}`;

        lines.push(
          `${colors.gray}${location}${colors.reset} ` +
          `${severityColor}${diag.severity}${colors.reset} ` +
          `${colors.gray}[${diag.code}]${colors.reset} ${diag.message}`
        );
      }
    }

    // Summary
    lines.push('');
    lines.push(
      `${colors.bold}Summary:${colors.reset} ` +
      `${this.results.files} files, ` +
      `${colors.red}${this.results.errors} errors${colors.reset}, ` +
      `${colors.yellow}${this.results.warnings} warnings${colors.reset}`
    );

    return lines.join('\n');
  }

  /**
   * JSON format output
   */
  formatJson() {
    return JSON.stringify(this.results, null, 2);
  }

  /**
   * SARIF format output (for IDE integration)
   */
  formatSarif() {
    const sarif = {
      version: '2.1.0',
      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
      runs: [{
        tool: {
          driver: {
            name: 'newo-lint',
            version: '0.5.0',
            informationUri: 'https://github.com/newo-ai/newo-nsl-lsp',
            rules: this.getSarifRules()
          }
        },
        results: this.results.diagnostics.flatMap(fileResult =>
          fileResult.diagnostics.map(diag => ({
            ruleId: diag.code,
            level: diag.severity === 'error' ? 'error' : 'warning',
            message: { text: diag.message },
            locations: [{
              physicalLocation: {
                artifactLocation: { uri: path.relative(process.cwd(), fileResult.file) },
                region: {
                  startLine: diag.line,
                  startColumn: diag.column
                }
              }
            }]
          }))
        )
      }]
    };

    return JSON.stringify(sarif, null, 2);
  }

  /**
   * Get SARIF rule definitions
   */
  getSarifRules() {
    return [
      { id: 'E001', shortDescription: { text: 'Unbalanced expression braces' } },
      { id: 'E002', shortDescription: { text: 'Unbalanced statement braces' } },
      { id: 'E010', shortDescription: { text: 'Unclosed block' } },
      { id: 'E011', shortDescription: { text: 'Mismatched block close' } },
      { id: 'E012', shortDescription: { text: 'Unexpected block close' } },
      { id: 'E020', shortDescription: { text: 'Guidance syntax error' } },
      { id: 'E100', shortDescription: { text: 'Unknown skill' } },
      { id: 'E101', shortDescription: { text: 'Missing required parameter' } },
      { id: 'W001', shortDescription: { text: 'Missing space in statement' } },
      { id: 'W010', shortDescription: { text: 'Unknown block type' } },
      { id: 'W100', shortDescription: { text: 'Built-in not in schema' } },
      { id: 'W101', shortDescription: { text: 'Unknown function' } },
      { id: 'W102', shortDescription: { text: 'Unknown parameter' } },
      { id: 'W103', shortDescription: { text: 'Unknown attribute' } }
    ];
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {
    patterns: [],
    schemasDir: path.resolve(__dirname, '../dsl-spec'),
    format: 'text',
    severity: 'warning',
    quiet: false,
    help: false
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--schemas') {
      options.schemasDir = args[++i];
    } else if (arg === '--format') {
      options.format = args[++i];
    } else if (arg === '--severity') {
      options.severity = args[++i];
    } else if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
    } else if (!arg.startsWith('-')) {
      options.patterns.push(arg);
    }

    i++;
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${colors.bold}Newo DSL Template Linter${colors.reset}

Usage: newo-lint [options] [files/patterns...]

Options:
  --schemas <dir>    Path to schemas directory
  --format <fmt>     Output format: text, json, sarif (default: text)
  --severity <lvl>   Minimum severity: error, warning, info (default: warning)
  --quiet, -q        Only output summary
  --help, -h         Show this help

Examples:
  newo-lint "**/*.nsl"
  newo-lint --format json src/templates/
  newo-lint --severity error "**/*.nslg"
  newo-lint "**/*.jinja" "**/*.guidance"
`);
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Default pattern if none specified
  if (options.patterns.length === 0) {
    options.patterns = ['**/*.jinja', '**/*.guidance', '**/*.nsl', '**/*.nslg'];
  }

  const linter = new NewoLinter(options);
  await linter.init();

  const results = await linter.lintPatterns(options.patterns);
  const output = linter.formatResults();

  console.log(output);

  // Exit with error code if errors found
  process.exit(results.errors > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch(e => {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  });
}

module.exports = { NewoLinter, parseArgs };
