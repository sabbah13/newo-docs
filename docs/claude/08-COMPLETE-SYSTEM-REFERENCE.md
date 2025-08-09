---
title: "Complete System Reference: Newo SuperAgent"
---


## Project Structure Reference

### Complete Directory Hierarchy

```
newo-superagent-study/
├── flows.yaml                                # Master event configuration
│
├── project/
│   ├── ConvoAgent/                           # Primary customer interaction agent
│   │   ├── CAMainFlow/                       # Core conversation management
│   │   ├── CAScheduleFlow/                   # Booking and reservation handling
│   │   ├── CACheckingAvailabilityFlow/       # Real-time availability checking
│   │   ├── CACancellationFlow/               # Booking cancellation processing
│   │   ├── CAActionCall*Flow/                # Phone call management flows
│   │   ├── CAActionSend*Flow/                # Message sending flows
│   │   ├── CAObserverFlow/                   # Quality monitoring
│   │   ├── CAReportFlow/                     # Analytics and reporting
│   │   ├── CAThinkFlow/                      # AI reasoning
│   │   ├── CAThoughtsFlow/                   # Advanced AI decision making
│   │   ├── CADataInjectionFlow/              # External data integration
│   │   ├── CARagFlow/                        # RAG context preparation
│   │   ├── CATimezoneFlow/                   # Timezone handling
│   │   ├── CAExecuteExternalTasksFlow/       # External task coordination
│   │   ├── CAExternalReply/                  # External platform responses
│   │   ├── CAGen2*Flow/                      # Next-gen message processing
│   │   ├── CANewoToolCaller/                 # Dynamic tool selection
│   │   ├── CACalculatorFlow/                 # Pricing calculations
│   │   └── CABroadcastConversationFlow/      # Multi-agent broadcasting
│   │
│   ├── TaskManager/                          # Task orchestration and coordination
│   │   └── TMMainFlow/                       # Task management workflows
│   │
│   ├── GeneralManagerAgent/                  # System administration
│   │   └── GMMainFlow/                       # Account setup and configuration
│   │
│   ├── ApifyCheckAvailabilityWorker/         # External availability integration
│   │   └── ACAMainFlow/                      # Apify integration workflows
│   │
│   ├── MultiLocationAgent/                   # Multi-location business support
│   │   └── MLAMainFlow/                      # Location management workflows
│   │
│   ├── SmsWorker/                           # SMS communication specialist
│   │   └── SWMainFlow/                      # SMS processing workflows
│   │
│   ├── MagicWorker/                         # Advanced task processor
│   │   └── MWMainFlow/                      # Complex task workflows
│   │
│   ├── TestAgent/                           # Development and testing support
│   │   └── TAMainFlow/                      # Testing and debugging workflows
│   │
│   └── SuperAgentProject/                   # Metadata and version management
│       └── SAPMainFlow/                     # Project management workflows
│
└── claude-report/                           # This documentation
    ├── 00-EXECUTIVE-SUMMARY.md
    ├── 01-SYSTEM-ARCHITECTURE.md
    ├── 02-AGENT-DETAILED-ANALYSIS.md
    ├── 03-EVENT-SYSTEM-AND-FLOWS.md
    ├── 04-SKILL-EXECUTION-AND-LOGIC.md
    ├── 05-INTEGRATION-AND-EXTENSION-GUIDE.md
    ├── 06-INTERACTION-DIAGRAMS.md
    ├── 07-PRACTICAL-DEVELOPMENT-GUIDE.md
    └── 08-COMPLETE-SYSTEM-REFERENCE.md
```

## Agent Function Matrix

| Agent | Primary Function | Key Flows | External Integrations |
|-------|------------------|-----------|---------------------|
| ConvoAgent | Customer interaction hub | 20+ business flows | Voice, SMS, Email, Chat, APIs |
| TaskManager | Task orchestration | Task management | All worker agents |
| GeneralManagerAgent | System administration | Account setup, migrations | Business configuration systems |
| ApifyCheckAvailabilityWorker | Availability checking | Apify integration | Booking systems via Apify |
| MultiLocationAgent | Location management | Location switching | Multi-location business systems |
| SmsWorker | SMS processing | Message delivery | SMS gateways |
| MagicWorker | Complex processing | Advanced workflows | Multiple external APIs |
| TestAgent | Development support | Testing and debugging | Development tools |
| SuperAgentProject | Version control | Metadata management | Project management systems |

## Skill Type Reference

### File Extensions and Purposes

