---
sidebar_position: 10
title: "GenStream"
description: "Real-time streaming AI content generation with interruption handling"
---

# GenStream

Generate and stream AI responses directly to users in real-time. Unlike Gen, GenStream immediately delivers content to communication channels as it's generated, enabling dynamic conversations with interruption handling.

## Syntax

```newo
GenStream(
  interruptMode: Literal["interruptWindow", "interrupt", "none"] = "interrupt",
  interruptWindow: float = None,
  sendTo: Literal["actors", "currentActor", "latestMessageActor"] = "currentActor",
  actorIds: List[str] = None,
  temperature: float = 0.75,
  stop: List[str] = None,
  maxTokens: int = None,
  topP: float = 1.0,
  skipFilter: bool = False,
  skipChecks: bool = False,
  maxRetries: int = 5
)
```

## Parameters

### Streaming Control
- **`interruptMode`** (string): How to handle interruptions during generation
  - `"interrupt"` (default): Stop immediately on new events
  - `"interruptWindow"`: Allow interruptions within specified time window
  - `"none"`: Complete generation without interruption
  
- **`interruptWindow`** (float): Time window in seconds for interruption eligibility (requires `interruptMode="interruptWindow"`)

### Delivery Targeting
- **`sendTo`** (string): Target selection for streaming output
  - `"currentActor"` (default): Stream to event-triggering actor
  - `"latestMessageActor"`: Stream to most recent message actor
  - `"actors"`: Stream to specific actors (requires `actorIds`)

- **`actorIds`** (List[str]): Specific actor targets when `sendTo="actors"`

### Generation Parameters
- **`temperature`** (float, 0.0-2.0): Response creativity level (default: 0.75)
- **`stop`** (List[str]): Stop sequences to halt generation
- **`maxTokens`** (int): Maximum response length
- **`topP`** (float, 0.0-1.0): Nucleus sampling parameter (default: 1.0)
- **`skipFilter`** (bool): Bypass content moderation (default: false)
- **`skipChecks`** (bool): Skip validation checks (default: false)
- **`maxRetries`** (int): Retry attempts for failed requests (default: 5)

## How It Works

1. **Prompt Processing**: Constructs prompt from current skill context
2. **Stream Initiation**: Begins real-time generation and delivery
3. **Interruption Monitoring**: Watches for new events based on interrupt mode
4. **Content Delivery**: Streams generated content directly to target actors
5. **Completion Handling**: Manages stream completion or interruption

## When to Use GenStream

### ✅ Ideal Use Cases
- **Interactive Conversations**: Real-time chat responses
- **Voice Interactions**: Immediate spoken responses via VAPI
- **Live Customer Support**: Dynamic problem-solving conversations
- **Educational Tutoring**: Interactive learning sessions
- **Creative Collaboration**: Brainstorming and ideation sessions

### ❌ Avoid GenStream For
- **Data Processing**: Use Gen for internal calculations
- **JSON Generation**: Use Gen with structured output
- **Batch Operations**: Use Gen for non-interactive processing
- **Content Validation**: Use Gen for review before delivery

## Basic Usage Examples

### Simple Conversational Response
```newo
{{!-- Stream a natural conversation response --}}
{{#system~}}
You are a helpful restaurant reservation assistant. The customer just asked: "{{GetMemory(count="1", fromPerson="User")}}"

Provide a helpful, friendly response that moves the conversation toward making a reservation. Be conversational and engaging.
{{~/system}}

{{#assistant~}}
{{GenStream(
  temperature=0.7,
  maxTokens=200,
  interruptMode="interrupt"
)}}
{{~/assistant}}
```

**Why this works**: The system prompt provides clear context about the customer's question and the assistant's role. GenStream immediately delivers the response as it's generated, creating a natural conversation flow. The interrupt mode allows the customer to interject if needed.

