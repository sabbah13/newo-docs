---
sidebar_position: 9
title: "CreateActor"
description: "Create new communication channel actors for multi-channel workflows"
---

# CreateActor

Create new actor instances that represent communication endpoints for specific channels (SMS, email, voice, chat). Actors enable multi-channel conversations and persistent customer connections.

## Syntax

```newo
CreateActor(
  integrationIdn: str,
  connectorIdn: str,
  externalId: str,
  personaId: str,
  timeZone: str = "UTC",
  **attributes: any
)
```

## Parameters

### Required Parameters
- **`integrationIdn`** (string): Integration type (`twilio_messenger`, `vapi`, `email`, `newo_chat`, etc.)
- **`connectorIdn`** (string): Specific connector instance identifier
- **`externalId`** (string): External identifier (phone number, email, username)
- **`personaId`** (string): Associated persona/user ID

### Optional Parameters
- **`timeZone`** (string): Timezone for the actor (default: "UTC")
- **`**attributes`** (any): Additional actor metadata and configuration

## How It Works

1. **Actor Registration**: Creates new actor record in system database
2. **Channel Binding**: Links actor to specific communication channel/connector
3. **Persona Association**: Associates actor with user persona for context
4. **Endpoint Configuration**: Configures communication parameters for the channel
5. **Activation**: Makes actor available for messaging and commands

## Integration Types

### SMS Actors (Twilio)
```newo
{{!-- Create SMS communication actor --}}
{{Set(name="customer_phone", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="phone_number"
))}}

{{Set(name="sms_actor", value=CreateActor(
  integrationIdn="twilio_messenger",
  connectorIdn="main_sms_connector",
  externalId=customer_phone,
  personaId=GetUser(field="id"),
  timeZone="America/New_York",
  notification_preferences="enabled",
  message_history_retention="30_days"
))}}

{{!-- Use immediately for messaging --}}
{{SendMessage(
  message="SMS channel activated! You'll receive updates here.",
  actorIds=[sms_actor]
)}}
```

### Voice Actors (VAPI)
```newo
{{!-- Create voice call actor --}}
{{Set(name="voice_actor", value=CreateActor(
  integrationIdn="vapi",
  connectorIdn="voice_assistant",
  externalId=customer_phone,
  personaId=GetUser(field="id"),
  timeZone=GetPersonaAttribute(id=GetUser(field="id"), field="timezone"),
  voice_model="en-US-JennyNeural",
  call_recording="enabled",
  background_noise_suppression="true"
))}}

{{!-- Initiate call using the actor --}}
{{SendCommand(
  commandIdn="make_call",
  integrationIdn="vapi",
  connectorIdn="voice_assistant",
  phoneNumber=customer_phone,
  greetingPhrase="Hello! This is Sarah calling about your appointment."
)}}
```

### Email Actors
```newo
{{!-- Create email communication actor --}}
{{Set(name="customer_email", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="email_address"
))}}

{{Set(name="email_actor", value=CreateActor(
  integrationIdn="email",
  connectorIdn="gmail_connector",
  externalId=customer_email,
  personaId=GetUser(field="id"),
  timeZone=user_timezone,
  email_format="html",
  signature_template="professional",
  auto_reply_enabled="false"
))}}
```

### Chat Actors (Newo Chat)
```newo
{{!-- Create web chat actor --}}
{{Set(name="chat_actor", value=CreateActor(
  integrationIdn="newo_chat",
  connectorIdn="website_chat",
  externalId=GetUser(field="session_id"),
  personaId=GetUser(field="id"),
  timeZone=detected_timezone,
  chat_theme="business",
  typing_indicators="enabled",
  file_upload_allowed="true"
))}}
```

## Advanced Actor Management

