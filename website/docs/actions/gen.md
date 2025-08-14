---
sidebar_position: 3
title: "Gen"
description: "Synchronous AI content generation with customizable parameters"
---

# Gen

Generate AI responses synchronously for use within skill scripts. Unlike GenStream, Gen processes prompts internally without streaming to clients, making it ideal for validation, JSON generation, and preprocessing.

## Syntax

```newo
gen(
  name: str,
  temperature: float = 0.75,
  stop: List[str] = None,
  maxTokens: int = None,
  topP: float = 1.0,
  skipFilter: bool = False,
  skipChecks: bool = False,
  maxRetries: int = 5,
  jsonSchema: str = None
)
```

## Parameters

### Required Parameters

- **`name`** (string): Variable name to store the generated result

### Optional Parameters

- **`temperature`** (float, 0.0-2.0): Controls randomness and creativity
  - `0.0`: Deterministic, consistent outputs
  - `0.75` (default): Balanced creativity and consistency
  - `1.0+`: More creative and varied outputs

- **`stop`** (List[str]): Stop sequences to halt generation
  - Default: `["Agent:", "User:"]` to prevent dialogue continuation
  - Custom: `[".", "]", "}"]` for structured output parsing

- **`maxTokens`** (int): Maximum response length
  - Default: Model-specific limit
  - Recommended: 100-500 for summaries, 1000+ for detailed content

- **`topP`** (float, 0.0-1.0): Nucleus sampling parameter
  - `0.1-0.5`: Conservative vocabulary, focused responses
  - `1.0` (default): Full vocabulary diversity

- **`skipFilter`** (boolean): Bypass content moderation
  - `false` (default): Apply safety filters
  - `true`: Skip filters for JSON/structured output

- **`skipChecks`** (boolean): Skip validation checks
  - `false` (default): Validate input/output
  - `true`: Skip for performance-critical operations

- **`maxRetries`** (int): Retry attempts for failed requests
  - Default: `5`
  - Range: 1-10 based on reliability requirements

- **`jsonSchema`** (string): Enforce JSON structure
  - Provide OpenAPI/JSON Schema specification
  - Ensures consistent, parseable output format

## How It Works

1. **Prompt Construction**: Builds prompt from current context and system instructions
2. **LLM Invocation**: Sends request to configured language model
3. **Response Processing**: Applies filters and validation if enabled
4. **Result Storage**: Stores output in specified variable for use in skill
5. **Error Handling**: Implements retry logic for failed requests

## Use Cases

### JSON Data Generation
```newo
{{#system~}}
Generate a booking summary as JSON with these fields:
- customer_name: string
- appointment_date: ISO date
- service_type: string
- estimated_duration: number (minutes)
- total_cost: number

Customer said: "{{GetMemory(count="5", fromPerson="User")}}"
{{~/system}}

{{#assistant~}}
{{gen(
  name="booking_json",
  temperature=0.2,
  maxTokens=200,
  jsonSchema='{"type": "object", "properties": {"customer_name": {"type": "string"}, "appointment_date": {"type": "string"}, "service_type": {"type": "string"}, "estimated_duration": {"type": "number"}, "total_cost": {"type": "number"}}}',
  skipFilter=true
)}}
{{~/assistant}}

{{Set(name="booking_data", value=booking_json)}}
```

### Content Validation
```newo
{{!-- Validate user input for appropriateness --}}
{{Set(name="user_message", value=GetMemory(count="1", fromPerson="User"))}}

{{#system~}}
Analyze this customer message for:
1. Appropriateness (professional/inappropriate)
2. Intent category (booking/question/complaint/other)
3. Urgency level (low/medium/high/emergency)

Message: "{{user_message}}"

Respond with: APPROPRIATE|INAPPROPRIATE, INTENT_CATEGORY, URGENCY_LEVEL
{{~/system}}

{{#assistant~}}
{{gen(name="validation_result", temperature=0.1, maxTokens=50)}}
{{~/assistant}}

{{Set(name="validation_parts", value=Split(text=validation_result, delimiter=","))}}
{{Set(name="is_appropriate", value=GetItemsArrayByIndexesJSON(
  array=validation_parts,
  indexes=[0]
))}}
```

