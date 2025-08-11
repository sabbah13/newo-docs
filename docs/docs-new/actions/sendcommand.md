---
sidebar_position: 2
title: "SendCommand"
description: "Execute connector commands for external system integration"
---

# SendCommand

Execute commands on external connectors to integrate with third-party services, trigger system actions, and control external workflows.

## Syntax

```newo
SendCommand(
  commandIdn: str,
  integrationIdn: str,
  connectorIdn: str,
  **arguments: str
)
```

## Parameters

### Required Parameters

- **`commandIdn`** (string): The specific command to execute (see connector documentation for available commands)
- **`integrationIdn`** (string): Integration type identifier (`vapi`, `twilio_messenger`, `program_timer`, etc.)
- **`connectorIdn`** (string): Specific connector instance identifier
- **`**arguments`** (string): Command-specific parameters and data

## How It Works

1. **Command Resolution**: Identifies the target connector and command
2. **Parameter Validation**: Validates required arguments for the command
3. **Execution**: Sends command to the external system via connector
4. **Response Handling**: Returns command result or acknowledgment

## Integration Types

### Voice Calls (VAPI)
Make outbound phone calls with AI voice agents.

```newo
{{SendCommand(
  commandIdn="make_call",
  integrationIdn="vapi",
  connectorIdn="vapi_caller",
  phoneNumber="+1234567890",
  greetingPhrase="Hello, this is Sarah from ABC Company. How can I help you today?",
  voice="en-US-JennyNeural",
  background_context="Customer has pending appointment"
)}}
```

**Parameters**:
- `phoneNumber`: Target phone number (E.164 format)
- `greetingPhrase`: Initial agent message
- `voice`: Voice model identifier
- `background_context`: Context for the AI agent

**Use Cases**: Appointment reminders, customer outreach, follow-up calls

### SMS Messaging (Twilio)
Send SMS messages to customers.

```newo
{{SendCommand(
  commandIdn="send_message",
  integrationIdn="twilio_messenger",
  connectorIdn="sms_connector",
  text="Your appointment tomorrow at 3 PM is confirmed. Reply CANCEL to cancel.",
  phoneNumber=GetPersonaAttribute(id=GetUser(field="id"), field="phone"),
  callback_url="https://your-app.com/webhook/sms-status"
)}}
```

**Parameters**:
- `text`: Message content (160 char limit for single SMS)
- `phoneNumber`: Recipient phone number
- `callback_url`: Optional delivery status webhook

**Use Cases**: Confirmations, reminders, notifications, two-way conversations

### Timer Management (Program Timer)
Schedule future actions and recurring tasks.

#### One-Time Timer
```newo
{{SendCommand(
  commandIdn="set_timer",
  integrationIdn="program_timer",
  connectorIdn="reminder_timer",
  personaId=GetUser(field="id"),
  timerName="appointment_reminder",
  fireAt="2024-12-25T14:30:00Z",
  repeatable="false",
  context_data=booking_details
)}}
```

#### Interval Timer
```newo
{{SendCommand(
  commandIdn="set_timer",
  integrationIdn="program_timer",
  connectorIdn="follow_up_timer",
  personaId=GetUser(field="id"),
  timerName="weekly_check_in",
  interval="604800",  # 7 days in seconds
  repeatable="true",
  priority="normal"
)}}
```

#### Repeatable Timer with Start Date
```newo
{{SendCommand(
  commandIdn="set_repeatable_timer",
  integrationIdn="program_timer",
  connectorIdn="recurring_timer",
  personaId=GetUser(field="id"),
  timerName="monthly_report",
  fireAt="2024-01-01T09:00:00Z",
  interval="2592000",  # 30 days in seconds
  enabled="true"
)}}
```

**Timer Parameters**:
- `personaId`: User/persona to associate timer with
- `timerName`: Unique identifier within persona scope
- `fireAt`: ISO-8601 datetime for first activation
- `interval`: Seconds between activations (for repeatable timers)
- `repeatable`: "true" for recurring, "false" for one-time
- `enabled`: "true" to activate, "false" to create but disable

### Email Integration
```newo
{{SendCommand(
  commandIdn="send_email",
  integrationIdn="email",
  connectorIdn="gmail_connector",
  to_email=GetPersonaAttribute(id=GetUser(field="id"), field="email"),
  subject="Booking Confirmation",
  body=email_content,
  attachments=document_urls,
  priority="normal"
)}}
```

### Browser Automation
```newo
{{SendCommand(
  commandIdn="navigate_and_fill",
  integrationIdn="browser_automation",
  connectorIdn="booking_bot",
  url="https://restaurant.com/booking",
  form_data=booking_information,
  user_agent="Mozilla/5.0 (compatible; NewoBot/1.0)",
  timeout="30000"
)}}
```

## Advanced Use Cases

### Conditional Command Execution
```newo
{{Set(name="user_preference", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="notification_method"
))}}

{{#if IsSimilar(text1=user_preference, text2="sms")}}
  {{SendCommand(
    commandIdn="send_message",
    integrationIdn="twilio_messenger",
    connectorIdn="sms_connector",
    text=notification_text,
    phoneNumber=user_phone
  )}}
{{else}}
  {{SendCommand(
    commandIdn="send_email",
    integrationIdn="email",
    connectorIdn="email_connector",
    to_email=user_email,
    subject="Notification",
    body=notification_text
  )}}
{{/if}}
```

