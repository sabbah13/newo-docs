---
sidebar_position: 5
title: "If"
description: "Conditional logic control for branching skill execution"
---

# If

Implements conditional logic control structures for branching skill execution based on boolean conditions. Essential for creating dynamic, context-aware conversational flows.

## Syntax

```newo
{{#if condition}}
  Code to execute if condition is true
{{else}}
  Code to execute if condition is false (optional)
{{/if}}
```

## Parameters

### Required Parameters

- **`condition`** (boolean expression): Any expression that evaluates to true or false
  - Direct boolean values (`true`, `false`)
  - Comparison functions (`IsEmpty`, `IsSimilar`, `IsGlobal`)
  - Variable evaluations
  - Function return values

## Control Flow

1. **Condition Evaluation**: Tests the provided condition
2. **Branch Selection**: Executes appropriate code block
3. **Optional Else**: Falls back to else block if condition is false
4. **Block Completion**: Continues execution after `{{/if}}`

## Use Cases

### Basic Conditional Logic
```newo
{{!-- Simple true/false branching --}}
{{Set(name="user_type", value=GetUser(field="type"))}}
{{#if IsSimilar(text1=user_type, text2="premium")}}
  {{SendMessage(message="Welcome to Premium Support!")}}
{{else}}
  {{SendMessage(message="Welcome! How can I help you?")}}
{{/if}}
```

### Validation Checking
```newo
{{!-- Validate required fields --}}
{{Set(name="user_email", value=GetUser(field="email"))}}
{{#if IsEmpty(text=user_email)}}
  {{SendMessage(message="Please provide your email address to continue.")}}
{{else}}
  {{SendMessage(message="Email validated successfully.")}}
  {{SetState(name="email_verified", value="true")}}
{{/if}}
```

### State-Based Flow Control
```newo
{{!-- Different actions based on current state --}}
{{Set(name="current_step", value=GetState(name="booking_step"))}}
{{#if IsEmpty(text=current_step)}}
  {{SendMessage(message="Let's start your booking! What service do you need?")}}
  {{SetState(name="booking_step", value="1")}}
{{else}}
  {{SendMessage(message="Continuing your booking...")}}
{{/if}}
```

### Error Handling
```newo
{{!-- Handle API response errors --}}
{{Set(name="api_response", value=SendCommand(command="get_data"))}}
{{#if IsEmpty(text=api_response)}}
  {{SendMessage(message="Service temporarily unavailable. Please try again later.")}}
  {{SendSystemEvent(eventIdn="api_error", command="get_data")}}
{{else}}
  {{SendMessage(message="Data retrieved successfully!")}}
{{/if}}
```

## Advanced Patterns

### Nested Conditions
```newo
{{!-- Multiple condition levels --}}
{{Set(name="user_type", value=GetUser(field="type"))}}
{{Set(name="account_status", value=GetState(name="account_status"))}}

{{#if IsSimilar(text1=user_type, text2="admin")}}
  {{SendMessage(message="Admin access granted")}}
{{else}}
  {{#if IsSimilar(text1=account_status, text2="active")}}
    {{SendMessage(message="Welcome back!")}}
  {{else}}
    {{SendMessage(message="Please activate your account first")}}
  {{/if}}
{{/if}}
```

### Multi-Condition Logic
```newo
{{!-- Complex condition evaluation --}}
{{Set(name="has_email", value=IsEmpty(text=GetUser(field="email")))}}
{{Set(name="has_phone", value=IsEmpty(text=GetUser(field="phone")))}}

{{#if has_email}}
  {{#if has_phone}}
    {{SendMessage(message="Please provide either email or phone number")}}
  {{else}}
    {{SendMessage(message="Phone number verified. Email optional.")}}
  {{/if}}
{{else}}
  {{SendMessage(message="Contact information complete!")}}
{{/if}}
```

### Feature Flag Control
```newo
{{!-- Feature enablement logic --}}
{{Set(name="feature_enabled", value=GetState(name="beta_features"))}}
{{#if IsSimilar(text1=feature_enabled, text2="true")}}
  {{SendMessage(message="Beta features are enabled for your account")}}
  {{!-- Show beta features --}}
{{else}}
  {{SendMessage(message="Standard features available")}}
  {{!-- Show standard features --}}
{{/if}}
```

### Language Localization
```newo
{{!-- Multi-language support --}}
{{Set(name="user_lang", value=GetUser(field="language"))}}
{{#if IsSimilar(text1=user_lang, text2="es")}}
  {{SendMessage(message="¡Hola! ¿Cómo puedo ayudarte?")}}
{{else}}
  {{#if IsSimilar(text1=user_lang, text2="fr")}}
    {{SendMessage(message="Bonjour! Comment puis-je vous aider?")}}
  {{else}}
    {{SendMessage(message="Hello! How can I help you?")}}
  {{/if}}
{{/if}}
```

### Time-Based Logic
```newo
{{!-- Different behavior based on time --}}
{{Set(name="current_hour", value=GetDateTime(format="hour"))}}
{{#if IsSimilar(text1=current_hour, text2="morning")}}
  {{SendMessage(message="Good morning! Ready to start the day?")}}
{{else}}
  {{#if IsSimilar(text1=current_hour, text2="evening")}}
    {{SendMessage(message="Good evening! How was your day?")}}
  {{else}}
    {{SendMessage(message="Hello! How can I help you?")}}
  {{/if}}
{{/if}}
```