### Channel-Specific Streaming
```newo
{{!-- Stream response to SMS with length constraints --}}
{{Set(name="channel", value=GetActor(field="integrationIdn"))}}

{{#if IsSimilar(text1=channel, text2="twilio_messenger")}}
  {{!-- SMS requires shorter, more direct responses --}}
  {{#system~}}
  Provide a brief, SMS-friendly response (under 160 characters) to: "{{GetMemory(count="1", fromPerson="User")}}"
  {{~/system}}
  
  {{#assistant~}}
  {{GenStream(
    temperature=0.5,
    maxTokens=50,
    stop=["\n", "."],
    interruptMode="none"
  )}}
  {{~/assistant}}
{{else}}
  {{!-- Chat allows longer, more detailed responses --}}
  {{#system~}}
  Provide a detailed, helpful response to: "{{GetMemory(count="1", fromPerson="User")}}"
  {{~/system}}
  
  {{#assistant~}}
  {{GenStream(
    temperature=0.7,
    maxTokens=300,
    interruptMode="interrupt"
  )}}
  {{~/assistant}}
{{/if}}
```

**Why this works**: Different communication channels have different constraints. SMS needs brevity while chat can handle detailed responses. The conditional logic adapts the generation parameters automatically based on the channel type.

## Advanced Interruption Handling

### Interrupt Window for Voice Calls
```newo
{{!-- Allow brief interruption window for voice interactions --}}
{{Set(name="is_voice_call", value=IsSimilar(
  text1=GetActor(field="integrationIdn"),
  text2="vapi"
))}}

{{#if is_voice_call}}
  {{#system~}}
  You're speaking with a customer over the phone about their restaurant reservation. Provide a natural, conversational response to: "{{GetMemory(count="1", fromPerson="User")}}"
  
  Speak naturally as if having a phone conversation. Don't use special formatting or symbols.
  {{~/system}}
  
  {{#assistant~}}
  {{GenStream(
    temperature=0.8,
    maxTokens=150,
    interruptMode="interruptWindow",
    interruptWindow=3.0,
    sendTo="currentActor"
  )}}
  {{~/assistant}}
{{/if}}
```

**Why this works**: Voice interactions need natural flow but should allow interruption if the customer wants to interject. The 3-second interrupt window gives the AI time to establish its response while still being responsive to customer interruptions.

### Multi-Actor Broadcasting
```newo
{{!-- Stream to multiple team members simultaneously --}}
{{Set(name="team_actors", value=GetActors(
  integrationIdn="team_chat",
  connectorIdn="internal_notifications"
))}}

{{Set(name="urgent_issue", value=GetState(name="escalated_customer_issue"))}}

{{#system~}}
URGENT: Customer escalation requires immediate team attention.

Issue Details: {{Stringify(urgent_issue)}}
Customer: {{GetUser(field="name")}}
Current Situation: {{GetMemory(count="3", summarize="true")}}

Provide a concise team briefing and suggest immediate action steps.
{{~/system}}

{{#assistant~}}
{{GenStream(
  sendTo="actors",
  actorIds=team_actors,
  temperature=0.3,
  maxTokens=300,
  interruptMode="none"
)}}
{{~/assistant}}
```

**Why this works**: Team notifications need to reach everyone simultaneously without interruption. The structured prompt ensures all relevant context is included, and `interruptMode="none"` prevents partial messages from confusing team members.

## Dynamic Response Personalization

### Customer History-Aware Streaming
```newo
{{!-- Generate personalized responses based on customer history --}}
{{Set(name="customer_history", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="interaction_history"
))}}

{{Set(name="customer_preferences", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="dining_preferences"
))}}

{{#system~}}
You're assisting a returning customer with their restaurant reservation.

Customer Background:
- Name: {{GetUser(field="name")}}
- Previous Visits: {{customer_history}}
- Preferences: {{customer_preferences}}
- Current Request: "{{GetMemory(count="1", fromPerson="User")}}"

Provide a personalized response that acknowledges their history and preferences. Be warm and familiar, but professional.
{{~/system}}

{{#assistant~}}
{{GenStream(
  temperature=0.6,
  maxTokens=250,
  interruptMode="interrupt",
  topP=0.9
)}}
{{~/assistant}}
```

