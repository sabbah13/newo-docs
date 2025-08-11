---
sidebar_position: 12
title: "GetTriggeredAct"
description: "Retrieve information about the action that initiated the current skill execution"
---

# GetTriggeredAct

Retrieve detailed information about the action that initiated the execution of the current skill instance. Essential for understanding the context of skill activation, analyzing trigger patterns, and implementing context-aware responses.

## Syntax

```newo
GetTriggeredAct(fields: List[str])
```

## Parameters

- **`fields`** (List[str]): Specific fields to retrieve from the triggering action
  - `"timeInterval"`: Time interval between triggered act and previous act (seconds)
  - `"text"`: Message text content (if applicable)
  - `"datetime"`: Timestamp when the action occurred
  - `"englishText"`: Message text translated to English (if applicable)
  - `"originalText"`: Original untranslated, unfiltered message text
  - `"languageCode"`: Language code of the original message
  - `"personaName"`: Name of the persona who performed the action
  - Custom argument names: Any argument set when sending messages or events

## How It Works

1. **Trigger Capture**: Records the action that initiated skill execution
2. **Field Extraction**: Retrieves specified fields from the triggering action
3. **Context Preservation**: Maintains full context information from the original event
4. **Multi-Field Support**: Returns multiple fields simultaneously for comprehensive analysis

## Use Cases

### 🔍 Context Analysis
- **Event Understanding**: Determine what triggered the skill execution
- **Response Adaptation**: Tailor responses based on trigger type and content
- **Conversation Flow**: Maintain context across multi-turn interactions
- **Debugging**: Understand skill activation patterns

### 📊 Analytics and Monitoring
- **Trigger Patterns**: Analyze what events commonly trigger skills
- **Response Timing**: Measure time intervals between interactions
- **Language Detection**: Track multilingual conversations
- **User Behavior**: Understand interaction patterns and preferences

### 🔄 Workflow Orchestration
- **Conditional Logic**: Branch execution based on trigger characteristics
- **Event Chaining**: Create complex workflows based on trigger sequences
- **State Management**: Track conversation state transitions
- **Integration Routing**: Route to different systems based on trigger type

## Basic Usage Examples

### Simple Trigger Information Retrieval
```newo
{{!-- Get basic information about what triggered this skill --}}
{{Set(name="trigger_info", value=GetTriggeredAct(fields=[
  "text",
  "datetime", 
  "personaName",
  "timeInterval"
]))}}

{{!-- Log the trigger information --}}
{{SendSystemEvent(
  eventIdn="skill_triggered",
  trigger_text=GetValueJSON(obj=trigger_info, key="text"),
  trigger_time=GetValueJSON(obj=trigger_info, key="datetime"),
  user_name=GetValueJSON(obj=trigger_info, key="personaName"),
  time_since_last=GetValueJSON(obj=trigger_info, key="timeInterval")
)}}

{{!-- Use trigger context in response --}}
{{#system~}}
The user just said: "{{GetValueJSON(obj=trigger_info, key="text")}}"
User name: {{GetValueJSON(obj=trigger_info, key="personaName")}}
Time since last interaction: {{GetValueJSON(obj=trigger_info, key="timeInterval")}} seconds

Provide a contextually appropriate response.
{{~/system}}

{{#assistant~}}
{{gen(name="contextual_response", temperature=0.7)}}
{{~/assistant}}

{{SendMessage(message=contextual_response)}}
```

**Why this works**: By capturing trigger information, you can provide responses that acknowledge the user's specific input, timing, and context. This creates more natural conversations that feel aware of the interaction history.

