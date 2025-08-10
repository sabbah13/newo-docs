---
title: "Troubleshooting and Debugging Guide: Newo Digital Employees"
---

## Overview

Digital Employee debugging follows a systematic approach based on a fundamental principle from electrical engineering:

> **"There are only two reasons a device does not work – either there is no contact where it should be, or there is contact where it should not be."**

Applied to Digital Employees: **Either the LLM was not given the information it needed, or it was given incorrect information.**

## Core Debugging Methodology

### 🔍 The Three-Step Debugging Process

#### Step 1: Locate the Issue
- Find the broken/unexpected reply in Sandbox chat history or logs
- Identify the specific interaction that produced the incorrect response
- Note the timestamp and context of the failure

#### Step 2: Examine the Prompt
- Open the prompt that was sent to the LLM for that specific interaction
- Review all information blocks included in the prompt
- Identify what information was present vs. what was expected

#### Step 3: Analyze the Gap
- Ask: "Why could the LLM have generated this response given this prompt?"
- Identify missing information that should have been present
- Determine which prompt block was missing or incorrect

## Understanding ConvoAgent Prompt Structure

### 📋 Static Blocks (Always Present)

These blocks remain consistent across all workflow steps:

**Agent Persona and Roles**
```
Role: Professional restaurant hostess
Responsibilities: Booking management, customer service, inquiry handling
Personality: Friendly, professional, helpful
```

**Agent Main Instruction**
```
Primary Goal: Help customers with restaurant reservations and inquiries
Secondary Goals: Upsell when appropriate, gather customer preferences
Communication Style: Professional yet warm
```

**Business Context**
```
Restaurant: [Name]
Cuisine Type: [Type]
Hours: [Schedule]
Location: [Address]
Special Features: [Amenities]
Basic Menu Overview: [Key dishes]
```

**Explicit Constraints**
```
- Never book tables for more than 12 people without manager approval
- Always ask for contact information for reservations
- Do not discuss pricing for special events over phone
- Refer complex dietary restrictions to chef
```

### 🔄 Workflow Step Blocks (Dynamic)

These blocks change at each workflow step:

**Task Object**
```
Current Task: Check table availability
Required Input: Date, time, party size
Expected Output: Available time slots
Context Dependencies: Business hours, existing bookings
```

**Task Object Format**
```
Input Format: {date: "YYYY-MM-DD", time: "HH:MM", party_size: number}
Output Format: [{available_time: "HH:MM", table_id: "string"}]
Validation Rules: Date must be future, party size 1-12
```

**Task Instruction**
```
1. Validate requested date/time against business hours
2. Query availability system for requested slot
3. If unavailable, suggest nearest alternatives
4. Format response for customer communication
```

**Task Context**
```
Previous Step Result: Customer requested "table for 4 on Friday evening"
Processed Data: {date: "2024-01-19", time: "19:00", party_size: 4}
System State: Availability check initiated
```

### 🖥️ System Dynamic Blocks

**Memory (Conversation History)**
```
User: Hi, do you have any tables available Friday?
Agent: I'd be happy to help! For how many people and what time?
User: 4 people around 7 PM
Agent: [Checking availability thoughts: Need to verify date, 7 PM could mean 19:00]
```

**Supervisor Agent Comments**
```
Missing Info: Specific date not confirmed (which Friday?)
Recommendation: Clarify date before proceeding with availability check
Quality Note: Response was professional and appropriate
```

## Common Debugging Scenarios

### 🚫 Scenario 1: "I'm Not Sure" Response

**Problem**: Agent responds with uncertainty when information should be available

**Example Issue**:
```
Customer: "Do you have vegetarian burgers on your menu?"
Agent: "I'm not sure about our vegetarian options."
```

**Debugging Analysis**:
1. **Prompt Review**: Check if menu information was in the prompt
2. **Workflow Stage**: Was agent at a stage where menu should be available?
3. **Information Flow**: Was the agent in "food_ordering" workflow where menu is Task Context?

**Root Cause**: Agent hadn't reached the first step of "food_ordering" workflow where menu is provided as Task Context.

**Solution**: Include brief menu overview in Business Context section for early conversation stages.

```
Business Context Update:
Restaurant: [Name]
Popular Dishes: Beef burger, Vegetarian quinoa burger, Grilled salmon, Caesar salad
Dietary Options: Vegetarian, gluten-free options available
Full menu available upon request
```

### ❌ Scenario 2: Incorrect Availability Information

**Problem**: Agent provides wrong availability information

