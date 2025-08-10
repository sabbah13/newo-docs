---
title: "Integration Setup Guide: Connecting External Systems"
---

## Overview

The **Newo Intelligent Flow Framework** enables Digital Employees to integrate with external systems through **Connectors** and **Integrations**. This guide covers setup procedures for major integration types, enabling omnichannel capabilities and external system coordination.

## Integration Architecture

### 🏗️ Integration Components

**Integration Types**:
- **Communication Channels**: Voice (Vapi), SMS (Twilio), Email, Chat
- **Business Systems**: CRM, ERP, Booking platforms, Payment processors
- **Data Sources**: APIs, Databases, File systems, Web services
- **AI Services**: Custom LLMs, Specialized AI models
- **Automation Tools**: Apify, Browser automation, Workflow engines

**Component Relationships**:
```
Digital Employee Skill → SendCommand → Integration → Connector → External System
                                    ↓
                              Event Response ← Webhook ← External System Response
```

### 📊 Integration Management

**Integration Lifecycle**:
1. **Account Setup**: Create external service accounts
2. **API Configuration**: Add API keys and connection details
3. **Connector Creation**: Define specific connection instances
4. **Event Subscription**: Link connectors to Digital Employee skills
5. **Testing & Validation**: Verify integration functionality
6. **Monitoring & Maintenance**: Ongoing performance management

## Voice Integration (Vapi)

### 📞 Vapi Phone Integration Setup

**Purpose**: Enable Digital Employees to handle phone calls with natural voice interaction

#### Step 1: Vapi Account Setup

