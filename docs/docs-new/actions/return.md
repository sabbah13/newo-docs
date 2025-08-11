---
sidebar_position: 33
title: "Return"
description: "Output final values and control skill execution flow"
---

# Return

Outputs a final value from operations or workflows and controls skill execution flow. Essential for structured responses, early exits, and passing computed results to subsequent workflow steps.

## Syntax

```newo
Return(
  val: str
)
```

## Parameters

### Required Parameters

- **`val`** (string): The value to return as the final result

## Return Values

- **Final output**: The specified value as the skill's final result
- **Execution termination**: Stops further skill execution
- **Flow control**: Provides structured exit from workflows

## How It Works

1. **Value Processing**: Processes the provided value parameter
2. **Execution Halt**: Immediately stops skill execution
3. **Result Output**: Returns the value as the final skill result
4. **Flow Termination**: Prevents execution of subsequent actions

## Use Cases

### Early Exit Conditions
```newo
{{!-- Exit early if user not authenticated --}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{#if IsEmpty(text=user_id)}}
  {{Return("Authentication required - please log in to continue")}}
{{/if}}

{{!-- This code only runs if authenticated --}}
{{SendMessage(message="Welcome to the secure area!")}}
```

### Conditional Processing Results
```newo
{{!-- Return different results based on conditions --}}
{{Set(name="user_type", value=GetUser(field="type"))}}
{{#if IsSimilar(text1=user_type, text2="admin")}}
  {{Return("Admin dashboard access granted")}}
{{else}}
  {{#if IsSimilar(text1=user_type, text2="user")}}
    {{Return("User dashboard access granted")}}
  {{else}}
    {{Return("Access denied - unknown user type")}}
  {{/if}}
{{/if}}
```

### Computed Result Returns
```newo
{{!-- Process and return calculation results --}}
{{Set(name="user_score", value=GetState(name="current_score"))}}
{{Set(name="bonus_points", value="100")}}
{{Set(name="final_score", value=Concat(user_score, "+", bonus_points))}}

{{#if IsSimilar(text1=final_score, text2="high", threshold=0.3)}}
  {{Return(Concat("Congratulations! Your final score: ", final_score))}}
{{else}}
  {{Return(Concat("Your score: ", final_score, " - Keep improving!"))}}
{{/if}}
```

### Workflow Step Completion
```newo
{{!-- Complete workflow step and return status --}}
{{Set(name="workflow_step", value=GetState(name="current_step"))}}
{{Set(name="step_data", value=GetTriggeredAct())}}

{{#if IsSimilar(text1=workflow_step, text2="1")}}
  {{SetState(name="step1_data", value=step_data)}}
  {{SetState(name="current_step", value="2")}}
  {{Return("Step 1 completed - proceed to step 2")}}
{{else}}
  {{#if IsSimilar(text1=workflow_step, text2="2")}}
    {{SetState(name="step2_data", value=step_data)}}
    {{SetState(name="workflow_complete", value="true")}}
    {{Return("Workflow completed successfully")}}
  {{/if}}
{{/if}}
```

## Advanced Patterns

### Error Handling with Returns
```newo
{{!-- Validate input and return appropriate responses --}}
{{Set(name="user_input", value=GetTriggeredAct())}}
{{#if IsEmpty(text=user_input)}}
  {{Return("Error: No input provided")}}
{{/if}}

{{Set(name="processed_input", value=Stringify(user_input))}}
{{#if IsEmpty(text=processed_input)}}
  {{Return("Error: Invalid input format")}}
{{/if}}

{{!-- Process valid input --}}
{{Set(name="result", value=Concat("Processed: ", processed_input))}}
{{Return(result)}}
```

### Multi-Branch Processing
```newo
{{!-- Handle multiple processing branches --}}
{{Set(name="operation_type", value=GetState(name="requested_operation"))}}
{{Set(name="user_data", value=GetUser(field="name"))}}

{{#if IsSimilar(text1=operation_type, text2="profile")}}
  {{Set(name="profile_info", value=Concat("Profile: ", user_data))}}
  {{Return(profile_info)}}
{{else}}
  {{#if IsSimilar(text1=operation_type, text2="settings")}}
    {{Set(name="settings_info", value="Settings panel ready")}}
    {{Return(settings_info)}}
  {{else}}
    {{#if IsSimilar(text1=operation_type, text2="help")}}
      {{Return("Help documentation available")}}
    {{else}}
      {{Return("Unknown operation requested")}}
    {{/if}}
  {{/if}}
{{/if}}
```

