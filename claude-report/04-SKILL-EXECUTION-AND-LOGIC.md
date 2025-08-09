# Skill Execution and Logic Tracing Guide

## Understanding Skill Execution Flow

This document explains how to trace through the execution of skills in the Newo SuperAgent system, understand the logic patterns, and follow the code flow step by step.

## Skill Types and Execution Models

### 1. .guidance Files (LLM-Powered Skills)
**Purpose**: Business logic that requires AI reasoning and decision-making
**Execution**: Processed by LLM with conversation context and business rules
**Content**: Natural language instructions for AI processing

### 2. .jinja Files (Template-Driven Skills)
**Purpose**: Data transformation, formatting, and deterministic processing
**Execution**: Template engine processes with variables and control structures
**Content**: Template syntax with data manipulation logic

### 3. Schema Files (Data Validation)
**Purpose**: Define data structures, validation rules, and API contracts
**Execution**: Runtime validation of data against defined schemas
**Content**: JSON schema definitions and validation rules

## How to Trace Skill Execution

### Step 1: Find the Entry Point

#### Start with flows.yaml
Every agent interaction begins with an event in `flows.yaml`:

```yaml
events:
  - idn: "conversation_started"
    skill_selector: "SkillSelector.skill_idn"
    skill_idn: "ConversationStartedSkill"
    integration_idn: "system"
    connector_idn: "system"
```

**Tracing Process**:
1. **Event Triggered**: `conversation_started` event occurs
2. **Skill Location**: Find `ConversationStartedSkill.guidance` in ConvoAgent/CAMainFlow/
3. **Skill Execution**: LLM processes the guidance file with context
4. **Output**: Skill generates next actions, state changes, or events

### Step 2: Follow the Skill Chain

#### Example: Conversation Start Flow
```
Event: conversation_started
↓
File: ConvoAgent/CAMainFlow/ConversationStartedSkill.guidance
↓
Logic: Analyze customer channel, set up session, determine greeting
↓
Calls: _buildUserInformationSkill, _startNewSessionSkill
↓
Output: Greeting message + session initialization
```

#### Tracing Through Files:

1. **ConversationStartedSkill.guidance** (Main entry point)
2. **_buildUserInformationSkill.guidance** (Get customer data)  
3. **_startNewSessionSkill.guidance** (Initialize session)
4. **_generateGreetingPhrasesSkill.guidance** (Create personalized greeting)

### Step 3: Understand Skill Communication Patterns

#### Skill-to-Skill Calls Within Same Agent
```jinja
{{Set(name="user_info", value=_buildUserInformationSkill(
    userId=user_id,
    conversationId=conversation_id
))}}
```

#### Cross-Agent Communication via Events
```jinja
{{SendSystemEvent(
    eventIdn="task_manager_execute_task",
    taskType="sms_sending",
    taskData=sms_content
)}}
```

#### State Management
```jinja
{{SetPersonaAttribute(id=user_id, field="last_interaction", value=current_timestamp)}}
{{Set(name="session_state", value="active")}}
```

## Deep Dive: Skill Logic Patterns

### Pattern 1: Business Process Skills

#### Example: Booking Flow Logic
```
File: ConvoAgent/CAScheduleFlow/_bookSkill.guidance

Logic Flow:
1. Validate booking prerequisites
   - Customer information complete?
   - Availability confirmed?
   - Business rules satisfied?

2. Execute booking transaction
   - Call external booking system
   - Handle success/failure responses
   - Update customer records

3. Generate confirmations
   - Create confirmation message
   - Schedule follow-up communications
   - Update booking status

4. Error handling
   - Retry logic for failures
   - Fallback options for customer
   - Escalation procedures
```

#### Tracing the Booking Process:
1. **_bookInitialCheckSkill.guidance** → Validation
2. **_bookSkill.guidance** → Core booking logic
3. **ReceiveBookingResultSkill.guidance** → Success handling
4. **ReceiveBookingErrorSkill.guidance** → Error handling
5. **_buildEmailBodyExtractValuesSkill.guidance** → Confirmation generation

