---
sidebar_position: 11
title: "UpdateValueJSON"
description: "Update values within JSON objects and arrays"
---

# UpdateValueJSON

Update specific values within JSON objects and arrays using path-based addressing.

## Syntax

```newo
UpdateValueJSON(
  json: str,
  path: str,
  value: str
)
```

## Parameters

### Required Parameters

- **`json`** (string): The JSON string to update
- **`path`** (string): JSON path to the value to update (dot notation or bracket notation)
- **`value`** (string): The new value to set at the specified path

## How It Works

1. **JSON Parsing**: Parses the input JSON string into a data structure
2. **Path Resolution**: Navigates to the specified path within the JSON
3. **Value Update**: Updates the value at the specified location
4. **JSON Serialization**: Returns the updated JSON as a string

## Use Cases

### Basic Object Updates
```newo
{{!-- Update a simple property --}}
{{Set(name="user_data", value='{"name": "John", "age": 30, "city": "NYC"}')}}
{{Set(name="updated_data", value=UpdateValueJSON(
  json=user_data,
  path="age",
  value="31"
))}}
{{!-- Result: {"name": "John", "age": "31", "city": "NYC"} --}}
```

### Nested Object Updates
```newo
{{!-- Update nested properties --}}
{{Set(name="config", value='{
  "database": {
    "host": "localhost",
    "port": 5432,
    "credentials": {
      "username": "admin",
      "password": "old_pass"
    }
  }
}')}}

{{Set(name="updated_config", value=UpdateValueJSON(
  json=config,
  path="database.credentials.password",
  value="new_secure_pass"
))}}
```

### Array Element Updates
```newo
{{!-- Update array elements by index --}}
{{Set(name="items", value='["apple", "banana", "cherry"]')}}
{{Set(name="updated_items", value=UpdateValueJSON(
  json=items,
  path="[1]",
  value="orange"
))}}
{{!-- Result: ["apple", "orange", "cherry"] --}}
```

### Complex Nested Updates
```newo
{{!-- Update array elements within objects --}}
{{Set(name="order", value='{
  "id": "12345",
  "items": [
    {"name": "widget", "quantity": 2, "price": 10.00},
    {"name": "gadget", "quantity": 1, "price": 25.00}
  ],
  "status": "pending"
}')}}

{{Set(name="updated_order", value=UpdateValueJSON(
  json=order,
  path="items[0].quantity",
  value="3"
))}}

{{Set(name="final_order", value=UpdateValueJSON(
  json=updated_order,
  path="status",
  value="confirmed"
))}}
```

### Dynamic Path Updates
```newo
{{!-- Build paths dynamically --}}
{{Set(name="product_id", value="widget_001")}}
{{Set(name="field_name", value="price")}}
{{Set(name="inventory", value='{
  "widget_001": {"name": "Super Widget", "price": 19.99, "stock": 50},
  "gadget_002": {"name": "Mega Gadget", "price": 39.99, "stock": 25}
}')}}

{{Set(name="path", value=Concat(product_id, ".", field_name))}}
{{Set(name="updated_inventory", value=UpdateValueJSON(
  json=inventory,
  path=path,
  value="24.99"
))}}
```

### User Profile Management
```newo
{{!-- Update user preferences --}}
{{Set(name="user_profile", value=GetState(name="current_user_profile"))}}
{{Set(name="new_preference", value=GetMemory(key="user_language_preference"))}}

{{Set(name="updated_profile", value=UpdateValueJSON(
  json=user_profile,
  path="preferences.language",
  value=new_preference
))}}

{{SetState(name="current_user_profile", value=updated_profile)}}
{{SendMessage(message="Your language preference has been updated!")}}
```

### Configuration Updates
```newo
{{!-- Update system configuration --}}
{{Set(name="system_config", value=GetAKB(key="system_configuration"))}}
{{Set(name="new_timeout", value="30")}}

{{Set(name="updated_config", value=UpdateValueJSON(
  json=system_config,
  path="api.timeout_seconds",
  value=new_timeout
))}}

{{SetAKB(key="system_configuration", value=updated_config)}}
{{SendSystemEvent(eventIdn="config_updated", 
  field="api.timeout_seconds", 
  value=new_timeout
)}}
```

## Advanced Patterns