### Multi-Channel Actor Setup
```newo
{{!-- Create actors for all available channels --}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{Set(name="user_phone", value=GetPersonaAttribute(id=user_id, field="phone"))}}
{{Set(name="user_email", value=GetPersonaAttribute(id=user_id, field="email"))}}
{{Set(name="user_timezone", value=GetPersonaAttribute(id=user_id, field="timezone"))}}

{{Set(name="created_actors", value=CreateArray())}}

{{!-- SMS Actor --}}
{{#if not IsEmpty(text=user_phone)}}
  {{Set(name="sms_actor", value=CreateActor(
    integrationIdn="twilio_messenger",
    connectorIdn="sms_connector",
    externalId=user_phone,
    personaId=user_id,
    timeZone=user_timezone
  ))}}
  {{Set(name="created_actors", value=AppendItemsArrayJSON(
    array=created_actors,
    items=[CreateObject(type="sms", actor_id=sms_actor)]
  ))}}
{{/if}}

{{!-- Email Actor --}}
{{#if not IsEmpty(text=user_email)}}
  {{Set(name="email_actor", value=CreateActor(
    integrationIdn="email",
    connectorIdn="email_connector",
    externalId=user_email,
    personaId=user_id,
    timeZone=user_timezone
  ))}}
  {{Set(name="created_actors", value=AppendItemsArrayJSON(
    array=created_actors,
    items=[CreateObject(type="email", actor_id=email_actor)]
  ))}}
{{/if}}

{{!-- Store actor registry --}}
{{SetPersonaAttribute(
  id=user_id,
  field="communication_actors",
  value=Stringify(created_actors)
)}}
```

### Dynamic Actor Creation
```newo
{{!-- Create actors based on customer preferences --}}
{{Set(name="preferred_channels", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="preferred_communication_channels"
))}}

{{#each preferred_channels}}
  {{#if IsSimilar(text1=this, text2="sms")}}
    {{Set(name="sms_actor", value=CreateActor(
      integrationIdn="twilio_messenger",
      connectorIdn="priority_sms",
      externalId=user_phone,
      personaId=GetUser(field="id"),
      priority="high"
    ))}}
  {{else if IsSimilar(text1=this, text2="voice")}}
    {{Set(name="voice_actor", value=CreateActor(
      integrationIdn="vapi", 
      connectorIdn="priority_voice",
      externalId=user_phone,
      personaId=GetUser(field="id"),
      call_priority="immediate"
    ))}}
  {{/if}}
{{/each}}
```

### Actor Relationship Management
```newo
{{!-- Create related actors for family booking --}}
{{Set(name="primary_customer", value=GetUser(field="id"))}}
{{Set(name="family_members", value=GetPersonaAttribute(
  id=primary_customer,
  field="family_members"
))}}

{{Set(name="family_actors", value=CreateArray())}}

{{#each family_members}}
  {{Set(name="member_phone", value=GetValueJSON(obj=this, key="phone"))}}
  {{Set(name="member_name", value=GetValueJSON(obj=this, key="name"))}}
  
  {{Set(name="family_actor", value=CreateActor(
    integrationIdn="twilio_messenger",
    connectorIdn="family_sms",
    externalId=member_phone,
    personaId=primary_customer,  # Link to primary customer
    family_member_name=member_name,
    relationship=GetValueJSON(obj=this, key="relationship")
  ))}}
  
  {{Set(name="family_actors", value=AppendItemsArrayJSON(
    array=family_actors,
    items=[family_actor]
  ))}}
{{/each}}

{{SetPersonaAttribute(
  id=primary_customer,
  field="family_communication_actors",
  value=Stringify(family_actors)
)}}
```

## Error Handling and Validation

### Duplicate Actor Prevention
```newo
{{!-- Check if actor already exists --}}
{{Set(name="existing_actors", value=GetActors(
  externalId=customer_phone,
  integrationIdn="twilio_messenger",
  connectorIdn="sms_connector"
))}}

{{#if IsEmpty(text=Stringify(existing_actors))}}
  {{!-- Create new actor --}}
  {{Set(name="new_actor", value=CreateActor(
    integrationIdn="twilio_messenger",
    connectorIdn="sms_connector",
    externalId=customer_phone,
    personaId=GetUser(field="id")
  ))}}
  
  {{SendMessage(
    message="SMS notifications activated!",
    actorIds=[new_actor]
  )}}
{{else}}
  {{!-- Use existing actor --}}
  {{SendMessage(
    message="Using your existing SMS channel.",
    actorIds=existing_actors
  )}}
{{/if}}
```

### Actor Creation Validation
```newo
{{!-- Validate actor creation parameters --}}
{{Set(name="validation_errors", value=CreateArray())}}

{{#if IsEmpty(text=external_id)}}
  {{Set(name="validation_errors", value=AppendItemsArrayJSON(
    array=validation_errors,
    items=["External ID is required"]
  ))}}
{{/if}}

{{#if IsEmpty(text=persona_id)}}
  {{Set(name="validation_errors", value=AppendItemsArrayJSON(
    array=validation_errors,
    items=["Persona ID is required"]
  ))}}
{{/if}}

{{#if IsEmpty(text=Stringify(validation_errors))}}
  {{!-- Proceed with actor creation --}}
  {{Set(name="new_actor", value=CreateActor(
    integrationIdn=integration_type,
    connectorIdn=connector_name,
    externalId=external_id,
    personaId=persona_id
  ))}}
{{else}}
  {{SendMessage(message=Concat(
    "Cannot create communication channel: ",
    Stringify(validation_errors)
  ))}}
{{/if}}
```

