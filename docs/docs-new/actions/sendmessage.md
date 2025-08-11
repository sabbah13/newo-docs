---
sidebar_position: 1
title: "SendMessage"
description: "Send direct messages to specific actors and users"
---

# SendMessage

Send direct messages to specific actors across all communication channels (SMS, email, chat, voice, etc.).

## Syntax

```newo
SendMessage(
  message: str,
  actorIds: List[str] = GetActors(),
  useFilter: bool = false,
  **arguments: str
)
```

## Parameters

### Required Parameters

- **`message`** (string): The message content to send
- **`actorIds`** (List[str]): Target actor IDs. Defaults to `GetActors()` (current conversation actors)

### Optional Parameters

- **`useFilter`** (boolean): Controls message filtering for placeholder text
  - `false` (default): Shows all content including filtered placeholders
  - `true`: Removes content within `[[[text]]]` brackets
- **`**arguments`** (string): Arbitrary key-value arguments sent with the message

## How It Works

1. **Actor Resolution**: Identifies target actors from provided IDs
2. **Message Processing**: Applies filtering if `useFilter=true`
3. **Channel Routing**: Automatically routes to appropriate communication channels
4. **Delivery**: Sends message with any additional arguments as metadata

## Use Cases

### Basic Messaging
```newo
{{!-- Send simple greeting --}}
{{SendMessage(message="Hello! How can I help you today?")}}

{{!-- Send with custom arguments --}}
{{SendMessage(
  message="Your booking is confirmed!", 
  booking_id="12345",
  confirmation_type="restaurant"
)}}
```

### Targeted Communication
```newo
{{!-- Send to specific user by email --}}
{{SendMessage(
  message="Welcome to our service!",
  actorIds=GetActors(
    externalId="customer@example.com",
    integrationIdn="email",
    connectorIdn="gmail"
  )
)}}

{{!-- Send to all SMS actors --}}
{{SendMessage(
  message="Important update: Your appointment is tomorrow",
  actorIds=GetActors(integrationIdn="twilio_messenger")
)}}
```

### Filtered Messages
```newo
{{!-- For systems that strip placeholder content --}}
{{SendMessage(
  message="Your verification code is: [[[ABC123]]]",
  useFilter=true
)}}
{{!-- Result: "Your verification code is: " (placeholder removed) --}}
```

### Dynamic Content
```newo
{{!-- Build dynamic messages with user data --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{Set(name="booking_time", value=GetDateTime(format="datetime"))}}

{{SendMessage(message=Concat(
  "Hi ", user_name, "! Your appointment is scheduled for ", booking_time
))}}
```

## Advanced Patterns

### Multi-Channel Broadcasting
```newo
{{!-- Send to all communication channels for a user --}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{Set(name="all_actors", value=GetActors(personaId=user_id))}}

{{SendMessage(
  message="Important: Your account has been updated",
  actorIds=all_actors,
  priority="high",
  category="account_update"
)}}
```

### Conditional Messaging
```newo
{{!-- Send different messages based on user preferences --}}
{{Set(name="communication_pref", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="communication_preference"
))}}

{{#if IsSimilar(text1=communication_pref, text2="formal")}}
  {{SendMessage(message="Dear valued customer, your appointment has been confirmed.")}}
{{else}}
  {{SendMessage(message="Hey! Your appointment is all set! 🎉")}}
{{/if}}
```

### Error Handling
```newo
{{!-- Validate before sending --}}
{{Set(name="actors", value=GetActors())}}
{{#if IsEmpty(text=Stringify(actors))}}
  {{SendSystemEvent(eventIdn="messaging_error", error="no_actors_found")}}
{{else}}
  {{SendMessage(
    message="Operation completed successfully",
    actorIds=actors,
    timestamp=GetDateTime()
  )}}
{{/if}}
```

## Integration Examples

### Voice Calls (VAPI)
```newo
{{!-- Send response during phone call --}}
{{SendMessage(
  message="I've found 3 available appointments for you.",
  actorIds=GetActors(integrationIdn="vapi"),
  response_type="voice",
  emotion="helpful"
)}}
```

### SMS (Twilio)
```newo
{{!-- Send SMS confirmation --}}
{{SendMessage(
  message="Booking confirmed! Reference: #12345",
  actorIds=GetActors(integrationIdn="twilio_messenger"),
  message_type="confirmation",
  priority="normal"
)}}
```

### Email Integration
```newo
{{!-- Send detailed email with attachments --}}
{{SendMessage(
  message="Please find your booking details attached.",
  actorIds=GetActors(integrationIdn="email"),
  subject="Booking Confirmation",
  attachment_urls=document_links
)}}
```

## Limitations

- **Channel Availability**: Requires active actor connections for target channels
- **Message Size**: Limited by underlying connector constraints (SMS: 160 chars, etc.)
- **Delivery Guarantee**: No built-in delivery confirmation (use connector-specific tracking)
- **Rate Limiting**: Subject to third-party service rate limits
- **Filtering**: `useFilter` only removes `[[[text]]]` patterns, not custom filtering

## Troubleshooting

### Common Issues

**No actors found**:
```newo
{{!-- Check if actors exist before sending --}}
{{Set(name="actors", value=GetActors())}}
{{#if IsEmpty(text=Stringify(actors))}}
  {{SendSystemEvent(eventIdn="error", message="No active communication channels")}}
{{/if}}
```

**Message delivery failures**:
```newo
{{!-- Implement retry logic --}}
{{Set(name="result", value=SendMessage(message=content))}}
{{#if IsEmpty(text=result)}}
  {{SendSystemEvent(eventIdn="message_retry", original_message=content)}}
{{/if}}
```

## Related Actions

- [**GetActors**](./getactors) - Retrieve actor IDs for targeting
- [**CreateActor**](./createactor) - Create new communication channels
- [**SendSystemEvent**](./sendsystemevent) - Internal event broadcasting
- [**SendCommand**](./sendcommand) - External system commands
- [**GetUser**](./getuser) - Access user information for personalization
- [**Concat**](./concat) - Build dynamic message content

## Performance Tips

- **Batch Messages**: Group related messages to reduce execution overhead
- **Cache Actor IDs**: Store frequently used actor lists in state or AKB
- **Validate Recipients**: Check actor availability before sending
- **Use Arguments**: Include metadata for message tracking and analytics