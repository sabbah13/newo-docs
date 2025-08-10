---
title: "Practical Development Guide: Working with Newo SuperAgent"
---


## Getting Started with Development

### Understanding the Development Environment

The Newo SuperAgent system is a skill-based, event-driven architecture where development involves:
1. **Creating Skills** - Individual units of functionality
2. **Configuring Flows** - Organizing related skills into business processes  
3. **Setting up Events** - Defining how agents communicate
4. **Testing Integration** - Validating end-to-end functionality

### Development Workflow Overview

```
1. Understand Business Requirement
   ↓
2. Identify Target Agent and Flow
   ↓ 
3. Create/Modify Skills
   ↓
4. Configure Events (if needed)
   ↓
5. Test Individual Skills
   ↓
6. Test Complete Flow
   ↓
7. Deploy and Monitor
```

## Skill Development Patterns

### Creating a New Skill

#### Step 1: Determine Skill Type

**Guidance Skill (.guidance)** - For AI-powered logic:
```
File: ConvoAgent/CANewFlow/ProcessCustomerRequestSkill.guidance

Content Structure:
---
Given the customer request and conversation context:
- Customer message: "{user_message}"
- Previous conversation: "{memory}"
- Business context: "{business_settings}"

Analyze the request and:
1. Identify the customer's specific need
2. Determine what information is missing
3. Plan the next steps in the process
4. Generate an appropriate response

Response should:
- Address the customer's immediate concern
- Ask for any missing information
- Set clear expectations
- Maintain a helpful and professional tone

If additional processing is needed, call appropriate utility skills:
- {{_validateRequestSkill(request=customer_request)}}
- {{_gatherRequiredInformationSkill(missing_fields=required_data)}}
---
```

**Jinja Skill (.jinja)** - For data processing:
```
File: ConvoAgent/CANewFlow/FormatResponseSkill.jinja

Content Structure:
---
{%- set customer_name = Get(name="customer_name") -%}
{%- set request_type = Get(name="request_type") -%}
{%- set business_hours = Get(name="business_hours") -%}

{%- if request_type == "appointment" -%}
    Hello {{customer_name}}, I'd be happy to help you schedule an appointment.
    
    {%- if business_hours.is_open -%}
        We're currently open and can accommodate your request.
    {%- else -%}
        We're currently closed, but I can schedule you for when we reopen at {{business_hours.next_open_time}}.
    {%- endif -%}

{%- elif request_type == "information" -%}
    Hi {{customer_name}}, here's the information you requested:
    {{Get(name="requested_information")}}

{%- else -%}
    Hello {{customer_name}}, I understand you need assistance. Let me connect you with the right person.
{%- endif -%}

{{Set(name="formatted_response", value=response_text)}}
---
```

#### Step 2: Implement Skill Logic

**Business Logic Pattern**:
1. **Input Validation** - Verify required parameters
2. **Context Analysis** - Understand current situation
3. **Business Rules** - Apply domain-specific logic
4. **Action Execution** - Perform required operations
5. **Response Generation** - Create appropriate output
6. **State Updates** - Update relevant system state

**Example Implementation**:
```guidance
File: ConvoAgent/CABookingFlow/_validateBookingRequestSkill.guidance

Validation Logic:
1. Check if customer provided required information:
   - Date and time
   - Party size  
   - Contact information
   - Special requirements (if any)

2. Verify business constraints:
   - Is the requested date/time within business hours?
   - Is the party size within capacity limits?
   - Are there any blackout dates or restrictions?

3. Customer eligibility:
   - Is this a repeat customer with special status?
   - Are there any account restrictions?
   - Does the request comply with business policies?

If validation passes:
- Set validation_status = "approved"
- Proceed with booking process
- Set next_step = "check_availability"

If validation fails:
- Set validation_status = "rejected"  
- Set rejection_reason = specific issue
- Generate helpful alternative suggestions
- Set next_step = "request_corrections"

Call utility skills as needed:
{{_checkBusinessHoursSkill(requested_datetime=booking_time)}}
{{_validatePartySize(size=party_size, venue_capacity=max_capacity)}}
{{_getCustomerStatusSkill(customer_id=user_id)}}
```

