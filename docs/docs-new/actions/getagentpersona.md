---
sidebar_position: 13
title: "GetAgentPersona"
description: "Retrieve information about the current agent's persona"
---

# GetAgentPersona

Retrieve information about the currently executing agent's persona. Essential for multi-agent workflows, identity-based routing, persona-aware processing, and system coordination between different agent types.

## Syntax

```newo
GetAgentPersona(field?: string)
```

## Parameters

- **`field`** (string, optional): Specific field to retrieve from the agent persona
  - `"id"`: Unique identifier of the agent persona
  - `"name"`: Display name of the agent persona
  - No field specified: Returns the full persona object

## How It Works

1. **Persona Resolution**: Identifies the current agent's persona from execution context
2. **Field Extraction**: Retrieves specific field or complete persona information
3. **Context Awareness**: Provides agent identity for routing and processing decisions
4. **Multi-Agent Coordination**: Enables coordination between different agent types

## Use Cases

### 🔄 Multi-Agent Coordination
- **Agent Identification**: Determine which agent is currently executing
- **Workflow Routing**: Route messages between specific agent types
- **Task Assignment**: Assign tasks to appropriate agent personas
- **Identity-Based Logic**: Implement agent-specific business rules

### 📊 System Integration
- **Event Attribution**: Tag events with the originating agent
- **Logging and Analytics**: Track actions by agent persona
- **Security and Permissions**: Implement agent-based access control
- **Resource Management**: Manage resources per agent type

### 🎯 Persona-Aware Processing
- **Customized Responses**: Adapt responses based on agent capabilities
- **Skill Selection**: Choose skills appropriate for agent type
- **Configuration Management**: Load agent-specific configurations
- **Behavior Adaptation**: Adjust behavior based on agent role

## Basic Usage Examples

### Agent Identity for System Events
```newo
{{!-- Get current agent information for system event logging --}}
{{Set(name="agent_persona_name", value=GetAgentPersona())}}
{{Set(name="agent_persona_id", value=GetAgentPersona(field="id"))}}

{{!-- Log agent action with identity --}}
{{SendSystemEvent(
  eventIdn="agent_action_performed",
  agent_name=agent_persona_name,
  agent_id=agent_persona_id,
  action_type="customer_interaction",
  timestamp=GetDateTime(),
  user_id=GetUser(field="id")
)}}

{{!-- Use agent identity in response --}}
{{#system~}}
You are {{agent_persona_name}}, responding to a customer inquiry.
Customer message: "{{GetMemory(count="1", fromPerson="User")}}"

Respond in character as {{agent_persona_name}} with appropriate expertise and tone.
{{~/system}}

{{#assistant~}}
{{gen(name="persona_aware_response", temperature=0.7)}}
{{~/assistant}}

{{SendMessage(message=persona_aware_response)}}
```

**Why this works**: Agent identity enables system tracking and persona-appropriate responses. By logging which agent is handling interactions, you can track performance by agent type and ensure responses match the agent's intended persona and capabilities.

### Agent-Specific Message Routing
```newo
{{!-- Check if message is intended for current agent --}}
{{Set(name="to_idn", value=Stringify(GetTriggeredAct(fields=["toIdn"])))}}
{{Set(name="current_agent", value=GetAgentPersona())}}

{{#if to_idn != current_agent}}
  {{!-- Message not for this agent, ignore and return --}}
  {{SendSystemEvent(
    eventIdn="message_routing_filtered",
    intended_recipient=to_idn,
    current_agent=current_agent,
    action="ignored"
  )}}
  {{Return()}}
{{/if}}

{{!-- Message is for this agent, process it --}}
{{Set(name="message_content", value=GetTriggeredAct(fields=["text"]))}}

{{#system~}}
As {{current_agent}}, you received a directed message: "{{message_content}}"

Respond appropriately based on your role and capabilities.
{{~/system}}

{{#assistant~}}
{{gen(name="directed_response", temperature=0.6)}}
{{~/assistant}}

{{SendMessage(message=directed_response)}}

{{!-- Log successful message processing --}}
{{SendSystemEvent(
  eventIdn="directed_message_processed",
  agent=current_agent,
  message_content=message_content,
  processing_status="completed"
)}}
```

