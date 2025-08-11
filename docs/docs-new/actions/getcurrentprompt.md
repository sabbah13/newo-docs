---
sidebar_position: 11
title: "GetCurrentPrompt"
description: "Retrieve the current skill's prompt for analysis and debugging"
---

# GetCurrentPrompt

Retrieve the complete prompt text of the currently executing skill. Essential for debugging, prompt analysis, logging, and dynamic prompt modification workflows.

## Syntax

```newo
GetCurrentPrompt()
```

## Parameters

No parameters required.

## How It Works

1. **Prompt Capture**: Retrieves the fully rendered prompt text from current skill execution
2. **Template Resolution**: Returns prompt after all variable substitutions and template processing
3. **Context Inclusion**: Includes all system, user, and assistant prompt sections
4. **Real-Time Access**: Provides access to the exact prompt sent to the LLM

## Use Cases

### 🔍 Debugging and Development
- **Prompt Validation**: Verify prompt construction is correct
- **Variable Substitution**: Check if variables are being populated properly  
- **Template Testing**: Ensure Handlebars/Jinja templates render correctly
- **Troubleshooting**: Debug unexpected AI responses by examining the prompt

### 📊 Logging and Analytics
- **Prompt Tracking**: Log prompts for performance analysis
- **A/B Testing**: Compare different prompt versions
- **Quality Assurance**: Monitor prompt consistency across conversations
- **Compliance**: Record prompts for audit trails

### 🔄 Dynamic Prompt Management
- **Prompt Modification**: Analyze and modify prompts in real-time
- **Context Optimization**: Adjust prompts based on current context
- **Feedback Loops**: Improve prompts based on conversation outcomes

## Basic Usage Examples

### Simple Prompt Retrieval
```newo
{{!-- Capture the current prompt for logging --}}
{{Set(name="current_prompt_text", value=GetCurrentPrompt())}}

{{!-- Log the prompt for debugging --}}
{{SendSystemEvent(
  eventIdn="prompt_logged",
  skill_name="current_skill",
  prompt_content=current_prompt_text,
  timestamp=GetDateTime(),
  user_id=GetUser(field="id")
)}}

{{!-- Continue with normal skill execution --}}
{{#system~}}
You are a restaurant reservation assistant helping customers book tables.
Current customer inquiry: "{{GetMemory(count="1", fromPerson="User")}}"
{{~/system}}

{{#assistant~}}
{{gen(name="response", temperature=0.7)}}
{{~/assistant}}

{{SendMessage(message=response)}}
```

**Why this works**: The prompt is captured before the main AI generation, allowing you to log the exact prompt that will be sent to the LLM. This is valuable for debugging why certain responses are generated and for maintaining audit trails.

### Prompt Validation and Error Detection
```newo
{{!-- Capture and validate prompt content --}}
{{Set(name="prompt_text", value=GetCurrentPrompt())}}

{{!-- Check for common issues --}}
{{Set(name="validation_issues", value=CreateArray())}}

{{#if IsEmpty(text=prompt_text)}}
  {{Set(name="validation_issues", value=AppendItemsArrayJSON(
    array=validation_issues,
    items=["Empty prompt detected"]
  ))}}
{{/if}}

{{#if Contains(text=prompt_text, search="undefined")}}
  {{Set(name="validation_issues", value=AppendItemsArrayJSON(
    array=validation_issues,
    items=["Undefined variable in prompt"]
  ))}}
{{/if}}

{{#if Contains(text=prompt_text, search="{{")}}
  {{Set(name="validation_issues", value=AppendItemsArrayJSON(
    array=validation_issues,
    items=["Unresolved template syntax"]
  ))}}
{{/if}}

{{!-- Handle validation failures --}}
{{#if not IsEmpty(text=Stringify(validation_issues))}}
  {{SendSystemEvent(
    eventIdn="prompt_validation_failed",
    issues=Stringify(validation_issues),
    prompt_content=prompt_text,
    skill_context=GetAgent(field="current_skill")
  )}}
  
  {{SendMessage(message="I need a moment to process your request properly.")}}
  {{Return(val="validation_failed")}}
{{/if}}

{{!-- Proceed with validated prompt --}}
{{#system~}}
Valid prompt execution for customer service interaction
{{~/system}}
```

**Why this works**: Prompt validation prevents common issues like undefined variables or template rendering problems from causing poor AI responses. By catching these issues early, you can provide better fallback responses and log problems for resolution.

## Advanced Prompt Analysis

