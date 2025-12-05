# Newo DSL Language Server

Language Server Protocol (LSP) implementation for the Newo Skill Language (NSL) - the DSL powering Newo SuperAgent conversational AI platform.

## Project Structure

```
newo-dsl-lsp/
├── docs/                          # Documentation
│   ├── phase-0-discovery.md      # Repository reconnaissance findings
│   └── dev/                      # Developer documentation
├── tools/
│   ├── dsl-spec/                 # Schema generation tools
│   │   ├── skills.schema.yaml    # All skills with parameters
│   │   ├── builtins.schema.yaml  # Core built-in functions
│   │   ├── events.schema.yaml    # Event definitions
│   │   ├── flows.schema.yaml     # Flow structure
│   │   └── generate.js           # Schema generator script
│   └── template-lint/            # CLI static analyzer
│       └── cli.js                # Linter entry point
├── packages/
│   ├── dsl-analyzer/             # Core analysis library
│   │   ├── src/
│   │   │   ├── parsers/          # Jinja/Guidance parsers
│   │   │   ├── validators/       # Validation logic
│   │   │   └── index.ts          # Public API
│   │   └── package.json
│   └── dsl-lsp-server/           # LSP server
│       ├── src/
│       │   ├── server.ts         # Main server
│       │   ├── capabilities/     # LSP capabilities
│       │   └── index.ts
│       └── package.json
├── vscode-extension/             # VS Code extension
│   ├── src/
│   │   └── extension.ts          # Extension entry
│   ├── syntaxes/                 # TextMate grammars
│   │   ├── newo-jinja.tmLanguage.json
│   │   └── newo-guidance.tmLanguage.json
│   ├── icons/                    # File type icons
│   │   ├── jinja-icon.svg
│   │   └── guidance-icon.svg
│   ├── snippets/                 # Code snippets
│   └── package.json
└── package.json                  # Workspace root
```

## Supported File Types

| Extension | Language | Purpose |
|-----------|----------|---------|
| `.jinja` | Newo Jinja | Procedural logic, data transformation |
| `.guidance` | Newo Guidance | LLM prompts, system instructions |
| `flows.yaml` | YAML | Flow orchestration configuration |
| `metadata.yaml` | YAML | Skill/flow configuration |

## Development Phases

- [x] **Phase 0**: Repository reconnaissance (complete)
- [x] **Phase 1**: Extract language model - 1218 skills, 186 events, 314 attributes
- [x] **Phase 2**: CLI static analyzer with schema validation
- [x] **Phase 3**: LSP server with diagnostics, completions, hover
- [x] **Phase 4**: VS Code extension with syntax highlighting, snippets, icons
- [ ] **Phase 5**: Enhanced DX features (typo suggestions, quick-fixes, go-to-definition)
- [ ] **Phase 6**: CI integration (import/publish validation)

## Schema Statistics

| Schema | Count | Description |
|--------|-------|-------------|
| Skills | 1,218 | Template functions with parameters |
| Events | 186 | System event definitions |
| Attributes | 314 | Customer/persona attributes |
| Flows | 59 | Agent flow definitions across 15 agents |
| Built-in Actions | 42 | Core DSL functions |
| Jinja Built-ins | 80+ | Python/Jinja2 functions & filters |

## Quick Start

```bash
# Install dependencies
npm install

# Generate schemas from codebase
npm run generate:schemas

# Lint templates
npm run lint:templates

# Build all packages
npm run build

# Build VS Code extension
cd vscode-extension
npm run package
```

## VS Code Extension

The extension provides full IDE support for Newo DSL:

### Features
- **Syntax Highlighting** - Color-coded templates with embedded JSON support
- **Custom File Icons** - Distinctive icons for `.jinja` and `.guidance` files
- **IntelliSense** - Completions for 42 built-in actions, 80+ Jinja built-ins, and project skills
- **Hover Documentation** - Parameter information on hover
- **Real-time Diagnostics** - Error detection for unknown actions and skills
- **Code Snippets** - Quick templates for common patterns

### Installation
1. Build the extension: `cd vscode-extension && npm run package`
2. Install the `.vsix` file in VS Code/Cursor
3. Open any `.jinja` or `.guidance` file

See [vscode-extension/README.md](vscode-extension/README.md) for detailed documentation.

## DSL Overview

The Newo DSL consists of two template languages:

### Jinja Templates (`.jinja`)
Extended Jinja2 syntax for procedural logic:
```jinja
{% set user = GetCustomerAttribute(field="user_name") %}
{% if user %}
  {{SendMessage(text="Hello " ~ user)}}
{% endif %}
{{Return()}}
```

### Guidance Templates (`.guidance`)
Handlebars-like syntax for LLM instructions:
```guidance
{{Set(name="context", value=GetCurrentPrompt())}}
{{#system~}}
You are a helpful assistant.
{{~/system}}
{{Return(val=context)}}
```

## Built-in Actions (42)

The DSL includes 42 core actions organized by category:

| Category | Actions |
|----------|---------|
| Flow Control | Return, Set, Gen, Do |
| Customer/User | GetCustomerAttribute, SetCustomerAttribute, SetCustomerMetadataAttribute, GetCustomerMetadataAttribute, GetUser, UpdateUser |
| Project/Persona | GetProjectAttribute, SetProjectAttribute, SetProjectMetadataAttribute, GetPersonaAttribute, SetPersonaAttribute, GetAgentPersona, CreatePersona, CreateActor |
| Messaging | SendMessage, SendCommand, SendSystemEvent, SendTypingStart, SendTypingStop |
| Connectors | CreateConnector, GetConnectorInfo, SetConnectorInfo, DeleteConnector |
| Data/State | GetState, SetState, GetMemory, GetActors, GetActor, CreateArray |
| Utilities | GetCurrentPrompt, GetTriggeredAct, GetDatetime, GetDateTime, GetDateInterval, GetValueJSON, UpdateValueJSON, GetItemsArrayByIndexesJSON, Stringify, Concat, IsEmpty, IsSimilar, IsGlobal, DUMMY |
| Flow Control | StartNotInterruptibleBlock, StopNotInterruptibleBlock |

## CLI Linter

Validate templates from the command line:

```bash
# Lint all templates in a directory
node tools/template-lint/cli.js ./project

# Lint specific files
node tools/template-lint/cli.js file1.jinja file2.guidance
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT
