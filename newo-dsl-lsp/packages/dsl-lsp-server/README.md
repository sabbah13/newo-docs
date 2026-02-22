# @newo-dsl/lsp-server

Language Server Protocol implementation for Newo DSL templates. Provides real-time IDE features for `.jinja` and `.guidance` files.

## LSP Features

| Feature | Description |
|---------|-------------|
| **Diagnostics** | Real-time validation of action calls, parameter checking, syntax errors, undefined/unused variables |
| **Completions** | IntelliSense for 76 built-in actions, 81 Jinja built-ins, project skills, variables, and object properties |
| **Variable Intelligence** | Completions, hover, go-to-definition, and diagnostics for template variables |
| **Object Property Completions** | Dot-access completions for typed objects (e.g., `user.name` after `GetUser()`) |
| **Type Inference** | Automatic type inference from 40+ action return types across 12 object shapes |
| **Attribute Discovery** | Autocomplete for attribute field names discovered from project templates |
| **Hover** | Detailed documentation with syntax, parameters, examples, variable info, and property descriptions |
| **Go-to-Definition** | Navigate to skill files, action definitions, variable assignments, and metadata files |
| **Typo Suggestions** | "Did you mean?" suggestions for misspelled function and variable names |
| **Quick-Fixes** | Code actions to fix typos, add missing parameters |
| **Parameter Hints** | Completion of parameter names with required/optional indicators and default values |
| **Literal Value Tracking** | Hover shows tracked literal values and branch-merged possible values |

## Built-in Actions (72)

Organized by category:

| Category | Actions |
|----------|---------|
| **Messaging** | `SendMessage`, `SendCommand`, `SendSystemEvent`, `SendTypingStart`, `SendTypingStop` |
| **Variables & State** | `Set`, `GetState`, `SetState` |
| **Customer/Project** | `GetCustomerAttribute`, `SetCustomerAttribute`, `SetCustomerMetadataAttribute`, `GetCustomerMetadataAttribute`, `GetProjectAttribute`, `SetProjectAttribute`, `SetProjectMetadataAttribute`, `DeleteCustomerAttribute` |
| **Connectors** | `GetConnectorInfo`, `CreateConnector`, `DeleteConnector`, `SetConnectorInfo` |
| **Persona & Actors** | `CreatePersona`, `CreateActor`, `GetPersonaAttribute`, `SetPersonaAttribute`, `GetAgentPersona`, `GetActors`, `GetActor` |
| **AI Generation** | `Gen`, `GenStream` |
| **User** | `GetUser`, `UpdateUser` |
| **Flow Control** | `Return`, `DUMMY`, `Do`, `Sleep`, `StartNotInterruptibleBlock`, `StopNotInterruptibleBlock`, `DisableFollowUp`, `EnableFollowUp` |
| **String** | `Concat`, `Stringify` |
| **Conditional** | `IsEmpty`, `IsSimilar`, `IsGlobal` |
| **JSON** | `GetValueJSON`, `UpdateValueJSON`, `CreateArray`, `GetIndexesOfItemsArrayJSON`, `AppendItemsArrayJSON`, `AsStringJSON`, `GetItemsArrayByIndexesJSON` |
| **DateTime** | `GetDateTime`, `GetDatetime`, `GetDateInterval` |
| **Knowledge Base** | `SearchFuzzyAkb`, `DeleteAkb`, `UpdateAkb`, `SetManualAkb` |
| **Agents & Customers** | `GetAgent`, `GetCustomerInfo`, `GetCustomer`, `SetCustomerInfo` |
| **Webhooks** | `GetWebhook`, `CreateWebhook`, `DeleteWebhook` |
| **Acts** | `GetAct`, `CreateMessageAct` |
| **Memory & Context** | `GetMemory`, `GetTriggeredAct`, `GetCurrentPrompt`, `GetSessionInfo` |
| **Utility** | `GetRandomChoice` |

## Skill Discovery

The server automatically discovers project skills by scanning workspace directories for `.jinja` and `.guidance` files. It also reads `metadata.yaml` files to extract parameter information for skill completions and validation.

Search paths include:
- Current workspace root
- `newo_customers/` directory
- `project/` directory
- Parent directories following Newo project conventions

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `newo-dsl.schemasPath` | string | `""` | Path to DSL schemas directory |
| `newo-dsl.enableDiagnostics` | boolean | `true` | Enable diagnostic reporting |
| `newo-dsl.enableCompletions` | boolean | `true` | Enable code completions |
| `newo-dsl.enableHover` | boolean | `true` | Enable hover information |

## Running Standalone

```bash
# Start with stdio transport
node dist/server.js --stdio

# Or use the bin entry
npx newo-lsp --stdio
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run watch

# Run tests
npm test
```

## License

Proprietary - [Newo AI](https://newo.ai). All rights reserved.