### Dynamic Prompt Optimization
```newo
{{!-- Analyze prompt complexity and optimize if needed --}}
{{Set(name="current_prompt", value=GetCurrentPrompt())}}
{{Set(name="prompt_length", value=Len(text=current_prompt))}}
{{Set(name="context_complexity", value=GetState(name="conversation_complexity_score"))}}

{{#if GreaterThan(a=prompt_length, b="8000")}}
  {{!-- Prompt is very long, consider summarization --}}
  {{Set(name="conversation_context", value=GetMemory(
    count="10",
    maxLen="2000",
    summarize="true"  // Summarize to reduce prompt size
  ))}}
  
  {{SendSystemEvent(
    eventIdn="prompt_optimization_applied",
    original_length=prompt_length,
    optimization_type="context_summarization",
    complexity_score=context_complexity
  )}}
  
  {{!-- Re-build with optimized context --}}
  {{#system~}}
  You are a restaurant reservation assistant.
  
  Conversation Summary: {{conversation_context}}
  Current Request: "{{GetMemory(count="1", fromPerson="User")}}"
  
  Provide a helpful response focused on the current request.
  {{~/system}}
  
{{else}}
  {{!-- Use full context for shorter prompts --}}
  {{#system~}}
  You are a restaurant reservation assistant.
  
  Full Conversation History: {{GetMemory(count="15", maxLen="6000")}}
  Current Request: "{{GetMemory(count="1", fromPerson="User")}}"
  
  Provide a contextually aware response.
  {{~/system}}
{{/if}}

{{#assistant~}}
{{gen(name="optimized_response", temperature=0.6)}}
{{~/assistant}}

{{!-- Log optimization results --}}
{{Set(name="final_prompt", value=GetCurrentPrompt())}}
{{SendSystemEvent(
  eventIdn="prompt_optimization_complete",
  original_length=prompt_length,
  final_length=Len(text=final_prompt),
  optimization_applied=IsSimilar(text1=prompt_length, text2=Len(text=final_prompt))
)}}
```

**Why this works**: Long prompts can be expensive and may not always improve response quality. By analyzing prompt length and complexity, you can apply targeted optimizations like context summarization. This maintains response quality while optimizing for cost and performance.

### Prompt Template Performance Analysis
```newo
{{!-- Analyze different prompt templates for A/B testing --}}
{{Set(name="template_version", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="assigned_prompt_template"
))}}

{{Set(name="session_start", value=GetDateTime(format="timestamp"))}}

{{#if IsSimilar(text1=template_version, text2="concise")}}
  {{#system~}}
  Brief assistant response to: "{{GetMemory(count="1", fromPerson="User")}}"
  {{~/system}}
{{else if IsSimilar(text1=template_version, text2="detailed")}}
  {{#system~}}
  You are a knowledgeable restaurant reservation assistant with detailed expertise.
  
  Customer Background: {{GetPersona(id=GetUser(field="id"))}}
  Conversation Context: {{GetMemory(count="5", maxLen="3000")}}
  Current Question: "{{GetMemory(count="1", fromPerson="User")}}"
  
  Provide a comprehensive, detailed response that addresses all aspects.
  {{~/system}}
{{else}}
  {{!-- Default template --}}
  {{#system~}}
  Restaurant reservation assistant response to: "{{GetMemory(count="1", fromPerson="User")}}"
  {{~/system}}
{{/if}}

{{!-- Capture the actual prompt used --}}
{{Set(name="executed_prompt", value=GetCurrentPrompt())}}

{{#assistant~}}
{{gen(name="template_response", temperature=0.7)}}
{{~/assistant}}

{{Set(name="session_end", value=GetDateTime(format="timestamp"))}}
{{Set(name="response_time", value=Subtract(a=session_end, b=session_start))}}

{{!-- Log template performance --}}
{{SendSystemEvent(
  eventIdn="template_performance_data",
  template_version=template_version,
  prompt_length=Len(text=executed_prompt),
  response_length=Len(text=template_response),
  generation_time_ms=response_time,
  user_segment=GetPersonaAttribute(id=GetUser(field="id"), field="customer_segment")
)}}

{{SendMessage(message=template_response)}}
```

**Why this works**: A/B testing different prompt templates helps optimize for different user segments and use cases. By capturing the actual prompt used and measuring performance metrics, you can make data-driven decisions about which prompt templates work best for different scenarios.

## Debugging and Troubleshooting