### Fallback Actor Creation
```newo
{{!-- Create actor with fallback options --}}
{{Set(name="primary_actor", value=CreateActor(
  integrationIdn="preferred_integration",
  connectorIdn="primary_connector",
  externalId=user_contact,
  personaId=GetUser(field="id")
))}}

{{#if IsEmpty(text=primary_actor)}}
  {{!-- Try fallback integration --}}
  {{Set(name="fallback_actor", value=CreateActor(
    integrationIdn="fallback_integration",
    connectorIdn="backup_connector",
    externalId=user_contact,
    personaId=GetUser(field="id"),
    fallback_mode="true"
  ))}}
  
  {{#if not IsEmpty(text=fallback_actor)}}
    {{SendMessage(
      message="Connected via backup channel.",
      actorIds=[fallback_actor]
    )}}
  {{else}}
    {{SendSystemEvent(eventIdn="actor_creation_failed", user_id=GetUser(field="id"))}}
  {{/if}}
{{/if}}
```

## Actor Configuration Patterns

### Channel-Specific Configuration
```newo
{{!-- Configure SMS actor for business use --}}
{{Set(name="business_sms_actor", value=CreateActor(
  integrationIdn="twilio_messenger",
  connectorIdn="business_sms",
  externalId=customer_phone,
  personaId=GetUser(field="id"),
  timeZone=business_timezone,
  business_hours_only="true",
  opt_out_support="true",
  delivery_receipts="enabled",
  sender_name="ABC Company"
))}}

{{!-- Configure voice actor for support calls --}}
{{Set(name="support_voice_actor", value=CreateActor(
  integrationIdn="vapi",
  connectorIdn="support_voice",
  externalId=customer_phone,
  personaId=GetUser(field="id"),
  voice_personality="helpful_professional",
  call_recording="required",
  quality_monitoring="enabled",
  escalation_available="true"
))}}
```

### Actor Metadata Management
```newo
{{!-- Create actor with rich metadata --}}
{{Set(name="enriched_actor", value=CreateActor(
  integrationIdn="email",
  connectorIdn="marketing_email",
  externalId=customer_email,
  personaId=GetUser(field="id"),
  timeZone=customer_timezone,
  customer_segment=GetPersonaAttribute(id=GetUser(field="id"), field="segment"),
  acquisition_source=GetPersonaAttribute(id=GetUser(field="id"), field="source"),
  lifetime_value=GetPersonaAttribute(id=GetUser(field="id"), field="clv"),
  engagement_score=GetPersonaAttribute(id=GetUser(field="id"), field="engagement"),
  preferred_content_type="promotional",
  email_frequency="weekly"
))}}
```

## Actor Lifecycle Management

### Actor Activation/Deactivation
```newo
{{!-- Create actor in inactive state --}}
{{Set(name="inactive_actor", value=CreateActor(
  integrationIdn="email",
  connectorIdn="newsletter",
  externalId=customer_email,
  personaId=GetUser(field="id"),
  status="inactive",
  activation_pending="true"
))}}

{{!-- Activate after user confirmation --}}
{{#if IsSimilar(text1=user_consent, text2="yes")}}
  {{Set(name="activated_actor", value=UpdateActor(
    actorId=inactive_actor,
    status="active",
    activated_at=GetDateTime(),
    consent_confirmed="true"
  ))}}
{{/if}}
```

### Actor Updates and Maintenance
```newo
{{!-- Update actor configuration --}}
{{Set(name="existing_actor", value=GetActors(
  externalId=customer_phone,
  integrationIdn="twilio_messenger"
)[0]}}

{{Set(name="updated_actor", value=UpdateActor(
  actorId=existing_actor,
  last_interaction=GetDateTime(),
  interaction_count=Add(
    a=GetActorAttribute(actorId=existing_actor, field="interaction_count"),
    b="1"
  ),
  status="active"
))}}
```

