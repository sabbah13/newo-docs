---
sidebar_position: 59
title: "DeleteWebhook"
description: "Remove a webhook integration"
---

# DeleteWebhook

Remove a webhook integration from the system. This action permanently deletes the webhook configuration and stops all associated event processing.

## Syntax

```newo
DeleteWebhook(
  webhookIdn: str,
  webhookType: Literal["incoming", "outgoing"]
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `webhookIdn` | string | Yes | Webhook identifier to delete |
| `webhookType` | string | Yes | Type of webhook: "incoming" or "outgoing" |

## Returns

- **void** - No return value (operation completes silently)

## Basic Usage

### Delete Outgoing Webhook
```newo
{{!-- Remove CRM sync webhook --}}
{{DeleteWebhook(
  webhookIdn="crm_sync_webhook",
  webhookType="outgoing"
)}}

{{SendMessage(message="CRM integration has been disconnected.")}}
```

### Delete Incoming Webhook
```newo
{{!-- Remove incoming webhook --}}
{{DeleteWebhook(
  webhookIdn="payment_notifications",
  webhookType="incoming"
)}}
```

## Common Use Cases

### Customer Disconnection
```newo
{{!-- Clean up when customer disconnects integration --}}
{{Set(name="customer_webhook_id", value=GetCustomerAttribute(field="integration_webhook_id"))}}

{{#if not IsEmpty(text=customer_webhook_id)}}
  {{DeleteWebhook(
    webhookIdn=customer_webhook_id,
    webhookType="outgoing"
  )}}
  {{DeleteCustomerAttribute(field="integration_webhook_id")}}
  {{SendMessage(message="Your integration has been disconnected successfully.")}}
{{/if}}
```

### Integration Cleanup
```newo
{{!-- Remove old webhooks when upgrading integration --}}
{{Set(name="old_webhooks", value=CreateArray(
  "legacy_webhook_v1",
  "legacy_webhook_v2"
))}}

{% for webhook_id in old_webhooks %}
  {{DeleteWebhook(webhookIdn=webhook_id, webhookType="outgoing")}}
{% endfor %}

{{SendSystemEvent(eventIdn="legacy_webhooks_cleaned")}}
```

### Safe Deletion Pattern
```newo
{{!-- Verify webhook exists before deleting --}}
{{Set(name="webhook", value=GetWebhook(
  webhookIdn=target_webhook_id,
  webhookType="outgoing"
))}}

{{#if not IsEmpty(text=webhook)}}
  {{DeleteWebhook(
    webhookIdn=target_webhook_id,
    webhookType="outgoing"
  )}}
  {{SendMessage(message="Webhook removed successfully.")}}
{{else}}
  {{SendMessage(message="Webhook not found or already removed.")}}
{{/if}}
```

## Related Actions

- [**GetWebhook**](./getwebhook) - Check webhook before deleting
- [**CreateWebhook**](./createwebhook) - Create new webhooks
- [**DeleteConnector**](./deleteconnector) - Remove connectors