### Variable Substitution Debugging
```newo
{{!-- Debug variable substitution issues --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{Set(name="conversation_context", value=GetMemory(count="3"))}}
{{Set(name="booking_state", value=GetState(name="current_booking"))}}

{{#system~}}
Customer Service Assistant for {{user_name}}

Recent Conversation:
{{conversation_context}}

Current Booking State:
{{booking_state}}

Please help with: "{{GetMemory(count="1", fromPerson="User")}}"
{{~/system}}

{{!-- Capture the prompt after variable substitution --}}
{{Set(name="substituted_prompt", value=GetCurrentPrompt())}}

{{!-- Check for substitution issues --}}
{{Set(name="substitution_problems", value=CreateArray())}}

{{#if Contains(text=substituted_prompt, search="null")}}
  {{Set(name="substitution_problems", value=AppendItemsArrayJSON(
    array=substitution_problems,
    items=["Null value in prompt"]
  ))}}
{{/if}}

{{#if Contains(text=substituted_prompt, search="undefined")}}
  {{Set(name="substitution_problems", value=AppendItemsArrayJSON(
    array=substitution_problems,
    items=["Undefined variable in prompt"]
  ))}}
{{/if}}

{{#if IsEmpty(text=user_name)}}
  {{Set(name="substitution_problems", value=AppendItemsArrayJSON(
    array=substitution_problems,
    items=["Missing user name"]
  ))}}
{{/if}}

{{!-- Log debugging information --}}
{{SendCommand(
  commandIdn="log_debug_info",
  integrationIdn="logging",
  connectorIdn="debug_logger",
  debug_type="prompt_substitution",
  prompt_content=substituted_prompt,
  variable_states=CreateObject(
    user_name=user_name,
    conversation_context=conversation_context,
    booking_state=booking_state
  ),
  identified_problems=Stringify(substitution_problems),
  timestamp=GetDateTime()
)}}

{{!-- Proceed with error handling if needed --}}
{{#if not IsEmpty(text=Stringify(substitution_problems))}}
  {{SendMessage(message="Let me gather some information to help you better.")}}
  {{SendSystemEvent(eventIdn="prompt_substitution_error", problems=Stringify(substitution_problems))}}
{{else}}
  {{#assistant~}}
  {{gen(name="response", temperature=0.7)}}
  {{~/assistant}}
  {{SendMessage(message=response)}}
{{/if}}
```

**Why this works**: Variable substitution issues are common sources of poor AI responses. By examining the actual prompt after substitution and checking for common problems, you can identify and handle these issues gracefully rather than generating confusing responses.

### Prompt Content Analysis
```newo
{{!-- Analyze prompt content for quality metrics --}}
{{Set(name="prompt_content", value=GetCurrentPrompt())}}

{{!-- Calculate prompt metrics --}}
{{Set(name="word_count", value=Len(text=Split(text=prompt_content, delimiter=" ")))}}
{{Set(name="character_count", value=Len(text=prompt_content))}}
{{Set(name="estimated_tokens", value=Divide(a=character_count, b="4"))}}  // Rough token estimation

{{!-- Analyze prompt structure --}}
{{Set(name="has_system_section", value=Contains(text=prompt_content, search="system"))}}
{{Set(name="has_user_context", value=Contains(text=prompt_content, search="User:"))}}
{{Set(name="has_examples", value=Contains(text=prompt_content, search="Example:"))}}

{{!-- Check for best practices --}}
{{Set(name="quality_score", value="0")}}

{{#if has_system_section}}
  {{Set(name="quality_score", value=Add(a=quality_score, b="25"))}}
{{/if}}

{{#if has_user_context}}
  {{Set(name="quality_score", value=Add(a=quality_score, b="25"))}}
{{/if}}

{{#if LessThan(a=estimated_tokens, b="4000")}}
  {{Set(name="quality_score", value=Add(a=quality_score, b="25"))}}
{{/if}}

{{#if GreaterThan(a=word_count, b="50")}}
  {{Set(name="quality_score", value=Add(a=quality_score, b="25"))}}
{{/if}}

{{!-- Log prompt analysis --}}
{{SendCommand(
  commandIdn="log_analytics",
  integrationIdn="analytics",
  connectorIdn="prompt_analytics",
  event_type="prompt_analysis",
  metrics=CreateObject(
    word_count=word_count,
    character_count=character_count,
    estimated_tokens=estimated_tokens,
    quality_score=quality_score,
    has_system_section=has_system_section,
    has_user_context=has_user_context,
    has_examples=has_examples
  ),
  skill_name=GetAgent(field="current_skill"),
  timestamp=GetDateTime()
)}}

{{!-- Provide quality feedback --}}
{{#if LessThan(a=quality_score, b="50")}}
  {{SendSystemEvent(
    eventIdn="low_prompt_quality_detected",
    quality_score=quality_score,
    improvement_suggestions=CreateArray(
      "Add system context",
      "Include user context",
      "Check prompt length",
      "Add specific examples"
    )
  )}}
{{/if}}
```

