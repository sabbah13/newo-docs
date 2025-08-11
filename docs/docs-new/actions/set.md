---
sidebar_position: 6
title: "Set"
description: "Local variable assignment for skill execution context"
---

# Set

Assign values to local variables within skill execution scope. Variables persist throughout the skill execution and can be used for data manipulation, conditional logic, and result storage.

## Syntax

```newo
Set(name: str, value: any)
```

## Parameters

- **`name`** (string): Variable name (must be valid identifier)
- **`value`** (any): Value to assign (string, number, object, array, or action result)

## How It Works

1. **Variable Creation**: Creates or updates variable in skill scope
2. **Type Handling**: Automatically handles different data types
3. **Scope Management**: Variables available throughout current skill execution
4. **Memory Management**: Variables cleaned up after skill completion

## Variable Naming Conventions

### Recommended Patterns
- `snake_case` for multi-word variables: `user_name`, `booking_date`
- Descriptive names: `customer_phone` vs `phone`
- Context prefixes: `temp_result`, `final_output`
- Type suffixes: `user_list`, `config_json`

### Reserved Names
Avoid these system-reserved variable names:
- `system`, `user`, `agent`, `memory`
- `result`, `output`, `input`, `context`
- `actor`, `persona`, `state`, `akb`

## Basic Usage Examples

### Simple Assignment
```newo
{{!-- Store user information --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{Set(name="current_time", value=GetDateTime())}}

{{!-- Use variables in messages --}}
{{SendMessage(message=Concat("Hello ", user_name, "! Current time is ", current_time))}}
```

### Action Result Storage
```newo
{{!-- Store complex action results --}}
{{Set(name="customer_data", value=GetCustomer())}}
{{Set(name="conversation_history", value=GetMemory(count="10", maxLen="5000"))}}
{{Set(name="available_actors", value=GetActors())}}

{{!-- Process stored data --}}
{{Set(name="customer_email", value=GetValueJSON(
  obj=customer_data,
  key="contact.email"
))}}
```

### Calculations and Processing
```newo
{{!-- Perform calculations --}}
{{Set(name="base_price", value="100")}}
{{Set(name="tax_rate", value="0.08")}}
{{Set(name="tax_amount", value=Multiply(a=base_price, b=tax_rate))}}
{{Set(name="total_price", value=Add(a=base_price, b=tax_amount))}}

{{SendMessage(message=Concat(
  "Your total is $", total_price,
  " (including $", tax_amount, " tax)"
))}}
```

## Data Type Handling

### Strings
```newo
{{Set(name="message_template", value="Welcome to our service, {name}!")}}
{{Set(name="customer_name", value=GetUser(field="name"))}}
{{Set(name="personalized_message", value=Replace(
  text=message_template,
  find="{name}",
  replace=customer_name
))}}
```

### Numbers
```newo
{{Set(name="appointment_duration", value="60")}}  # minutes
{{Set(name="buffer_time", value="15")}}           # minutes
{{Set(name="total_slot", value=Add(a=appointment_duration, b=buffer_time))}}

{{Set(name="price_per_hour", value="75.00")}}
{{Set(name="session_cost", value=Multiply(
  a=price_per_hour,
  b=Divide(a=appointment_duration, b="60")
))}}
```

### Objects and JSON
```newo
{{!-- Store complex objects --}}
{{Set(name="booking_details", value=CreateObject(
  customer_id=GetUser(field="id"),
  service_type="consultation",
  duration="60",
  date=GetDateTime(format="date"),
  time=GetDateTime(format="time"),
  status="pending"
))}}

{{!-- Update object fields --}}
{{Set(name="updated_booking", value=UpdateValueJSON(
  obj=booking_details,
  key="status",
  value="confirmed"
))}}
```

### Arrays and Lists
```newo
{{!-- Initialize arrays --}}
{{Set(name="service_list", value=CreateArray("consultation", "follow-up", "emergency"))}}
{{Set(name="customer_preferences", value=CreateArray())}}

{{!-- Build arrays dynamically --}}
{{Set(name="preferences", value=AppendItemsArrayJSON(
  array=customer_preferences,
  items=["morning_appointments", "email_reminders"]
))}}
```

## Complex Data Workflows

### Data Transformation Pipeline
```newo
{{!-- Step 1: Retrieve raw data --}}
{{Set(name="raw_customer_data", value=GetCustomer())}}
{{Set(name="raw_memory", value=GetMemory(count="20", summarize="true"))}}

{{!-- Step 2: Extract relevant fields --}}
{{Set(name="customer_name", value=GetValueJSON(obj=raw_customer_data, key="name"))}}
{{Set(name="customer_phone", value=GetValueJSON(obj=raw_customer_data, key="phone"))}}
{{Set(name="customer_email", value=GetValueJSON(obj=raw_customer_data, key="email"))}}

{{!-- Step 3: Build structured output --}}
{{Set(name="contact_info", value=CreateObject(
  name=customer_name,
  phone=customer_phone,
  email=customer_email,
  last_contact=GetDateTime(),
  conversation_summary=raw_memory
))}}

{{!-- Step 4: Store for later use --}}
{{SetAKB(
  key=Concat("contact_", GetUser(field="id")),
  value=Stringify(contact_info)
)}}
```

