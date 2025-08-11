---
sidebar_position: 14
title: "GetRandomChoice"
description: "Randomly select from multiple string options or arrays"
---

# GetRandomChoice

Randomly select from any number of string literals or arrays of strings. Essential for creating variety in responses, generating random identifiers, A/B testing, and implementing probabilistic behaviors in skill workflows.

## Syntax

```newo
GetRandomChoice(
  str | [str] {, str | [str]}
)
```

## Parameters

- **Arguments** (variable): One or more arguments, each can be:
  - String literal (e.g., `"option1"`)
  - Array of strings (e.g., `["choice1", "choice2"]`)
  - Mixed combinations of strings and arrays
  - Minimum: 1 argument required

## How It Works

1. **Option Collection**: Gathers all provided strings and array elements
2. **Random Selection**: Uses uniform random distribution to select one option
3. **Return Value**: Returns the selected string value
4. **Equal Probability**: Each individual string has equal chance of selection

## Use Cases

### 🎲 Response Variation
- **Conversational Diversity**: Vary responses to avoid repetitive interactions
- **Greeting Alternatives**: Randomize welcome messages and greetings
- **Error Messages**: Provide variety in error communications
- **Confirmation Phrases**: Mix up acknowledgment responses

### 🔧 System Utilities
- **Random Identifiers**: Generate random suffixes for unique naming
- **Session Management**: Create varied session names and tokens
- **Load Distribution**: Randomly distribute tasks across resources
- **Testing Scenarios**: Implement randomized testing behaviors

### 🎯 User Experience Enhancement
- **A/B Testing**: Randomly assign users to different experience variants
- **Content Personalization**: Randomly select from curated content pools
- **Game Mechanics**: Implement chance-based interactions
- **Surprise Elements**: Add unpredictability to user interactions

## Basic Usage Examples

### Simple Random Selection
```newo
{{!-- Basic random choices for varied responses --}}
{{Set(name="greeting", value=GetRandomChoice("Hello", "Hi there", "Welcome"))}}
{{Set(name="question", value=GetRandomChoice(["How can I help?", "What can I do for you?", "How may I assist?"]))}}
{{Set(name="closing", value=GetRandomChoice("Thanks", "Have a great day", ["Goodbye", "See you later", "Take care"]))}}

{{!-- Combine random elements for natural conversation --}}
{{SendMessage(message=Concat(
  greeting, "! ", question, " ", closing, "!"
))}}
```

**Why this works**: Random response variation prevents conversations from feeling robotic and repetitive. By combining different random elements, you create natural-feeling interactions that seem more human and engaging to users.

### Random Identifier Generation
```newo
{{!-- Generate random postfix for unique identifiers --}}
{{Set(name="letters", value=CreateArray(
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
))}}

{{!-- Create 4-letter random suffix --}}
{{Set(name="random_postfix", value=Concat(
  GetRandomChoice(letters),
  GetRandomChoice(letters), 
  GetRandomChoice(letters),
  GetRandomChoice(letters)
))}}

{{!-- Generate unique session or identifier name --}}
{{Set(name="unique_id", value=Concat(
  "session_", 
  GetDateTime(format="timestamp"), 
  "_", 
  random_postfix
))}}

{{SendMessage(message=Concat("Created unique ID: ", unique_id))}}

{{!-- Store for later use --}}
{{SetState(name="current_session_id", value=unique_id)}}
```

**Why this works**: Random identifier generation is crucial for creating unique session names, temporary files, or distinguishing between similar resources. The random postfix ensures uniqueness while remaining readable and manageable.

## Advanced Response Management