### Pattern 2: Analysis and Decision Skills

#### Example: Conversation Analysis
```
File: ConvoAgent/CAMainFlow/AnalyzeConversationSkill.guidance

Logic Flow:
1. Context Analysis
   - Review conversation history
   - Identify customer intent
   - Assess conversation stage

2. Decision Making
   - Determine next action
   - Select appropriate response
   - Choose business flow

3. Context Updates
   - Update conversation state
   - Set relevant variables
   - Prepare for next interaction
```

#### Understanding AI-Powered Logic:
```guidance
Given the conversation context:
- Customer message: "{user_message}"
- Previous interactions: "{conversation_memory}"
- Business context: "{business_settings}"

Analyze and determine:
1. What is the customer trying to accomplish?
2. What information do we need to gather?
3. What business process should be initiated?
4. What would be the most helpful response?

Generate response that:
- Addresses customer's immediate need
- Gathers missing information if needed
- Moves conversation toward resolution
- Maintains professional and helpful tone
```

### Pattern 3: Integration and External Communication

#### Example: SMS Sending Logic
```
File: SmsWorker/SWMainFlow/SendSMSSkill.guidance

Logic Flow:
1. Message Preparation
   - Template selection
   - Variable substitution
   - Content validation

2. Recipient Validation
   - Phone number formatting
   - Opt-in status check
   - Business rules compliance

3. Delivery Management
   - SMS gateway selection
   - Delivery attempt
   - Status tracking

4. Error Handling
   - Retry logic
   - Alternative delivery methods
   - Failure notifications
```

## Data Flow Tracing

### Understanding Variable Flow

#### Input Variables (From Events)
```jinja
Input Parameters:
- user_id: "12345"
- conversation_id: "conv_67890"
- user_message: "I want to book a table"
- memory: [{previous conversation turns}]
```

#### Variable Transformations
```jinja
{{Set(name="intent", value=AnalyzeIntentSkill(message=user_message))}}
{{Set(name="availability_request", value=_buildAvailabilityRequestSkill(
    intent=intent,
    customer_id=user_id,
    preferences=customer_preferences
))}}
```

#### Output Generation
```jinja
Response: "I'd be happy to help you book a table. What date and time work best for you?"
Next Actions: [
    "wait_for_date_time_input",
    "prepare_availability_check"
]
State Updates: {
    "conversation_stage": "gathering_booking_details",
    "expected_input": "date_time"
}
```

### Memory and Context Flow

#### Memory Retrieval
```jinja
{{Set(name="memory", value=_utilsGetMemorySkill(
    userId=user_id,
    count=10,  # Get last 10 interactions
    includeLatestAgentResponse=false
))}}
```

#### Memory Analysis
```jinja
{{Set(name="customer_context", value=_analyzeCustomerHistorySkill(
    memory=memory,
    customer_profile=customer_data
))}}
```

#### Memory Updates
```jinja
{{Set(name="updated_memory", value=_addToMemorySkill(
    existing_memory=memory,
    new_interaction={
        "timestamp": current_time,
        "customer_message": user_message,
        "agent_response": generated_response,
        "business_action": booking_action
    }
))}}
```

## Complex Logic Tracing Examples

### Example 1: Restaurant Booking Flow

