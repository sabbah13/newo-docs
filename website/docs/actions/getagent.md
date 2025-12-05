---
sidebar_position: 52
title: "GetAgent"
description: "Get agent information including persona ID and configuration"
---

# GetAgent

Retrieve agent information including persona ID, configuration settings, and other agent properties. This action is essential for multi-agent workflows and agent-specific logic.

## Syntax

```newo
GetAgent(
  idn: str = None,
  field: str = None
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idn` | string | No | Agent identifier (e.g., "ConvoAgent", "TaskManager"). If not provided, returns current agent info |
| `field` | string | No | Specific field to retrieve (e.g., "personaId", "name", "config") |

## Returns

- **object** - Full agent information object when no field specified
- **string** - Specific field value when field parameter is provided

## How It Works

1. **Agent Lookup**: Locates the agent by its identifier
2. **Field Resolution**: If field specified, extracts that specific property
3. **Data Return**: Returns the requested agent information

## Basic Usage

### Get Agent Persona ID
```newo
{{!-- Retrieve the persona ID for an agent --}}
{{Set(name="agent_persona", value=GetAgent(idn="ConvoAgent", field="personaId"))}}

{{SendMessage(message=Concat("Agent persona: ", agent_persona))}}
```

### Get Full Agent Info
```newo
{{!-- Get all agent information --}}
{{Set(name="agent_info", value=GetAgent(idn="TaskManager"))}}

{{Set(name="agent_name", value=GetValueJSON(json=agent_info, key="name"))}}
```

## Common Use Cases

### Multi-Agent Coordination
```newo
{{!-- Coordinate between multiple agents --}}
{{Set(name="convo_agent", value=GetAgent(idn="ConvoAgent"))}}
{{Set(name="task_agent", value=GetAgent(idn="TaskManager"))}}

{{SendSystemEvent(
  eventIdn="task_assignment",
  fromAgent=GetAgent(idn="ConvoAgent", field="personaId"),
  toAgent=GetAgent(idn="TaskManager", field="personaId"),
  taskData=current_task
)}}
```

### Agent-Specific Routing
```newo
{{!-- Route to appropriate agent based on context --}}
{{Set(name="target_agent_id", value=GetAgent(idn=target_agent_name, field="personaId"))}}

{{SendCommand(
  commandIdn="route_conversation",
  targetPersonaId=target_agent_id,
  context=conversation_context
)}}
```

### Agent Configuration Access
```newo
{{!-- Access agent-specific configuration --}}
{{Set(name="agent_config", value=GetAgent(idn="ConvoAgent", field="config"))}}

{{Set(name="max_retries", value=GetValueJSON(json=agent_config, key="maxRetries"))}}
{{Set(name="timeout", value=GetValueJSON(json=agent_config, key="timeout"))}}
```

## Advanced Patterns

### Dynamic Agent Selection
```newo
{{!-- Select agent based on task type --}}
{{Set(name="task_type", value=GetState(name="current_task_type"))}}

{{#if IsSimilar(text1=task_type, text2="scheduling")}}
  {{Set(name="handler_agent", value=GetAgent(idn="SchedulerAgent", field="personaId"))}}
{{else if IsSimilar(text1=task_type, text2="support")}}
  {{Set(name="handler_agent", value=GetAgent(idn="SupportAgent", field="personaId"))}}
{{else}}
  {{Set(name="handler_agent", value=GetAgent(idn="ConvoAgent", field="personaId"))}}
{{/if}}

{{SendSystemEvent(
  eventIdn="route_to_agent",
  targetAgent=handler_agent,
  taskContext=task_context
)}}
```

### Agent Capability Check
```newo
{{!-- Check if agent has specific capabilities --}}
{{Set(name="agent_info", value=GetAgent(idn="MagicWorker"))}}
{{Set(name="agent_capabilities", value=GetValueJSON(json=agent_info, key="capabilities"))}}

{{#if IsSimilar(text1=agent_capabilities, text2="scheduling")}}
  {{SendMessage(message="This agent can handle scheduling tasks.")}}
{{/if}}
```