**Why this works**: Prompt quality significantly impacts AI response quality. By analyzing structural elements and calculating quality metrics, you can identify prompts that may need improvement and track prompt performance over time.

## Performance Monitoring

### Prompt Performance Tracking
```newo
{{!-- Track prompt performance across conversations --}}
{{Set(name="conversation_id", value=GetActor(field="id"))}}
{{Set(name="skill_name", value=GetAgent(field="current_skill"))}}
{{Set(name="prompt_start_time", value=GetDateTime(format="timestamp"))}}

{{!-- Capture prompt before execution --}}
{{Set(name="execution_prompt", value=GetCurrentPrompt())}}
{{Set(name="prompt_complexity", value=CreateObject(
  length=Len(text=execution_prompt),
  estimated_tokens=Divide(a=Len(text=execution_prompt), b="4"),
  context_variables=Count(text=execution_prompt, search="{{"),
  system_sections=Count(text=execution_prompt, search="system~")
))}}

{{#assistant~}}
{{gen(name="tracked_response", temperature=0.7)}}
{{~/assistant}}

{{Set(name="prompt_end_time", value=GetDateTime(format="timestamp"))}}
{{Set(name="execution_duration", value=Subtract(a=prompt_end_time, b=prompt_start_time))}}

{{!-- Log performance data --}}
{{SendCommand(
  commandIdn="track_performance",
  integrationIdn="analytics",
  connectorIdn="performance_tracker",
  performance_data=CreateObject(
    conversation_id=conversation_id,
    skill_name=skill_name,
    prompt_complexity=prompt_complexity,
    execution_duration_ms=execution_duration,
    response_length=Len(text=tracked_response),
    timestamp=GetDateTime(),
    user_segment=GetPersonaAttribute(id=GetUser(field="id"), field="segment")
  )
)}}

{{SendMessage(message=tracked_response)}}

{{!-- Alert on performance issues --}}
{{#if GreaterThan(a=execution_duration, b="5000")}}
  {{SendSystemEvent(
    eventIdn="slow_prompt_execution",
    duration_ms=execution_duration,
    prompt_length=Len(text=execution_prompt),
    optimization_recommended="true"
  )}}
{{/if}}
```

**Why this works**: Performance monitoring helps identify prompts that are slow or resource-intensive. By tracking execution duration, prompt complexity, and response quality, you can optimize prompts for better performance and user experience.

## Integration with External Systems

### Prompt Audit Trail
```newo
{{!-- Create comprehensive audit trail for prompts --}}
{{Set(name="audit_prompt", value=GetCurrentPrompt())}}
{{Set(name="audit_context", value=CreateObject(
  user_id=GetUser(field="id"),
  conversation_id=GetActor(field="id"),
  skill_name=GetAgent(field="current_skill"),
  timestamp=GetDateTime(),
  conversation_stage=GetState(name="conversation_stage"),
  user_intent=GetState(name="detected_intent")
))}}

{{!-- Send to audit system --}}
{{SendCommand(
  commandIdn="create_audit_record",
  integrationIdn="compliance_system",
  connectorIdn="audit_logger",
  record_type="prompt_execution",
  prompt_content=audit_prompt,
  execution_context=Stringify(audit_context),
  compliance_level="standard",
  retention_period="2_years"
)}}

{{!-- Continue with normal execution --}}
{{#system~}}
Customer service interaction with full audit compliance
{{~/system}}

{{#assistant~}}
{{gen(name="audited_response")}}
{{~/assistant}}

{{!-- Log response for audit completion --}}
{{SendCommand(
  commandIdn="update_audit_record",
  integrationIdn="compliance_system", 
  connectorIdn="audit_logger",
  audit_id=GetValueJSON(obj=audit_context, key="audit_id"),
  response_content=audited_response,
  execution_status="completed"
)}}
```

**Why this works**: Regulatory compliance often requires detailed audit trails of AI interactions. By capturing prompts and responses with full context, you can meet compliance requirements while maintaining system transparency.

