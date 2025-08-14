---
sidebar_position: 35
title: "UpdateUser"
description: "Modify user profile information and attributes"
---

# UpdateUser

Updates specific fields in a user's profile with new values. Allows modification of user information such as name, title, description, and other profile attributes.

## Syntax

```newo
UpdateUser(
  name: str,
  value: str
)
```

## Parameters

### Required Parameters

- **`name`** (string): The user field to update. Options:
  - `"title"` - User's title or role
  - `"description"` - User description or bio  
  - `"name"` - User's display name
  - `"email"` - User's email address
  - `"phone"` - User's phone number
  - `"language"` - User's preferred language
  - `"timezone"` - User's timezone setting

- **`value`** (string): The new value to assign to the specified field

## Return Values

- **Success confirmation**: Operation completed successfully
- **Error message**: Field update failed or field not found

## How It Works

1. **Field Validation**: Verifies the specified field can be updated
2. **Value Assignment**: Updates the field with the new value
3. **Profile Update**: Saves changes to user profile
4. **Confirmation**: Returns success or error status

## Use Cases

### Basic Profile Updates
```newo
{{!-- Update user's display name --}}
{{UpdateUser(name="name", value="John Smith")}}
{{SendMessage(message="Your name has been updated successfully!")}}

{{!-- Update user's email --}}
{{Set(name="new_email", value=GetTriggeredAct())}}
{{UpdateUser(name="email", value=new_email)}}
{{SendMessage(message=Concat("Email updated to: ", new_email))}}
```

### Interactive Profile Management
```newo
{{!-- Let user update their title --}}
{{SendMessage(message="What would you like your title to be?")}}
{{Set(name="user_input", value=GetTriggeredAct())}}
{{UpdateUser(name="title", value=user_input)}}
{{SendMessage(message=Concat("Your title is now: ", user_input))}}
```

### Language Preferences
```newo
{{!-- Update user's language preference --}}
{{Set(name="selected_language", value=GetState(name="language_choice"))}}
{{UpdateUser(name="language", value=selected_language)}}
{{SendMessage(message="Language preference updated successfully")}}
{{SetState(name="language_updated", value="true")}}
```

### Contact Information Updates
```newo
{{!-- Update phone number with validation --}}
{{Set(name="phone_input", value=GetTriggeredAct())}}
{{#if IsEmpty(text=phone_input)}}
  {{SendMessage(message="Please provide a valid phone number")}}
{{else}}
  {{UpdateUser(name="phone", value=phone_input)}}
  {{SendMessage(message="Phone number updated successfully")}}
{{/if}}
```

## Advanced Patterns

### Profile Completion Workflow
```newo
{{!-- Guide user through profile completion --}}
{{Set(name="current_name", value=GetUser(field="name"))}}
{{Set(name="current_email", value=GetUser(field="email"))}}

{{#if IsEmpty(text=current_name)}}
  {{SendMessage(message="Let's complete your profile! What's your name?")}}
  {{Set(name="user_name", value=GetTriggeredAct())}}
  {{UpdateUser(name="name", value=user_name)}}
{{else}}
  {{#if IsEmpty(text=current_email)}}
    {{SendMessage(message="What's your email address?")}}
    {{Set(name="user_email", value=GetTriggeredAct())}}
    {{UpdateUser(name="email", value=user_email)}}
  {{else}}
    {{SendMessage(message="Your profile is complete!")}}
  {{/if}}
{{/if}}
```

### Preference Management
```newo
{{!-- Update multiple preferences based on user choices --}}
{{Set(name="timezone_choice", value=GetState(name="selected_timezone"))}}
{{Set(name="language_choice", value=GetState(name="selected_language"))}}

{{#if IsEmpty(text=timezone_choice)}}
  {{SendMessage(message="Please select your timezone first")}}
{{else}}
  {{UpdateUser(name="timezone", value=timezone_choice)}}
  {{#if IsEmpty(text=language_choice)}}
    {{SendMessage(message="Timezone updated. Please select your language.")}}
  {{else}}
    {{UpdateUser(name="language", value=language_choice)}}
    {{SendMessage(message="All preferences updated successfully!")}}
  {{/if}}
{{/if}}
```

### Conditional Updates
```newo
{{!-- Update only if user confirms changes --}}
{{Set(name="confirmation", value=GetState(name="update_confirmed"))}}
{{Set(name="new_title", value=GetState(name="pending_title"))}}

{{#if IsSimilar(text1=confirmation, text2="yes")}}
  {{UpdateUser(name="title", value=new_title)}}
  {{SendMessage(message="Title updated successfully!")}}
  {{SetState(name="update_confirmed", value="")}}
  {{SetState(name="pending_title", value="")}}
{{else}}
  {{SendMessage(message="Update cancelled. Your title remains unchanged.")}}
{{/if}}
```