### Context-Aware Random Responses
```newo
{{!-- Adapt random choices based on conversation context --}}
{{Set(name="user_sentiment", value=GetState(name="detected_sentiment"))}}
{{Set(name="interaction_count", value=GetState(name="conversation_turns"))}}

{{!-- Choose response pool based on context --}}
{{#if IsSimilar(text1=user_sentiment, text2="positive")}}
  {{Set(name="response_options", value=[
    "That's wonderful to hear!",
    "I'm so glad!",
    "Excellent news!",
    "That sounds fantastic!",
    "I'm thrilled for you!"
  ])}}
  
{{else if IsSimilar(text1=user_sentiment, text2="negative")}}
  {{Set(name="response_options", value=[
    "I understand that must be frustrating.",
    "I'm sorry to hear that.",
    "Let me help you with that concern.",
    "I can see why that would be upsetting.",
    "I'm here to help resolve this."
  ])}}
  
{{else}}
  {{Set(name="response_options", value=[
    "I see.",
    "Thank you for letting me know.",
    "I understand.",
    "Got it.",
    "That makes sense."
  ])}}
{{/if}}

{{!-- Adjust enthusiasm based on conversation length --}}
{{#if GreaterThan(a=interaction_count, b="10")}}
  {{!-- Long conversation: more casual responses --}}
  {{Set(name="casual_additions", value=[
    " We've been chatting for a while now!",
    " You're certainly thorough!",
    " I appreciate your patience.",
    ""
  ])}}
  {{Set(name="selected_response", value=Concat(
    GetRandomChoice(response_options),
    GetRandomChoice(casual_additions)
  ))}}
{{else}}
  {{Set(name="selected_response", value=GetRandomChoice(response_options))}}
{{/if}}

{{SendMessage(message=selected_response)}}

{{!-- Log context-aware choice for analytics --}}
{{SendSystemEvent(
  eventIdn="contextual_response_selected",
  sentiment=user_sentiment,
  turn_count=interaction_count,
  response_used=selected_response
)}}
```

**Why this works**: Context-aware random selection creates more appropriate and engaging responses. By adapting the choice pool based on user sentiment and conversation length, the system maintains contextual relevance while still providing variety.

### A/B Testing Implementation
```newo
{{!-- Implement A/B testing for different user experience variants --}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{Set(name="test_variant", value=GetRandomChoice("A", "B"))}}

{{!-- Store user's assigned variant --}}
{{SetPersonaAttribute(
  id=user_id,
  field="ui_test_variant_v2_1",
  value=test_variant
)}}

{{#if IsSimilar(text1=test_variant, text2="A")}}
  {{!-- Variant A: Formal, detailed responses --}}
  {{Set(name="welcome_style", value="formal")}}
  {{Set(name="response_template", value="I would be delighted to assist you with your inquiry. How may I provide you with the information you need today?")}}
  {{Set(name="confirmation_phrases", value=[
    "Certainly, I can help with that.",
    "Absolutely, let me take care of that for you.",
    "Of course, I'll be happy to assist."
  ])}}
  
{{else}}
  {{!-- Variant B: Casual, friendly responses --}}
  {{Set(name="welcome_style", value="casual")}}
  {{Set(name="response_template", value="Hey there! What can I help you with today?")}}
  {{Set(name="confirmation_phrases", value=[
    "Sure thing!",
    "You got it!",
    "No problem at all!",
    "I'm on it!"
  ])}}
{{/if}}

{{!-- Use variant-specific responses --}}
{{SendMessage(message=response_template)}}

{{!-- Log A/B test assignment --}}
{{SendCommand(
  commandIdn="log_ab_test",
  integrationIdn="analytics",
  connectorIdn="ab_testing",
  user_id=user_id,
  test_name="ui_response_style_v2_1",
  variant=test_variant,
  welcome_style=welcome_style,
  timestamp=GetDateTime()
)}}

{{!-- Store confirmation phrases for later use --}}
{{SetState(name="current_confirmation_phrases", value=Stringify(confirmation_phrases))}}
```

**Why this works**: A/B testing with random assignment helps optimize user experience by comparing different approaches. Random assignment ensures fair distribution across user groups, while persistent storage maintains consistency throughout each user's session.

## Mock Data and Testing

