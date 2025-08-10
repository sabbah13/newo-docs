---
title: "Complete Newo Actions API Reference"
---

## Overview

**Actions** are code snippets added to Skill Scripts to access specific data or perform specific tasks. They are the building blocks of Digital Employee functionality within the Newo Intelligent Flow Framework.

Actions enable Digital Employees to:
- Access and manipulate data
- Communicate across channels
- Manage state and context
- Integrate with external systems
- Perform complex workflows

## Action Categories

### 🗣️ Communication Actions

#### SendMessage
Send direct messages to specific actors.

```newo
SendMessage(
  message: str,        # Message content
  actorIds: List[str]  # Target actor IDs
)
```

**Example:**
```newo
{{SendMessage(message="Hello! How can I help you today?", actorIds=GetActors())}}
```

#### SendSystemEvent
Send custom system events with arguments for internal orchestration.

```newo
SendSystemEvent(
  eventIdn: str,                    # Custom event identifier
  actorIds: List[str] | None,      # Target actors (current if None)
  global: Literal['true', 'false'], # Global broadcast flag
  **arguments: str                  # Arbitrary event arguments
)
```

**Example:**
```newo
{{SendSystemEvent(
  eventIdn="booking_initiated",
  customer_id=user_id,
  booking_type="restaurant",
  party_size=4
)}}
```

#### SendCommand
Execute connector commands for external system integration.

```newo
SendCommand(
  commandIdn: str,      # Command identifier
  integrationIdn: str,  # Integration type
  connectorIdn: str,    # Connector instance
  **arguments: str      # Command-specific arguments
)
```

**Common Command Examples:**
```newo
{{!-- Make phone calls --}}
{{SendCommand(
  commandIdn="make_call",
  integrationIdn="vapi",
  connectorIdn="vapi_caller",
  phoneNumber="+1234567890",
  greetingPhrase="Hello, how can I assist you today?"
)}}

{{!-- Send SMS --}}
{{SendCommand(
  commandIdn="send_message",
  integrationIdn="twilio_messenger",
  connectorIdn="sms_connector",
  text="Your appointment is confirmed!",
  phoneNumber=customer_phone
)}}

{{!-- Set timers --}}
{{SendCommand(
  commandIdn="set_timer",
  integrationIdn="program_timer",
  connectorIdn="reminder_timer",
  personaId=GetUser(field="id"),
  timerName="follow_up",
  interval="3600"  # 1 hour in seconds
)}}
```

### 🤖 AI Generation Actions

#### Gen
Generate AI responses with customizable parameters.

```newo
gen(
  name: str,           # Variable name for result storage
  temperature: float,  # Creativity level (0=exact, 1=creative)
  max_tokens: int,     # Maximum response tokens
  **kwargs            # Additional generation parameters
)
```

**Example:**
```newo
{{#assistant~}}
  {{gen(name="RESULT", temperature=0.7, max_tokens=500)}}
{{~/assistant}}
```

#### GenStream
Stream AI responses to actors in real-time.

```newo
GenStream(
  sendTo: str,         # Target type ("actors")
  actorIds: List[str], # Specific actor targets
  name: str,           # Result variable name
  **kwargs            # Generation parameters
)
```

**Example:**
```newo
{{Set(name="response", value=GenStream(
  sendTo="actors",
  actorIds=GetActors(),
  name="streaming_response"
))}}
```

### 📊 Data Management Actions

#### Set
Set local variables within skill execution.

```newo
Set(name: str, value: any)
```

**Example:**
```newo
{{Set(name="customer_name", value=GetUser(field="name"))}}
{{Set(name="booking_date", value=GetDateTime(format="date"))}}
```

#### GetState / SetState
Manage persistent Flow Instance state.

```newo
GetState(name: str)
SetState(name: str, value: any)
```

**Example:**
```newo
{{SetState(name="conversation_stage", value="collecting_details")}}
{{Set(name="current_stage", value=GetState(name="conversation_stage"))}}
```

