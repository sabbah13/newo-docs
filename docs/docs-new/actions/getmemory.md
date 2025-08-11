---
sidebar_position: 4
title: "GetMemory"
description: "Retrieve conversation history and context with powerful filtering options"
---

# GetMemory

Retrieve conversation history, message context, and interaction data with advanced filtering and processing capabilities. Essential for maintaining conversation continuity and providing context-aware responses.

## Syntax

```newo
GetMemory(
  fromPerson: Literal["User", "Agent", "Both"] = "Both",
  offset: str = "0",
  count: str = "10",
  maxLen: str = "5000",
  asEnglishText: str = "false",
  summarize: str = "false",
  fromDate: str = None,
  toDate: str = None,
  filterByActorIds: str = None,
  filterByUserPersonaIds: str = None
)
```

## Parameters

### Filtering Parameters

- **`fromPerson`** (string): Source persona filter
  - `"Both"` (default): Include messages from all participants
  - `"User"`: Only user messages
  - `"Agent"`: Only agent responses

- **`filterByActorIds`** (string): Filter by specific actor IDs
  - Takes precedence over `filterByUserPersonaIds`
  - Useful for channel-specific memory (SMS, email, voice)

- **`filterByUserPersonaIds`** (string): Filter by persona IDs
  - Ignored if `filterByActorIds` is set
  - Useful for multi-user conversation contexts

### Content Parameters

- **`offset`** (string): Skip recent conversation turns
  - `"0"` (default): Start from most recent
  - `"5"`: Skip last 5 turns, start from 6th most recent

- **`count`** (string): Number of conversation turns to retrieve
  - Default: `"10"`
  - Recommended: 5-20 for context, 50+ for analysis

- **`maxLen`** (string): Maximum character limit
  - Default: `"5000"`
  - Balances context richness with performance

### Processing Parameters

- **`asEnglishText`** (string): Translate to English
  - `"false"` (default): Preserve original language
  - `"true"`: Auto-translate foreign languages

- **`summarize`** (string): Compress conversation content
  - `"false"` (default): Full conversation history
  - `"true"`: AI-generated summary for efficiency

### Date Range Parameters

- **`fromDate`** (string): Start date filter (ISO-8601 format)
- **`toDate`** (string): End date filter (ISO-8601 format)

## How It Works

1. **Query Construction**: Builds database query based on filter parameters
2. **Data Retrieval**: Fetches matching conversation turns from memory store
3. **Processing**: Applies translation and summarization if requested
4. **Formatting**: Returns structured conversation history
5. **Caching**: Optimizes repeated queries with intelligent caching

## Basic Usage Examples

### Recent Conversation Context
```newo
{{!-- Get last 10 turns for context --}}
{{Set(name="recent_context", value=GetMemory(
  count="10",
  maxLen="3000",
  fromPerson="Both"
))}}

{{#system~}}
Previous conversation:
{{recent_context}}

Respond naturally to continue this conversation.
{{~/system}}

{{#assistant~}}
{{gen(name="contextual_response", temperature=0.7)}}
{{~/assistant}}

{{SendMessage(message=contextual_response)}}
```

### User-Only Messages
```newo
{{!-- Analyze what customer has said --}}
{{Set(name="user_inputs", value=GetMemory(
  fromPerson="User",
  count="20",
  maxLen="8000"
))}}

{{#system~}}
Analyze these customer messages to extract:
1. Main request/need
2. Mentioned preferences
3. Any constraints or requirements

Customer messages: {{user_inputs}}
{{~/system}}

{{#assistant~}}
{{gen(name="customer_analysis", temperature=0.3, maxTokens=300)}}
{{~/assistant}}
```

## Advanced Filtering

### Channel-Specific Memory
```newo
{{!-- Get SMS conversation history only --}}
{{Set(name="sms_actors", value=GetActors(integrationIdn="twilio_messenger"))}}
{{Set(name="sms_memory", value=GetMemory(
  filterByActorIds=Stringify(sms_actors),
  count="20",
  maxLen="4000"
))}}

{{!-- Get voice call history only --}}
{{Set(name="voice_actors", value=GetActors(integrationIdn="vapi"))}}
{{Set(name="voice_memory", value=GetMemory(
  filterByActorIds=Stringify(voice_actors),
  count="15",
  maxLen="6000"
))}}
```

### Multi-Persona Conversations
```newo
{{!-- Filter memory for specific customer persona --}}
{{Set(name="customer_id", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="primary_customer_id"
))}}

{{Set(name="customer_memory", value=GetMemory(
  filterByUserPersonaIds=customer_id,
  count="30",
  maxLen="10000",
  summarize="true"
))}}
```

### Date Range Analysis
```newo
{{!-- Get last week's conversations --}}
{{Set(name="week_ago", value=GetDateInterval(
  start=GetDateTime(),
  offset="-7d"
))}}

{{Set(name="weekly_memory", value=GetMemory(
  fromDate=week_ago,
  toDate=GetDateTime(),
  count="100",
  summarize="true"
))}}

{{!-- Analyze trends --}}
{{#system~}}
Analyze conversation patterns from the past week:
{{weekly_memory}}

Identify:
1. Common customer questions
2. Successful resolution patterns
3. Areas needing improvement
{{~/system}}

{{#assistant~}}
{{gen(name="trend_analysis", temperature=0.4, maxTokens=400)}}
{{~/assistant}}
```

## Performance Optimization

### Efficient Context Loading
```newo
{{!-- Load minimal context for simple responses --}}
{{#if IsSimilar(text1=user_intent, text2="greeting")}}
  {{Set(name="context", value=GetMemory(count="3", maxLen="500"))}}
{{else}}
  {{Set(name="context", value=GetMemory(count="15", maxLen="5000"))}}
{{/if}}
```

