---
sidebar_position: 61
title: "UpdateAkb"
description: "Update existing entries in the Agent Knowledge Base"
---

# UpdateAkb

Update existing entries in the Agent Knowledge Base (AKB). This action modifies the content or metadata of knowledge base entries without requiring deletion and recreation.

## Syntax

```newo
UpdateAkb(
  topicId: str,
  name: str = None,
  content: str = None,
  metadata: dict = None
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topicId` | string | Yes | Identifier of the entry to update |
| `name` | string | No | New name/title for the entry |
| `content` | string | No | New content for the entry |
| `metadata` | dict | No | Updated metadata fields |

## Returns

- **object** - Updated knowledge base entry

## Basic Usage

### Update Content
```newo
{{!-- Update knowledge entry content --}}
{{UpdateAkb(
  topicId="company_hours",
  content="Our new hours are Monday-Friday 8AM-6PM, Saturday 9AM-3PM."
)}}
```

### Update Name and Content
```newo
{{!-- Update both name and content --}}
{{UpdateAkb(
  topicId="pricing_faq",
  name="2025 Pricing FAQ",
  content="Updated pricing information for the 2025 fiscal year..."
)}}
```

## Common Use Cases

### Incremental Updates
```newo
{{!-- Add information to existing entry --}}
{{Set(name="existing", value=SearchFuzzyAkb(query="return policy", numberTopics=1))}}

{{#if not IsEmpty(text=existing)}}
  {{Set(name="current_content", value=GetValueJSON(json=existing[0], key="content"))}}
  {{Set(name="new_content", value=Concat(
    current_content,
    "\n\nUpdate (", GetDateTime(), "): Extended return window to 60 days."
  ))}}

  {{UpdateAkb(
    topicId=GetValueJSON(json=existing[0], key="id"),
    content=new_content
  )}}
{{/if}}
```

### Metadata Updates
```newo
{{!-- Update entry metadata --}}
{{UpdateAkb(
  topicId="seasonal_menu",
  metadata={
    "lastUpdated": GetDateTime(),
    "season": "winter",
    "validUntil": "2025-03-01"
  }
)}}
```

### Version Tracking
```newo
{{!-- Update with version tracking --}}
{{Set(name="entry", value=SearchFuzzyAkb(query=topic_name, numberTopics=1))}}
{{Set(name="current_version", value=GetValueJSON(json=entry[0], key="version"))}}
{{Set(name="new_version", value=Add(a=current_version, b="1"))}}

{{UpdateAkb(
  topicId=GetValueJSON(json=entry[0], key="id"),
  content=new_content,
  metadata={
    "version": new_version,
    "updatedBy": GetUser(field="id"),
    "updatedAt": GetDateTime()
  }
)}}
```

## Related Actions

- [**SearchFuzzyAkb**](./searchfuzzyakb) - Find entries to update
- [**SetManualAkb**](./setmanualakb) - Create new entries
- [**DeleteAkb**](./deleteakb) - Remove entries
- [**SetAkb**](./setakb) - Alternative entry management