### 👥 User & Customer Management Actions

#### GetUser
Retrieve user information fields.

```newo
GetUser(field: str)
```

**Example:**
```newo
{{Set(name="user_id", value=GetUser(field="id"))}}
{{Set(name="user_name", value=GetUser(field="name"))}}
```

#### UpdateUser
Update user data fields.

```newo
UpdateUser(**fields)
```

**Example:**
```newo
{{UpdateUser(
  phone=validated_phone,
  preferences=customer_preferences,
  last_interaction=GetDateTime()
)}}
```

#### GetCustomer / GetCustomerAttribute
Retrieve customer information.

```newo
GetCustomer()
GetCustomerAttribute(field: str)
```

**Example:**
```newo
{{Set(name="customer_data", value=GetCustomer())}}
{{Set(name="loyalty_status", value=GetCustomerAttribute(field="loyalty_tier"))}}
```

#### SetCustomerAttribute / SetCustomerMetadataAttribute
Update customer attributes and metadata.

```newo
SetCustomerAttribute(field: str, value: any)
SetCustomerMetadataAttribute(field: str, value: any)
```

**Example:**
```newo
{{SetCustomerAttribute(field="preferred_time", value="evening")}}
{{SetCustomerMetadataAttribute(field="booking_history", value=booking_list)}}
```

### 🎭 Persona Management Actions

#### CreatePersona
Create new persona instances.

```newo
CreatePersona(
  name: str,
  **attributes: any
)
```

**Example:**
```newo
{{Set(name="new_persona", value=CreatePersona(
  name="VIP Customer",
  tier="premium",
  preferences=special_requirements
))}}
```

#### GetPersona
Retrieve persona data by ID.

```newo
GetPersona(id: str)
```

**Example:**
```newo
{{Set(name="persona_data", value=GetPersona(id=user_persona_id))}}
```

#### SetPersonaAttribute / GetPersonaAttribute
Manage persona attributes.

```newo
SetPersonaAttribute(id: str, field: str, value: any)
GetPersonaAttribute(id: str, field: str)
```

**Example:**
```newo
{{SetPersonaAttribute(
  id=user_id,
  field="last_booking",
  value=booking_details
)}}

{{Set(name="booking_history", value=GetPersonaAttribute(
  id=user_id,
  field="booking_history"
))}}
```

### 🎬 Actor Management Actions

#### CreateActor
Create new actor instances for communication channels.

```newo
CreateActor(
  integrationIdn: str,
  connectorIdn: str,
  externalId: str,
  personaId: str,
  timeZone: str,
  **attributes: any
)
```

**Example:**
```newo
{{Set(name="sms_actor", value=CreateActor(
  integrationIdn="twilio_messenger",
  connectorIdn="sms_connector",
  externalId=phone_number,
  personaId=customer_persona_id,
  timeZone="America/New_York"
))}}
```

#### GetActor / GetActors
Retrieve actor information.

```newo
GetActor(field: str)
GetActors(
  personaId: str,
  integrationIdn: str,
  connectorIdn: str
)
```

**Example:**
```newo
{{Set(name="current_actor", value=GetActor(field="id"))}}
{{Set(name="customer_actors", value=GetActors(
  personaId=customer_id,
  integrationIdn="system",
  connectorIdn="omnichannel"
))}}
```

#### GetLatestMessageActor
Get the most recent message actor.

```newo
GetLatestMessageActor()
```

**Example:**
```newo
{{Set(name="last_actor", value=GetLatestMessageActor())}}
```

### 🔧 Agent Management Actions

#### GetAgent
Get current agent information.

```newo
GetAgent()
```

**Example:**
```newo
{{Set(name="agent_info", value=GetAgent())}}
```

#### SetAgent / UpdateAgent
Manage agent configuration.

```newo
SetAgent(**attributes)
UpdateAgent(**attributes)
```

**Example:**
```newo
{{UpdateAgent(
  status="active",
  last_update=GetDateTime(),
  performance_metrics=current_metrics
)}}
```

