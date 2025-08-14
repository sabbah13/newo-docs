---
slug: agent-creator-diagrams
sidebar_position: 18
title: "Agent Creator System Diagrams"
description: "Comprehensive visual diagrams explaining the Newo Agent Creator system from high-level concepts to technical implementation details"
---

# Agent Creator System Diagrams

This page provides comprehensive visual diagrams that explain the Newo Agent Creator system from business concepts to technical implementation details. The diagrams progress from high-level understanding to detailed technical architecture.

## High-Level System Overview

### Business Process Flow

This diagram shows how customers interact with the Agent Creator system from a business perspective:

```mermaid
graph TB
    subgraph "Customer Journey"
        START[Customer Starts Onboarding] 
        URL[Provides Website/Business URL]
        SCRAPE[System Scrapes Business Data]
        STAGES[5-Stage AI-Powered Questionnaire]
        REVIEW[Review & Confirm Agent Details]
        DEPLOY[Agent Deployed & Ready]
    end
    
    subgraph "AI Processing"
        AI1[Stage 0: Basic Business Info]
        AI2[Stage 1: Detailed Business Data]
        AI3[Stage 2: Agent Personality]
        AI4[Stage 3: Communication Setup]
        AI5[Stage 4: Final Configuration]
    end
    
    subgraph "System Outputs"
        AGENT[Custom AI Agent]
        PHONE[Phone Number Setup]
        VOICE[Voice Model Configured]
        INTEGRATIONS[Business Integrations]
        WELCOME[Welcome Communications]
    end
    
    START --> URL
    URL --> SCRAPE
    SCRAPE --> STAGES
    
    STAGES --> AI1
    AI1 --> AI2
    AI2 --> AI3
    AI3 --> AI4
    AI4 --> AI5
    
    AI5 --> REVIEW
    REVIEW --> DEPLOY
    
    DEPLOY --> AGENT
    DEPLOY --> PHONE
    DEPLOY --> VOICE
    DEPLOY --> INTEGRATIONS
    DEPLOY --> WELCOME
    
    style START fill:#e1f5fe
    style DEPLOY fill:#c8e6c9
    style AGENT fill:#fff3e0
```

### System Capabilities Overview

This diagram illustrates the core capabilities and customization options available in the Agent Creator:

```mermaid
mindmap
  root((Newo Agent Creator))
    Data Collection
      Website Scraping
      Google Maps Integration
      Business Information
      Contact Details
      Services & Products
      
    AI Orchestration
      Multi-Model Strategy
        GPT-4o Standard
        GPT-4o Search
        GPT-4o Structured
        O1 Validation
        O3 Advanced Reasoning
      Dynamic Prompting
      Answer Validation
      
    Agent Customization
      Business-Aligned Personality
      Industry-Specific Language
      Communication Style
      Voice Model Selection
      Multi-Language Support
      
    Integration Ecosystem
      Communication Channels
        SMS Integration
        Email Services
        Chat Interfaces
      Business Systems
        CRM Integration
        Lead Management
        Webhook APIs
      Telephony
        Phone Number Setup
        Voice Configuration
        Call Routing
        
    Workflow Management
      5-Stage Process
      Configurable Steps
      Progress Tracking
      Quality Validation
      Error Handling
```

## System Architecture Diagrams

### Multi-Agent Architecture

This diagram shows how the three specialized agents work together:

```mermaid
graph TB
    subgraph "Agent Creator System"
        subgraph "Creator Agent - Main Orchestrator"
            CA[Creator Agent]
            CACF[Customer Creation Flow]
            CACRF[Main Creator Flow]
            CASF[Scraping Data Flow]
        end
        
        subgraph "Installer Agent - System Setup"
            IA[Installer Agent] 
            IF[Install Flow]
        end
        
        subgraph "Test Agent - Quality Assurance"
            TA[Test Agent]
            TF[Test Flow]
        end
    end
    
    subgraph "Core Infrastructure"
        ES[Event System]
        SM[State Manager]
        QM[Queue Manager]
        TP[Template Processor]
    end
    
    subgraph "AI Processing Layer"
        GPT4O[GPT-4o Models]
        O1[O1 Model]
        O3[O3 Model]
        MS[Model Selector]
    end
    
    subgraph "External Integrations"
        UI[User Interface]
        SCRAPING[Scraping Services]
        COMMS[Communication Services]
        APIS[Business APIs]
    end
    
    CA --> ES
    IA --> SM
    TA --> QM
    
    ES --> TP
    SM --> TP
    QM --> TP
    
    TP --> MS
    MS --> GPT4O
    MS --> O1
    MS --> O3
    
    CA --> UI
    CA --> SCRAPING
    CA --> COMMS
    CA --> APIS
    
    style CA fill:#ffeb3b
    style IA fill:#4caf50
    style TA fill:#2196f3
```