### State-Based Returns
```newo
{{!-- Return results based on current state --}}
{{Set(name="session_state", value=GetState(name="user_session"))}}
{{Set(name="last_action", value=GetState(name="last_user_action"))}}

{{#if IsSimilar(text1=session_state, text2="active")}}
  {{Set(name="session_info", value=Concat("Active session - Last action: ", last_action))}}
  {{Return(session_info)}}
{{else}}
  {{#if IsSimilar(text1=session_state, text2="expired")}}
    {{Return("Session expired - please log in again")}}
  {{else}}
    {{Return("No active session found")}}
  {{/if}}
{{/if}}
```

### Computed Value Returns
```newo
{{!-- Process and return computed values --}}
{{Set(name="conversation_length", value=GetMemory(count="10"))}}
{{Set(name="summary", value=Summarize(inputText=conversation_length, maxLen="100"))}}
{{Set(name="timestamp", value=GetDateTime())}}

{{Set(name="final_report", value=Concat(
  "Conversation Summary: ", summary,
  " | Generated: ", timestamp
))}}

{{Return(final_report)}}
```

## Integration Examples

### With AI Generation
```newo
{{!-- Generate response and return result --}}
{{Set(name="user_query", value=GetTriggeredAct())}}
{{#if IsEmpty(text=user_query)}}
  {{Return("Please provide a question or request")}}
{{/if}}

{{#system~}}
Answer this user question: {{user_query}}
{{~/system}}

{{#assistant~}}
{{Gen(name="ai_response", maxTokens=200)}}
{{~/assistant}}

{{Return(ai_response)}}
```

### With External Commands
```newo
{{!-- Execute command and return result --}}
{{Set(name="command_type", value=GetState(name="external_command"))}}
{{Set(name="command_params", value=GetState(name="command_parameters"))}}

{{#if IsEmpty(text=command_type)}}
  {{Return("No command specified")}}
{{/if}}

{{Set(name="command_result", value=SendCommand(command=command_type, data=command_params))}}
{{#if IsEmpty(text=command_result)}}
  {{Return("Command executed but no response received")}}
{{else}}
  {{Return(Concat("Command result: ", command_result))}}
{{/if}}
```

### With Memory Analysis
```newo
{{!-- Analyze conversation and return insights --}}
{{Set(name="conversation_data", value=GetMemory(count="20", maxLen="5000"))}}
{{#if IsEmpty(text=conversation_data)}}
  {{Return("No conversation history available")}}
{{/if}}

{{Set(name="conversation_summary", value=Summarize(
  inputText=conversation_data,
  maxLen="150"
))}}

{{Set(name="analysis_result", value=Concat(
  "Conversation Analysis: ", conversation_summary,
  " | Messages analyzed: 20"
))}}

{{Return(analysis_result)}}
```

## Control Flow Patterns

### Guard Clauses
```newo
{{!-- Multiple guard conditions --}}
{{Set(name="user_auth", value=GetUser(field="id"))}}
{{#if IsEmpty(text=user_auth)}}
  {{Return("Authentication required")}}
{{/if}}

{{Set(name="user_permissions", value=GetUser(field="type"))}}
{{#if IsEmpty(text=user_permissions)}}
  {{Return("User permissions not found")}}
{{/if}}

{{Set(name="feature_enabled", value=GetState(name="feature_flag"))}}
{{#if IsEmpty(text=feature_enabled)}}
  {{Return("Feature currently unavailable")}}
{{/if}}

{{!-- Main logic only executes if all guards pass --}}
{{Return("All checks passed - feature access granted")}}
```

### Success/Failure Paths
```newo
{{!-- Structured success/failure handling --}}
{{Set(name="operation_success", value="true")}}
{{Set(name="operation_data", value=GetTriggeredAct())}}

{{#if IsEmpty(text=operation_data)}}
  {{Set(name="operation_success", value="false")}}
  {{Return("Operation failed: No data provided")}}
{{/if}}

{{Set(name="processed_data", value=Stringify(operation_data))}}
{{#if IsEmpty(text=processed_data)}}
  {{Set(name="operation_success", value="false")}}
  {{Return("Operation failed: Data processing error")}}
{{/if}}

{{#if IsSimilar(text1=operation_success, text2="true")}}
  {{Return(Concat("Operation successful: ", processed_data))}}
{{else}}
  {{Return("Operation failed: Unknown error")}}
{{/if}}
```