**Why this works**: Multi-agent systems need proper message routing to prevent agents from responding to messages intended for others. By checking the intended recipient against the current agent persona, you ensure only the appropriate agent processes each message.

## Advanced Agent Coordination

### Worker Message Publishing
```newo
{{!-- Publish task messages between worker agents --}}
{{Set(name="source_agent", value=GetAgentPersona())}}
{{Set(name="source_agent_id", value=GetAgentPersona(field="id"))}}
{{Set(name="task_details", value=GetState(name="current_task")}}

{{!-- Determine target worker based on task type --}}
{{Set(name="task_type", value=GetValueJSON(obj=task_details, key="type"))}}

{{#if IsSimilar(text1=task_type, text2="sms_outbound")}}
  {{Set(name="target_worker", value="SmsWorker")}}
{{else if IsSimilar(text1=task_type, text2="email_campaign")}}
  {{Set(name="target_worker", value="EmailWorker")}}
{{else if IsSimilar(text1=task_type, text2="magic_browser")}}
  {{Set(name="target_worker", value="MagicWorker")}}
{{else}}
  {{Set(name="target_worker", value="GeneralWorker")}}
{{/if}}

{{!-- Publish worker message with source agent identity --}}
{{SendSystemEvent(
  eventIdn="worker_message",
  fromIdn=source_agent,
  fromId=source_agent_id,
  toIdn=target_worker,
  taskType=task_type,
  taskPayload=Stringify(task_details),
  priority="normal",
  timestamp=GetDateTime()
)}}

{{!-- Log task delegation --}}
{{SendSystemEvent(
  eventIdn="task_delegated",
  source_agent=source_agent,
  target_worker=target_worker,
  task_type=task_type,
  delegation_time=GetDateTime()
)}}

{{SendMessage(message=Concat(
  "Task delegated to ", target_worker, " by ", source_agent, 
  ". Task type: ", task_type
))}}
```

**Why this works**: Worker delegation requires clear source identification for tracking, debugging, and coordination. The source agent's identity helps target workers understand the request origin and enables proper task attribution and response routing.

### Agent-Specific Session Management
```newo
{{!-- Create unique session names based on agent identity --}}
{{Set(name="base_agent_id", value=GetAgentPersona(field="id"))}}
{{Set(name="session_type", value=GetState(name="session_type"))}}

{{#if IsSimilar(text1=session_type, text2="random_session")}}
  {{!-- Generate random session name for temporary tasks --}}
  {{#system~}}
  Base prefix: {{base_agent_id}}
  
  Q: Add random UUID to the base prefix. Don't explain, don't use quotes, just plain text.
  {{~/system}}
  
  {{#assistant~}}
  {{gen(name="random_session_name", temperature=0.1, maxTokens=50)}}
  {{~/assistant}}
  
  {{Set(name="session_name", value=random_session_name)}}
{{else}}
  {{!-- Use agent ID as session name for standard sessions --}}
  {{Set(name="session_name", value=base_agent_id)}}
{{/if}}

{{!-- Configure session with agent-specific parameters --}}
{{SendCommand(
  commandIdn="create_session",
  integrationIdn="session_manager",
  connectorIdn="browser_sessions",
  session_name=session_name,
  agent_id=base_agent_id,
  session_type=session_type,
  timeout="3600",
  resource_limits=CreateObject(
    memory_mb="512",
    cpu_percent="25",
    concurrent_tasks="5"
  )
)}}

{{!-- Store session information --}}
{{SetState(
  name="current_session_info",
  value=CreateObject(
    session_name=session_name,
    agent_id=base_agent_id,
    created_at=GetDateTime(),
    session_type=session_type
  )
)}}

{{SendMessage(message=Concat(
  "Session created: ", session_name, 
  " for agent: ", base_agent_id
))}}
```

**Why this works**: Agent-specific session management ensures resources are properly attributed and managed per agent. Using the agent ID as a base for session names provides traceability and helps prevent resource conflicts between different agents.

## Task and Knowledge Management