### Skill Communication Patterns

#### Internal Skill Calls (Same Agent)
```jinja
{{Set(name="validation_result", value=_validateDataSkill(
    input_data=user_input,
    validation_rules=business_rules,
    context=conversation_context
))}}

{{Set(name="processed_data", value=_processDataSkill(
    raw_data=validation_result.clean_data,
    processing_options=system_settings
))}}
```

#### Cross-Agent Communication via Events
```jinja
{{SendSystemEvent(
    eventIdn="execute_external_task",
    taskType="availability_check",
    businessContext={
        "venue_id": venue_id,
        "requested_date": booking_date,
        "party_size": guest_count
    },
    responseHandler="receive_availability_result"
)}}
```

#### State Management in Skills
```jinja
# Store persistent user data
{{SetPersonaAttribute(id=user_id, field="last_booking_attempt", value={
    "date": current_date,
    "venue": venue_name,
    "status": "in_progress"
})}}

# Store temporary session data  
{{Set(name="current_booking_context", value={
    "step": "availability_check",
    "data_collected": required_fields,
    "next_action": "wait_for_availability_response"
})}}

# Retrieve stored data
{{Set(name="customer_history", value=GetPersonaAttribute(
    id=user_id,
    field="booking_history"
))}}
```

## Flow Development

### Creating a New Business Flow

#### Step 1: Design Flow Architecture
```
Flow Name: CANewServiceFlow
Purpose: Handle new service type requests

Required Skills:
├── AnalyzeConversationSkill.guidance (Entry point)
├── _validateServiceRequestSkill.guidance
├── _checkServiceAvailabilitySkill.guidance  
├── _processServiceBookingSkill.guidance
├── _handleServiceErrorsSkill.guidance
├── _schemasSkill.guidance (Data validation)
└── Supporting utility skills as needed
```

#### Step 2: Create Flow Directory Structure
```
mkdir project/ConvoAgent/CANewServiceFlow
cd project/ConvoAgent/CANewServiceFlow

# Create main entry point
touch AnalyzeConversationSkill.guidance

# Create business logic skills
touch _validateServiceRequestSkill.guidance
touch _checkServiceAvailabilitySkill.guidance
touch _processServiceBookingSkill.guidance
touch _handleServiceErrorsSkill.guidance

# Create supporting files
touch _schemasSkill.guidance
touch _utilsFormatServiceResponseSkill.guidance
```

#### Step 3: Implement Flow Logic

**Entry Point Skill**:
```guidance
File: AnalyzeConversationSkill.guidance

Analyze the conversation context to determine if this is a new service request:

Customer Message: "{user_message}"
Conversation History: "{memory}"
Current Intent: "{current_intent}"

Determine:
1. Is this a request for our new service offering?
2. What specific aspect of the service is the customer interested in?
3. What information do we need to collect?
4. What is the appropriate next step?

Routing Logic:
- If service inquiry → Call _validateServiceRequestSkill
- If booking request → Call _processServiceBookingSkill  
- If general questions → Provide service information
- If outside scope → Transfer to appropriate flow

Generate response that:
- Acknowledges the service request
- Provides relevant information
- Guides customer to next step
- Sets clear expectations
```

**Business Logic Skill**:
```guidance
File: _processServiceBookingSkill.guidance

Process the service booking request with the following steps:

1. Validate Request:
   {{Set(name="validation_result", value=_validateServiceRequestSkill(
       service_type=requested_service,
       customer_requirements=customer_needs,
       business_constraints=service_limitations
   ))}}

2. Check Availability:
   {{SendSystemEvent(
       eventIdn="check_service_availability",
       serviceType=requested_service,
       timeframe=requested_dates
   )}}

3. Process Booking (if available):
   - Collect required customer information
   - Calculate pricing and terms
   - Create service booking record
   - Send confirmation details

4. Handle Unavailability:
   - Suggest alternative dates/options
   - Add customer to waiting list
   - Provide expected availability timeline

Generate appropriate response based on booking outcome.
```

## Event Configuration

### Adding New Events to flows.yaml

