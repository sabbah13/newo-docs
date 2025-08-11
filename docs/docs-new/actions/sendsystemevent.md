---
sidebar_position: 8
title: "SendSystemEvent"
description: "Internal system event broadcasting for workflow orchestration"
---

# SendSystemEvent

Broadcast custom system events for internal orchestration, workflow coordination, and cross-skill communication. Events trigger other skills and enable complex workflow management.

## Syntax

```newo
SendSystemEvent(
  eventIdn: str,
  actorIds: List[str] = None,
  global: Literal['true', 'false'] = 'false',
  **arguments: str
)
```

## Parameters

### Required Parameters
- **`eventIdn`** (string): Custom event identifier for routing and handling

### Optional Parameters  
- **`actorIds`** (List[str]): Target actors (defaults to current conversation actors)
- **`global`** (string): Broadcast scope
  - `'false'` (default): Send to specific actors only
  - `'true'`: System-wide broadcast to all active flows
- **`**arguments`** (string): Arbitrary event data and context

## How It Works

1. **Event Creation**: Constructs event with identifier and payload
2. **Routing**: Determines target skills based on event subscriptions
3. **Broadcasting**: Delivers event to subscribed handlers
4. **Execution**: Triggers receiving skills with event context
5. **Coordination**: Enables complex multi-skill workflows

## Event Naming Conventions

### Recommended Patterns
- `snake_case`: `booking_initiated`, `payment_processed`
- Domain prefixes: `customer_`, `booking_`, `system_`
- Action suffixes: `_started`, `_completed`, `_failed`, `_cancelled`
- Priority indicators: `urgent_`, `priority_`, `background_`

### Event Categories
```newo
# Workflow Events
booking_initiated
booking_completed
booking_cancelled

# System Events  
session_started
session_ended
error_occurred

# Customer Events
customer_registered
customer_updated
customer_escalated

# Integration Events
external_api_called
timer_triggered
notification_sent
```

## Basic Usage Examples

### Workflow Coordination
```newo
{{!-- Initiate booking workflow --}}
{{SendSystemEvent(
  eventIdn="booking_flow_started",
  customer_id=GetUser(field="id"),
  service_type="restaurant_reservation",
  priority="normal",
  initiated_by="customer_request"
)}}

{{!-- Complete booking step --}}
{{SendSystemEvent(
  eventIdn="booking_step_completed",
  step_name="date_selection",
  selected_date=chosen_date,
  next_step="time_selection"
)}}
```

### Error Handling and Escalation
```newo
{{!-- Handle system errors --}}
{{Set(name="error_count", value=GetState(name="consecutive_errors"))}}

{{#if IsEmpty(text=error_count)}}
  {{Set(name="error_count", value="0")}}
{{/if}}

{{Set(name="new_error_count", value=Add(a=error_count, b="1"))}}
{{SetState(name="consecutive_errors", value=new_error_count)}}

{{#if GreaterThan(a=new_error_count, b="3")}}
  {{SendSystemEvent(
    eventIdn="escalate_to_human",
    reason="multiple_consecutive_errors",
    error_count=new_error_count,
    customer_id=GetUser(field="id"),
    global="true"
  )}}
{{else}}
  {{SendSystemEvent(
    eventIdn="retry_operation",
    attempt_number=new_error_count,
    operation_context=current_operation
  )}}
{{/if}}
```

### Customer Journey Tracking
```newo
{{!-- Track customer journey milestones --}}
{{SendSystemEvent(
  eventIdn="customer_milestone_reached",
  milestone="first_contact",
  customer_id=GetUser(field="id"),
  channel=GetActor(field="integrationIdn"),
  timestamp=GetDateTime(),
  context=GetMemory(count="5", summarize="true")
)}}

{{!-- Track conversion events --}}
{{SendSystemEvent(
  eventIdn="conversion_event",
  event_type="booking_completed",
  revenue_impact=booking_value,
  conversion_path=customer_journey,
  attribution_source=GetPersonaAttribute(id=GetUser(field="id"), field="source")
)}}
```

