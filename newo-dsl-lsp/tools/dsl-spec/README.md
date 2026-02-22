# @newo-dsl/spec-generator

Schema generator that extracts skill, event, attribute, and flow definitions from the Newo SuperAgent codebase.

## Usage

```bash
# Generate schemas (requires NEWO_ROOT or ../newo directory)
npm run generate

# Or from the monorepo root
npm run generate:schemas
```

## Configuration

The generator looks for the Newo codebase in this order:

1. `NEWO_ROOT` environment variable
2. `../newo` relative to the monorepo root
3. `../../newo` relative to the tools directory

```bash
# Use a custom path
NEWO_ROOT=/path/to/newo npm run generate
```

## Generated Files

| File | Description | Count |
|------|-------------|-------|
| `skills.schema.yaml` | Template skill definitions with parameters | ~1,218 |
| `events.schema.yaml` | System event definitions | ~186 |
| `attributes.schema.yaml` | Customer and persona attributes | ~314 |
| `flows.schema.yaml` | Agent flow definitions | ~59 |
| `actions.schema.yaml` | Built-in action reference | 76 |

## Schema Format

### skills.schema.yaml

```yaml
skills:
  - idn: SkillName
    title: Human Readable Title
    runner_type: jinja  # or guidance
    path: AgentName/FlowName
    parameters:
      - name: param_name
        type: string
        required: true
        default_value: ""
        description: Parameter description
```

### events.schema.yaml

```yaml
events:
  - idn: event_name
    title: Event Title
    category: system
    source: AgentName
```

## Development

The generator is a plain Node.js script (no build step required):

```bash
# Run directly
node generate.js

# Run with debug output
DEBUG=1 node generate.js
```

## License

Proprietary - [Newo AI](https://newo.ai). All rights reserved.
