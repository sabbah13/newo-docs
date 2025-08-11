---
sidebar_position: 7
title: "GetState / SetState"
description: "Persistent state management across skill executions"
---

# GetState / SetState

Manage persistent state data that survives across skill executions, conversation turns, and even session restarts. Essential for maintaining context in multi-step workflows.

## Syntax

```newo
GetState(name: str)
SetState(name: str, value: any)
```

## Parameters

### GetState
- **`name`** (string): State variable name to retrieve

### SetState  
- **`name`** (string): State variable name to store
- **`value`** (any): Value to persist (string, number, object, array)

## How It Works

1. **Persistence Layer**: State stored in Flow Instance database
2. **Scope**: Accessible across all skills within the same conversation flow
3. **Lifecycle**: Persists until explicitly deleted or conversation ends
4. **Type Handling**: Automatically serializes/deserializes complex data types

## State vs Variables

| Feature | Set (Variables) | SetState (Persistent) |
|---------|----------------|----------------------|
| **Scope** | Single skill execution | Entire conversation flow |
| **Persistence** | Temporary | Survives skill restarts |
| **Performance** | Faster access | Slight database overhead |
| **Use Case** | Temporary processing | Workflow state tracking |

## Basic Usage Examples

### Conversation Stage Tracking
```newo
{{!-- Initialize conversation stage --}}
{{Set(name="current_stage", value=GetState(name="conversation_stage"))}}

{{#if IsEmpty(text=current_stage)}}
  {{SetState(name="conversation_stage", value="greeting")}}
  {{SendMessage(message="Hello! How can I help you today?")}}
{{else if IsSimilar(text1=current_stage, text2="greeting")}}
  {{SetState(name="conversation_stage", value="collecting_info")}}
  {{SendMessage(message="Great! Let me gather some information from you.")}}
{{else if IsSimilar(text1=current_stage, text2="collecting_info")}}
  {{SetState(name="conversation_stage", value="processing")}}
  {{SendMessage(message="Perfect! Let me process your request.")}}
{{/if}}
```

### Data Collection Workflow
```newo
{{!-- Track collected customer information --}}
{{Set(name="collected_data", value=GetState(name="customer_data"))}}

{{#if IsEmpty(text=collected_data)}}
  {{!-- Initialize data collection --}}
  {{SetState(name="customer_data", value=CreateObject(
    name="",
    phone="",
    email="",
    preferences="",
    completed_fields=CreateArray()
  ))}}
{{/if}}

{{!-- Update specific field --}}
{{Set(name="updated_data", value=UpdateValueJSON(
  obj=GetState(name="customer_data"),
  key="name",
  value=GetUser(field="name")
))}}

{{SetState(name="customer_data", value=updated_data)}}
```

### Multi-Step Process Management
```newo
{{!-- Track booking process steps --}}
{{Set(name="booking_progress", value=GetState(name="booking_steps"))}}

{{#if IsEmpty(text=booking_progress)}}
  {{SetState(name="booking_steps", value=CreateObject(
    service_selected=false,
    date_chosen=false,
    time_selected=false,
    details_confirmed=false,
    payment_processed=false
  ))}}
{{/if}}

{{!-- Mark current step complete --}}
{{Set(name="updated_progress", value=UpdateValueJSON(
  obj=GetState(name="booking_steps"),
  key="service_selected",
  value=true
))}}

{{SetState(name="booking_steps", value=updated_progress)}}

{{!-- Check overall progress --}}
{{Set(name="completed_steps", value=CountTrue(obj=GetState(name="booking_steps")))}}
{{SendMessage(message=Concat("Progress: ", completed_steps, "/5 steps completed"))}}
```

## Advanced State Management

### Complex Object Storage
```newo
{{!-- Store complex booking object --}}
{{Set(name="booking_details", value=CreateObject(
  id=Random(min=100000, max=999999),
  customer=CreateObject(
    name=GetUser(field="name"),
    phone=GetPersonaAttribute(id=GetUser(field="id"), field="phone"),
    email=GetPersonaAttribute(id=GetUser(field="id"), field="email")
  ),
  appointment=CreateObject(
    service="consultation",
    date=GetDateTime(format="date"),
    time=GetDateTime(format="time"),
    duration="60",
    status="pending"
  ),
  metadata=CreateObject(
    created_at=GetDateTime(),
    channel=GetActor(field="integrationIdn"),
    agent_id=GetAgent(field="id")
  )
))}}

{{SetState(name="current_booking", value=booking_details)}}
```