### Actor Cleanup
```newo
{{!-- Clean up inactive actors --}}
{{Set(name="user_actors", value=GetActors(personaId=GetUser(field="id")))}}

{{#each user_actors}}
  {{Set(name="last_used", value=GetActorAttribute(actorId=this, field="last_interaction"))}}
  {{Set(name="days_inactive", value=GetDateInterval(start=last_used, end=GetDateTime(), unit="days"))}}
  
  {{#if GreaterThan(a=days_inactive, b="90")}}
    {{!-- Archive old actor --}}
    {{SendCommand(
      commandIdn="archive_actor",
      integrationIdn="system",
      connectorIdn="actor_manager",
      actor_id=this,
      reason="inactive_90_days"
    )}}
  {{/if}}
{{/each}}
```

## Use Case Examples

### Customer Onboarding
```newo
{{!-- Create complete communication suite for new customer --}}
{{Set(name="new_customer_id", value=GetUser(field="id"))}}
{{Set(name="customer_data", value=GetPersona(id=new_customer_id))}}

{{!-- Primary SMS actor --}}
{{Set(name="primary_sms", value=CreateActor(
  integrationIdn="twilio_messenger",
  connectorIdn="customer_sms",
  externalId=GetValueJSON(obj=customer_data, key="phone"),
  personaId=new_customer_id,
  timeZone=GetValueJSON(obj=customer_data, key="timezone"),
  channel_priority="primary",
  message_types=["confirmations", "reminders", "updates"]
))}}

{{!-- Email actor for detailed communications --}}
{{Set(name="email_actor", value=CreateActor(
  integrationIdn="email",
  connectorIdn="customer_email",
  externalId=GetValueJSON(obj=customer_data, key="email"),
  personaId=new_customer_id,
  channel_priority="secondary", 
  message_types=["receipts", "newsletters", "promotions"]
))}}

{{!-- Welcome message via preferred channel --}}
{{Set(name="preferred_channel", value=GetValueJSON(obj=customer_data, key="preferred_communication"))}}

{{#if IsSimilar(text1=preferred_channel, text2="sms")}}
  {{SendMessage(
    message="Welcome! You'll receive updates via SMS.",
    actorIds=[primary_sms]
  )}}
{{else}}
  {{SendMessage(
    message="Welcome! Check your email for detailed information.",
    actorIds=[email_actor]
  )}}
{{/if}}
```

### Emergency Contact System
```newo
{{!-- Create emergency communication actors --}}
{{Set(name="emergency_contacts", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="emergency_contacts"
))}}

{{Set(name="emergency_actors", value=CreateArray())}}

{{#each emergency_contacts}}
  {{Set(name="contact_phone", value=GetValueJSON(obj=this, key="phone"))}}
  {{Set(name="contact_name", value=GetValueJSON(obj=this, key="name"))}}
  {{Set(name="relationship", value=GetValueJSON(obj=this, key="relationship"))}}
  
  {{Set(name="emergency_actor", value=CreateActor(
    integrationIdn="twilio_messenger",
    connectorIdn="emergency_sms",
    externalId=contact_phone,
    personaId=GetUser(field="id"),
    contact_type="emergency",
    contact_name=contact_name,
    relationship=relationship,
    notification_priority="urgent"
  ))}}
  
  {{Set(name="emergency_actors", value=AppendItemsArrayJSON(
    array=emergency_actors,
    items=[emergency_actor]
  ))}}
{{/each}}

{{SetPersonaAttribute(
  id=GetUser(field="id"),
  field="emergency_communication_actors",
  value=Stringify(emergency_actors)
)}}
```

### Business Hours Aware Actors
```newo
{{!-- Create actor with business hours configuration --}}
{{Set(name="business_hours", value=GetAKB(key="business_operating_hours"))}}
{{Set(name="customer_timezone", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="timezone"
))}}

{{Set(name="business_actor", value=CreateActor(
  integrationIdn="twilio_messenger",
  connectorIdn="business_hours_sms",
  externalId=customer_phone,
  personaId=GetUser(field="id"),
  timeZone=customer_timezone,
  business_hours=Stringify(business_hours),
  after_hours_behavior="queue_for_next_day",
  urgent_override_available="true"
))}}
```

## Actor Security and Privacy

### Privacy-Compliant Actor Creation
```newo
{{!-- Create actor with privacy settings --}}
{{Set(name="privacy_preferences", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="privacy_settings"
))}}

{{Set(name="privacy_compliant_actor", value=CreateActor(
  integrationIdn="email",
  connectorIdn="privacy_email",
  externalId=customer_email,
  personaId=GetUser(field="id"),
  data_retention_days=GetValueJSON(obj=privacy_preferences, key="retention_days"),
  marketing_consent=GetValueJSON(obj=privacy_preferences, key="marketing_allowed"),
  data_sharing_consent=GetValueJSON(obj=privacy_preferences, key="sharing_allowed"),
  gdpr_compliant="true",
  right_to_delete="enabled"
))}}
```

