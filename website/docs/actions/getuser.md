---
sidebar_position: 10
title: "GetUser"
description: "Retrieve user information and attributes from the current session"
---

# GetUser

Retrieves specific user information and attributes from the current conversation session. Access user profile data, preferences, and metadata for personalization.

## Syntax

```newo
GetUser(
  field: str = "name",
  personaId: str | None = None
)
```

## Parameters

### Optional Parameters

- **`field`** (string): The user field to retrieve. Options:
  - `"id"` - Unique user identifier
  - `"name"` - User's display name (default)
  - `"title"` - User's title or role
  - `"description"` - User description or bio
  - `"type"` - User type classification
  - `"email"` - User's email address
  - `"phone"` - User's phone number
  - `"language"` - User's preferred language
  - `"timezone"` - User's timezone setting

- **`personaId`** (string | null): Specific persona ID to query (defaults to current user)

## Return Values

- **String**: The requested field value
- **Empty string**: Field not set or doesn't exist
- **Null**: User or persona not found

## How It Works

1. **Session Context**: Identifies current user from active session
2. **Field Resolution**: Retrieves specified field from user profile
3. **Persona Handling**: Uses personaId if provided, otherwise current user
4. **Value Return**: Returns field value or empty string if not found

## Use Cases

### Basic User Information
```newo
{{!-- Get user's name for personalization --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{SendMessage(message=Concat("Hello ", user_name, "! How can I help you today?"))}}

{{!-- Get user ID for logging --}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{SendSystemEvent(eventIdn="user_action", userId=user_id)}}
```

### Personalized Messaging
```newo
{{!-- Language-aware responses --}}
{{Set(name="user_language", value=GetUser(field="language"))}}
{{#if IsSimilar(text1=user_language, text2="es")}}
  {{SendMessage(message="¡Hola! ¿Cómo puedo ayudarte?")}}
{{else}}
  {{SendMessage(message="Hello! How can I help you?")}}
{{/if}}
```

### Contact Information
```newo
{{!-- Send confirmation to user's contact info --}}
{{Set(name="user_email", value=GetUser(field="email"))}}
{{Set(name="user_phone", value=GetUser(field="phone"))}}

{{#if IsEmpty(text=user_email)}}
  {{SendMessage(message="Please provide your email for confirmation")}}
{{else}}
  {{SendMessage(message=Concat("Confirmation sent to ", user_email))}}
{{/if}}
```

### Role-Based Logic
```newo
{{!-- Different behavior based on user type --}}
{{Set(name="user_type", value=GetUser(field="type"))}}
{{#if IsSimilar(text1=user_type, text2="admin")}}
  {{SendMessage(message="Admin panel access granted")}}
{{else}}
  {{SendMessage(message="Welcome to the customer portal")}}
{{/if}}
```

## Advanced Patterns

### User Profile Completion Check
```newo
{{!-- Check if user profile is complete --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{Set(name="user_email", value=GetUser(field="email"))}}
{{Set(name="user_phone", value=GetUser(field="phone"))}}

{{Set(name="missing_fields", value="")}}
{{#if IsEmpty(text=user_name)}}
  {{Set(name="missing_fields", value=Concat(missing_fields, "name, "))}}
{{/if}}
{{#if IsEmpty(text=user_email)}}
  {{Set(name="missing_fields", value=Concat(missing_fields, "email, "))}}
{{/if}}

{{#if IsEmpty(text=missing_fields)}}
  {{SendMessage(message="Your profile is complete!")}}
{{else}}
  {{SendMessage(message=Concat("Please update these fields: ", missing_fields))}}
{{/if}}
```

### Timezone-Aware Scheduling
```newo
{{!-- Adjust scheduling based on user timezone --}}
{{Set(name="user_timezone", value=GetUser(field="timezone"))}}
{{Set(name="current_time", value=GetDateTime(timezone=user_timezone))}}

{{SendMessage(message=Concat(
  "Based on your timezone (", user_timezone, "), ",
  "the current time is ", current_time
))}}
```

### Personalized Recommendations
```newo
{{!-- Use user info for recommendations --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{Set(name="user_type", value=GetUser(field="type"))}}

{{#system~}}
Generate personalized recommendations for {{user_name}} who is a {{user_type}} user.
{{~/system}}

{{#assistant~}}
{{Gen(name="recommendations")}}
{{~/assistant}}

{{SendMessage(message=recommendations)}}
```

