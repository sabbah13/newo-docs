---
sidebar_position: 30
title: "GetActor"
description: "Retrieve information about specific communication channel actors"
---

# GetActor

Retrieves detailed information about a specific communication channel actor by ID. Used to access actor metadata, channel details, and targeting information.

## Syntax

```newo
GetActor(
  id: str
)
```

## Parameters

### Required Parameters

- **`id`** (string): Unique identifier of the actor to retrieve

## Return Values

- **Actor object**: JSON string containing actor information
- **Empty string**: Actor not found or invalid ID
- **Actor fields**: id, externalId, integrationIdn, connectorIdn, personaId, metadata

## How It Works

1. **ID Lookup**: Searches for actor with specified ID
2. **Data Retrieval**: Fetches complete actor information
3. **JSON Response**: Returns actor data as JSON string
4. **Error Handling**: Returns empty string if actor not found

## Use Cases

### Basic Actor Information
```newo
{{!-- Get specific actor details --}}
{{Set(name="actor_id", value="actor_123")}}
{{Set(name="actor_info", value=GetActor(id=actor_id))}}
{{SendMessage(message=Concat("Actor info: ", actor_info))}}
```

### Channel Validation
```newo
{{!-- Verify actor exists before sending --}}
{{Set(name="target_actor", value="sms_actor_456")}}
{{Set(name="actor_data", value=GetActor(id=target_actor))}}
{{#if IsEmpty(text=actor_data)}}
  {{SendMessage(message="Communication channel not available")}}
{{else}}
  {{SendMessage(message="Sending to verified channel", actorIds=[target_actor])}}
{{/if}}
```

### Actor Metadata Access
```newo
{{!-- Extract specific actor properties --}}
{{Set(name="actor_info", value=GetActor(id="email_actor_789"))}}
{{Set(name="integration_type", value=GetValueJSON(obj=actor_info, key="integrationIdn"))}}
{{Set(name="external_id", value=GetValueJSON(obj=actor_info, key="externalId"))}}

{{SendMessage(message=Concat(
  "Channel: ", integration_type,
  " - Contact: ", external_id
))}}
```

## Advanced Patterns

### Dynamic Actor Selection
```newo
{{!-- Choose actor based on user preference --}}
{{Set(name="preferred_channel", value=GetState(name="contact_preference"))}}
{{Set(name="all_actors", value=GetActors())}}

{{!-- Loop through actors to find preferred type --}}
{{Set(name="selected_actor", value="")}}
{{#if IsSimilar(text1=preferred_channel, text2="email")}}
  {{Set(name="selected_actor", value="user_email_actor")}}
{{else}}
  {{Set(name="selected_actor", value="user_sms_actor")}}
{{/if}}

{{Set(name="actor_details", value=GetActor(id=selected_actor))}}
{{#if IsEmpty(text=actor_details)}}
  {{SendMessage(message="Preferred communication channel not available")}}
{{else}}
  {{SendMessage(message="Using your preferred contact method")}}
{{/if}}
```

### Actor Health Check
```newo
{{!-- Verify multiple actors are available --}}
{{Set(name="critical_actors", value=["sms_primary", "email_backup", "push_notification"])}}
{{Set(name="healthy_actors", value="")}}
{{Set(name="failed_actors", value="")}}

{{!-- Check each critical actor --}}
{{Set(name="sms_check", value=GetActor(id="sms_primary"))}}
{{#if IsEmpty(text=sms_check)}}
  {{Set(name="failed_actors", value=Concat(failed_actors, "SMS "))}}
{{else}}
  {{Set(name="healthy_actors", value=Concat(healthy_actors, "SMS "))}}
{{/if}}

{{SendMessage(message=Concat(
  "Healthy channels: ", healthy_actors,
  " - Unavailable: ", failed_actors
))}}
```

### Integration-Specific Logic
```newo
{{!-- Different handling per integration type --}}
{{Set(name="actor_data", value=GetActor(id=targetActorId))}}
{{Set(name="integration", value=GetValueJSON(obj=actor_data, key="integrationIdn"))}}

{{#if IsSimilar(text1=integration, text2="twilio_messenger")}}
  {{SendMessage(
    message="📱 SMS: Your appointment is confirmed!",
    actorIds=[targetActorId]
  )}}
{{else}}
  {{#if IsSimilar(text1=integration, text2="email")}}
    {{SendMessage(
      message="📧 Email: Detailed appointment information attached",
      actorIds=[targetActorId],
      subject="Appointment Confirmation"
    )}}
  {{else}}
    {{SendMessage(
      message="Your appointment is confirmed!",
      actorIds=[targetActorId]
    )}}
  {{/if}}
{{/if}}
```