### State History Tracking
```newo
{{!-- Maintain state change history --}}
{{Set(name="state_history", value=GetState(name="state_changes"))}}

{{#if IsEmpty(text=state_history)}}
  {{Set(name="state_history", value=CreateArray())}}
{{/if}}

{{!-- Add new state change --}}
{{Set(name="change_record", value=CreateObject(
  timestamp=GetDateTime(),
  previous_state=GetState(name="conversation_stage"),
  new_state="booking_confirmed",
  trigger="payment_processed"
))}}

{{Set(name="updated_history", value=AppendItemsArrayJSON(
  array=state_history,
  items=[change_record]
))}}

{{SetState(name="state_changes", value=updated_history)}}
{{SetState(name="conversation_stage", value="booking_confirmed")}}
```

### Conditional State Updates
```newo
{{!-- Update state based on conditions --}}
{{Set(name="current_attempts", value=GetState(name="booking_attempts"))}}

{{#if IsEmpty(text=current_attempts)}}
  {{SetState(name="booking_attempts", value="1")}}
{{else}}
  {{Set(name="new_attempts", value=Add(a=current_attempts, b="1"))}}
  {{SetState(name="booking_attempts", value=new_attempts)}}
  
  {{#if IsSimilar(text1=new_attempts, text2="3")}}
    {{SetState(name="booking_status", value="max_attempts_reached")}}
    {{SendMessage(message="I'll connect you with a human agent to help with your booking.")}}
  {{/if}}
{{/if}}
```

## State Synchronization Patterns

### Cross-Skill Data Sharing
```newo
{{!-- Skill A: Collect customer preferences --}}
{{SetState(name="customer_preferences", value=CreateObject(
  dietary_restrictions=user_dietary_input,
  seating_preference=user_seating_input,
  visit_frequency="first_time"
))}}

{{!-- Skill B: Use preferences for recommendations --}}
{{Set(name="preferences", value=GetState(name="customer_preferences"))}}
{{Set(name="dietary_needs", value=GetValueJSON(obj=preferences, key="dietary_restrictions"))}}

{{#if IsSimilar(text1=dietary_needs, text2="vegetarian")}}
  {{Set(name="menu_filter", value="vegetarian_options")}}
{{/if}}
```

### State Cleanup and Management
```newo
{{!-- Clean up completed workflow state --}}
{{Set(name="booking_status", value=GetState(name="booking_status"))}}

{{#if IsSimilar(text1=booking_status, text2="completed")}}
  {{!-- Archive completed booking data --}}
  {{Set(name="archived_booking", value=GetState(name="current_booking"))}}
  {{SetAKB(
    key=Concat("booking_archive_", GetDateTime(format="date")),
    value=Stringify(archived_booking)
  )}}
  
  {{!-- Clear active booking state --}}
  {{SetState(name="current_booking", value="")}}
  {{SetState(name="booking_status", value="")}}
  {{SetState(name="booking_steps", value="")}}
{{/if}}
```

### State Migration
```newo
{{!-- Handle state format changes --}}
{{Set(name="legacy_state", value=GetState(name="old_format_data"))}}

{{#if not IsEmpty(text=legacy_state)}}
  {{!-- Convert to new format --}}
  {{Set(name="migrated_data", value=CreateObject(
    version="2.0",
    customer_info=GetValueJSON(obj=legacy_state, key="customer"),
    booking_info=GetValueJSON(obj=legacy_state, key="booking"),
    migrated_at=GetDateTime()
  ))}}
  
  {{SetState(name="customer_booking_data", value=migrated_data)}}
  {{SetState(name="old_format_data", value="")}}  # Clear old format
{{/if}}
```

## Performance Optimization

### State Caching
```newo
{{!-- Cache frequently accessed state --}}
{{Set(name="cached_preferences", value=GetState(name="user_preferences"))}}

{{!-- Use cached data throughout skill --}}
{{Set(name="communication_pref", value=GetValueJSON(
  obj=cached_preferences,
  key="communication_method"
))}}

{{Set(name="timezone_pref", value=GetValueJSON(
  obj=cached_preferences,
  key="timezone"
))}}
```