### Dynamic Response Generation
```newo
{{!-- Generate personalized responses based on customer history --}}
{{Set(name="customer_history", value=SearchSemanticAKB(
  query=Concat("customer history ", GetUser(field="name")),
  maxResults=3
))}}

{{#system~}}
Create a personalized greeting for this returning customer.

Customer History: {{customer_history}}
Current Context: {{GetMemory(count="3", summarize="true")}}

Make it warm but professional. Include reference to their history if relevant.
{{~/system}}

{{#assistant~}}
{{gen(name="personalized_greeting", temperature=0.6, maxTokens=150)}}
{{~/assistant}}

{{SendMessage(message=personalized_greeting)}}
```

### Structured Analysis
```newo
{{!-- Analyze conversation for next best action --}}
{{Set(name="conversation_context", value=GetMemory(
  count="10",
  maxLen="5000",
  summarize="true"
))}}

{{#system~}}
Analyze this conversation and recommend the next best action:

Conversation: {{conversation_context}}
Customer Profile: {{GetPersona(id=GetUser(field="id"))}}

Options:
1. SCHEDULE_APPOINTMENT
2. PROVIDE_INFORMATION  
3. TRANSFER_TO_HUMAN
4. END_CONVERSATION

Respond with just the action name and a brief 1-sentence reason.
{{~/system}}

{{#assistant~}}
{{gen(
  name="next_action_analysis",
  temperature=0.3,
  maxTokens=100,
  stop=[".", "\n"]
)}}
{{~/assistant}}

{{SendSystemEvent(eventIdn="next_action_recommended", action=next_action_analysis)}}
```

## Advanced Patterns

### Multi-Step Processing Pipeline
```newo
{{!-- Step 1: Extract information --}}
{{#system~}}
Extract key information from this customer message:
"{{GetMemory(count="1", fromPerson="User")}}"

Return as: NAME|PHONE|EMAIL|SERVICE|DATE
{{~/system}}

{{#assistant~}}
{{gen(name="extracted_info", temperature=0.1, maxTokens=100)}}
{{~/assistant}}

{{!-- Step 2: Validate and structure --}}
{{Set(name="info_parts", value=Split(text=extracted_info, delimiter="|"))}}

{{#system~}}
Validate this extracted information for completeness and format:
{{extracted_info}}

Respond with JSON: {"valid": true/false, "missing_fields": [], "formatted_data": {}}
{{~/system}}

{{#assistant~}}
{{gen(
  name="validation_result",
  temperature=0.0,
  jsonSchema='{"type": "object", "properties": {"valid": {"type": "boolean"}, "missing_fields": {"type": "array"}, "formatted_data": {"type": "object"}}}',
  skipFilter=true
)}}
{{~/assistant}}
```

### Contextual Content Generation
```newo
{{!-- Generate context-aware responses --}}
{{Set(name="business_context", value=GetAKB(key="business_info"))}}
{{Set(name="user_preferences", value=GetPersona(id=GetUser(field="id"))}}
{{Set(name="current_time", value=GetDateTime(format="datetime"))}}

{{#system~}}
Generate an appropriate response considering:

Business Context: {{business_context}}
User Preferences: {{user_preferences}}
Current Time: {{current_time}}
Recent Conversation: {{GetMemory(count="5", summarize="true")}}

Style: Professional but friendly
Length: 1-2 sentences
Purpose: Move conversation toward booking
{{~/system}}

{{#assistant~}}
{{gen(
  name="contextual_response",
  temperature=0.7,
  maxTokens=200,
  topP=0.8
)}}
{{~/assistant}}

{{SendMessage(message=contextual_response)}}
```

## Integration with Other Actions