### Agent-Specific Task Records
```newo
{{!-- Create task records with agent identity --}}
{{Set(name="current_agent", value=GetAgentPersona())}}
{{Set(name="agent_id", value=GetAgentPersona(field="id"))}}
{{Set(name="task_data", value=GetState(name="pending_task"))}}

{{!-- Build task record with agent context --}}
{{Set(name="task_record", value=CreateObject(
  id=GetValueJSON(obj=task_data, key="task_id"),
  user_id=GetUser(field="id"), 
  task_type=GetValueJSON(obj=task_data, key="type"),
  status="created",
  assigned_agent=current_agent,
  agent_id=agent_id,
  created_by=current_agent,
  arguments=GetValueJSON(obj=task_data, key="arguments"),
  created_at=GetDateTime()
))}}

{{!-- Store in AKB with agent attribution --}}
{{SetManualAkb(
  personaId=agent_id,
  summary=Concat("Task: ", GetValueJSON(obj=task_record, key="task_type")),
  facts=[Concat(current_agent, " created task\n---")],
  name=GetValueJSON(obj=task_record, key="id"),
  source=Stringify(task_record),
  labels=["created", GetValueJSON(obj=task_record, key="task_type")]
)}}

{{!-- Notify about task creation --}}
{{SendSystemEvent(
  eventIdn="task_record_created",
  task_id=GetValueJSON(obj=task_record, key="id"),
  agent_name=current_agent,
  agent_id=agent_id,
  task_type=GetValueJSON(obj=task_record, key="task_type")
)}}

{{SendMessage(message=Concat(
  "Task record created by ", current_agent, 
  " - ID: ", GetValueJSON(obj=task_record, key="id")
))}}

{{Return(val=Stringify(task_record))}}
```

**Why this works**: Task management requires clear ownership and attribution. By associating tasks with the creating agent's identity, you can track task origins, manage workloads per agent, and implement proper task lifecycle management with accountability.

### AKB Knowledge Organization by Agent
```newo
{{!-- Organize knowledge base entries by agent persona --}}
{{Set(name="persona_id", value=GetAgentPersona(field="id"))}}
{{Set(name="agent_name", value=GetAgentPersona())}}
{{Set(name="knowledge_category", value=GetState(name="akb_category"))}}

{{!-- Create agent-specific AKB content --}}
{{#if IsSimilar(text1=knowledge_category, text2="industry_hospitality")}}
  {{Set(name="industry_knowledge", value=`
    Restaurant Operations:
    - Table management and reservation systems
    - Menu optimization and seasonal offerings  
    - Staff scheduling and service standards
    - Customer experience and loyalty programs
    
    Hospitality Best Practices:
    - Guest communication and service recovery
    - Quality assurance and feedback systems
    - Event coordination and special requests
    - Revenue optimization strategies
  `)}}
  
{{else if IsSimilar(text1=knowledge_category, text2="industry_technology")}}
  {{Set(name="industry_knowledge", value=`
    Technology Solutions:
    - Software development and deployment
    - System integration and API management
    - Data security and privacy compliance
    - Performance monitoring and optimization
    
    Technical Support:
    - Troubleshooting methodologies
    - User training and onboarding
    - Documentation and knowledge transfer
    - Incident response and resolution
  `)}}
  
{{else}}
  {{Set(name="industry_knowledge", value="General business knowledge and best practices")}}
{{/if}}

{{!-- Store knowledge with agent attribution --}}
{{SetManualAkb(
  personaId=persona_id,
  summary=Concat(agent_name, " knowledge base: ", knowledge_category),
  facts=[industry_knowledge],
  name=Concat(agent_name, "_", knowledge_category, "_knowledge"),
  source=Concat("Generated by ", agent_name),
  labels=[knowledge_category, "agent_knowledge", agent_name]
)}}

{{SendSystemEvent(
  eventIdn="akb_knowledge_organized",
  agent_name=agent_name,
  agent_id=persona_id,
  category=knowledge_category,
  content_length=Len(text=industry_knowledge)
)}}
```

**Why this works**: Agent-specific knowledge organization enables specialized expertise and prevents knowledge pollution between different agent types. Each agent maintains its domain knowledge, improving response quality and enabling role-specific capabilities.

## Task Script Management