**Why this works**: Personalization creates better customer experiences. The system prompt provides rich context about the customer's history, enabling the AI to reference past interactions and preferences naturally. The streaming delivery makes the personalized response feel immediate and engaging.

## Error Recovery and Fallback

### Graceful Stream Failure Handling
```newo
{{!-- Attempt streaming with fallback to pre-written response --}}
{{Set(name="fallback_message", value="I'm here to help with your reservation. What would you like to know?")}}

{{#system~}}
Customer inquiry: "{{GetMemory(count="1", fromPerson="User")}}"

Provide a helpful response about restaurant reservations.
{{~/system}}

{{#assistant~}}
{{Set(name="stream_result", value=GenStream(
  temperature=0.7,
  maxTokens=200,
  interruptMode="interrupt",
  maxRetries=3
))}}
{{~/assistant}}

{{!-- Check if streaming succeeded --}}
{{#if IsEmpty(text=stream_result)}}
  {{!-- Fallback to predetermined response --}}
  {{SendMessage(message=fallback_message)}}
  {{SendSystemEvent(
    eventIdn="genstream_fallback_used",
    reason="stream_generation_failed",
    customer_id=GetUser(field="id")
  )}}
{{/if}}
```

**Why this works**: Streaming can fail due to network issues or service outages. Having a fallback ensures customers always receive a response, even if it's not as dynamic. The system event helps track when fallbacks occur for monitoring purposes.

## Performance Optimization

### Context-Aware Token Management
```newo
{{!-- Adjust response length based on conversation stage --}}
{{Set(name="conversation_stage", value=GetState(name="booking_progress"))}}
{{Set(name="response_length", value="150")}}  {{!-- default --}}

{{#if IsSimilar(text1=conversation_stage, text2="initial_greeting")}}
  {{Set(name="response_length", value="100")}}  {{!-- shorter for greetings --}}
{{else if IsSimilar(text1=conversation_stage, text2="collecting_details")}}
  {{Set(name="response_length", value="200")}}  {{!-- longer for detailed questions --}}
{{else if IsSimilar(text1=conversation_stage, text2="confirming_booking")}}
  {{Set(name="response_length", value="250")}}  {{!-- detailed for confirmation --}}
{{/if}}

{{#system~}}
Conversation stage: {{conversation_stage}}
Customer message: "{{GetMemory(count="1", fromPerson="User")}}"

Respond appropriately for this stage of the booking process.
{{~/system}}

{{#assistant~}}
{{GenStream(
  temperature=0.6,
  maxTokens=response_length,
  interruptMode="interrupt"
)}}
{{~/assistant}}
```

**Why this works**: Different conversation stages require different response lengths. Initial greetings should be brief, while confirmation stages need detail. Adapting token limits based on context improves both user experience and cost efficiency.

### Intelligent Stop Sequence Management
```newo
{{!-- Use dynamic stop sequences based on expected response format --}}
{{Set(name="user_question_type", value=GetState(name="detected_intent"))}}
{{Set(name="stop_sequences", value=CreateArray())}}

{{#if IsSimilar(text1=user_question_type, text2="yes_no_question")}}
  {{Set(name="stop_sequences", value=[".", "!", "?"])}}
{{else if IsSimilar(text1=user_question_type, text2="list_request")}}
  {{Set(name="stop_sequences", value=["\n\n", "That's all"])}}
{{else}}
  {{Set(name="stop_sequences", value=["Agent:", "User:"])}}  {{!-- default --}}
{{/if}}

{{#system~}}
Customer asked: "{{GetMemory(count="1", fromPerson="User")}}"
Expected response type: {{user_question_type}}

Provide an appropriate response.
{{~/system}}

{{#assistant~}}
{{GenStream(
  temperature=0.7,
  stop=stop_sequences,
  maxTokens=200,
  interruptMode="interrupt"
)}}
{{~/assistant}}
```

**Why this works**: Different types of questions require different response structures. Yes/no questions should stop at punctuation, while list requests might need different boundaries. Smart stop sequences improve response quality and reduce unnecessary generation.

## Integration Patterns