#### Event Configuration Pattern
```yaml
# Add to flows.yaml events section
events:
  - idn: "process_new_service_request"
    skill_selector: "SkillSelector.skill_idn"
    skill_idn: "AnalyzeConversationSkill"
    integration_idn: "system"
    connector_idn: "system"
    interrupt_mode: "InterruptMode.queue"
    args:
      flow_context: "new_service_handling"
      priority: "normal"
      
  - idn: "check_service_availability"
    skill_selector: "SkillSelector.skill_idn"  
    skill_idn: "CheckServiceAvailabilitySkill"
    integration_idn: "apify"
    connector_idn: "service_availability"
    interrupt_mode: "InterruptMode.queue"
    args:
      timeout: 30000
      retry_count: 3
```

## Testing and Debugging

### Skill Testing Strategy

#### Unit Testing Individual Skills
1. **Create Test Inputs**: Mock conversation context and parameters
2. **Execute Skill**: Run skill with test data
3. **Validate Outputs**: Check response format and content
4. **Test Edge Cases**: Invalid inputs, missing data, error conditions

#### Integration Testing Flow
1. **End-to-End Flow**: Test complete customer journey
2. **Cross-Agent Communication**: Verify event handling
3. **External Integration**: Test API calls and responses
4. **Error Scenarios**: Test failure handling and recovery

#### Debugging Techniques

**Skill Execution Tracing**:
```guidance
# Add debug logging to skills
Debug: Starting skill execution with parameters:
- user_id: {user_id}
- conversation_id: {conversation_id}  
- input_data: {input_parameters}

# Log decision points
Debug: Business rule evaluation:
- Rule: {rule_name}
- Input: {rule_input}
- Result: {rule_result}
- Next Action: {planned_action}

# Log external calls
Debug: External system call:
- System: {external_system_name}
- Request: {request_data}
- Response: {response_data}
- Status: {call_status}
```

**State Inspection**:
```jinja
# Check current state values
Current User State: {{GetPersonaAttribute(id=user_id, field="*")}}
Current Session State: {{Get(name="*")}}
Current Conversation Memory: {{memory}}
```

## Common Development Patterns

### Data Validation Pattern
```guidance
# Input validation skill pattern
File: _validateInputDataSkill.guidance

Validate the provided data:
Input: {input_data}
Requirements: {validation_requirements}

Check:
1. Required fields present?
2. Data formats correct?
3. Business rules satisfied?
4. Security constraints met?

If valid:
- Set validation_status = "passed"
- Clean and format data
- Return processed data

If invalid:
- Set validation_status = "failed"
- List specific errors
- Suggest corrections
- Return error details
```

### External Integration Pattern
```guidance
# External system integration pattern
File: _integrateExternalSystemSkill.guidance

Integration Steps:
1. Prepare request data
2. Handle authentication
3. Make API call
4. Process response
5. Handle errors
6. Return formatted result

Error Handling:
- Network timeouts → Retry with backoff
- Authentication failures → Refresh credentials  
- Rate limits → Queue and delay
- Service unavailable → Use fallback or notify customer
```

### Customer Communication Pattern
```guidance
# Customer response generation pattern
File: _generateCustomerResponseSkill.guidance

Response Generation:
1. Analyze current conversation context
2. Determine customer's emotional state
3. Select appropriate tone and style
4. Include relevant information
5. Set clear next steps
6. Maintain brand voice

Response Elements:
- Acknowledgment of customer input
- Specific information or action taken
- Clear next steps or questions
- Professional and helpful tone
- Appropriate level of detail
```

## Deployment and Monitoring

### Deployment Checklist
1. **Skill Validation**: All skills pass unit tests
2. **Flow Integration**: Complete flows work end-to-end
3. **Event Configuration**: All events properly configured
4. **External Integrations**: APIs and services accessible
5. **Error Handling**: Failure scenarios properly handled
6. **Performance**: Response times within acceptable limits

### Monitoring and Maintenance
1. **Execution Logs**: Monitor skill execution and performance
2. **Error Tracking**: Track and resolve skill failures
3. **Customer Feedback**: Monitor conversation quality
4. **Performance Metrics**: Track response times and success rates
5. **System Health**: Monitor agent availability and status

This practical guide provides the foundation for effectively developing new functionality within the Newo SuperAgent system while following established patterns and best practices.