### Mock Response Generation
```newo
{{!-- Generate mock responses for testing workflows --}}
{{Set(name="mock_enabled", value=GetState(name="testing_mode"))}}

{{#if IsSimilar(text1=mock_enabled, text2="true")}}
  {{!-- Define various mock response categories --}}
  {{Set(name="success_responses", value=[
    "Operation completed successfully",
    "Task finished without errors",
    "All systems working perfectly",
    "Request processed successfully"
  ])}}
  
  {{Set(name="error_responses", value=[
    "Temporary system error occurred",
    "Service temporarily unavailable", 
    "Request could not be processed",
    "An unexpected error happened"
  ])}}
  
  {{Set(name="pending_responses", value=[
    "Request is being processed",
    "Operation in progress",
    "Please wait while we handle this",
    "Working on your request"
  ])}}
  
  {{!-- Randomly choose response type and specific message --}}
  {{Set(name="response_type", value=GetRandomChoice("success", "success", "success", "error", "pending"))}}
  
  {{#if IsSimilar(text1=response_type, text2="success")}}
    {{Set(name="mock_response", value=GetRandomChoice(success_responses))}}
    {{Set(name="status_code", value="200")}}
  {{else if IsSimilar(text1=response_type, text2="error")}}
    {{Set(name="mock_response", value=GetRandomChoice(error_responses))}}
    {{Set(name="status_code", value="500")}}
  {{else}}
    {{Set(name="mock_response", value=GetRandomChoice(pending_responses))}}
    {{Set(name="status_code", value="202")}}
  {{/if}}
  
  {{!-- Store mock response state --}}
  {{SetState(name="bot_response", value=mock_response)}}
  {{SetState(name="response_status", value=status_code)}}
  
  {{SendMessage(message=Concat(
    "MOCK: ", mock_response, " (Status: ", status_code, ")"
  ))}}
  
  {{SendSystemEvent(
    eventIdn="mock_response_generated",
    response_type=response_type,
    response_text=mock_response,
    status_code=status_code,
    testing_session=GetState(name="test_session_id")
  )}}
  
{{else}}
  {{!-- Normal operation mode --}}
  {{SendMessage(message="Real system response")}}
{{/if}}
```

**Why this works**: Mock data generation with random selection enables comprehensive testing of different scenarios. By weighting success responses more heavily, you can simulate realistic conditions while still testing error handling and edge cases.

## Load Balancing and Resource Distribution

### Random Load Distribution
```newo
{{!-- Distribute tasks randomly across available resources --}}
{{Set(name="available_workers", value=GetActors(
  integrationIdn="worker_pool",
  connectorIdn="task_workers"
))}}

{{Set(name="worker_count", value=Len(text=Stringify(available_workers)))}}

{{#if GreaterThan(a=worker_count, b="0")}}
  {{!-- Create worker selection pool with health weighting --}}
  {{Set(name="healthy_workers", value=CreateArray())}}
  {{Set(name="all_workers", value=CreateArray())}}
  
  {{#each available_workers}}
    {{Set(name="worker_health", value=GetPersonaAttribute(
      id=GetValueJSON(obj=this, key="personaId"),
      field="health_status"
    ))}}
    
    {{!-- Add to appropriate pools --}}
    {{Set(name="all_workers", value=AppendItemsArrayJSON(
      array=all_workers,
      items=[GetValueJSON(obj=this, key="id")]
    ))}}
    
    {{#if IsSimilar(text1=worker_health, text2="healthy")}}
      {{Set(name="healthy_workers", value=AppendItemsArrayJSON(
        array=healthy_workers,
        items=[GetValueJSON(obj=this, key="id")]
      ))}}
    {{/if}}
  {{/each}}
  
  {{!-- Prefer healthy workers, fallback to all workers --}}
  {{Set(name="selection_pool", value=IsEmpty(text=Stringify(healthy_workers)) ? all_workers : healthy_workers)}}
  
  {{!-- Randomly select worker --}}
  {{Set(name="selected_worker", value=GetRandomChoice(selection_pool))}}
  
  {{!-- Assign task to selected worker --}}
  {{Set(name="task_payload", value=CreateObject(
    task_id=GetState(name="pending_task_id"),
    task_type=GetState(name="task_type"),
    priority="normal",
    assigned_worker=selected_worker,
    assignment_method="random_selection"
  ))}}
  
  {{SendCommand(
    commandIdn="assign_task",
    integrationIdn="task_manager",
    connectorIdn="worker_assignment",
    worker_id=selected_worker,
    task_data=Stringify(task_payload)
  )}}
  
  {{SendMessage(message=Concat(
    "Task assigned to worker: ", selected_worker
  ))}}
  
  {{!-- Log assignment for load balancing analytics --}}
  {{SendSystemEvent(
    eventIdn="task_randomly_assigned",
    selected_worker=selected_worker,
    selection_pool_size=Len(text=Stringify(selection_pool)),
    healthy_workers_available=Len(text=Stringify(healthy_workers)),
    total_workers_available=worker_count
  )}}
  
{{else}}
  {{SendMessage(message="No workers available for task assignment")}}
  {{SendSystemEvent(eventIdn="no_workers_available")}}
{{/if}}
```