| Extension | Purpose | Processing Engine | Example Use Case |
|-----------|---------|------------------|------------------|
| .guidance | AI-powered business logic | LLM (GPT/Claude) | Customer intent analysis |
| .jinja | Data transformation | Jinja2 template engine | Response formatting |
| (none) | Schema definitions | Runtime validation | Data structure validation |

### Skill Naming Conventions

| Pattern | Meaning | Scope | Examples |
|---------|---------|-------|----------|
| SkillName | Public entry point | External access | AnalyzeConversationSkill |
| _skillName | Internal/utility | Agent internal | _validateDataSkill |
| _utilsSkillName | Shared utilities | Cross-flow reuse | _utilsGetMemorySkill |
| SchemasSkill | Data validation | Structure definition | _schemasSkill |

## Event System Reference

### Event Categories

| Category | Purpose | Integration Type | Examples |
|----------|---------|-----------------|----------|
| conversation_* | Customer interaction lifecycle | system | conversation_started, conversation_ended |
| user_*_reply | Channel-specific input | system | user_phone_reply, user_sms_reply |
| task_manager_* | Task orchestration | system | task_manager_execute_task |
| check_availability_* | Availability queries | apify | check_availability_hospitality |
| run_actor_* | External integration responses | apify | run_actor_success, run_actor_error |
| urgent_message | Priority communications | system | urgent_message |
| broadcast_* | Multi-agent coordination | system | broadcast_analyze_conversation |

### Integration Types

| Type | Purpose | Use Cases |
|------|---------|-----------|
| system | Internal agent communication | Most agent-to-agent events |
| apify | Apify platform integration | Web scraping, external data |
| api | Generic API integration | REST APIs, webhooks |
| webhook | Webhook event handling | External system callbacks |

## Business Process Reference

### Core Customer Journeys

#### 1. Appointment Booking Process
```
Customer Request → Intent Analysis → Information Gathering → 
Availability Check → Booking Creation → Confirmation → Follow-up
```

**Key Skills**:
- ConvoAgent/CAScheduleFlow/AnalyzeConversationSkill.guidance
- ConvoAgent/CACheckingAvailabilityFlow/_requestAvailableSlotsSkill.guidance
- ConvoAgent/CAScheduleFlow/_bookSkill.guidance

#### 2. Cancellation Process
```
Cancellation Request → Booking Identification → Policy Check → 
Cancellation Processing → Confirmation → Refund Processing
```

**Key Skills**:
- ConvoAgent/CACancellationFlow/_checkUserBookingsSkill.jinja
- ConvoAgent/CACancellationFlow/_cancelBookingSkill.jinja
- ConvoAgent/CACancellationFlow/_clearBookingSkill.jinja

#### 3. Information Delivery Process
```
Information Request → Request Analysis → Data Gathering → 
Format Selection → Delivery Method Selection → Message Sending
```

**Key Skills**:
- ConvoAgent/CAActionSendEmailInformationFlow/_sendEmailInformationSkill.guidance
- ConvoAgent/CAActionSendSMSInformationFlow/_sendSMSInformationSkill.guidance

### Industry-Specific Templates

#### Restaurant/Hospitality
**Configuration Skills**:
- GeneralManagerAgent/GMMainFlow/_prepareAkbCateringSkill.guidance
- GeneralManagerAgent/GMMainFlow/_prepareAkbCateringOrderDefaultScenarioSkill.guidance

**Key Features**:
- Menu integration
- Reservation management
- Special event handling
- Customer preference tracking

#### Healthcare/Dental  
**Configuration Skills**:
- GeneralManagerAgent/GMMainFlow/_prepareAkbDentalSkill.guidance
- GeneralManagerAgent/GMMainFlow/_prepareAkbDentalScheduleAppointmentAgentScenarioSkill.guidance

**Key Features**:
- Appointment scheduling
- Insurance handling
- Patient communication
- Compliance management

#### Cleaning Services
**Configuration Skills**:
- GeneralManagerAgent/GMMainFlow/_prepareAkbCleaningSkill.guidance
- GeneralManagerAgent/GMMainFlow/_prepareAkbCleaningGatherCleaningFrequencyProcedureSkill.guidance

**Key Features**:
- Service area validation
- Recurring service management
- Pricing calculations
- Quality assurance

## Technical Implementation Reference

### State Management Patterns

#### User State (Persistent)
```jinja
# Store permanent customer data
{{SetPersonaAttribute(id=user_id, field="customer_preferences", value={
    "communication_channel": "sms",
    "language": "en",
    "timezone": "America/New_York"
})}}

# Retrieve customer data
{{GetPersonaAttribute(id=user_id, field="booking_history")}}
```

