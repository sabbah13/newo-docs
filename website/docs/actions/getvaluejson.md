---
sidebar_position: 34
title: "GetValueJSON"
description: "Extract specific values from JSON objects and arrays using keys"
---

# GetValueJSON

Extracts values from JSON objects and arrays using specified keys. Essential for processing structured data, API responses, and complex data manipulation in workflows.

## Syntax

```newo
GetValueJSON(
  obj: str,
  key: str
)
```

## Parameters

### Required Parameters

- **`obj`** (string): JSON object or array string to query
- **`key`** (string): Key or path to extract the value
  - Object keys: `"field_name"`
  - Array indices: `"0"`, `"1"`, `"2"` 
  - Nested paths: `"parent.child.field"`

## Return Values

- **Extracted value**: The value associated with the specified key
- **JSON string**: Complex values returned as JSON strings
- **Empty string**: If key not found or invalid JSON

## How It Works

1. **JSON Parsing**: Parses the JSON object or array string
2. **Key Resolution**: Resolves the specified key or path
3. **Value Extraction**: Extracts the associated value
4. **Type Preservation**: Maintains data types in JSON format
5. **Error Handling**: Returns empty string for invalid operations

## Use Cases

### Basic Object Value Extraction
```newo
{{!-- Extract user information from JSON --}}
{{Set(name="user_data", value='{"name": "John Doe", "email": "john@example.com", "role": "admin"}')}}
{{Set(name="user_name", value=GetValueJSON(obj=user_data, key="name"))}}
{{Set(name="user_email", value=GetValueJSON(obj=user_data, key="email"))}}

{{SendMessage(message=Concat("User: ", Stringify(user_name), " (", Stringify(user_email), ")"))}}
```

### Array Element Access
```newo
{{!-- Access array elements by index --}}
{{Set(name="menu_items", value='["pizza", "burger", "salad", "pasta"]')}}
{{Set(name="first_item", value=GetValueJSON(obj=menu_items, key="0"))}}
{{Set(name="second_item", value=GetValueJSON(obj=menu_items, key="1"))}}

{{SendMessage(message=Concat("Top items: ", Stringify(first_item), ", ", Stringify(second_item)))}}
```

### API Response Processing
```newo
{{!-- Process external API responses --}}
{{Set(name="api_response", value=SendCommand(command="get_weather"))}}
{{Set(name="temperature", value=GetValueJSON(obj=api_response, key="current_temp"))}}
{{Set(name="condition", value=GetValueJSON(obj=api_response, key="weather_condition"))}}

{{SendMessage(message=Concat("Current weather: ", Stringify(temperature), "°F, ", Stringify(condition)))}}
```

### Complex Data Structure Navigation
```newo
{{!-- Navigate nested JSON structures --}}
{{Set(name="profile_data", value='{
  "user": {
    "personal": {
      "name": "Alice Smith",
      "age": 28
    },
    "contact": {
      "email": "alice@company.com",
      "phone": "+1-555-0123"
    }
  },
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}')}}

{{Set(name="user_name", value=GetValueJSON(obj=profile_data, key="user.personal.name"))}}
{{Set(name="user_theme", value=GetValueJSON(obj=profile_data, key="preferences.theme"))}}

{{SendMessage(message=Concat("Welcome ", Stringify(user_name), " - Theme: ", Stringify(user_theme)))}}
```

## Advanced Patterns

### Dynamic Key Access
```newo
{{!-- Use variables as keys --}}
{{Set(name="data_object", value='{"status": "active", "mode": "production", "version": "2.1"}')}}
{{Set(name="requested_field", value=GetTriggeredAct())}}

{{Set(name="field_value", value=GetValueJSON(obj=data_object, key=requested_field))}}
{{#if IsEmpty(text=field_value)}}
  {{SendMessage(message=Concat("Field '", requested_field, "' not found"))}}
{{else}}
  {{SendMessage(message=Concat(requested_field, ": ", Stringify(field_value)))}}
{{/if}}
```

### Array Processing
```newo
{{!-- Process JSON arrays systematically --}}
{{Set(name="users_array", value='[
  {"name": "John", "role": "admin"},
  {"name": "Jane", "role": "user"},
  {"name": "Bob", "role": "moderator"}
]')}}

{{Set(name="first_user", value=GetValueJSON(obj=users_array, key="0"))}}
{{Set(name="first_name", value=GetValueJSON(obj=first_user, key="name"))}}
{{Set(name="first_role", value=GetValueJSON(obj=first_user, key="role"))}}

{{SendMessage(message=Concat("First user: ", Stringify(first_name), " (", Stringify(first_role), ")"))}}
```

