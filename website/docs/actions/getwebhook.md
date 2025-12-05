---
sidebar_position: 57
title: "GetWebhook"
description: "Retrieve webhook configuration and details"
---

# GetWebhook

Retrieve webhook configuration and details for incoming or outgoing webhook integrations. This action allows accessing webhook settings, URLs, and status information.

## Syntax

```newo
GetWebhook(
  webhookIdn: str,
  webhookType: Literal["incoming", "outgoing"]
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `webhookIdn` | string | Yes | Webhook identifier |
| `webhookType` | string | Yes | Type of webhook: "incoming" or "outgoing" |

## Returns

- **object** - Webhook configuration including URL, headers, status, and settings

## Basic Usage

### Get Incoming Webhook
```newo
{{!-- Retrieve incoming webhook configuration --}}
{{Set(name="webhook_config", value=GetWebhook(
  webhookIdn="order_notifications",
  webhookType="incoming"
))}}

{{Set(name="webhook_url", value=GetValueJSON(json=webhook_config, key="url"))}}
```

### Get Outgoing Webhook
```newo
{{!-- Retrieve outgoing webhook configuration --}}
{{Set(name="outgoing_hook", value=GetWebhook(
  webhookIdn="crm_sync",
  webhookType="outgoing"
))}}

{{Set(name="hook_status", value=GetValueJSON(json=outgoing_hook, key="status"))}}
```

## Common Use Cases

### Webhook Status Check
```newo
{{!-- Check webhook health before sending --}}
{{Set(name="webhook", value=GetWebhook(
  webhookIdn="payment_processor",
  webhookType="outgoing"
))}}

{{Set(name="webhook_active", value=GetValueJSON(json=webhook, key="active"))}}

{{#if IsSimilar(text1=webhook_active, text2="true")}}
  {{!-- Webhook is active, proceed --}}
  {{SendCommand(
    commandIdn="process_payment",
    webhookId="payment_processor",
    data=payment_data
  )}}
{{else}}
  {{!-- Webhook inactive, use fallback --}}
  {{SendSystemEvent(eventIdn="webhook_inactive_alert", webhookId="payment_processor")}}
  {{SendMessage(message="Payment processing is temporarily unavailable. Please try again later.")}}
{{/if}}
```

### Dynamic Webhook Configuration
```newo
{{!-- Get webhook URL for external sharing --}}
{{Set(name="incoming_webhook", value=GetWebhook(
  webhookIdn="customer_updates",
  webhookType="incoming"
))}}

{{Set(name="webhook_url", value=GetValueJSON(json=incoming_webhook, key="url"))}}
{{Set(name="webhook_secret", value=GetValueJSON(json=incoming_webhook, key="secret"))}}

{{SendMessage(message=Concat(
  "To integrate, send POST requests to: ",
  webhook_url,
  "\nInclude the secret header for authentication."
))}}
```

### Webhook Validation
```newo
{{!-- Validate webhook configuration --}}
{{Set(name="webhook", value=GetWebhook(
  webhookIdn=webhook_identifier,
  webhookType="outgoing"
))}}

{{#if IsEmpty(text=webhook)}}
  {{SendMessage(message="Webhook not found. Please configure integration first.")}}
{{else}}
  {{Set(name="endpoint", value=GetValueJSON(json=webhook, key="endpoint"))}}
  {{Set(name="method", value=GetValueJSON(json=webhook, key="method"))}}

  {{SendMessage(message=Concat(
    "Webhook configured:\n",
    "Endpoint: ", endpoint, "\n",
    "Method: ", method
  ))}}
{{/if}}
```

## Related Actions

- [**CreateWebhook**](./createwebhook) - Create new webhooks
- [**DeleteWebhook**](./deletewebhook) - Remove webhooks
- [**SendCommand**](./sendcommand) - Send commands via webhooks
- [**CreateConnector**](./createconnector) - Create integrations
