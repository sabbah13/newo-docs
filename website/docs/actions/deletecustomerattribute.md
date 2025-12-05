---
sidebar_position: 50
title: "DeleteCustomerAttribute"
description: "Delete a customer or project attribute from storage"
---

# DeleteCustomerAttribute

Delete a customer or project attribute from persistent storage. This action removes attribute data that was previously set using SetCustomerAttribute or SetProjectAttribute.

## Syntax

```newo
DeleteCustomerAttribute(
  field: str
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `field` | string | Yes | The attribute field name to delete |

## Returns

- **void** - No return value

## How It Works

1. **Field Resolution**: Identifies the attribute field name to delete
2. **Scope Detection**: Determines if deleting from customer or project scope
3. **Data Removal**: Removes the attribute value from persistent storage
4. **Confirmation**: Operation completes silently (no return value)

## Basic Usage

### Delete a Single Attribute
```newo
{{!-- Remove a temporary attribute after use --}}
{{DeleteCustomerAttribute(field="temp_booking_data")}}
```

### Delete After Processing
```newo
{{!-- Clean up temporary data after processing --}}
{{Set(name="temp_data", value=GetCustomerAttribute(field="pending_order"))}}

{{!-- Process the data --}}
{{Set(name="order_result", value=ProcessOrder(data=temp_data))}}

{{!-- Clean up temporary storage --}}
{{DeleteCustomerAttribute(field="pending_order")}}

{{SendMessage(message=Concat("Order processed: ", order_result))}}
```

## Common Use Cases

### Cleanup Temporary Data
```newo
{{!-- Remove temporary session data --}}
{{DeleteCustomerAttribute(field="session_temp_value")}}
{{DeleteCustomerAttribute(field="pending_verification_code")}}
{{DeleteCustomerAttribute(field="temp_form_data")}}
```

### Reset User Preferences
```newo
{{!-- Reset specific preference to default --}}
{{#if IsSimilar(text1=user_request, text2="reset preferences")}}
  {{DeleteCustomerAttribute(field="notification_preferences")}}
  {{DeleteCustomerAttribute(field="language_preference")}}
  {{SendMessage(message="Your preferences have been reset to defaults.")}}
{{/if}}
```

### Session Cleanup
```newo
{{!-- Clean up at end of conversation session --}}
{{DeleteCustomerAttribute(field="current_intent")}}
{{DeleteCustomerAttribute(field="conversation_context")}}
{{DeleteCustomerAttribute(field="pending_actions")}}
```

### Project Attribute Cleanup
```newo
{{!-- Delete project-level temporary settings --}}
{{DeleteCustomerAttribute(field="project_attributes_setting_temp_value")}}
{{DeleteCustomerAttribute(field="project_attributes_temp_config")}}
```

## Advanced Patterns

### Conditional Deletion
```newo
{{!-- Only delete if attribute exists --}}
{{Set(name="existing_value", value=GetCustomerAttribute(field="temp_data"))}}

{{#if not IsEmpty(text=existing_value)}}
  {{DeleteCustomerAttribute(field="temp_data")}}
  {{Set(name="cleanup_status", value="cleaned")}}
{{else}}
  {{Set(name="cleanup_status", value="already_empty")}}
{{/if}}
```

### Batch Cleanup with Tracking
```newo
{{!-- Track cleanup operations --}}
{{Set(name="deleted_count", value="0")}}

{{Set(name="attrs_to_delete", value=CreateArray("temp_1", "temp_2", "temp_3"))}}

{% for attr in attrs_to_delete %}
  {{DeleteCustomerAttribute(field=attr)}}
  {{Set(name="deleted_count", value=Add(a=deleted_count, b="1"))}}
{% endfor %}

{{SendSystemEvent(
  eventIdn="attributes_cleaned",
  count=deleted_count,
  customer_id=GetUser(field="id")
)}}
```

### Privacy Compliance Cleanup
```newo
{{!-- GDPR-style data deletion request --}}
{{#if IsSimilar(text1=user_request, text2="delete my data")}}
  {{!-- Remove personal data attributes --}}
  {{DeleteCustomerAttribute(field="phone_number")}}
  {{DeleteCustomerAttribute(field="email_address")}}
  {{DeleteCustomerAttribute(field="address")}}
  {{DeleteCustomerAttribute(field="payment_info")}}

  {{SendMessage(message="Your personal data has been deleted from our system.")}}

  {{SendSystemEvent(
    eventIdn="gdpr_deletion_completed",
    customer_id=GetUser(field="id"),
    timestamp=GetDateTime()
  )}}
{{/if}}
```

## Best Practices

### 1. Verify Before Deletion
```newo
{{!-- Check attribute existence before deleting --}}
{{Set(name="value", value=GetCustomerAttribute(field="important_data"))}}
{{#if not IsEmpty(text=value)}}
  {{!-- Log before deletion for audit trail --}}
  {{SendSystemEvent(eventIdn="attribute_deleted", field="important_data")}}
  {{DeleteCustomerAttribute(field="important_data")}}
{{/if}}
```

### 2. Use Consistent Naming
```newo
{{!-- Use prefixes to organize deletable attributes --}}
{{DeleteCustomerAttribute(field="temp_booking_details")}}    {{!-- temp_ for temporary --}}
{{DeleteCustomerAttribute(field="cache_search_results")}}    {{!-- cache_ for cached data --}}
{{DeleteCustomerAttribute(field="session_current_step")}}    {{!-- session_ for session data --}}
```

### 3. Cleanup on Errors
```newo
{{!-- Clean up on error conditions --}}
{{Set(name="result", value=ProcessPayment(data=payment_info))}}

{{#if IsSimilar(text1=result.status, text2="error")}}
  {{!-- Clean up partial data on failure --}}
  {{DeleteCustomerAttribute(field="pending_payment")}}
  {{DeleteCustomerAttribute(field="payment_session_id")}}
  {{SendMessage(message="Payment failed. Please try again.")}}
{{/if}}
```

## Limitations

- **No Return Value**: Cannot confirm deletion success directly
- **No Batch Delete**: Must call separately for each attribute
- **No Pattern Matching**: Cannot delete by wildcard patterns
- **Irreversible**: Deleted data cannot be recovered

## Error Handling

```newo
{{!-- Safe deletion pattern --}}
{% set fields_to_delete = ["temp_1", "temp_2", "nonexistent"] %}

{% for field in fields_to_delete %}
  {{!-- DeleteCustomerAttribute handles missing fields gracefully --}}
  {{DeleteCustomerAttribute(field=field)}}
{% endfor %}
```

## Related Actions

- [**GetCustomerAttribute**](./getcustomerattribute) - Retrieve attribute values
- [**SetCustomerAttribute**](./setcustomerattribute) - Set attribute values
- [**GetState**](./getstate) - Alternative persistent storage
- [**SetState**](./setstate) - Alternative state management