## Advanced Event Patterns

### Event Chaining
```newo
{{!-- Chain events for complex workflows --}}
{{SendSystemEvent(
  eventIdn="data_validation_started",
  data_type="customer_information",
  validation_rules=["phone_format", "email_format", "required_fields"]
)}}

{{!-- Validation complete event (triggered by validation skill) --}}
{{SendSystemEvent(
  eventIdn="data_validation_completed",
  validation_result="passed",
  validated_data=customer_data,
  next_action="initiate_booking_process"
)}}

{{!-- Booking process event (triggered by booking skill) --}}
{{SendSystemEvent(
  eventIdn="booking_process_initiated",
  booking_type="standard",
  customer_data=validated_customer_data,
  estimated_completion_time=GetDateInterval(start=GetDateTime(), offset="+10m")
)}}
```

### Conditional Event Broadcasting
```newo
{{!-- Send events based on business rules --}}
{{Set(name="customer_tier", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="loyalty_tier"
))}}

{{Set(name="booking_value", value=GetState(name="current_booking_value"))}}

{{#if IsSimilar(text1=customer_tier, text2="VIP")}}
  {{SendSystemEvent(
    eventIdn="vip_booking_alert",
    customer_id=GetUser(field="id"),
    booking_value=booking_value,
    priority="high",
    requires_manager_approval="true",
    global="true"
  )}}
{{else if GreaterThan(a=booking_value, b="1000")}}
  {{SendSystemEvent(
    eventIdn="high_value_booking_alert",
    booking_value=booking_value,
    customer_tier=customer_tier,
    requires_verification="true"
  )}}
{{else}}
  {{SendSystemEvent(
    eventIdn="standard_booking_initiated",
    booking_value=booking_value
  )}}
{{/if}}
```

### Global Event Broadcasting
```newo
{{!-- System-wide maintenance alerts --}}
{{SendSystemEvent(
  eventIdn="system_maintenance_alert",
  maintenance_type="scheduled",
  start_time="2024-02-01T02:00:00Z",
  duration_hours="2",
  affected_services=["booking_system", "payment_processor"],
  global="true"
)}}

{{!-- Emergency notifications --}}
{{SendSystemEvent(
  eventIdn="emergency_system_shutdown",
  reason="security_incident",
  severity="critical",
  immediate_action_required="true",
  global="true"
)}}
```

## Event Data Patterns

### Structured Event Payloads
```newo
{{!-- Create comprehensive event data --}}
{{Set(name="event_payload", value=CreateObject(
  event_metadata=CreateObject(
    timestamp=GetDateTime(),
    source_skill="booking_handler",
    correlation_id=Random(min=100000, max=999999),
    version="1.0"
  ),
  customer_context=CreateObject(
    customer_id=GetUser(field="id"),
    customer_name=GetUser(field="name"),
    channel=GetActor(field="integrationIdn"),
    session_duration=GetState(name="session_start_time")
  ),
  business_data=CreateObject(
    booking_type="restaurant",
    party_size="4",
    requested_date=user_date_input,
    special_requirements=special_requests
  )
))}}

{{SendSystemEvent(
  eventIdn="comprehensive_booking_event",
  payload=Stringify(event_payload)
)}}
```

### Event Versioning
```newo
{{!-- Version events for backward compatibility --}}
{{SendSystemEvent(
  eventIdn="booking_event_v2",
  schema_version="2.1",
  deprecated_fields=CreateArray("old_field_1", "old_field_2"),
  customer_data=customer_info,
  booking_data=booking_info,
  compatibility_mode="enabled"
)}}
```

## Integration with External Systems

### API Webhook Triggers
```newo
{{!-- Trigger external webhooks via events --}}
{{SendSystemEvent(
  eventIdn="external_webhook_trigger",
  webhook_url="https://external-system.com/webhook",
  webhook_data=CreateObject(
    event_type="booking_confirmed",
    customer_id=GetUser(field="id"),
    booking_reference=booking_id,
    timestamp=GetDateTime()
  ),
  retry_policy="exponential_backoff",
  timeout_seconds="30"
)}}
```