### Dynamic Task Script Retrieval
```newo
{{!-- Retrieve agent-specific task scripts --}}
{{Set(name="agent_name", value=GetAgentPersona(field="name"))}}
{{Set(name="task_idn", value=GetState(name="requested_task_type"))}}

{{!-- Build task script query using agent identity --}}
{{Set(name="script_query", value=Concat(agent_name, "_", task_idn))}}

{{!-- Search for agent-specific task script --}}
{{Set(name="task_script", value=Stringify(SearchFuzzyAkb(
  query=script_query,
  searchFields=["name"],
  numberTopics="1",
  fields=["facts", "source"],
  scoreThreshold="0.8"
)))}}

{{#if not IsEmpty(text=task_script)}}
  {{!-- Found agent-specific script --}}
  {{Set(name="script_content", value=GetValueJSON(obj=task_script, key="facts"))}}
  
  {{SendSystemEvent(
    eventIdn="agent_script_found",
    agent_name=agent_name,
    task_type=task_idn,
    script_query=script_query
  )}}
  
  {{!-- Execute agent-specific task script --}}
  {{SendMessage(message=Concat(
    "Executing ", task_idn, " script for ", agent_name
  ))}}
  
{{else}}
  {{!-- No agent-specific script found, use default --}}
  {{SendSystemEvent(
    eventIdn="agent_script_not_found",
    agent_name=agent_name,
    task_type=task_idn,
    script_query=script_query,
    fallback_action="using_default_script"
  )}}
  
  {{SendMessage(message=Concat(
    "No specific script found for ", agent_name, 
    " task ", task_idn, ". Using default behavior."
  ))}}
{{/if}}

{{Return(val=script_content)}}
```

**Why this works**: Agent-specific task scripts enable specialized behaviors while maintaining a fallback system. By using the agent name in script queries, you can implement custom logic per agent type while gracefully handling cases where specialized scripts don't exist.

## Integration and External Systems

### Agent Identity in External API Calls
```newo
{{!-- Include agent identity in external system integration --}}
{{Set(name="agent_identity", value=CreateObject(
  name=GetAgentPersona(),
  id=GetAgentPersona(field="id"),
  type="newo_agent",
  capabilities=GetState(name="agent_capabilities")
))}}

{{Set(name="external_request", value=CreateObject(
  event_type="agent_interaction",
  source_agent=agent_identity,
  user_context=CreateObject(
    user_id=GetUser(field="id"),
    session_id=GetActor(field="id")
  ),
  interaction_data=CreateObject(
    message=GetMemory(count="1", fromPerson="User"),
    timestamp=GetDateTime(),
    channel=GetActor(field="integrationIdn")
  )
))}}

{{!-- Send to external system with agent attribution --}}
{{SendCommand(
  commandIdn="track_interaction",
  integrationIdn="analytics_system",
  connectorIdn="interaction_tracker",
  payload=Stringify(external_request),
  agent_id=GetValueJSON(obj=agent_identity, key="id"),
  tracking_type="agent_performance"
)}}

{{!-- Process response with agent context --}}
{{#system~}}
As {{GetValueJSON(obj=agent_identity, key="name")}}, you are being tracked for performance analytics.

Customer message: "{{GetMemory(count="1", fromPerson="User")}}"

Provide your best response, knowing that this interaction will be analyzed for quality and effectiveness.
{{~/system}}

{{#assistant~}}
{{gen(name="tracked_response", temperature=0.6)}}
{{~/assistant}}

{{SendMessage(message=tracked_response)}}
```

**Why this works**: External system integration requires clear agent identification for analytics, compliance, and performance tracking. By including comprehensive agent identity in API calls, external systems can properly attribute interactions and provide agent-specific insights.

