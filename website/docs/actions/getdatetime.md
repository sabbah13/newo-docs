---
sidebar_position: 35
title: "GetDateTime"
description: "Get current date and time with timezone and format control"
---

# GetDateTime

Returns current date and/or time with customizable formatting, timezone support, and weekday inclusion. Essential for timestamping, scheduling, and time-aware operations.

## Syntax

```newo
GetDateTime(
  format: Literal["datetime", "date", "time"] = "datetime",
  timezone: str = "UTC",
  weekday: str = "false"
)
```

## Parameters

### Optional Parameters

- **`format`** (string): Output format type. Options:
  - `"datetime"` - Full date and time (default)
  - `"date"` - Date only (YYYY-MM-DD)
  - `"time"` - Time only (HH:MM:SS)

- **`timezone`** (string): Timezone identifier
  - Default: Actor's timezone or UTC if no actor
  - Format: `"America/New_York"`, `"Europe/London"`, etc.
  - See [timezone database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

- **`weekday`** (string): Include weekday name
  - `"true"` - Add weekday to output
  - `"false"` - No weekday (default)

## Return Values

- **Date string**: `"2024-01-19"` (date format)
- **Time string**: `"14:30:45.123456"` (time format)
- **DateTime string**: `"2024-01-19T14:30:45.123456-05:00"` (datetime format)
- **With weekday**: `"2024-01-19T14:30:45.123456-05:00, Friday"`

## How It Works

1. **Time Retrieval**: Gets current system time
2. **Timezone Conversion**: Applies specified timezone offset
3. **Format Application**: Formats according to specified type
4. **Weekday Addition**: Optionally appends weekday name
5. **String Return**: Returns formatted time string

## Use Cases

### Basic Timestamp Creation
```newo
{{!-- Simple timestamp for logging --}}
{{Set(name="current_time", value=GetDateTime())}}
{{SendMessage(message=Concat("Message sent at: ", current_time))}}
{{SendSystemEvent(eventIdn="user_action", timestamp=current_time)}}
```

### Date-Only Operations
```newo
{{!-- Get just the date for scheduling --}}
{{Set(name="today", value=GetDateTime(format="date"))}}
{{SetState(name="last_login_date", value=today)}}
{{SendMessage(message=Concat("Today is ", today))}}
```

### Time-Only Operations
```newo
{{!-- Get just the time for precise timing --}}
{{Set(name="current_time", value=GetDateTime(format="time"))}}
{{SetState(name="session_start_time", value=current_time)}}
{{SendMessage(message=Concat("Session started at ", current_time))}}
```

### Timezone-Aware Operations
```newo
{{!-- Use user's timezone for scheduling --}}
{{Set(name="user_timezone", value=GetUser(field="timezone"))}}
{{#if IsEmpty(text=user_timezone)}}
  {{Set(name="user_timezone", value="UTC")}}
{{/if}}

{{Set(name="local_time", value=GetDateTime(
  format="datetime",
  timezone=user_timezone
))}}
{{SendMessage(message=Concat("Your local time: ", local_time))}}
```

## Advanced Patterns

### Business Hours Detection
```newo
{{!-- Check if current time is within business hours --}}
{{Set(name="current_hour", value=GetDateTime(
  format="time",
  timezone="America/New_York"
))}}

{{!-- Extract hour for comparison (simplified) --}}
{{#if IsSimilar(text1=current_hour, text2="business_hours", threshold=0.3)}}
  {{SendMessage(message="We're open! Business hours: 9 AM - 5 PM EST")}}
{{else}}
  {{SendMessage(message="We're currently closed. Business hours: 9 AM - 5 PM EST")}}
{{/if}}
```

### Appointment Scheduling
```newo
{{!-- Schedule appointments with user timezone --}}
{{Set(name="user_tz", value=GetUser(field="timezone"))}}
{{Set(name="appointment_time", value=GetDateTime(
  format="datetime",
  timezone=user_tz,
  weekday="true"
))}}

{{SendMessage(message=Concat(
  "Scheduling your appointment for: ",
  appointment_time
))}}

{{SetState(name="next_appointment", value=appointment_time)}}
```

### Multi-Timezone Display
```newo
{{!-- Show time in multiple timezones --}}
{{Set(name="utc_time", value=GetDateTime(format="datetime", timezone="UTC"))}}
{{Set(name="est_time", value=GetDateTime(format="datetime", timezone="America/New_York"))}}
{{Set(name="pst_time", value=GetDateTime(format="datetime", timezone="America/Los_Angeles"))}}

{{SendMessage(message=Concat(
  "Current times:\n",
  "UTC: ", utc_time, "\n",
  "EST: ", est_time, "\n", 
  "PST: ", pst_time
))}}
```

### Event Logging with Context
```newo
{{!-- Create comprehensive event logs --}}
{{Set(name="event_timestamp", value=GetDateTime(
  format="datetime",
  timezone="UTC",
  weekday="true"
))}}

{{Set(name="user_action", value=GetTriggeredAct())}}
{{SendSystemEvent(
  eventIdn="detailed_user_action",
  timestamp=event_timestamp,
  action=user_action,
  user_id=GetUser(field="id")
)}}

{{SendMessage(message=Concat("Action logged at ", event_timestamp))}}
```

## Integration Examples

### With State Management
```newo
{{!-- Track session timing --}}
{{Set(name="session_start", value=GetState(name="session_start_time"))}}
{{#if IsEmpty(text=session_start)}}
  {{Set(name="current_time", value=GetDateTime())}}
  {{SetState(name="session_start_time", value=current_time)}}
  {{SendMessage(message="Session started")}}
{{else}}
  {{Set(name="current_time", value=GetDateTime())}}
  {{SendMessage(message=Concat(
    "Session active since ", session_start,
    " (current: ", current_time, ")"
  ))}}
{{/if}}
```

### With Memory Management
```newo
{{!-- Add timestamps to conversation memory --}}
{{Set(name="conversation_time", value=GetDateTime(
  format="datetime",
  weekday="true"
))}}

{{Set(name="last_message", value=GetMemory(count="1", fromPerson="User"))}}
{{Set(name="timestamped_memory", value=Concat(
  "[", conversation_time, "] ",
  "User: ", last_message
))}}

{{SendMessage(message="Message recorded with timestamp")}}
```

### With External Commands
```newo
{{!-- Send timestamped data to external systems --}}
{{Set(name="api_timestamp", value=GetDateTime(format="datetime", timezone="UTC"))}}
{{Set(name="user_data", value=GetUser(field="name"))}}

{{SendCommand(
  command="log_user_activity",
  timestamp=api_timestamp,
  user=user_data,
  activity="skill_execution"
)}}
```

### With AI Generation
```newo
{{!-- Use current time in AI prompts --}}
{{Set(name="current_datetime", value=GetDateTime(
  format="datetime",
  weekday="true"
))}}

{{#system~}}
The current date and time is {{current_datetime}}.
Generate a time-appropriate greeting for the user.
{{~/system}}

{{#assistant~}}
{{Gen(name="time_aware_greeting")}}
{{~/assistant}}

{{SendMessage(message=time_aware_greeting)}}
```

## Timezone Examples

### Common Business Timezones
```newo
{{!-- US Timezones --}}
{{Set(name="est_time", value=GetDateTime(timezone="America/New_York"))}}      {{!-- Eastern --}}
{{Set(name="cst_time", value=GetDateTime(timezone="America/Chicago"))}}       {{!-- Central --}}
{{Set(name="mst_time", value=GetDateTime(timezone="America/Denver"))}}        {{!-- Mountain --}}
{{Set(name="pst_time", value=GetDateTime(timezone="America/Los_Angeles"))}}   {{!-- Pacific --}}
```

### International Timezones
```newo
{{!-- Global Timezones --}}
{{Set(name="london_time", value=GetDateTime(timezone="Europe/London"))}}      {{!-- GMT/BST --}}
{{Set(name="tokyo_time", value=GetDateTime(timezone="Asia/Tokyo"))}}          {{!-- JST --}}
{{Set(name="sydney_time", value=GetDateTime(timezone="Australia/Sydney"))}}   {{!-- AEST/AEDT --}}
{{Set(name="dubai_time", value=GetDateTime(timezone="Asia/Dubai"))}}          {{!-- GST --}}
```

### User-Specific Timezone
```newo
{{!-- Use stored user timezone preference --}}
{{Set(name="preferred_tz", value=GetState(name="user_timezone_preference"))}}
{{#if IsEmpty(text=preferred_tz)}}
  {{Set(name="preferred_tz", value="UTC")}}
{{/if}}

{{Set(name="user_local_time", value=GetDateTime(
  format="datetime",
  timezone=preferred_tz,
  weekday="true"
))}}
```

## Format Examples

### Date Formats
```newo
{{!-- Various date representations --}}
{{Set(name="date_only", value=GetDateTime(format="date"))}}                    {{!-- 2024-01-19 --}}
{{Set(name="date_with_weekday", value=GetDateTime(format="date", weekday="true"))}} {{!-- 2024-01-19, Friday --}}
```

### Time Formats
```newo
{{!-- Time precision options --}}
{{Set(name="time_precise", value=GetDateTime(format="time"))}}                 {{!-- 14:30:45.123456 --}}
{{Set(name="time_timezone", value=GetDateTime(format="time", timezone="UTC"))}} {{!-- UTC time --}}
```

### DateTime Formats
```newo
{{!-- Full datetime with options --}}
{{Set(name="full_datetime", value=GetDateTime(format="datetime"))}}            {{!-- 2024-01-19T14:30:45.123456Z --}}
{{Set(name="datetime_tz", value=GetDateTime(format="datetime", timezone="America/New_York"))}} {{!-- With timezone --}}
{{Set(name="datetime_full", value=GetDateTime(format="datetime", timezone="America/New_York", weekday="true"))}} {{!-- Everything --}}
```

## Scheduling and Calendar Integration

### Appointment Booking
```newo
{{!-- Book appointment in user's timezone --}}
{{Set(name="user_tz", value=GetUser(field="timezone"))}}
{{Set(name="booking_time", value=GetDateTime(
  format="datetime", 
  timezone=user_tz,
  weekday="true"
))}}

{{SendMessage(message=Concat("Appointment confirmed for: ", booking_time))}}
{{SetState(name="next_appointment_time", value=booking_time)}}
```

### Reminder Systems
```newo
{{!-- Set up time-based reminders --}}
{{Set(name="reminder_time", value=GetDateTime(format="datetime", timezone="UTC"))}}
{{SetState(name="reminder_set_at", value=reminder_time)}}

{{SendMessage(message=Concat("Reminder set at ", reminder_time))}}
{{SendCommand(
  command="schedule_reminder",
  set_time=reminder_time,
  user_id=GetUser(field="id")
)}}
```

## Error Handling

### Timezone Validation
```newo
{{!-- Handle invalid timezone gracefully --}}
{{Set(name="user_timezone", value=GetState(name="user_tz_preference"))}}
{{#if IsEmpty(text=user_timezone)}}
  {{Set(name="safe_timezone", value="UTC")}}
{{else}}
  {{Set(name="safe_timezone", value=user_timezone)}}
{{/if}}

{{Set(name="safe_time", value=GetDateTime(
  format="datetime",
  timezone=safe_timezone
))}}
```

### Format Fallbacks
```newo
{{!-- Provide format fallbacks --}}
{{Set(name="requested_format", value=GetState(name="time_format_preference"))}}
{{#if IsEmpty(text=requested_format)}}
  {{Set(name="time_format", value="datetime")}}
{{else}}
  {{Set(name="time_format", value=requested_format)}}
{{/if}}

{{Set(name="formatted_time", value=GetDateTime(format=time_format))}}
```

## Performance Considerations

### Caching Considerations
- DateTime calls are relatively fast but consider caching for repeated use within same execution
- Timezone conversions add minimal overhead
- Date-only format is fastest, full datetime with weekday is slowest

### Best Practices
```newo
{{!-- Cache timestamp for multiple uses --}}
{{Set(name="execution_time", value=GetDateTime())}}
{{SetState(name="last_execution", value=execution_time)}}
{{SendSystemEvent(eventIdn="execution_start", timestamp=execution_time)}}
{{SendMessage(message=Concat("Execution started at ", execution_time))}}
```

## Limitations

- **System Dependency**: Relies on system clock accuracy
- **Timezone Data**: Dependent on system timezone database
- **Precision**: Microsecond precision may vary by system
- **Format Fixed**: Cannot customize date/time format beyond provided options
- **No Arithmetic**: Cannot perform date math operations

## Related Actions

- [**GetDateInterval**](./getdateinterval) - Calculate time differences
- [**SetState**](./setstate) - Store timestamps persistently
- [**SendSystemEvent**](./sendsystemevent) - Log events with timestamps
- [**Concat**](./concat) - Build formatted time strings
- [**GetUser**](./getuser) - Get user timezone preferences
- [**IsEmpty**](./isempty) - Validate timezone parameters

## Performance Tips

- **Cache Timestamps**: Store current time for multiple uses
- **Choose Appropriate Format**: Use simplest format needed
- **Validate Timezones**: Check timezone parameters before use
- **UTC for Storage**: Use UTC for data storage, convert for display
- **Batch Operations**: Get time once for batch operations