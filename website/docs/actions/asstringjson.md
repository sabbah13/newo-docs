---
sidebar_position: 65
title: "AsStringJSON"
description: "Convert JSON value to string representation"
---

# AsStringJSON

Convert a JSON value (object, array, or primitive) to its string representation. This action is useful for serialization, logging, display, and when you need to store JSON data as a string.

## Syntax

```newo
AsStringJSON(
  json: any
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `json` | any | Yes | JSON value to convert to string |

## Returns

- **string** - String representation of the JSON value

## Basic Usage

### Convert Object to String
```newo
{{!-- Convert JSON object to string --}}
{{Set(name="user_data", value={"name": "John", "age": 30})}}
{{Set(name="user_string", value=AsStringJSON(json=user_data))}}
{{!-- Result: '{"name":"John","age":30}' --}}
```

### Convert Array to String
```newo
{{!-- Convert array to string --}}
{{Set(name="items", value=CreateArray("apple", "banana", "cherry"))}}
{{Set(name="items_string", value=AsStringJSON(json=items))}}
{{!-- Result: '["apple","banana","cherry"]' --}}
```

## Common Use Cases

### Logging Complex Data
```newo
{{!-- Log complex data structure --}}
{{Set(name="transaction", value={
  "id": transaction_id,
  "amount": amount,
  "items": order_items,
  "timestamp": GetDateTime()
})}}

{{SendSystemEvent(
  eventIdn="transaction_logged",
  transactionData=AsStringJSON(json=transaction)
)}}
```

### Store JSON in Attribute
```newo
{{!-- Store complex data as string attribute --}}
{{Set(name="preferences", value={
  "theme": "dark",
  "notifications": true,
  "language": "en"
})}}

{{SetCustomerAttribute(
  field="user_preferences",
  value=AsStringJSON(json=preferences)
)}}
```

### Display JSON to User
```newo
{{!-- Show formatted data to user --}}
{{Set(name="booking_details", value={
  "date": booking_date,
  "time": booking_time,
  "guests": party_size,
  "specialRequests": special_requests
})}}

{{SendMessage(message=Concat(
  "Here are your booking details:\n",
  AsStringJSON(json=booking_details)
))}}
```

### API Request Preparation
```newo
{{!-- Prepare JSON body for API call --}}
{{Set(name="api_payload", value={
  "action": "create_reservation",
  "customerId": GetUser(field="id"),
  "details": reservation_data
})}}

{{SendCommand(
  commandIdn="api_call",
  integrationIdn="external_api",
  body=AsStringJSON(json=api_payload)
)}}
```

### Comparison and Validation
```newo
{{!-- Compare JSON structures as strings --}}
{{Set(name="expected", value={"status": "active", "verified": true})}}
{{Set(name="actual", value=GetState(name="user_status"))}}

{{#if IsSimilar(
  text1=AsStringJSON(json=expected),
  text2=AsStringJSON(json=actual)
)}}
  {{SendMessage(message="Status verified.")}}
{{else}}
  {{SendMessage(message="Status mismatch detected.")}}
{{/if}}
```

### Debug Output
```newo
{{!-- Debug complex variables --}}
{{Set(name="debug_data", value={
  "currentState": GetState(name="flow_state"),
  "userInfo": GetUser(),
  "memory": GetMemory(count="3"),
  "timestamp": GetDateTime()
})}}

{{SendSystemEvent(
  eventIdn="debug_snapshot",
  data=AsStringJSON(json=debug_data)
)}}
```

## Advanced Patterns

### Nested JSON Serialization
```newo
{{!-- Serialize nested structures --}}
{{Set(name="complex_data", value={
  "user": {
    "profile": GetUser(),
    "preferences": GetCustomerAttribute(field="preferences")
  },
  "session": {
    "id": session_id,
    "history": GetMemory(count="5")
  }
})}}

{{Set(name="serialized", value=AsStringJSON(json=complex_data))}}
{{SetState(name="session_snapshot", value=serialized)}}
```

### State Persistence
```newo
{{!-- Save complex state for later restoration --}}
{{Set(name="current_state", value={
  "step": GetState(name="current_step"),
  "data": GetState(name="collected_data"),
  "timestamp": GetDateTime()
})}}

{{SetCustomerAttribute(
  field="saved_session_state",
  value=AsStringJSON(json=current_state)
)}}

{{SendMessage(message="Your progress has been saved.")}}
```

## Comparison with Stringify

| AsStringJSON | Stringify |
|-------------|-----------|
| Produces valid JSON string | Produces readable string |
| Includes quotes and escaping | May clean up formatting |
| Best for data storage/transfer | Best for display to users |
| Preserves JSON structure | May simplify output |

```newo
{{!-- Example comparison --}}
{{Set(name="data", value={"name": "Test"})}}
{{Set(name="as_json", value=AsStringJSON(json=data))}}     {{!-- '{"name":"Test"}' --}}
{{Set(name="as_string", value=Stringify(data))}}           {{!-- May vary --}}
```

## Related Actions

- [**Stringify**](./stringify) - General string conversion
- [**GetValueJSON**](./getvaluejson) - Extract JSON values
- [**UpdateValueJSON**](./updatevaluejson) - Modify JSON
- [**CreateArray**](./createarray) - Create arrays
