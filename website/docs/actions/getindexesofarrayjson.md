---
sidebar_position: 64
title: "GetIndexesOfItemsArrayJSON"
description: "Find indexes of items in a JSON array"
---

# GetIndexesOfItemsArrayJSON

Find the indexes (positions) of items within a JSON array. This action is useful for locating specific elements, validating array contents, and performing index-based operations.

## Syntax

```newo
GetIndexesOfItemsArrayJSON(
  jsonArray: List | str,
  items: List | any
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jsonArray` | array/string | Yes | The array to search within |
| `items` | array/any | Yes | Items to find (single item or array of items) |

## Returns

- **array** - Array of index positions where items were found

## Basic Usage

### Find Single Item
```newo
{{!-- Find index of an item --}}
{{Set(name="fruits", value=CreateArray("apple", "banana", "cherry", "date"))}}
{{Set(name="index", value=GetIndexesOfItemsArrayJSON(
  jsonArray=fruits,
  items="cherry"
))}}
{{!-- Result: [2] --}}
```

### Find Multiple Items
```newo
{{!-- Find indexes of multiple items --}}
{{Set(name="numbers", value=CreateArray(10, 20, 30, 40, 50))}}
{{Set(name="indexes", value=GetIndexesOfItemsArrayJSON(
  jsonArray=numbers,
  items=[20, 40]
))}}
{{!-- Result: [1, 3] --}}
```

## Common Use Cases

### Check Item Existence
```newo
{{!-- Check if item exists in array --}}
{{Set(name="allowed_actions", value=CreateArray("view", "edit", "delete"))}}
{{Set(name="requested_action", value="edit")}}

{{Set(name="action_indexes", value=GetIndexesOfItemsArrayJSON(
  jsonArray=allowed_actions,
  items=requested_action
))}}

{{#if not IsEmpty(text=action_indexes)}}
  {{SendMessage(message="Action permitted.")}}
{{else}}
  {{SendMessage(message="Action not allowed.")}}
{{/if}}
```

### Find Position for Display
```newo
{{!-- Show user's position in queue --}}
{{Set(name="queue", value=GetState(name="booking_queue"))}}
{{Set(name="user_id", value=GetUser(field="id"))}}

{{Set(name="position", value=GetIndexesOfItemsArrayJSON(
  jsonArray=queue,
  items=user_id
))}}

{{#if not IsEmpty(text=position)}}
  {{Set(name="queue_position", value=Add(a=position[0], b="1"))}}  {{!-- 1-indexed for display --}}
  {{SendMessage(message=Concat("You are #", queue_position, " in the queue."))}}
{{else}}
  {{SendMessage(message="You are not currently in the queue.")}}
{{/if}}
```

### Duplicate Detection
```newo
{{!-- Check for duplicates in user input --}}
{{Set(name="user_selections", value=GetState(name="selected_items"))}}
{{Set(name="new_selection", value=GetState(name="new_item"))}}

{{Set(name="existing_index", value=GetIndexesOfItemsArrayJSON(
  jsonArray=user_selections,
  items=new_selection
))}}

{{#if IsEmpty(text=existing_index)}}
  {{!-- Not a duplicate, safe to add --}}
  {{Set(name="user_selections", value=AppendItemsArrayJSON(
    jsonArray=user_selections,
    jsonItems=new_selection
  ))}}
  {{SetState(name="selected_items", value=user_selections)}}
{{else}}
  {{SendMessage(message="That item is already in your selection.")}}
{{/if}}
```

### Filter Array by Position
```newo
{{!-- Remove specific items by finding their indexes --}}
{{Set(name="all_items", value=CreateArray("a", "b", "c", "d", "e"))}}
{{Set(name="items_to_remove", value=CreateArray("b", "d"))}}

{{Set(name="remove_indexes", value=GetIndexesOfItemsArrayJSON(
  jsonArray=all_items,
  items=items_to_remove
))}}

{{!-- Process removal (example logic) --}}
{{SendMessage(message=Concat("Items at positions ", Stringify(remove_indexes), " will be removed"))}}
```

### Progress Tracking
```newo
{{!-- Track progress through a checklist --}}
{{Set(name="checklist", value=CreateArray(
  "Review requirements",
  "Design solution",
  "Implement code",
  "Write tests",
  "Deploy"
))}}

{{Set(name="current_step", value=GetState(name="current_task"))}}
{{Set(name="step_index", value=GetIndexesOfItemsArrayJSON(
  jsonArray=checklist,
  items=current_step
))}}

{{#if not IsEmpty(text=step_index)}}
  {{Set(name="progress", value=Divide(a=step_index[0], b=checklist.length))}}
  {{SendMessage(message=Concat(
    "Current step: ", current_step, "\n",
    "Progress: ", Multiply(a=progress, b="100"), "%"
  ))}}
{{/if}}
```

## Advanced Patterns

### Multi-Item Validation
```newo
{{!-- Validate all required items are present --}}
{{Set(name="submitted_fields", value=CreateArray("name", "email", "phone"))}}
{{Set(name="required_fields", value=CreateArray("name", "email", "phone", "address"))}}

{{Set(name="found_indexes", value=GetIndexesOfItemsArrayJSON(
  jsonArray=submitted_fields,
  items=required_fields
))}}

{{!-- Check if all required fields were found --}}
{{#if LessThan(a=found_indexes.length, b=required_fields.length)}}
  {{SendMessage(message="Some required fields are missing.")}}
{{else}}
  {{SendMessage(message="All required fields provided.")}}
{{/if}}
```

### Index-Based Array Manipulation
```newo
{{!-- Swap items based on found indexes --}}
{{Set(name="items", value=CreateArray("first", "second", "third"))}}
{{Set(name="swap_items", value=CreateArray("first", "third"))}}

{{Set(name="swap_indexes", value=GetIndexesOfItemsArrayJSON(
  jsonArray=items,
  items=swap_items
))}}

{{!-- Use indexes for swap operation --}}
{{SendMessage(message=Concat(
  "Items to swap are at positions: ",
  Stringify(swap_indexes)
))}}
```

## Related Actions

- [**CreateArray**](./createarray) - Create arrays
- [**AppendItemsArrayJSON**](./appenditemsarrayjson) - Add items to arrays
- [**GetValueJSON**](./getvaluejson) - Extract values by key
- [**GetItemsArrayByIndexesJSON**](./getitemsarraybyindexesjson) - Get items by index