### Voice and Text Coordination
```newo
{{!-- Coordinate between voice and text channels --}}
{{Set(name="voice_actors", value=GetActors(integrationIdn="vapi"))}}
{{Set(name="text_actors", value=GetActors(integrationIdn="twilio_messenger"))}}
{{Set(name="customer_preference", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="communication_preference"
))}}

{{#if IsSimilar(text1=customer_preference, text2="voice_preferred")}}
  {{!-- Stream to voice with follow-up text summary --}}
  {{#system~}}
  Provide a spoken response to the customer's question: "{{GetMemory(count="1", fromPerson="User")}}"
  
  Speak naturally and conversationally.
  {{~/system}}
  
  {{#assistant~}}
  {{Set(name="voice_response", value=GenStream(
    sendTo="actors",
    actorIds=voice_actors,
    temperature=0.8,
    maxTokens=150,
    interruptMode="interruptWindow",
    interruptWindow=2.0
  ))}}
  {{~/assistant}}
  
  {{!-- Follow up with text summary --}}
  {{#if not IsEmpty(text=text_actors)}}
    {{SendMessage(
      message="📞 Call summary: We discussed your reservation request. Check your voicemail for details.",
      actorIds=text_actors
    )}}
  {{/if}}
{{else}}
  {{!-- Text-first approach --}}
  {{#system~}}
  Provide a clear text response to: "{{GetMemory(count="1", fromPerson="User")}}"
  {{~/system}}
  
  {{#assistant~}}
  {{GenStream(
    sendTo="actors",
    actorIds=text_actors,
    temperature=0.6,
    maxTokens=200,
    interruptMode="interrupt"
  )}}
  {{~/assistant}}
{{/if}}
```

**Why this works**: Customers have different communication preferences. Some prefer voice interactions with text summaries, while others prefer text-first. Coordinating between channels based on preferences creates a seamless experience.

## Advanced Use Cases

### Interactive Problem Solving
```newo
{{!-- Stream responses that guide customers through complex scenarios --}}
{{Set(name="problem_complexity", value=GetState(name="issue_complexity_score"))}}
{{Set(name="customer_technical_level", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="technical_comfort"
))}}

{{#system~}}
Customer Issue: "{{GetMemory(count="1", fromPerson="User")}}"
Problem Complexity: {{problem_complexity}}/10
Customer Technical Level: {{customer_technical_level}}

Provide step-by-step guidance that matches their technical comfort level. If complexity is high (>7), break into smaller steps with checkpoints.
{{~/system}}

{{#assistant~}}
{{GenStream(
  temperature=0.4,  {{!-- Lower temperature for instructional content --}}
  maxTokens=300,
  interruptMode="interruptWindow",
  interruptWindow=5.0,  {{!-- Longer window for instructional content --}}
  topP=0.7  {{!-- Focused vocabulary for clear instructions --}}
)}}
{{~/assistant}}

{{!-- Set up follow-up check --}}
{{SendCommand(
  commandIdn="set_timer",
  integrationIdn="program_timer",
  connectorIdn="follow_up_timer",
  personaId=GetUser(field="id"),
  timerName="problem_solving_check",
  interval="300"  {{!-- 5 minutes --}}
)}}
```

**Why this works**: Complex problems require adaptive guidance. The system considers both problem complexity and customer technical comfort to tailor the response appropriately. The longer interrupt window allows customers to follow along without feeling rushed.

### Creative Collaboration Sessions
```newo
{{!-- Stream creative responses for brainstorming sessions --}}
{{Set(name="brainstorm_context", value=GetState(name="creative_session_context"))}}
{{Set(name="previous_ideas", value=GetMemory(
  count="5",
  fromPerson="Both",
  maxLen="1000"
))}}

{{#system~}}
You're collaborating on a creative project with the customer.

Session Context: {{brainstorm_context}}
Previous Ideas Discussed: {{previous_ideas}}
Latest Input: "{{GetMemory(count="1", fromPerson="User")}}"

Build on their ideas with creative suggestions, ask engaging questions, and maintain the collaborative energy. Be encouraging and expansive in your thinking.
{{~/system}}

{{#assistant~}}
{{GenStream(
  temperature=0.9,  {{!-- High creativity for brainstorming --}}
  maxTokens=250,
  interruptMode="interrupt",  {{!-- Allow quick back-and-forth --}}
  topP=0.95  {{!-- Full vocabulary diversity --}}
)}}
{{~/assistant}}

{{!-- Track creative session metrics --}}
{{SetState(
  name="session_interaction_count",
  value=Add(
    a=GetState(name="session_interaction_count"),
    b="1"
  )
)}}
```

