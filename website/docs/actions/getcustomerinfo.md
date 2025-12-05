---
sidebar_position: 55
title: "GetCustomerInfo"
description: "Retrieve comprehensive customer information and profile data"
---

# GetCustomerInfo

Retrieve comprehensive customer information including profile data, attributes, and metadata. This action provides a complete view of customer data stored in the system.

## Syntax

```newo
GetCustomerInfo(
  field: str = None
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `field` | string | No | Specific field to retrieve (returns full info if not specified) |

## Returns

- **object** - Full customer information when no field specified
- **any** - Specific field value when field parameter is provided

## Basic Usage

### Get Full Customer Info
```newo
{{!-- Retrieve all customer information --}}
{{Set(name="customer", value=GetCustomerInfo())}}

{{SendMessage(message=Concat("Hello, ", GetValueJSON(json=customer, key="name"), "!"))}}
```

### Get Specific Field
```newo
{{!-- Get customer email --}}
{{Set(name="customer_email", value=GetCustomerInfo(field="email"))}}

{{!-- Get customer phone --}}
{{Set(name="customer_phone", value=GetCustomerInfo(field="phone"))}}
```

## Common Use Cases

### Customer Personalization
```newo
{{!-- Personalize interaction based on customer data --}}
{{Set(name="customer_data", value=GetCustomerInfo())}}
{{Set(name="customer_name", value=GetValueJSON(json=customer_data, key="name"))}}
{{Set(name="customer_tier", value=GetValueJSON(json=customer_data, key="membershipTier"))}}

{{#if IsSimilar(text1=customer_tier, text2="premium")}}
  {{SendMessage(message=Concat("Welcome back, ", customer_name, "! As a premium member, you have priority access."))}}
{{else}}
  {{SendMessage(message=Concat("Hello, ", customer_name, "! How can I assist you today?"))}}
{{/if}}
```

### Customer Verification
```newo
{{!-- Verify customer identity --}}
{{Set(name="stored_phone", value=GetCustomerInfo(field="phone"))}}
{{Set(name="provided_phone", value=GetState(name="verification_phone"))}}

{{#if IsSimilar(text1=stored_phone, text2=provided_phone)}}
  {{SetState(name="customer_verified", value="true")}}
  {{SendMessage(message="Identity verified. How can I help you?")}}
{{else}}
  {{SendMessage(message="Phone number doesn't match our records. Please try again.")}}
{{/if}}
```

### Customer Context for AI
```newo
{{!-- Provide customer context to AI --}}
{{Set(name="customer_info", value=GetCustomerInfo())}}

{{#system~}}
You are assisting a customer with the following profile:
- Name: {{GetValueJSON(json=customer_info, key="name")}}
- Account Type: {{GetValueJSON(json=customer_info, key="accountType")}}
- Previous Interactions: {{GetValueJSON(json=customer_info, key="interactionCount")}}

Provide personalized assistance based on their profile.
{{~/system}}

{{#assistant~}}
{{Gen(temperature=0.6)}}
{{~/assistant}}
```

### Multi-Channel Customer Recognition
```newo
{{!-- Recognize customer across channels --}}
{{Set(name="customer_data", value=GetCustomerInfo())}}
{{Set(name="preferred_channel", value=GetValueJSON(json=customer_data, key="preferredChannel"))}}
{{Set(name="current_channel", value=GetActor(field="integrationIdn"))}}

{{#if not IsSimilar(text1=preferred_channel, text2=current_channel)}}
  {{SendMessage(message=Concat(
    "I see you usually reach us via ", preferred_channel,
    ". Would you like me to continue here or switch?"
  ))}}
{{/if}}
```

## Related Actions

- [**GetCustomer**](./getcustomer) - Alternative customer data access
- [**GetCustomerAttribute**](./getcustomerattribute) - Get specific attributes
- [**SetCustomerAttribute**](./setcustomerattribute) - Set customer attributes
- [**GetUser**](./getuser) - Get user information
- [**UpdateUser**](./updateuser) - Update user data
