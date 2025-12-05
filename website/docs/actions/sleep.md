---
sidebar_position: 53
title: "Sleep"
description: "Pause execution for a specified duration"
---

# Sleep

Pause skill execution for a specified duration. This action is useful for implementing delays, rate limiting, waiting for external processes, or creating timed sequences in workflows.

## Syntax

```newo
Sleep(
  duration: str,
  interruptible: Literal["True", "False", "y", "n"] = "False"
)
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `duration` | string | Yes | - | Duration in seconds to pause execution |
| `interruptible` | string | No | `"False"` | Whether sleep can be interrupted by new events |

### Interruptible Values
- `"True"` or `"y"` - Sleep can be interrupted by incoming events
- `"False"` or `"n"` - Sleep completes full duration regardless of events

## Returns

- **void** - No return value

## How It Works

1. **Duration Parsing**: Converts duration string to numeric value
2. **Interrupt Mode**: Sets up event listening if interruptible
3. **Pause Execution**: Halts skill execution for specified duration
4. **Resume**: Continues skill execution after duration or interrupt

## Basic Usage

### Simple Delay
```newo
{{!-- Wait 2 seconds before continuing --}}
{{Sleep(duration="2")}}
{{SendMessage(message="Continuing after delay...")}}
```

### Interruptible Wait
```newo
{{!-- Wait up to 5 seconds, but can be interrupted --}}
{{Sleep(duration="5", interruptible="True")}}
{{SendMessage(message="Wait completed or interrupted.")}}
```

## Common Use Cases

### Rate Limiting
```newo
{{!-- Rate limit API calls --}}
{% for item in items_to_process %}
  {{Set(name="result", value=CallExternalAPI(data=item))}}
  {{!-- Wait 1 second between API calls --}}
  {{Sleep(duration="1")}}
{% endfor %}
```

### Typing Indicator Simulation
```newo
{{!-- Simulate natural typing delay --}}
{{SendTypingStart()}}
{{Sleep(duration="2")}}
{{SendTypingStop()}}
{{SendMessage(message="Here's what I found...")}}
```

### Staged Notifications
```newo
{{!-- Send notifications in stages --}}
{{SendMessage(message="Processing your request...")}}
{{Sleep(duration="3")}}
{{SendMessage(message="Almost done...")}}
{{Sleep(duration="2")}}
{{SendMessage(message="Complete! Here are your results.")}}
```

### Waiting for External Process
```newo
{{!-- Wait for external system to process --}}
{{SendCommand(
  commandIdn="start_processing",
  integrationIdn="external_service",
  requestId=request_id
)}}

{{SendMessage(message="Processing started. Please wait...")}}

{{!-- Wait for processing with interrupt capability --}}
{{Sleep(duration="10", interruptible="True")}}

{{!-- Check result --}}
{{Set(name="result", value=GetState(name="processing_result"))}}
```

## Advanced Patterns

### Retry with Delay
```newo
{{!-- Retry operation with increasing delays --}}
{{Set(name="max_retries", value="3")}}
{{Set(name="retry_count", value="0")}}
{{Set(name="success", value="false")}}