### Language-Aware Response Handling
```newo
{{!-- Get language information from the triggering message --}}
{{Set(name="language_info", value=GetTriggeredAct(fields=[
  "text",
  "englishText", 
  "originalText",
  "languageCode"
]))}}

{{Set(name="detected_language", value=GetValueJSON(obj=language_info, key="languageCode"))}}
{{Set(name="original_message", value=GetValueJSON(obj=language_info, key="originalText"))}}
{{Set(name="english_message", value=GetValueJSON(obj=language_info, key="englishText"))}}

{{#if not IsSimilar(text1=detected_language, text2="en")}}
  {{!-- Non-English message detected --}}
  {{SendSystemEvent(
    eventIdn="multilingual_interaction",
    original_language=detected_language,
    original_text=original_message,
    english_translation=english_message
  )}}
  
  {{!-- Respond in the user's language --}}
  {{#system~}}
  The user wrote in {{detected_language}}: "{{original_message}}"
  English translation: "{{english_message}}"
  
  Respond in {{detected_language}} to show cultural sensitivity, but keep it simple and clear.
  {{~/system}}
  
  {{#assistant~}}
  {{gen(name="multilingual_response", temperature=0.6)}}
  {{~/assistant}}
  
{{else}}
  {{!-- English message --}}
  {{#system~}}
  User message: "{{english_message}}"
  Provide a helpful English response.
  {{~/system}}
  
  {{#assistant~}}
  {{gen(name="english_response", temperature=0.7)}}
  {{~/assistant}}
  
{{/if}}

{{SendMessage(message=IsSimilar(text1=detected_language, text2="en") ? english_response : multilingual_response)}}
```

**Why this works**: Multilingual support improves user experience by detecting the original language and responding appropriately. The system can handle translations while maintaining cultural sensitivity and context.

## Advanced Context Analysis

### Interaction Timing Analysis
```newo
{{!-- Analyze interaction timing patterns --}}
{{Set(name="timing_data", value=GetTriggeredAct(fields=[
  "timeInterval",
  "datetime",
  "text",
  "personaName"
]))}}

{{Set(name="time_since_last", value=GetValueJSON(obj=timing_data, key="timeInterval"))}}
{{Set(name="current_time", value=GetValueJSON(obj=timing_data, key="datetime"))}}
{{Set(name="user_name", value=GetValueJSON(obj=timing_data, key="personaName"))}}

{{!-- Categorize interaction timing --}}
{{#if LessThan(a=time_since_last, b="30")}}
  {{Set(name="interaction_type", value="rapid_response")}}
  {{Set(name="urgency_level", value="high")}}
{{else if LessThan(a=time_since_last, b="300")}}
  {{Set(name="interaction_type", value="normal_conversation")}}
  {{Set(name="urgency_level", value="medium")}}
{{else if LessThan(a=time_since_last, b="3600")}}
  {{Set(name="interaction_type", value="delayed_response")}}
  {{Set(name="urgency_level", value="low")}}
{{else}}
  {{Set(name="interaction_type", value="new_session")}}
  {{Set(name="urgency_level", value="medium")}}
{{/if}}

{{!-- Adapt response style based on timing --}}
{{#if IsSimilar(text1=interaction_type, text2="rapid_response")}}
  {{!-- Quick, direct responses for rapid interactions --}}
  {{#system~}}
  The user is engaging quickly (responded in {{time_since_last}} seconds). 
  User: "{{GetValueJSON(obj=timing_data, key="text")}}"
  
  Provide a brief, direct response. They seem engaged and want quick answers.
  {{~/system}}
  
  {{#assistant~}}
  {{gen(name="quick_response", temperature=0.5, maxTokens=100)}}
  {{~/assistant}}
  
{{else if IsSimilar(text1=interaction_type, text2="new_session")}}
  {{!-- Welcoming response for new/returning sessions --}}
  {{#system~}}
  This appears to be a new conversation session ({{Divide(a=time_since_last, b="60")}} minutes since last interaction).
  User: "{{GetValueJSON(obj=timing_data, key="text")}}"
  
  Provide a welcoming response that acknowledges the time gap and helps them get started.
  {{~/system}}
  
  {{#assistant~}}
  {{gen(name="welcoming_response", temperature=0.6, maxTokens=200)}}
  {{~/assistant}}
  
{{else}}
  {{!-- Standard conversational response --}}
  {{#system~}}
  Continuing normal conversation flow.
  User: "{{GetValueJSON(obj=timing_data, key="text")}}"
  
  Provide a helpful, conversational response.
  {{~/system}}
  
  {{#assistant~}}
  {{gen(name="standard_response", temperature=0.7, maxTokens=150)}}
  {{~/assistant}}
  
{{/if}}

{{!-- Log timing analysis --}}
{{SendSystemEvent(
  eventIdn="interaction_timing_analysis",
  user_name=user_name,
  time_interval=time_since_last,
  interaction_type=interaction_type,
  urgency_level=urgency_level,
  timestamp=current_time
)}}

{{SendMessage(message=quick_response || welcoming_response || standard_response)}}
```