## Integration Examples

### With User Management
```newo
{{!-- Get user's primary communication actor --}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{Set(name="user_actors", value=GetActors(personaId=user_id))}}
{{Set(name="primary_actor_id", value=GetValueJSON(obj=user_actors, key="0"))}}
{{Set(name="primary_actor", value=GetActor(id=primary_actor_id))}}

{{SendMessage(message=Concat(
  "Your primary contact method: ",
  GetValueJSON(obj=primary_actor, key="integrationIdn")
))}}
```

### With State Management
```newo
{{!-- Store actor information in state --}}
{{Set(name="preferred_actor", value=GetActor(id="user_preferred_channel"))}}
{{SetState(name="last_used_actor", value=preferred_actor)}}

{{!-- Later retrieval --}}
{{Set(name="stored_actor", value=GetState(name="last_used_actor"))}}
{{Set(name="stored_id", value=GetValueJSON(obj=stored_actor, key="id"))}}
```

### With Error Logging
```newo
{{!-- Log actor information for debugging --}}
{{Set(name="problem_actor", value=GetActor(id=failedActorId))}}
{{#if IsEmpty(text=problem_actor)}}
  {{SendSystemEvent(
    eventIdn="actor_not_found",
    actorId=failedActorId,
    context="message_send_failure"
  )}}
{{else}}
  {{SendSystemEvent(
    eventIdn="actor_info",
    actorData=problem_actor,
    context="debugging"
  )}}
{{/if}}
```

## Actor Data Structure

Typical actor JSON structure returned by GetActor:

```json
{
  "id": "actor_123",
  "externalId": "user@example.com", 
  "integrationIdn": "email",
  "connectorIdn": "gmail",
  "personaId": "user_456",
  "metadata": {
    "channel_type": "email",
    "verified": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Field Descriptions

- **`id`**: Unique actor identifier within Newo system
- **`externalId`**: External system identifier (email, phone, etc.)
- **`integrationIdn`**: Integration type (twilio_messenger, email, vapi, etc.)
- **`connectorIdn`**: Specific connector within integration
- **`personaId`**: Associated user/persona ID
- **`metadata`**: Additional channel-specific information

## Error Handling

### Invalid Actor ID
```newo
{{!-- Handle non-existent actors gracefully --}}
{{Set(name="actor_id", value="potentially_invalid_id")}}
{{Set(name="actor_check", value=GetActor(id=actor_id))}}
{{#if IsEmpty(text=actor_check)}}
  {{SendMessage(message="Communication channel unavailable. Please update your contact information.")}}
  {{SendSystemEvent(eventIdn="invalid_actor_id", actorId=actor_id)}}
{{else}}
  {{SendMessage(message="Channel verified and ready for communication")}}
{{/if}}
```

### Fallback Channels
```newo
{{!-- Try multiple channels in order of preference --}}
{{Set(name="primary_actor", value=GetActor(id="primary_channel"))}}
{{#if IsEmpty(text=primary_actor)}}
  {{Set(name="backup_actor", value=GetActor(id="backup_channel"))}}
  {{#if IsEmpty(text=backup_actor)}}
    {{SendMessage(message="All communication channels unavailable")}}
  {{else}}
    {{SendMessage(message="Using backup communication channel", actorIds=["backup_channel"])}}
  {{/if}}
{{else}}
  {{SendMessage(message="Using primary communication channel", actorIds=["primary_channel"])}}
{{/if}}
```

## Limitations

- **Single Actor**: Only retrieves one actor per call
- **JSON Parsing**: Requires JSON functions to access nested data
- **Real-time Status**: May not reflect immediate channel status changes
- **Permission Dependent**: Access limited by user permissions and actor ownership
- **Integration Specific**: Actor fields vary by integration type

## Related Actions

- [**GetActors**](./getactors) - Retrieve multiple actors
- [**CreateActor**](./createactor) - Create new communication channels
- [**SendMessage**](./sendmessage) - Send messages to actors
- [**GetValueJSON**](./getvaluejson) - Parse actor data

## Performance Tips

- **Cache Actor Data**: Store frequently accessed actor information
- **Batch Validations**: Group actor checks when possible
- **Use Specific IDs**: Avoid unnecessary actor lookups
- **Error Handling**: Always validate actor existence before use