### Third-Party Notifications
```newo
{{!-- Notify external CRM system --}}
{{SendSystemEvent(
  eventIdn="crm_customer_update",
  crm_system="salesforce",
  customer_record_id=GetPersonaAttribute(id=GetUser(field="id"), field="crm_id"),
  update_fields=CreateObject(
    last_interaction=GetDateTime(),
    interaction_channel=GetActor(field="integrationIdn"),
    booking_status="confirmed",
    revenue_impact=booking_value
  )
)}}
```

## Performance Considerations

### Event Batching
```newo
{{!-- Batch multiple related events --}}
{{Set(name="batch_events", value=CreateArray())}}

{{!-- Collect events --}}
{{Set(name="batch_events", value=AppendItemsArrayJSON(
  array=batch_events,
  items=[CreateObject(
    eventIdn="customer_action",
    action="clicked_menu_item",
    item_id="appetizer_1"
  )]
))}}

{{Set(name="batch_events", value=AppendItemsArrayJSON(
  array=batch_events,
  items=[CreateObject(
    eventIdn="customer_action",
    action="viewed_details",
    item_id="appetizer_1"
  )]
))}}

{{!-- Send batch --}}
{{SendSystemEvent(
  eventIdn="customer_action_batch",
  events=Stringify(batch_events),
  batch_size=Len(array=batch_events)
)}}
```

### Asynchronous Event Processing
```newo
{{!-- Fire-and-forget events for non-critical operations --}}
{{SendSystemEvent(
  eventIdn="analytics_tracking",
  event_type="user_interaction",
  interaction_data=analytics_data,
  processing_priority="background",
  async="true"
)}}
```

## Event-Driven Architecture

### Event Subscription Pattern
```newo
{{!-- Events that trigger specific skill flows --}}

{{!-- Event: booking_payment_required --}}
{{!-- Triggers: PaymentProcessingSkill --}}
{{SendSystemEvent(
  eventIdn="booking_payment_required",
  booking_id=current_booking_id,
  amount=total_amount,
  currency="USD",
  payment_methods=accepted_methods
)}}

{{!-- Event: payment_processing_completed --}}
{{!-- Triggers: BookingConfirmationSkill --}}
{{SendSystemEvent(
  eventIdn="payment_processing_completed",
  payment_id=payment_transaction_id,
  booking_id=current_booking_id,
  status="success",
  receipt_url=receipt_link
)}}
```

### State Change Events
```newo
{{!-- Emit events on state transitions --}}
{{Set(name="previous_state", value=GetState(name="conversation_state"))}}
{{SetState(name="conversation_state", value="booking_confirmed")}}

{{SendSystemEvent(
  eventIdn="conversation_state_changed",
  previous_state=previous_state,
  new_state="booking_confirmed",
  trigger_reason="payment_completed",
  state_data=GetState(name="booking_details")
)}}
```

## Monitoring and Analytics

### Event Logging
```newo
{{!-- Log events for analytics --}}
{{SendSystemEvent(
  eventIdn="event_logger",
  log_type="business_metric",
  metric_name="booking_conversion",
  metric_value="1",
  dimensions=CreateObject(
    customer_segment=customer_tier,
    booking_channel=GetActor(field="integrationIdn"),
    time_to_convert=GetDateInterval(
      start=GetState(name="session_start"),
      end=GetDateTime()
    )
  )
)}}
```

### Performance Monitoring
```newo
{{!-- Track skill execution performance --}}
{{Set(name="skill_start_time", value=GetDateTime(format="timestamp"))}}

{{!-- ... skill logic ... --}}

{{Set(name="skill_end_time", value=GetDateTime(format="timestamp"))}}
{{Set(name="execution_duration", value=Subtract(a=skill_end_time, b=skill_start_time))}}

{{SendSystemEvent(
  eventIdn="skill_performance_metric",
  skill_name="booking_handler",
  execution_time_ms=execution_duration,
  success="true",
  resource_usage=CreateObject(
    memory_operations=memory_call_count,
    api_calls=external_api_count,
    state_operations=state_operation_count
  )
)}}
```