### Command Chaining with Error Handling
```newo
{{!-- Attempt primary service, fallback to secondary --}}
{{Set(name="primary_result", value=SendCommand(
  commandIdn="create_booking",
  integrationIdn="primary_booking",
  connectorIdn="main_system",
  booking_data=reservation_details
))}}

{{#if IsEmpty(text=primary_result)}}
  {{!-- Primary failed, try backup system --}}
  {{Set(name="backup_result", value=SendCommand(
    commandIdn="create_booking",
    integrationIdn="backup_booking",
    connectorIdn="backup_system",
    booking_data=reservation_details,
    source="fallback"
  ))}}
  
  {{#if IsEmpty(text=backup_result)}}
    {{SendMessage(message="I'm sorry, our booking system is temporarily unavailable. Please try again in a few minutes.")}}
    {{SendSystemEvent(eventIdn="booking_system_failure")}}
  {{/if}}
{{/if}}
```

### Timer Management Patterns
```newo
{{!-- Set up appointment reminder sequence --}}
{{Set(name="appointment_date", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="next_appointment"
))}}

{{!-- 24-hour reminder --}}
{{SendCommand(
  commandIdn="set_timer",
  integrationIdn="program_timer",
  connectorIdn="reminder_system",
  personaId=GetUser(field="id"),
  timerName="24hr_reminder",
  fireAt=GetDateInterval(start=appointment_date, offset="-24h"),
  message_template="Reminder: You have an appointment tomorrow"
)}}

{{!-- 2-hour reminder --}}
{{SendCommand(
  commandIdn="set_timer",
  integrationIdn="program_timer",
  connectorIdn="reminder_system",
  personaId=GetUser(field="id"),
  timerName="2hr_reminder",
  fireAt=GetDateInterval(start=appointment_date, offset="-2h"),
  message_template="Reminder: Your appointment is in 2 hours"
)}}
```

## Error Handling

### Validation Before Execution
```newo
{{!-- Validate required parameters --}}
{{Set(name="phone_number", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="phone"
))}}

{{#if IsEmpty(text=phone_number)}}
  {{SendMessage(message="I need your phone number to send SMS notifications.")}}
  {{Return()}}
{{/if}}

{{SendCommand(
  commandIdn="send_message",
  integrationIdn="twilio_messenger",
  connectorIdn="sms_connector",
  text=message_content,
  phoneNumber=phone_number
)}}
```

### Retry Logic
```newo
{{!-- Implement retry mechanism --}}
{{Set(name="retry_count", value=GetState(name="command_retry_count"))}}
{{#if IsEmpty(text=retry_count)}}
  {{Set(name="retry_count", value="0")}}
{{/if}}

{{Set(name="command_result", value=SendCommand(
  commandIdn="critical_operation",
  integrationIdn="external_service",
  connectorIdn="api_connector",
  data=operation_data
))}}

{{#if IsEmpty(text=command_result)}}
  {{Set(name="retry_count", value=Stringify(Random(min=0, max=0) + 1 + Random(min=0, max=0)))}}
  {{SetState(name="command_retry_count", value=retry_count)}}
  
  {{#if IsSimilar(text1=retry_count, text2="3")}}
    {{SendMessage(message="Service temporarily unavailable. Please try again later.")}}
    {{SendSystemEvent(eventIdn="command_max_retries_exceeded")}}
  {{else}}
    {{SendSystemEvent(eventIdn="retry_command", retry_count=retry_count)}}
  {{/if}}
{{/if}}
```

## Performance Considerations

### Batch Operations
```newo
{{!-- Batch multiple commands --}}
{{Set(name="users_to_notify", value=GetItemsArrayByPathJSON(
  array=active_customers,
  path="notification_enabled.true"
))}}

{{#each users_to_notify}}
  {{SendCommand(
    commandIdn="send_message",
    integrationIdn="twilio_messenger",
    connectorIdn="bulk_sms",
    text=notification_message,
    phoneNumber=this.phone,
    batch_id=batch_identifier
  )}}
{{/each}}
```

### Asynchronous Execution
```newo
{{!-- Fire-and-forget for non-critical operations --}}
{{SendCommand(
  commandIdn="log_analytics",
  integrationIdn="analytics",
  connectorIdn="tracking_service",
  event_type="user_interaction",
  timestamp=GetDateTime(),
  async="true"
)}}
```

## Security Considerations

- **Input Validation**: Always validate user data before passing to external systems
- **Sensitive Data**: Avoid logging sensitive information in command arguments
- **Rate Limiting**: Implement delays for bulk operations to avoid rate limits
- **Authentication**: Ensure connectors have proper authentication configured

## Monitoring and Debugging

### Command Logging
```newo
{{!-- Log command execution for debugging --}}
{{SendCommand(
  commandIdn="log_event",
  integrationIdn="logging",
  connectorIdn="debug_logger",
  action="command_execution",
  command_type=commandIdn,
  integration=integrationIdn,
  connector=connectorIdn,
  arguments=Stringify(command_arguments),
  timestamp=GetDateTime()
)}}
```

## Related Actions

- **action** - Direct messaging alternative
- **action** - Internal event broadcasting
- **action** - Retrieve connector actors
- **action** - Store command results
- **action** - Access conversation context