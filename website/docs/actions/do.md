---
sidebar_position: 32
title: "Do"
description: "Execute actions dynamically by name with parameters"
---

# Do

Executes actions dynamically by name with parameters. Enables dynamic action calling, metaprogramming patterns, and flexible workflow orchestration based on runtime conditions.

## Syntax

```newo
Do(
  actionName: str,
  ...arguments
)
```

## Parameters

### Required Parameters

- **`actionName`** (string): Name of the action to execute
- **`...arguments`** (various): Parameters to pass to the target action

## Return Values

- **Action result**: Returns whatever the executed action returns
- **Dynamic output**: Output depends on the action being called
- **Variable type**: Return type matches the target action

## How It Works

1. **Action Resolution**: Looks up action by name in available actions
2. **Parameter Passing**: Forwards provided arguments to target action
3. **Dynamic Execution**: Calls the action with runtime-determined parameters
4. **Result Return**: Returns the result from the executed action

## Use Cases

### Dynamic Action Selection
```newo
{{!-- Execute different actions based on user choice --}}
{{Set(name="user_action", value=GetTriggeredAct())}}
{{#if IsSimilar(text1=user_action, text2="send message")}}
  {{Set(name="result", value=Do("SendMessage", message="Hello from dynamic call!"))}}
{{else}}
  {{#if IsSimilar(text1=user_action, text2="get memory")}}
    {{Set(name="result", value=Do("GetMemory", count="5"))}}
  {{else}}
    {{Set(name="result", value="Unknown action")}}
  {{/if}}
{{/if}}
```

### Configurable Workflows
```newo
{{!-- Execute actions based on configuration --}}
{{Set(name="workflow_step", value=GetState(name="current_step"))}}
{{Set(name="step_action", value=GetState(name="step_actions"))}}

{{#if IsSimilar(text1=workflow_step, text2="1")}}
  {{Set(name="action_result", value=Do("GetUser", field="name"))}}
{{else}}
  {{#if IsSimilar(text1=workflow_step, text2="2")}}
    {{Set(name="action_result", value=Do("SetState", name="user_verified", value="true"))}}
  {{else}}
    {{Set(name="action_result", value=Do("SendMessage", message="Workflow complete"))}}
  {{/if}}
{{/if}}
```

### Batch Action Execution
```newo
{{!-- Execute multiple actions in sequence --}}
{{Set(name="actions_to_run", value=CreateArray("GetUser", "GetMemory", "GetState"))}}
{{Set(name="results", value="")}}

{{!-- Simulate batch execution --}}
{{Set(name="result1", value=Do("GetUser", field="name"))}}
{{Set(name="result2", value=Do("GetMemory", count="1"))}}
{{Set(name="result3", value=Do("GetState", name="session_id"))}}

{{Set(name="batch_results", value=Concat(result1, " | ", result2, " | ", result3))}}
{{SendMessage(message=Concat("Batch results: ", batch_results))}}
```

### Error-Safe Action Execution
```newo
{{!-- Execute actions with error handling --}}
{{Set(name="action_name", value="GetUser")}}
{{Set(name="action_param", value="name")}}

{{Set(name="safe_result", value=Do(action_name, field=action_param))}}
{{#if IsEmpty(text=safe_result)}}
  {{SendMessage(message="Action execution failed or returned empty result")}}
{{else}}
  {{SendMessage(message=Concat("Action result: ", safe_result))}}
{{/if}}
```

## Advanced Patterns

### Dynamic API Calls
```newo
{{!-- Build dynamic external command calls --}}
{{Set(name="api_endpoint", value=GetState(name="selected_endpoint"))}}
{{Set(name="api_data", value=GetState(name="request_data"))}}

{{#if IsSimilar(text1=api_endpoint, text2="user_data")}}
  {{Set(name="api_result", value=Do("SendCommand", command="get_user_data", data=api_data))}}
{{else}}
  {{#if IsSimilar(text1=api_endpoint, text2="send_notification")}}
    {{Set(name="api_result", value=Do("SendCommand", command="send_notification", message=api_data))}}
  {{else}}
    {{Set(name="api_result", value="Endpoint not configured")}}
  {{/if}}
{{/if}}

{{SendMessage(message=Concat("API Result: ", api_result))}}
```