#### Session State (Temporary)
```jinja
# Store conversation context
{{Set(name="conversation_stage", value="gathering_booking_info")}}
{{Set(name="collected_data", value={
    "party_size": 4,
    "preferred_date": "2024-03-15",
    "special_requests": "window seat"
})}}

# Retrieve session data
{{Get(name="current_workflow_state")}}
```

### Memory Management Patterns

#### Standard Memory Retrieval
```jinja
{{Set(name="memory", value=_utilsGetMemorySkill(
    userId=user_id,
    count=20,
    includeLatestAgentResponse=false
))}}
```

#### Filtered Memory Access
```jinja
# Get conversation turns without system messages
{{Set(name="clean_memory", value=utils_memory_get_latest_turns(
    memory=full_memory,
    turn_count=10,
    filter_type="customer_only"
))}}
```

### External Integration Patterns

#### Apify Integration
```yaml
# Event configuration for Apify
- idn: "check_availability_hospitality"
  skill_idn: "HospitalityRequestAvailableSlotsDefaultSkill"
  integration_idn: "apify"
  connector_idn: "hospitality_availability"
```

#### API Integration
```jinja
# Generic API call pattern
{{SendSystemEvent(
    eventIdn="external_api_call",
    apiEndpoint="https://api.example.com/bookings",
    method="POST",
    headers={"Authorization": "Bearer token"},
    payload=booking_data
)}}
```

## Error Handling Reference

### Error Categories and Responses

| Error Type | Handling Strategy | Customer Impact | Recovery Actions |
|------------|------------------|-----------------|------------------|
| External API timeout | Retry with backoff | Delayed response | Alternative data sources |
| Booking system unavailable | Graceful degradation | Informed delay | Manual process fallback |
| Invalid customer input | Validation and guidance | Immediate correction | Re-prompt for valid input |
| System overload | Queue management | Acknowledged delay | Load balancing |
| Integration failure | Error logging | Transparent communication | Human escalation |

### Error Handling Skills

#### Generic Error Processing
```guidance
File: _handleErrorSkill.guidance

Error Analysis:
1. Categorize error type and severity
2. Determine customer impact level  
3. Select appropriate recovery strategy
4. Generate customer communication
5. Log error for system improvement

Recovery Strategies:
- Automatic retry for transient errors
- Alternative approaches for system failures
- Human escalation for complex issues
- Clear communication for all scenarios
```

## Performance and Scaling Reference

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Response Time | &lt;3 seconds | End-to-end customer response |
| Skill Execution | &lt;500ms | Individual skill processing |
| External API Calls | &lt;10 seconds | With retry logic |
| Memory Retrieval | &lt;100ms | Conversation context loading |
| Event Processing | &lt;50ms | Inter-agent communication |

### Scaling Patterns

#### Horizontal Scaling
- Worker agent replication
- Load balancing across instances
- Stateless skill design
- Distributed event processing

#### Performance Optimization
- Conversation memory caching
- Skill result caching
- External API response caching
- Async task processing

## Security and Compliance Reference

### Security Features

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| Data encryption | All customer data encrypted at rest | Data protection |
| API authentication | Token-based authentication for all APIs | Access control |
| Input validation | All user inputs validated and sanitized | Security protection |
| Audit logging | Comprehensive logging of all actions | Compliance tracking |
| Rate limiting | API rate limits and throttling | Resource protection |

### Compliance Considerations

#### Healthcare (HIPAA)
- Patient information encryption
- Access logging and monitoring
- Secure communication channels
- Data retention policies

#### Financial Services
- PCI DSS compliance for payment data
- Enhanced authentication
- Transaction logging
- Fraud detection integration

## Monitoring and Analytics Reference

### Key Metrics

| Category | Metrics | Purpose |
|----------|---------|---------|
| Customer Experience | Response time, resolution rate, satisfaction scores | Service quality |
| System Performance | Skill execution time, error rates, availability | System health |
| Business Operations | Bookings completed, revenue generated, conversion rates | Business impact |
| Agent Performance | Task completion rate, error frequency, efficiency | Optimization |

### Logging and Analytics

#### Conversation Analytics
```guidance
File: ConvoAgent/CAEndSessionFlow/_collectMetricsSkill.guidance

Metrics Collection:
1. Conversation duration and turn count
2. Customer satisfaction indicators  
3. Business outcome achieved
4. Error frequency and types
5. Resource utilization metrics

Analytics Integration:
- Real-time dashboard updates
- Historical trend analysis
- Performance benchmarking
- Predictive analytics for optimization
```

This complete system reference provides comprehensive documentation for understanding, working with, and extending the Newo SuperAgent multi-agent conversational AI platform.
