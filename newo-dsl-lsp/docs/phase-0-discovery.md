# Phase 0: Repository Reconnaissance - Discovery Summary

## Executive Summary

The Newo SuperAgent codebase implements a sophisticated Domain-Specific Language (DSL) called **NSL (Newo Skill Language)** for building conversational AI agents. The ecosystem consists of 2,522 files across 13 agents with 51 flows and 750+ skills.

---

## 1. DSL Touchpoints Inventory

### 1.1 Template Files

| Type | Count | Location Pattern | Purpose |
|------|-------|------------------|---------|
| `.jinja` | 613 | `*/SkillName/SkillName.jinja` | Procedural logic, data transformation |
| `.guidance` | 605 | `*/SkillName/SkillName.guidance` | LLM prompts, system instructions |
| `metadata.yaml` | 1,296 | Every directory level | Configuration, parameters |
| `flows.yaml` | 1 | `newo_customers/default/projects/` | Central orchestration (13K lines) |

### 1.2 Directory Structure

```
newo/
├── .env                                    # Environment config
├── .newo/default/                          # Runtime cache
│   ├── hashes.json                        # File integrity
│   ├── map.json                           # ID registry (critical!)
│   ├── tokens.json                        # Auth tokens
│   └── attributes-map.json                # Attribute mappings
└── newo_customers/default/projects/
    ├── flows.yaml                         # Global orchestration
    └── naf/                               # Main framework
        ├── ConvoAgent/                    # 33+ flows
        ├── TaskManager/                   # 2 flows
        ├── AgentCreator/
        ├── ApifyCheckAvailabilityWorker/
        ├── EmailWorker/
        ├── SmsWorker/
        ├── GeneralManagerAgent/
        ├── MagicWorker/
        ├── MultiLocationAgent/
        ├── ScenarioWriter/
        ├── SuperAgentProject/
        └── TestAgent/
```

---

## 2. Template Language Analysis

### 2.1 Jinja Templates (`.jinja`)

**Syntax**: Extended Jinja2 with custom functions

```jinja
{% set triggered_act = GetTriggeredAct() %}
{% set payload = triggered_act["arguments"]["payload"] %}
{% set errors = [] %}

{# Validation pattern #}
{% for attribute_name in check_attributes %}
   {% if not GetCustomerAttribute(field=attribute_name).strip() %}
       {% set _ = errors.append("Error: " ~ attribute_name) %}
   {% endif %}
{% endfor %}

{% if errors %}
   {{DUMMY("Error: " ~ json.dumps(errors))}}
   {{Return()}}
{% endif %}

{{_checkAvailabilitySkill(parameters=payload)}}
```

**Key Constructs**:
- `{% set var = value %}` - Variable assignment
- `{% if/elif/else/endif %}` - Conditionals
- `{% for item in iterable %}` - Loops
- `{{FunctionCall(params)}}` - Custom function invocation
- `{# comment #}` - Comments
- `{{!-- comment --}}` - Alternative comment syntax

### 2.2 Guidance Templates (`.guidance`)

**Syntax**: Handlebars-like with LLM-specific blocks

```guidance
{{Set(name="time_zone", value=utils_get_time_zone(user_id=user_id))}}
{{Set(name="current_date", value=GetDatetime(format="date", timezone=time_zone))}}

{{#system~}}
<ConversationMeta>
conversation.timezone: {{time_zone}}
conversation.day_of_week: {{current_week_day}}
</ConversationMeta>
{{~/system}}

{{#if condition}}
  {{skill_call()}}
{{/if}}

{{Return(val=GetCurrentPrompt())}}
```

**Key Constructs**:
- `{{Set(name="var", value=expr)}}` - Variable assignment
- `{{#system~}} ... {{~/system}}` - LLM system prompt block
- `{{#if cond}} ... {{else}} ... {{/if}}` - Conditionals
- `{{~}}` - Whitespace control
- `{{Return(val=output)}}` - Return value

---

## 3. Custom Functions/Skills Registry

### 3.1 Core Built-in Functions

**Control Flow**:
| Function | Signature | Purpose |
|----------|-----------|---------|
| `Return` | `Return(val=output)` | Exit skill with value |
| `Set` | `Set(name="var", value=expr)` | Set variable |
| `GetTriggeredAct` | `GetTriggeredAct()` | Get triggering event |
| `GetCurrentPrompt` | `GetCurrentPrompt()` | Get LLM prompt context |
| `DUMMY` | `DUMMY(value)` | No-op logging |