### Cross-Agent Communication
```newo
{{!-- Send message to specific agent --}}
{{Set(name="target_persona", value=GetAgent(idn="GeneralManagerAgent", field="personaId"))}}

{{SendSystemEvent(
  eventIdn="inter_agent_message",
  targetPersonaId=target_persona,
  message="Escalation required",
  priority="high",
  sourceAgent=GetAgent(idn="ConvoAgent", field="personaId")
)}}
```

## Integration Patterns

### Agent Handoff
```newo
{{!-- Hand off conversation to specialized agent --}}
{{Set(name="specialist_agent", value=GetAgent(idn="TechnicalSupportAgent"))}}
{{Set(name="specialist_id", value=GetValueJSON(json=specialist_agent, key="personaId"))}}

{{!-- Transfer context --}}
{{SetState(name="handoff_context", value={
  "previousAgent": GetAgent(idn="ConvoAgent", field="personaId"),
  "conversationHistory": GetMemory(count="10"),
  "customerIntent": GetState(name="detected_intent")
})}}

{{SendSystemEvent(
  eventIdn="agent_handoff",
  toAgent=specialist_id,
  context=GetState(name="handoff_context")
)}}

{{SendMessage(message="I'm connecting you with a specialist who can better assist you.")}}
```

### Agent Status Monitoring
```newo
{{!-- Check agent availability --}}
{{Set(name="agents_to_check", value=CreateArray("ConvoAgent", "TaskManager", "SupportAgent"))}}

{% for agent_name in agents_to_check %}
  {{Set(name="agent_data", value=GetAgent(idn=agent_name))}}
  {{Set(name="agent_status", value=GetValueJSON(json=agent_data, key="status"))}}

  {{#if not IsSimilar(text1=agent_status, text2="active")}}
    {{SendSystemEvent(
      eventIdn="agent_status_alert",
      agentName=agent_name,
      status=agent_status
    )}}
  {{/if}}
{% endfor %}
```

## Best Practices

### 1. Cache Agent Lookups
```newo
{{!-- Cache agent info for repeated use --}}
{{Set(name="cached_agent_persona", value=GetAgent(idn="ConvoAgent", field="personaId"))}}

{{!-- Use cached value multiple times --}}
{{SendSystemEvent(eventIdn="event1", agentId=cached_agent_persona)}}
{{SendSystemEvent(eventIdn="event2", agentId=cached_agent_persona)}}
```

### 2. Validate Agent Existence
```newo
{{!-- Check if agent exists before using --}}
{{Set(name="agent_info", value=GetAgent(idn=dynamic_agent_name))}}

{{#if not IsEmpty(text=agent_info)}}
  {{!-- Safe to use agent --}}
  {{Set(name="agent_id", value=GetValueJSON(json=agent_info, key="personaId"))}}
{{else}}
  {{!-- Fallback to default agent --}}
  {{Set(name="agent_id", value=GetAgent(idn="ConvoAgent", field="personaId"))}}
{{/if}}
```

### 3. Use Consistent Agent Identifiers
```newo
{{!-- Define agent constants for consistency --}}
{{Set(name="CONVO_AGENT", value="ConvoAgent")}}
{{Set(name="TASK_MANAGER", value="TaskManager")}}
{{Set(name="SUPPORT_AGENT", value="SupportAgent")}}

{{!-- Use constants throughout --}}
{{Set(name="main_agent_id", value=GetAgent(idn=CONVO_AGENT, field="personaId"))}}
```

## Limitations

- **Agent Availability**: Returns null/empty if agent doesn't exist
- **Configuration Access**: Some config fields may be restricted
- **Real-time Status**: Agent status may not reflect real-time availability

## Related Actions

- [**GetAct**](./getact) - Get act/action information
- [**GetActors**](./getactors) - Get communication channel actors
- [**CreateActor**](./createactor) - Create new actors
- [**SendSystemEvent**](./sendsystemevent) - Inter-agent communication
- [**GetAgentPersona**](./getagentpersona) - Get persona details
