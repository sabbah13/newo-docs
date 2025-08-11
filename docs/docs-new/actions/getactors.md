---
sidebar_position: 5
title: "GetActors"
description: "Retrieve actor information for multi-channel communication"
---

# GetActors

Retrieve actor IDs for targeting specific communication channels, users, or personas. Essential for multi-channel messaging and actor management.

## Syntax

```newo
GetActors(
  personaId: str = None,
  integrationIdn: str = None,
  connectorIdn: str = None,
  externalId: str = None,
  timeZone: str = None
)
```

## Parameters

All parameters are optional filters. When no parameters provided, returns current conversation actors.

- **`personaId`** (string): Filter by specific persona/user ID
- **`integrationIdn`** (string): Filter by integration type (`vapi`, `twilio_messenger`, `email`, etc.)
- **`connectorIdn`** (string): Filter by specific connector instance
- **`externalId`** (string): Filter by external identifier (phone, email, username)
- **`timeZone`** (string): Filter by timezone (e.g., `"America/Los_Angeles"`)

## How It Works

1. **Query Construction**: Builds filter criteria from provided parameters
2. **Actor Lookup**: Searches actor database with filters
3. **Result Compilation**: Returns matching actor ID list
4. **Caching**: Optimizes repeated queries with session caching

## Filter Precedence

When multiple filters are provided:
1. `filterByActorIds` overrides all other filters
2. `personaId` + `integrationIdn` + `connectorIdn` for specific channel
3. `externalId` + `integrationIdn` for cross-persona lookup
4. Individual filters combine with AND logic

## Basic Usage Examples

### Current Conversation Actors
```newo
{{!-- Get all actors in current conversation --}}
{{Set(name="current_actors", value=GetActors())}}
{{SendMessage(
  message="Thank you for contacting us!",
  actorIds=current_actors
)}}
```

### Channel-Specific Targeting
```newo
{{!-- Send SMS to all text message actors --}}
{{Set(name="sms_actors", value=GetActors(integrationIdn="twilio_messenger"))}}
{{SendMessage(
  message="Quick update: Your appointment is confirmed!",
  actorIds=sms_actors
)}}

{{!-- Send voice message to phone actors --}}
{{Set(name="voice_actors", value=GetActors(integrationIdn="vapi"))}}
{{SendMessage(
  message="Please hold while I check your booking details.",
  actorIds=voice_actors
)}}
```

### User-Specific Actors
```newo
{{!-- Get all communication channels for current user --}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{Set(name="user_actors", value=GetActors(personaId=user_id))}}

{{!-- Send to preferred channel only --}}
{{Set(name="preferred_channel", value=GetPersonaAttribute(
  id=user_id,
  field="preferred_communication"
))}}

{{Set(name="preferred_actors", value=GetActors(
  personaId=user_id,
  integrationIdn=preferred_channel
))}}
```

## Advanced Filtering

### Multi-Criteria Filtering
```newo
{{!-- Get specific user's SMS actors --}}
{{Set(name="customer_sms", value=GetActors(
  personaId=GetPersonaAttribute(id=GetUser(field="id"), field="customer_id"),
  integrationIdn="twilio_messenger",
  connectorIdn="main_sms_connector"
))}}

{{!-- Get actors by external ID (email/phone) --}}
{{Set(name="email_actors", value=GetActors(
  externalId="customer@example.com",
  integrationIdn="email",
  connectorIdn="gmail_connector"
))}}
```

### Timezone-Based Filtering
```newo
{{!-- Send timezone-appropriate messages --}}
{{Set(name="east_coast_actors", value=GetActors(
  timeZone="America/New_York"
))}}

{{Set(name="west_coast_actors", value=GetActors(
  timeZone="America/Los_Angeles"
))}}

{{!-- Send different messages based on local time --}}
{{Set(name="current_hour", value=GetDateTime(format="hour"))}}

{{#if IsSimilar(text1=current_hour, text2="morning")}}
  {{SendMessage(
    message="Good morning! Ready to start your day?",
    actorIds=east_coast_actors
  )}}
{{/if}}
```

## Integration Patterns

### Voice + SMS Fallback
```newo
{{!-- Try voice first, fallback to SMS --}}
{{Set(name="voice_actors", value=GetActors(
  personaId=GetUser(field="id"),
  integrationIdn="vapi"
))}}

{{#if IsEmpty(text=Stringify(voice_actors))}}
  {{!-- No voice channel, use SMS --}}
  {{Set(name="sms_actors", value=GetActors(
    personaId=GetUser(field="id"),
    integrationIdn="twilio_messenger"
  ))}}
  
  {{SendMessage(
    message="I tried calling but couldn't reach you. Here's your confirmation: " + booking_details,
    actorIds=sms_actors
  )}}
{{else}}
  {{!-- Voice available, make call --}}
  {{SendCommand(
    commandIdn="make_call",
    integrationIdn="vapi",
    connectorIdn="voice_connector",
    phoneNumber=GetActors(field="externalId"),
    message=voice_message
  )}}
{{/if}}
```