1. **Create Vapi Account**:
   - Navigate to [Vapi Dashboard](https://dashboard.vapi.ai/)
   - Sign up and complete account verification
   - Navigate to "Account" → Copy API Key
   
2. **Billing Configuration**:
   - Go to "Billing" → Add Payment Method
   - Set Monthly Usage Limit
   - **Note**: Payment method required for phone number purchase

#### Step 2: Add Vapi Integration to Newo

1. **Configure Integration**:
   - Newo Platform → Integrations → Vapi Integration
   - Click gear icon → Paste Vapi API Key → Save
   
2. **Verify Connection**:
   - Test API connection
   - Confirm billing status

#### Step 3: Create Vapi Connector

**Connector Configuration**:
```yaml
Title: "vapi_[phone_number]"  # e.g., vapi_6592272513
Identifier: "vapi_caller"
Greeting Phrase: "Hello! Thank you for calling [Business]. How can I help you today?"
Disclaimer: "Please note that I am logging our conversation for quality purposes."
Agent Assignment: "ConvoAgent" (for Super Agent Framework)
Phone Area Code: "650" (US area code)
Language: "en-US"
End-of-call Reports: true
```

**Voice Configuration Options**:

**Deepgram Voices**:
- `luna`, `stella`, `athena`, `hera`, `orion`
- `arcas`, `perseus`, `angus`, `orpheus`, `asteria`
- `helios`, `zeus`

**ElevenLabs Voices**:
- `burt`, `marissa`, `andrea`, `sarah`, `phillip`
- `steve`, `joseph`, `myra`, `paula`, `ryan`
- `drew`, `paul`, `mrb`, `matilda`, `mark`

**PlayHT Voices**:
- `jennifer`, `melissa`, `will`, `chris`, `matt`
- `jack`, `ruby`, `davis`, `donna`, `michael`

#### Step 4: Enable and Test

1. **Enable Connector**:
   - Click three dots → Run
   - Verify phone number generation
   - Update connector title with phone number

2. **Test Call Flow**:
   - Call generated number
   - Verify greeting and disclaimer
   - Test conversation flow
   - Monitor call logs

**Skill Integration Example**:
```newo
{{!-- Make outbound call --}}
{{SendCommand(
  commandIdn="make_call",
  integrationIdn="vapi",
  connectorIdn="vapi_caller",
  phoneNumber=customer_phone,
  greetingPhrase="Hello! This is a follow-up call about your reservation."
)}}
```

## SMS Integration (Twilio)

### 📱 Twilio SMS Setup

**Purpose**: Enable Digital Employees to send and receive SMS messages

#### Step 1: Twilio Account Configuration

1. **Account Setup**:
   - Create Twilio account at [twilio.com](https://www.twilio.com)
   - Complete phone verification
   - Access Console Dashboard

2. **Phone Number Purchase**:
   - Console → Phone Numbers → Manage → Buy a number
   - Select number with SMS capabilities
   - Note phone number for configuration

3. **API Credentials**:
   - Console → Account → API Keys & Tokens
   - Copy Account SID and Auth Token
   - Generate API Key (recommended for production)

#### Step 2: Newo SMS Integration

1. **Add Integration**:
   - Newo Platform → Integrations → Twilio Messenger
   - Configure API credentials:
     ```yaml
     Account SID: [Your Account SID]
     Auth Token: [Your Auth Token]
     ```

2. **Create SMS Connector**:
   ```yaml
   Title: "SMS Customer Support"
   Identifier: "sms_connector"
   Phone Number: "+1234567890"  # Your Twilio number
   Agent Assignment: "ConvoAgent"
   ```

#### Step 3: Webhook Configuration

1. **Twilio Webhook Setup**:
   - Twilio Console → Phone Numbers → Your Number
   - Configure webhook URL: `[Newo webhook endpoint]`
   - Set HTTP method to POST
   - Enable incoming message processing

2. **Event Subscription**:
   ```yaml
   Event: "user_sms_reply"
   Skill: "UserSMSReplySkill"
   Integration: "twilio_messenger"
   Connector: "sms_connector"
   ```

**Skill Usage Examples**:
```newo
{{!-- Send SMS confirmation --}}
{{SendCommand(
  commandIdn="send_message",
  integrationIdn="twilio_messenger",
  connectorIdn="sms_connector",
  text=Concat("Your reservation is confirmed for ", booking_date, " at ", booking_time),
  phoneNumber=customer_phone
)}}

{{!-- Add phone to messaging pool --}}
{{SendCommand(
  commandIdn="add_phone_to_pool",
  integrationIdn="twilio_messenger",
  connectorIdn="sms_connector",
  phoneNumber=new_customer_phone
)}}
```

## Calendar Integration (Google Calendar)

### 📅 Google Calendar Setup

**Purpose**: Enable Digital Employees to create, modify, and check calendar events

#### Step 1: Google Cloud Project Setup

1. **Create Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Note Project ID

2. **Enable APIs**:
   - APIs & Services → Library
   - Enable Google Calendar API
   - Configure OAuth consent screen

3. **Create Credentials**:
   - APIs & Services → Credentials
   - Create Service Account
   - Download JSON key file
   - Share calendar with service account email

#### Step 2: Newo Calendar Integration

1. **Integration Configuration**:
   ```yaml
   Integration: "google_calendar"
   Service Account JSON: [Upload key file]
   Default Calendar ID: [Calendar ID from Google Calendar settings]
   ```

2. **Create Calendar Connector**:
   ```yaml
   Title: "Business Calendar"
   Identifier: "calendar"
   Calendar ID: "primary" or specific calendar ID
   Timezone: "America/New_York"
   ```

**Skill Usage Examples**:
```newo
{{!-- Create appointment --}}
{{SendCommand(
  commandIdn="create_event",
  integrationIdn="google_calendar",
  connectorIdn="calendar",
  eventId=unique_booking_id,
  userPersonaId=customer_id,
  startTime=appointment_datetime,
  eventDurationMinutes="60",
  title=Concat("Appointment with ", customer_name),
  attendees=customer_email
)}}

{{!-- Check availability --}}
{{SendCommand(
  commandIdn="check_availability",
  integrationIdn="google_calendar",
  connectorIdn="calendar",
  startTime=requested_start,
  endTime=requested_end,
  timeZone="America/New_York"
)}}
```

## Web Automation Integration (Magic Browser)

### 🌐 Browser Automation Setup

**Purpose**: Enable Digital Employees to interact with web interfaces for booking and data retrieval

#### Configuration

1. **Magic Browser Connector**:
   ```yaml
   Title: "Restaurant Booking Automation"
   Identifier: "magic_browser_connector"
   Target Website: "restaurant-booking-system.com"
   Session Management: "persistent"
   ```

2. **Authentication Setup**:
   ```yaml
   Login Credentials: [Encrypted credentials]
   Session Timeout: 3600 seconds
   Retry Logic: 3 attempts
   ```

**Usage Examples**:
```newo
{{!-- Book restaurant table --}}
{{SendCommand(
  commandIdn="book_restaurant_slot",
  integrationIdn="magic_browser",
  connectorIdn="magic_browser_connector",
  payload=AsStringJSON({
    "date": booking_date,
    "time": booking_time,
    "party_size": party_size,
    "customer_name": customer_name,
    "customer_phone": customer_phone
  }),
  targetAction="book_slot"
)}}

{{!-- Custom browser command --}}
{{SendCommand(
  commandIdn="magic_browser_command",
  integrationIdn="magic_browser",
  connectorIdn="magic_browser_connector",
  session_name="booking_session",
  payload=custom_automation_payload
)}}
```

## Timer and Scheduling Integration

### ⏰ Timer Setup

**Purpose**: Enable Digital Employees to schedule follow-up actions and reminders

#### Configuration

1. **Timer Integration**:
   ```yaml
   Integration: "program_timer"
   Connector: "reminder_system"
   ```

**Timer Usage Examples**:
```newo
{{!-- One-time timer --}}
{{SendCommand(
  commandIdn="set_timer",
  integrationIdn="program_timer",
  connectorIdn="reminder_timer",
  fireAt="2024-01-20T19:00:00",
  personaId=GetUser(field="id"),
  timerName="appointment_reminder",
  repeatable="false"
)}}

{{!-- Interval timer --}}
{{SendCommand(
  commandIdn="set_timer",
  integrationIdn="program_timer",
  connectorIdn="follow_up_timer",
  personaId=customer_id,
  timerName="weekly_follow_up",
  interval="604800"  # 7 days in seconds
)}}

{{!-- Repeatable timer --}}
{{SendCommand(
  commandIdn="set_repeatable_timer",
  integrationIdn="program_timer",
  connectorIdn="maintenance_timer",
  personaId=system_id,
  timerName="daily_cleanup",
  fireAt="2024-01-20T02:00:00",
  interval="86400"  # 24 hours
)}}
```

## HTTP API Integration

### 🔗 Generic HTTP Integration

**Purpose**: Connect to any REST API or webhook-enabled service

#### Configuration

1. **HTTP Connector**:
   ```yaml
   Title: "Custom API Integration"
   Identifier: "http_connector"
   Base URL: "https://api.example.com"
   Authentication: "Bearer token" or "API Key"
   Default Headers: 
     Content-Type: "application/json"
     Authorization: "Bearer [token]"
   ```

**Usage Examples**:
```newo
{{!-- POST request --}}
{{SendCommand(
  commandIdn="send_request",
  integrationIdn="http",
  connectorIdn="http_connector",
  method="POST",
  url="/bookings",
  headers=AsStringJSON({
    "Content-Type": "application/json",
    "X-API-Key": api_key
  }),
  body=AsStringJSON(booking_data),
  targetAction="process_booking_response"
)}}

{{!-- GET request --}}
{{SendCommand(
  commandIdn="send_request",
  integrationIdn="http",
  connectorIdn="api_connector",
  method="GET",
  url=Concat("/customers/", customer_id),
  targetAction="update_customer_info"
)}}
```

## Customer Communication Integration (Intercom)

### 💬 Intercom Setup

**Purpose**: Integrate with customer support platforms for seamless handoff

#### Configuration

1. **Intercom Integration**:
   ```yaml
   Integration: "customer_intercom"
   API Token: [Intercom API token]
   App ID: [Intercom App ID]
   ```

2. **Intercom Connector**:
   ```yaml
   Title: "Customer Support Bridge"
   Identifier: "connection"
   Default Assignment: "support_team"
   ```

**Usage Examples**:
```newo
{{!-- Create or get customer actor --}}
{{SendCommand(
  commandIdn="get_or_create_actor",
  integrationIdn="customer_intercom",
  connectorIdn="connection",
  externalId=customer_external_id,
  userPersonaId=customer_persona_id
)}}

{{!-- Send event to customer support --}}
{{SendCommand(
  commandIdn="send_actor_event",
  integrationIdn="customer_intercom",
  toActorId=intercom_actor_id,
  eventIdn="create_appointment",
  eventArguments=appointment_data
)}}
```

## Email Integration

### 📧 Email Setup

**Purpose**: Send confirmations, notifications, and automated communications

#### Configuration

1. **Email Integration**:
   ```yaml
   Integration: "api"
   Connector: "webhook"
   SMTP Settings: [Email provider configuration]
   ```

**Usage Examples**:
```newo
{{!-- Send confirmation email --}}
{{SendCommand(
  commandIdn="send_email",
  integrationIdn="api",
  connectorIdn="webhook",
  toEmail=customer_email,
  subject=Concat("Booking Confirmation - ", booking_date),
  bodyText=email_template
)}}

{{!-- Onboarding email --}}
{{SendCommand(
  commandIdn="onboarding_setup",
  integrationIdn="api",
  connectorIdn="webhook",
  customerIdn=customer_id,
  emailTemplate="welcome_template"
)}}
```

## Integration Best Practices

### 🛡️ Security Considerations

**API Security**:
- Use encrypted credential storage
- Implement rate limiting
- Monitor API usage patterns
- Regular credential rotation

**Data Protection**:
- Encrypt sensitive data in transit
- Implement proper access controls
- Log access and modifications
- Comply with data protection regulations

### 📊 Monitoring and Maintenance

**Health Monitoring**:
```newo
{{!-- Integration health check --}}
{{SendCommand(
  commandIdn="health_check",
  integrationIdn="system_monitor",
  connectorIdn="health_checker",
  integration_name="twilio_messenger",
  check_type="connectivity"
)}}
```

**Error Handling**:
```newo
{{!-- Robust error handling pattern --}}
{{Set(name="api_response", value=SendCommand(
  commandIdn="send_request",
  integrationIdn="http",
  connectorIdn="external_api"
))}}

{{#if IsEmpty(text=api_response)}}
  {{SendMessage(message="I'm experiencing technical difficulties. Let me connect you with our support team.")}}
  {{SendSystemEvent(eventIdn="integration_failure", system="external_api")}}
{{else}}
  {{!-- Process successful response --}}
{{/if}}
```

**Performance Optimization**:
- Cache frequent API responses
- Implement request batching
- Use asynchronous processing for non-critical operations
- Monitor response times and set alerts

This comprehensive integration setup guide enables Digital Employees to connect with virtually any external system, creating truly omnichannel and omniflow business automation capabilities.