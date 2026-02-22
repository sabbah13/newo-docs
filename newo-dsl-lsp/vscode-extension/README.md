<h1 align="center">Newo DSL Extension</h1>

<p align="center">
  <strong>Full IDE support for Newo Skill Language templates in VS Code and Cursor</strong>
</p>

---

## Features

| Feature | Description |
|---------|-------------|
| **Syntax Highlighting** | Color-coded templates with embedded JSON support |
| **Custom File Icons** | Distinctive green `{%}` icon for Jinja/NSL, purple `{{}}` icon for Guidance/NSLG |
| **IntelliSense** | Completions for 76 built-in actions, 81 Jinja built-ins, project skills, and variables |
| **Variable Intelligence** | Variable completions, hover info, go-to-definition, undefined/unused diagnostics |
| **Object Property Completions** | Dot-access completions for typed variables (e.g., `user.name` after `GetUser()`) |
| **Type Inference** | Automatic type inference from action return values (12 object shapes) |
| **Attribute Discovery** | Autocomplete for attribute field names discovered from your project templates |
| **Hover Documentation** | Parameter details, variable info, and property descriptions on hover |
| **Real-time Diagnostics** | Error detection for unknown actions, missing parameters, undefined variables, and syntax issues |
| **Go-to-Definition** | Navigate to skill files, action definitions, variable assignments, and metadata files |
| **Quick-Fixes** | "Did you mean?" suggestions for typos with one-click replacement |
| **Code Snippets** | Quick templates for common Jinja and Guidance patterns |
| **V1 + V2 Format Support** | Auto-detects and works with both CLI2 and module-based project formats |

## Supported File Types

| Extension | Language | Format | Icon |
|-----------|----------|--------|------|
| `.jinja` | Newo Jinja | V1 | Green `{%}` |
| `.guidance` | Newo Guidance | V1 | Purple `{{}}` |
| `.nsl` | Newo NSL | V2 | Green `{%}` |
| `.nslg` | Newo NSLG | V2 | Purple `{{}}` |

> **Note:** V2 files (`.nsl`/`.nslg`) use the same template syntax as V1 (`.jinja`/`.guidance`). The extension auto-detects the project format and provides full features for both.

## Installation

### From VSIX File

