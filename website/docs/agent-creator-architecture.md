---
slug: agent-creator-architecture  
sidebar_position: 16
title: "Agent Creator Architecture"
description: "Deep dive into the technical architecture, components, and data flow of the Newo Agent Creator system"
---

# Agent Creator Architecture

This document provides a comprehensive technical overview of the Newo Agent Creator's architecture, including component interactions, data flow patterns, and implementation details.

## System Architecture Overview

The Agent Creator follows a **multi-agent, event-driven architecture** with sophisticated AI orchestration and external service integration.

```mermaid
graph TB
    subgraph "Agent Creator System"
        subgraph "Creator Agent"
            CCF[CACreateCustomerFlow]
            CF[CACreatorFlow<br/>5-Stage Process]
            SDF[CAScrapingDataFlow]
        end
        
        subgraph "Installer Agent"
            IF[InstallFlow]
        end
        
        subgraph "Test Agent"
            TF[TestFlow]
        end
    end
    
    subgraph "Core Services"
        ES[Event System]
        SM[State Manager]
        QM[Queue Manager]
    end
    
    subgraph "AI Processing Layer"
        GPT4O[GPT-4o]
        GPT4OS[GPT-4o Search]
        GPT4OSO[GPT-4o Structured]
        O1[O1 Model]
        O3[O3 Model]
    end
    
    subgraph "External Integrations"
        NC[Newo Chat]
        AP[Apify Scraping]
        SMS[SMS Service]
        EM[Email Service]
        WH[Webhooks/APIs]
        PP[PartnerPage]
        KL[Klaviyo]
    end
    
    CF --> ES
    SDF --> QM
    CCF --> SM
    IF --> SM
    
    ES --> GPT4O
    ES --> GPT4OS
    ES --> GPT4OSO
    ES --> O1
    ES --> O3
    
    CF --> NC
    SDF --> AP
    CF --> SMS
    CF --> EM
    CF --> WH
    CF --> PP
    CF --> KL
```

## Component Deep Dive

### Creator Agent Architecture

The Creator Agent implements a **hierarchical flow structure** with specialized responsibilities:

```mermaid
graph LR
    subgraph "CACreatorFlow - Main Orchestrator"
        subgraph "Public Skills"
            GD[GetData]
            GA[GetAgentInfo]  
            CC[CreateCustomer]
            SF[Stage0-4Finished]
            OF[OnboardingFinishedSkill]
        end
        
        subgraph "Stage Execution Skills"
            RS[_run_stage]
            RS0[_run_stage_0]
            RS1[_run_stage_1]  
            RS2[_run_stage_2]
            RS3[_run_stage_3]
            RS4[_run_stage_4]
        end
        
        subgraph "Data Processing Skills"
            BP[_build_prompt]
            BJS[_build_json_schema]
            FT[_fill_template]
            MS[_merge_steps]
        end
        
        subgraph "Value Extraction Skills"
            GVBn[_get_value_business_name]
            GVAn[_get_value_agent_name]
            GVIn[_get_value_industry] 
            GVLg[_get_value_language]
            GVCt[_get_value_country]
            GVVm[_get_value_voice_model]
            GVMore["... 15+ more value extractors"]
        end
        
        subgraph "Communication Skills"
            SWE[_send_welcome_email]
            BWE[_build_welcome_email]
            MMP[_menu_prompt_preparation]
        end
    end
    
    GD --> RS
    RS --> RS0
    RS --> RS1
    RS --> RS2  
    RS --> RS3
    RS --> RS4
    
    RS --> BP
    BP --> FT
    
    OF --> GVBn
    OF --> GVAn
    OF --> GVIn
    
    OF --> SWE
    SWE --> BWE
```

### Data Scraping Flow Architecture

The `CAScrapingDataFlow` implements a **queue-based, AI-powered processing pipeline**:

```mermaid
graph TB
    subgraph "Task Queue Management"
        TQ[task_queue State Field]
        ENQ[_enqueue Skill]
        DEQ[_dequeue Skill]
    end
    
    subgraph "Question Processing Pipeline"
        AQ[AskQuestion Skill]
        TAQ[_tryAskQuestion]
        PWM[ProcessWorkingMessage]
    end
    
    subgraph "AI Answer Generation"
        GAD[_gen_answer_default<br/>O3 Model]
        GA4[_gen_answer_gpt4o<br/>GPT-4o]  
        GASP[_gen_answer_gpt4o_search_preview<br/>GPT-4o Search]
        GASO[_gen_answer_gpt4o_structured_output<br/>GPT-4o Structured]
    end
    
    subgraph "Validation & Processing"
        CA[_check_answer<br/>O1 Model]
        SAN[_sanitize]
        UES[_unescapeStringSkill]
        VI[_validate_industry]
    end
    
    subgraph "Data Retrieval"
        RD[RetrieveData]
        GPSI[_getGooglePlaceScrapingInput]
        GWSI[_getWebsiteScrapingInput] 
        GIDU[_getIsDataUpdated]
    end
    
    ENQ --> TQ
    TQ --> DEQ
    DEQ --> AQ
    
    AQ --> GAD
    AQ --> GA4
    AQ --> GASP
    AQ --> GASO
    
    GAD --> CA
    GA4 --> CA
    GASP --> CA
    GASO --> CA
    
    CA --> SAN
    SAN --> UES
    UES --> VI
    
    PWM --> RD
    RD --> GPSI
    RD --> GWSI
    RD --> GIDU
    
    AQ --> TAQ
    TAQ --> AQ
```

