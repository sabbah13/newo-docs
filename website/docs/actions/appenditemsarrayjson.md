---
sidebar_position: 63
title: "AppendItemsArrayJSON"
description: "Add items to a JSON array"
---

# AppendItemsArrayJSON

Append one or more items to an existing JSON array. This action is essential for building dynamic lists, accumulating data, and managing collections within skill workflows.

## Syntax

```newo
AppendItemsArrayJSON(
  jsonArray: List | str,
  jsonItems: List | any
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jsonArray` | array/string | Yes | The target array (or JSON string representation) |
| `jsonItems` | array/any | Yes | Items to append (single item or array of items) |

## Returns

- **array** - New array with appended items

## Basic Usage

### Append Single Item
```newo
{{!-- Add item to array --}}
{{Set(name="my_list", value=CreateArray("item1", "item2"))}}
{{Set(name="my_list", value=AppendItemsArrayJSON(
  jsonArray=my_list,
  jsonItems="item3"
))}}
{{!-- Result: ["item1", "item2", "item3"] --}}
```

### Append Multiple Items
```newo
{{!-- Add multiple items at once --}}
{{Set(name="fruits", value=CreateArray("apple", "banana"))}}
{{Set(name="fruits", value=AppendItemsArrayJSON(
  jsonArray=fruits,
  jsonItems=["cherry", "date", "elderberry"]
))}}
{{!-- Result: ["apple", "banana", "cherry", "date", "elderberry"] --}}
```

## Common Use Cases

### Building Dynamic Lists
```newo
{{!-- Collect user selections --}}
{{Set(name="selected_options", value=CreateArray())}}

{{!-- User selects options one by one --}}
{{#each user_selections as selection}}
  {{Set(name="selected_options", value=AppendItemsArrayJSON(
    jsonArray=selected_options,
    jsonItems=selection
  ))}}
{{/each}}

{{SendMessage(message=Concat("You selected: ", Stringify(selected_options)))}}
```

### Accumulating Search Results
```newo
{{!-- Combine search results from multiple sources --}}
{{Set(name="all_results", value=CreateArray())}}

{{!-- Search local knowledge base --}}
{{Set(name="local_results", value=SearchFuzzyAkb(query=user_query, numberTopics=3))}}
{{Set(name="all_results", value=AppendItemsArrayJSON(
  jsonArray=all_results,
  jsonItems=local_results
))}}

{{!-- Search external source --}}
{{Set(name="external_results", value=SearchExternalAPI(query=user_query))}}
{{Set(name="all_results", value=AppendItemsArrayJSON(
  jsonArray=all_results,
  jsonItems=external_results
))}}

{{SendMessage(message=Concat("Found ", all_results.length, " total results"))}}
```

### Chat History Building
```newo
{{!-- Build conversation history array --}}
{{Set(name="conversation", value=GetState(name="conversation_history"))}}

{{#if IsEmpty(text=conversation)}}
  {{Set(name="conversation", value=CreateArray())}}
{{/if}}

{{!-- Add new message to history --}}
{{Set(name="new_message", value={
  "role": "user",
  "content": GetMemory(count="1", fromPerson="User"),
  "timestamp": GetDateTime()
})}}

{{Set(name="conversation", value=AppendItemsArrayJSON(
  jsonArray=conversation,
  jsonItems=new_message
))}}

{{SetState(name="conversation_history", value=conversation)}}
```

### Order Item Collection
```newo
{{!-- Collect order items --}}
{{Set(name="order_items", value=GetState(name="current_order_items"))}}

{{#if IsEmpty(text=order_items)}}
  {{Set(name="order_items", value=CreateArray())}}
{{/if}}

{{!-- Add new item --}}
{{Set(name="new_item", value={
  "product": product_name,
  "quantity": quantity,
  "price": price,
  "addedAt": GetDateTime()
})}}

{{Set(name="order_items", value=AppendItemsArrayJSON(
  jsonArray=order_items,
  jsonItems=new_item
))}}

{{SetState(name="current_order_items", value=order_items)}}
{{SendMessage(message=Concat(product_name, " added to your order."))}}
```

### Error Log Collection
```newo
{{!-- Collect errors during processing --}}
{{Set(name="errors", value=CreateArray())}}

{% for item in items_to_process %}
  {{Set(name="result", value=ProcessItem(item=item))}}

  {{#if IsSimilar(text1=result.status, text2="error")}}
    {{Set(name="errors", value=AppendItemsArrayJSON(
      jsonArray=errors,
      jsonItems={
        "item": item.id,
        "error": result.message,
        "timestamp": GetDateTime()
      }
    ))}}
  {{/if}}
{% endfor %}

{{#if not IsEmpty(text=errors)}}
  {{SendSystemEvent(
    eventIdn="processing_errors",
    errors=errors,
    count=errors.length
  )}}
{{/if}}
```

## Advanced Patterns

### Conditional Appending
```newo
{{!-- Only append valid items --}}
{{Set(name="valid_entries", value=CreateArray())}}

{% for entry in all_entries %}
  {{#if entry.isValid}}
    {{Set(name="valid_entries", value=AppendItemsArrayJSON(
      jsonArray=valid_entries,
      jsonItems=entry
    ))}}
  {{/if}}
{% endfor %}
```

### Building Nested Structures
```newo
{{!-- Build nested array structure --}}
{{Set(name="categories", value=CreateArray())}}

{% for category in category_list %}
  {{Set(name="category_items", value=CreateArray())}}

  {% for item in category.items %}
    {{Set(name="category_items", value=AppendItemsArrayJSON(
      jsonArray=category_items,
      jsonItems=item
    ))}}
  {% endfor %}

  {{Set(name="categories", value=AppendItemsArrayJSON(
    jsonArray=categories,
    jsonItems={"name": category.name, "items": category_items}
  ))}}
{% endfor %}
```

## Related Actions

- [**CreateArray**](./createarray) - Create initial arrays
- [**GetIndexesOfItemsArrayJSON**](./getindexesofarrayjson) - Find item positions
- [**GetValueJSON**](./getvaluejson) - Extract array values
- [**UpdateValueJSON**](./updatevaluejson) - Modify array values
- [**GetItemsArrayByIndexesJSON**](./getitemsarraybyindexesjson) - Get items by index