### Conditional Action Chains
```newo
{{!-- Chain actions based on previous results --}}
{{Set(name="user_verified", value=Do("GetState", name="email_verified"))}}

{{#if IsSimilar(text1=user_verified, text2="true")}}
  {{Set(name="user_data", value=Do("GetUser", field="email"))}}
  {{Set(name="notification_result", value=Do("SendMessage", message="Email verified user detected"))}}
{{else}}
  {{Set(name="verification_prompt", value=Do("SendMessage", message="Please verify your email first"))}}
{{/if}}
```

### Plugin-Style Architecture
```newo
{{!-- Execute plugin actions dynamically --}}
{{Set(name="plugin_enabled", value=GetState(name="analytics_plugin"))}}
{{Set(name="event_data", value=GetTriggeredAct())}}

{{#if IsSimilar(text1=plugin_enabled, text2="true")}}
  {{Set(name="analytics_result", value=Do("SendSystemEvent", eventIdn="user_action", data=event_data))}}
  {{SendMessage(message="Analytics plugin executed")}}
{{else}}
  {{SendMessage(message="Analytics plugin disabled")}}
{{/if}}
```

### State Machine Implementation
```newo
{{!-- Implement state machine with dynamic actions --}}
{{Set(name="current_state", value=GetState(name="machine_state"))}}
{{Set(name="state_action", value=GetState(name="state_actions"))}}

{{#if IsSimilar(text1=current_state, text2="idle")}}
  {{Set(name="state_result", value=Do("SendMessage", message="System ready")}}
  {{SetState(name="machine_state", value="ready")}}
{{else}}
  {{#if IsSimilar(text1=current_state, text2="processing")}}
    {{Set(name="state_result", value=Do("GetMemory", count="1"))}}
    {{SetState(name="machine_state", value="complete")}}
  {{else}}
    {{Set(name="state_result", value=Do("SendMessage", message="State machine reset"))}}
    {{SetState(name="machine_state", value="idle")}}
  {{/if}}
{{/if}}
```

## Integration Examples

### With AI Generation
```newo
{{!-- Dynamic AI action calls --}}
{{Set(name="ai_mode", value=GetState(name="generation_mode"))}}
{{Set(name="ai_prompt", value="Generate a helpful response")}}

{{#if IsSimilar(text1=ai_mode, text2="stream")}}
  {{Set(name="ai_result", value=Do("GenStream", name="response", prompt=ai_prompt))}}
{{else}}
  {{Set(name="ai_result", value=Do("Gen", name="response", prompt=ai_prompt))}}
{{/if}}

{{SendMessage(message=ai_result)}}
```

### With Memory Management
```newo
{{!-- Dynamic memory operations --}}
{{Set(name="memory_operation", value=GetState(name="memory_mode"))}}
{{Set(name="memory_count", value=GetState(name="memory_limit"))}}

{{#if IsSimilar(text1=memory_operation, text2="recent")}}
  {{Set(name="memory_result", value=Do("GetMemory", count=memory_count, fromPerson="User"))}}
{{else}}
  {{Set(name="memory_result", value=Do("GetMemory", count="1", fromPerson="Both"))}}
{{/if}}

{{SendMessage(message=Concat("Memory: ", memory_result))}}
```

### With Actor Management
```newo
{{!-- Dynamic actor operations --}}
{{Set(name="actor_operation", value=GetTriggeredAct())}}
{{Set(name="target_user", value=GetUser(field="id"))}}

{{#if IsSimilar(text1=actor_operation, text2="get actors")}}
  {{Set(name="actor_result", value=Do("GetActors", personaId=target_user))}}
{{else}}
  {{#if IsSimilar(text1=actor_operation, text2="create actor")}}
    {{Set(name="actor_result", value=Do("CreateActor", externalId=GetUser(field="email")))}}
  {{else}}
    {{Set(name="actor_result", value="Invalid actor operation")}}
  {{/if}}
{{/if}}
```

## Workflow Orchestration

### Sequential Workflows
```newo
{{!-- Execute workflow steps sequentially --}}
{{Set(name="workflow_steps", value=CreateArray("step1", "step2", "step3"))}}
{{Set(name="current_step", value=GetState(name="workflow_position"))}}

{{#if IsSimilar(text1=current_step, text2="1")}}
  {{Set(name="step_result", value=Do("GetUser", field="name"))}}
  {{SetState(name="workflow_position", value="2")}}
{{else}}
  {{#if IsSimilar(text1=current_step, text2="2")}}
    {{Set(name="step_result", value=Do("SetState", name="user_processed", value="true"))}}
    {{SetState(name="workflow_position", value="3")}}
  {{else}}
    {{Set(name="step_result", value=Do("SendMessage", message="Workflow complete"))}}
    {{SetState(name="workflow_position", value="1")}}
  {{/if}}
{{/if}}
```