### 🕐 Temporal & Context Actions

#### GetDateTime
Get formatted date/time with timezone support.

```newo
GetDateTime(
  format: Literal["datetime", "date", "time"],
  timezone: str,
  weekday: str
)
```

**Examples:**
```newo
{{Set(name="current_date", value=GetDateTime(format="date"))}}
{{Set(name="booking_time", value=GetDateTime(
  format="datetime",
  timezone="America/Los_Angeles",
  weekday="true"
))}}
```

#### GetDateInterval
Calculate date ranges and intervals.

```newo
GetDateInterval(start: str, end: str)
```

**Example:**
```newo
{{Set(name="duration", value=GetDateInterval(
  start=booking_start,
  end=booking_end
))}}
```

#### GetMemory
Retrieve conversation history and context.

```newo
GetMemory(
  fromPerson: Literal["User", "Agent", "Both"],
  offset: str,
  count: str,
  maxLen: str,
  asEnglishText: str,
  summarize: str,
  fromDate: str,
  toDate: str,
  filterByActorIds: str,
  filterByUserPersonaIds: str
)
```

**Examples:**
```newo
{{!-- Get recent conversation --}}
{{Set(name="recent_memory", value=GetMemory(
  count="10",
  maxLen="5000",
  fromPerson="Both"
))}}

{{!-- Get memory from specific date range --}}
{{Set(name="week_memory", value=GetMemory(
  fromDate="2024-01-01T00:00:00Z",
  toDate="2024-01-07T23:59:59Z",
  summarize="true"
))}}
```

#### GetTriggeredAct
Access information about the triggering event.

```newo
GetTriggeredAct(fields: List[str])
```

**Example:**
```newo
{{Set(name="trigger_info", value=GetTriggeredAct(
  fields=["text", "datetime", "person", "actorId"]
))}}
```

### 📚 Active Knowledge Base (AKB) Actions

#### SetAKB / GetAKB
Direct AKB operations for key-value storage.

```newo
SetAKB(key: str, value: any)
GetAKB(key: str)
```

**Example:**
```newo
{{SetAKB(key="business_hours", value=schedule_data)}}
{{Set(name="hours", value=GetAKB(key="business_hours"))}}
```

#### SetManualAKB
Create manual knowledge base entries.

```newo
SetManualAKB(key: str, content: str)
```

**Example:**
```newo
{{SetManualAKB(
  key="cancellation_policy",
  content="Customers can cancel up to 24 hours before appointment without penalty"
)}}
```

#### UpdateAKB / DeleteAKB
Manage AKB lifecycle.

```newo
UpdateAKB(key: str, updates: any)
DeleteAKB(key: str)
```

**Example:**
```newo
{{UpdateAKB(key="menu_items", updates=new_seasonal_menu)}}
{{DeleteAKB(key="outdated_promotion")}}
```

#### SearchSemanticAKB
Perform semantic search on knowledge base.

```newo
SearchSemanticAKB(
  query: str,
  maxResults: int
)
```

**Example:**
```newo
{{Set(name="policy_info", value=SearchSemanticAKB(
  query="booking cancellation policy",
  maxResults=3
))}}
```

#### SearchFuzzyAKB
Perform fuzzy text search on knowledge base.

```newo
SearchFuzzyAKB(
  query: str,
  maxResults: int
)
```

**Example:**
```newo
{{Set(name="menu_matches", value=SearchFuzzyAKB(
  query="vegetarian options",
  maxResults=5
))}}
```

### 🔤 String & Text Operations

#### Concat
Concatenate multiple strings.

```newo
Concat(str1: str, str2: str, ...)
```

**Example:**
```newo
{{Set(name="full_name", value=Concat(first_name, " ", last_name))}}
{{Set(name="confirmation", value=Concat(
  "Your booking for ",
  party_size,
  " people on ",
  booking_date,
  " is confirmed!"
))}}
```

#### Stringify
Convert values to string representation.