## Event-Driven Orchestration

### Event Flow Mapping

The system uses **12 major events** to coordinate workflow execution:

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant CF as CACreatorFlow  
    participant SDF as CAScrapingDataFlow
    participant AI as AI Models
    participant EXT as External APIs
    
    UI->>CF: onboarding_started
    CF->>CF: GetData skill execution
    CF->>SDF: scraping_worker_message (set_scraping_data)
    SDF->>EXT: Trigger Apify scraping
    
    EXT->>SDF: run_actor_success/error  
    SDF->>SDF: RetrieveData skill
    SDF->>SDF: _enqueue tasks to task_queue
    
    SDF->>SDF: _ask_question event
    SDF->>SDF: AskQuestion skill (_dequeue)
    SDF->>AI: Generate answer (multiple models)
    AI->>SDF: Response
    SDF->>AI: Validate answer (O1 model)
    AI->>SDF: Validated response
    
    SDF->>CF: stage_0_scraping_finished
    CF->>CF: Stage0Finished skill
    CF->>SDF: Stage 1 processing...
    
    Note over SDF,CF: Repeat for Stages 1-4
    
    SDF->>CF: stage_4_scraping_finished  
    CF->>CF: Stage4Finished skill
    CF->>CF: create_customer_finished
    CF->>CF: OnboardingFinishedSkill
    CF->>UI: Onboarding complete
```

### State Management Architecture

```mermaid
graph TB
    subgraph "User State Management"
        subgraph "Persona Attributes"
            SRC[source & source_type]
            BIZ[business_info model]
            AGT[agent_info model] 
            CUST[customer_info model]
            PREF[preferences_info model]
            CONT[contact_info model]
        end
        
        subgraph "Process State"
            STATE[state: parsing/created]
            SCRAPER[scraper_type: website/google_place]
            STAGE[current_stage: 0-4]
        end
        
        subgraph "Queue State"  
            TQ[task_queue: JSON array]
            STEPS[stage_steps: JSON models]
        end
    end
    
    subgraph "Configuration State"
        SETTINGS[Global Settings]
        STAGES_CFG[Stages Configuration] 
        PROMPTS[Prompt Templates]
        HEADERS[Source Prompt Headers]
    end
    
    SRC --> BIZ
    BIZ --> AGT
    AGT --> CUST
    CUST --> PREF
    PREF --> CONT
    
    STATE --> SCRAPER
    SCRAPER --> STAGE
    
    TQ --> STEPS
    
    SETTINGS --> STAGES_CFG
    STAGES_CFG --> PROMPTS
    PROMPTS --> HEADERS
```

## AI Model Integration Strategy

### Model Selection Matrix

The system employs **5 different AI models** with specific use cases:

| Model | Use Case | Optimization | Skills Using |
|-------|----------|--------------|-------------|
| **GPT-4o** | General reasoning, text processing | Speed & versatility | 90% of skills |
| **GPT-4o Search Preview** | Web-enhanced queries | Real-time data access | AskQuestion |
| **GPT-4o Structured Output** | JSON schema compliance | Data consistency | _gen_answer_gpt4o_structured_output |
| **O1** | Complex validation & reasoning | Accuracy & logic | _check_answer |
| **O3** | Advanced reasoning tasks | Deep analysis | _gen_answer_default |

### Dynamic Model Selection

```mermaid
graph TB
    subgraph "Model Selection Logic"
        TASK[Incoming Task]
        
        TASK --> SCHEMA{JSON Schema<br/>Required?}
        SCHEMA -->|Yes| STRUCTURED[GPT-4o Structured Output]
        
        SCHEMA -->|No| SEARCH{Web Search<br/>Required?}
        SEARCH -->|Yes| PREVIEW[GPT-4o Search Preview]
        
        SEARCH -->|No| COMPLEX{Complex<br/>Validation?}
        COMPLEX -->|Yes| O1MODEL[O1 Model]
        
        COMPLEX -->|No| ADVANCED{Advanced<br/>Reasoning?}
        ADVANCED -->|Yes| O3MODEL[O3 Model]
        
        ADVANCED -->|No| DEFAULT[GPT-4o Standard]
    end
    
    subgraph "Processing Pipeline"
        STRUCTURED --> VALIDATE[Answer Validation]
        PREVIEW --> VALIDATE
        O1MODEL --> VALIDATE
        O3MODEL --> VALIDATE  
        DEFAULT --> VALIDATE
        
        VALIDATE --> SANITIZE[Data Sanitization]
        SANITIZE --> STORE[State Storage]
    end
