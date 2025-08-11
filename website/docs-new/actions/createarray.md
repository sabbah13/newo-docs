---
sidebar_position: 30
title: "CreateArray"
description: "Create arrays from string literals and variables for data organization"
---

# CreateArray

Creates arrays from any number of string literals, variables, or mixed values. Essential for organizing data, creating lists, and preparing structured content for processing.

## Syntax

```newo
CreateArray(
  "<string literal>" | <variable> {, "<string literal>" | <variable>}
)
```

## Parameters

### Variable Parameters

- **Arguments** (string | variable): Any number of values to include in array
  - String literals (e.g., "item1", "item2")
  - Variables (e.g., user_name, calculated_value)
  - Mixed types supported
  - Minimum 1 argument required

## Return Values

- **Array string**: Space-separated string representation of array items
- **Formatted output**: Each item separated by spaces
- **Ordered sequence**: Items maintain input order

## How It Works

1. **Parameter Collection**: Gathers all provided arguments
2. **Type Processing**: Handles string literals and variable values
3. **Array Creation**: Organizes items into array structure
4. **String Conversion**: Returns space-separated string format
5. **Order Preservation**: Maintains original argument sequence

## Use Cases

### Basic Array Creation
```newo
{{!-- Create simple arrays --}}
{{Set(name="fruits", value=CreateArray("apple", "banana", "orange"))}}
{{SendMessage(message=Concat("Available fruits: ", fruits))}}
{{!-- Result: Available fruits: apple banana orange --}}
```

### Dynamic Array Building
```newo
{{!-- Build arrays with variables --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{Set(name="user_email", value=GetUser(field="email"))}}
{{Set(name="user_info", value=CreateArray(user_name, user_email, "active"))}}
{{SendMessage(message=Concat("User data: ", user_info))}}
```

### Menu and Option Lists
```newo
{{!-- Create menu options --}}
{{Set(name="menu_options", value=CreateArray(
  "1. View Account",
  "2. Update Profile", 
  "3. Settings",
  "4. Logout"
))}}
{{SendMessage(message=Concat("Menu Options:\n", menu_options))}}
```

### Data Collection Arrays
```newo
{{!-- Collect user responses --}}
{{Set(name="responses", value=CreateArray())}}  {{!-- Empty array --}}
{{Set(name="answer1", value=GetTriggeredAct())}}
{{Set(name="survey_data", value=CreateArray("Q1", answer1, GetDateTime()))}}
{{SetState(name="survey_responses", value=survey_data)}}
```

## Advanced Patterns

### Conditional Array Building
```newo
{{!-- Build arrays based on conditions --}}
{{Set(name="user_role", value=GetUser(field="type"))}}
{{Set(name="base_options", value=CreateArray("profile", "settings"))}}

{{#if IsSimilar(text1=user_role, text2="admin")}}
  {{Set(name="admin_options", value=CreateArray("user_management", "system_config", "reports"))}}
  {{Set(name="all_options", value=CreateArray(base_options, admin_options))}}
{{else}}
  {{Set(name="all_options", value=base_options)}}
{{/if}}

{{SendMessage(message=Concat("Available options: ", all_options))}}
```

### Multi-Dimensional Data
```newo
{{!-- Create structured data arrays --}}
{{Set(name="user1", value=CreateArray("John", "Doe", "manager", "active"))}}
{{Set(name="user2", value=CreateArray("Jane", "Smith", "developer", "active"))}}
{{Set(name="user_list", value=CreateArray(user1, user2))}}

{{SendMessage(message=Concat("User directory: ", user_list))}}
```

### Dynamic List Generation
```newo
{{!-- Generate lists from user input --}}
{{Set(name="user_input", value=GetTriggeredAct())}}
{{Set(name="input_items", value=CreateArray())}}

{{!-- Split user input and create array --}}
{{#if IsSimilar(text1=user_input, text2="shopping list", threshold=0.3)}}
  {{Set(name="shopping_items", value=CreateArray("milk", "bread", "eggs", user_input))}}
  {{SendMessage(message=Concat("Shopping list created: ", shopping_items))}}
{{else}}
  {{Set(name="custom_list", value=CreateArray("custom", user_input, GetDateTime()))}}
  {{SendMessage(message=Concat("Custom list: ", custom_list))}}
{{/if}}
```

### State-Based Array Management
```newo
{{!-- Manage arrays in state --}}
{{Set(name="existing_list", value=GetState(name="user_favorites"))}}
{{Set(name="new_item", value=GetTriggeredAct())}}

{{#if IsEmpty(text=existing_list)}}
  {{Set(name="updated_favorites", value=CreateArray(new_item))}}
{{else}}
  {{Set(name="updated_favorites", value=CreateArray(existing_list, new_item))}}
{{/if}}

{{SetState(name="user_favorites", value=updated_favorites)}}
{{SendMessage(message=Concat("Updated favorites: ", updated_favorites))}}
```

## Integration Examples

### With Actor Management
```newo
{{!-- Create arrays of actor information --}}
{{Set(name="actor_ids", value=GetActors())}}
{{Set(name="actor_info", value=CreateArray("actors", actor_ids, "active"))}}
{{SendMessage(
  message="Broadcasting to all channels",
  actorIds=actor_ids
)}}
```

### With Memory Processing
```newo
{{!-- Organize conversation data --}}
{{Set(name="last_message", value=GetMemory(count="1", fromPerson="User"))}}
{{Set(name="previous_message", value=GetMemory(count="1", offset="1"))}}
{{Set(name="conversation_array", value=CreateArray(
  "latest", last_message,
  "previous", previous_message
))}}

{{SendMessage(message=Concat("Conversation context: ", conversation_array))}}
```