```newo
Stringify(value: any)
```

**Example:**
```newo
{{Set(name="booking_id_str", value=Stringify(booking_id))}}
```

#### Summarize
Create text summaries with token limits.

```newo
Summarize(text: str, maxTokens: int)
```

**Example:**
```newo
{{Set(name="conversation_summary", value=Summarize(
  text=long_conversation_history,
  maxTokens=200
))}}
```

#### Random
Generate random numbers within a range.

```newo
Random(min: int, max: int)
```

**Example:**
```newo
{{Set(name="confirmation_code", value=Random(min=100000, max=999999))}}
```

### 🗂️ JSON Operations

#### GetValueJSON
Extract values from JSON objects.

```newo
GetValueJSON(obj: object, key: str)
```

**Example:**
```newo
{{Set(name="customer_email", value=GetValueJSON(
  obj=customer_data,
  key="contact.email"
))}}
```

#### UpdateValueJSON
Update fields in JSON objects.

```newo
UpdateValueJSON(obj: object, key: str, value: any)
```

**Example:**
```newo
{{Set(name="updated_profile", value=UpdateValueJSON(
  obj=customer_profile,
  key="preferences.communication",
  value="email"
))}}
```

#### AsStringJSON
Convert objects to JSON string format.

```newo
AsStringJSON(object: any)
```

**Example:**
```newo
{{Set(name="booking_json", value=AsStringJSON(booking_details))}}
```

### 📝 Array Operations

#### CreateArray
Create new arrays with initial items.

```newo
CreateArray(*items: any)
```

**Example:**
```newo
{{Set(name="menu_categories", value=CreateArray(
  "appetizers", "mains", "desserts", "beverages"
))}}
```

#### AppendItemsArrayJSON
Add items to existing arrays.

```newo
AppendItemsArrayJSON(array: List, items: List)
```

**Example:**
```newo
{{Set(name="updated_preferences", value=AppendItemsArrayJSON(
  array=current_preferences,
  items=["outdoor_seating", "wifi_access"]
))}}
```

#### GetItemsArrayByIndexesJSON
Retrieve array items by index positions.

```newo
GetItemsArrayByIndexesJSON(array: List, indexes: List[int])
```

**Example:**
```newo
{{Set(name="selected_items", value=GetItemsArrayByIndexesJSON(
  array=menu_items,
  indexes=[0, 2, 5]
))}}
```

#### GetItemsArrayByPathJSON
Retrieve array items by path criteria.

```newo
GetItemsArrayByPathJSON(array: List, path: str)
```

**Example:**
```newo
{{Set(name="available_tables", value=GetItemsArrayByPathJSON(
  array=restaurant_tables,
  path="status.available"
))}}
```

#### GetIndexesOfItemsArrayJSON
Find indexes of items matching criteria.

```newo
GetIndexesOfItemsArrayJSON(array: List, criteria: any)
```

**Example:**
```newo
{{Set(name="veg_indexes", value=GetIndexesOfItemsArrayJSON(
  array=menu_items,
  criteria={"dietary": "vegetarian"}
))}}
```

#### ReplaceItemsArrayByIndexesJSON
Replace array items at specific indexes.

```newo
ReplaceItemsArrayByIndexesJSON(
  array: List,
  indexes: List[int],
  newItems: List
)
```

**Example:**
```newo
{{Set(name="updated_menu", value=ReplaceItemsArrayByIndexesJSON(
  array=current_menu,
  indexes=[3, 7],
  newItems=new_seasonal_dishes
))}}
```

#### ReplaceItemsArrayByPathJSON
Replace array items matching path criteria.

```newo
ReplaceItemsArrayByPathJSON(
  array: List,
  path: str,
  newItems: List
)
```

#### DeleteItemsArrayByIndexesJSON / DeleteItemsArrayByPathJSON
Remove items from arrays by index or path.

```newo
DeleteItemsArrayByIndexesJSON(array: List, indexes: List[int])
DeleteItemsArrayByPathJSON(array: List, path: str)
```