```

## Data Processing Pipeline

### Template Processing Architecture

```mermaid
graph LR
    subgraph "Template Processing Engine"
        subgraph "Input Processing"
            UT[User Trigger]
            TA[Triggered Arguments]
            GSA[GetSettingsAttribute]
        end
        
        subgraph "Template Engine"
            JT[Jinja2 Templates]
            FT[_fill_template]
            BP[_build_prompt]
            BJS[_build_json_schema]
        end
        
        subgraph "Context Building"  
            PA[Persona Attributes]
            SM[State Management]
            QP[Question Prompts]
            PH[Prompt Headers]
        end
        
        subgraph "AI Processing"
            AP[AI Prompt]
            AR[AI Response] 
            AV[Answer Validation]
            DS[Data Storage]
        end
    end
    
    UT --> TA
    TA --> GSA
    GSA --> JT
    
    JT --> FT
    FT --> BP
    BP --> BJS
    
    PA --> QP
    SM --> QP
    QP --> PH
    
    PH --> AP
    AP --> AR
    AR --> AV
    AV --> DS
```

### Queue-Based Processing

The system implements **asynchronous task processing** using state-managed queues:

```mermaid
stateDiagram-v2
    [*] --> TaskEnqueue
    
    TaskEnqueue --> QueueProcessing : _enqueue(task)
    QueueProcessing --> TaskDequeue : task available
    TaskDequeue --> AIProcessing : _dequeue(task)
    
    AIProcessing --> ModelSelection : question ready
    ModelSelection --> AnswerGeneration : model selected
    AnswerGeneration --> AnswerValidation : response received
    
    AnswerValidation --> ValidationPassed : O1 model check
    AnswerValidation --> ValidationFailed : validation error
    
    ValidationPassed --> DataStorage : sanitized answer
    ValidationFailed --> AIProcessing : retry with different model
    
    DataStorage --> StageComplete : all questions answered
    DataStorage --> QueueProcessing : more questions pending
    
    StageComplete --> NextStage : trigger next stage event
    NextStage --> QueueProcessing : new stage questions
    
    StageComplete --> [*] : final stage complete
```

## Integration Architecture

### External Service Coordination  

```mermaid
graph TB
    subgraph "Integration Layer"
        subgraph "Communication Services"
            NC[Newo Chat<br/>User Interface]
            SMS[SMS Service<br/>Notifications]
            EM[Email Service<br/>Welcome emails]
        end
        
        subgraph "Data Services"
            AP[Apify<br/>Web Scraping]
            GP[Google Places<br/>Business Data]
            WS[Website Scraping<br/>Business Info]
        end
        
        subgraph "Business Services"
            KL[Klaviyo<br/>CRM Integration]  
            PP[PartnerPage<br/>Lead Management]
            WH[Webhooks<br/>Custom APIs]
        end
        
        subgraph "System Services"
            SYS[System Events<br/>Internal coordination]
            API[API Connectors<br/>External integration]  
            INST[Installer<br/>System setup]
        end
    end
    
    subgraph "Creator Agent Integration Points"
        CF[CACreatorFlow]
        SDF[CAScrapingDataFlow]  
        CCF[CACreateCustomerFlow]
    end
    
    CF --> NC
    CF --> SMS
    CF --> EM
    CF --> KL
    CF --> PP
    CF --> WH
    
    SDF --> AP
    SDF --> GP
    SDF --> WS
    
    CCF --> SYS
    
    CF --> SYS
    SDF --> API
    
    SYS --> INST
```

### Command & Event Architecture

The system uses **bidirectional communication** between internal components and external services:

```mermaid
sequenceDiagram
    participant CF as CACreatorFlow
    participant SDF as CAScrapingDataFlow  
    participant SYS as System Events
    participant EXT as External Services
    participant UI as User Interface
    
    Note over CF,UI: Outbound Commands
    CF->>+EXT: SendCommand (notify_adrian, push_data_make_klaviyo)
    CF->>+UI: SendCommand (notify_scraping_step)
    CF->>+EXT: SendCommand (send_request to PartnerPage)
    
    Note over CF,UI: System Events
    CF->>+SYS: SendSystemEvent (scraping_worker_message)
    SDF->>+SYS: SendSystemEvent (stage_X_scraping_finished)
    CF->>+SYS: SendSystemEvent (create_customer_finished)
    
    Note over CF,UI: Inbound Events  
    SYS->>+CF: onboarding_started
    SYS->>+SDF: _ask_question
    EXT->>+SDF: run_actor_success/error
    UI->>+CF: agent_request
    UI->>+CF: create_customer
```

## Performance & Scalability Considerations

### Asynchronous Processing Design

- **Queue-based task management** prevents blocking operations
- **Event-driven architecture** enables loose coupling and scalability
- **State persistence** allows for crash recovery and session continuity
- **AI model load balancing** through intelligent model selection

### Resource Optimization

- **Template caching** for frequently used prompts and schemas
- **State field optimization** for minimal storage overhead  
- **Conditional processing** to avoid unnecessary AI calls
- **Error handling** with exponential backoff for external services

---

This architecture demonstrates advanced AI orchestration patterns, sophisticated state management, and comprehensive integration capabilities, making it a robust foundation for enterprise-grade AI agent creation systems.