**Why this works**: Random load distribution prevents hotspots and ensures fair resource utilization. By maintaining separate pools for healthy and all workers, the system can prioritize performance while maintaining resilience when resources are limited.

## Advanced Randomization Patterns

### Weighted Random Selection Simulation
```newo
{{!-- Simulate weighted random selection using repeated entries --}}
{{Set(name="response_priority", value=GetState(name="customer_tier"))}}

{{!-- Build weighted selection pool based on customer tier --}}
{{#if IsSimilar(text1=response_priority, text2="premium")}}
  {{Set(name="response_pool", value=[
    "I'll prioritize your request immediately",
    "I'll prioritize your request immediately",
    "I'll prioritize your request immediately",  // 50% weight
    "Let me expedite this for you",
    "Let me expedite this for you",              // 33% weight
    "I'll handle this right away"                // 17% weight
  ])}}
  
{{else if IsSimilar(text1=response_priority, text2="standard")}}
  {{Set(name="response_pool", value=[
    "I'll take care of this for you",
    "I'll take care of this for you",            // 40% weight
    "Let me help you with that",
    "Let me help you with that",                 // 40% weight
    "I'll get this sorted out"                   // 20% weight
  ])}}
  
{{else}}
  {{Set(name="response_pool", value=[
    "I'll help you with this",
    "Let me assist you",
    "I can help with that",
    "Let me look into this"                      // Equal 25% weight each
  ])}}
{{/if}}

{{Set(name="selected_response", value=GetRandomChoice(response_pool))}}

{{!-- Add random timing element --}}
{{Set(name="timing_phrases", value=[
  "",                                            // 40% - no timing
  "",
  " shortly",                                    // 30% - add "shortly"
  " shortly",
  " in just a moment",                           // 20% - more specific
  " right now"                                   // 10% - immediate
])}}

{{Set(name="final_response", value=Concat(
  selected_response,
  GetRandomChoice(timing_phrases),
  "."
))}}

{{SendMessage(message=final_response)}}

{{!-- Log weighted selection for analytics --}}
{{SendSystemEvent(
  eventIdn="weighted_response_selected",
  customer_tier=response_priority,
  base_response=selected_response,
  final_response=final_response,
  pool_size=Len(text=Stringify(response_pool))
)}}
```

**Why this works**: Weighted random selection allows you to favor certain outcomes while maintaining variety. By repeating preferred options in the selection pool, you create probability distributions that match business priorities or user preferences.

### Random Timing and Scheduling
```newo
{{!-- Add random delays and timing for more natural interactions --}}
{{Set(name="interaction_type", value=GetState(name="current_interaction_type"))}}

{{!-- Define timing pools based on interaction type --}}
{{#if IsSimilar(text1=interaction_type, text2="initial_contact")}}
  {{Set(name="delay_options", value=["0", "1", "2"])}}        {{!-- Quick response --}}
  {{Set(name="typing_simulation", value=["short", "medium"])}} 
  
{{else if IsSimilar(text1=interaction_type, text2="complex_query")}}
  {{Set(name="delay_options", value=["2", "3", "4", "5"])}}   {{!-- Thinking time --}}
  {{Set(name="typing_simulation", value=["medium", "long", "long"])}}
  
{{else if IsSimilar(text1=interaction_type, text2="casual_chat")}}
  {{Set(name="delay_options", value=["1", "2", "3"])}}        {{!-- Natural pace --}}
  {{Set(name="typing_simulation", value=["short", "short", "medium"])}}
{{/if}}

{{!-- Select random timing --}}
{{Set(name="response_delay", value=GetRandomChoice(delay_options))}}
{{Set(name="typing_duration", value=GetRandomChoice(typing_simulation))}}

{{!-- Simulate typing indicator based on selection --}}
{{#if IsSimilar(text1=typing_duration, text2="short")}}
  {{Set(name="typing_seconds", value=GetRandomChoice(["2", "3", "4"]))}}
{{else if IsSimilar(text1=typing_duration, text2="medium")}}
  {{Set(name="typing_seconds", value=GetRandomChoice(["5", "6", "7", "8"]))}}
{{else}}
  {{Set(name="typing_seconds", value=GetRandomChoice(["9", "10", "11", "12"]))}}
{{/if}}

{{!-- Implement timing --}}
{{SendCommand(
  commandIdn="show_typing_indicator",
  integrationIdn="chat_interface",
  connectorIdn="typing_status",
  duration_seconds=typing_seconds,
  delay_before_start=response_delay
)}}

{{!-- Send actual response after calculated delay --}}
{{SendCommand(
  commandIdn="schedule_response",
  integrationIdn="scheduler",
  connectorIdn="delayed_messages",
  delay_seconds=Add(a=response_delay, b=typing_seconds),
  message_content=GetState(name="prepared_response")
)}}

{{!-- Log timing analytics --}}
{{SendSystemEvent(
  eventIdn="natural_timing_applied",
  interaction_type=interaction_type,
  response_delay=response_delay,
  typing_duration=typing_duration,
  total_delay=Add(a=response_delay, b=typing_seconds)
)}}
```