## Integration Examples

### With AI Generation
```newo
{{!-- Conditional AI responses --}}
{{Set(name="user_mood", value=GetState(name="detected_mood"))}}
{{#if IsSimilar(text1=user_mood, text2="frustrated")}}
  {{#system~}}
  The user seems frustrated. Respond with extra empathy and offer immediate solutions.
  {{~/system}}
{{else}}
  {{#system~}}
  The user has a neutral mood. Provide a standard helpful response.
  {{~/system}}
{{/if}}

{{#assistant~}}
{{Gen(name="contextual_response")}}
{{~/assistant}}

{{SendMessage(message=contextual_response)}}
```

### With Actor Management
```newo
{{!-- Send to different channels based on urgency --}}
{{Set(name="message_priority", value=GetState(name="priority"))}}
{{#if IsSimilar(text1=message_priority, text2="urgent")}}
  {{SendMessage(
    message="URGENT: Immediate attention required",
    actorIds=GetActors(integrationIdn="sms")
  )}}
{{else}}
  {{SendMessage(
    message="Standard notification",
    actorIds=GetActors(integrationIdn="email")
  )}}
{{/if}}
```

### With Memory Analysis
```newo
{{!-- Context-aware responses --}}
{{Set(name="conversation_history", value=GetMemory(count="5"))}}
{{#if IsEmpty(text=conversation_history)}}
  {{SendMessage(message="Hello! I'm here to help you get started.")}}
{{else}}
  {{SendMessage(message="Welcome back! I remember our previous conversation.")}}
{{/if}}
```

## Best Practices

### Clear Condition Logic
```newo
{{!-- Use meaningful variable names --}}
{{Set(name="is_user_authenticated", value=IsEmpty(text=GetUser(field="id")))}}
{{Set(name="has_permission", value=IsSimilar(text1=GetUser(field="role"), text2="admin"))}}

{{#if is_user_authenticated}}
  {{#if has_permission}}
    {{!-- Admin functionality --}}
  {{else}}
    {{!-- Regular user functionality --}}
  {{/if}}
{{else}}
  {{SendMessage(message="Please log in to continue")}}
{{/if}}
```

### Error Prevention
```newo
{{!-- Validate before complex operations --}}
{{Set(name="user_input", value=GetTriggeredAct())}}
{{#if IsEmpty(text=user_input)}}
  {{SendMessage(message="I didn't receive your input. Could you try again?")}}
{{else}}
  {{!-- Process valid input --}}
  {{SendMessage(message=Concat("Processing: ", user_input))}}
{{/if}}
```

### Performance Optimization
```newo
{{!-- Cache expensive operations --}}
{{Set(name="user_data", value=GetUser(field="name"))}}
{{#if IsEmpty(text=user_data)}}
  {{Set(name="display_name", value="Guest")}}
{{else}}
  {{Set(name="display_name", value=user_data)}}
{{/if}}
{{!-- Use display_name throughout the rest of the skill --}}
```

## Common Patterns

### Guard Clauses
```newo
{{!-- Early returns for invalid conditions --}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{#if IsEmpty(text=user_id)}}
  {{SendMessage(message="Authentication required")}}
  {{Return()}}
{{/if}}

{{!-- Continue with authenticated user logic --}}
{{SendMessage(message="Welcome to the secure area!")}}
```

### Default Value Assignment
```newo
{{!-- Set defaults for missing values --}}
{{Set(name="user_timezone", value=GetUser(field="timezone"))}}
{{#if IsEmpty(text=user_timezone)}}
  {{Set(name="user_timezone", value="UTC")}}
{{/if}}

{{SendMessage(message=Concat("Your timezone: ", user_timezone))}}
```

## Troubleshooting

### Common Issues

**Condition not evaluating as expected**:
```newo
{{!-- Debug condition values --}}
{{Set(name="test_value", value=GetUser(field="status"))}}
{{SendMessage(message=Concat("Debug - Status value: '", test_value, "'"))}}
{{#if IsSimilar(text1=test_value, text2="active")}}
  {{SendMessage(message="Condition matched")}}
{{else}}
  {{SendMessage(message="Condition not matched")}}
{{/if}}
```

**Nested if blocks not working**:
```newo
{{!-- Ensure proper block closure --}}
{{#if condition1}}
  {{#if condition2}}
    {{SendMessage(message="Both conditions true")}}
  {{/if}}
{{/if}}
```

## Limitations

- **No Logical Operators**: No built-in AND, OR, NOT operators
- **String Comparisons**: Most conditions work with string values
- **Nesting Complexity**: Deep nesting can reduce readability
- **No Switch/Case**: Must use multiple if-else chains
- **Performance**: Complex nested conditions can impact execution time

## Related Actions

- [**IsEmpty**](./isempty) - Test for empty values
- [**IsSimilar**](./issimilar) - Compare string similarity  
- [**IsGlobal**](./isglobal) - Check variable scope
- [**Set**](./set) - Assign condition results
- [**Return**](./return) - Early exit from conditions

## Performance Tips

- **Early Validation**: Check most likely conditions first
- **Cache Results**: Store condition results in variables
- **Minimize Nesting**: Keep condition logic as flat as possible
- **Use Guard Clauses**: Exit early for invalid conditions