**Why this works**: Creative sessions benefit from high-energy, expansive responses that build on ideas. The high temperature and topP values encourage diverse, creative language, while immediate interruption allows for natural collaborative flow.

## Best Practices

### Response Quality Guidelines
```newo
{{!-- Always provide context and purpose in system prompts --}}
{{#system~}}
Context: You are assisting with restaurant reservations
Purpose: Help the customer complete their booking
Customer Message: "{{GetMemory(count="1", fromPerson="User")}}"
Response Guidelines:
- Be helpful and professional
- Ask clarifying questions when needed
- Provide specific next steps
- Maintain a friendly tone
{{~/system}}

{{#assistant~}}
{{GenStream(
  temperature=0.6,
  maxTokens=200,
  interruptMode="interrupt"
)}}
{{~/assistant}}
```

### Performance Monitoring
```newo
{{!-- Monitor streaming performance --}}
{{Set(name="stream_start_time", value=GetDateTime(format="timestamp"))}}

{{#assistant~}}
{{Set(name="stream_response", value=GenStream(
  temperature=0.7,
  maxTokens=200,
  interruptMode="interrupt"
))}}
{{~/assistant}}

{{Set(name="stream_end_time", value=GetDateTime(format="timestamp"))}}
{{Set(name="response_time", value=Subtract(a=stream_end_time, b=stream_start_time))}}

{{#if GreaterThan(a=response_time, b="5000")}}
  {{SendSystemEvent(
    eventIdn="slow_genstream_response",
    response_time_ms=response_time,
    customer_id=GetUser(field="id")
  )}}
{{/if}}
```

## Limitations

- **Real-Time Delivery**: Cannot be used for internal processing (use Gen instead)
- **Interruption Handling**: Complex interrupt logic may affect response quality
- **Token Consumption**: Streaming may use more tokens due to immediate delivery
- **Error Recovery**: Failed streams cannot be easily retried without customer awareness
- **Multi-Channel Coordination**: Requires careful management when streaming to multiple channels

## Troubleshooting

### Stream Interruption Issues
```newo
{{!-- Handle frequent interruptions --}}
{{Set(name="interruption_count", value=GetState(name="current_interruptions"))}}

{{#if GreaterThan(a=interruption_count, b="3")}}
  {{!-- Switch to no-interrupt mode --}}
  {{GenStream(
    interruptMode="none",
    maxTokens=100,
    temperature=0.5
  )}}
  {{SetState(name="current_interruptions", value="0")}}
{{else}}
  {{GenStream(interruptMode="interrupt")}}
{{/if}}
```

### Channel-Specific Issues
```newo
{{!-- Adapt to channel limitations --}}
{{Set(name="channel_type", value=GetActor(field="integrationIdn"))}}

{{#if IsSimilar(text1=channel_type, text2="twilio_messenger")}}
  {{!-- SMS has character limits --}}
  {{GenStream(
    maxTokens=30,
    stop=["\n"],
    skipFilter=false
  )}}
{{else if IsSimilar(text1=channel_type, text2="vapi")}}
  {{!-- Voice needs natural speech patterns --}}
  {{GenStream(
    temperature=0.8,
    stop=[".", "!", "?"],
    maxTokens=100
  )}}
{{/if}}
```

## Related Actions

- **action** - Synchronous AI generation for internal processing
- **action** - Direct message delivery
- **action** - Conversation context for prompts
- **action** - Target selection for streaming
- **action** - Track streaming sessions and interruptions