### Conditional Data Extraction
```newo
{{!-- Extract data based on conditions --}}
{{Set(name="config_data", value='{"dev_mode": true, "api_endpoint": "https://dev.api.com", "debug_level": "verbose"}')}}
{{Set(name="is_dev_mode", value=GetValueJSON(obj=config_data, key="dev_mode"))}}

{{#if IsSimilar(text1=Stringify(is_dev_mode), text2="true")}}
  {{Set(name="endpoint", value=GetValueJSON(obj=config_data, key="api_endpoint"))}}
  {{Set(name="debug", value=GetValueJSON(obj=config_data, key="debug_level"))}}
  {{SendMessage(message=Concat("Dev mode: ", Stringify(endpoint), " (", Stringify(debug), ")"))}}
{{else}}
  {{SendMessage(message="Production mode active")}}
{{/if}}
```

### Error-Safe Extraction
```newo
{{!-- Safe extraction with error handling --}}
{{Set(name="json_data", value=GetState(name="stored_json"))}}
{{#if IsEmpty(text=json_data)}}
  {{SendMessage(message="No JSON data available")}}
{{else}}
  {{Set(name="extracted_value", value=GetValueJSON(obj=json_data, key="target_field"))}}
  {{#if IsEmpty(text=extracted_value)}}
    {{SendMessage(message="Target field not found in JSON")}}
  {{else}}
    {{SendMessage(message=Concat("Extracted: ", Stringify(extracted_value)))}}
  {{/if}}
{{/if}}
```

## Integration Examples

### With AI Generation
```newo
{{!-- Use JSON data in AI prompts --}}
{{Set(name="user_context", value='{"name": "Sarah", "preferences": {"style": "casual", "topics": ["tech", "travel"]}}')}}
{{Set(name="user_name", value=GetValueJSON(obj=user_context, key="name"))}}
{{Set(name="user_style", value=GetValueJSON(obj=user_context, key="preferences.style"))}}

{{#system~}}
Generate a {{Stringify(user_style)}} response for {{Stringify(user_name)}} about their travel interests.
{{~/system}}

{{#assistant~}}
{{Gen(name="personalized_response")}}
{{~/assistant}}

{{SendMessage(message=personalized_response)}}
```

### With State Management
```newo
{{!-- Store and retrieve structured state --}}
{{Set(name="user_session", value='{"step": 2, "data": {"form_filled": true, "payment_ready": false}}')}}
{{Set(name="current_step", value=GetValueJSON(obj=user_session, key="step"))}}
{{Set(name="form_status", value=GetValueJSON(obj=user_session, key="data.form_filled"))}}

{{SetState(name="session_step", value=Stringify(current_step))}}
{{SendMessage(message=Concat("Step ", Stringify(current_step), " - Form: ", Stringify(form_status)))}}
```

### With External Commands
```newo
{{!-- Process command responses --}}
{{Set(name="command_response", value=SendCommand(command="get_order_status", orderId="12345"))}}
{{Set(name="order_status", value=GetValueJSON(obj=command_response, key="status"))}}
{{Set(name="estimated_delivery", value=GetValueJSON(obj=command_response, key="delivery.estimated_time"))}}

{{SendMessage(message=Concat("Order status: ", Stringify(order_status), " - ETA: ", Stringify(estimated_delivery)))}}
```

### With Memory Processing
```newo
{{!-- Extract structured data from memory --}}
{{Set(name="conversation_metadata", value=GetMemory(count="1", includeMetadata="true"))}}
{{Set(name="message_timestamp", value=GetValueJSON(obj=conversation_metadata, key="timestamp"))}}
{{Set(name="message_type", value=GetValueJSON(obj=conversation_metadata, key="type"))}}

{{SendMessage(message=Concat("Last message: ", Stringify(message_type), " at ", Stringify(message_timestamp)))}}
```

## Path Navigation

### Dot Notation
```newo
{{!-- Navigate nested objects with dots --}}
{{Set(name="nested_data", value='{"level1": {"level2": {"value": "found"}}}')}}
{{Set(name="deep_value", value=GetValueJSON(obj=nested_data, key="level1.level2.value"))}}
{{SendMessage(message=Concat("Deep value: ", Stringify(deep_value)))}}
```

