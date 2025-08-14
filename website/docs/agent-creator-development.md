---
slug: agent-creator-development
sidebar_position: 19
title: "Agent Creator Development Guide"
description: "Complete developer guide for customizing, extending, and building upon the Newo Agent Creator system"
---

# Agent Creator Development Guide

This comprehensive guide provides developers with everything needed to understand, customize, and extend the Newo Agent Creator system. Whether you're modifying existing flows or building new capabilities, this guide covers all technical aspects and best practices.

## Development Architecture Overview

The Agent Creator follows a **modular, template-driven architecture** that provides multiple extension points for customization:

```mermaid
graph TB
    subgraph "Development Stack"
        subgraph "Business Logic Layer"
            YAML[flows.yaml<br/>Flow Definitions]
            JINJA[Jinja2 Templates<br/>Skill Implementation]
            JSON[JSON Configuration<br/>Stage & Prompt Setup]
        end
        
        subgraph "Runtime Layer"
            FLOWS[Flow Execution Engine]
            EVENTS[Event System]
            STATE[State Management]
            QUEUE[Queue Processing]
        end
        
        subgraph "Integration Layer"
            AI[AI Model Integration]
            APIS[External API Connectors]
            WEBHOOKS[Webhook Management]
            NOTIFICATIONS[Communication Services]
        end
    end
    
    YAML --> FLOWS
    JINJA --> FLOWS
    JSON --> FLOWS
    
    FLOWS --> EVENTS
    EVENTS --> STATE
    STATE --> QUEUE
    
    QUEUE --> AI
    AI --> APIS
    APIS --> WEBHOOKS
    WEBHOOKS --> NOTIFICATIONS
```

## Core Components Deep Dive

### Flow Definition Structure

All agent flows are defined in `flows.yaml` using a hierarchical structure:

```yaml
flows:
  - agent_idn: Creator
    agent_flows:
      - idn: CACreatorFlow
        title: Main Creator Flow
        default_runner_type: "!enum \"RunnerType.guidance\""
        default_provider_idn: openai
        default_model_idn: gpt4o
        skills:
          - idn: GetData
            prompt_script: flows/CACreatorFlow/GetData.jinja
            runner_type: "!enum \"RunnerType.nsl\""
            model:
              model_idn: gpt4o
              provider_idn: openai
            parameters: []
        events:
          - idn: onboarding_started
            skill_selector: "!enum \"SkillSelector.skill_idn\""
            skill_idn: GetData
            integration_idn: newo_chat
            connector_idn: newo_chat
        state_fields:
          - idn: task_queue
            default_value: "[]"
            scope: "!enum \"StateFieldScope.user\""
```

#### Key Configuration Elements:

**Flow Properties:**
- `agent_idn`: Unique agent identifier
- `default_runner_type`: Execution engine (guidance/nsl)
- `default_provider_idn`: AI provider (openai)
- `default_model_idn`: Default AI model

**Skill Properties:**
- `idn`: Unique skill identifier
- `prompt_script`: Path to Jinja2 template
- `runner_type`: Execution mode
- `model`: AI model configuration
- `parameters`: Input parameters with defaults

**Event Properties:**
- `idn`: Event identifier
- `skill_selector`: Skill selection method
- `skill_idn`: Target skill
- `integration_idn`: External integration
- `connector_idn`: Connector type

### Jinja2 Template Development

Skills are implemented as Jinja2 templates with access to the Newo SuperAgent runtime API:

#### Template Structure

```jinja2
{# Skill: GetData - Initialize customer onboarding #}
{% set user_id = GetUser().id|string %}

{# Extract and validate input parameters #}
{% set triggered_act_arguments = GetTriggeredAct().arguments %}
{% set source = triggered_act_arguments.source_url|string|trim %}
{% set source_type = triggered_act_arguments.source_type|string %}

{# Set default values #}
{% if source_type|trim == "" %}
    {% set source_type = "website" %}
{% endif %}

{# Normalize URL format #}
{% if source_type == "website" and not source.startswith("http") %}
    {% set source = "https://" ~ source %}
{% endif %}

{# Store data in persona attributes #}
{{ SetPersonaAttribute(id=user_id, field="source", value=source) }}
{{ SetPersonaAttribute(id=user_id, field="source_type", value=source_type) }}

{# Trigger downstream processing #}
{% set scraper_type = "google_place" if source_type == "google_map" else "website" %}
{{SendSystemEvent(
    eventIdn="scraping_worker_message", 
    command="set_scraping_data", 
    url=source, 
    scraper_type=scraper_type
)}}

{# Execute next stage #}
{{ _run_stage_0() }}
```