**Attribute Management**:
| Function | Signature | Purpose |
|----------|-----------|---------|
| `GetCustomerAttribute` | `GetCustomerAttribute(field="name")` | Get customer attr |
| `SetCustomerAttribute` | `SetCustomerAttribute(field="name", value=val)` | Set customer attr |
| `GetPersonaAttribute` | `GetPersonaAttribute(field="name")` | Get persona attr |
| `SetPersonaAttribute` | `SetPersonaAttribute(field="name", value=val)` | Set persona attr |

**System Integration**:
| Function | Signature | Purpose |
|----------|-----------|---------|
| `SendSystemEvent` | `SendSystemEvent(eventIdn="...", data={})` | Trigger event |
| `SendCommand` | `SendCommand(command="...", data={})` | Send command |
| `SendMessage` | `SendMessage(text="...", channel="...")` | Send message |
| `CreateConnector` | `CreateConnector(...)` | Create connector |

**Data & Utilities**:
| Function | Signature | Purpose |
|----------|-----------|---------|
| `GetDatetime` | `GetDatetime(format="...", timezone="...")` | Get datetime |
| `GetValueJSON` | `GetValueJSON(obj, key)` | Extract JSON value |
| `IsEmpty` | `IsEmpty(text="...")` | Check emptiness |
| `Stringify` | `Stringify(value)` | Convert to string |
| `Concat` | `Concat(a, b, ...)` | String concatenation |

**Standard Library (json module)**:
- `json.loads(string)` - Parse JSON
- `json.dumps(object)` - Serialize JSON

### 3.2 Skill Naming Conventions

| Pattern | Example | Purpose |
|---------|---------|---------|
| `PascalCaseSkill` | `CheckAvailabilitySkill` | Public skill |
| `_camelCaseSkill` | `_checkAvailabilitySkill` | Private helper |
| `_utilsNameSkill` | `_utilsGetTimeZoneSkill` | Utility function |
| `*SchemaSkill` | `_sendDialpadDigitsSchemaSkill` | Data schema |
| `*ToolSkill` | `SendEmailToolSkill` | External integration |
| `Result*Skill` | `ResultSuccessSkill` | Result handler |

---

## 4. Event System

### 4.1 Event Structure (from flows.yaml)

```yaml
events:
  - idn: event_identifier
    title: null
    skill_selector: skill_idn    # or state_idn
    skill_idn: TargetSkillName
    state_idn: null
    integration_idn: system      # system | api | http
    connector_idn: system
    interrupt_mode: queue        # queue | immediate | batch
```

### 4.2 Event Patterns

- **Skill-based routing**: `skill_selector: skill_idn` → direct skill execution
- **State-based routing**: `skill_selector: state_idn` → conditional execution
- **Interrupt modes**: queue (default), immediate (priority), batch (grouped)

---

## 5. Flow Configuration Model

### 5.1 Flow Structure (flows.yaml)

```yaml
flows:
  - agent_idn: ConvoAgent
    agent_description: null
    agent_flows:
      - idn: CAMainFlow
        title: CAMainFlow
        default_runner_type: nsl
        default_provider_idn: openai
        default_model_idn: gpt4o
        skills:
          - idn: SkillName
            title: SkillName
            runner_type: nsl
            model:
              provider_idn: openai
              model_idn: gpt4o
            parameters:
              - name: param1
                default_value: ""
        events:
          - idn: event_name
            skill_selector: skill_idn
            skill_idn: SkillName
```

### 5.2 Configuration Hierarchy

```
Project → Agent → Flow → Skill
   ↓         ↓       ↓       ↓
metadata  metadata metadata metadata
                    ↓       ↓
              flows.yaml  .jinja/.guidance
```

---

## 6. Attribute System

### 6.1 Attribute Categories

| Prefix | Scope | Example |
|--------|-------|---------|
| `project_*` | Project-level | `project_business_name` |
| `project_business_*` | Business info | `project_business_address` |
| `project_attributes_*` | Custom attrs | `project_attributes_booking_url` |
| `project_representative_agent_*` | Agent config | `project_representative_agent_name` |
| `calcom_*` | Integration | `calcom_api_key` |
| `project_attributes_private_*` | Internal | `project_attributes_private_state` |

### 6.2 Attribute Access Pattern