### Profile Validation
```newo
{{!-- Validate and update user information --}}
{{Set(name="email_input", value=GetTriggeredAct())}}
{{#if IsSimilar(text1=email_input, text2="*@*")}}  {{!-- Basic email validation --}}
  {{UpdateUser(name="email", value=email_input)}}
  {{SendMessage(message="Email updated and verified!")}}
{{else}}
  {{SendMessage(message="Please enter a valid email address (must contain @)")}}
{{/if}}
```

## Integration Examples

### With State Management
```newo
{{!-- Track update history --}}
{{UpdateUser(name="description", value="Updated profile description")}}
{{SetState(name="last_profile_update", value=GetDateTime())}}
{{SetState(name="profile_version", value="1.2")}}
{{SendMessage(message="Profile updated and changes logged")}}
```

### With AI Generation
```newo
{{!-- Generate and set user description --}}
{{Set(name="user_interests", value=GetState(name="user_interests"))}}
{{#system~}}
Generate a professional user description based on these interests: {{user_interests}}
Keep it concise and professional.
{{~/system}}

{{#assistant~}}
{{Gen(name="generated_description")}}
{{~/assistant}}

{{UpdateUser(name="description", value=generated_description)}}
{{SendMessage(message="I've created a professional description for your profile!")}}
```

### With Actor Management
```newo
{{!-- Update user info and notify all channels --}}
{{UpdateUser(name="name", value="New Display Name")}}
{{Set(name="all_actors", value=GetActors())}}
{{SendMessage(
  message="Your display name has been updated across all communication channels",
  actorIds=all_actors
)}}
```

### With External Systems
```newo
{{!-- Sync user updates with external systems --}}
{{UpdateUser(name="email", value=new_email_address)}}
{{SendCommand(
  command="sync_user_profile",
  user_id=GetUser(field="id"),
  updated_field="email",
  new_value=new_email_address
)}}
```

## Update Categories

### Personal Information
```newo
{{!-- Update basic personal details --}}
{{UpdateUser(name="name", value="John Doe")}}
{{UpdateUser(name="title", value="Senior Developer")}}
{{UpdateUser(name="description", value="Full-stack developer with 8+ years experience")}}
```

### Contact Preferences
```newo
{{!-- Update communication preferences --}}
{{UpdateUser(name="email", value="john.doe@company.com")}}
{{UpdateUser(name="phone", value="+1-555-123-4567")}}
{{UpdateUser(name="language", value="en")}}
```

### System Preferences
```newo
{{!-- Update system and localization settings --}}
{{UpdateUser(name="timezone", value="America/New_York")}}
{{UpdateUser(name="language", value="es")}}
```

## Error Handling

### Field Validation
```newo
{{!-- Validate field exists before updating --}}
{{Set(name="field_to_update", value="title")}}
{{Set(name="new_value", value="Manager")}}

{{!-- Attempt update with error handling --}}
{{UpdateUser(name=field_to_update, value=new_value)}}
{{SendMessage(message="Profile update completed")}}

{{!-- Verify update was successful --}}
{{Set(name="updated_value", value=GetUser(field=field_to_update))}}
{{#if IsSimilar(text1=updated_value, text2=new_value)}}
  {{SendMessage(message="Update confirmed successfully")}}
{{else}}
  {{SendMessage(message="Update may have failed. Please try again.")}}
  {{SendSystemEvent(eventIdn="profile_update_failed", field=field_to_update)}}
{{/if}}
```

### Permission Checks
```newo
{{!-- Ensure user has permission to update profile --}}
{{Set(name="user_id", value=GetUser(field="id"))}}
{{#if IsEmpty(text=user_id)}}
  {{SendMessage(message="Authentication required to update profile")}}
{{else}}
  {{UpdateUser(name="description", value="Updated description")}}
  {{SendMessage(message="Profile updated successfully")}}
{{/if}}
```

## Security Considerations

### Input Validation
- Validate all input before updating user fields
- Implement appropriate length limits
- Sanitize special characters where necessary
- Verify user permissions for updates

### Privacy Protection
```newo
{{!-- Log profile updates for security --}}
{{UpdateUser(name="email", value=new_email)}}
{{SendSystemEvent(
  eventIdn="profile_update",
  user_id=GetUser(field="id"),
  field="email",
  timestamp=GetDateTime()
)}}
```

## Limitations

- **Field Restrictions**: Only specific predefined fields can be updated
- **Validation Rules**: Updates must comply with field validation rules
- **Permission Requirements**: User must have appropriate permissions
- **Real-time Sync**: Changes may not be immediately reflected across all systems
- **Type Constraints**: All values converted to strings

## Related Actions

- [**GetUser**](./getuser) - Retrieve current user information
- [**SetState**](./setstate) - Store user preferences
- [**SendMessage**](./sendmessage) - Notify user of updates
- [**SendSystemEvent**](./sendsystemevent) - Log profile changes

## Performance Tips

- **Batch Updates**: Group related field updates when possible
- **Validate First**: Check current values before updating
- **Cache Results**: Store updated values in variables for reuse
- **Error Handling**: Always verify updates completed successfully