#### Available Runtime Functions

**User & Context Functions:**
- `GetUser()`: Current user information
- `GetActor()`: Current actor context
- `GetTriggeredAct()`: Event trigger data
- `GetPersonaAttribute(id, field)`: Retrieve user data
- `SetPersonaAttribute(id, field, value)`: Store user data
- `UpdateUser(field, value)`: Update user record

**State Management:**
- `GetState()`: Current flow state
- `SetState(value)`: Update flow state
- `GetMemory()`: Persistent memory
- `GetSettingsAttribute(field)`: System configuration

**Communication Functions:**
- `SendCommand()`: External service commands
- `SendSystemEvent()`: Internal event triggers
- `SendMessage()`: User messaging

**Utility Functions:**
- `Return(val)`: Return value from skill
- `Do(actionName, ...)`: Execute another skill
- `json.loads()`, `json.dumps()`: JSON processing
- `DUMMY(value)`: Debug output

### State Management System

The system uses **persona attributes** for persistent state management:

#### State Structure

```json
{
  "user_persona_attributes": {
    "source": "https://example.com",
    "source_type": "website",
    "scraper_type": "website", 
    "state": "parsing",
    "business_info": "{\"name\": \"Example Corp\", \"industry\": \"Technology\"}",
    "agent_info": "{\"name\": \"Alex\", \"title\": \"Assistant\"}",
    "customer_info": "{\"name\": \"John Doe\", \"email\": \"john@example.com\"}",
    "contact_info": "{\"phone\": \"+1234567890\", \"address\": \"123 Main St\"}",
    "preferences_info": "{\"language\": \"en\", \"voice_model\": \"nova\"}"
  },
  "flow_state_fields": {
    "task_queue": "[]"
  }
}
```

#### State Access Patterns

**Reading State:**
```jinja2
{% set user_id = GetUser().id|string %}
{% set business_data = GetPersonaAttribute(id=user_id, field="business_info") %}
{% set business_info = json.loads(business_data) %}
{% set company_name = business_info.name %}
```

**Writing State:**
```jinja2
{% set updated_info = {"name": "New Company", "industry": "Finance"} %}
{{ SetPersonaAttribute(id=user_id, field="business_info", value=json.dumps(updated_info)) }}
```

**Queue Management:**
```jinja2
{# Add task to queue #}
{% set task = {"question": "What services do you offer?", "model": "business_info"} %}
{{ _enqueue(queue_name="task_queue", item=json.dumps(task)) }}

{# Process task from queue #}
{% set next_task = _dequeue(queue_name="task_queue") %}
```

## AI Model Integration

### Model Selection Strategy

The system supports multiple OpenAI models with intelligent selection:

```jinja2
{# Dynamic model selection based on task requirements #}
{% set llm_model = task.llm_model|default("auto", true) %}

{% if json_schema != "" %}
    {% set selected_model = "openai/gpt4o_structured_output" %}
{% elif requires_search %}
    {% set selected_model = "openai/gpt4o_search_preview" %}
{% elif complex_reasoning %}
    {% set selected_model = "openai/o3_latest" %}
{% elif validation_task %}
    {% set selected_model = "openai/o1_latest" %}
{% else %}
    {% set selected_model = "openai/gpt4o" %}
{% endif %}
```

### Custom AI Processing Skills

#### Answer Generation Template

```jinja2
{# _gen_answer_custom.jinja - Custom AI processing skill #}
{% set context_prompt = GetPersonaAttribute(id=user_id, field="scraping_data") %}

{% set enhanced_prompt = "
CONTEXT: " ~ context_prompt ~ "

TASK: " ~ question ~ "

REQUIREMENTS:
- Provide accurate, specific information
- Use professional business language  
- If information is not available, respond with 'N/A'
- Keep response concise but complete

RESPONSE:
" %}

{# Execute AI model with custom prompt #}
{{ Return(val=Gen(prompt=enhanced_prompt, model="gpt4o")) }}
```

#### Validation Skill Template

