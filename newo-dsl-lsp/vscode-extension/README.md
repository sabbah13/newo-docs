# Newo DSL Extension

Language support for Newo DSL templates used in the Newo SuperAgent platform.

## Features

- **Syntax Highlighting** for `.jinja` and `.guidance` files with embedded JSON support
- **Custom File Icons** - Distinctive icons for Newo template files
- **Code Snippets** for common patterns
- **IntelliSense** - Completions for 42 built-in functions, 80+ Jinja built-ins, and project skills
- **Hover Information** - Documentation with parameter details on hover
- **Diagnostics** - Real-time error detection for unknown actions and skills

## Supported File Types

| Extension | Language | Icon |
|-----------|----------|------|
| `.jinja` | Newo Jinja templates | Green `{%}` |
| `.guidance` | Newo Guidance templates | Purple `{{}}` |

## Built-in Actions (42)

### Core Flow Control
- `Return` - Exit skill and return value
- `Set` - Assign variable
- `Gen` - Generate LLM response
- `Do` - Execute action

### Customer & User Management
- `GetCustomerAttribute` - Get customer attribute
- `SetCustomerAttribute` - Set customer attribute
- `SetCustomerMetadataAttribute` - Set customer metadata field
- `GetCustomerMetadataAttribute` - Get customer metadata field
- `GetUser` - Retrieve user information
- `UpdateUser` - Update user properties

### Project & Persona
- `GetProjectAttribute` - Get project attribute
- `SetProjectAttribute` - Set project attribute
- `SetProjectMetadataAttribute` - Set project metadata field
- `GetPersonaAttribute` - Get persona attribute
- `SetPersonaAttribute` - Set persona attribute
- `GetAgentPersona` - Retrieve agent persona
- `CreatePersona` - Create new persona
- `CreateActor` - Create new actor

### Messaging & Communication
- `SendMessage` - Send message to user
- `SendCommand` - Send system command
- `SendSystemEvent` - Trigger system event
- `SendTypingStart` - Show typing indicator
- `SendTypingStop` - Hide typing indicator

### Connectors
- `CreateConnector` - Create external connector
- `GetConnectorInfo` - Get connector details
- `SetConnectorInfo` - Update connector info
- `DeleteConnector` - Remove connector

### Data & State
- `GetState` - Retrieve state value
- `SetState` - Store state value
- `GetMemory` - Access memory storage
- `GetActors` - List available actors
- `GetActor` - Get specific actor
- `CreateArray` - Initialize array

### Utilities
- `GetCurrentPrompt` - Get active prompt
- `GetTriggeredAct` - Get triggering action
- `GetDatetime` / `GetDateTime` - Current timestamp
- `GetDateInterval` - Calculate date difference
- `GetValueJSON` - Extract JSON value
- `UpdateValueJSON` - Modify JSON structure
- `GetItemsArrayByIndexesJSON` - Array access by index
- `Stringify` - Convert to string
- `Concat` - Join strings
- `IsEmpty` - Check empty value
- `IsSimilar` - Compare values
- `IsGlobal` - Check global scope
- `DUMMY` - Placeholder action

### Flow Control
- `StartNotInterruptibleBlock` - Begin protected section
- `StopNotInterruptibleBlock` - End protected section

## Jinja Built-ins (80+)

Full support for Python/Jinja2 built-in functions and filters including:

**Functions**: `abs`, `all`, `any`, `bool`, `dict`, `float`, `int`, `len`, `list`, `max`, `min`, `range`, `round`, `sorted`, `str`, `sum`, `zip`, `json.loads`, `json.dumps`, and more.

**Filters**: `capitalize`, `center`, `default`, `escape`, `first`, `format`, `groupby`, `indent`, `join`, `last`, `length`, `lower`, `map`, `replace`, `reverse`, `safe`, `select`, `slice`, `sort`, `split`, `string`, `striptags`, `title`, `trim`, `truncate`, `unique`, `upper`, `urlencode`, `wordwrap`, and more.

## Installation

### From VSIX File

1. Download the latest `.vsix` file
2. Open VS Code or Cursor
3. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
4. Type "Install from VSIX" and select it
5. Navigate to and select the downloaded `.vsix` file
6. Reload the editor when prompted

### Verify Installation

1. Open a `.jinja` or `.guidance` file
2. Check for syntax highlighting (colored text)
3. Hover over a built-in function to see documentation
4. Type `{{` in a guidance file to trigger completions

## Usage

### Error Indicators

The extension provides real-time error detection:

| Indicator | Meaning |
|-----------|---------|
| 🔴 Red underline | Unknown action or skill |
| ⚠️ Yellow underline | Warning (deprecated usage) |

### Completions

- **In Jinja files**: Type inside `{{ }}` or `{% %}` blocks
- **In Guidance files**: Type inside `{{ }}` expressions
- **Skill suggestions**: Type any letter to see matching skills from your project

### Hover Documentation

Hover over any function to see:
- Function name and description
- Parameter names (if applicable)

### File Associations

If files don't automatically use Newo DSL syntax, add to your workspace settings (`.vscode/settings.json`):

```json
{
  "files.associations": {
    "*.jinja": "newo-jinja",
    "*.guidance": "newo-guidance"
  }
}
```

## Snippets

### Jinja Snippets

| Trigger | Description |
|---------|-------------|
| `if` | If statement block |
| `for` | For loop block |
| `set` | Set variable |
| `return` | Return from skill |
| `getattr` | GetCustomerAttribute call |
| `skill` | Generic skill call |

### Guidance Snippets

| Trigger | Description |
|---------|-------------|
| `system` | System prompt block |
| `user` | User message block |
| `assistant` | Assistant message block |
| `if` | Conditional block |
| `each` | Loop block |
| `gen` | Generation block |

## Troubleshooting

### Extension Not Working

1. **Reload Window**: Press `Cmd+Shift+P` → "Reload Window"
2. **Check Language Mode**: Bottom-right should show "Newo Jinja" or "Newo Guidance"
3. **Manual Association**: Click language mode → "Configure File Association" → select correct type

### No Completions

1. Ensure cursor is inside `{{ }}` or `{% %}` blocks
2. Check that LSP server is running (no error in Output panel)
3. Try reloading the window

### Skill Not Recognized

1. Ensure your project has `metadata.yaml` files with skill definitions
2. The skill must be defined in a `.guidance` or `.jinja` file in the project
3. Check spelling - skill names are case-sensitive

### After Extension Update

If issues persist after updating:
1. Uninstall the extension
2. Close all VS Code windows
3. Reinstall from the new VSIX file
4. Reload the window

## Development

### Building from Source

```bash
cd vscode-extension
npm install
npm run build
npm run package
```

This creates `newo-dsl-X.X.X.vsix` in the extension directory.

## Requirements

- VS Code 1.74.0 or higher (or compatible editor like Cursor)
- Node.js 16+ (for development only)

## License

MIT