### Data Flow Architecture

This diagram illustrates how data flows through the system during customer onboarding:

```mermaid
flowchart TB
    subgraph "Input Processing"
        INPUT[Customer Input<br/>URL + Preferences]
        VALIDATE[Input Validation<br/>& Normalization]
        SETUP[User Context<br/>Setup]
    end
    
    subgraph "Data Collection"
        SCRAPER[Scraping Service<br/>Selection]
        WEBSITE[Website Scraping<br/>Apify Integration]
        GOOGLE[Google Places<br/>Business Data]
        EXTRACT[Raw Data<br/>Extraction]
    end
    
    subgraph "AI Processing Pipeline"
        QUEUE[Task Queue<br/>Management]
        PROMPT[Dynamic Prompt<br/>Generation]
        MODEL[AI Model<br/>Selection]
        GENERATE[Answer<br/>Generation]
        VALIDATE_AI[AI-Powered<br/>Validation]
        SANITIZE[Data<br/>Sanitization]
    end
    
    subgraph "State Management"
        PERSONA[Persona Attributes<br/>Storage]
        STAGE[Stage Progress<br/>Tracking]
        BUSINESS[Business Model<br/>Data]
        AGENT[Agent Configuration<br/>Data]
    end
    
    subgraph "Output Generation"
        CUSTOMER[Customer Record<br/>Creation]
        CONFIGS[Agent Configuration<br/>Setup]
        INTEGRATIONS[External Service<br/>Integration]
        NOTIFICATIONS[Customer<br/>Notifications]
    end
    
    INPUT --> VALIDATE
    VALIDATE --> SETUP
    SETUP --> SCRAPER
    
    SCRAPER --> WEBSITE
    SCRAPER --> GOOGLE
    WEBSITE --> EXTRACT
    GOOGLE --> EXTRACT
    
    EXTRACT --> QUEUE
    QUEUE --> PROMPT
    PROMPT --> MODEL
    MODEL --> GENERATE
    GENERATE --> VALIDATE_AI
    VALIDATE_AI --> SANITIZE
    
    SANITIZE --> PERSONA
    PERSONA --> STAGE
    STAGE --> BUSINESS
    BUSINESS --> AGENT
    
    AGENT --> CUSTOMER
    CUSTOMER --> CONFIGS
    CONFIGS --> INTEGRATIONS
    INTEGRATIONS --> NOTIFICATIONS
    
    style INPUT fill:#e3f2fd
    style NOTIFICATIONS fill:#e8f5e8
```

## Technical Implementation Diagrams

### Event-Driven Orchestration

This diagram shows the sophisticated event system that coordinates all components:

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant CF as Creator Flow
    participant SDF as Scraping Flow
    participant AI as AI Models
    participant EXT as External Services
    participant IA as Installer Agent
    
    Note over UI,IA: Customer Onboarding Initiation
    UI->>CF: onboarding_started
    CF->>CF: GetData (process input)
    CF->>SDF: scraping_worker_message
    
    Note over UI,IA: Data Collection Phase
    SDF->>EXT: trigger_scraping (Apify/Google)
    EXT->>SDF: run_actor_success
    SDF->>SDF: RetrieveData & _enqueue tasks
    
    Note over UI,IA: AI Processing Loop (5 Stages)
    loop Stages 0-4
        SDF->>SDF: _ask_question event
        SDF->>AI: Generate answer (model selection)
        AI->>SDF: AI response
        SDF->>AI: Validate answer (O1 model)
        AI->>SDF: Validation result
        SDF->>CF: stage_X_scraping_finished
        CF->>UI: Progress notification
    end
    
    Note over UI,IA: Customer Creation & Setup
    CF->>CF: create_customer_finished
    CF->>IA: Install system components
    IA->>EXT: Setup integrations
    CF->>EXT: Send welcome communications
    
    Note over UI,IA: Completion
    CF->>UI: Onboarding complete
