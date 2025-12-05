---
sidebar_position: 60
title: "DeleteAkb"
description: "Delete entries from the Agent Knowledge Base"
---

# DeleteAkb

Delete entries from the Agent Knowledge Base (AKB). This action removes knowledge base entries that are no longer needed or need to be replaced.

## Syntax

```newo
DeleteAkb(
  topicId: str
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topicId` | string | Yes | Identifier of the knowledge base entry to delete |

## Returns

- **void** - No return value

## Basic Usage

### Delete Single Entry
```newo
{{!-- Remove outdated knowledge base entry --}}
{{DeleteAkb(topicId="outdated_policy_v1")}}
```

### Delete After Search
```newo
{{!-- Find and delete specific entry --}}
{{Set(name="results", value=SearchFuzzyAkb(
  query="old pricing information",
  numberTopics=1
))}}

{{#if not IsEmpty(text=results)}}
  {{Set(name="topic_to_delete", value=GetValueJSON(json=results[0], key="id"))}}
  {{DeleteAkb(topicId=topic_to_delete)}}
  {{SendSystemEvent(eventIdn="akb_entry_deleted", topicId=topic_to_delete)}}
{{/if}}
```

## Common Use Cases

### Knowledge Base Maintenance
```newo
{{!-- Clean up expired knowledge entries --}}
{{Set(name="expired_topics", value=GetState(name="expired_akb_entries"))}}

{% for topic in expired_topics %}
  {{DeleteAkb(topicId=topic.id)}}
{% endfor %}

{{SendSystemEvent(
  eventIdn="akb_cleanup_complete",
  deletedCount=expired_topics.length
)}}
```

### Replace Knowledge Entry
```newo
{{!-- Delete old version before adding new --}}
{{DeleteAkb(topicId="pricing_info_2024")}}

{{!-- Add updated version --}}
{{SetManualAkb(
  name="pricing_info_2025",
  content="Updated pricing information for 2025..."
)}}
```

### User-Initiated Deletion
```newo
{{!-- Allow users to remove their contributed knowledge --}}
{{Set(name="user_topics", value=SearchFuzzyAkb(
  query=GetUser(field="id"),
  searchFields=["authorId"],
  fromPerson="User"
))}}

{{#if not IsEmpty(text=user_topics)}}
  {% for topic in user_topics %}
    {{DeleteAkb(topicId=topic.id)}}
  {% endfor %}
  {{SendMessage(message="Your contributed knowledge entries have been removed.")}}
{{/if}}
```

## Related Actions

- [**SearchFuzzyAkb**](./searchfuzzyakb) - Find entries to delete
- [**SetManualAkb**](./setmanualakb) - Add new entries
- [**UpdateAkb**](./updateakb) - Update existing entries
- [**SetAkb**](./setakb) - Alternative entry creation