### Smart Summarization
```newo
{{!-- Use summarization for long conversations --}}
{{Set(name="turn_count", value=GetState(name="conversation_turns"))}}

{{#if IsSimilar(text1=turn_count, text2="20")}}
  {{!-- Long conversation, use summary --}}
  {{Set(name="memory", value=GetMemory(
    count="50",
    maxLen="15000",
    summarize="true"
  ))}}
{{else}}
  {{!-- Short conversation, use full history --}}
  {{Set(name="memory", value=GetMemory(
    count=turn_count,
    maxLen="8000"
  ))}}
{{/if}}
```

### Caching Strategy
```newo
{{!-- Cache expensive memory operations --}}
{{Set(name="cache_key", value=Concat(
  "memory_cache_",
  GetUser(field="id"),
  "_",
  GetDateTime(format="date")
))}}

{{Set(name="cached_memory", value=GetAKB(key=cache_key))}}

{{#if IsEmpty(text=cached_memory)}}
  {{Set(name="fresh_memory", value=GetMemory(
    count="30",
    maxLen="10000",
    summarize="true"
  ))}}
  {{SetAKB(key=cache_key, value=fresh_memory)}}
  {{Set(name="memory_context", value=fresh_memory)}}
{{else}}
  {{Set(name="memory_context", value=cached_memory)}}
{{/if}}
```

## Translation and Localization

### Auto-Translation
```newo
{{!-- Get conversation in English regardless of original language --}}
{{Set(name="english_memory", value=GetMemory(
  count="15",
  maxLen="8000",
  asEnglishText="true",
  fromPerson="Both"
))}}

{{!-- Use for analysis or English-only processing --}}
{{#system~}}
Analyze this conversation (translated to English):
{{english_memory}}

Determine customer satisfaction level: high/medium/low
{{~/system}}

{{#assistant~}}
{{gen(name="satisfaction_analysis", temperature=0.2)}}
{{~/assistant}}
```

### Language Detection
```newo
{{!-- Detect conversation language patterns --}}
{{Set(name="original_memory", value=GetMemory(
  count="5",
  maxLen="2000",
  asEnglishText="false"
))}}

{{Set(name="english_memory", value=GetMemory(
  count="5",
  maxLen="2000",
  asEnglishText="true"
))}}

{{#if IsSimilar(text1=original_memory, text2=english_memory)}}
  {{SetPersonaAttribute(
    id=GetUser(field="id"),
    field="primary_language",
    value="English"
  )}}
{{else}}
  {{SetPersonaAttribute(
    id=GetUser(field="id"),
    field="requires_translation",
    value="true"
  )}}
{{/if}}
```

## Memory Analysis Patterns

### Conversation Quality Assessment
```newo
{{!-- Assess conversation effectiveness --}}
{{Set(name="full_conversation", value=GetMemory(
  count="50",
  maxLen="15000",
  fromPerson="Both"
))}}

{{#system~}}
Rate this conversation on:
1. Goal achievement (1-10)
2. Customer satisfaction (1-10)
3. Information completeness (1-10)

Conversation: {{full_conversation}}

Format: GOAL_SCORE|SATISFACTION_SCORE|COMPLETENESS_SCORE
{{~/system}}

{{#assistant~}}
{{gen(
  name="quality_scores",
  temperature=0.1,
  maxTokens=30,
  stop=["\n", " "]
)}}
{{~/assistant}}

{{SendSystemEvent(
  eventIdn="conversation_quality_assessment",
  scores=quality_scores
)}}
```

### Pattern Recognition
```newo
{{!-- Identify recurring customer requests --}}
{{Set(name="customer_history", value=GetMemory(
  filterByUserPersonaIds=GetUser(field="id"),
  count="100",
  maxLen="20000",
  summarize="true"
))}}

{{#system~}}
Identify patterns in this customer's requests:
{{customer_history}}

List the top 3 most common request types.
{{~/system}}

{{#assistant~}}
{{gen(name="request_patterns", temperature=0.3, maxTokens=150)}}
{{~/assistant}}

{{SetPersonaAttribute(
  id=GetUser(field="id"),
  field="common_requests",
  value=request_patterns
)}}
```

## Error Handling

### Graceful Degradation
```newo
{{!-- Handle memory retrieval failures --}}
{{Set(name="memory_result", value=GetMemory(count="20", maxLen="8000"))}}

{{#if IsEmpty(text=memory_result)}}
  {{!-- Fallback to basic context --}}
  {{Set(name="basic_context", value=Concat(
    "User: ", GetUser(field="name"),
    ", Current time: ", GetDateTime()
  ))}}
  {{SendSystemEvent(eventIdn="memory_fallback", context=basic_context)}}
{{else}}
  {{!-- Use full memory context --}}
  {{SendSystemEvent(eventIdn="memory_loaded", turns=count)}}
{{/if}}
```

### Memory Validation
```newo
{{!-- Validate memory content before use --}}
{{Set(name="memory", value=GetMemory(count="10"))}}
{{Set(name="memory_length", value=Len(text=memory))}}

{{#if IsEmpty(text=memory)}}
  {{SendMessage(message="Starting fresh conversation!")}}
{{else if IsSimilar(text1=memory_length, text2="0")}}
  {{SendMessage(message="Let's begin our discussion.")}}
{{else}}
  {{SendMessage(message="Continuing our conversation...")}}
{{/if}}
```

## Related Actions

- **action** - Process memory for AI analysis
- **action** - Use memory for contextual responses
- **action** - Store processed memory summaries
- **action** - Filter memory by communication channels
- **action** - Date range filtering