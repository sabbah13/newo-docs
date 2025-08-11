---
sidebar_position: 1
title: "Actions Reference"
description: "Complete reference for all Newo Skill Actions"
---

# Actions Reference

The Newo Intelligent Flow Framework provides a comprehensive set of actions for building sophisticated conversational agents and automated workflows. Actions are the fundamental building blocks of Skills, enabling everything from basic variable management to complex AI generation and external system integration.

## 📚 **Documented Actions**

The following actions have complete documentation with examples and usage patterns:

### 📨 **Communication Actions**
- [**SendMessage**](./sendmessage) - Send messages to actors/users across channels
- [**SendCommand**](./sendcommand) - Execute commands on external connectors
- [**SendSystemEvent**](./sendsystemevent) - Broadcast internal system events

### 🤖 **AI Generation Actions**
- [**Gen**](./gen) - Synchronous AI content generation with schema support
- [**GenStream**](./genstream) - Real-time streaming AI responses with interruption handling

### 📊 **Data & State Management** 
- [**Set**](./set) - Local variable assignment and data processing
- [**GetState**](./getstate) - Retrieve persistent state across skill executions
- [**SetState**](./setstate) - Assign values to Flow State fields for persistent storage

### 💾 **Context & Memory Actions**
- [**GetMemory**](./getmemory) - Access conversation history and context
- [**GetTriggeredAct**](./gettriggeredact) - Information about triggering events

### 👥 **Actor & Identity Actions**
- [**CreateActor**](./createactor) - Create communication channel actors
- [**GetActors**](./getactors) - Retrieve actor information and targeting
- [**GetActor**](./getactor) - Get specific actor details by ID

### 👤 **User Management Actions**
- [**GetUser**](./getuser) - Retrieve user information and attributes
- [**UpdateUser**](./updateuser) - Modify user profile information and attributes

### 🔧 **Utility Actions**
- [**GetCurrentPrompt**](./getcurrentprompt) - Retrieve current skill prompts for debugging
- [**GetRandomChoice**](./getrandomchoice) - Random selection from options

### 🔍 **Validation & Testing**
- [**IsEmpty**](./isempty) - Check if a string or variable contains any content
- [**IsSimilar**](./issimilar) - Compare string similarity using multiple algorithms and thresholds
- [**IsGlobal**](./isglobal) - Check if skill execution is in global context versus user-specific context

### 🔤 **String Operations**
- [**Concat**](./concat) - Concatenate multiple strings and arrays into single text output
- [**Stringify**](./stringify) - Convert values to clean string format by removing quotes and normalizing data
- [**Summarize**](./summarize) - Create concise summaries of text content with length control
- [**CreateArray**](./createarray) - Create arrays from string literals and variables for data organization
- [**Dummy**](./dummy) - Placeholder action for testing, debugging, and workflow development

### 🎯 **Control Flow**
- [**If**](./if) - Conditional logic control for branching skill execution
- [**Do**](./do) - Execute actions dynamically by name with parameters
- [**Return**](./return) - Output final values and control skill execution flow

### 📋 **JSON Operations**
- [**GetValueJSON**](./getvaluejson) - Extract specific values from JSON objects and arrays using keys

### ⏰ **Date & Time**
- [**GetDateTime**](./getdatetime) - Get current date and time with timezone and format control

## 🚀 **Quick Start Examples**

### Basic Communication Flow
```newo
{{!-- Simple greeting with user personalization --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{SendMessage(message=Concat("Hello ", user_name, "! How can I help you today?"))}}
```

### AI-Powered Response Generation
```newo
{{!-- Generate contextual response using conversation history --}}
{{#system~}}
You are a helpful assistant. The user just said: "{{GetMemory(count="1", fromPerson="User")}}"
Provide a helpful and friendly response.
{{~/system}}

{{#assistant~}}
{{Gen(name="response", temperature=0.7)}}
{{~/assistant}}

{{SendMessage(message=response)}}
```

### Multi-Channel Broadcasting
```newo
{{!-- Send urgent notifications to all user communication channels --}}
{{Set(name="all_actors", value=GetActors(personaId=GetUser(field="id")))}}
{{SendMessage(
  message="URGENT: Your account security has been updated. Please review your settings.",
  actorIds=all_actors,
  priority="high"
)}}
```

## 📋 **Additional Actions Available**

The Newo platform includes many more actions for advanced use cases. Documentation is being expanded continuously:

### 🚧 **Coming Soon - Core Actions**
- **UpdateValueJSON** - Modify values in JSON objects and arrays
- **AppendItemsArrayJSON** - Add items to JSON arrays
- **GetDateInterval** - Calculate time differences and intervals

### 🚧 **Coming Soon - Advanced Features**
- **Agent Management**: SetAgent, GetAgent, UpdateAgent operations
- **Persona Management**: GetPersona, CreatePersona for identity handling
- **Knowledge Base**: SetAKB, SearchSemanticAKB, SearchFuzzyAKB, UpdateAKB, DeleteAKB operations
- **Date/Time**: GetDateTime, GetDateInterval with timezone handling
- **JSON Operations**: GetValueJSON, UpdateValueJSON, AppendItemsArrayJSON, and array manipulations
- **Customer Management**: GetCustomer, SetCustomerAttribute, and metadata operations

### 🔄 **Integration Categories**
The complete action library supports:
- **Multi-Channel Communication** with SMS, email, voice, and chat integrations
- **AI-Powered Content Generation** with customizable models and parameters  
- **Dynamic State Management** across user sessions and global contexts
- **External System Integration** via commands and webhook connections
- **Advanced Data Processing** with JSON, arrays, and complex data structures

*Check individual action files for the most up-to-date information as documentation expands.*

## 🎯 **Action Categories by Use Case**

### Customer Service Automation
- Communication actions for multi-channel support
- Memory actions for context-aware conversations
- AI generation for dynamic responses
- State management for conversation tracking

### Task Management & Workflows  
- System events for task coordination
- External commands for integration
- Actor management for notifications
- Data persistence for tracking

### Content Generation & Processing
- AI generation with schema validation
- Text processing and summarization
- Random selection for variety
- JSON and array manipulation

### Analytics & Monitoring
- Prompt analysis for optimization
- Trigger information for debugging
- Agent identity for attribution
- Event logging for analytics

## 🔄 **Integration Patterns**

Actions work together in powerful patterns:

1. **Event-Driven Workflows**: Trigger → Context → Process → Respond → Log
2. **AI-Enhanced Processing**: Input → Memory → Generate → Validate → Output
3. **Multi-Channel Orchestration**: Detect → Route → Transform → Broadcast → Track
4. **State-Aware Conversations**: Previous State → New Input → Update State → Respond

## 📖 **Learn More**

- [**Actions API Overview**](../actions-api) - Complete API reference and syntax
- [**Development Guide**](../development-guide) - Building skills with actions
- [**Integration Guide**](../integration-guide) - Connecting external systems
- [**System Architecture**](../system-architecture) - How actions fit in the platform

---

*This reference covers the core documented actions. The Newo platform continues to expand with new actions and capabilities. Visit individual action documentation pages for comprehensive examples, parameters, and usage patterns.*