---
sidebar_position: 67
title: "SetPersonaAttribute"
description: "Set persona-specific attribute values"
---

# SetPersonaAttribute

Set or update a specific attribute value on a persona. Personas are user or agent profiles that store custom attributes, preferences, and metadata.

## Syntax

```newo
SetPersonaAttribute(
  id: str,
  field: str,
  value: any
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Persona ID (typically userId) |
| `field` | string | Yes | Attribute field name to set |
| `value` | any | Yes | Value to store |

## Returns

- **void** - No return value

## Basic Usage

### Set User Status
```newo
{{!-- Set working hours status --}}
{{SetPersonaAttribute(
  id=userId,
  field="working_hours_status",
  value=working_hours_status
)}}

{{SendMessage(message="Working hours status updated.")}}
```

### Store Actor Reference
```newo
{{!-- Save last conversation actor ID --}}
{{SetPersonaAttribute(
  id=userId,
  field="last_convo_actor_id",
  value=current_actor_id
)}}
```

## Common Use Cases

### Track Integration Type
```newo
{{!-- Store current integration being used --}}
{{SetPersonaAttribute(
  id=userId,
  field="current_integration_idn",
  value=current_integration_idn
)}}
```

### Mark Voicemail Processed
```newo
{{!-- Mark voicemail as checked --}}
{{SetPersonaAttribute(
  id=userId,
  field="voicemail_checked",
  value="True"
)}}

{{SetPersonaAttribute(
  id=userId,
  field="voicemail_detected",
  value="True"
)}}

{{SendMessage(message="Voicemail processing complete.")}}
```

### Store Agent Thoughts
```newo
{{!-- Save agent's internal reasoning --}}
{{SetPersonaAttribute(
  id=userId,
  field="convoagent_thoughts",
  value=convoagent_thoughts
)}}
```

### Dynamic Field Names
```newo
{{!-- Create dynamic field with prefix --}}
{{Set(name="prefix", value="task_")}}
{{Set(name="field_name", value=Concat(prefix, "footnote_actor_id"))}}

{{SetPersonaAttribute(
  id=userId,
  field=field_name,
  value=footnote_actor_id
)}}
```

## Advanced Patterns

### Conditional Attribute Updates
```newo
{{!-- Only update if value changed --}}
{{Set(name="current_status", value=GetPersonaAttribute(
  id=userId,
  field="working_hours_status"
))}}

{{#if not IsSimilar(val1=current_status, val2=new_status)}}
  {{SetPersonaAttribute(
    id=userId,
    field="working_hours_status",
    value=new_status
  )}}
  {{SendMessage(message="Status updated.")}}
{{else}}
  {{SendMessage(message="Status unchanged.")}}
{{/if}}
```

### Batch Attribute Updates
```newo
{{!-- Update multiple persona attributes --}}
{{SetPersonaAttribute(
  id=userId,
  field="working_hours_status",
  value=working_hours_status
)}}

{{SetPersonaAttribute(
  id=userId,
  field="current_integration_idn",
  value="newo_voice"
)}}

{{SetPersonaAttribute(
  id=userId,
  field="last_convo_actor_id",
  value=actor_id
)}}

{{SendSystemEvent(
  eventIdn="persona_updated",
  userId=userId,
  timestamp=GetDateTime()
)}}
```

### Store Complex Data
```newo
{{!-- Store conversation metadata as JSON string --}}
{{Set(name="meta", value={
  "topic": conversation_topic,
  "sentiment": detected_sentiment,
  "timestamp": GetDateTime()
})}}

{{SetPersonaAttribute(
  id=userId,
  field="conversation_meta",
  value=AsStringJSON(val=meta)
)}}
```

### Reset Attribute
```newo
{{!-- Clear an attribute value --}}
{{SetPersonaAttribute(
  id=userId,
  field="pending_task",
  value=""
)}}
```

## Use with Footnote Actors
```newo
{{!-- Store footnote actor for tracking --}}
{{Set(name="prefix", value="daily_")}}
{{Set(name="footnote_field", value=Concat(prefix, "footnote_actor_id"))}}

{{!-- Create or get existing footnote actor --}}
{{Set(name="existing", value=GetPersonaAttribute(
  id=userId,
  field=footnote_field
))}}

{{#if IsEmpty(text=existing)}}
  {{!-- Create new footnote actor and store --}}
  {{Set(name="new_actor", value=CreateActor(
    integrationIdn="system",
    connectorIdn=Concat(prefix, "footnote"),
    externalId=external_id,
    personaId=userId
  ))}}

  {{SetPersonaAttribute(
    id=userId,
    field=footnote_field,
    value=new_actor
  )}}
{{/if}}
```

## Common Attribute Fields

| Field | Description |
|-------|-------------|
| `working_hours_status` | Current working hours availability |
| `last_convo_actor_id` | Actor ID from last conversation |
| `voicemail_checked` | Voicemail processing flag |
| `voicemail_detected` | Voicemail detection flag |
| `current_integration_idn` | Current integration type |
| `convoagent_thoughts` | Agent reasoning/thoughts |
| `{prefix}_footnote_actor_id` | Dynamic footnote actor references |

## Error Handling

```newo
{{!-- Validate before setting --}}
{{#if not IsEmpty(text=userId)}}
  {{SetPersonaAttribute(
    id=userId,
    field="preference",
    value=user_preference
  )}}
  {{SendMessage(message="Preference saved.")}}
{{else}}
  {{SendMessage(message="Error: User not identified.")}}
  {{SendSystemEvent(
    eventIdn="persona_attribute_error",
    error="missing_user_id"
  )}}
{{/if}}
```

## Related Actions

- [**GetPersonaAttribute**](./getpersonaattribute) - Get persona attribute values
- [**GetAgentPersona**](./getagentpersona) - Get agent's persona configuration
- [**UpdateUser**](./updateuser) - Update user profile fields
- [**SetCustomerAttribute**](./setcustomerattribute) - Set customer-level attributes