**Why this works**: Interaction timing reveals user engagement and urgency levels. Rapid responses suggest high engagement and need quick answers, while long gaps indicate new sessions that benefit from welcoming responses. This timing-aware approach creates more natural conversation flows.

### Custom Event Data Extraction
```newo
{{!-- Extract custom data from system events or integrations --}}
{{Set(name="event_data", value=GetTriggeredAct(fields=[
  "eventType",
  "severity", 
  "source_system",
  "customer_id",
  "issue_category",
  "priority_level",
  "text"
]))}}

{{!-- Check if this was triggered by a system event --}}
{{Set(name="event_type", value=GetValueJSON(obj=event_data, key="eventType"))}}
{{Set(name="severity", value=GetValueJSON(obj=event_data, key="severity"))}}

{{#if not IsEmpty(text=event_type)}}
  {{!-- System event triggered this skill --}}
  {{Set(name="source_system", value=GetValueJSON(obj=event_data, key="source_system"))}}
  {{Set(name="priority", value=GetValueJSON(obj=event_data, key="priority_level"))}}
  {{Set(name="issue_category", value=GetValueJSON(obj=event_data, key="issue_category"))}}
  
  {{!-- Route based on event characteristics --}}
  {{#if IsSimilar(text1=severity, text2="critical")}}
    {{!-- High priority system alert --}}
    {{Set(name="escalation_team", value=GetActors(
      integrationIdn="team_chat",
      connectorIdn="critical_alerts"
    ))}}
    
    {{#system~}}
    CRITICAL SYSTEM EVENT DETECTED
    
    Event Type: {{event_type}}
    Source System: {{source_system}}
    Issue Category: {{issue_category}}
    Severity: {{severity}}
    
    Generate an immediate escalation message for the technical team with:
    1. Clear problem description
    2. Immediate action steps
    3. Impact assessment
    4. Escalation procedures
    {{~/system}}
    
    {{#assistant~}}
    {{gen(name="critical_alert", temperature=0.3, maxTokens=300)}}
    {{~/assistant}}
    
    {{SendMessage(
      message=critical_alert,
      actorIds=escalation_team
    )}}
    
  {{else}}
    {{!-- Standard system event --}}
    {{#system~}}
    System Event Notification
    Type: {{event_type}}
    Priority: {{priority}}
    
    Provide a standard notification response with appropriate follow-up actions.
    {{~/system}}
    
    {{#assistant~}}
    {{gen(name="system_response", temperature=0.5)}}
    {{~/assistant}}
    
    {{SendMessage(message=system_response)}}
  {{/if}}
  
{{else}}
  {{!-- Regular user message --}}
  {{Set(name="user_message", value=GetValueJSON(obj=event_data, key="text"))}}
  
  {{#system~}}
  User Message: "{{user_message}}"
  Provide a helpful response.
  {{~/system}}
  
  {{#assistant~}}
  {{gen(name="user_response", temperature=0.7)}}
  {{~/assistant}}
  
  {{SendMessage(message=user_response)}}
{{/if}}
```

**Why this works**: Custom event data allows skills to handle both user interactions and system events intelligently. By examining the trigger source and custom fields, the skill can route appropriately between user conversations, system alerts, and automated processes.

## Event Chain Analysis