### Agent-Based Error Reporting
```newo
{{!-- Report errors with comprehensive agent context --}}
{{Set(name="error_context", value=CreateObject(
  agent_name=GetAgentPersona(),
  agent_id=GetAgentPersona(field="id"),
  skill_name=GetAgent(field="current_skill"),
  error_message=GetState(name="last_error"),
  user_id=GetUser(field="id"),
  session_info=GetActor(),
  timestamp=GetDateTime()
))}}

{{!-- Determine error severity based on agent type --}}
{{Set(name="agent_name", value=GetValueJSON(obj=error_context, key="agent_name"))}}

{{#if Contains(text=agent_name, search="Manager")}}
  {{Set(name="error_severity", value="high")}}
  {{Set(name="notification_team", value=["management", "technical"])}}
{{else if Contains(text=agent_name, search="Worker")}}
  {{Set(name="error_severity", value="medium")}}
  {{Set(name="notification_team", value=["technical"])}}
{{else}}
  {{Set(name="error_severity", value="low")}}
  {{Set(name="notification_team", value=["monitoring"])}}
{{/if}}

{{!-- Send error report with agent-specific routing --}}
{{SendCommand(
  commandIdn="report_error",
  integrationIdn="error_tracking",
  connectorIdn="agent_errors",
  error_data=Stringify(error_context),
  severity=error_severity,
  notification_teams=Stringify(notification_team),
  requires_immediate_attention=IsSimilar(text1=error_severity, text2="high")
)}}

{{!-- Provide user-facing error message based on agent type --}}
{{#if IsSimilar(text1=error_severity, text2="high")}}
  {{SendMessage(message="I encountered an issue that our team is addressing immediately. A specialist will contact you shortly.")}}
{{else}}
  {{SendMessage(message="I'm experiencing a temporary issue. Please try again in a moment, or let me help you in a different way.")}}
{{/if}}
```

**Why this works**: Agent-based error reporting enables appropriate escalation and response strategies. Management agents might require immediate attention for errors, while worker agent issues might follow different escalation paths. This ensures proper resource allocation for error resolution.

## Best Practices

### Comprehensive Agent Context
```newo
{{!-- Always capture complete agent context when needed --}}
{{Set(name="agent_context", value=CreateObject(
  identity=CreateObject(
    name=GetAgentPersona(),
    id=GetAgentPersona(field="id")
  ),
  execution_context=CreateObject(
    skill=GetAgent(field="current_skill"),
    timestamp=GetDateTime(),
    session_id=GetActor(field="id")
  ),
  user_context=CreateObject(
    user_id=GetUser(field="id"),
    channel=GetActor(field="integrationIdn")
  )
))}}

{{!-- Use context appropriately throughout execution --}}
{{SetState(name="current_agent_context", value=Stringify(agent_context))}}
```

### Agent Identity Validation
```newo
{{!-- Validate agent identity before sensitive operations --}}
{{Set(name="current_agent", value=GetAgentPersona())}}
{{Set(name="required_agent", value=GetState(name="required_agent_type"))}}

{{#if not IsSimilar(text1=current_agent, text2=required_agent)}}
  {{SendSystemEvent(
    eventIdn="agent_authorization_failed",
    current_agent=current_agent,
    required_agent=required_agent,
    operation="sensitive_task_execution"
  )}}
  
  {{Return(val="unauthorized")}}
{{/if}}

{{!-- Proceed with authorized operation --}}
{{SendMessage(message="Authorized operation proceeding")}}
```

## Limitations

- **Execution Context**: Only returns information for the currently executing agent
- **Static Information**: Agent persona data doesn't change during execution
- **Field Availability**: Available fields depend on agent configuration
- **Multi-Agent Visibility**: Cannot directly access other agents' persona information
- **Runtime Dependency**: Requires proper agent context to function

## Troubleshooting

### Missing Agent Information
```newo
{{Set(name="agent_check", value=GetAgentPersona())}}
{{#if IsEmpty(text=agent_check)}}
  {{SendSystemEvent(
    eventIdn="agent_persona_missing",
    skill_name=GetAgent(field="current_skill"),
    execution_context=GetAgent()
  )}}
{{/if}}
```

### Agent Field Validation
```newo
{{Set(name="agent_id", value=GetAgentPersona(field="id"))}}
{{Set(name="agent_name", value=GetAgentPersona(field="name"))}}

{{#if IsEmpty(text=agent_id)}}
  {{SendSystemEvent(
    eventIdn="agent_id_missing",
    agent_name=agent_name
  )}}
{{/if}}
```

## Related Actions

- **action** - Get current user information
- **action** - Get current actor information
- **action** - Get agent execution context
- **action** - Log agent activities
- **action** - Store agent-specific state