```

### AI Model Orchestration

This diagram details how different AI models are selected and coordinated:

```mermaid
graph TB
    subgraph "AI Model Strategy"
        TASK[Incoming Processing Task]
        
        TASK --> ANALYSIS{Task Analysis}
        
        ANALYSIS --> SCHEMA{Requires JSON<br/>Schema Output?}
        SCHEMA -->|Yes| STRUCTURED[GPT-4o<br/>Structured Output]
        
        SCHEMA -->|No| SEARCH{Needs Web<br/>Search Enhancement?}
        SEARCH -->|Yes| PREVIEW[GPT-4o<br/>Search Preview]
        
        SEARCH -->|No| COMPLEXITY{Complex<br/>Reasoning Required?}
        COMPLEXITY -->|High| O3MODEL[O3 Model<br/>Advanced Analysis]
        COMPLEXITY -->|Medium| O1MODEL[O1 Model<br/>Validation Logic]
        COMPLEXITY -->|Standard| GPT4O[GPT-4o<br/>General Purpose]
        
        STRUCTURED --> PROCESSING[Answer Processing]
        PREVIEW --> PROCESSING
        O3MODEL --> PROCESSING  
        O1MODEL --> PROCESSING
        GPT4O --> PROCESSING
        
        PROCESSING --> VALIDATION[Answer Validation<br/>O1 Model]
        VALIDATION --> PASSED{Validation<br/>Passed?}
        
        PASSED -->|Yes| STORE[Store Result]
        PASSED -->|No| RETRY[Retry with<br/>Different Model]
        
        RETRY --> ANALYSIS
        STORE --> COMPLETE[Task Complete]
    end
    
    subgraph "Model Characteristics"
        C1[GPT-4o: Speed + Versatility]
        C2[GPT-4o Search: Real-time Data]
        C3[GPT-4o Structured: Schema Compliance]
        C4[O1: Complex Validation]
        C5[O3: Advanced Reasoning]
    end
    
    style STRUCTURED fill:#e1f5fe
    style PREVIEW fill:#f3e5f5
    style O3MODEL fill:#fff3e0
    style O1MODEL fill:#e8f5e8
    style GPT4O fill:#fce4ec
```

### Template Processing Engine

This diagram shows how the Jinja2 template system processes business logic:

```mermaid
graph TB
    subgraph "Template Processing Architecture"
        subgraph "Input Layer"
            TRIGGER[User Trigger Event]
            ARGS[Triggered Arguments]
            SETTINGS[System Settings]
            PERSONA[Persona Attributes]
        end
        
        subgraph "Template Engine Core"
            JINJA[Jinja2 Template Engine]
            RESOLVER[Variable Resolution]
            CONTEXT[Context Building]
            RENDER[Template Rendering]
        end
        
        subgraph "Processing Skills"
            FILL[_fill_template<br/>Variable Substitution]
            PROMPT[_build_prompt<br/>AI Prompt Construction]
            SCHEMA[_build_json_schema<br/>Schema Generation]
            EMAIL[_build_welcome_email<br/>Email Template]
        end
        
        subgraph "Data Sources"
            CONFIG[Configuration Data]
            USER_DATA[User Input Data]
            SCRAPED[Scraped Business Data]
            STAGE_DATA[Stage Progress Data]
        end
        
        subgraph "Output Generation"
            AI_PROMPTS[AI Processing Prompts]
            NOTIFICATIONS[User Notifications]
            CONFIGS[System Configurations]
            INTEGRATIONS[Integration Payloads]
        end
    end
    
    TRIGGER --> ARGS
    ARGS --> JINJA
    SETTINGS --> CONTEXT
    PERSONA --> CONTEXT
    
    JINJA --> RESOLVER
    RESOLVER --> CONTEXT
    CONTEXT --> RENDER
    
    RENDER --> FILL
    RENDER --> PROMPT
    RENDER --> SCHEMA
    RENDER --> EMAIL
    
    CONFIG --> FILL
    USER_DATA --> PROMPT
    SCRAPED --> SCHEMA
    STAGE_DATA --> EMAIL
    
    FILL --> AI_PROMPTS
    PROMPT --> AI_PROMPTS
    SCHEMA --> CONFIGS
    EMAIL --> NOTIFICATIONS
    
    AI_PROMPTS --> INTEGRATIONS
    
    style JINJA fill:#ffeb3b
    style RENDER fill:#4caf50