### Prompt Version Control
```newo
{{!-- Track prompt versions for deployment management --}}
{{Set(name="current_prompt_hash", value=Hash(text=GetCurrentPrompt()))}}
{{Set(name="stored_prompt_version", value=GetAKB(key="current_prompt_version"))}}

{{#if not IsSimilar(text1=current_prompt_hash, text2=stored_prompt_version)}}
  {{!-- New prompt version detected --}}
  {{Set(name="version_info", value=CreateObject(
    previous_version=stored_prompt_version,
    new_version=current_prompt_hash,
    deployment_time=GetDateTime(),
    skill_name=GetAgent(field="current_skill"),
    prompt_content=GetCurrentPrompt()
  ))}}
  
  {{SendCommand(
    commandIdn="register_prompt_version",
    integrationIdn="version_control",
    connectorIdn="prompt_registry",
    version_data=Stringify(version_info)
  )}}
  
  {{SetAKB(key="current_prompt_version", value=current_prompt_hash)}}
  
  {{SendSystemEvent(
    eventIdn="prompt_version_updated",
    version_hash=current_prompt_hash,
    skill_name=GetAgent(field="current_skill")
  )}}
{{/if}}
```

**Why this works**: Tracking prompt versions helps manage deployments and rollbacks. When prompt changes are detected, they're automatically registered in a version control system, enabling better change management and troubleshooting.

## Best Practices

### Secure Prompt Handling
```newo
{{!-- Handle sensitive information in prompts securely --}}
{{Set(name="raw_prompt", value=GetCurrentPrompt())}}

{{!-- Sanitize sensitive data before logging --}}
{{Set(name="sanitized_prompt", value=Replace(
  text=raw_prompt,
  find="[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}",  // Credit card pattern
  replace="****-****-****-****"
))}}

{{Set(name="sanitized_prompt", value=Replace(
  text=sanitized_prompt,
  find="[0-9]{3}-[0-9]{2}-[0-9]{4}",  // SSN pattern  
  replace="***-**-****"
))}}

{{!-- Log sanitized version only --}}
{{SendCommand(
  commandIdn="log_secure",
  integrationIdn="secure_logging",
  connectorIdn="encrypted_logger",
  sanitized_content=sanitized_prompt,
  security_level="high",
  pii_removed="true"
)}}
```

### Prompt Optimization Guidelines
```newo
{{!-- Optimize prompts based on conversation context --}}
{{Set(name="base_prompt", value=GetCurrentPrompt())}}
{{Set(name="conversation_length", value=GetState(name="turn_count"))}}
{{Set(name="user_expertise", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="domain_expertise"
))}}

{{#if GreaterThan(a=conversation_length, b="10")}}
  {{!-- Long conversation: use summarized context --}}
  {{Set(name="optimized_context", value=GetMemory(
    count="5",
    summarize="true",
    maxLen="1000"
  ))}}
{{else}}
  {{!-- Short conversation: use full context --}}
  {{Set(name="optimized_context", value=GetMemory(
    count="10",
    maxLen="3000"
  ))}}
{{/if}}

{{!-- Adjust language complexity based on user expertise --}}
{{#if IsSimilar(text1=user_expertise, text2="expert")}}
  {{Set(name="language_style", value="technical and detailed")}}
{{else}}
  {{Set(name="language_style", value="clear and simple")}}
{{/if}}
```

## Limitations

- **Static Capture**: Returns prompt at time of call, not dynamically updated
- **Memory Usage**: Large prompts consume additional memory when stored
- **Security**: May contain sensitive information that requires careful handling
- **Template State**: Captures post-template-rendering state only
- **Performance Impact**: Additional memory and processing overhead

## Troubleshooting

### Empty Prompt Detection
```newo
{{Set(name="prompt_check", value=GetCurrentPrompt())}}
{{#if IsEmpty(text=prompt_check)}}
  {{SendSystemEvent(
    eventIdn="empty_prompt_detected",
    skill_name=GetAgent(field="current_skill"),
    execution_context=GetTriggeredAct()
  )}}
{{/if}}
```

### Template Rendering Issues
```newo
{{Set(name="prompt_text", value=GetCurrentPrompt())}}
{{#if Contains(text=prompt_text, search="{{")}}
  {{SendSystemEvent(
    eventIdn="template_rendering_failed",
    unresolved_templates=prompt_text
  )}}
{{/if}}
```

## Related Actions

- **action** - Use prompts for AI generation
- **action** - Stream responses using current prompt
- **action** - Get triggering event context
- **action** - Log prompt analysis events
- **action** - Store prompt analysis results