# Changelog

All notable changes to the Newo DSL extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-02-20

### Added
- **Variable Intelligence**: Comprehensive variable tracking across the entire DSL
  - Variable completions inside `{{ }}` and `{% %}` blocks, sorted by proximity
  - Hover info for variables showing source, type, value expression, and literal values
  - Go-to-definition for variables (jumps to `{% set %}`, `Set()`, or metadata.yaml)
  - Undefined variable warnings with "Did you mean?" suggestions
  - Unused variable hints (info severity, non-blocking)
- **Object Property Completions**: Dot-access completions for typed variables
  - After `{% set user = GetUser() %}`, typing `user.` offers `.id`, `.name`, `.email`, etc.
  - After `{% for actor in GetActors() %}`, typing `actor.` offers Actor properties
  - `loop.` inside for-blocks shows `.index`, `.index0`, `.first`, `.last`, `.length`
  - Hover on `user.name` shows property type and description
- **12 Object Shape Definitions**: Full property catalogs for User, Actor, Act, AgentPersona, SessionInfo, AkbTopic, ConnectorInfo, AgentInfo, CustomerInfo, Customer, Webhook, and LoopContext
- **Type Inference Engine**: Automatic type inference from action return values
  - `GetUser()` -> User object, `GetActors()` -> Actor array, `IsEmpty()` -> boolean, etc.
  - String/number/boolean/array/object literal detection
  - Concatenation operator (`~`) and filter chain (`|`) inferred as string
- **Dynamic Attribute Discovery**: Autocomplete for attribute field names from project files
  - `GetCustomerAttribute(field="` suggests field names found across project templates
  - `GetState(name="` suggests state names used elsewhere in the project
  - Covers customer, project, persona attributes and state names
  - No hardcoded catalog - discovers values dynamically from your codebase
- **Parameter Hints on Skill Calls**: Hover over a skill call shows expected parameters with types and defaults
- **Literal Value Tracking**: Hover on variables shows tracked literal values
  - `{% set x = "hello" %}` -> hover shows `x = "hello"`
  - Branch analysis merges values from if/else: shows `"a" | "b"` for branched assignments
- **Variable Scope Tracking**: For-loop variables correctly scoped to their loop block
- **Set() Action Variable Tracking**: `{{ Set(name="x", value=...) }}` tracked as variable definitions
- **230+ New Tests**: Variable tracker (52), parser variable extraction (26), validation mutation (100+), semantic tokens, filter edge cases

### Fixed
- Parser now correctly handles `Set()` action as both a builtin call AND a variable definition
- Whitespace-trimming operators (`{%-` / `-%}`) no longer break set/for statement parsing
- Keywords check no longer incorrectly skips builtin actions with matching keyword names (e.g., `Set` vs `set`)
- **Validation Hardening** - 6 false-positive categories eliminated:
  - String-aware statement brace counting (no false positives from `{%` inside string literals)
  - String-aware reversed brace check (no false positives from `}}` inside string literals)
  - Method calls on objects (e.g., `zoneinfo.ZoneInfo()`, `parts.append()`) no longer flagged as unknown functions
  - Jinja capture blocks (`{% set x %}...{% endset %}`) now tracked as variable definitions
  - Single-bang Guidance comments (`{{! comment }}`) no longer generate false undefined-variable warnings
  - Parameters with non-null default values correctly treated as optional in diagnostics

### Changed
- Test suite expanded from 199 to 429+ tests across 18 test files
- Parser `extractFunctionCalls` now distinguishes builtin actions from Jinja keywords when names overlap
- Skill hover now shows detailed parameter list with required/optional and default values

## [0.4.0] - 2026-02-18

### Added
- **8 New Built-in Actions**: `GetSessionInfo`, `DisableFollowUp`, `EnableFollowUp`, `SetCustomerInfo`, `FastPrompt`, `Error`, `ResultError`, `ConnectorResultError`
- **Parameter Constraint Validation**: Server now enforces `allowed` values and `min`/`max` ranges from VALIDATION_RULES
- **Statement Block Completions**: IntelliSense now works inside `{% %}` blocks (not just `{{ }}`)
- **Schema Reload Handler**: `newo-dsl/reloadSchemas` notification now triggers skill index rebuild
- Jinja statement keywords completions (`set`, `if`, `for`, `elif`, `else`, `endif`, `endfor`, `macro`, `endmacro`)