### With AI Generation
```newo
{{!-- Create prompts with array data --}}
{{Set(name="user_preferences", value=CreateArray("dark_mode", "notifications_on", "auto_save"))}}

{{#system~}}
Based on these user preferences: {{user_preferences}}
Generate personalized recommendations.
{{~/system}}

{{#assistant~}}
{{Gen(name="personalized_recommendations")}}
{{~/assistant}}

{{SendMessage(message=personalized_recommendations)}}
```

### With External Commands
```newo
{{!-- Send structured data to external systems --}}
{{Set(name="order_details", value=CreateArray(
  GetUser(field="id"),
  GetDateTime(),
  "pending",
  "pizza_order"
))}}

{{SendCommand(
  command="create_order",
  order_data=order_details
)}}
```

## Array Processing Patterns

### Iterative Processing
```newo
{{!-- Process array items individually --}}
{{Set(name="task_list", value=CreateArray("task1", "task2", "task3"))}}
{{Set(name="completed_tasks", value=CreateArray())}}

{{!-- Simulate processing each task --}}
{{Set(name="processed", value=CreateArray(task_list, "completed", GetDateTime()))}}
{{SendMessage(message=Concat("Processing complete: ", processed))}}
```

### Array Validation
```newo
{{!-- Validate array contents --}}
{{Set(name="required_fields", value=CreateArray("name", "email", "phone"))}}
{{Set(name="provided_data", value=CreateArray(
  GetUser(field="name"),
  GetUser(field="email"),
  GetUser(field="phone")
))}}

{{Set(name="validation_result", value=CreateArray("validation", provided_data, "complete"))}}
{{SendMessage(message=Concat("Validation: ", validation_result))}}
```

### Array Combination
```newo
{{!-- Combine multiple arrays --}}
{{Set(name="base_features", value=CreateArray("login", "dashboard", "profile"))}}
{{Set(name="premium_features", value=CreateArray("analytics", "exports", "api_access"))}}
{{Set(name="all_features", value=CreateArray(base_features, premium_features))}}

{{SendMessage(message=Concat("Available features: ", all_features))}}
```

## Data Organization

### Hierarchical Data
```newo
{{!-- Organize hierarchical information --}}
{{Set(name="company", value=CreateArray("TechCorp", "headquarters", "New York"))}}
{{Set(name="department", value=CreateArray("Engineering", "team_lead", "Sarah"))}}
{{Set(name="org_structure", value=CreateArray(company, department))}}
```

### Metadata Arrays
```newo
{{!-- Store metadata with content --}}
{{Set(name="document", value=CreateArray(
  "title", "User Manual",
  "version", "2.1",
  "date", GetDateTime(),
  "author", GetUser(field="name")
))}}

{{SendMessage(message=Concat("Document info: ", document))}}
```

### Configuration Arrays
```newo
{{!-- Store configuration settings --}}
{{Set(name="app_config", value=CreateArray(
  "theme", "dark",
  "language", GetUser(field="language"),
  "notifications", "enabled",
  "auto_save", "true"
))}}

{{SetState(name="user_config", value=app_config)}}
```

## Error Handling

### Empty Array Handling
```newo
{{!-- Handle empty arrays gracefully --}}
{{Set(name="user_input", value=GetTriggeredAct())}}
{{#if IsEmpty(text=user_input)}}
  {{Set(name="default_array", value=CreateArray("default", "empty", "placeholder"))}}
  {{SendMessage(message=Concat("Using defaults: ", default_array))}}
{{else}}
  {{Set(name="input_array", value=CreateArray(user_input, GetDateTime()))}}
  {{SendMessage(message=Concat("Created array: ", input_array))}}
{{/if}}
```

### Validation and Cleanup
```newo
{{!-- Clean and validate array inputs --}}
{{Set(name="raw_input", value=GetTriggeredAct())}}
{{Set(name="clean_input", value=Stringify(raw_input))}}

{{#if IsEmpty(text=clean_input)}}
  {{SendMessage(message="Cannot create array from empty input")}}
{{else}}
  {{Set(name="validated_array", value=CreateArray("input", clean_input, "validated"))}}
  {{SendMessage(message=Concat("Valid array: ", validated_array))}}
{{/if}}
```

## Performance Considerations

### Array Size Management
- **Small Arrays**: 1-10 items process quickly
- **Medium Arrays**: 11-50 items still efficient
- **Large Arrays**: 50+ items may impact performance

### Memory Usage
- Arrays stored as space-separated strings
- Large arrays consume more memory
- Consider state storage for persistence

## Limitations

- **String Representation**: Arrays returned as space-separated strings
- **No Indexing**: Cannot access individual items by index
- **Space Separation**: Items containing spaces may cause issues
- **Type Loss**: All items converted to string format
- **No Nesting**: Limited support for nested array structures

## Related Actions

- [**Concat**](./concat) - Combine arrays with other strings
- [**Set**](./set) - Store arrays in variables
- [**SetState**](./setstate) - Persist arrays across executions
- [**IsEmpty**](./isempty) - Check if arrays have content
- [**GetActors**](./getactors) - Get actor data for arrays
- [**Stringify**](./stringify) - Clean array inputs

## Performance Tips

- **Optimize Size**: Keep arrays appropriately sized for use case
- **Clean Inputs**: Use Stringify to clean array values
- **State Storage**: Store frequently used arrays in state
- **Batch Creation**: Create related arrays together
- **Validate Contents**: Check array items before processing