### Conditional Updates
```newo
{{!-- Update based on conditions --}}
{{Set(name="user_data", value=GetState(name="user_profile"))}}
{{Set(name="user_age", value=GetValueJSON(json=user_data, path="age"))}}

{{#if GreaterThan(user_age, "18")}}
  {{Set(name="updated_data", value=UpdateValueJSON(
    json=user_data,
    path="permissions.adult_content",
    value="true"
  ))}}
{{else}}
  {{Set(name="updated_data", value=UpdateValueJSON(
    json=user_data,
    path="permissions.adult_content",
    value="false"
  ))}}
{{/if}}
```

### Batch Updates
```newo
{{!-- Perform multiple updates sequentially --}}
{{Set(name="data", value='{"name": "", "email": "", "status": "inactive"}')}}

{{!-- Collect user information --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{Set(name="user_email", value=GetUser(field="email"))}}

{{!-- Apply updates --}}
{{Set(name="step1", value=UpdateValueJSON(json=data, path="name", value=user_name))}}
{{Set(name="step2", value=UpdateValueJSON(json=step1, path="email", value=user_email))}}
{{Set(name="final_data", value=UpdateValueJSON(json=step2, path="status", value="active"))}}

{{SendMessage(message="Profile updated successfully!")}}
```

### Error Handling
```newo
{{!-- Validate JSON before updating --}}
{{#if IsEmpty(text=json_data)}}
  {{SendSystemEvent(eventIdn="error", message="Empty JSON data provided")}}
{{else}}
  {{Set(name="updated_json", value=UpdateValueJSON(
    json=json_data,
    path=target_path,
    value=new_value
  ))}}
  
  {{#if IsEmpty(text=updated_json)}}
    {{SendSystemEvent(eventIdn="error", message="JSON update failed")}}
  {{else}}
    {{SendMessage(message="Data updated successfully")}}
  {{/if}}
{{/if}}
```

### Integration with External APIs
```newo
{{!-- Update configuration for API integration --}}
{{Set(name="integration_config", value=GetAKB(key="api_integrations"))}}
{{Set(name="new_api_key", value=GetMemory(key="new_api_credentials"))}}

{{Set(name="updated_config", value=UpdateValueJSON(
  json=integration_config,
  path="services.payment_gateway.api_key",
  value=new_api_key
))}}

{{SetAKB(key="api_integrations", value=updated_config)}}
{{SendSystemEvent(eventIdn="api_config_updated", 
  service="payment_gateway"
)}}
```

## Limitations

- **Path Validity**: Requires valid JSON paths; invalid paths may cause errors
- **JSON Format**: Input must be valid JSON format
- **Type Conversion**: All values are treated as strings in the update
- **Deep Nesting**: Very deeply nested JSON may have performance implications
- **Array Bounds**: Array index updates must be within existing bounds
- **Concurrent Updates**: No built-in support for concurrent JSON modifications

## Troubleshooting

### Common Issues

**Invalid JSON format**:
```newo
{{!-- Validate JSON before updating --}}
{{Set(name="test_parse", value=GetValueJSON(json=input_json, path="test"))}}
{{#if IsEmpty(text=test_parse)}}
  {{SendSystemEvent(eventIdn="json_error", message="Invalid JSON format")}}
{{/if}}
```

**Invalid path**:
```newo
{{!-- Check if path exists before updating --}}
{{Set(name="current_value", value=GetValueJSON(json=data, path=target_path))}}
{{#if IsEmpty(text=current_value)}}
  {{SendMessage(message="Path does not exist in JSON")}}
{{else}}
  {{UpdateValueJSON(json=data, path=target_path, value=new_value)}}
{{/if}}
```

## Related Actions

- [**GetValueJSON**](./getvaluejson) - Retrieve values from JSON
- [**Stringify**](./stringify) - Convert objects to JSON strings
- [**Set**](./set) - Store updated JSON data
- [**GetState**](./getstate) - Retrieve JSON from state
- [**SetAKB**](./setakb) - Store JSON in knowledge base
- [**SendSystemEvent**](./sendsystemevent) - Log update events

## Performance Tips

- **Validate Input**: Always validate JSON format before updating
- **Cache Results**: Store frequently updated JSON in state or memory
- **Batch Operations**: Group related updates to minimize parsing overhead
- **Path Optimization**: Use efficient path notation for better performance