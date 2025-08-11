---
sidebar_position: 27
title: "IsGlobal"
description: "Check if skill execution is in global context versus user-specific context"
---

# IsGlobal

Checks whether the current skill execution is running in global context (flow-wide) or user-specific context (persona-bound). Essential for implementing different logic paths based on execution scope.

## Syntax

```newo
IsGlobal()
```

## Parameters

None - this action takes no parameters.

## Return Values

- **`"t"`** - Skill is executing in global context
- **`""`** (empty string) - Skill is executing in user-specific context

## How It Works

1. **Context Detection**: Examines current execution environment
2. **Scope Identification**: Determines if bound to specific user persona
3. **Global Check**: Returns true if flow instance is global (not user-bound)
4. **Boolean Logic**: Use with If statements for conditional execution

## Context Types

### Global Context
- Flow instance belongs to the flow itself
- Not associated with specific user persona
- Shared across all users
- System-wide operations and broadcasts

### User-Specific Context
- Flow instance belongs to individual user persona
- User-bound data and operations
- Personalized interactions
- Session-specific state

## Use Cases

### Context-Aware Message Routing
```newo
{{#if IsGlobal()}}
  {{!-- Global broadcast message --}}
  {{SendMessage(
    message="System maintenance scheduled for tonight",
    actorIds=GetActors(scope="all")
  )}}
{{else}}
  {{!-- Personal message --}}
  {{SendMessage(
    message=Concat("Hello ", GetUser(field="name"), "! You have a new notification")
  )}}
{{/if}}
```

### State Management Strategy
```newo
{{#if IsGlobal()}}
  {{!-- Store in global state --}}
  {{SetState(name="system_status", value="maintenance_mode")}}
  {{SendMessage(message="System status updated globally")}}
{{else}}
  {{!-- Store in user state --}}
  {{SetState(name="user_preference", value="dark_mode")}}
  {{SendMessage(message="Your preferences have been saved")}}
{{/if}}
```

### Event Processing Logic
```newo
{{#if IsGlobal()}}
  {{!-- Process system-wide events --}}
  {{SendSystemEvent(
    eventIdn="global_system_event",
    scope="system",
    data=GetTriggeredAct()
  )}}
{{else}}
  {{!-- Process user-specific events --}}
  {{SendSystemEvent(
    eventIdn="user_interaction",
    userId=GetUser(field="id"),
    data=GetTriggeredAct()
  )}}
{{/if}}
```

### Permission and Access Control
```newo
{{#if IsGlobal()}}
  {{!-- Global context has system permissions --}}
  {{SendMessage(message="System administrator privileges active")}}
  {{Set(name="can_modify_global", value="true")}}
{{else}}
  {{!-- User context has limited permissions --}}
  {{Set(name="user_role", value=GetUser(field="type"))}}
  {{#if IsSimilar(text1=user_role, text2="admin")}}
    {{SendMessage(message="Admin user detected")}}
  {{else}}
    {{SendMessage(message="Standard user permissions")}}
  {{/if}}
{{/if}}
```

## Advanced Patterns

### Hybrid Global-Personal Operations
```newo
{{#if IsGlobal()}}
  {{!-- Global announcement to all users --}}
  {{Set(name="all_users", value=GetActors(scope="all_personas"))}}
  {{SendMessage(
    message="Important: New feature available for all users",
    actorIds=all_users
  )}}
  {{SetState(name="feature_announced", value="true")}}
{{else}}
  {{!-- Personal feature introduction --}}
  {{Set(name="user_id", value=GetUser(field="id"))}}
  {{Set(name="feature_seen", value=GetState(name="feature_introduced"))}}
  
  {{#if IsEmpty(text=feature_seen)}}
    {{SendMessage(message="Welcome! Let me show you our new feature...")}}
    {{SetState(name="feature_introduced", value="true")}}
  {{else}}
    {{SendMessage(message="You're already familiar with our latest features!")}}
  {{/if}}
{{/if}}
```

### Context-Aware Data Storage
```newo
{{Set(name="event_data", value=GetTriggeredAct())}}

{{#if IsGlobal()}}
  {{!-- Store global metrics and system data --}}
  {{SetAKB(
    key="global_system_metrics",
    value=Concat(GetDateTime(), ": ", event_data)
  )}}
  {{SendMessage(message="Global system data logged")}}
{{else}}
  {{!-- Store user-specific interaction data --}}
  {{Set(name="user_id", value=GetUser(field="id"))}}
  {{SetAKB(
    key=Concat("user_interactions_", user_id),
    value=Concat(GetDateTime(), ": ", event_data)
  )}}
  {{SendMessage(message="Your interaction has been recorded")}}
{{/if}}
```

### Dynamic Workflow Branching
```newo
{{#if IsGlobal()}}
  {{!-- System maintenance workflow --}}
  {{Set(name="maintenance_mode", value=GetState(name="system_maintenance"))}}
  {{#if IsSimilar(text1=maintenance_mode, text2="active")}}
    {{SendMessage(message="System is in maintenance mode")}}
    {{Return()}}
  {{else}}
    {{SendMessage(message="System operational - processing global request")}}
  {{/if}}
{{else}}
  {{!-- User interaction workflow --}}
  {{Set(name="user_session", value=GetState(name="session_active"))}}
  {{#if IsEmpty(text=user_session)}}
    {{SendMessage(message="Welcome! Starting new session...")}}
    {{SetState(name="session_active", value="true")}}
  {{else}}
    {{SendMessage(message="Continuing your session...")}}
  {{/if}}
{{/if}}
```