### Secure Actor Attributes
```newo
{{!-- Create actor with security features --}}
{{Set(name="secure_actor", value=CreateActor(
  integrationIdn="secure_messaging",
  connectorIdn="encrypted_channel",
  externalId=verified_contact,
  personaId=GetUser(field="id"),
  encryption_enabled="true",
  identity_verified="true",
  verification_method="phone_otp",
  security_level="high",
  audit_logging="enabled"
))}}
```

## Performance Optimization

### Batch Actor Creation
```newo
{{!-- Create multiple actors efficiently --}}
{{Set(name="contact_list", value=GetPersonaAttribute(
  id=GetUser(field="id"),
  field="communication_channels"
))}}

{{Set(name="actor_creation_batch", value=CreateArray())}}

{{#each contact_list}}
  {{Set(name="actor_config", value=CreateObject(
    integrationIdn=GetValueJSON(obj=this, key="integration"),
    connectorIdn=GetValueJSON(obj=this, key="connector"),
    externalId=GetValueJSON(obj=this, key="contact"),
    personaId=GetUser(field="id"),
    channel_type=GetValueJSON(obj=this, key="type")
  ))}}
  
  {{Set(name="actor_creation_batch", value=AppendItemsArrayJSON(
    array=actor_creation_batch,
    items=[actor_config]
  ))}}
{{/each}}

{{!-- Batch create via system command --}}
{{SendCommand(
  commandIdn="batch_create_actors",
  integrationIdn="system",
  connectorIdn="actor_manager",
  actor_configs=Stringify(actor_creation_batch)
)}}
```

### Actor Pooling
```newo
{{!-- Reuse actors from pool when possible --}}
{{Set(name="actor_pool", value=GetAKB(key="available_actor_pool"))}}
{{Set(name="required_integration", value="twilio_messenger")}}

{{Set(name="available_actor", value=GetItemsArrayByPathJSON(
  array=actor_pool,
  path=Concat("integration.", required_integration, ".available")
))}}

{{#if not IsEmpty(text=Stringify(available_actor))}}
  {{!-- Reuse existing actor --}}
  {{Set(name="reused_actor", value=GetValueJSON(obj=available_actor[0], key="actor_id"))}}
  {{UpdateActor(actorId=reused_actor, status="in_use", assigned_to=GetUser(field="id"))}}
{{else}}
  {{!-- Create new actor --}}
  {{Set(name="new_actor", value=CreateActor(
    integrationIdn=required_integration,
    connectorIdn="pooled_connector",
    externalId=customer_contact,
    personaId=GetUser(field="id")
  ))}}
{{/if}}
```

## Limitations

- **Connector Dependencies**: Requires properly configured connectors
- **External ID Uniqueness**: Same externalId + integration creates conflicts
- **Resource Usage**: Each actor consumes system resources
- **Channel Limits**: Subject to third-party service limitations
- **Persistence**: Actors persist beyond conversation lifetime

## Troubleshooting

### Actor Creation Failures
```newo
{{!-- Handle creation failures gracefully --}}
{{Set(name="actor_result", value=CreateActor(
  integrationIdn="problematic_integration",
  connectorIdn="unreliable_connector",
  externalId=customer_contact,
  personaId=GetUser(field="id")
))}}

{{#if IsEmpty(text=actor_result)}}
  {{SendSystemEvent(
    eventIdn="actor_creation_failed",
    integration="problematic_integration",
    connector="unreliable_connector",
    external_id=customer_contact,
    fallback_needed="true"
  )}}
  
  {{SendMessage(message="Having trouble setting up your preferred communication channel. Let me try an alternative.")}}
{{/if}}
```

### Actor Debugging
```newo
{{!-- Debug actor configuration --}}
{{Set(name="test_actor", value=CreateActor(
  integrationIdn="test_integration",
  connectorIdn="debug_connector",
  externalId="test@example.com",
  personaId=GetUser(field="id"),
  debug_mode="enabled"
))}}

{{SendMessage(
  message="Test message to verify actor configuration",
  actorIds=[test_actor],
  test_mode="true"
)}}
```

## Related Actions

- [**GetActors**](./getactors) - Retrieve existing actors
- [**GetActor**](./getactor) - Get single actor information
- [**SendMessage**](./sendmessage) - Use actors for messaging
- [**SendCommand**](./sendcommand) - Execute commands via actors
- [**GetUser**](./getuser) - Associate actors with user data