### Batch State Updates
```newo
{{!-- Batch multiple state changes --}}
{{Set(name="current_session", value=GetState(name="session_data"))}}

{{!-- Prepare all updates --}}
{{Set(name="updated_session", value=UpdateValueJSON(obj=current_session, key="last_activity", value=GetDateTime()))}}
{{Set(name="updated_session", value=UpdateValueJSON(obj=updated_session, key="interaction_count", value=Add(a=GetValueJSON(obj=current_session, key="interaction_count"), b="1")))}}
{{Set(name="updated_session", value=UpdateValueJSON(obj=updated_session, key="current_skill", value="booking_handler"))}}

{{!-- Single state write --}}
{{SetState(name="session_data", value=updated_session)}}
```

### State Size Management
```newo
{{!-- Manage large state objects --}}
{{Set(name="conversation_log", value=GetState(name="full_conversation_log"))}}
{{Set(name="log_size", value=Len(text=Stringify(conversation_log)))}}

{{#if GreaterThan(a=log_size, b="50000")}}
  {{!-- Compress old data --}}
  {{Set(name="summary", value=Summarize(
    text=Stringify(conversation_log),
    maxTokens=1000
  ))}}
  
  {{SetState(name="conversation_summary", value=summary)}}
  {{SetState(name="full_conversation_log", value="")}}  # Clear large data
{{/if}}
```

## Error Handling and Validation

### State Validation
```newo
{{!-- Validate state integrity before use --}}
{{Set(name="booking_state", value=GetState(name="active_booking"))}}

{{#if IsEmpty(text=booking_state)}}
  {{SendMessage(message="Let's start a new booking process.")}}
  {{SetState(name="active_booking", value=CreateObject(
    status="initiated",
    created_at=GetDateTime(),
    steps_completed=CreateArray()
  ))}}
{{else}}
  {{!-- Validate state structure --}}
  {{Set(name="booking_status", value=GetValueJSON(obj=booking_state, key="status"))}}
  
  {{#if IsEmpty(text=booking_status)}}
    {{!-- Repair corrupted state --}}
    {{Set(name="repaired_state", value=UpdateValueJSON(
      obj=booking_state,
      key="status",
      value="recovered"
    ))}}
    {{SetState(name="active_booking", value=repaired_state)}}
  {{/if}}
{{/if}}
```

### Rollback Capability
```newo
{{!-- Implement state rollback --}}
{{Set(name="backup_state", value=GetState(name="booking_backup"))}}
{{Set(name="current_state", value=GetState(name="current_booking"))}}

{{!-- Save current state as backup before changes --}}
{{SetState(name="booking_backup", value=current_state)}}

{{!-- Attempt risky operation --}}
{{Set(name="operation_result", value=SendCommand(
  commandIdn="process_payment",
  booking_data=current_state
))}}

{{#if IsEmpty(text=operation_result)}}
  {{!-- Rollback on failure --}}
  {{SetState(name="current_booking", value=backup_state)}}
  {{SendMessage(message="Payment failed. Your booking details have been preserved.")}}
{{else}}
  {{!-- Success, update state --}}
  {{Set(name="completed_booking", value=UpdateValueJSON(
    obj=current_state,
    key="payment_status",
    value="completed"
  ))}}
  {{SetState(name="current_booking", value=completed_booking)}}
{{/if}}
```

## Integration Patterns

### State-Driven Conversations
```newo
{{!-- Use state to drive conversation flow --}}
{{Set(name="conversation_state", value=GetState(name="flow_state"))}}

{{#if IsSimilar(text1=conversation_state, text2="collecting_preferences")}}
  {{SendMessage(message="What type of cuisine do you prefer?")}}
  {{SetState(name="next_expected", value="cuisine_preference")}}

{{else if IsSimilar(text1=conversation_state, text2="scheduling")}}
  {{SendMessage(message="What date works best for you?")}}
  {{SetState(name="next_expected", value="preferred_date")}}

{{else if IsSimilar(text1=conversation_state, text2="confirming")}}
  {{Set(name="booking_summary", value=GetState(name="booking_details"))}}
  {{SendMessage(message=Concat("Please confirm: ", Stringify(booking_summary)))}}
  {{SetState(name="next_expected", value="confirmation")}}
{{/if}}
```