## Integration Examples

### With Actor Management
```newo
{{#if IsGlobal()}}
  {{!-- Get all system actors for global operations --}}
  {{Set(name="system_actors", value=GetActors(scope="system"))}}
  {{SendMessage(
    message="Global system notification",
    actorIds=system_actors
  )}}
{{else}}
  {{!-- Get user-specific actors --}}
  {{Set(name="user_actors", value=GetActors(personaId=GetUser(field="id")))}}
  {{SendMessage(
    message="Personal notification for you",
    actorIds=user_actors
  )}}
{{/if}}
```

### With AI Generation
```newo
{{#if IsGlobal()}}
  {{!-- Generate system-wide content --}}
  {{#system~}}
  Generate a professional system-wide announcement about platform updates.
  Make it informative but concise.
  {{~/system}}
{{else}}
  {{!-- Generate personalized content --}}
  {{Set(name="user_name", value=GetUser(field="name"))}}
  {{#system~}}
  Generate a personalized message for {{user_name}} about their account status.
  Make it friendly and specific to their profile.
  {{~/system}}
{{/if}}

{{#assistant~}}
{{Gen(name="contextual_message", temperature=0.7)}}
{{~/assistant}}

{{SendMessage(message=contextual_message)}}
```

### With External Commands
```newo
{{#if IsGlobal()}}
  {{!-- System-level external commands --}}
  {{SendCommand(
    command="system_backup",
    scope="global",
    priority="high",
    timestamp=GetDateTime()
  )}}
{{else}}
  {{!-- User-specific external commands --}}
  {{SendCommand(
    command="user_notification",
    user_id=GetUser(field="id"),
    personal_data=GetState(name="user_preferences")
  )}}
{{/if}}
```

## Security Considerations

### Access Control Patterns
```newo
{{#if IsGlobal()}}
  {{!-- Global context - system operations allowed --}}
  {{Set(name="operation_allowed", value="true")}}
  {{SendMessage(message="System-level operation authorized")}}
{{else}}
  {{!-- User context - check permissions --}}
  {{Set(name="user_role", value=GetUser(field="type"))}}
  {{#if IsSimilar(text1=user_role, text2="admin")}}
    {{Set(name="operation_allowed", value="true")}}
  {{else}}
    {{Set(name="operation_allowed", value="false")}}
    {{SendMessage(message="Insufficient permissions for this operation")}}
  {{/if}}
{{/if}}
```

### Data Isolation
```newo
{{#if IsGlobal()}}
  {{!-- Global data access patterns --}}
  {{SetAKB(key="system_config", value=config_data)}}
{{else}}
  {{!-- User-isolated data patterns --}}
  {{Set(name="user_id", value=GetUser(field="id"))}}
  {{SetAKB(key=Concat("user_data_", user_id), value=user_data)}}
{{/if}}
```

## Error Handling

### Context Validation
```newo
{{#if IsGlobal()}}
  {{!-- Global error handling --}}
  {{SendSystemEvent(
    eventIdn="global_error",
    severity="system",
    context="global_operation_failed"
  )}}
{{else}}
  {{!-- User-specific error handling --}}
  {{SendSystemEvent(
    eventIdn="user_error",
    userId=GetUser(field="id"),
    context="user_operation_failed"
  )}}
{{/if}}
```

## Use Case Examples

### System Announcements
```newo
{{#if IsGlobal()}}
  {{SendMessage(message="🔔 System maintenance complete. All services restored.")}}
{{/if}}
```

### Personal Greetings
```newo
{{#if IsGlobal()}}
  {{!-- Skip personal greetings in global context --}}
{{else}}
  {{SendMessage(message=Concat("Welcome back, ", GetUser(field="name"), "!"))}}
{{/if}}
```

### Context-Sensitive Logging
```newo
{{#if IsGlobal()}}
  {{SendSystemEvent(eventIdn="global_activity", level="system")}}
{{else}}
  {{SendSystemEvent(eventIdn="user_activity", userId=GetUser(field="id"))}}
{{/if}}
```

## Limitations

- **Binary Check**: Only differentiates global vs. user context
- **No Scope Details**: Doesn't provide specific scope information
- **Context Dependency**: Results depend on how flow is invoked
- **Static Check**: Context doesn't change during execution
- **No Parameters**: Cannot check specific context types

## Related Actions

- [**IsEmpty**](./isempty) - Check for empty values in context
- [**IsSimilar**](./issimilar) - Compare context-specific values
- [**GetUser**](./getuser) - Get user info (only in user context)
- [**SetState**](./setstate) - Store context-appropriate data
- [**If**](./if) - Conditional logic based on context
- [**SendSystemEvent**](./sendsystemevent) - Log context-aware events

## Performance Tips

- **Early Context Checks**: Determine context early in flow execution
- **Cache Context Results**: Store context state for repeated use
- **Separate Global/User Logic**: Design clear separation between contexts
- **Optimize for Context**: Use context-appropriate data structures