```jinja2
{# _validate_custom.jinja - Custom validation logic #}
{% set validation_prompt = "
Validate this business information for accuracy and completeness:

QUESTION: " ~ question ~ "
ANSWER: " ~ answer ~ "
CONTEXT: " ~ scraping_prompt ~ "

Validation criteria:
1. Is the answer factually accurate?
2. Is it relevant to the question?
3. Is it appropriately formatted?
4. Does it contain any obvious errors?

Provide validation result as JSON:
{
  \"valid\": true/false,
  \"confidence\": 0.0-1.0,
  \"issues\": [\"list of any issues found\"],
  \"corrected_answer\": \"corrected version if needed\"
}
" %}

{% set validation_result = Gen(prompt=validation_prompt, model="o1_latest") %}
{% set result = json.loads(validation_result) %}

{% if result.valid %}
    {{ Return(val=answer) }}
{% else %}
    {{ Return(val=result.corrected_answer|default("", true)) }}
{% endif %}
```

## Creating Custom Flows

### New Flow Definition

1. **Define Flow in flows.yaml:**

```yaml
- idn: CustomBusinessFlow
  title: Custom Business Onboarding
  default_runner_type: "!enum \"RunnerType.guidance\""
  default_provider_idn: openai
  default_model_idn: gpt4o
  skills:
    - idn: InitializeCustomFlow
      prompt_script: flows/CustomBusinessFlow/InitializeCustomFlow.jinja
      parameters:
        - name: business_type
          default_value: "general"
    - idn: ProcessCustomData
      prompt_script: flows/CustomBusinessFlow/ProcessCustomData.jinja
  events:
    - idn: custom_business_started
      skill_selector: "!enum \"SkillSelector.skill_idn\""
      skill_idn: InitializeCustomFlow
      integration_idn: custom_api
      connector_idn: business_connector
```

2. **Implement Flow Skills:**

Create `flows/CustomBusinessFlow/InitializeCustomFlow.jinja`:

```jinja2
{# Custom business flow initialization #}
{% set user_id = GetUser().id|string %}
{% set args = GetTriggeredAct().arguments %}

{# Extract business-specific parameters #}
{% set business_type = args.business_type|default("general", true) %}
{% set industry_focus = args.industry_focus|default("", true) %}

{# Initialize custom state #}
{{ SetPersonaAttribute(id=user_id, field="custom_business_type", value=business_type) }}
{{ SetPersonaAttribute(id=user_id, field="custom_industry", value=industry_focus) }}
{{ SetPersonaAttribute(id=user_id, field="custom_state", value="initialized") }}

{# Trigger custom processing #}
{{SendSystemEvent(
    eventIdn="custom_processing_started",
    business_type=business_type,
    industry=industry_focus
)}}

{# Execute custom data processing #}
{{ ProcessCustomData() }}
```

### Stage Configuration System

The system supports configurable stages defined in JSON:

#### Stage Configuration Template

```json
{
  "stage_config": {
    "stage_0": {
      "name": "Business Discovery",
      "steps": [
        {
          "field_name": "company_name",
          "model_name": "business_info",
          "prompt_attribute": "company_name_prompt",
          "llm_model": "auto",
          "validation_skill": "_validate_company_name",
          "json_schema": "",
          "is_hidden": "false",
          "title": "Company Name"
        },
        {
          "field_name": "industry",
          "model_name": "business_info", 
          "prompt_attribute": "industry_classification_prompt",
          "llm_model": "openai/gpt4o_structured_output",
          "validation_skill": "_validate_industry",
          "json_schema": "industry_schema",
          "is_hidden": "false", 
          "title": "Industry Classification"
        }
      ]
    }
  }
}
```

#### Dynamic Stage Execution

```jinja2
{# _run_custom_stage.jinja - Dynamic stage processor #}
{% set stage_config = GetSettingsAttribute(field="custom_stage_config") %}
{% set config = json.loads(stage_config) %}
{% set stage_data = config[stage_name] %}

{% for step in stage_data.steps %}
    {% set question_prompt = GetSettingsAttribute(field=step.prompt_attribute) %}
    {% set enhanced_prompt = _build_custom_prompt(
        prompt=question_prompt,
        context=step,
        stage=stage_name
    ) %}
    
    {{SendSystemEvent(
        eventIdn="custom_question_processing",
        stage=stage_name,
        step=step,
        prompt=enhanced_prompt
    )}}
{% endfor %}
```