### External System State Sync
```newo
{{!-- Sync state with external booking system --}}
{{Set(name="local_booking", value=GetState(name="pending_booking"))}}
{{Set(name="booking_id", value=GetValueJSON(obj=local_booking, key="id"))}}

{{!-- Check external system status --}}
{{Set(name="external_status", value=SendCommand(
  commandIdn="check_booking_status",
  integrationIdn="booking_system",
  connectorIdn="api_connector",
  booking_id=booking_id
))}}

{{!-- Update local state to match --}}
{{Set(name="updated_booking", value=UpdateValueJSON(
  obj=local_booking,
  key="external_status",
  value=external_status
))}}

{{SetState(name="pending_booking", value=updated_booking)}}
```

### State-Based Routing
```newo
{{!-- Route to different handlers based on state --}}
{{Set(name="user_journey_state", value=GetState(name="user_journey"))}}

{{#if IsSimilar(text1=user_journey_state, text2="new_customer")}}
  {{SendSystemEvent(eventIdn="route_to_onboarding")}}

{{else if IsSimilar(text1=user_journey_state, text2="returning_customer")}}
  {{SendSystemEvent(eventIdn="route_to_booking")}}

{{else if IsSimilar(text1=user_journey_state, text2="vip_customer")}}
  {{SendSystemEvent(eventIdn="route_to_priority_service")}}

{{else}}
  {{!-- Default routing --}}
  {{SetState(name="user_journey", value="standard_customer")}}
  {{SendSystemEvent(eventIdn="route_to_general_service")}}
{{/if}}
```

## Advanced State Patterns

### State Machine Implementation
```newo
{{!-- Implement finite state machine --}}
{{Set(name="current_state", value=GetState(name="fsm_state"))}}
{{Set(name="user_input", value=GetMemory(count="1", fromPerson="User"))}}

{{!-- State transition logic --}}
{{#if IsSimilar(text1=current_state, text2="IDLE")}}
  {{#if IsSimilar(text1=user_input, text2="book appointment")}}
    {{SetState(name="fsm_state", value="BOOKING_INITIATED")}}
    {{SetState(name="booking_start_time", value=GetDateTime())}}
  {{/if}}

{{else if IsSimilar(text1=current_state, text2="BOOKING_INITIATED")}}
  {{#if IsSimilar(text1=user_input, text2="cancel")}}
    {{SetState(name="fsm_state", value="IDLE")}}
    {{SetState(name="booking_start_time", value="")}}
  {{else if Contains(text=user_input, search="confirm")}}
    {{SetState(name="fsm_state", value="BOOKING_CONFIRMED")}}
    {{SetState(name="booking_confirmed_time", value=GetDateTime())}}
  {{/if}}
{{/if}}
```

### Temporary State with TTL
```newo
{{!-- Implement time-based state expiry --}}
{{Set(name="temp_data", value=GetState(name="temporary_booking"))}}
{{Set(name="temp_timestamp", value=GetState(name="temp_booking_timestamp"))}}

{{#if not IsEmpty(text=temp_data)}}
  {{Set(name="current_time", value=GetDateTime(format="timestamp"))}}
  {{Set(name="time_diff", value=Subtract(a=current_time, b=temp_timestamp))}}
  
  {{#if GreaterThan(a=time_diff, b="1800")}}  # 30 minutes
    {{!-- Expire old temporary data --}}
    {{SetState(name="temporary_booking", value="")}}
    {{SetState(name="temp_booking_timestamp", value="")}}
    {{SendMessage(message="Your temporary booking has expired. Let's start fresh.")}}
  {{/if}}
{{/if}}
```

### State Aggregation
```newo
{{!-- Aggregate data across multiple state variables --}}
{{Set(name="customer_state", value=GetState(name="customer_info"))}}
{{Set(name="booking_state", value=GetState(name="booking_details"))}}
{{Set(name="preferences_state", value=GetState(name="user_preferences"))}}

{{!-- Create comprehensive view --}}
{{Set(name="complete_context", value=CreateObject(
  customer=customer_state,
  booking=booking_state,
  preferences=preferences_state,
  last_updated=GetDateTime(),
  conversation_id=GetActor(field="id")
))}}

{{!-- Store aggregate for easy access --}}
{{SetState(name="complete_customer_context", value=complete_context)}}
```

## State Monitoring and Debugging

