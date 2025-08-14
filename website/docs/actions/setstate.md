---
sidebar_position: 20
title: "SetState"
description: "Assign values to Flow State fields for persistent storage"
---

# SetState

Assigns a value to a specific Flow State field for persistent storage across skill executions. State fields must be defined in the Flow configuration before use.

## Syntax

```newo
SetState(
  name: str,
  value: str
)
```

## Parameters

### Required Parameters

- **`name`** (string): The exact name of the State Field as defined in Flow configuration
- **`value`** (string): The value to assign to the state field

## How It Works

1. **Field Validation**: Verifies the state field exists in Flow configuration
2. **Value Assignment**: Stores the value in the persistent state storage
3. **Session Persistence**: Value remains available across multiple skill executions
4. **Type Conversion**: All values are stored as strings regardless of input type

## Use Cases

### Basic State Management
```newo
{{!-- Store user preferences --}}
{{SetState(name="user_preference", value="dark_mode")}}

{{!-- Track conversation step --}}
{{SetState(name="current_step", value="3")}}

{{!-- Store user information --}}
{{SetState(name="user_name", value=GetUser(field="name"))}}
```

### Multi-Step Workflows
```newo
{{!-- Booking workflow state tracking --}}
{{SetState(name="booking_step", value="1")}}
{{SendMessage(message="What service would you like to book?")}}

{{!-- Later in the flow --}}
{{SetState(name="booking_step", value="2")}}
{{SetState(name="selected_service", value=userInput)}}
{{SendMessage(message="When would you prefer your appointment?")}}
```

### User Session Context
```newo
{{!-- Remember user's last interaction --}}
{{SetState(name="last_interaction", value=GetDateTime())}}
{{SetState(name="interaction_type", value="booking_inquiry")}}

{{!-- Store conversation context --}}
{{SetState(name="topic", value="technical_support")}}
{{SetState(name="issue_category", value="login_problems")}}
```

### Dynamic Content Storage
```newo
{{!-- Store generated content for later use --}}
{{#system~}}
Generate a personalized greeting for {{GetUser(field="name")}}
{{~/system}}

{{#assistant~}}
{{Gen(name="personalized_greeting")}}
{{~/assistant}}

{{SetState(name="last_greeting", value=personalized_greeting)}}
```

## Advanced Patterns

### Conditional State Updates
```newo
{{!-- Update state based on conditions --}}
{{Set(name="current_score", value=GetState(name="user_score"))}}
{{Set(name="new_points", value="10")}}
{{Set(name="updated_score", value=Concat(current_score, "+", new_points))}}

{{#if IsSimilar(text1=current_score, text2="")}}
  {{SetState(name="user_score", value=new_points)}}
{{else}}
  {{SetState(name="user_score", value=updated_score)}}
{{/if}}
```

### State Reset and Cleanup
```newo
{{!-- Reset workflow state --}}
{{SetState(name="booking_step", value="1")}}
{{SetState(name="selected_service", value="")}}
{{SetState(name="selected_time", value="")}}
{{SetState(name="booking_complete", value="false")}}
```

### Debugging and Monitoring
```newo
{{!-- Store debug information --}}
{{SetState(name="last_error", value="")}}
{{SetState(name="debug_timestamp", value=GetDateTime())}}
{{SetState(name="execution_count", value=Concat(GetState(name="execution_count"), "+1"))}}
```

## State Field Configuration

Before using SetState, ensure your Flow has the required State Field:

1. **Flow Configuration**: Add State Field in Flow settings
2. **Field Name**: Use exact same name in SetState action
3. **Scope**: Choose appropriate scope (User, Session, Global)
4. **Default Value**: Optional default value for initialization

### Scope Types
- **User**: Persistent across all user sessions
- **Session**: Valid for current conversation session
- **Global**: Shared across all users (use carefully)

## Limitations

- **String Storage**: All values stored as strings, requiring manual type conversion
- **Field Existence**: State field must exist in Flow configuration
- **Size Limits**: Individual state values have storage size limitations
- **Concurrent Access**: No built-in locking for simultaneous updates
- **Type Safety**: No automatic type validation or conversion

## Troubleshooting

### Common Issues

**State field not found**:
```newo
{{!-- Check if state field exists before setting --}}
{{Set(name="existing_value", value=GetState(name="my_field"))}}
{{#if IsEmpty(text=existing_value)}}
  {{SendSystemEvent(eventIdn="error", message="State field 'my_field' not configured")}}
{{else}}
  {{SetState(name="my_field", value="new_value")}}
{{/if}}
```

**Value persistence issues**:
```newo
{{!-- Verify state was set correctly --}}
{{SetState(name="test_field", value="test_value")}}
{{Set(name="verification", value=GetState(name="test_field"))}}
{{#if IsSimilar(text1=verification, text2="test_value")}}
  {{SendMessage(message="State set successfully")}}
{{else}}
  {{SendMessage(message="State setting failed")}}
{{/if}}
```

## Related Actions

- [**GetState**](./getstate) - Retrieve values from Flow State fields
- [**Set**](./set) - Assign values to local variables
- [**GetUser**](./getuser) - Access user information
- [**SendSystemEvent**](./sendsystemevent) - Log state management events

## Performance Tips

- **Minimize Updates**: Batch state updates when possible
- **Use Appropriate Scope**: Choose the most restrictive scope needed
- **Clean Old States**: Periodically reset unused state fields
- **Validate Before Setting**: Check field existence before updates