### Multi-Channel Broadcasting
```newo
{{!-- Send urgent message to all available channels --}}
{{Set(name="user_id", value=GetUser(field="id"))}}

{{!-- Get all channel types --}}
{{Set(name="sms_actors", value=GetActors(
  personaId=user_id,
  integrationIdn="twilio_messenger"
))}}

{{Set(name="email_actors", value=GetActors(
  personaId=user_id,
  integrationIdn="email"
))}}

{{Set(name="chat_actors", value=GetActors(
  personaId=user_id,
  integrationIdn="newo_chat"
))}}

{{!-- Send to available channels --}}
{{#if not IsEmpty(text=Stringify(sms_actors))}}
  {{SendMessage(
    message="URGENT: Your appointment has been moved to 3 PM today.",
    actorIds=sms_actors,
    priority="high"
  )}}
{{/if}}

{{#if not IsEmpty(text=Stringify(email_actors))}}
  {{SendMessage(
    message="Important Schedule Change - Please Review",
    actorIds=email_actors,
    priority="high",
    subject="Appointment Rescheduled"
  )}}
{{/if}}
```

## Actor Management Workflows

### Dynamic Actor Creation
```newo
{{!-- Check if SMS actor exists, create if needed --}}
{{Set(name="phone_number", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="phone"
))}}

{{Set(name="existing_sms", value=GetActors(
  externalId=phone_number,
  integrationIdn="twilio_messenger"
))}}

{{#if IsEmpty(text=Stringify(existing_sms))}}
  {{!-- Create new SMS actor --}}
  {{Set(name="new_sms_actor", value=CreateActor(
    integrationIdn="twilio_messenger",
    connectorIdn="sms_connector",
    externalId=phone_number,
    personaId=GetUser(field="id"),
    timeZone=GetPersonaAttribute(id=GetUser(field="id"), field="timezone")
  ))}}
  {{Set(name="target_actors", value=[new_sms_actor])}}
{{else}}
  {{Set(name="target_actors", value=existing_sms)}}
{{/if}}

{{SendMessage(
  message="SMS channel ready for communication!",
  actorIds=target_actors
)}}
```

### Channel Availability Check
```newo
{{!-- Check which channels are available for user --}}
{{Set(name="user_id", value=GetUser(field="id"))}}

{{Set(name="available_channels", value=CreateArray())}}

{{#if not IsEmpty(text=Stringify(GetActors(personaId=user_id, integrationIdn="twilio_messenger")))}}
  {{Set(name="available_channels", value=AppendItemsArrayJSON(
    array=available_channels,
    items=["SMS"]
  ))}}
{{/if}}

{{#if not IsEmpty(text=Stringify(GetActors(personaId=user_id, integrationIdn="email")))}}
  {{Set(name="available_channels", value=AppendItemsArrayJSON(
    array=available_channels,
    items=["Email"]
  ))}}
{{/if}}

{{#if not IsEmpty(text=Stringify(GetActors(personaId=user_id, integrationIdn="vapi")))}}
  {{Set(name="available_channels", value=AppendItemsArrayJSON(
    array=available_channels,
    items=["Voice"]
  ))}}
{{/if}}

{{SetPersonaAttribute(
  id=user_id,
  field="available_channels",
  value=Stringify(available_channels)
)}}
```

## Debugging and Monitoring

### Actor Diagnostics
```newo
{{!-- Debug actor configuration --}}
{{Set(name="all_actors", value=GetActors())}}
{{Set(name="actor_count", value=Len(array=all_actors))}}

{{SendSystemEvent(
  eventIdn="actor_diagnostics",
  total_actors=actor_count,
  actor_details=Stringify(all_actors),
  timestamp=GetDateTime()
)}}

{{!-- Check specific integration status --}}
{{Set(name="integration_actors", value=GetActors(integrationIdn="twilio_messenger"))}}
{{#if IsEmpty(text=Stringify(integration_actors))}}
  {{SendSystemEvent(
    eventIdn="integration_issue",
    integration="twilio_messenger",
    status="no_actors_found"
  )}}
{{/if}}
```

### Performance Monitoring
```newo
{{!-- Track actor query performance --}}
{{Set(name="start_time", value=GetDateTime(format="timestamp"))}}
{{Set(name="actors", value=GetActors(complex_query=true))}}
{{Set(name="end_time", value=GetDateTime(format="timestamp"))}}

{{SendCommand(
  commandIdn="log_performance",
  integrationIdn="monitoring",
  connectorIdn="metrics_collector",
  operation="get_actors",
  duration=GetDateInterval(start=start_time, end=end_time),
  result_count=Len(array=actors)
)}}
```

## Limitations

- **Query Performance**: Complex filters may impact response time
- **Actor Lifecycle**: Returns only currently active actors
- **Cross-Persona Access**: Limited by permissions and scope
- **Real-Time Updates**: May not reflect immediate actor state changes
- **Result Size**: Large result sets may impact memory usage

## Troubleshooting

### No Actors Found
```newo
{{Set(name="actors", value=GetActors(integrationIdn="required_integration"))}}
{{#if IsEmpty(text=Stringify(actors))}}
  {{SendSystemEvent(
    eventIdn="no_actors_error",
    integration="required_integration",
    user_id=GetUser(field="id"),
    suggestion="check_connector_configuration"
  )}}
{{/if}}
```

### Actor Validation
```newo
{{!-- Validate actor accessibility --}}
{{Set(name="test_actors", value=GetActors())}}
{{SendMessage(
  message="Connection test",
  actorIds=test_actors,
  test_mode="true"
)}}
```

## Related Actions

- **action** - Create new communication actors
- **action** - Get single actor information
- **action** - Use actors for messaging
- **action** - Get persona information for filtering
- **action** - Access recent message source