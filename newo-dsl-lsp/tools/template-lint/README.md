# @newo-dsl/template-lint

CLI static analyzer for Newo DSL templates (`.jinja`, `.guidance`). Supports text, JSON, and SARIF output formats for CI integration.

## Usage

```bash
# Lint all templates in a directory
newo-lint ./path/to/templates

# Lint specific files
newo-lint file1.jinja file2.guidance

# Output as JSON
newo-lint --format json ./project

# Output as SARIF (for GitHub Code Scanning)
newo-lint --format sarif ./project > results.sarif
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--schemas <dir>` | Path to schemas directory | `../dsl-spec` |
| `--format <fmt>` | Output format: `text`, `json`, `sarif` | `text` |
| `--severity <lvl>` | Minimum severity: `error`, `warning`, `info` | `warning` |
| `--fix` | Apply automatic fixes (not yet implemented) | - |
| `--quiet` | Only output errors | `false` |
| `--flows` | Lint flow definitions (flows.yaml) | `false` |
| `--help` | Show help | - |

## Error Codes

### Syntax Errors (Jinja)

| Code | Severity | Description |
|------|----------|-------------|
| E001 | Error | Unbalanced expression braces `{{ }}` |
| E002 | Error | Unbalanced statement braces `{% %}` |
| E003 | Error | Unbalanced comment braces `{# #}` |

### Block Errors (Guidance)

| Code | Severity | Description |
|------|----------|-------------|
| E010 | Error | Unclosed block (e.g., `{{#system}}` without `{{/system}}`) |
| E011 | Error | Mismatched block close (e.g., `{{#system}}...{{/user}}`) |
| E012 | Error | Unexpected block close without matching open |
| W010 | Warning | Unknown block type |

### Schema Validation

| Code | Severity | Description |
|------|----------|-------------|
| E100 | Error | Unknown skill (not found in schema, with "Did you mean?" suggestions) |
| E101 | Error | Missing required parameter |
| W100 | Warning | Unknown built-in function |
| W101 | Warning | Unknown function (not a skill or built-in) |
| W102 | Warning | Unknown parameter for function (with suggestions) |
| W103 | Warning | Deprecated function usage |

## Output Formats

### Text (default)

```
path/to/file.jinja
  12:5  error  Unknown skill: SendMessge. Did you mean: SendMessage?  E100
  18:3  warn   Missing required parameter 'field'                      E101

2 problems (1 error, 1 warning)
```

### JSON

```json
{
  "files": [{
    "path": "file.jinja",
    "diagnostics": [{
      "line": 12, "column": 5,
      "severity": "error", "code": "E100",
      "message": "Unknown skill: SendMessge. Did you mean: SendMessage?"
    }]
  }],
  "summary": { "errors": 1, "warnings": 1, "total": 2 }
}
```

### SARIF

Standard Static Analysis Results Interchange Format for CI/CD tools like GitHub Code Scanning, Azure DevOps, and more.

## CI Integration

### GitHub Actions

```yaml
- name: Lint DSL Templates
  run: |
    node tools/template-lint/cli.js --format sarif ./project > lint-results.sarif

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: lint-results.sarif
```

### Pre-commit Hook

```bash
#!/bin/sh
node tools/template-lint/cli.js --severity error $(git diff --cached --name-only --diff-filter=ACM -- '*.jinja' '*.guidance')
```

## Development

```bash
# Run the linter
node cli.js ./path/to/templates

# Run tests
npm test
```

## License

Proprietary - [Newo AI](https://newo.ai). All rights reserved.
