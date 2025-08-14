---
sidebar_position: 28
title: "Stringify"
description: "Convert values to clean string format by removing quotes and normalizing data"
---

# Stringify

Removes quotes from strings and converts various data types to clean string format. Essential for data normalization, display formatting, and preparing values for further processing.

## Syntax

```newo
Stringify(
  str: any
)
```

## Parameters

### Required Parameters

- **`str`** (any): The value to convert to string format
  - String values: Removes enclosing quotes
  - JSON strings: Extracts string values without quotes
  - Other types: Converts to string representation

## Return Values

- **Clean string**: Input with quotes removed and normalized formatting
- **String representation**: Non-string inputs converted to string format

## How It Works

1. **Type Detection**: Identifies input data type
2. **Quote Removal**: Strips outer quotes from string values
3. **JSON Processing**: Extracts clean values from JSON strings
4. **Normalization**: Converts various formats to clean string output
5. **Formatting**: Returns display-ready string format

## Use Cases

### Basic String Cleaning
```newo
{{!-- Remove quotes from quoted strings --}}
{{Set(name="quoted_text", value='"This is a quoted string"')}}
{{Set(name="clean_text", value=Stringify(quoted_text))}}
{{SendMessage(message=clean_text)}}
{{!-- Result: This is a quoted string --}}
```

### JSON Value Extraction
```newo
{{!-- Extract clean values from JSON --}}
{{Set(name="json_data", value='{"name": "John Doe", "age": "30"}')}}
{{Set(name="user_name", value=Stringify(GetValueJSON(obj=json_data, key="name")))}}
{{SendMessage(message=Concat("Welcome, ", user_name))}}
{{!-- Result: Welcome, John Doe --}}
```

### Display Formatting
```newo
{{!-- Clean data for user display --}}
{{Set(name="user_email", value='"user@example.com"')}}
{{Set(name="clean_email", value=Stringify(user_email))}}
{{SendMessage(message=Concat("Your email: ", clean_email))}}
{{!-- Result: Your email: user@example.com --}}
```

### Data Normalization
```newo
{{!-- Normalize mixed data types --}}
{{Set(name="mixed_values", value=['"string1"', '"string2"', 123, true])}}
{{Set(name="clean_values", value="")}}

{{!-- Process each value --}}
{{Set(name="val1", value=Stringify('"string1"'))}}
{{Set(name="val2", value=Stringify(123))}}
{{Set(name="val3", value=Stringify(true))}}

{{Set(name="normalized", value=Concat(val1, ", ", val2, ", ", val3))}}
{{SendMessage(message=Concat("Normalized: ", normalized))}}
```

## Advanced Patterns

### Actor List Processing
```newo
{{!-- Convert actor arrays to readable format --}}
{{Set(name="actors", value=GetActors())}}
{{Set(name="actor_string", value=Stringify(actors))}}
{{#if IsEmpty(text=actor_string)}}
  {{SendMessage(message="No active communication channels")}}
{{else}}
  {{SendMessage(message=Concat("Active channels: ", actor_string))}}
{{/if}}
```

### State Value Cleaning
```newo
{{!-- Clean state values for comparison --}}
{{Set(name="raw_preference", value=GetState(name="user_theme"))}}
{{Set(name="clean_preference", value=Stringify(raw_preference))}}

{{#if IsSimilar(text1=clean_preference, text2="dark", strategy="symbols")}}
  {{SendMessage(message="Dark mode is enabled")}}
{{else}}
  {{SendMessage(message="Using light mode")}}
{{/if}}
```

### Complex JSON Processing
```newo
{{!-- Process nested JSON data --}}
{{Set(name="user_profile", value='
{
  "personal": {
    "name": "Alice Smith",
    "title": "Software Engineer"
  },
  "contact": {
    "email": "alice@company.com",
    "phone": "+1-555-0123"
  }
}')}}}

{{Set(name="user_name", value=Stringify(GetValueJSON(
  obj=GetValueJSON(obj=user_profile, key="personal"),
  key="name"
)))}}

{{Set(name="user_email", value=Stringify(GetValueJSON(
  obj=GetValueJSON(obj=user_profile, key="contact"), 
  key="email"
)))}}

{{SendMessage(message=Concat("Contact: ", user_name, " (", user_email, ")"))}}
```

### Dynamic Content Cleaning
```newo
{{!-- Clean AI-generated content --}}
{{#system~}}
Generate a JSON object with a "message" field containing a greeting.
{{~/system}}

{{#assistant~}}
{{Gen(name="ai_response", jsonSchema='{"type": "object", "properties": {"message": {"type": "string"}}}')}}
{{~/assistant}}

{{Set(name="clean_message", value=Stringify(GetValueJSON(obj=ai_response, key="message")))}}
{{SendMessage(message=clean_message)}}
```

## Integration Examples

### With Memory Management
```newo
{{!-- Clean conversation history for processing --}}
{{Set(name="last_message", value=GetMemory(count="1", fromPerson="User"))}}
{{Set(name="clean_message", value=Stringify(last_message))}}

{{#system~}}
Respond to this user message: {{clean_message}}
{{~/system}}

{{#assistant~}}
{{Gen(name="response")}}
{{~/assistant}}

{{SendMessage(message=response)}}
```