```

## Developer Customization Diagrams

### Extension Points Architecture

This diagram shows how developers can customize and extend the system:

```mermaid
graph TB
    subgraph "Customization Layers"
        subgraph "Business Logic Layer"
            STAGES[Stage Configuration<br/>JSON-based setup]
            PROMPTS[Prompt Templates<br/>Jinja2 customization]
            VALIDATION[Validation Rules<br/>Custom logic]
            WORKFLOWS[Workflow Definitions<br/>Event-driven setup]
        end
        
        subgraph "Integration Layer"
            CONNECTORS[Custom Connectors<br/>API integrations]
            COMMANDS[Custom Commands<br/>External actions]
            EVENTS[Custom Events<br/>System coordination]
            WEBHOOKS[Webhook Handlers<br/>External triggers]
        end
        
        subgraph "AI Layer"
            MODELS[Model Selection<br/>Custom strategies]
            SCHEMAS[JSON Schemas<br/>Structured output]
            PROMPTS_AI[AI Prompts<br/>Dynamic generation]
            VALIDATION_AI[AI Validation<br/>Quality checks]
        end
        
        subgraph "Data Layer"
            SCRAPERS[Custom Scrapers<br/>Data sources]
            PROCESSORS[Data Processors<br/>Transformation logic]
            STORAGE[Storage Adapters<br/>State management]
            CACHE[Caching Strategies<br/>Performance optimization]
        end
    end
    
    subgraph "Extension Points"
        EXT1[New Industry Templates]
        EXT2[Additional AI Models]
        EXT3[Custom Integrations]
        EXT4[Specialized Workflows]
        EXT5[Advanced Analytics]
    end
    
    STAGES --> EXT1
    PROMPTS --> EXT1
    
    MODELS --> EXT2
    SCHEMAS --> EXT2
    
    CONNECTORS --> EXT3
    WEBHOOKS --> EXT3
    
    WORKFLOWS --> EXT4
    EVENTS --> EXT4
    
    PROCESSORS --> EXT5
    STORAGE --> EXT5
    
    style STAGES fill:#e3f2fd
    style MODELS fill:#f3e5f5
    style CONNECTORS fill:#fff3e0
    style SCRAPERS fill:#e8f5e8
```

### Module Interaction Diagram

This diagram shows how different modules interact and can be customized:

```mermaid
graph TB
    subgraph "Core Modules"
        FLOW[Flow Controller<br/>Orchestration logic]
        EVENT[Event Manager<br/>Message routing]
        STATE[State Manager<br/>Data persistence]
        QUEUE[Queue Manager<br/>Task coordination]
    end
    
    subgraph "Processing Modules"
        AI[AI Processing Module<br/>Model coordination]
        TEMPLATE[Template Engine<br/>Logic processing]
        SCRAPER[Scraping Module<br/>Data collection]
        VALIDATOR[Validation Module<br/>Quality assurance]
    end
    
    subgraph "Integration Modules"
        COMM[Communication Module<br/>Multi-channel messaging]
        CRM[CRM Integration Module<br/>Business systems]
        PHONE[Telephony Module<br/>Voice services]
        WEBHOOK[Webhook Module<br/>API coordination]
    end
    
    subgraph "Customization Points"
        CUSTOM_FLOW[Custom Flow Logic]
        CUSTOM_AI[Custom AI Models]
        CUSTOM_INT[Custom Integrations]
        CUSTOM_DATA[Custom Data Sources]
    end
    
    FLOW --> EVENT
    EVENT --> STATE
    STATE --> QUEUE
    
    QUEUE --> AI
    AI --> TEMPLATE
    TEMPLATE --> SCRAPER
    SCRAPER --> VALIDATOR
    
    VALIDATOR --> COMM
    COMM --> CRM
    CRM --> PHONE
    PHONE --> WEBHOOK
    
    FLOW -.-> CUSTOM_FLOW
    AI -.-> CUSTOM_AI
    COMM -.-> CUSTOM_INT
    SCRAPER -.-> CUSTOM_DATA
    
    style FLOW fill:#ffeb3b
    style AI fill:#4caf50
    style COMM fill:#2196f3
    style CUSTOM_FLOW fill:#ff9800
    style CUSTOM_AI fill:#ff9800
    style CUSTOM_INT fill:#ff9800
    style CUSTOM_DATA fill:#ff9800
```

---

These diagrams provide comprehensive visual documentation of the Newo Agent Creator system, progressing from high-level business concepts to detailed technical implementation. They serve as essential reference materials for understanding, developing, and extending the system's capabilities.