### Conditional Data Building
```newo
{{!-- Build different data structures based on context --}}
{{Set(name="conversation_channel", value=GetActor(field="integrationIdn"))}}

{{#if IsSimilar(text1=conversation_channel, text2="vapi")}}
  {{!-- Voice conversation data --}}
  {{Set(name="interaction_data", value=CreateObject(
    type="voice_call",
    duration=GetState(name="call_duration"),
    quality=GetState(name="call_quality"),
    transcript=GetMemory(count="all", asEnglishText="true")
  ))}}
{{else if IsSimilar(text1=conversation_channel, text2="twilio_messenger")}}
  {{!-- SMS conversation data --}}
  {{Set(name="interaction_data", value=CreateObject(
    type="sms_chat",
    message_count=GetState(name="sms_count"),
    thread_id=GetActor(field="externalId"),
    messages=GetMemory(count="50")
  ))}}
{{else}}
  {{!-- Generic chat data --}}
  {{Set(name="interaction_data", value=CreateObject(
    type="web_chat",
    session_id=GetActor(field="id"),
    messages=GetMemory(count="30")
  ))}}
{{/if}}
```

## Performance Patterns

### Variable Reuse
```newo
{{!-- Cache expensive operations --}}
{{Set(name="user_id", value=GetUser(field="id"))}}  # Cache user ID

{{!-- Reuse cached ID multiple times --}}
{{Set(name="user_preferences", value=GetPersonaAttribute(id=user_id, field="preferences"))}}
{{Set(name="user_history", value=GetPersonaAttribute(id=user_id, field="booking_history"))}}
{{Set(name="user_actors", value=GetActors(personaId=user_id))}}
```

### Batch Processing
```newo
{{!-- Process multiple items efficiently --}}
{{Set(name="customer_list", value=GetAKB(key="pending_customers"))}}
{{Set(name="processed_customers", value=CreateArray())}}

{{#each customer_list}}
  {{Set(name="customer_id", value=GetValueJSON(obj=this, key="id"))}}
  {{Set(name="notification_sent", value=SendCommand(
    commandIdn="send_notification",
    customerId=customer_id
  ))}}
  
  {{#if not IsEmpty(text=notification_sent)}}
    {{Set(name="processed_customers", value=AppendItemsArrayJSON(
      array=processed_customers,
      items=[customer_id]
    ))}}
  {{/if}}
{{/each}}

{{SetAKB(key="processed_today", value=Stringify(processed_customers))}}
```

### Memory Optimization
```newo
{{!-- Clean up large variables when done --}}
{{Set(name="large_dataset", value=GetAKB(key="customer_database"))}}

{{!-- Process data --}}
{{Set(name="summary", value=ProcessLargeDataset(data=large_dataset))}}

{{!-- Clear large variable to free memory --}}
{{Set(name="large_dataset", value="")}}

{{!-- Use summary for further processing --}}
{{SendMessage(message=Concat("Analysis complete: ", summary))}}
```

## Error Handling

### Variable Validation
```newo
{{!-- Validate variable assignment --}}
{{Set(name="user_data", value=GetUser())}}

{{#if IsEmpty(text=Stringify(user_data))}}
  {{Set(name="error_message", value="Failed to retrieve user data")}}
  {{SendSystemEvent(eventIdn="data_error", error=error_message)}}
  {{Return(val=error_message)}}
{{/if}}

{{!-- Proceed with valid data --}}
{{Set(name="user_name", value=GetValueJSON(obj=user_data, key="name"))}}
```

### Default Value Patterns
```newo
{{!-- Set defaults for missing data --}}
{{Set(name="user_timezone", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="timezone"
))}}

{{#if IsEmpty(text=user_timezone)}}
  {{Set(name="user_timezone", value="America/New_York")}}  # Default
  {{SetPersonaAttribute(
    id=GetUser(field="id"),
    field="timezone",
    value=user_timezone
  )}}
{{/if}}
```

## Best Practices

### Variable Organization
```newo
{{!-- Group related variables with prefixes --}}
{{Set(name="booking_date", value=GetDateTime(format="date"))}}
{{Set(name="booking_time", value=GetDateTime(format="time"))}}
{{Set(name="booking_duration", value="60")}}
{{Set(name="booking_service", value="consultation")}}

{{Set(name="customer_name", value=GetUser(field="name"))}}
{{Set(name="customer_phone", value=GetPersonaAttribute(id=GetUser(field="id"), field="phone"))}}
{{Set(name="customer_email", value=GetPersonaAttribute(id=GetUser(field="id"), field="email"))}}
```

### Documentation in Code
```newo
{{!-- Document complex variable assignments --}}
{{!-- Calculate appointment end time based on service duration --}}
{{Set(name="service_duration", value=GetAKB(key=Concat("duration_", service_type)))}}
{{Set(name="appointment_end", value=AddMinutes(
  datetime=appointment_start,
  minutes=service_duration
))}}

{{!-- Store for confirmation message --}}
{{Set(name="time_range", value=Concat(
  appointment_start, " - ", appointment_end
))}}
```

## Limitations

- **Skill Scope**: Variables only exist within current skill execution
- **Type Safety**: No compile-time type checking
- **Memory Usage**: Large objects consume execution memory
- **No Persistence**: Variables don't persist between skill executions
- **No Global Scope**: Cannot share variables between skills directly

## Related Actions

- **action** / **action** - Persistent variable storage
- **action** - Long-term data storage
- **action** - Extract object fields
- **action** - Initialize array variables
- **action** - Combine values into strings