---
sidebar_position: 11
title: "Actions API Overview"
description: "Newo Actions API reference and navigation guide"
---

# Newo Actions API Overview

**Actions** are executable code snippets within Skill Scripts that enable Digital Employees to access data, perform tasks, and integrate with external systems. They form the core building blocks of the Newo Intelligent Flow Framework.

## Quick Navigation

📖 **[Complete Actions Reference →](./actions/)**

Browse detailed documentation for all available actions, organized by category with comprehensive examples, parameters, limitations, and best practices.

## What Actions Enable

- **Data Access & Manipulation**: Store, retrieve, and process information
- **Communication**: Multi-channel messaging and system events  
- **State Management**: Persistent workflow state and context
- **External Integration**: Connect with third-party services and APIs
- **AI Generation**: Dynamic content creation and processing
- **Workflow Control**: Conditional logic and execution flow

## Popular Actions Quick Reference

### 🗣️ Communication
- **[SendMessage](./actions/sendmessage)** - Direct messaging to actors/users
- **[SendCommand](./actions/sendcommand)** - External connector command execution  
- **[SendSystemEvent](./actions/sendsystemevent)** - Internal system event broadcasting

### 🤖 AI Generation
- **[Gen](./actions/gen)** - Synchronous AI content generation
- **[GenStream](./actions/genstream)** - Real-time streaming AI responses

### 📊 Essential Data Actions
- **[Set](./actions/set)** - Local variable assignment
- **[GetMemory](./actions/getmemory)** - Conversation history and context
- **[GetActors](./actions/getactors)** - Retrieve communication channel actors
- **[GetState](./actions/getstate)** / **SetState** - Persistent state management

## Quick Start Examples

### Basic Communication Flow
```newo
{{!-- Get current user and send greeting --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{SendMessage(message=Concat("Hello ", user_name, "! How can I help you today?"))}}
```

### External System Integration
```newo
{{!-- Send booking confirmation via SMS --}}
{{SendCommand(
  commandIdn="send_message",
  integrationIdn="twilio_messenger",
  connectorIdn="sms_connector",
  text=Concat("Booking confirmed for ", booking_date, " at ", booking_time),
  phoneNumber=customer_phone
)}}
```

## Getting Started

The Actions API provides over 40 different actions organized into logical categories. Each action includes:

- **Detailed syntax** with parameter specifications
- **Comprehensive examples** from basic to advanced use cases  
- **Integration patterns** showing real-world usage
- **Performance tips** and optimization strategies
- **Limitation documentation** and troubleshooting guides
- **Related actions** for workflow building

### Most Common Actions

New to Newo Actions? Start with these essential actions:

1. **[SendMessage](./actions/sendmessage)** - Basic communication with users
2. **[Set](./actions/set)** - Store and manipulate data in skills
3. **[GetMemory](./actions/getmemory)** - Access conversation history
4. **[GetActors](./actions/getactors)** - Target specific communication channels
5. **[SendCommand](./actions/sendcommand)** - Integrate with external systems

### By Use Case

**Building Conversational Flows**: Start with [GetMemory](./actions/getmemory), [SendMessage](./actions/sendmessage), [GetState](./actions/getstate)

**External Integrations**: Focus on [SendCommand](./actions/sendcommand), [GetActors](./actions/getactors), [CreateActor](./actions/createactor)

**Data Processing**: Explore [Set](./actions/set), GetValueJSON, SearchSemanticAKB

**AI-Powered Features**: Learn [Gen](./actions/gen), [GenStream](./actions/genstream), Summarize

---

📖 **[Browse All Actions →](./actions/)**