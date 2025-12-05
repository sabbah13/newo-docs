---
sidebar_position: 54
title: "GetAct"
description: "Get act/action information and metadata"
---

# GetAct

Retrieve information about an act (action instance) including its properties, status, and metadata. Acts represent individual actions or events within the Newo system workflow.

## Syntax

```newo
GetAct(
  idn: str,
  field: str = None
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idn` | string | Yes | Act identifier to retrieve |
| `field` | string | No | Specific field to retrieve from the act |

## Returns

- **object** - Full act information when no field specified
- **string/any** - Specific field value when field parameter is provided

## Basic Usage

### Get Act Information
```newo
{{!-- Get full act information --}}
{{Set(name="act_info", value=GetAct(idn=current_act_id))}}

{{!-- Get specific field --}}
{{Set(name="act_status", value=GetAct(idn=current_act_id, field="status"))}}
```

### Access Act Properties
```newo
{{!-- Retrieve act metadata --}}
{{Set(name="act_data", value=GetAct(idn=act_identifier))}}
{{Set(name="act_type", value=GetValueJSON(json=act_data, key="type"))}}
{{Set(name="act_timestamp", value=GetValueJSON(json=act_data, key="timestamp"))}}
```

## Common Use Cases

### Workflow Tracking
```newo
{{!-- Track act status in workflow --}}
{{Set(name="triggered_act", value=GetTriggeredAct())}}
{{Set(name="act_details", value=GetAct(idn=triggered_act.id))}}

{{SendSystemEvent(
  eventIdn="act_processed",
  actId=triggered_act.id,
  actType=GetAct(idn=triggered_act.id, field="type")
)}}
```

### Act-Based Routing
```newo
{{!-- Route based on act type --}}
{{Set(name="current_act", value=GetAct(idn=act_id))}}
{{Set(name="act_type", value=GetValueJSON(json=current_act, key="type"))}}

{{#if IsSimilar(text1=act_type, text2="message")}}
  {{!-- Handle message act --}}
  {{Do(action="ProcessMessage")}}
{{else if IsSimilar(text1=act_type, text2="command")}}
  {{!-- Handle command act --}}
  {{Do(action="ProcessCommand")}}
{{/if}}
```

### Act History
```newo
{{!-- Access act history --}}
{{Set(name="previous_act", value=GetAct(idn=previous_act_id))}}
{{Set(name="act_content", value=GetValueJSON(json=previous_act, key="content"))}}

{{#system~}}
Previous action: {{Stringify(previous_act)}}
Current context: {{GetMemory(count="3")}}
{{~/system}}
```

## Related Actions

- [**GetTriggeredAct**](./gettriggeredact) - Get the triggering act
- [**CreateMessageAct**](./createmessageact) - Create message acts
- [**GetActors**](./getactors) - Get related actors
- [**SendSystemEvent**](./sendsystemevent) - System event handling