**Example:**
```newo
{{Set(name="cleaned_list", value=DeleteItemsArrayByIndexesJSON(
  array=customer_list,
  indexes=inactive_customer_indexes
))}}
```

### ✅ Validation & Comparison

#### IsEmpty
Check for empty or null values.

```newo
IsEmpty(text: str)
```

**Example:**
```newo
{{#if IsEmpty(text=customer_phone)}}
  {{SendMessage(message="Please provide your phone number.")}}
{{/if}}
```

#### IsSimilar
Compare semantic similarity between texts.

```newo
IsSimilar(text1: str, text2: str)
```

**Example:**
```newo
{{#if IsSimilar(text1=user_input, text2="I want to make a reservation")}}
  {{SendSystemEvent(eventIdn="start_booking_flow")}}
{{/if}}
```

#### IsGlobal
Check if running in global context.

```newo
IsGlobal()
```

**Example:**
```newo
{{#if IsGlobal()}}
  {{Set(name="context", value="global_system")}}
{{else}}
  {{Set(name="context", value="user_specific")}}
{{/if}}
```

### 🔄 Control Flow Actions

#### Return
Exit skill execution with optional return value.

```newo
Return(val?: any)
```

**Example:**
```newo
{{#if IsEmpty(text=required_field)}}
  {{SendMessage(message="Missing required information.")}}
  {{Return()}}
{{/if}}
```

#### Do
Execute conditional operations (implementation varies).

```newo
Do(condition: any, action: any)
```

## Advanced Usage Patterns

### 🔗 Chained Operations
```newo
{{Set(name="customer_data", value=GetUser())}}
{{Set(name="booking_history", value=GetPersonaAttribute(
  id=GetValueJSON(obj=customer_data, key="id"),
  field="bookings"
))}}
{{Set(name="recent_bookings", value=GetItemsArrayByPathJSON(
  array=booking_history,
  path="date.recent"
))}}
```

### 🎯 Conditional Logic
```newo
{{#if IsEmpty(text=customer_phone)}}
  {{SendMessage(message="We need your phone number to proceed.")}}
  {{SetState(name="stage", value="collecting_phone")}}
{{else}}
  {{SetCustomerAttribute(field="phone", value=customer_phone)}}
  {{SendSystemEvent(eventIdn="phone_validated", phone=customer_phone)}}
{{/if}}
```

### 🔄 Error Handling
```newo
{{Set(name="booking_result", value=SendCommand(
  commandIdn="create_booking",
  integrationIdn="booking_system",
  connectorIdn="restaurant_connector",
  booking_data=booking_details
))}}

{{#if IsEmpty(text=booking_result)}}
  {{SendMessage(message="I'm sorry, there was an issue with your booking. Let me try again.")}}
  {{SendSystemEvent(eventIdn="booking_failed", retry="true")}}
{{else}}
  {{SendMessage(message=Concat("Great! Your booking is confirmed. Reference: ", booking_result))}}
{{/if}}
```

### 📊 Memory Management
```newo
{{Set(name="conversation_context", value=GetMemory(
  count="20",
  maxLen="10000",
  fromPerson="Both",
  summarize="true"
))}}

{{Set(name="customer_preferences", value=SearchSemanticAKB(
  query=Concat("customer preferences ", GetUser(field="name")),
  maxResults=5
))}}
```

## Best Practices

### 🎯 Performance Optimization
- Use `maxLen` and `count` parameters to limit memory retrieval
- Cache frequently accessed data using `SetAKB`
- Use `summarize="true"` for long conversation histories

### 🔒 Security Considerations
- Never log sensitive customer information
- Validate all user inputs before processing
- Use proper error handling for external system calls

### 📈 Maintainability
- Use descriptive variable names
- Comment complex logic flows
- Structure conditional logic clearly
- Group related operations logically

This comprehensive reference covers all available Newo Actions for building sophisticated Digital Employee workflows within the Newo Intelligent Flow Framework.