**Example Issue**:
```
Customer: "Do you have any free slots for tomorrow?"
Agent: "We don't have any free slots for tomorrow."
(Reality: Multiple slots were available)
```

**Debugging Analysis**:
1. **Workflow Position**: Agent was at third step of "book_workflow"
2. **Task Context**: Should contain free slots from previous step
3. **Data Source**: Task Context came from MagicWorker's Task Object
4. **Data Accuracy**: MagicWorker received incorrect date from ConvoAgent

**Root Cause Investigation**:
```
Step 1: ConvoAgent → Created task with incorrect date due to timezone misconfiguration
Step 2: MagicWorker → Processed task with wrong date, returned accurate data for wrong date
Step 3: ConvoAgent → Received "no availability" for incorrect date
```

**Solution**: Correct business timezone configuration.

```
Business Settings Update:
timezone: "America/New_York" (was incorrectly set to UTC)
business_hours: {
  timezone: "America/New_York",
  monday: "09:00-22:00",
  ...
}
```

### 🔄 Scenario 3: Workflow Loop or Stuck States

**Problem**: Agent repeats the same question or gets stuck in a loop

**Debugging Analysis**:
1. **State Management**: Check if conversation state is being updated properly
2. **Conditional Logic**: Review if-else conditions for proper flow control
3. **Memory Management**: Verify conversation memory is being accessed correctly

**Common Causes**:
- Missing `SetState` actions to update conversation stage
- Incorrect conditional logic in workflow transitions
- Memory retrieval not including recent conversation turns

**Solution Pattern**:
```newo
{{!-- Always update state after collecting information --}}
{{#if IsEmpty(text=customer_phone)}}
  {{SendMessage(message="May I have your phone number?")}}
  {{SetState(name="waiting_for", value="phone")}}
{{else}}
  {{SetCustomerAttribute(field="phone", value=customer_phone)}}
  {{SetState(name="waiting_for", value="confirmation")}}
  {{SendSystemEvent(eventIdn="proceed_to_confirmation")}}
{{/if}}
```

## Advanced Debugging Techniques

### 🔬 Prompt Analysis Workflow

#### 1. Information Block Inventory
Create a checklist of expected information blocks:

```
☑️ Agent Persona: Present and accurate
☑️ Main Instruction: Clear and specific  
☑️ Business Context: Complete and up-to-date
☑️ Explicit Constraints: All rules included
☑️ Task Object: Properly formatted
☑️ Task Context: Relevant data from previous step
☑️ Memory: Recent conversation included
☑️ System State: Current workflow position clear
```

#### 2. Information Quality Assessment
Evaluate each present block:

```
Agent Persona: ✅ Complete
Main Instruction: ✅ Clear
Business Context: ⚠️  Missing seasonal menu updates
Task Object: ❌ Incorrect date format
Task Context: ❌ Empty - previous step failed
Memory: ✅ Recent 10 turns included
```

#### 3. Gap Impact Analysis
Assess how missing/incorrect information affects LLM reasoning:

```
Missing seasonal menu → Agent can't suggest new dishes
Incorrect date format → Availability check fails
Empty Task Context → Agent has no data to work with
```

### 🛠️ Debugging Tools and Techniques

#### Prompt Inspection
```newo
{{!-- Add debug information to prompts during troubleshooting --}}
Debug Information:
- Current Workflow: {{GetState(name="current_workflow")}}
- Conversation Stage: {{GetState(name="conversation_stage")}}
- User ID: {{GetUser(field="id")}}
- Timestamp: {{GetDateTime(format="datetime")}}
- Memory Count: {{GetMemory(count="1")}}
```

#### State Monitoring
```newo
{{!-- Monitor state changes --}}
{{Set(name="debug_state", value=Concat(
  "Stage: ", GetState(name="stage"),
  ", Last Action: ", GetState(name="last_action"),
  ", User Input: ", GetTriggeredAct(fields=["text"])
))}}

{{SendMessage(message=debug_state, actorIds="debug_channel")}}
```

#### Memory Validation
```newo
{{!-- Verify memory contents --}}
{{Set(name="memory_check", value=GetMemory(count="5", maxLen="1000"))}}
{{SendMessage(message=Concat("Recent Memory: ", memory_check))}}
```

### 📊 Error Pattern Analysis

#### Systematic Error Categorization

**Information Errors**:
- Missing required data in prompt blocks
- Outdated business context information  
- Incorrect Task Context from previous steps
- Incomplete conversation memory

**Logic Errors**:
- Faulty conditional statements
- Incorrect workflow transitions
- Missing state updates
- Poor error handling