### Array Index Access
```newo
{{!-- Access array elements in nested structures --}}
{{Set(name="complex_structure", value='{
  "users": [
    {"name": "John", "skills": ["JavaScript", "Python"]},
    {"name": "Jane", "skills": ["React", "Node.js"]}
  ]
}')}}

{{Set(name="first_user", value=GetValueJSON(obj=complex_structure, key="users.0"))}}
{{Set(name="first_user_name", value=GetValueJSON(obj=first_user, key="name"))}}
{{SendMessage(message=Concat("First user: ", Stringify(first_user_name)))}}
```

### Mixed Path Types
```newo
{{!-- Combine object keys and array indices --}}
{{Set(name="mixed_data", value='{
  "departments": {
    "engineering": [
      {"name": "Alice", "position": "Senior Dev"},
      {"name": "Bob", "position": "Tech Lead"}
    ]
  }
}')}}

{{Set(name="eng_lead", value=GetValueJSON(obj=mixed_data, key="departments.engineering.1"))}}
{{Set(name="lead_name", value=GetValueJSON(obj=eng_lead, key="name"))}}
{{SendMessage(message=Concat("Tech Lead: ", Stringify(lead_name)))}}
```

## Data Type Handling

### String Values
```newo
{{Set(name="string_data", value='{"message": "Hello World", "status": "active"}')}}
{{Set(name="message", value=GetValueJSON(obj=string_data, key="message"))}}
{{!-- Result: "Hello World" (with quotes) --}}
{{SendMessage(message=Stringify(message))}}  {{!-- Clean: Hello World --}}
```

### Numeric Values
```newo
{{Set(name="numeric_data", value='{"count": 42, "price": 19.99, "active": true}')}}
{{Set(name="count", value=GetValueJSON(obj=numeric_data, key="count"))}}
{{Set(name="price", value=GetValueJSON(obj=numeric_data, key="price"))}}
{{SendMessage(message=Concat("Count: ", Stringify(count), " Price: $", Stringify(price)))}}
```

### Boolean and Null Values
```newo
{{Set(name="mixed_types", value='{"enabled": true, "disabled": false, "empty": null}')}}
{{Set(name="enabled", value=GetValueJSON(obj=mixed_types, key="enabled"))}}
{{Set(name="empty_val", value=GetValueJSON(obj=mixed_types, key="empty"))}}

{{#if IsSimilar(text1=Stringify(enabled), text2="true")}}
  {{SendMessage(message="Feature is enabled")}}
{{/if}}
```

## Error Handling

### Invalid JSON Handling
```newo
{{!-- Handle malformed JSON gracefully --}}
{{Set(name="potentially_bad_json", value=GetState(name="external_data"))}}
{{Set(name="safe_value", value=GetValueJSON(obj=potentially_bad_json, key="safe_field"))}}

{{#if IsEmpty(text=safe_value)}}
  {{SendMessage(message="Unable to extract data - check JSON format")}}
{{else}}
  {{SendMessage(message=Concat("Extracted: ", Stringify(safe_value)))}}
{{/if}}
```

### Missing Key Handling
```newo
{{!-- Handle missing keys gracefully --}}
{{Set(name="incomplete_data", value='{"name": "John", "email": "john@example.com"}')}}
{{Set(name="phone", value=GetValueJSON(obj=incomplete_data, key="phone"))}}

{{#if IsEmpty(text=phone)}}
  {{SendMessage(message="Phone number not provided")}}
{{else}}
  {{SendMessage(message=Concat("Phone: ", Stringify(phone)))}}
{{/if}}
```

## Limitations

- **String Input Only**: JSON must be provided as string
- **Quoted Output**: String values returned with quotes
- **Path Complexity**: Limited nested path navigation
- **No Array Filtering**: Cannot filter arrays by conditions
- **Performance**: Large JSON objects may impact performance

## Related Actions

- [**Stringify**](./stringify) - Clean extracted values
- [**UpdateValueJSON**](./updatevaluejson) - Modify JSON values
- [**IsEmpty**](./isempty) - Validate extraction results
- [**Concat**](./concat) - Build extraction paths
- [**Set**](./set) - Store extracted values
- [**SendCommand**](./sendcommand) - Get JSON from external sources

## Performance Tips

- **Cache Parsed Data**: Store frequently accessed JSON in state
- **Minimize Parsing**: Extract multiple values in sequence
- **Validate JSON**: Check format before extraction
- **Use Specific Keys**: Avoid complex nested path navigation
- **Clean Values**: Use Stringify to clean extracted strings