#### Complete Trace Through System:
```
1. Customer: "I want to book a table for tonight"
   Event: user_sms_reply
   File: ConvoAgent/CAMainFlow/UserSMSReplySkill.guidance

2. Analysis Phase:
   File: ConvoAgent/CAMainFlow/AnalyzeConversationSkill.guidance
   Logic: Intent = "restaurant_booking", Missing = ["date_time", "party_size"]

3. Information Gathering:
   File: ConvoAgent/CAMainFlow/_userMessageReplyWaitSkill.guidance
   Response: "I'll help you book a table! How many people and what time?"

4. Customer: "4 people at 7pm"
   File: ConvoAgent/CAScheduleFlow/AnalyzeConversationSkill.guidance
   Logic: Extract party_size=4, time=7pm, validate availability request

5. Availability Check:
   Event: check_availability_hospitality
   File: ApifyCheckAvailabilityWorker/ACAMainFlow/HospitalityRequestAvailableSlotsDefaultSkill.guidance
   Logic: Query external booking system

6. External Response:
   Event: run_actor_success  
   File: ConvoAgent/CACheckingAvailabilityFlow/ReceiveAvailableSlotsDefaultSkill.guidance
   Logic: Process available slots, format for customer

7. Booking Confirmation:
   File: ConvoAgent/CAScheduleFlow/_bookSkill.guidance
   Logic: Execute booking, generate confirmation

8. Follow-up:
   Event: task_manager_execute_task (SMS confirmation)
   File: TaskManager/TMMainFlow/ExecuteTasksSkill.guidance
   Logic: Schedule confirmation SMS
```

### Example 2: Error Handling and Recovery

#### Trace Through Error Scenario:
```
1. Booking Attempt Fails:
   File: ConvoAgent/CAScheduleFlow/ReceiveBookingErrorSkill.guidance
   Logic: Analyze error type, determine recovery options

2. Customer Notification:
   Response: "I apologize, but that time slot is no longer available. 
             Here are some alternatives: [alternative_times]"

3. Alternative Processing:
   File: ConvoAgent/CACheckingAvailabilityFlow/_receiveAvailableSlotsTwoNearestSkill.guidance
   Logic: Find nearest available slots, present options

4. Recovery Actions:
   - Update availability cache
   - Log error for system improvement
   - Offer customer alternative solutions
```

## Debugging and Troubleshooting Skills

### Understanding Skill Failures

#### Common Failure Points:
1. **Missing Variables**: Required input not provided
2. **External System Errors**: API failures, timeouts
3. **Business Rule Violations**: Invalid data or requests
4. **Template Errors**: Jinja syntax issues
5. **LLM Reasoning Errors**: Unexpected AI responses

#### Debugging Process:
1. **Check Event Logs**: What event triggered the skill?
2. **Verify Input Data**: Are all required variables present?
3. **Trace Skill Execution**: Follow the logic step by step
4. **Check External Dependencies**: Are APIs and services available?
5. **Validate Business Rules**: Do the actions comply with business logic?

### Testing Individual Skills

#### Skill Testing Pattern:
1. **Isolate the Skill**: Test with known inputs
2. **Verify Dependencies**: Ensure all called skills work
3. **Test Edge Cases**: Invalid inputs, missing data
4. **Validate Outputs**: Check response format and content
5. **Performance Testing**: Ensure acceptable response times

## Advanced Tracing Techniques

### Following Complex Multi-Agent Workflows

#### Cross-Agent Process Tracing:
```
1. ConvoAgent receives customer request
2. TaskManager coordinates background work
3. Specialized workers execute tasks
4. Results flow back through TaskManager
5. ConvoAgent delivers final response to customer
```

#### Event Flow Mapping:
```
conversation_started → ConvoAgent
     ↓
analyze_conversation → Intent Detection
     ↓  
task_manager_execute_task → TaskManager
     ↓
execute_tasks → ApifyWorker
     ↓
run_actor_success → Result Processing  
     ↓
customer_response → Final Delivery
```

### System State Debugging

#### State Inspection Points:
- **User State**: Customer profile and preferences
- **Session State**: Current conversation context
- **System State**: Configuration and business rules
- **Agent State**: Individual agent status and health

This comprehensive tracing guide provides the foundation for understanding how to follow the logic through the Newo SuperAgent system, debug issues, and understand the sophisticated multi-agent coordination patterns.