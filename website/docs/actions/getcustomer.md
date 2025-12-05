---
sidebar_position: 56
title: "GetCustomer"
description: "Retrieve customer data by identifier"
---

# GetCustomer

Retrieve customer data using a customer identifier. This action allows accessing customer records for multi-customer workflows or when working with customer IDs from external systems.

## Syntax

```newo
GetCustomer(
  customerId: str,
  field: str = None
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customerId` | string | Yes | Customer identifier to look up |
| `field` | string | No | Specific field to retrieve |

## Returns

- **object** - Full customer data when no field specified
- **any** - Specific field value when field parameter is provided

## Basic Usage

### Get Customer by ID
```newo
{{!-- Retrieve customer by their ID --}}
{{Set(name="customer", value=GetCustomer(customerId=customer_id_from_event))}}

{{SendMessage(message=Concat("Found customer: ", GetValueJSON(json=customer, key="name")))}}
```

### Get Specific Field
```newo
{{!-- Get customer email by ID --}}
{{Set(name="email", value=GetCustomer(customerId=cust_id, field="email"))}}
```

## Common Use Cases

### Cross-Reference Customers
```newo
{{!-- Look up related customer --}}
{{Set(name="referrer_id", value=GetCustomerAttribute(field="referred_by"))}}

{{#if not IsEmpty(text=referrer_id)}}
  {{Set(name="referrer", value=GetCustomer(customerId=referrer_id))}}
  {{SendMessage(message=Concat(
    "We see you were referred by ",
    GetValueJSON(json=referrer, key="name"),
    ". Thank you for joining us!"
  ))}}
{{/if}}
```

### Multi-Customer Operations
```newo
{{!-- Process multiple customers --}}
{{Set(name="customer_ids", value=GetState(name="batch_customer_ids"))}}

{% for cust_id in customer_ids %}
  {{Set(name="customer_data", value=GetCustomer(customerId=cust_id))}}
  {{!-- Process each customer --}}
  {{SendSystemEvent(
    eventIdn="process_customer",
    customerId=cust_id,
    customerData=customer_data
  )}}
{% endfor %}
```

### External System Integration
```newo
{{!-- Look up customer from external reference --}}
{{Set(name="external_customer_id", value=GetState(name="crm_customer_id"))}}
{{Set(name="customer", value=GetCustomer(customerId=external_customer_id))}}

{{#if not IsEmpty(text=customer)}}
  {{!-- Customer found --}}
  {{SendMessage(message="I found your account. How can I help?")}}
{{else}}
  {{!-- Customer not found --}}
  {{SendMessage(message="I couldn't find that account. Let me help you get set up.")}}
{{/if}}
```

## Related Actions

- [**GetCustomerInfo**](./getcustomerinfo) - Get current customer info
- [**GetCustomerAttribute**](./getcustomerattribute) - Get specific attributes
- [**SetCustomerAttribute**](./setcustomerattribute) - Set customer attributes
- [**GetUser**](./getuser) - Get user information