### Workflow Completion
```newo
{{!-- Complete multi-step workflow --}}
{{Set(name="workflow_steps", value=CreateArray("validate", "process", "complete"))}}
{{Set(name="current_step", value=GetState(name="workflow_position"))}}

{{#if IsSimilar(text1=current_step, text2="validate")}}
  {{Set(name="validation_result", value="passed")}}
  {{SetState(name="workflow_position", value="process")}}
  {{Return("Validation complete - ready for processing")}}
{{else}}
  {{#if IsSimilar(text1=current_step, text2="process")}}
    {{Set(name="processing_result", value="completed")}}
    {{SetState(name="workflow_position", value="complete")}}
    {{Return("Processing complete - ready for finalization")}}
  {{else}}
    {{SetState(name="workflow_position", value="validate")}}
    {{Return("Workflow completed - resetting for next cycle")}}
  {{/if}}
{{/if}}
```

## Performance Optimization

### Early Returns for Performance
```newo
{{!-- Exit early to avoid unnecessary processing --}}
{{Set(name="cache_key", value=Concat("result_", GetUser(field="id")))}}
{{Set(name="cached_result", value=GetState(name=cache_key))}}

{{#if IsEmpty(text=cached_result)}}
  {{!-- No cache hit, continue processing --}}
{{else}}
  {{Return(Concat("Cached result: ", cached_result))}}
{{/if}}

{{!-- Expensive processing only if not cached --}}
{{Set(name="complex_calculation", value=Summarize(
  inputText=GetMemory(count="50"),
  maxLen="200"
))}}

{{SetState(name=cache_key, value=complex_calculation)}}
{{Return(Concat("Fresh result: ", complex_calculation))}}
```

### Resource Conservation
```newo
{{!-- Conserve resources with early exits --}}
{{Set(name="resource_limit", value=GetState(name="api_calls_remaining"))}}
{{#if IsSimilar(text1=resource_limit, text2="0", threshold=0.9)}}
  {{Return("API limit reached - please try again later")}}
{{/if}}

{{!-- Continue with resource-intensive operation --}}
{{Set(name="api_result", value=SendCommand(command="external_api"))}}
{{Return(Concat("API result: ", api_result))}}
```

## Error Handling Best Practices

### Comprehensive Error Returns
```newo
{{!-- Handle all possible error conditions --}}
{{Set(name="input_data", value=GetTriggeredAct())}}
{{Set(name="user_context", value=GetUser(field="id"))}}
{{Set(name="system_status", value=GetState(name="system_ready"))}}

{{#if IsEmpty(text=input_data)}}
  {{Return("Error 001: No input data provided")}}
{{/if}}

{{#if IsEmpty(text=user_context)}}
  {{Return("Error 002: User authentication failed")}}
{{/if}}

{{#if IsEmpty(text=system_status)}}
  {{Return("Error 003: System not ready")}}
{{/if}}

{{!-- All validation passed --}}
{{Return("Success: All validations passed")}}
```

## Limitations

- **Immediate Exit**: Stops all subsequent action execution
- **Single Return**: Can only return one value per execution
- **String Only**: Return values are always strings
- **No Stack**: Cannot return to specific execution points
- **Flow Control**: Affects entire skill flow, not just local blocks

## Related Actions

- [**If**](./if) - Conditional logic leading to returns
- [**Set**](./set) - Prepare values for return
- [**IsEmpty**](./isempty) - Validate before returning
- [**Concat**](./concat) - Build return messages
- [**GetState**](./getstate) - Get state data for returns
- [**Do**](./do) - Dynamic action calls with returns

## Best Practices

- **Early Validation**: Use returns for early validation exits
- **Clear Messages**: Provide descriptive return messages
- **Error Codes**: Include error identifiers in returns
- **State Cleanup**: Clean up state before returning
- **Consistent Format**: Use consistent return message formats