1. Build the extension (see [Development](#development)) or obtain the latest `.vsix` file
2. Open VS Code or Cursor
3. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
4. Type **"Install from VSIX"** and select it
5. Navigate to and select the `.vsix` file
6. Reload the editor when prompted

### Verify Installation

1. Open any `.jinja`, `.guidance`, `.nsl`, or `.nslg` file
2. Confirm syntax highlighting is active (colored text)
3. Hover over a built-in function to see documentation
4. Type `{{` to trigger completions

## Usage

### Completions

- **Jinja files** - Type inside `{{ }}` or `{% %}` blocks for action and skill suggestions
- **Guidance files** - Type inside `{{ }}` expressions for completions
- **Skills** - Type any letter to see matching skills discovered from your project

### Diagnostics

| Indicator | Meaning |
|-----------|---------|
| Red underline | Unknown action or skill |
| Yellow underline | Warning (missing parameters, undefined variable) |
| Grey underline | Hint (unused variable) |

### Snippets

#### Jinja Snippets

| Trigger | Description |
|---------|-------------|
| `if` | If statement block |
| `ifelse` | If-else block |
| `for` | For loop block |
| `set` | Set variable |
| `return` | Return from skill |
| `getattr` | `GetCustomerAttribute` call |
| `setattr` | `SetCustomerAttribute` call |
| `getpersona` | `GetAgentPersona` call |
| `sendmsg` | `SendMessage` call |
| `sendevent` | `SendSystemEvent` call |
| `gettrigger` | `GetTriggeredAct` call |
| `skill` | Generic skill call |
| `validate` | Validation pattern |
| `debug` | Debug logging pattern |

#### Guidance Snippets

| Trigger | Description |
|---------|-------------|
| `system` | System prompt block |
| `user` | User message block |
| `assistant` | Assistant message block |
| `if` | Conditional block |
| `ifelse` | If-else block |
| `each` | Loop block |
| `set` | Set variable |
| `return` | Return from skill |
| `convometa` | Conversation metadata |
| `skill` | Generic skill call |
| `var` | Variable reference |

### Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `newo-dsl.schemasPath` | string | `""` | Path to DSL schemas directory |
| `newo-dsl.enableDiagnostics` | boolean | `true` | Enable diagnostic reporting |
| `newo-dsl.enableCompletions` | boolean | `true` | Enable code completions |
| `newo-dsl.enableHover` | boolean | `true` | Enable hover information |

## Built-in Actions Reference

### Core Flow Control
`Return`, `Set`, `Gen`, `GenStream`, `Do`

### Customer and User
`GetCustomerAttribute`, `SetCustomerAttribute`, `SetCustomerMetadataAttribute`, `GetCustomerMetadataAttribute`, `GetUser`, `UpdateUser`

### Project and Persona
`GetProjectAttribute`, `SetProjectAttribute`, `SetProjectMetadataAttribute`, `GetPersonaAttribute`, `SetPersonaAttribute`, `GetAgentPersona`, `CreatePersona`, `CreateActor`

### Messaging
`SendMessage`, `SendCommand`, `SendSystemEvent`, `SendTypingStart`, `SendTypingStop`

### Connectors
`CreateConnector`, `GetConnectorInfo`, `SetConnectorInfo`, `DeleteConnector`

### Data and State
`GetState`, `SetState`, `GetMemory`, `GetActors`, `GetActor`, `CreateArray`

### Utilities
`GetCurrentPrompt`, `GetTriggeredAct`, `GetDatetime`, `GetDateTime`, `GetDateInterval`, `GetValueJSON`, `UpdateValueJSON`, `GetItemsArrayByIndexesJSON`, `Stringify`, `Concat`, `IsEmpty`, `IsSimilar`, `IsGlobal`, `DUMMY`, `StartNotInterruptibleBlock`, `StopNotInterruptibleBlock`

## Troubleshooting

### Extension Not Activating

1. **Reload Window** - `Cmd+Shift+P` -> "Reload Window"
2. **Check Language Mode** - Bottom-right status bar should show "Newo Jinja" or "Newo Guidance"
3. **Manual Association** - Click language mode -> "Configure File Association" -> select the correct type

### No Completions Appearing

1. Ensure cursor is inside `{{ }}` or `{% %}` blocks
2. Check the Output panel for LSP server errors
3. Try reloading the window

### Skill Not Recognized

1. **V1 projects**: Ensure your project has `metadata.yaml` files with skill definitions
2. **V2 projects**: Ensure flow YAML files contain skill definitions with `idn` fields
3. Skills must be defined in `.jinja`, `.guidance`, `.nsl`, or `.nslg` files within the project
4. Skill names are case-sensitive

## Development

```bash
cd vscode-extension
npm install
npm run build          # Development build
npm run build:prod     # Production build (minified)
npm run watch          # Watch mode for development
npm run package        # Create .vsix package
```

Press `F5` in VS Code to launch the Extension Development Host for testing.

## Cursor Support

This extension is fully compatible with [Cursor](https://cursor.sh), the AI-first code editor built on VS Code.

### Installation in Cursor

1. Build the `.vsix` file (see [Development](#development))
2. Open Cursor
3. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
4. Type **"Install from VSIX"** and select it
5. Navigate to the `.vsix` file and install
6. Reload Cursor when prompted

### Compatibility

| Feature | VS Code | Cursor |
|---------|---------|--------|
| Syntax Highlighting | Yes | Yes |
| Custom File Icons | Yes | Yes |
| IntelliSense / Completions | Yes | Yes |
| Hover Documentation | Yes | Yes |
| Diagnostics | Yes | Yes |
| Go-to-Definition | Yes | Yes |
| Snippets | Yes | Yes |
| Quick-Fixes | Yes | Yes |

### AI Integration Notes

- Cursor's AI features work alongside this extension - you get both AI suggestions and DSL-specific completions
- The LSP diagnostics appear in Cursor's problems panel just like in VS Code
- Cursor's "AI Fix" feature can use the diagnostic messages from this extension to suggest corrections

### Troubleshooting (Cursor-specific)

- **Extension not loading**: Ensure the extension is enabled in Cursor's Extensions panel (some VS Code extensions need manual enabling)
- **LSP not starting**: Check the Output panel (`View > Output > Newo DSL`) for server startup logs
- **Conflicting AI suggestions**: If Cursor's AI completions conflict with DSL completions, you can configure completion priority in Cursor's settings

## Requirements

- VS Code 1.85.0+ or Cursor
- Node.js 18+ (for development only)

## License

Proprietary - [Newo AI](https://newo.ai). All rights reserved.