## External Integration Development

### Custom Connector Implementation

#### Webhook Integration

```jinja2
{# Custom webhook integration skill #}
{% set webhook_url = GetSettingsAttribute(field="custom_webhook_url") %}
{% set api_key = GetSettingsAttribute(field="custom_api_key") %}

{% set payload = {
    "customer_id": GetUser().id,
    "business_name": _get_value_business_name(),
    "industry": _get_value_industry(),
    "agent_config": {
        "name": _get_value_agent_name(),
        "voice_model": _get_value_voice_model(),
        "language": _get_value_language()
    },
    "timestamp": GetDateTime()
} %}

{% set headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " ~ api_key,
    "X-Source": "newo-agent-creator"
} %}

{{SendCommand(
    commandIdn="send_request",
    integrationIdn="http", 
    connectorIdn="custom_webhook",
    method="POST",
    url=webhook_url,
    headers=json.dumps(headers),
    body=json.dumps(payload)
)}}
```

#### CRM Integration Template

```jinja2
{# Custom CRM integration #}
{% set crm_config = GetSettingsAttribute(field="custom_crm_config") %}
{% set config = json.loads(crm_config) %}

{% set lead_data = {
    "contact": {
        "first_name": _get_value_customer_first_name(),
        "last_name": GetPersonaAttribute(id=user_id, field="input_customer_name"),
        "email": GetPersonaAttribute(id=user_id, field="input_customer_email"),
        "phone": GetPersonaAttribute(id=user_id, field="input_customer_phone")
    },
    "company": {
        "name": _get_value_business_name(),
        "website": _get_value_business_website(),
        "industry": _get_value_industry(),
        "address": _get_value_business_address()
    },
    "agent_config": {
        "agent_name": _get_value_agent_name(),
        "agent_title": _get_value_agent_title(),
        "voice_model": _get_value_voice_model(),
        "phone_number": GetPersonaAttribute(id=user_id, field="customer_agent_phone_number")
    },
    "source": "newo_agent_creator",
    "created_at": GetDateTime()
} %}

{{SendCommand(
    commandIdn="create_lead",
    integrationIdn="api",
    connectorIdn="custom_crm",
    endpoint=config.lead_endpoint,
    api_key=config.api_key,
    data=json.dumps(lead_data)
)}}
```

## Advanced Customization Patterns

### Industry-Specific Templates

Create specialized onboarding flows for different industries:

#### Healthcare Industry Template

```jinja2
{# Healthcare-specific business information extraction #}
{% set healthcare_prompts = {
    "specialties": "What medical specialties does this practice offer?",
    "certifications": "List any medical certifications or accreditations.",
    "insurance": "What insurance plans are accepted?", 
    "hours": "What are the office hours and availability?",
    "telehealth": "Do you offer telehealth or remote consultation services?"
} %}

{% for field, prompt in healthcare_prompts.items() %}
    {% set enhanced_prompt = "
MEDICAL PRACTICE ANALYSIS

Website/Business Data: " ~ scraping_data ~ "

Question: " ~ prompt ~ "

Requirements:
- Extract accurate medical practice information
- Ensure HIPAA compliance considerations
- Use professional medical terminology
- If information unavailable, respond 'N/A'

Response:" %}
    
    {{_queue_healthcare_question(field=field, prompt=enhanced_prompt)}}
{% endfor %}
```

#### E-commerce Industry Template

```jinja2
{# E-commerce specific data extraction #}
{% set ecommerce_prompts = {
    "products": "What products or product categories are sold?",
    "shipping": "What shipping options and policies are available?",
    "returns": "What is the return or refund policy?",
    "payment_methods": "What payment methods are accepted?",
    "customer_service": "What customer service channels are available?"
} %}

{% set ecommerce_schema = {
    "type": "object",
    "properties": {
        "product_categories": {"type": "array", "items": {"type": "string"}},
        "shipping_options": {"type": "array", "items": {"type": "string"}},
        "return_policy_days": {"type": "integer"},
        "payment_methods": {"type": "array", "items": {"type": "string"}}
    }
} %}

{# Process with structured output for e-commerce data #}
{% for field, prompt in ecommerce_prompts.items() %}
    {{_queue_structured_question(
        field=field, 
        prompt=prompt,
        schema=ecommerce_schema,
        model="openai/gpt4o_structured_output"
    )}}
{% endfor %}
```