{% while not IsSimilar(text1=success, text2="true") and LessThan(a=retry_count, b=max_retries) %}
  {{Set(name="result", value=AttemptOperation())}}

  {{#if IsSimilar(text1=result.status, text2="success")}}
    {{Set(name="success", value="true")}}
  {{else}}
    {{Set(name="retry_count", value=Add(a=retry_count, b="1"))}}
    {{!-- Exponential backoff: 1s, 2s, 4s --}}
    {{Set(name="delay", value=Power(base="2", exp=retry_count))}}
    {{Sleep(duration=delay)}}
  {{/if}}
{% endwhile %}
```

### Timed Sequence
```newo
{{!-- Execute timed sequence of actions --}}
{{Set(name="sequence", value=CreateArray(
  {"action": "step1", "delay": "2"},
  {"action": "step2", "delay": "3"},
  {"action": "step3", "delay": "1"}
))}}

{% for step in sequence %}
  {{Do(action=step.action)}}
  {{Sleep(duration=step.delay)}}
{% endfor %}
```

### Polling Pattern
```newo
{{!-- Poll for status changes --}}
{{Set(name="status", value="pending")}}
{{Set(name="poll_count", value="0")}}
{{Set(name="max_polls", value="10")}}

{% while IsSimilar(text1=status, text2="pending") and LessThan(a=poll_count, b=max_polls) %}
  {{Sleep(duration="5", interruptible="True")}}
  {{Set(name="status", value=GetState(name="job_status"))}}
  {{Set(name="poll_count", value=Add(a=poll_count, b="1"))}}
{% endwhile %}

{{#if IsSimilar(text1=status, text2="completed")}}
  {{SendMessage(message="Job completed successfully!")}}
{{else}}
  {{SendMessage(message="Job is still processing. We'll notify you when complete.")}}
{{/if}}
```

### User Response Timeout
```newo
{{!-- Wait for user response with timeout --}}
{{SendMessage(message="Would you like to proceed? (yes/no)")}}

{{!-- Wait up to 30 seconds for response --}}
{{Sleep(duration="30", interruptible="True")}}

{{!-- Check if user responded --}}
{{Set(name="user_response", value=GetMemory(count="1", fromPerson="User"))}}

{{#if IsEmpty(text=user_response)}}
  {{SendMessage(message="No response received. Cancelling operation.")}}
{{else}}
  {{!-- Process user response --}}
  {{SendMessage(message=Concat("You said: ", user_response))}}
{{/if}}
```

## Integration with Flow Control

### Non-Interruptible Section with Sleep
```newo
{{!-- Critical section that shouldn't be interrupted --}}
{{StartNotInterruptibleBlock()}}

{{SendMessage(message="Processing payment...")}}
{{Set(name="payment_result", value=ProcessPayment(data=payment_data))}}
{{Sleep(duration="2", interruptible="False")}}
{{SendMessage(message="Verifying transaction...")}}
{{Sleep(duration="1", interruptible="False")}}
{{SendMessage(message="Payment complete!")}}

{{StopNotInterruptibleBlock()}}
```

### Conditional Delays
```newo
{{!-- Adjust delay based on context --}}
{{Set(name="channel", value=GetActor(field="integrationIdn"))}}

{{#if IsSimilar(text1=channel, text2="vapi")}}
  {{!-- Voice channel - longer delays for natural speech --}}
  {{Set(name="delay_time", value="3")}}
{{else}}
  {{!-- Text channel - shorter delays --}}
  {{Set(name="delay_time", value="1")}}
{{/if}}

{{Sleep(duration=delay_time)}}
```

## Best Practices

### 1. Use Appropriate Durations
```newo
{{!-- Short delays for UI feedback --}}
{{Sleep(duration="0.5")}}

{{!-- Medium delays for processing indicators --}}
{{Sleep(duration="2")}}

{{!-- Longer delays for external process waits --}}
{{Sleep(duration="10", interruptible="True")}}
```

### 2. Always Consider Interruptibility
```newo
{{!-- For user-facing waits, allow interruption --}}
{{Sleep(duration="10", interruptible="True")}}

{{!-- For critical operations, prevent interruption --}}
{{Sleep(duration="2", interruptible="False")}}
```

### 3. Provide User Feedback During Waits
```newo
{{!-- Don't leave users wondering --}}
{{SendMessage(message="Please wait while I process your request...")}}
{{SendTypingStart()}}
{{Sleep(duration="5")}}
{{SendTypingStop()}}
{{SendMessage(message="Done!")}}
```

## Limitations

- **Maximum Duration**: Very long sleeps may timeout
- **Blocking**: Sleep blocks the current skill execution
- **No Partial Interrupt Info**: No way to know remaining time after interrupt
- **Resource Usage**: Extended sleeps consume resources

## Troubleshooting

### Sleep Not Working
```newo
{{!-- Ensure duration is a string --}}
{{Sleep(duration="5")}}  {{!-- Correct --}}
{{!-- Sleep(duration=5)  -- Incorrect, may cause issues --}}
```

### Unexpected Interruptions
```newo
{{!-- Use non-interruptible block for critical sequences --}}
{{StartNotInterruptibleBlock()}}
{{Sleep(duration="5", interruptible="False")}}
{{StopNotInterruptibleBlock()}}
```

## Related Actions

- [**StartNotInterruptibleBlock**](./startnotinterruptibleblock) - Begin protected execution
- [**StopNotInterruptibleBlock**](./stopnotinterruptibleblock) - End protected execution
- [**SendTypingStart**](./sendtypingstart) - Show typing indicator
- [**SendTypingStop**](./sendtypingstop) - Hide typing indicator
- [**Do**](./do) - Execute dynamic actions