### With External Commands
```newo
{{!-- Clean data before sending to external systems --}}
{{Set(name="user_data", value=GetUser(field="name"))}}
{{Set(name="clean_name", value=Stringify(user_data))}}

{{SendCommand(
  command="update_external_profile",
  user_name=clean_name,
  timestamp=GetDateTime()
)}}
```

### With State Comparison
```newo
{{!-- Clean values for accurate comparison --}}
{{Set(name="current_step", value=Stringify(GetState(name="workflow_step")))}}
{{Set(name="target_step", value=Stringify("checkout"))}}

{{#if IsSimilar(text1=current_step, text2=target_step, strategy="symbols")}}
  {{SendMessage(message="Ready for checkout process")}}
{{else}}
  {{SendMessage(message=Concat("Currently at step: ", current_step))}}
{{/if}}
```

## Data Type Handling

### String Values
```newo
{{!-- Remove outer quotes --}}
{{Set(name="quoted", value='"Hello World"')}}
{{Set(name="clean", value=Stringify(quoted))}}
{{!-- Result: Hello World --}}
```

### JSON Strings  
```newo
{{!-- Extract JSON string values --}}
{{Set(name="json_value", value=GetValueJSON(obj='{"key": "value"}', key="key"))}}
{{Set(name="clean_value", value=Stringify(json_value))}}
{{!-- Result: value (without quotes) --}}
```

### Complex Objects
```newo
{{!-- Convert complex objects to string --}}
{{Set(name="actor_list", value=GetActors())}}
{{Set(name="actor_string", value=Stringify(actor_list))}}
{{SendMessage(message=Concat("Actors: ", actor_string))}}
```

## Error Handling

### Safe Conversion
```newo
{{!-- Handle potentially invalid data --}}
{{Set(name="raw_data", value=GetState(name="user_input"))}}
{{#if IsEmpty(text=raw_data)}}
  {{Set(name="clean_data", value="")}}
{{else}}
  {{Set(name="clean_data", value=Stringify(raw_data))}}
{{/if}}

{{#if IsEmpty(text=clean_data)}}
  {{SendMessage(message="No data available")}}
{{else}}
  {{SendMessage(message=Concat("Data: ", clean_data))}}
{{/if}}
```

### Null and Undefined Handling
```newo
{{!-- Handle null/undefined values gracefully --}}
{{Set(name="optional_field", value=GetUser(field="middle_name"))}}
{{Set(name="safe_value", value=Stringify(optional_field))}}

{{#if IsEmpty(text=safe_value)}}
  {{SendMessage(message="Middle name not provided")}}
{{else}}
  {{SendMessage(message=Concat("Middle name: ", safe_value))}}
{{/if}}
```

## Performance Optimization

### Batch Processing
```newo
{{!-- Process multiple values efficiently --}}
{{Set(name="val1", value=Stringify(GetUser(field="name")))}}
{{Set(name="val2", value=Stringify(GetUser(field="email")))}}
{{Set(name="val3", value=Stringify(GetUser(field="phone")))}}

{{Set(name="user_summary", value=Concat(val1, " | ", val2, " | ", val3))}}
{{SendMessage(message=user_summary)}}
```

### Caching Strategy
```newo
{{!-- Cache stringified values for reuse --}}
{{Set(name="raw_actors", value=GetActors())}}
{{Set(name="clean_actors", value=Stringify(raw_actors))}}
{{SetState(name="cached_actors", value=clean_actors)}}

{{!-- Reuse cached clean value --}}
{{Set(name="actors_display", value=GetState(name="cached_actors"))}}
{{SendMessage(message=Concat("Available channels: ", actors_display))}}
```

## Common Use Cases

### Email/SMS Formatting
```newo
{{!-- Clean content for messaging --}}
{{Set(name="message_content", value=Stringify('"Your booking is confirmed!"'))}}
{{SendMessage(message=message_content)}}
```

### Database Value Processing
```newo
{{!-- Clean database values for display --}}
{{Set(name="db_result", value=SendCommand(command="get_user_data"))}}
{{Set(name="clean_result", value=Stringify(db_result))}}
{{SendMessage(message=clean_result)}}
```

### API Response Processing
```newo
{{!-- Process API responses --}}
{{Set(name="api_response", value='{"status": "success", "message": "Operation completed"}')}}
{{Set(name="status_message", value=Stringify(GetValueJSON(obj=api_response, key="message")))}}
{{SendMessage(message=status_message)}}
```

## Limitations

- **Quote Detection**: Only removes outer quotes, not internal quotes
- **Complex Objects**: May not handle all object types perfectly
- **Encoding**: Character encoding may affect results
- **Nested Strings**: Deep nesting may require multiple Stringify calls
- **Type Information**: Original data type information is lost

## Related Actions

- [**Concat**](./concat) - Combine cleaned strings
- [**GetValueJSON**](./getvaluejson) - Extract values that need cleaning
- [**IsEmpty**](./isempty) - Check cleaned values
- [**IsSimilar**](./issimilar) - Compare cleaned strings
- [**Set**](./set) - Store cleaned values
- [**SendMessage**](./sendmessage) - Display cleaned content

## Performance Tips

- **Use Wisely**: Only stringify when quotes need removal
- **Cache Results**: Store cleaned values for repeated use
- **Combine Operations**: Chain with other string operations efficiently  
- **Validate Input**: Check for empty/null values before stringify