## Error Handling

### Event Delivery Failures
```newo
{{!-- Handle event delivery issues --}}
{{Set(name="event_result", value=SendSystemEvent(
  eventIdn="critical_business_event",
  data=important_data
))}}

{{#if IsEmpty(text=event_result)}}
  {{!-- Store for retry --}}
  {{SetState(name="failed_events", value=AppendItemsArrayJSON(
    array=GetState(name="failed_events"),
    items=[CreateObject(
      eventIdn="critical_business_event",
      data=important_data,
      failed_at=GetDateTime(),
      retry_count="0"
    )]
  ))}}
{{/if}}
```

### Event Validation
```newo
{{!-- Validate before sending critical events --}}
{{Set(name="required_fields", value=CreateArray("customer_id", "booking_id", "amount"))}}
{{Set(name="validation_passed", value="true")}}

{{#each required_fields}}
  {{Set(name="field_value", value=GetValueJSON(obj=event_data, key=this))}}
  {{#if IsEmpty(text=field_value)}}
    {{Set(name="validation_passed", value="false")}}
    {{SendSystemEvent(
      eventIdn="event_validation_failed",
      missing_field=this,
      event_type="payment_processed"
    )}}
  {{/if}}
{{/each}}

{{#if IsSimilar(text1=validation_passed, text2="true")}}
  {{SendSystemEvent(
    eventIdn="payment_processed",
    customer_id=customer_id,
    booking_id=booking_id,
    amount=payment_amount
  )}}
{{/if}}
```

## Workflow Orchestration

### Sequential Workflow
```newo
{{!-- Step 1: Start data collection --}}
{{SendSystemEvent(
  eventIdn="data_collection_required",
  required_fields=CreateArray("name", "phone", "email", "preferences"),
  collection_method="conversational",
  timeout_minutes="10"
)}}

{{!-- Step 2: Validate collected data (triggered by data collection completion) --}}
{{SendSystemEvent(
  eventIdn="data_validation_required", 
  collected_data=customer_form_data,
  validation_rules=validation_schema,
  strict_validation="true"
)}}

{{!-- Step 3: Process booking (triggered by validation success) --}}
{{SendSystemEvent(
  eventIdn="booking_processing_required",
  validated_customer_data=validated_data,
  booking_preferences=customer_preferences,
  processing_priority="standard"
)}}
```

### Parallel Workflow
```newo
{{!-- Trigger multiple parallel processes --}}
{{SendSystemEvent(
  eventIdn="parallel_booking_tasks",
  tasks=CreateArray(
    "availability_check",
    "customer_notification", 
    "calendar_update",
    "payment_processing"
  ),
  booking_id=current_booking_id,
  coordination_required="true"
)}}

{{!-- Each task sends completion event --}}
{{SendSystemEvent(
  eventIdn="parallel_task_completed",
  task_name="availability_check",
  task_result="available",
  booking_id=current_booking_id,
  completion_time=GetDateTime()
)}}
```

### Conditional Workflows
```newo
{{!-- Branch workflow based on customer type --}}
{{Set(name="customer_type", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="customer_type"
))}}

{{#if IsSimilar(text1=customer_type, text2="enterprise")}}
  {{SendSystemEvent(
    eventIdn="enterprise_booking_workflow",
    requires_approval="true",
    approval_level="manager",
    booking_data=booking_details
  )}}
{{else if IsSimilar(text1=customer_type, text2="vip")}}
  {{SendSystemEvent(
    eventIdn="vip_booking_workflow", 
    priority="high",
    concierge_assigned="true",
    booking_data=booking_details
  )}}
{{else}}
  {{SendSystemEvent(
    eventIdn="standard_booking_workflow",
    processing_tier="standard",
    booking_data=booking_details
  )}}
{{/if}}
```

## Real-Time Coordination