### Parallel Workflows
```newo
{{!-- Execute multiple actions in parallel simulation --}}
{{Set(name="parallel_actions", value=CreateArray("GetUser", "GetMemory", "GetDateTime"))}}

{{Set(name="result1", value=Do("GetUser", field="name"))}}
{{Set(name="result2", value=Do("GetMemory", count="1"))}}
{{Set(name="result3", value=Do("GetDateTime"))}}

{{Set(name="parallel_results", value=Concat("User: ", result1, " Memory: ", result2, " Time: ", result3))}}
{{SendMessage(message=parallel_results)}}
```

## Error Handling

### Safe Action Execution
```newo
{{!-- Execute actions with validation --}}
{{Set(name="action_to_execute", value=GetState(name="dynamic_action"))}}
{{Set(name="action_params", value=GetState(name="action_parameters"))}}

{{#if IsEmpty(text=action_to_execute)}}
  {{SendMessage(message="No action specified")}}
{{else}}
  {{Set(name="execution_result", value=Do(action_to_execute, parameters=action_params))}}
  {{#if IsEmpty(text=execution_result)}}
    {{SendMessage(message="Action executed but returned no result")}}
  {{else}}
    {{SendMessage(message=Concat("Success: ", execution_result))}}
  {{/if}}
{{/if}}
```

### Fallback Actions
```newo
{{!-- Implement fallback action patterns --}}
{{Set(name="primary_action", value="GetUser")}}
{{Set(name="fallback_action", value="SendMessage")}}

{{Set(name="primary_result", value=Do(primary_action, field="name"))}}
{{#if IsEmpty(text=primary_result)}}
  {{Set(name="fallback_result", value=Do(fallback_action, message="Fallback action executed"))}}
  {{SendMessage(message="Primary action failed, fallback used")}}
{{else}}
  {{SendMessage(message=Concat("Primary result: ", primary_result))}}
{{/if}}
```

## Performance Considerations

### Action Caching
```newo
{{!-- Cache action results to avoid repeated execution --}}
{{Set(name="cache_key", value=Concat("action_", action_name, "_", action_params))}}
{{Set(name="cached_result", value=GetState(name=cache_key))}}

{{#if IsEmpty(text=cached_result)}}
  {{Set(name="fresh_result", value=Do(action_name, parameters=action_params))}}
  {{SetState(name=cache_key, value=fresh_result)}}
  {{Set(name="final_result", value=fresh_result)}}
{{else}}
  {{Set(name="final_result", value=cached_result)}}
{{/if}}
```

### Conditional Execution
```newo
{{!-- Only execute when necessary --}}
{{Set(name="execution_needed", value=GetState(name="needs_execution"))}}
{{#if IsSimilar(text1=execution_needed, text2="true")}}
  {{Set(name="conditional_result", value=Do("GetMemory", count="5"))}}
  {{SetState(name="needs_execution", value="false")}}
{{else}}
  {{Set(name="conditional_result", value="Execution skipped")}}
{{/if}}
```

## Limitations

- **Action Availability**: Can only call existing actions
- **Parameter Validation**: No compile-time parameter checking
- **Error Propagation**: Errors from called actions may propagate
- **Performance Overhead**: Additional layer of indirection
- **Debugging Difficulty**: Dynamic calls harder to trace and debug

## Related Actions

- [**If**](./if) - Conditional logic for action selection
- [**Set**](./set) - Store dynamic action results
- [**GetState**](./getstate) - Get configuration for dynamic calls
- [**IsEmpty**](./isempty) - Validate action results
- [**SendMessage**](./sendmessage) - Common target for dynamic calls
- [**Return**](./return) - Control flow from dynamic actions

## Best Practices

- **Validate Actions**: Always check if actions exist before calling
- **Error Handling**: Implement proper error handling for dynamic calls
- **Performance**: Cache results when possible
- **Documentation**: Document dynamic action patterns clearly
- **Testing**: Test all possible action paths thoroughly