```jinja
{# Read #}
{% set value = GetCustomerAttribute(field="project_business_name") %}

{# Write #}
{{SetCustomerAttribute(field="project_status", value="active")}}

{# Persona-specific #}
{% set persona = GetPersonaAttribute(field="persona_name") %}
{{SetPersonaAttribute(field="persona_mood", value="friendly")}}
```

---

## 7. Skill Definition Pattern

### 7.1 Directory Structure

```
SkillName/
├── SkillName.jinja      # Required: execution logic
├── SkillName.guidance   # Optional: LLM instructions
└── metadata.yaml        # Required: configuration
```

### 7.2 Metadata Schema

```yaml
id: "uuid-string"
idn: "SkillName"
title: "Human Readable Title"
runner_type: nsl           # nsl | system | api
model:
  provider_idn: openai     # openai | anthropic
  model_idn: gpt4o         # gpt4o | gpt-4-turbo | claude-3
parameters:
  - name: parameter_name
    default_value: ""
path: ""
```

---

## 8. Runtime Infrastructure

### 8.1 Cache Files (.newo/default/)

| File | Purpose | Usage |
|------|---------|-------|
| `map.json` | ID → metadata mapping | Fast skill lookup |
| `attributes-map.json` | Attribute name → UUID | Attribute resolution |
| `hashes.json` | File content hashes | Change detection |
| `tokens.json` | Auth tokens | API authentication |

### 8.2 Validation Patterns Found

**In-template validation**:
```jinja
{% set errors = [] %}
{% for attr in required_attrs %}
   {% if not GetCustomerAttribute(field=attr).strip() %}
       {% set _ = errors.append("Missing: " ~ attr) %}
   {% endif %}
{% endfor %}
{% if errors %}
   {{Return()}}
{% endif %}
```

**No explicit linting/static analysis found** - all validation is runtime.

---

## 9. LSP Development Implications

### 9.1 Language Features to Support

| Feature | .jinja | .guidance | Priority |
|---------|--------|-----------|----------|
| Syntax highlighting | ✓ | ✓ | High |
| Function completion | ✓ | ✓ | High |
| Parameter hints | ✓ | ✓ | High |
| Skill reference validation | ✓ | ✓ | High |
| Attribute name completion | ✓ | ✓ | Medium |
| Event name validation | - | - | Medium |
| Go-to definition (skills) | ✓ | ✓ | Medium |
| YAML flow validation | - | - | Medium |

### 9.2 Diagnostic Categories

1. **Syntax errors**: Invalid Jinja/Guidance syntax
2. **Unknown functions**: Undefined built-in calls
3. **Unknown skills**: Reference to non-existent skills
4. **Parameter errors**: Missing required, unknown params
5. **Attribute errors**: Undefined attribute names
6. **Type mismatches**: Incompatible types (if inferable)

### 9.3 Schema Requirements

| Schema | Content | Source |
|--------|---------|--------|
| `skills.schema.yaml` | All skills with params | Scan `*/metadata.yaml` |
| `builtins.schema.yaml` | Core functions | Document from code analysis |
| `events.schema.yaml` | Event definitions | Parse `flows.yaml` |
| `flows.schema.yaml` | Flow structure | Parse `flows.yaml` |
| `attributes.schema.yaml` | Known attributes | Parse `attributes-map.json` |

---

## 10. Next Steps (Phase 1)

1. **Extract Skills Schema**: Scan all `metadata.yaml` files
2. **Document Built-ins**: Create complete function reference
3. **Parse Events**: Extract event definitions from `flows.yaml`
4. **Define Attributes**: Map all known attribute names
5. **Create JSON Schemas**: Machine-readable validation schemas
6. **Build Generators**: Scripts to keep schemas in sync

---

## Appendix A: File Statistics

```
Total Files:           2,522
├── .jinja:              613
├── .guidance:           605
├── metadata.yaml:     1,296
├── flows.yaml:            1
└── Other:                 7

Agents:                   13
Flows:                    51
Skills:                 750+
Attributes:             100+
Built-in Functions:      30+
```

## Appendix B: Key File Paths

```
# Main orchestration
newo/newo_customers/default/projects/flows.yaml

# Runtime cache
newo/.newo/default/map.json
newo/.newo/default/attributes-map.json

# Primary agent (ConvoAgent)
newo/newo_customers/default/projects/naf/ConvoAgent/

# Example skill
newo/newo_customers/default/projects/naf/ConvoAgent/CAMainFlow/CheckAvailabilitySkill/
```