### Live Status Updates
```newo
{{!-- Provide real-time booking status --}}
{{SendSystemEvent(
  eventIdn="booking_status_update",
  booking_id=current_booking_id,
  status="processing",
  progress_percentage="45",
  estimated_completion=GetDateInterval(start=GetDateTime(), offset="+5m"),
  status_message="Checking availability..."
)}}
```

### Resource Coordination
```newo
{{!-- Coordinate shared resources --}}
{{SendSystemEvent(
  eventIdn="resource_reservation_request",
  resource_type="payment_processor",
  requested_by=GetAgent(field="id"),
  duration_minutes="5",
  priority="normal",
  booking_context=current_booking_data
)}}

{{!-- Release resources --}}
{{SendSystemEvent(
  eventIdn="resource_released",
  resource_type="payment_processor",
  released_by=GetAgent(field="id"),
  operation_result="success"
)}}
```

## Analytics and Business Intelligence

### Business Metrics
```newo
{{!-- Track key business metrics --}}
{{SendSystemEvent(
  eventIdn="business_metric_update",
  metric_category="revenue",
  metric_name="booking_revenue",
  metric_value=booking_amount,
  dimensions=CreateObject(
    service_type=service_category,
    customer_segment=customer_tier,
    booking_channel=GetActor(field="integrationIdn"),
    time_period=GetDateTime(format="date"),
    agent_performance=GetAgent(field="performance_rating")
  )
)}}
```

### Customer Behavior Analytics
```newo
{{!-- Track customer behavior patterns --}}
{{SendSystemEvent(
  eventIdn="customer_behavior_event",
  behavior_type="preference_expressed",
  preference_category="dining",
  preference_value="vegetarian",
  confidence_score="high",
  context=GetMemory(count="3", summarize="true"),
  customer_profile=GetPersona(id=GetUser(field="id"))
)}}
```

## Event Security

### Sensitive Data Handling
```newo
{{!-- Handle events with sensitive data --}}
{{Set(name="sanitized_payment_data", value=CreateObject(
  payment_method="****1234",  # Masked card number
  amount=payment_amount,
  currency="USD",
  transaction_reference=transaction_id
))}}

{{SendSystemEvent(
  eventIdn="payment_processed_secure",
  payment_summary=sanitized_payment_data,
  customer_id=GetUser(field="id"),
  security_level="high",
  audit_required="true"
)}}
```

### Access Control Events
```newo
{{!-- Log access control decisions --}}
{{SendSystemEvent(
  eventIdn="access_control_decision",
  requested_action="view_booking_details",
  requesting_user=GetUser(field="id"),
  target_resource=booking_id,
  access_granted="true",
  authorization_level="customer_own_data",
  compliance_framework="GDPR"
)}}
```

## Limitations

- **Event Ordering**: No guaranteed delivery order for multiple events
- **Delivery Confirmation**: No built-in acknowledgment mechanism
- **Event Size**: Large payloads may impact performance
- **Global Events**: Use sparingly to avoid system overload
- **Circular Events**: Risk of infinite loops with poor event design

## Troubleshooting

### Event Debugging
```newo
{{!-- Debug event flow --}}
{{SendSystemEvent(
  eventIdn="debug_event_trace",
  trace_id=Random(min=100000, max=999999),
  source_skill="current_skill",
  event_chain=GetState(name="event_history"),
  debug_data=CreateObject(
    current_state=GetState(name="conversation_state"),
    user_context=GetUser(),
    memory_summary=GetMemory(count="5", summarize="true")
  )
)}}
```

### Event Monitoring
```newo
{{!-- Monitor event processing health --}}
{{SendSystemEvent(
  eventIdn="event_health_check",
  health_status="active",
  events_processed_count=GetState(name="events_processed"),
  last_successful_event=GetState(name="last_successful_event"),
  error_rate=GetState(name="event_error_rate")
)}}
```

## Related Actions

- **action** - Direct user communication
- **action** - External system integration
- **action** - Store event data persistently
- **action** - Include conversation context in events
- **action** - Create event target actors