**Why this works**: Random timing creates more natural, human-like interactions. By varying response delays and typing indicators based on interaction type, the system avoids feeling robotic while maintaining appropriate responsiveness for different scenarios.

## Best Practices

### Randomness with Consistency
```newo
{{!-- Maintain user experience consistency while adding variation --}}
{{Set(name="user_preferences", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="interaction_preferences"
))}}

{{!-- Respect user preferences in random selection --}}
{{#if Contains(text=user_preferences, search="formal_tone")}}
  {{Set(name="tone_options", value=[
    "I would be happy to assist",
    "Certainly, I can help with that",
    "I'll be glad to take care of this"
  ])}}
{{else if Contains(text=user_preferences, search="casual_tone")}}
  {{Set(name="tone_options", value=[
    "Sure thing!",
    "No problem!",
    "You got it!"
  ])}}
{{else}}
  {{!-- Mixed tone for flexibility --}}
  {{Set(name="tone_options", value=[
    "I can help with that",
    "Let me take care of this",
    "I'll handle that for you"
  ])}}
{{/if}}

{{Set(name="selected_tone", value=GetRandomChoice(tone_options))}}

{{!-- Maintain brand consistency --}}
{{Set(name="brand_closings", value=[
  "Is there anything else I can help you with?",
  "What else can I do for you today?", 
  "How else may I assist you?"
])}}

{{SendMessage(message=Concat(
  selected_tone, ". ",
  GetRandomChoice(brand_closings)
))}}
```

### Error-Safe Random Selection
```newo
{{!-- Always provide fallback for empty or invalid selections --}}
{{Set(name="dynamic_options", value=GetState(name="available_responses"))}}

{{#if IsEmpty(text=dynamic_options)}}
  {{!-- Fallback to default options --}}
  {{Set(name="safe_options", value=[
    "I understand",
    "Thank you for letting me know",
    "I'm here to help"
  ])}}
  {{Set(name="final_choice", value=GetRandomChoice(safe_options))}}
  
  {{SendSystemEvent(
    eventIdn="random_choice_fallback_used",
    reason="empty_dynamic_options",
    fallback_option=final_choice
  )}}
{{else}}
  {{Set(name="final_choice", value=GetRandomChoice(dynamic_options))}}
{{/if}}

{{SendMessage(message=final_choice)}}
```

## Limitations

- **True Randomness**: Uses pseudorandom generation, not cryptographically secure
- **Equal Distribution**: All individual strings have equal probability unless weighted manually
- **Static Execution**: Selection happens once per execution, not re-evaluated
- **String-Only**: Can only select from string values, not complex objects
- **Array Flattening**: Arrays are flattened into individual choices

## Troubleshooting

### Empty Selection Handling
```newo
{{Set(name="options", value=GetState(name="user_options"))}}
{{#if IsEmpty(text=options)}}
  {{Set(name="default_response", value="I'll help you with that")}}
  {{SendMessage(message=default_response)}}
{{else}}
  {{SendMessage(message=GetRandomChoice(options))}}
{{/if}}
```

### Validation of Random Choices
```newo
{{Set(name="choice", value=GetRandomChoice("A", "B", "C"))}}
{{Set(name="valid_choices", value=["A", "B", "C"])}}

{{#if not Contains(text=Stringify(valid_choices), search=choice)}}
  {{SendSystemEvent(
    eventIdn="invalid_random_choice",
    selected=choice,
    valid_options=Stringify(valid_choices)
  )}}
{{/if}}
```

## Related Actions

- **action** - Create arrays for random selection
- **action** - Store random selections
- **action** - Combine random elements
- **action** - Retrieve dynamic option pools
- **action** - Log random selection events