### Trigger Sequence Tracking
```newo
{{!-- Track sequences of triggering events for pattern analysis --}}
{{Set(name="current_trigger", value=GetTriggeredAct(fields=[
  "text",
  "datetime", 
  "personaName",
  "timeInterval",
  "eventType"
]))}}

{{!-- Get previous trigger history --}}
{{Set(name="trigger_history", value=GetState(name="recent_triggers"))}}
{{#if IsEmpty(text=trigger_history)}}
  {{Set(name="trigger_history", value=CreateArray())}}
{{/if}}

{{!-- Add current trigger to history --}}
{{Set(name="trigger_record", value=CreateObject(
  text=GetValueJSON(obj=current_trigger, key="text"),
  timestamp=GetValueJSON(obj=current_trigger, key="datetime"),
  person=GetValueJSON(obj=current_trigger, key="personaName"),
  interval=GetValueJSON(obj=current_trigger, key="timeInterval"),
  event_type=GetValueJSON(obj=current_trigger, key="eventType")
))}}

{{Set(name="updated_history", value=AppendItemsArrayJSON(
  array=trigger_history,
  items=[trigger_record]
))}}

{{!-- Keep only last 10 triggers --}}
{{#if GreaterThan(a=Len(text=Stringify(updated_history)), b="10")}}
  {{Set(name="updated_history", value=SliceArray(
    array=updated_history,
    start=-10
  ))}}
{{/if}}

{{SetState(name="recent_triggers", value=updated_history)}}

{{!-- Analyze trigger patterns --}}
{{Set(name="recent_intervals", value=MapArray(
  array=updated_history,
  transform="item.interval"
))}}

{{Set(name="avg_interval", value=Average(array=recent_intervals))}}
{{Set(name="pattern_detected", value="normal")}}

{{!-- Detect rapid fire pattern --}}
{{#if LessThan(a=avg_interval, b="15")}}
  {{Set(name="pattern_detected", value="rapid_fire")}}
  {{Set(name="response_style", value="brief_focused")}}
{{else if GreaterThan(a=avg_interval, b="300")}}
  {{Set(name="pattern_detected", value="intermittent")}}
  {{Set(name="response_style", value="context_rebuilding")}}
{{else}}
  {{Set(name="response_style", value="conversational")}}
{{/if}}

{{!-- Adapt response based on detected pattern --}}
{{#if IsSimilar(text1=pattern_detected, text2="rapid_fire")}}
  {{#system~}}
  User is sending messages rapidly (average {{avg_interval}} seconds apart).
  Latest message: "{{GetValueJSON(obj=current_trigger, key="text")}}"
  
  Provide brief, focused responses. User seems to be in a hurry or highly engaged.
  {{~/system}}
  
{{else if IsSimilar(text1=pattern_detected, text2="intermittent")}}
  {{#system~}}
  User has large gaps between messages (average {{Divide(a=avg_interval, b="60")}} minutes).
  Latest message: "{{GetValueJSON(obj=current_trigger, key="text")}}"
  Recent conversation context: {{GetMemory(count="3", summarize="true")}}
  
  Provide context-rebuilding responses that gently reconnect to previous conversation threads.
  {{~/system}}
  
{{else}}
  {{#system~}}
  Normal conversation pattern detected.
  User message: "{{GetValueJSON(obj=current_trigger, key="text")}}"
  
  Provide a natural conversational response.
  {{~/system}}
{{/if}}

{{#assistant~}}
{{gen(name="pattern_aware_response", temperature=0.7)}}
{{~/assistant}}

{{SendMessage(message=pattern_aware_response)}}

{{!-- Log pattern analysis --}}
{{SendSystemEvent(
  eventIdn="trigger_pattern_analysis",
  pattern_type=pattern_detected,
  average_interval=avg_interval,
  trigger_count=Len(text=Stringify(updated_history)),
  user_name=GetValueJSON(obj=current_trigger, key="personaName")
)}}
```

**Why this works**: Analyzing trigger sequences reveals conversation patterns that inform response strategies. Rapid-fire messages suggest urgency, while intermittent patterns indicate the need for context rebuilding. This historical awareness creates more intelligent conversation management.

## Integration with External Systems