### Multi-User Context
```newo
{{!-- Work with specific persona IDs --}}
{{Set(name="admin_info", value=GetUser(field="name", personaId="admin_123"))}}
{{Set(name="current_user", value=GetUser(field="name"))}}

{{SendMessage(message=Concat(
  "Hello ", current_user, 
  ". You're chatting with admin: ", admin_info
))}}
```

## Integration Examples

### With State Management
```newo
{{!-- Store user preference in state --}}
{{Set(name="user_preference", value=GetUser(field="language"))}}
{{SetState(name="user_language_pref", value=user_preference)}}

{{!-- Use stored preference later --}}
{{Set(name="stored_pref", value=GetState(name="user_language_pref"))}}
{{SendMessage(message=Concat("Your preferred language: ", stored_pref))}}
```

### With Actor Targeting
```newo
{{!-- Send to specific user channels --}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{Set(name="user_actors", value=GetActors(personaId=user_id))}}

{{SendMessage(
  message="Important notification for you",
  actorIds=user_actors
)}}
```

### With External Systems
```newo
{{!-- Pass user info to external services --}}
{{Set(name="user_email", value=GetUser(field="email"))}}
{{Set(name="user_name", value=GetUser(field="name"))}}

{{SendCommand(
  command="create_ticket",
  user_email=user_email,
  user_name=user_name,
  issue="Support request"
)}}
```

### With Conditional Logic
```newo
{{!-- Branch logic based on user attributes --}}
{{Set(name="user_title", value=GetUser(field="title"))}}

{{#if IsSimilar(text1=user_title, text2="Premium")}}
  {{SendMessage(message="Welcome to Premium Support! Let me prioritize your request.")}}
  {{SetState(name="support_level", value="premium")}}
{{else}}
  {{SendMessage(message="How can I help you today?")}}
  {{SetState(name="support_level", value="standard")}}
{{/if}}
```

## Error Handling

### Validate User Existence
```newo
{{!-- Check if user data is available --}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{#if IsEmpty(text=user_id)}}
  {{SendMessage(message="Unable to identify user. Please log in again.")}}
  {{SendSystemEvent(eventIdn="auth_error", message="User session invalid")}}
{{else}}
  {{SendMessage(message="User authenticated successfully")}}
{{/if}}
```

### Handle Missing Fields
```newo
{{!-- Gracefully handle missing user data --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{#if IsEmpty(text=user_name)}}
  {{Set(name="display_name", value="Guest User")}}
{{else}}
  {{Set(name="display_name", value=user_name)}}
{{/if}}

{{SendMessage(message=Concat("Welcome, ", display_name, "!"))}}
```

## Security Considerations

### Data Privacy
- Only access necessary user fields
- Avoid logging sensitive information
- Use appropriate persona contexts
- Implement proper access controls

### Field Validation
```newo
{{!-- Validate sensitive operations --}}
{{Set(name="user_type", value=GetUser(field="type"))}}
{{#if IsSimilar(text1=user_type, text2="admin")}}
  {{!-- Allow admin operations --}}
{{else}}
  {{SendMessage(message="Access denied: Insufficient permissions")}}
  {{SendSystemEvent(eventIdn="security_violation", action="admin_access_attempted")}}
{{/if}}
```

## Limitations

- **Session Dependency**: Requires active user session
- **Field Availability**: Not all fields available for all users
- **Real-time Updates**: May not reflect immediate profile changes
- **Privacy Limits**: Some fields may be restricted based on privacy settings
- **Persona Context**: PersonaId parameter behavior may vary by implementation

## Related Actions

- [**UpdateUser**](./updateuser) - Modify user information
- [**GetActors**](./getactors) - Get user's communication channels
- [**SetState**](./setstate) - Store user preferences
- [**SendMessage**](./sendmessage) - Send personalized messages

## Performance Tips

- **Cache User Data**: Store frequently accessed user info in variables
- **Batch Field Access**: Get multiple fields in sequence for efficiency
- **Validate Once**: Check user existence early in skill execution
- **Use Appropriate Fields**: Only request fields actually needed