### State Diagnostics
```newo
{{!-- Log all current state for debugging --}}
{{Set(name="all_state_keys", value=CreateArray(
  "conversation_stage",
  "customer_data", 
  "booking_details",
  "user_preferences",
  "session_metadata"
))}}

{{Set(name="state_snapshot", value=CreateObject())}}

{{#each all_state_keys}}
  {{Set(name="state_value", value=GetState(name=this))}}
  {{Set(name="state_snapshot", value=UpdateValueJSON(
    obj=state_snapshot,
    key=this,
    value=state_value
  ))}}
{{/each}}

{{SendCommand(
  commandIdn="log_debug_info",
  integrationIdn="logging",
  connectorIdn="debug_logger",
  state_snapshot=Stringify(state_snapshot),
  timestamp=GetDateTime()
)}}
```

### State Health Monitoring
```newo
{{!-- Monitor state health and integrity --}}
{{Set(name="critical_states", value=CreateArray(
  "current_booking",
  "customer_data",
  "payment_info"
))}}

{{Set(name="health_status", value=CreateObject(healthy=true, issues=CreateArray()))}}

{{#each critical_states}}
  {{Set(name="state_data", value=GetState(name=this))}}
  
  {{#if IsEmpty(text=state_data)}}
    {{Set(name="health_status", value=UpdateValueJSON(
      obj=health_status,
      key="healthy",
      value=false
    ))}}
    
    {{Set(name="issues", value=AppendItemsArrayJSON(
      array=GetValueJSON(obj=health_status, key="issues"),
      items=[Concat("Missing state: ", this)]
    ))}}
    
    {{Set(name="health_status", value=UpdateValueJSON(
      obj=health_status,
      key="issues",
      value=issues
    ))}}
  {{/if}}
{{/each}}

{{#if not GetValueJSON(obj=health_status, key="healthy")}}
  {{SendSystemEvent(
    eventIdn="state_health_issue",
    issues=GetValueJSON(obj=health_status, key="issues")
  )}}
{{/if}}
```

## Best Practices

### State Organization
```newo
{{!-- Organize related state with consistent naming --}}
{{SetState(name="booking_customer_info", value=customer_data)}}
{{SetState(name="booking_appointment_details", value=appointment_data)}}
{{SetState(name="booking_payment_info", value=payment_data)}}
{{SetState(name="booking_status", value="in_progress")}}
```

### State Documentation
```newo
{{!-- Document state structure --}}
{{!-- State: user_onboarding_progress
     Structure: {
       steps_completed: ["account_created", "profile_setup"],
       current_step: "preferences_collection",
       started_at: "2024-01-15T10:30:00Z",
       completion_percentage: 60
     }
--}}
{{SetState(name="user_onboarding_progress", value=onboarding_data)}}
```

### State Validation
```newo
{{!-- Validate state before critical operations --}}
{{Set(name="payment_state", value=GetState(name="payment_details"))}}

{{#if IsEmpty(text=payment_state)}}
  {{SendMessage(message="Payment information is missing. Please provide your payment details.")}}
  {{Return()}}
{{/if}}

{{Set(name="amount", value=GetValueJSON(obj=payment_state, key="amount"))}}
{{#if IsEmpty(text=amount)}}
  {{SendMessage(message="Payment amount is missing. Please restart the booking process.")}}
  {{Return()}}
{{/if}}
```

## Limitations

- **Flow Scope**: State persists within conversation flow only
- **Storage Size**: Large objects may impact performance
- **Concurrent Access**: No built-in locking for concurrent modifications
- **Type Safety**: No schema validation for stored objects
- **Memory Usage**: Persisted state consumes database storage

## Troubleshooting

### State Recovery
```newo
{{!-- Recover from corrupted state --}}
{{Set(name="main_state", value=GetState(name="primary_data"))}}

{{#if IsEmpty(text=main_state)}}
  {{!-- Try backup state --}}
  {{Set(name="backup_state", value=GetState(name="backup_data"))}}
  
  {{#if not IsEmpty(text=backup_state)}}
    {{SetState(name="primary_data", value=backup_state)}}
    {{SendMessage(message="Recovered your previous session data.")}}
  {{else}}
    {{SendMessage(message="Starting a fresh session.")}}
  {{/if}}
{{/if}}
```

## Related Actions

- **action** - Temporary variable storage
- **action** - Long-term persistent storage
- **action** - Conversation context
- **action** - State change notifications
- **action** - Object field updates