### Trigger-Based Routing
```newo
{{!-- Route to different systems based on trigger characteristics --}}
{{Set(name="trigger_context", value=GetTriggeredAct(fields=[
  "text",
  "personaName",
  "source_channel",
  "user_segment",
  "priority_level",
  "issue_type"
]))}}

{{Set(name="channel", value=GetValueJSON(obj=trigger_context, key="source_channel"))}}
{{Set(name="user_segment", value=GetValueJSON(obj=trigger_context, key="user_segment"))}}
{{Set(name="issue_type", value=GetValueJSON(obj=trigger_context, key="issue_type"))}}

{{!-- Determine routing based on trigger data --}}
{{#if IsSimilar(text1=user_segment, text2="enterprise")}}
  {{!-- Enterprise customers get priority routing --}}
  {{Set(name="routing_queue", value="enterprise_support")}}
  {{Set(name="sla_target", value="300")}}  {{!-- 5 minutes --}}
  {{Set(name="escalation_enabled", value="true")}}
  
{{else if IsSimilar(text1=channel, text2="emergency_line")}}
  {{!-- Emergency calls get immediate attention --}}
  {{Set(name="routing_queue", value="emergency_response")}}
  {{Set(name="sla_target", value="60")}}  {{!-- 1 minute --}}
  {{Set(name="escalation_enabled", value="true")}}
  
{{else}}
  {{!-- Standard routing --}}
  {{Set(name="routing_queue", value="general_support")}}
  {{Set(name="sla_target", value="900")}}  {{!-- 15 minutes --}}
  {{Set(name="escalation_enabled", value="false")}}
{{/if}}

{{!-- Send routing command --}}
{{SendCommand(
  commandIdn="route_customer",
  integrationIdn="routing_system",
  connectorIdn="smart_queue",
  customer_data=Stringify(trigger_context),
  routing_queue=routing_queue,
  sla_target=sla_target,
  priority_level=user_segment,
  escalation_enabled=escalation_enabled
)}}

{{!-- Provide appropriate response based on routing --}}
{{#if IsSimilar(text1=routing_queue, text2="emergency_response")}}
  {{SendMessage(message="Emergency support activated. Connecting you immediately with our crisis response team.")}}
{{else if IsSimilar(text1=routing_queue, text2="enterprise_support")}}
  {{SendMessage(message="Thank you for contacting enterprise support. A specialist will assist you within 5 minutes.")}}
{{else}}
  {{SendMessage(message="Thanks for reaching out! We'll connect you with a support representative shortly.")}}
{{/if}}

{{!-- Set up monitoring --}}
{{SendCommand(
  commandIdn="set_timer",
  integrationIdn="monitoring_system", 
  connectorIdn="sla_monitor",
  timer_name="routing_sla_check",
  interval=sla_target,
  callback_data=CreateObject(
    customer_id=GetValueJSON(obj=trigger_context, key="personaName"),
    routing_queue=routing_queue,
    trigger_time=GetDateTime()
  )
)}}
```

**Why this works**: Trigger-based routing enables intelligent customer service workflows. By examining the source, user segment, and issue type from the triggering event, the system can make smart routing decisions that improve response times and customer satisfaction.

## Performance and Debugging

### Trigger Performance Analysis
```newo
{{!-- Monitor and analyze trigger performance --}}
{{Set(name="trigger_metrics", value=GetTriggeredAct(fields=[
  "datetime",
  "timeInterval", 
  "personaName",
  "text",
  "processing_time",
  "queue_depth"
]))}}

{{Set(name="processing_start", value=GetDateTime(format="timestamp"))}}
{{Set(name="trigger_time", value=GetValueJSON(obj=trigger_metrics, key="datetime"))}}
{{Set(name="queue_time", value=Subtract(a=processing_start, b=trigger_time))}}

{{!-- Calculate performance metrics --}}
{{Set(name="response_budget", value="2000")}}  {{!-- 2 second target --}}
{{Set(name="performance_status", value="normal")}}

{{#if GreaterThan(a=queue_time, b=response_budget)}}
  {{Set(name="performance_status", value="slow")}}
  
  {{SendSystemEvent(
    eventIdn="slow_trigger_processing",
    queue_time_ms=queue_time,
    target_time_ms=response_budget,
    user_id=GetValueJSON(obj=trigger_metrics, key="personaName"),
    trigger_text=GetValueJSON(obj=trigger_metrics, key="text")
  )}}
{{/if}}

{{!-- Process the actual request --}}
{{#system~}}
User request: "{{GetValueJSON(obj=trigger_metrics, key="text")}}"
Performance status: {{performance_status}}

{{#if IsSimilar(text1=performance_status, text2="slow")}}
Acknowledge any delays and provide a helpful, efficient response.
{{else}}
Provide a normal helpful response.
{{/if}}
{{~/system}}

{{#assistant~}}
{{gen(name="performance_aware_response", temperature=0.6)}}
{{~/assistant}}

{{Set(name="processing_end", value=GetDateTime(format="timestamp"))}}
{{Set(name="total_processing_time", value=Subtract(a=processing_end, b=processing_start))}}

{{!-- Log performance data --}}
{{SendCommand(
  commandIdn="log_performance",
  integrationIdn="analytics",
  connectorIdn="performance_tracker",
  performance_data=CreateObject(
    queue_time_ms=queue_time,
    processing_time_ms=total_processing_time,
    total_time_ms=Add(a=queue_time, b=total_processing_time),
    performance_status=performance_status,
    user_id=GetValueJSON(obj=trigger_metrics, key="personaName"),
    timestamp=GetDateTime()
  )
)}}

{{SendMessage(message=performance_aware_response)}}
```

