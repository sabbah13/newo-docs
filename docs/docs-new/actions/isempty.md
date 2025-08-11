---
sidebar_position: 25
title: "IsEmpty"
description: "Check if a string or variable contains any content"
---

# IsEmpty

Determines whether a string is empty or contains no content. Returns a truthy value ("t") if empty, or empty string if not empty.

## Syntax

```newo
IsEmpty(text: str) -> Literal["t", ""]
```

## Parameters

### Required Parameters

- **`text`** (string): The string to test for emptiness

## Return Values

- **`"t"`** - String is empty, null, or whitespace-only
- **`""`** (empty string) - String contains content

## How It Works

1. **Input Analysis**: Examines the provided string value
2. **Whitespace Check**: Considers whitespace-only strings as empty
3. **Boolean Logic**: Returns truthy ("t") or falsy ("") value for conditional use
4. **Type Handling**: Handles various input types by converting to string first

## Use Cases

### Basic Validation
```newo
{{!-- Check if user input is empty --}}
{{#if IsEmpty(text=userInput)}}
  {{SendMessage(message="Please provide a valid input.")}}
{{else}}
  {{SendMessage(message=Concat("You entered: ", userInput))}}
{{/if}}
```

### State Field Validation
```newo
{{!-- Check if state field has been set --}}
{{Set(name="user_preference", value=GetState(name="theme_preference"))}}
{{#if IsEmpty(text=user_preference)}}
  {{SendMessage(message="Setting default theme to light mode")}}
  {{SetState(name="theme_preference", value="light")}}
{{else}}
  {{SendMessage(message=Concat("Your theme is set to: ", user_preference))}}
{{/if}}
```

### Conditional Processing
```newo
{{!-- Process only if data exists --}}
{{Set(name="user_email", value=GetUser(field="email"))}}
{{#if IsEmpty(text=user_email)}}
  {{SendMessage(message="Please update your email in profile settings")}}
{{else}}
  {{SendMessage(message="Sending confirmation to your email")}}
  {{SendCommand(command="send_email", recipient=user_email)}}
{{/if}}
```

### Form Validation
```newo
{{!-- Multi-field validation --}}
{{Set(name="name", value=GetUser(field="name"))}}
{{Set(name="phone", value=GetUser(field="phone"))}}

{{#if IsEmpty(text=name)}}
  {{Set(name="missing_fields", value="name")}}
{{/if}}

{{#if IsEmpty(text=phone)}}
  {{Set(name="missing_fields", value=Concat(missing_fields, ", phone"))}}
{{/if}}

{{#if IsEmpty(text=missing_fields)}}
  {{SendMessage(message="All required fields are complete!")}}
{{else}}
  {{SendMessage(message=Concat("Missing fields: ", missing_fields))}}
{{/if}}
```

## Advanced Patterns

### State Toggle Pattern
```newo
{{!-- Toggle state based on current value --}}
{{Set(name="current_flag", value=GetState(name="feature_enabled"))}}
{{#if IsEmpty(text=current_flag)}}
  {{SetState(name="feature_enabled", value="true")}}
  {{SendMessage(message="Feature enabled")}}
{{else}}
  {{SetState(name="feature_enabled", value="")}}
  {{SendMessage(message="Feature disabled")}}
{{/if}}
```

### Error Handling
```newo
{{!-- Handle missing or invalid data --}}
{{Set(name="api_response", value=SendCommand(command="get_data"))}}
{{#if IsEmpty(text=api_response)}}
  {{SendMessage(message="Service temporarily unavailable. Please try again later.")}}
  {{SendSystemEvent(eventIdn="api_error", details="Empty response from external service")}}
{{else}}
  {{SendMessage(message="Data retrieved successfully")}}
{{/if}}
```

### Default Value Assignment
```newo
{{!-- Set default values for empty fields --}}
{{Set(name="user_language", value=GetUser(field="language"))}}
{{#if IsEmpty(text=user_language)}}
  {{Set(name="user_language", value="en")}}
  {{SetState(name="default_language_used", value="true")}}
{{/if}}
{{SendMessage(message=Concat("Using language: ", user_language))}}
```

### Memory Check Pattern
```newo
{{!-- Check if conversation history exists --}}
{{Set(name="last_message", value=GetMemory(count="1", fromPerson="User"))}}
{{#if IsEmpty(text=last_message)}}
  {{SendMessage(message="Hello! How can I help you today?")}}
{{else}}
  {{SendMessage(message="Continuing our conversation...")}}
{{/if}}
```

## Integration Examples

### With GetActors
```newo
{{!-- Check if communication channels exist --}}
{{Set(name="actors", value=Stringify(GetActors()))}}
{{#if IsEmpty(text=actors)}}
  {{SendSystemEvent(eventIdn="no_actors", message="No communication channels available")}}
{{else}}
  {{SendMessage(message="Message sent to available channels")}}
{{/if}}
```

### With JSON Operations
```newo
{{!-- Validate JSON field before use --}}
{{Set(name="user_data", value=GetValueJSON(obj=userProfile, key="preferences"))}}
{{#if IsEmpty(text=user_data)}}
  {{Set(name="user_data", value='{"theme": "light", "notifications": true}')}}
  {{SendMessage(message="Using default preferences")}}
{{else}}
  {{SendMessage(message="Loaded your saved preferences")}}
{{/if}}
```

### With AI Generation
```newo
{{!-- Ensure AI generated content before using --}}
{{#system~}}
Generate a brief summary of the user's request.
{{~/system}}

{{#assistant~}}
{{Gen(name="summary")}}
{{~/assistant}}

{{#if IsEmpty(text=summary)}}
  {{SendMessage(message="I need more information to help you.")}}
{{else}}
  {{SendMessage(message=Concat("Here's what I understand: ", summary))}}
{{/if}}
```

## Limitations

- **String-Only**: Only works with string values (other types converted to string)
- **Whitespace Sensitivity**: Whitespace-only strings are considered empty
- **No Null Check**: Cannot distinguish between null and empty string
- **Case Sensitivity**: No built-in case-insensitive checking
- **Return Type**: Returns string literals, not boolean values

## Troubleshooting

### Common Issues

**Unexpected truthy results**:
```newo
{{!-- Debug what's actually in the variable --}}
{{Set(name="test_value", value=GetState(name="my_field"))}}
{{SendMessage(message=Concat("Value: '", test_value, "' Length: ", Stringify(test_value)))}}
{{#if IsEmpty(text=test_value)}}
  {{SendMessage(message="Value is empty")}}
{{else}}
  {{SendMessage(message="Value has content")}}
{{/if}}
```

**Handling undefined variables**:
```newo
{{!-- Safely check variables that might not exist --}}
{{#if IsEmpty(text=GetState(name="optional_field"))}}
  {{SendMessage(message="Optional field not set")}}
{{else}}
  {{SendMessage(message="Optional field has value")}}
{{/if}}
```

## Related Actions

- [**IsSimilar**](./issimilar) - Compare string similarity
- [**IsGlobal**](./isglobal) - Check global variable scope
- [**Set**](./set) - Assign values to variables
- [**GetState**](./getstate) - Retrieve state field values

## Performance Tips

- **Cache Results**: Store IsEmpty results for repeated checks
- **Combine Conditions**: Use logical operators for multiple empty checks
- **Early Validation**: Check emptiness before expensive operations
- **Default Patterns**: Use consistent default value patterns