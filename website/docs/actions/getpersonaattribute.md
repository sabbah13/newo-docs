---
sidebar_position: 66
title: "GetPersonaAttribute"
description: "Retrieve persona-specific attribute values"
---

# GetPersonaAttribute

Retrieve a specific attribute value from a persona. Personas are user or agent profiles that store custom attributes, preferences, and metadata.

## Syntax

```newo
GetPersonaAttribute(
  id: str,
  field: str
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Persona ID (typically userId) |
| `field` | string | Yes | Attribute field name to retrieve |

## Returns

- **string** - The attribute value
- **empty** - If attribute doesn't exist

## Basic Usage

### Get User Preference
```newo
{{!-- Get a user's working hours status --}}
{{Set(name="status", value=GetPersonaAttribute(
  id=userId,
  field="working_hours_status"
))}}

{{SendMessage(message=Concat("Working hours status: ", status))}}
```

### Get Custom User Data
```newo
{{!-- Retrieve custom user information --}}
{{Set(name="user_notes", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="custom_user_data"
))}}

{{#if not IsEmpty(text=user_notes)}}
  {{SendMessage(message=Concat("Your saved notes: ", user_notes))}}
{{/if}}
```

## Common Use Cases

### Track Last Call Information
```newo
{{!-- Get last call timestamp --}}
{{Set(name="last_call", value=GetPersonaAttribute(
  id=userId,
  field="last_call_ended_datetime_utc"
))}}

{{#if not IsEmpty(text=last_call)}}
  {{SendMessage(message=Concat("Your last call was at: ", last_call))}}
{{/if}}
```

### Check Voicemail Status
```newo
{{!-- Check if voicemail was already checked --}}
{{Set(name="voicemail_checked", value=GetPersonaAttribute(
  id=userId,
  field="voicemail_checked"
))}}

{{#if IsSimilar(val1=voicemail_checked, val2="True")}}
  {{SendMessage(message="Voicemail already processed.")}}
{{else}}
  {{SendMessage(message="Checking voicemail...")}}
{{/if}}
```

### Access Actor Information
```newo
{{!-- Get user's last conversation actor --}}
{{Set(name="last_actor", value=GetPersonaAttribute(
  id=userId,
  field="last_convo_actor_id"
))}}

{{SendMessage(
  message="Continuing from your last conversation...",
  actorIds=[last_actor]
)}}
```

### Retrieve Integration Settings
```newo
{{!-- Get current integration type --}}
{{Set(name="integration", value=GetPersonaAttribute(
  id=userId,
  field="current_integration_idn"
))}}

{{#if IsSimilar(val1=integration, val2="newo_voice")}}
  {{!-- Voice-specific handling --}}
  {{SendMessage(message="Voice call in progress")}}
{{/if}}
```

## Advanced Patterns

### Dynamic Field Access
```newo
{{!-- Build dynamic field name --}}
{{Set(name="prefix", value="task_")}}
{{Set(name="field_name", value=Concat(prefix, "footnote_actor_id"))}}

{{Set(name="footnote_actor", value=GetPersonaAttribute(
  id=userId,
  field=field_name
))}}
```

### Conditional Processing Based on Persona State
```newo
{{!-- Check multiple persona attributes --}}
{{Set(name="rag_data", value=GetPersonaAttribute(id=userId, field="rag"))}}
{{Set(name="memories", value=GetPersonaAttribute(id=userId, field="memories"))}}
{{Set(name="thoughts", value=GetPersonaAttribute(id=userId, field="convoagent_thoughts"))}}

{{#if not IsEmpty(text=rag_data)}}
  {{!-- Use RAG data for response --}}
  {{Set(name="context", value=rag_data)}}
{{else}}
  {{!-- Use memories as fallback --}}
  {{Set(name="context", value=memories)}}
{{/if}}
```

### Access Conversation Metadata
```newo
{{!-- Get conversation metadata for analysis --}}
{{Set(name="meta", value=GetPersonaAttribute(
  id=userId,
  field="conversation_meta"
))}}

{{SendSystemEvent(
  eventIdn="conversation_analysis",
  metadata=meta
)}}
```

## Common Attribute Fields

| Field | Description |
|-------|-------------|
| `working_hours_status` | Current working hours availability status |
| `last_call_ended_datetime_utc` | Timestamp of last call ending |
| `last_convo_actor_id` | Actor ID from last conversation |
| `voicemail_checked` | Whether voicemail was processed |
| `voicemail_detected` | Whether voicemail was detected |
| `current_integration_idn` | Current integration being used |
| `custom_user_data` | Custom user information |
| `convoagent_thoughts` | Agent's internal thoughts/reasoning |
| `memories` | Stored user memories |
| `rag` | RAG (Retrieval Augmented Generation) data |
| `conversation_meta` | Conversation metadata |
| `_private_dynamic_user_information` | Dynamic user info (private) |

## Error Handling

```newo
{{!-- Handle missing attribute gracefully --}}
{{Set(name="attribute_value", value=GetPersonaAttribute(
  id=userId,
  field="optional_field"
))}}

{{#if IsEmpty(text=attribute_value)}}
  {{SendMessage(message="Setting up your profile...")}}
  {{SetPersonaAttribute(
    id=userId,
    field="optional_field",
    value="default_value"
  )}}
{{else}}
  {{SendMessage(message=Concat("Found: ", attribute_value))}}
{{/if}}
```

## Related Actions

- [**SetPersonaAttribute**](./setpersonaattribute) - Set persona attribute values
- [**GetAgentPersona**](./getagentpersona) - Get agent's persona configuration
- [**GetUser**](./getuser) - Get current user information
- [**GetCustomerAttribute**](./getcustomerattribute) - Get customer-level attributes