### Multi-Language Support

Implement localized onboarding flows:

```jinja2
{# Multi-language template processing #}
{% set user_language = GetPersonaAttribute(id=user_id, field="preferred_language")|default("en", true) %}
{% set localization_config = GetSettingsAttribute(field="localization_settings") %}
{% set locales = json.loads(localization_config) %}

{% if user_language in locales %}
    {% set language_prompts = locales[user_language] %}
    {% set cultural_context = language_prompts.cultural_context %}
    {% set business_terms = language_prompts.business_terminology %}
    
    {# Adjust prompts for cultural context #}
    {% set localized_prompt = cultural_context ~ "
    
    " ~ base_prompt ~ "
    
    Business Context: " ~ business_terms %}
    
    {{_process_localized_question(
        prompt=localized_prompt,
        language=user_language,
        cultural_adaptations=cultural_context
    )}}
{% endif %}
```

## Testing & Debugging

### Development Testing Skills

Create specialized testing skills for development:

```jinja2
{# TestCustomFlow.jinja - Development testing skill #}
{% set test_scenarios = [
    {
        "name": "basic_website_scraping",
        "input": {"source": "https://example.com", "source_type": "website"},
        "expected_fields": ["business_name", "industry", "contact_info"]
    },
    {
        "name": "google_maps_integration", 
        "input": {"source": "https://maps.google.com/place/xyz", "source_type": "google_map"},
        "expected_fields": ["business_name", "address", "phone", "hours"]
    }
] %}

{% for scenario in test_scenarios %}
    {{ DUMMY("Testing scenario: " ~ scenario.name) }}
    
    {# Execute test scenario #}
    {% set test_result = _execute_test_scenario(scenario) %}
    
    {# Validate results #}
    {% set validation = _validate_test_results(test_result, scenario.expected_fields) %}
    
    {{ DUMMY("Test result: " ~ validation.status ~ " - " ~ validation.message) }}
{% endfor %}
```

### Debug Output Utilities

```jinja2
{# Debug utilities for development #}
{% set debug_enabled = GetSettingsAttribute(field="debug_mode")|default("false", true) %}

{% if debug_enabled == "true" %}
    {{ DUMMY("=== DEBUG INFO ===") }}
    {{ DUMMY("User ID: " ~ GetUser().id) }}
    {{ DUMMY("Current State: " ~ GetPersonaAttribute(id=user_id, field="state")) }}
    {{ DUMMY("Stage: " ~ current_stage) }}
    {{ DUMMY("Queue Length: " ~ _get_queue_length("task_queue")) }}
    {{ DUMMY("================") }}
{% endif %}
```

## Performance Optimization

### Template Caching

```jinja2
{# Template caching for performance #}
{% set cache_key = "prompt_template_" ~ prompt_name ~ "_" ~ user_language %}
{% set cached_template = GetPersonaAttribute(id="system", field=cache_key) %}

{% if cached_template == "" %}
    {% set template_content = GetSettingsAttribute(field=prompt_name) %}
    {% set processed_template = _process_template(template_content, user_language) %}
    
    {# Cache for future use #}
    {{ SetPersonaAttribute(id="system", field=cache_key, value=processed_template) }}
    {% set final_template = processed_template %}
{% else %}
    {% set final_template = cached_template %}
{% endif %}
```

### Batch Processing

```jinja2
{# Batch processing for efficiency #}
{% set batch_size = GetSettingsAttribute(field="ai_batch_size")|int %}
{% set pending_questions = _get_all_queued_questions("task_queue") %}

{# Group questions for batch processing #}
{% set batches = _create_batches(pending_questions, batch_size) %}

{% for batch in batches %}
    {% set batch_prompt = _build_batch_prompt(batch) %}
    {% set batch_responses = Gen(prompt=batch_prompt, model="gpt4o") %}
    {% set parsed_responses = _parse_batch_responses(batch_responses) %}
    
    {# Process each response in the batch #}
    {% for response in parsed_responses %}
        {{_store_batch_response(response)}}
    {% endfor %}
{% endfor %}
```

---

This development guide provides comprehensive coverage of the Agent Creator system's architecture, customization options, and best practices. Use it as a foundation for building sophisticated, AI-powered customer onboarding and agent creation solutions.