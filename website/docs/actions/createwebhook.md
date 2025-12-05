---
sidebar_position: 58
title: "CreateWebhook"
description: "Create a new webhook for system integration"
---

# CreateWebhook

Create a new webhook for integrating with external systems. Webhooks enable real-time communication between the Newo platform and external services through HTTP callbacks.

## Syntax

```newo
CreateWebhook(
  webhookIdn: str,
  webhookType: Literal["incoming", "outgoing"],
  url: str = None,
  headers: dict = None,
  events: List[str] = None
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `webhookIdn` | string | Yes | Unique identifier for the webhook |
| `webhookType` | string | Yes | Type: "incoming" or "outgoing" |
| `url` | string | No* | Target URL (required for outgoing webhooks) |
| `headers` | dict | No | Custom headers to include in requests |
| `events` | array | No | List of events to trigger the webhook |

## Returns

- **object** - Created webhook configuration including generated URLs and IDs

## Basic Usage

### Create Outgoing Webhook
```newo
{{!-- Create webhook to notify external CRM --}}
{{Set(name="webhook", value=CreateWebhook(
  webhookIdn="crm_sync_webhook",
  webhookType="outgoing",
  url="https://api.example-crm.com/webhooks/newo",
  headers={"Authorization": "Bearer TOKEN", "Content-Type": "application/json"},
  events=["customer.created", "order.completed"]
))}}

{{SendMessage(message="CRM integration webhook created successfully.")}}
```

### Create Incoming Webhook
```newo
{{!-- Create webhook to receive external notifications --}}
{{Set(name="incoming_hook", value=CreateWebhook(
  webhookIdn="payment_notifications",
  webhookType="incoming",
  events=["payment.success", "payment.failed"]
))}}

{{Set(name="webhook_url", value=GetValueJSON(json=incoming_hook, key="url"))}}
{{SendMessage(message=Concat("Webhook URL for payment provider: ", webhook_url))}}
```

## Common Use Cases

### E-commerce Integration
```newo
{{!-- Create webhook for order updates --}}
{{Set(name="order_webhook", value=CreateWebhook(
  webhookIdn="shopify_orders",
  webhookType="outgoing",
  url=shop_webhook_url,
  headers={"X-Shopify-Access-Token": access_token},
  events=["order.created", "order.fulfilled", "order.cancelled"]
))}}

{{SendSystemEvent(
  eventIdn="integration_created",
  integrationType="shopify",
  webhookId="shopify_orders"
)}}
```

### Notification Service Setup
```newo
{{!-- Create webhook for real-time notifications --}}
{{Set(name="notification_hook", value=CreateWebhook(
  webhookIdn="slack_notifications",
  webhookType="outgoing",
  url="https://hooks.slack.com/services/XXX/YYY/ZZZ",
  events=["escalation.created", "customer.vip_request"]
))}}
```

### Dynamic Webhook Creation
```newo
{{!-- Create customer-specific webhook --}}
{{Set(name="customer_id", value=GetUser(field="id"))}}
{{Set(name="webhook_id", value=Concat("customer_", customer_id, "_webhook"))}}

{{Set(name="customer_webhook", value=CreateWebhook(
  webhookIdn=webhook_id,
  webhookType="incoming"
))}}

{{!-- Store webhook URL for customer --}}
{{SetCustomerAttribute(
  field="personal_webhook_url",
  value=GetValueJSON(json=customer_webhook, key="url")
)}}
```

## Best Practices

### 1. Use Descriptive Identifiers
```newo
{{!-- Good: Clear, descriptive webhook names --}}
{{CreateWebhook(webhookIdn="stripe_payment_success", ...)}}
{{CreateWebhook(webhookIdn="calendar_booking_created", ...)}}

{{!-- Avoid: Generic names --}}
{{CreateWebhook(webhookIdn="webhook1", ...)}}
```

### 2. Include Security Headers
```newo
{{!-- Always include authentication --}}
{{CreateWebhook(
  webhookIdn="secure_webhook",
  webhookType="outgoing",
  url=target_url,
  headers={
    "Authorization": Concat("Bearer ", api_token),
    "X-Webhook-Secret": webhook_secret
  }
)}}
```

### 3. Validate Before Creating
```newo
{{!-- Check if webhook already exists --}}
{{Set(name="existing", value=GetWebhook(webhookIdn=webhook_id, webhookType="outgoing"))}}

{{#if IsEmpty(text=existing)}}
  {{CreateWebhook(webhookIdn=webhook_id, ...)}}
{{else}}
  {{SendMessage(message="Webhook already exists.")}}
{{/if}}
```

## Related Actions

- [**GetWebhook**](./getwebhook) - Retrieve webhook configuration
- [**DeleteWebhook**](./deletewebhook) - Remove webhooks
- [**CreateConnector**](./createconnector) - Create connectors
- [**SendCommand**](./sendcommand) - Trigger webhook calls