### Fixed
- **BUILTINS Sync**: Parser BUILTINS set now derived from `@newo-dsl/data` ACTIONS (was hardcoded subset of 25/72)
- **Brace Diagnostics Location**: Unbalanced brace errors now point to the actual problematic brace (was always line 0)
- **Multi-line Statement Parsing**: `{% %}` blocks spanning multiple lines are now parsed correctly
- **Go-to-Definition Path**: Built-in action definition now resolves correctly in both dev and bundled builds
- Added missing validation rules for `IsGlobal` and `GetDateInterval`
- All 76 actions now have 1:1 matching validation rules (zero orphans, zero missing)

### Changed
- Updated action count from 52 to 76 across all documentation
- Test suite expanded to 199 tests across 9 test files

## [0.3.0] - 2026-02-18

### Added
- **V2 Format Support**: Full support for Newo V2 module-based project format (`.nsl`/`.nslg` files)
- Auto-detection of V1 (CLI2) and V2 (module-based) project formats via `import_version.txt`
- V2 flow YAML parsing for inline skill parameter extraction
- V2 module scanning (agents + libraries directories)
- **Quick-Fixes**: "Did you mean?" suggestions for typos with one-click code action replacement
- **Typo Suggestions**: Levenshtein-based suggestions for unknown functions and actions
- Go-to-definition for built-in actions (navigates to action data source)
- Shared `@newo-dsl/data` package for actions, builtins, validation rules, and string similarity
- Guidance block support in JinjaParser ({{#system}}, {{/system}}, etc.)
- Template-lint adapter for analyzer interop
- 197 unit and integration tests across 9 test files
- Comprehensive CI/CD with GitHub Actions (build, test, release)
- V2 test fixtures and real data compatibility tests

### Changed
- Extracted format detection and skill scanning into testable `format-utils.ts` module
- Migrated built-in actions, Jinja builtins, and validation rules to shared `@newo-dsl/data` package
- Server reduced from ~2,400 lines to ~850 lines via data extraction
- Shared Levenshtein algorithm across all packages (was duplicated in 3 places)
- Version sync across core packages (root, extension, analyzer, lsp-server, data)

### Fixed
- Comment brace counting false positive with guidance blocks (`{{#system}}` no longer miscounted as `{#`)
- Flow YAML parameters now correctly propagate to skills in subdirectories

## [0.2.0] - 2024-12-19

### Added
- esbuild bundling for faster extension startup and smaller package size
- Self-contained LSP server bundled with the extension (no external dependencies at runtime)
- Graceful degradation - syntax highlighting works even if LSP server fails to start
- Additional built-in actions beyond the original 42 (GenStream, SearchFuzzyAkb, webhooks, and more)

### Changed
- Extension entry point moved from compiled TypeScript to esbuild bundle
- VS Code engine requirement updated from 1.74.0 to 1.85.0
- Improved skill discovery with broader workspace scanning paths

### Fixed
- LSP server startup reliability improvements
- Better error handling when schema files are not found

## [0.1.0] - 2024-12-04

### Added
- Initial release
- Syntax highlighting for `.jinja` and `.guidance` files
- Custom file icons for both template types
- 42 built-in Newo DSL actions with full IntelliSense
- 80+ Jinja2 built-in functions and filters with completions
- Auto-completion for actions, parameters, and Jinja constructs
- Hover documentation for all actions with parameter details
- Real-time validation and diagnostics
- Parameter validation for required parameters
- Validation in both `{{ }}` expressions and `{% %}` statements
- Skill file discovery and validation across project workspace
- Go-to-definition for skill references
- 14 Jinja code snippets for common patterns
- 11 Guidance code snippets for prompt engineering
- TextMate grammars for both Newo Jinja and Newo Guidance languages