**Why this works**: Performance monitoring of triggers helps identify bottlenecks and system issues. By measuring queue time and processing time, you can detect performance problems and provide appropriate user communication about delays.

## Best Practices

### Comprehensive Context Capture
```newo
{{!-- Always capture comprehensive trigger context --}}
{{Set(name="full_trigger_context", value=GetTriggeredAct(fields=[
  "text",
  "datetime",
  "personaName", 
  "timeInterval",
  "languageCode",
  "englishText",
  "originalText",
  "eventType",
  "source_system",
  "channel_id",
  "user_segment"
]))}}

{{!-- Store context for later reference --}}
{{SetState(
  name="last_trigger_context",
  value=Stringify(full_trigger_context)
)}}

{{!-- Use context appropriately throughout skill execution --}}
{{#system~}}
Complete trigger context available:
{{Stringify(full_trigger_context)}}

Use this context to provide the most appropriate response.
{{~/system}}
```

### Error Handling for Missing Fields
```newo
{{!-- Handle cases where expected trigger fields might be missing --}}
{{Set(name="trigger_data", value=GetTriggeredAct(fields=[
  "text",
  "personaName",
  "custom_field_1",
  "custom_field_2"
]))}}

{{!-- Check for missing critical fields --}}
{{Set(name="missing_fields", value=CreateArray())}}

{{#if IsEmpty(text=GetValueJSON(obj=trigger_data, key="text"))}}
  {{Set(name="missing_fields", value=AppendItemsArrayJSON(
    array=missing_fields,
    items=["text"]
  ))}}
{{/if}}

{{#if IsEmpty(text=GetValueJSON(obj=trigger_data, key="personaName"))}}
  {{Set(name="missing_fields", value=AppendItemsArrayJSON(
    array=missing_fields,
    items=["personaName"]
  ))}}
{{/if}}

{{!-- Handle missing fields gracefully --}}
{{#if not IsEmpty(text=Stringify(missing_fields))}}
  {{SendSystemEvent(
    eventIdn="trigger_data_incomplete",
    missing_fields=Stringify(missing_fields),
    available_data=Stringify(trigger_data)
  )}}
  
  {{!-- Provide fallback response --}}
  {{SendMessage(message="I'm here to help! How can I assist you today?")}}
{{else}}
  {{!-- Process normally with complete data --}}
  {{#system~}}
  User: {{GetValueJSON(obj=trigger_data, key="personaName")}}
  Message: "{{GetValueJSON(obj=trigger_data, key="text")}}"
  
  Provide a personalized response.
  {{~/system}}
  
  {{#assistant~}}
  {{gen(name="personalized_response")}}
  {{~/assistant}}
  
  {{SendMessage(message=personalized_response)}}
{{/if}}
```

## Limitations

- **Field Availability**: Not all fields are available for every trigger type
- **Custom Fields**: Custom argument fields depend on how events are sent
- **Historical Data**: Only captures data from the immediate triggering action
- **Processing Overhead**: Retrieving many fields can impact performance
- **Event Persistence**: Trigger data is tied to the current execution context only

## Troubleshooting

### Missing Trigger Data
```newo
{{Set(name="debug_trigger", value=GetTriggeredAct(fields=[
  "text", "personaName", "datetime", "eventType"
])}}

{{#if IsEmpty(text=Stringify(debug_trigger))}}
  {{SendSystemEvent(
    eventIdn="trigger_data_missing",
    skill_name=GetAgent(field="current_skill"),
    execution_context=GetAgent()
  )}}
{{/if}}
```

### Field Validation
```newo
{{Set(name="required_fields", value=["text", "personaName"])}}
{{Set(name="trigger_check", value=GetTriggeredAct(fields=required_fields)}}

{{#each required_fields}}
  {{#if IsEmpty(text=GetValueJSON(obj=trigger_check, key=this))}}
    {{SendSystemEvent(
      eventIdn="required_field_missing",
      missing_field=this,
      trigger_data=Stringify(trigger_check)
    )}}
  {{/if}}
{{/each}}
```

## Related Actions

- **action** - Get conversation context
- **action** - Get user information
- **action** - Get current agent context
- **action** - Log trigger analysis events
- **action** - Store trigger analysis results