### With Memory Management
```newo
{{!-- Generate summary for long-term storage --}}
{{Set(name="full_conversation", value=GetMemory(
  count="50",
  fromPerson="Both",
  maxLen="10000"
))}}

{{#system~}}
Summarize this conversation focusing on:
1. Customer needs and preferences
2. Information collected
3. Next steps required

Conversation: {{full_conversation}}
{{~/system}}

{{#assistant~}}
{{gen(name="conversation_summary", temperature=0.3, maxTokens=300)}}
{{~/assistant}}

{{SetAKB(
  key=Concat("conversation_summary_", GetUser(field="id")),
  value=conversation_summary
)}}
```

### With External Commands
```newo
{{!-- Generate personalized SMS content --}}
{{Set(name="customer_name", value=GetUser(field="name"))}}
{{Set(name="appointment_details", value=GetState(name="current_booking"))}}

{{#system~}}
Create a friendly SMS confirmation message for:
Customer: {{customer_name}}
Booking: {{appointment_details}}

Keep under 160 characters. Include booking reference.
{{~/system}}

{{#assistant~}}
{{gen(
  name="sms_content",
  temperature=0.4,
  maxTokens=50,
  stop=["\n"]
)}}
{{~/assistant}}

{{SendCommand(
  commandIdn="send_message",
  integrationIdn="twilio_messenger",
  connectorIdn="sms_connector",
  text=sms_content,
  phoneNumber=GetPersonaAttribute(id=GetUser(field="id"), field="phone")
)}}
```

## Performance Optimization

### Parameter Tuning
```newo
{{!-- Fast classification with minimal tokens --}}
{{gen(
  name="intent_classification",
  temperature=0.0,
  maxTokens=10,
  topP=0.3,
  stop=[".", " "]
)}}

{{!-- Creative content with controlled diversity --}}
{{gen(
  name="marketing_copy",
  temperature=0.8,
  maxTokens=200,
  topP=0.9
)}}
```

### Caching Strategy
```newo
{{!-- Check cache before generation --}}
{{Set(name="cache_key", value=Concat("response_", user_intent, "_", current_context))}}
{{Set(name="cached_response", value=GetAKB(key=cache_key))}}

{{#if IsEmpty(text=cached_response)}}
  {{!-- Generate new response --}}
  {{gen(name="new_response", temperature=0.6, maxTokens=200)}}
  {{SetAKB(key=cache_key, value=new_response)}}
  {{Set(name="final_response", value=new_response)}}
{{else}}
  {{Set(name="final_response", value=cached_response)}}
{{/if}}
```

## Limitations

- **Synchronous Only**: Blocks skill execution until completion
- **No Streaming**: Output not visible to users until complete
- **Model Dependent**: Response quality varies by underlying LLM
- **Token Costs**: Each generation consumes API tokens
- **Latency**: May introduce delays in conversation flow

## Troubleshooting

### Common Issues

**Empty Responses**:
```newo
{{gen(name="result", maxRetries=10, skipChecks=true)}}
{{#if IsEmpty(text=result)}}
  {{SendSystemEvent(eventIdn="generation_failed", context="empty_response")}}
{{/if}}
```

**JSON Parsing Errors**:
```newo
{{gen(
  name="json_data",
  jsonSchema=schema_definition,
  skipFilter=true,
  temperature=0.0,
  stop=["}"]
)}}
```

**Long Response Times**:
```newo
{{!-- Use shorter prompts and lower token limits --}}
{{gen(
  name="quick_response",
  maxTokens=100,
  temperature=0.3,
  topP=0.5
)}}
```

## Related Actions

- [**GenStream**](./genstream) - Streaming AI generation
- [**Set**](./set) - Variable storage for generated content
- [**GetMemory**](./getmemory) - Conversation context for prompts
- [**SendMessage**](./sendmessage) - Output delivery to users
- [**SetState**](./setstate) - Persistent storage of generated content
- [**If**](./if) - Conditional generation logic
- [**Concat**](./concat) - Build dynamic prompts