**Integration Errors**:
- External system communication failures
- Data format mismatches between systems
- Timeout issues with external services
- Authentication/permission problems

**Timing Errors**:
- Race conditions between workflow steps
- Timezone miscalculations
- Session timeout issues
- Concurrent user interaction conflicts

## Preventive Debugging Strategies

### 🛡️ Robust Error Handling Patterns

#### Input Validation
```newo
{{!-- Always validate critical inputs --}}
{{#if IsEmpty(text=booking_date)}}
  {{SendMessage(message="I need the date for your reservation.")}}
  {{Return()}}
{{/if}}

{{#if IsEmpty(text=party_size)}}
  {{SendMessage(message="How many people will be dining?")}}
  {{Return()}}
{{/if}}
```

#### Fallback Logic
```newo
{{!-- Provide fallback options when primary logic fails --}}
{{Set(name="availability", value=CheckAvailability(date=booking_date, time=booking_time))}}

{{#if IsEmpty(text=availability)}}
  {{SendMessage(message="I'm having trouble checking availability. Let me transfer you to our reservations team.")}}
  {{SendSystemEvent(eventIdn="transfer_to_human", reason="availability_system_error")}}
{{else}}
  {{!-- Normal availability processing --}}
{{/if}}
```

#### State Recovery
```newo
{{!-- Recover from undefined states --}}
{{Set(name="current_stage", value=GetState(name="conversation_stage"))}}

{{#if IsEmpty(text=current_stage)}}
  {{!-- Initialize state if undefined --}}
  {{SetState(name="conversation_stage", value="greeting")}}
  {{SetState(name="collected_info", value="{}")}}
{{/if}}
```

### 📝 Documentation and Monitoring

#### Debug Logging Framework
```newo
{{!-- Structured debug logging --}}
{{Set(name="debug_log", value=AsStringJSON({
  "timestamp": GetDateTime(format="datetime"),
  "workflow": GetState(name="current_workflow"),
  "stage": GetState(name="conversation_stage"),
  "user_id": GetUser(field="id"),
  "action": "availability_check",
  "inputs": {
    "date": booking_date,
    "time": booking_time,
    "party_size": party_size
  },
  "context": GetMemory(count="3", maxLen="500")
}))}}

{{SetAKB(key=Concat("debug_", GetDateTime(format="datetime")), value=debug_log)}}
```

#### Performance Monitoring
```newo
{{!-- Track response times and success rates --}}
{{Set(name="start_time", value=GetDateTime(format="time"))}}

{{!-- Perform operation --}}
{{Set(name="result", value=CheckAvailability(date=booking_date))}}

{{Set(name="end_time", value=GetDateTime(format="time"))}}
{{Set(name="duration", value=GetDateInterval(start=start_time, end=end_time))}}

{{#if IsEmpty(text=result)}}
  {{SendSystemEvent(eventIdn="performance_alert", 
    operation="availability_check",
    duration=duration,
    status="failed"
  )}}
{{/if}}
```

## Testing and Validation

### 🧪 Systematic Testing Approach

#### Unit Testing Individual Skills
```newo
{{!-- Test skill with known inputs --}}
Test Input: {date: "2024-01-19", time: "19:00", party_size: 4}
Expected Output: List of available time slots
Actual Output: [Verify against expectation]
```

#### Integration Testing Workflows
```newo
{{!-- Test complete customer journey --}}
1. Customer greeting → Expected: Friendly welcome
2. Request collection → Expected: Date/time/party size collected
3. Availability check → Expected: Real availability data
4. Booking confirmation → Expected: Reservation created
5. Follow-up communication → Expected: Confirmation sent
```

#### Error Scenario Testing
```newo
{{!-- Test error conditions --}}
- Empty inputs: How does system respond?
- Invalid dates: Proper validation and feedback?
- System failures: Graceful fallback behavior?
- Timeout conditions: Appropriate user communication?
```

### 📈 Quality Assurance Framework

#### Response Quality Metrics
- **Accuracy**: Information correctness percentage
- **Completeness**: Required information collection rate  
- **Relevance**: Response appropriateness to user input
- **Consistency**: Uniform behavior across similar scenarios

#### Performance Benchmarks
- **Response Time**: Average time to first response
- **Resolution Rate**: Issues resolved without escalation
- **Customer Satisfaction**: CSAT scores from interactions
- **System Reliability**: Uptime and error rates

This systematic approach to troubleshooting and debugging ensures reliable Digital Employee performance and optimal customer experiences.