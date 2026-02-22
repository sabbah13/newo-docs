/**
 * Built-in action definitions for Newo DSL.
 * Extracted from packages/dsl-lsp-server/src/server.ts
 */

import { ActionDefinition } from './types';

export const ACTIONS: Record<string, ActionDefinition> = {
  // ============================================================================
  // MESSAGING & COMMUNICATION
  // ============================================================================

  SendMessage: {
    description: "Send direct messages to specific actors across all communication channels (SMS, email, chat, voice)",
    category: "messaging",
    syntax: "SendMessage(message, actorIds?, useFilter?)",
    parameters: {
      message: { type: "string", required: true, description: "The message content to send" },
      actorIds: { type: "List[str]", required: false, default: "GetActors()", description: "Target actor IDs" },
      useFilter: { type: "boolean", required: false, default: "false", description: "Remove content within [[[text]]] brackets" }
    },
    returns: "void",
    example: '{{SendMessage(message="Hello! How can I help you?")}}'
  },

  SendCommand: {
    description: "Execute commands on external connectors (VAPI voice calls, Twilio SMS, program timers, etc.)",
    category: "integration",
    syntax: "SendCommand(commandIdn, integrationIdn, connectorIdn, **args)",
    parameters: {
      commandIdn: { type: "string", required: true, description: "Command to execute (make_call, send_message, set_timer)" },
      integrationIdn: { type: "string", required: true, description: "Integration type: vapi, twilio_messenger, program_timer, email" },
      connectorIdn: { type: "string", required: true, description: "Connector instance identifier" }
    },
    returns: "string - Command result or acknowledgment",
    example: '{{SendCommand(commandIdn="make_call", integrationIdn="vapi", connectorIdn="vapi_caller", phoneNumber="+1234567890")}}'
  },

  SendSystemEvent: {
    description: "Broadcast internal system events for logging, analytics, and inter-skill communication",
    category: "system",
    syntax: "SendSystemEvent(eventIdn, **arguments)",
    parameters: {
      eventIdn: { type: "string", required: true, description: "Event identifier for categorization and routing" }
    },
    returns: "void",
    example: '{{SendSystemEvent(eventIdn="user_action", userId=GetUser(field="id"))}}'
  },

  // ============================================================================
  // VARIABLES & STATE
  // ============================================================================

  Set: {
    description: "Assign values to local variables within skill execution scope",
    category: "variables",
    syntax: "Set(name, value, expose?)",
    parameters: {
      name: { type: "string", required: true, description: "Variable name (must be valid identifier)" },
      value: { type: "any", required: true, description: "Value to assign" },
      expose: { type: "boolean", required: false, default: "false", description: "Expose variable to parent scope" }
    },
    returns: "void",
    example: '{{Set(name="user_name", value=GetUser(field="name"))}}'
  },

  GetState: {
    description: "Retrieve persistent state data that survives across skill executions within the flow",
    category: "state",
    syntax: "GetState(name)",
    parameters: {
      name: { type: "string", required: true, description: "State variable name to retrieve" }
    },
    returns: "any - The stored state value or empty string if not found",
    example: '{{Set(name="step", value=GetState(name="booking_step"))}}'
  },

  SetState: {
    description: "Store persistent state data accessible across skill executions within the flow",
    category: "state",
    syntax: "SetState(name, value)",
    parameters: {
      name: { type: "string", required: true, description: "State variable name to store" },
      value: { type: "any", required: true, description: "Value to persist" }
    },
    returns: "void",
    example: '{{SetState(name="booking_step", value="2")}}'
  },

  // ============================================================================
  // CUSTOMER/PROJECT ATTRIBUTES (NOT deprecated - widely used!)
  // ============================================================================

  GetCustomerAttribute: {
    description: "Retrieve project/customer attribute values. Used for project settings, business info, and configuration",
    category: "attributes",
    syntax: "GetCustomerAttribute(field)",
    parameters: {
      field: { type: "string", required: true, description: "Attribute field name (e.g., project_business_time_zone, project_attributes_*)" }
    },
    returns: "string - Attribute value or empty string if not found",
    example: '{{GetCustomerAttribute(field="project_business_time_zone")}}'
  },

  SetCustomerAttribute: {
    description: "Set project/customer attribute values. Used to store project settings and configuration",
    category: "attributes",
    syntax: "SetCustomerAttribute(field, value)",
    parameters: {
      field: { type: "string", required: true, description: "Attribute field name" },
      value: { type: "any", required: true, description: "Value to set" }
    },
    returns: "void",
    example: '{{SetCustomerAttribute(field="project_attributes_last_updated", value=GetDateTime())}}'
  },

  SetCustomerMetadataAttribute: {
    description: "Set metadata properties for customer attributes (title, group, is_hidden, value_type, description, possible_values)",
    category: "attributes",
    syntax: "SetCustomerMetadataAttribute(idn, field, value)",
    parameters: {
      idn: { type: "string", required: true, description: "The attribute identifier to set metadata for" },
      field: { type: "string", required: true, description: "Metadata field: title, group, is_hidden, value_type, description, possible_values" },
      value: { type: "any", required: true, description: "Value to set for the metadata field" }
    },
    returns: "void",
    example: '{{SetCustomerMetadataAttribute(idn="my_attribute", field="title", value="My Attribute Title")}}'
  },

  GetCustomerMetadataAttribute: {
    description: "Get metadata property value for a customer attribute",
    category: "attributes",
    syntax: "GetCustomerMetadataAttribute(idn)",
    parameters: {
      idn: { type: "string", required: true, description: "The attribute identifier to get metadata for" }
    },
    returns: "any - The metadata value",
    example: '{{GetCustomerMetadataAttribute(idn="my_attribute")}}'
  },

  // ============================================================================
  // PROJECT ATTRIBUTES (project-level settings)
  // ============================================================================

  GetProjectAttribute: {
    description: "Retrieve project attribute value. Used for project-level settings and configuration",
    category: "attributes",
    syntax: "GetProjectAttribute(field)",
    parameters: {
      field: { type: "string", required: true, description: "Project attribute field name" }
    },
    returns: "string - Attribute value or empty string if not found",
    example: '{% set enabled = GetProjectAttribute(field="project_attributes_setting_init_attributes_metadata_enabled") %}'
  },

  SetProjectAttribute: {
    description: "Set project attribute value. Used to store project-level settings and configuration",
    category: "attributes",
    syntax: "SetProjectAttribute(field, value)",
    parameters: {
      field: { type: "string", required: true, description: "Project attribute field name" },
      value: { type: "any", required: true, description: "Value to set" }
    },
    returns: "void",
    example: '{{SetProjectAttribute(field="project_attributes_setting_init_attributes_metadata_enabled", value="True")}}'
  },

  SetProjectMetadataAttribute: {
    description: "Set metadata properties for project attributes. Supports setting multiple fields at once with field='multiple_fields'",
    category: "attributes",
    syntax: "SetProjectMetadataAttribute(idn, field, value)",
    parameters: {
      idn: { type: "string", required: true, description: "The project attribute identifier to set metadata for" },
      field: { type: "string", required: true, description: "Metadata field: title, description, group, value_type, is_hidden, or 'multiple_fields' for batch update" },
      value: { type: "any", required: true, description: "Value to set - object when field='multiple_fields', otherwise string/boolean" }
    },
    returns: "void",
    example: '{{SetProjectMetadataAttribute(idn="my_attr", field="multiple_fields", value={"title": "My Attribute", "group": "Settings", "value_type": "bool", "is_hidden": True})}}'
  },

  // ============================================================================
  // CONNECTORS
  // ============================================================================

  GetConnectorInfo: {
    description: "Get information about a connector instance. Returns connector details or specific field value",
    category: "connectors",
    syntax: "GetConnectorInfo(integrationIdn, connectorIdn, field?)",
    parameters: {
      integrationIdn: { type: "string", required: true, description: "Integration type identifier" },
      connectorIdn: { type: "string", required: true, description: "Connector instance identifier" },
      field: { type: "string", required: false, description: "Specific field to retrieve (optional)" }
    },
    returns: "object | string - Connector info object or specific field value, empty if not found",
    example: '{% set connector_info = GetConnectorInfo(integrationIdn="cal_com", connectorIdn="main_calendar") %}'
  },

  CreateConnector: {
    description: "Create a new connector instance for an integration",
    category: "connectors",
    syntax: "CreateConnector(integrationIdn, connectorIdn, title, settings?, start?)",
    parameters: {
      integrationIdn: { type: "string", required: true, description: "Integration type identifier" },
      connectorIdn: { type: "string", required: true, description: "Unique connector instance identifier" },
      title: { type: "string", required: true, description: "Display title for the connector" },
      settings: { type: "object", required: false, default: "{}", description: "Connector configuration settings" },
      start: { type: "boolean", required: false, default: "true", description: "Whether to start the connector immediately" }
    },
    returns: "void",
    example: '{{CreateConnector(integrationIdn="cal_com", connectorIdn="main_calendar", title="Main Calendar", settings={}, start=true)}}'
  },

  DeleteConnector: {
    description: "Delete an existing connector instance",
    category: "connectors",
    syntax: "DeleteConnector(integrationIdn, connectorIdn)",
    parameters: {
      integrationIdn: { type: "string", required: true, description: "Integration type identifier" },
      connectorIdn: { type: "string", required: true, description: "Connector instance identifier to delete" }
    },
    returns: "void",
    example: '{{DeleteConnector(integrationIdn="cal_com", connectorIdn="old_calendar")}}'
  },

  // ============================================================================
  // PERSONA & ACTOR CREATION
  // ============================================================================

  CreatePersona: {
    description: "Create a new persona instance with the given name",
    category: "persona",
    syntax: "CreatePersona(name)",
    parameters: {
      name: { type: "string", required: true, description: "Name for the new persona" }
    },
    returns: "string - The ID of the created persona",
    example: '{% set persona_id = CreatePersona(name="SetupPersona") | string %}'
  },

  CreateActor: {
    description: "Create a new actor (communication channel) for a persona",
    category: "actors",
    syntax: "CreateActor(integrationIdn, connectorIdn, externalId, personaId)",
    parameters: {
      integrationIdn: { type: "string", required: true, description: "Integration type identifier" },
      connectorIdn: { type: "string", required: true, description: "Connector instance identifier" },
      externalId: { type: "string", required: true, description: "External identifier for the actor" },
      personaId: { type: "string", required: true, description: "Persona ID to associate the actor with" }
    },
    returns: "string - The ID of the created actor",
    example: '{{CreateActor(integrationIdn="twilio_messenger", connectorIdn="sms", externalId="+1234567890", personaId=persona_id)}}'
  },

  // ============================================================================
  // AI GENERATION
  // ============================================================================

  Gen: {
    description: "Generate AI responses. Can be used inline or with Set(). Supports JSON schema validation",
    category: "ai",
    syntax: "Gen(name?, temperature?, topP?, maxTokens?, jsonSchema?, validateSchema?, skipFilter?, thinkingBudget?)",
    parameters: {
      name: { type: "string", required: false, description: "Variable name to store result (optional when used inline)" },
      temperature: { type: "float", required: false, default: "0.75", description: "Controls randomness (0.0-2.0)" },
      topP: { type: "float", required: false, default: "1.0", description: "Nucleus sampling (0.0-1.0)" },
      maxTokens: { type: "int", required: false, description: "Maximum response length" },
      jsonSchema: { type: "object", required: false, description: "JSON Schema for structured output" },
      validateSchema: { type: "string", required: false, description: "Enable schema validation ('True')" },
      skipFilter: { type: "boolean", required: false, default: "false", description: "Bypass content moderation" },
      thinkingBudget: { type: "int", required: false, description: "Token budget for reasoning" }
    },
    returns: "string - Generated content",
    example: '{% set result = Gen(jsonSchema=schema, validateSchema="True", temperature=0.2, topP=0) %}'
  },

  // ============================================================================
  // USER & PERSONA
  // ============================================================================

  GetUser: {
    description: "Retrieve user information from current session. Returns user object or specific field",
    category: "user",
    syntax: "GetUser(field?) or GetUser().property",
    parameters: {
      field: { type: "string", required: false, description: "Field: id, name, title, email, phone, language, timezone" }
    },
    returns: "User object or string field value. Supports .id, .name property access",
    example: '{{GetUser(field="name")}} or {{GetUser().id | string}}'
  },

  UpdateUser: {
    description: "Modify user information and attributes in the current session",
    category: "user",
    syntax: "UpdateUser(field|name, value)",
    parameters: {
      field: { type: "string", required: false, description: "User field to update (alias: name)" },
      name: { type: "string", required: false, description: "User field to update (alias for field)" },
      value: { type: "string", required: true, description: "New value for the field" }
    },
    returns: "void",
    example: '{{UpdateUser(field="name", value=user_name)}}'
  },

  GetPersonaAttribute: {
    description: "Retrieve persona-specific attribute value",
    category: "persona",
    syntax: "GetPersonaAttribute(id, field)",
    parameters: {
      id: { type: "string", required: true, description: "Persona ID (userId)" },
      field: { type: "string", required: true, description: "Attribute field name" }
    },
    returns: "string - Attribute value",
    example: '{{GetPersonaAttribute(id=userId, field="working_hours_status")}}'
  },

  SetPersonaAttribute: {
    description: "Set persona-specific attribute value",
    category: "persona",
    syntax: "SetPersonaAttribute(id, field, value)",
    parameters: {
      id: { type: "string", required: true, description: "Persona ID (userId)" },
      field: { type: "string", required: true, description: "Attribute field name" },
      value: { type: "any", required: true, description: "Value to set" }
    },
    returns: "void",
    example: '{{SetPersonaAttribute(id=userId, field="working_hours_status", value=working_hours_status)}}'
  },

  GetAgentPersona: {
    description: "Retrieve the agent's persona configuration and attributes",
    category: "persona",
    syntax: "GetAgentPersona(field?)",
    parameters: {
      field: { type: "string", required: false, description: "Specific persona field to retrieve" }
    },
    returns: "string - Agent persona information",
    example: '{{GetAgentPersona(field="name")}}'
  },

  // ============================================================================
  // ACTORS & CHANNELS
  // ============================================================================

  GetActors: {
    description: "Retrieve actor IDs for targeting messages to specific communication channels",
    category: "actors",
    syntax: "GetActors(integrationIdn?, connectorIdn?, personaId?, externalId?)",
    parameters: {
      integrationIdn: { type: "string", required: false, description: "Filter by integration: vapi, twilio_messenger, newo_voice, system" },
      connectorIdn: { type: "string", required: false, description: "Filter by specific connector" },
      personaId: { type: "string", required: false, description: "Filter by user persona ID" },
      externalId: { type: "string", required: false, description: "Filter by external ID (e.g., phone number)" }
    },
    returns: "List[str] - Array of matching actor IDs",
    example: '{{GetActors(integrationIdn="twilio_messenger", connectorIdn="sms_connector", externalId=phoneNumber)}}'
  },

  GetActor: {
    description: "Get information about the current or specified actor (communication channel)",
    category: "actors",
    syntax: "GetActor(field?, id?)",
    parameters: {
      field: { type: "string", required: false, description: "Actor field: id, integrationIdn, connectorIdn, externalId, name" },
      id: { type: "string", required: false, description: "Specific actor ID to query (defaults to current actor)" }
    },
    returns: "string - Actor field value",
    example: '{{GetActor(field="integrationIdn")}}'
  },

  // ============================================================================
  // MEMORY & CONTEXT
  // ============================================================================

  GetMemory: {
    description: "Retrieve conversation history with filtering and processing options",
    category: "memory",
    syntax: "GetMemory(fromPerson?, offset?, count?, maxLen?, summarize?, filterByActorIds?, fromDate?, toDate?)",
    parameters: {
      fromPerson: { type: "string", required: false, default: "Both", description: "Filter: User, Agent, or Both", allowed: ["User", "Agent", "Both"] },
      offset: { type: "string", required: false, default: "0", description: "Skip recent conversation turns" },
      count: { type: "string", required: false, default: "10", description: "Number of turns to retrieve" },
      maxLen: { type: "string", required: false, default: "5000", description: "Maximum character limit" },
      asEnglishText: { type: "string", required: false, default: "false", description: "Auto-translate to English" },
      summarize: { type: "string", required: false, default: "false", description: "AI-generated summary" },
      filterByActorIds: { type: "array", required: false, description: "Filter by specific actor IDs" },
      fromDate: { type: "string", required: false, description: "Start date/time for filtering (ISO format)" },
      toDate: { type: "string", required: false, description: "End date/time for filtering (ISO format)" }
    },
    returns: "string - Conversation history",
    example: '{{GetMemory(count="20", maxLen="4000", filterByActorIds=actors, fromDate=from_date)}}'
  },

  GetTriggeredAct: {
    description: "Get the user input or event that triggered the current skill execution",
    category: "context",
    syntax: "GetTriggeredAct()",
    parameters: {},
    returns: "object - The triggering event with .arguments, .name properties",
    example: '{% set triggered_act = GetTriggeredAct() %}'
  },

  GetCurrentPrompt: {
    description: "Retrieve the current prompt template being used for AI generation",
    category: "context",
    syntax: "GetCurrentPrompt()",
    parameters: {},
    returns: "string - Current prompt template",
    example: '{{GetCurrentPrompt()}}'
  },

  // ============================================================================
  // FLOW CONTROL
  // ============================================================================

  Return: {
    description: "Exit skill execution, optionally returning a value. Empty Return() is valid for early exits",
    category: "flow",
    syntax: "Return(val?)",
    parameters: {
      val: { type: "any", required: false, description: "Optional value to return" }
    },
    returns: "void - Terminates skill execution",
    example: '{{Return()}} or {{Return(val="result")}}'
  },

  DUMMY: {
    description: "No-op function for logging/debugging. Output appears in logs but has no runtime effect",
    category: "flow",
    syntax: "DUMMY(message)",
    parameters: {
      message: { type: "string", required: false, description: "Message to log for debugging" }
    },
    returns: "void",
    example: '{{DUMMY("Task not found. Skipping.")}}'
  },

  Do: {
    description: "Execute a dynamic action by name with provided parameters",
    category: "flow",
    syntax: "Do(action, **arguments)",
    parameters: {
      action: { type: "string", required: true, description: "Name of the action to execute" }
    },
    returns: "any - Result of the executed action",
    example: '{{Do(action="CustomSkill", param1="value1")}}'
  },

  // ============================================================================
  // STRING OPERATIONS
  // ============================================================================

  Concat: {
    description: "Concatenate multiple strings and arrays. Arrays are joined with newlines",
    category: "string",
    syntax: "Concat(str | [str], ...)",
    parameters: {
      arguments: { type: "string | array", required: true, description: "Values to concatenate (variadic)" }
    },
    returns: "string - Combined string result",
    example: '{{Concat("Hello, ", user_name, "!")}}'
  },

  Stringify: {
    description: "Convert any value to its string representation. Cleans JSON quotes",
    category: "string",
    syntax: "Stringify(value)",
    parameters: {
      value: { type: "any", required: true, description: "Value to convert to string" }
    },
    returns: "string - String representation",
    example: '{{Stringify(json_data)}}'
  },

  // ============================================================================
  // CONDITIONALS & COMPARISONS
  // ============================================================================

  IsEmpty: {
    description: 'Check if a string is empty, null, or whitespace-only. Returns "t" if empty, "" otherwise',
    category: "conditional",
    syntax: "IsEmpty(text)",
    parameters: {
      text: { type: "string", required: true, description: "The string to test for emptiness" }
    },
    returns: '"t" if empty, "" if has content',
    example: '{{#if IsEmpty(text=user_input)}}Please provide input{{/if}}'
  },

  IsSimilar: {
    description: "Compare string similarity using distance algorithms. Returns truthy if above threshold",
    category: "conditional",
    syntax: "IsSimilar(val1, val2, strategy?, threshold?)",
    parameters: {
      val1: { type: "string", required: true, description: "First string to compare" },
      val2: { type: "string", required: true, description: "Second string to compare" },
      strategy: { type: "string", required: false, default: "hamming", description: "Algorithm", allowed: ["hamming", "levenshtein", "symbols"] },
      threshold: { type: "float", required: false, default: "0.4", description: "Similarity threshold (0.0-1.0)" }
    },
    returns: '"t" if similar, "" otherwise',
    example: '{{#if IsSimilar(val1=input, val2="yes", threshold=0.7)}}OK{{/if}}'
  },

  IsGlobal: {
    description: "Check if a variable exists in global scope",
    category: "conditional",
    syntax: "IsGlobal(name)",
    parameters: {
      name: { type: "string", required: true, description: "Variable name to check" }
    },
    returns: '"t" if global, "" otherwise',
    example: '{{#if IsGlobal(name="config")}}Config exists{{/if}}'
  },

  // ============================================================================
  // JSON & DATA
  // ============================================================================

  GetValueJSON: {
    description: "Extract values from JSON objects using keys or dot-notation paths",
    category: "json",
    syntax: "GetValueJSON(obj, key)",
    parameters: {
      obj: { type: "string", required: true, description: "JSON object or array string to query" },
      key: { type: "string", required: true, description: "Key or path (e.g., 'parent.child')" }
    },
    returns: "any - Extracted value or empty string if not found",
    example: '{{GetValueJSON(obj=user_data, key="contact.email")}}'
  },

  UpdateValueJSON: {
    description: "Update a value in a JSON object at the specified key",
    category: "json",
    syntax: "UpdateValueJSON(obj, key, value)",
    parameters: {
      obj: { type: "string", required: true, description: "JSON object to modify" },
      key: { type: "string", required: true, description: "Key or path to update" },
      value: { type: "any", required: true, description: "New value to set" }
    },
    returns: "string - Updated JSON object",
    example: '{{UpdateValueJSON(obj=data, key="status", value="active")}}'
  },

  CreateArray: {
    description: "Create arrays from string literals and variables",
    category: "json",
    syntax: "CreateArray(item1, item2, ...)",
    parameters: {
      items: { type: "string | variable", required: true, description: "Values to include (variadic)" }
    },
    returns: "array - Created array",
    example: '{{CreateArray("yes", "no", "maybe")}}'
  },

  // ============================================================================
  // DATE & TIME
  // ============================================================================

  GetDateTime: {
    description: "Get current date/time with customizable format and timezone",
    category: "datetime",
    syntax: "GetDateTime(format?, timezone?, weekday?)",
    parameters: {
      format: { type: "string", required: false, default: "datetime", description: "Format type", allowed: ["datetime", "date", "time"] },
      timezone: { type: "string", required: false, default: "UTC", description: "Timezone (e.g., America/New_York)" },
      weekday: { type: "string", required: false, default: "false", description: "Include weekday name" }
    },
    returns: "string - Formatted date/time string",
    example: '{{GetDateTime(format="datetime", timezone="America/New_York")}}'
  },

  GetDateInterval: {
    description: "Calculate date/time intervals with offset operations",
    category: "datetime",
    syntax: "GetDateInterval(start, offset)",
    parameters: {
      start: { type: "string", required: true, description: "Starting date/time" },
      offset: { type: "string", required: true, description: "Offset: -24h, +7d, -30m, etc." }
    },
    returns: "string - Calculated date/time",
    example: '{{GetDateInterval(start=GetDateTime(), offset="+24h")}}'
  },

  // Alias for GetDateTime (commonly used)
  GetDatetime: {
    description: "Get current date/time (alias for GetDateTime)",
    category: "datetime",
    syntax: "GetDatetime(format?, timezone?, weekday?)",
    parameters: {
      format: { type: "string", required: false, default: "datetime", description: "Format type", allowed: ["datetime", "date", "time"] },
      timezone: { type: "string", required: false, default: "UTC", description: "Timezone (e.g., America/New_York)" },
      weekday: { type: "string", required: false, default: "false", description: "Include weekday name" }
    },
    returns: "string - Formatted date/time string",
    example: '{{GetDatetime(format="datetime", timezone="America/Los_Angeles")}}'
  },

  // ============================================================================
  // ATTRIBUTE DELETION
  // ============================================================================

  DeleteCustomerAttribute: {
    description: "Delete a customer/project attribute. Commonly used to remove obsolete or temporary attributes",
    category: "attributes",
    syntax: "DeleteCustomerAttribute(field)",
    parameters: {
      field: { type: "string", required: true, description: "Attribute field name to delete" }
    },
    returns: "void",
    example: '{{DeleteCustomerAttribute(field="project_attributes_setting_temp_value")}}'
  },

  DeletePersonaAttribute: {
    description: "Delete a persona (agent) attribute. Used to remove agent-level metadata fields",
    category: "attributes",
    syntax: "DeletePersonaAttribute(id, field)",
    parameters: {
      id: { type: "string", required: true, description: "Persona ID whose attribute to delete" },
      field: { type: "string", required: true, description: "Attribute field name to delete" }
    },
    returns: "void",
    example: '{{DeletePersonaAttribute(id=agent_persona_id, field="target_connectors")}}'
  },

  // ============================================================================
  // KNOWLEDGE BASE (AKB) OPERATIONS
  // ============================================================================

  SearchFuzzyAkb: {
    description: "Fuzzy search the Agent Knowledge Base (AKB) for matching topics",
    category: "knowledge",
    syntax: "SearchFuzzyAkb(query, searchFields?, fromPerson?, numberTopics?)",
    parameters: {
      query: { type: "string", required: true, description: "Search query text" },
      searchFields: { type: "array", required: false, default: '["name"]', description: "Fields to search in" },
      fromPerson: { type: "string", required: false, default: "Agent", description: "Source filter", allowed: ["Agent", "User", "Both"] },
      numberTopics: { type: "int", required: false, default: "5", description: "Max results to return" }
    },
    returns: "array - Matching knowledge base topics",
    example: '{{SearchFuzzyAkb(query=taskId, searchFields=["name"], fromPerson="Agent", numberTopics=1)}}'
  },

  DeleteAkb: {
    description: "Delete topics from the Agent Knowledge Base by IDs",
    category: "knowledge",
    syntax: "DeleteAkb(ids)",
    parameters: {
      ids: { type: "array", required: true, description: "Array of topic IDs to delete" }
    },
    returns: "void",
    example: '{{DeleteAkb(ids=topic_ids)}}'
  },

  UpdateAkb: {
    description: "Update an existing topic in the Agent Knowledge Base",
    category: "knowledge",
    syntax: "UpdateAkb(id, summary?, facts?, name?, source?, labels?)",
    parameters: {
      id: { type: "string", required: true, description: "Topic ID to update" },
      summary: { type: "string", required: false, description: "Topic summary text" },
      facts: { type: "string", required: false, description: "Facts or comments" },
      name: { type: "string", required: false, description: "Topic name" },
      source: { type: "string", required: false, description: "Topic source identifier" },
      labels: { type: "array", required: false, description: "Topic labels/tags" }
    },
    returns: "void",
    example: '{{UpdateAkb(id=record_id, summary=task.summary, facts=updated_comments, name=taskId, labels=[status])}}'
  },

  SetManualAkb: {
    description: "Set manual content in the Agent Knowledge Base for a persona",
    category: "knowledge",
    syntax: "SetManualAkb(personaId, summary?, facts?, name?, source?, labels?)",
    parameters: {
      personaId: { type: "string", required: true, description: "Target persona ID" },
      summary: { type: "string", required: false, description: "Topic summary content" },
      facts: { type: "array", required: false, description: "Array of facts/comments" },
      name: { type: "string", required: false, description: "Topic name/identifier" },
      source: { type: "string", required: false, description: "Source identifier" },
      labels: { type: "array", required: false, description: "Topic labels/tags" }
    },
    returns: "void",
    example: '{{SetManualAkb(personaId=GetAgentPersona().id | string, summary=content, facts=[comment], name=task_id, source=task, labels=[status])}}'
  },

  // ============================================================================
  // AGENT & CUSTOMER INFO
  // ============================================================================

  GetAgent: {
    description: "Get agent information including persona ID and configuration",
    category: "agents",
    syntax: "GetAgent(idn?, field?)",
    parameters: {
      idn: { type: "string", required: false, description: "Agent identifier (e.g., 'ConvoAgent', 'GeneralManagerAgent')" },
      field: { type: "string", required: false, description: "Specific field to retrieve (e.g., 'personaId')" }
    },
    returns: "object | string - Agent info object or specific field value",
    example: '{{GetAgent(idn="ConvoAgent", field="personaId")}}'
  },

  GetCustomerInfo: {
    description: "Get customer information from the current session",
    category: "customer",
    syntax: "GetCustomerInfo(field?)",
    parameters: {
      field: { type: "string", required: false, description: "Specific customer field to retrieve" }
    },
    returns: "object | string - Customer info object or specific field value",
    example: '{{GetCustomerInfo(field="phoneNumber")}}'
  },

  GetCustomer: {
    description: "Get customer data field from current customer context",
    category: "customer",
    syntax: "GetCustomer(field?)",
    parameters: {
      field: { type: "string", required: false, description: "Specific field to retrieve (e.g., 'idn', 'email')" }
    },
    returns: "object | string - Customer data or specific field value",
    example: '{{GetCustomer(field="idn")}}'
  },

  // ============================================================================
  // WEBHOOK OPERATIONS
  // ============================================================================

  GetWebhook: {
    description: "Get webhook configuration by identifier and type",
    category: "webhooks",
    syntax: "GetWebhook(webhookIdn, webhookType)",
    parameters: {
      webhookIdn: { type: "string", required: true, description: "Webhook identifier (e.g., 'sa_session_started')" },
      webhookType: { type: "string", required: true, description: "Webhook type", allowed: ["incoming", "outgoing"] }
    },
    returns: "object - Webhook configuration",
    example: '{{GetWebhook(webhookIdn="sa_session_started", webhookType="outgoing")}}'
  },

  CreateWebhook: {
    description: "Create a new webhook configuration",
    category: "webhooks",
    syntax: "CreateWebhook(webhookIdn, webhookType, url?, headers?, body?)",
    parameters: {
      webhookIdn: { type: "string", required: true, description: "Unique webhook identifier" },
      webhookType: { type: "string", required: true, description: "Webhook type", allowed: ["incoming", "outgoing"] },
      url: { type: "string", required: false, description: "Webhook URL" },
      headers: { type: "object", required: false, description: "Request headers" },
      body: { type: "object", required: false, description: "Request body template" }
    },
    returns: "void",
    example: '{{CreateWebhook(webhookIdn="custom_hook", webhookType="outgoing", url="https://api.example.com")}}'
  },

  DeleteWebhook: {
    description: "Delete an existing webhook configuration",
    category: "webhooks",
    syntax: "DeleteWebhook(webhookIdn, webhookType)",
    parameters: {
      webhookIdn: { type: "string", required: true, description: "Webhook identifier to delete" },
      webhookType: { type: "string", required: true, description: "Webhook type", allowed: ["incoming", "outgoing"] }
    },
    returns: "void",
    example: '{{DeleteWebhook(webhookIdn="old_hook", webhookType="outgoing")}}'
  },

  // ============================================================================
  // ACT & MESSAGE OPERATIONS
  // ============================================================================

  GetAct: {
    description: "Get action/act information by ID with optional field selection",
    category: "acts",
    syntax: "GetAct(id, fields?)",
    parameters: {
      id: { type: "string", required: true, description: "Act/action ID to retrieve" },
      fields: { type: "array", required: false, description: "Specific fields to return (e.g., ['targetAction'])" }
    },
    returns: "object - Act information",
    example: '{{GetAct(id=command_act_id, fields=["targetAction"])}}'
  },

  CreateMessageAct: {
    description: "Create a message action in the conversation history",
    category: "acts",
    syntax: "CreateMessageAct(text, from?, userPersonaId?, userActorId?)",
    parameters: {
      text: { type: "string", required: true, description: "Message text content" },
      from: { type: "string", required: false, description: "Message source", allowed: ["user", "agent"] },
      userPersonaId: { type: "string", required: false, description: "User persona ID" },
      userActorId: { type: "string", required: false, description: "User actor ID" }
    },
    returns: "string - Created act ID",
    example: '{{CreateMessageAct(text=message_text, from="user", userPersonaId=user_id, userActorId=actor_id)}}'
  },

  // ============================================================================
  // JSON ARRAY OPERATIONS
  // ============================================================================

  GetIndexesOfItemsArrayJSON: {
    description: "Find array indexes matching a JSONPath filter expression",
    category: "json",
    syntax: "GetIndexesOfItemsArrayJSON(array, filterPath)",
    parameters: {
      array: { type: "array", required: true, description: "JSON array to search" },
      filterPath: { type: "string", required: true, description: "JSONPath filter expression" }
    },
    returns: "array - Matching indexes",
    example: '{{GetIndexesOfItemsArrayJSON(array=blocked_numbers, filterPath=Concat("$[?(@==\'", phoneNumber, "\')]"))}}'
  },

  AppendItemsArrayJSON: {
    description: "Append items to a JSON array",
    category: "json",
    syntax: "AppendItemsArrayJSON(array, items)",
    parameters: {
      array: { type: "array", required: true, description: "Source array to append to" },
      items: { type: "any", required: true, description: "Items to append (string or array)" }
    },
    returns: "array - New array with appended items",
    example: '{{AppendItemsArrayJSON(array=bookings, items=AsStringJSON(val=new_booking))}}'
  },

  AsStringJSON: {
    description: "Convert a value to a JSON string representation",
    category: "json",
    syntax: "AsStringJSON(val)",
    parameters: {
      val: { type: "any", required: true, description: "Value to convert to JSON string" }
    },
    returns: "string - JSON string representation",
    example: '{{AsStringJSON(val=booking_date_time)}}'
  },

  GetItemsArrayByIndexesJSON: {
    description: "Get array items by their indexes",
    category: "json",
    syntax: "GetItemsArrayByIndexesJSON(array, indexes)",
    parameters: {
      array: { type: "array", required: true, description: "Source array" },
      indexes: { type: "array", required: true, description: "Array of indexes to retrieve" }
    },
    returns: "array - Items at specified indexes",
    example: '{{GetItemsArrayByIndexesJSON(array=items, indexes=[0, 2, 4])}}'
  },

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  GetRandomChoice: {
    description: "Select a random element from an array",
    category: "utility",
    syntax: "GetRandomChoice(array)",
    parameters: {
      array: { type: "array", required: true, description: "Array to select from" }
    },
    returns: "any - Random element from the array",
    example: '{{GetRandomChoice(responses)}}'
  },

  Sleep: {
    description: "Pause execution for a specified duration",
    category: "flow",
    syntax: "Sleep(duration, interruptible?)",
    parameters: {
      duration: { type: "string", required: true, description: "Duration in seconds (as string)" },
      interruptible: { type: "string", required: false, default: "False", description: "Allow interruption", allowed: ["True", "False", "y", "n"] }
    },
    returns: "void",
    example: '{{Sleep(duration="2", interruptible="False")}}'
  },

  StartNotInterruptibleBlock: {
    description: "Begin a block of code that cannot be interrupted by user input",
    category: "flow",
    syntax: "StartNotInterruptibleBlock()",
    parameters: {},
    returns: "void",
    example: '{{StartNotInterruptibleBlock()}}'
  },

  StopNotInterruptibleBlock: {
    description: "End the non-interruptible block, allowing user input again",
    category: "flow",
    syntax: "StopNotInterruptibleBlock()",
    parameters: {},
    returns: "void",
    example: '{{StopNotInterruptibleBlock()}}'
  },

  // ============================================================================
  // TYPING INDICATORS
  // ============================================================================

  SendTypingStart: {
    description: "Show typing indicator to the user",
    category: "messaging",
    syntax: "SendTypingStart(actorIds?)",
    parameters: {
      actorIds: { type: "array", required: false, description: "Target actor IDs" }
    },
    returns: "void",
    example: '{{SendTypingStart()}}'
  },

  SendTypingStop: {
    description: "Hide typing indicator",
    category: "messaging",
    syntax: "SendTypingStop(actorIds?)",
    parameters: {
      actorIds: { type: "array", required: false, description: "Target actor IDs" }
    },
    returns: "void",
    example: '{{SendTypingStop()}}'
  },

  // ============================================================================
  // STREAMING GENERATION
  // ============================================================================

  GenStream: {
    description: "Generate AI responses with streaming output for real-time delivery",
    category: "ai",
    syntax: "GenStream(temperature?, topP?, maxTokens?, skipFilter?, sendTo?, actorIds?, interruptMode?, interruptWindow?, thinkingBudget?)",
    parameters: {
      temperature: { type: "float", required: false, default: "0.75", description: "Controls randomness (0.0-2.0)" },
      topP: { type: "float", required: false, default: "1.0", description: "Nucleus sampling (0.0-1.0)" },
      maxTokens: { type: "int", required: false, description: "Maximum response length" },
      skipFilter: { type: "boolean", required: false, default: "false", description: "Bypass content moderation" },
      sendTo: { type: "string", required: false, description: "Target for streaming ('actors')" },
      actorIds: { type: "array", required: false, description: "Target actor IDs for streaming" },
      interruptMode: { type: "string", required: false, description: "Interrupt handling mode" },
      interruptWindow: { type: "float", required: false, description: "Window for interruption (0.0-1.0)" },
      thinkingBudget: { type: "int", required: false, description: "Token budget for reasoning" }
    },
    returns: "string - Generated content (streamed)",
    example: '{{GenStream(temperature=0.2, topP=0.5, maxTokens=4000, sendTo="actors", actorIds=[actor_id])}}'
  },

  // ============================================================================
  // CONNECTOR INFO UPDATE
  // ============================================================================

  SetConnectorInfo: {
    description: "Update connector configuration settings",
    category: "connectors",
    syntax: "SetConnectorInfo(integrationIdn, connectorIdn, field, value)",
    parameters: {
      integrationIdn: { type: "string", required: true, description: "Integration type identifier" },
      connectorIdn: { type: "string", required: true, description: "Connector instance identifier" },
      field: { type: "string", required: true, description: "Field to update" },
      value: { type: "any", required: true, description: "New value" }
    },
    returns: "void",
    example: '{{SetConnectorInfo(integrationIdn="cal_com", connectorIdn="calendar", field="apiKey", value=new_key)}}'
  },

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  GetSessionInfo: {
    description: "Get information about the current conversation session including session ID",
    category: "context",
    syntax: "GetSessionInfo()",
    parameters: {},
    returns: "object - Session info object with .id property (UUID string)",
    example: '{% set session_identifier = "session_" ~ (GetSessionInfo().id | string).replace("-", "_") %}'
  },

  // ============================================================================
  // FOLLOW-UP CONTROL
  // ============================================================================

  DisableFollowUp: {
    description: "Disable the follow-up timer for the current conversation, preventing automatic follow-up messages",
    category: "flow",
    syntax: "DisableFollowUp()",
    parameters: {},
    returns: "void",
    example: '{{DisableFollowUp()}}'
  },

  EnableFollowUp: {
    description: "Re-enable the follow-up timer for the current conversation after it was disabled",
    category: "flow",
    syntax: "EnableFollowUp()",
    parameters: {},
    returns: "void",
    example: '{{EnableFollowUp()}}'
  },

  // ============================================================================
  // CUSTOMER INFO UPDATE
  // ============================================================================

  SetCustomerInfo: {
    description: "Update customer organization information and settings",
    category: "customer",
    syntax: "SetCustomerInfo(organizationName?, **fields)",
    parameters: {
      organizationName: { type: "string", required: false, description: "Organization/business name to set" }
    },
    returns: "void",
    example: '{{SetCustomerInfo(organizationName=business_info_name)}}'
  },

  // ============================================================================
  // FAST PROMPT
  // ============================================================================

  FastPrompt: {
    description: "Quick LLM generation shortcut with simplified parameters. Produces a fast response without the full Gen() configuration overhead",
    category: "generation",
    syntax: "FastPrompt(prompt?, temperature?, maxTokens?)",
    parameters: {
      prompt: { type: "string", required: false, description: "Prompt text for quick generation" },
      temperature: { type: "number", required: false, description: "Generation temperature (0-2)" },
      maxTokens: { type: "number", required: false, description: "Maximum tokens to generate" }
    },
    returns: "string - Generated text response",
    example: '{{Set(name="quick_reply", value=FastPrompt())}}'
  },

  // ============================================================================
  // ERROR REPORTING (V2)
  // ============================================================================

  Error: {
    description: "Report an execution error. Signals that the current skill encountered an error condition",
    category: "flow",
    syntax: "Error(message)",
    parameters: {
      message: { type: "string", required: true, description: "Error message describing what went wrong" }
    },
    returns: "void",
    example: '{{Error(message="Failed to process booking request")}}'
  },

  ResultError: {
    description: "Return an error result in result flows. Used in connector result handlers to signal failure back to the calling flow",
    category: "flow",
    syntax: "ResultError(message?, code?)",
    parameters: {
      message: { type: "string", required: false, description: "Error message to return" },
      code: { type: "string", required: false, description: "Error code identifier" }
    },
    returns: "void",
    example: '{{ResultError(message="Booking not found")}}'
  },

  ConnectorResultError: {
    description: "Report a connector-level error. Used when an integration connector encounters a failure during execution",
    category: "flow",
    syntax: "ConnectorResultError(message?, connectorIdn?, integrationIdn?)",
    parameters: {
      message: { type: "string", required: false, description: "Error message describing the connector failure" },
      connectorIdn: { type: "string", required: false, description: "Connector identifier that failed" },
      integrationIdn: { type: "string", required: false, description: "Integration identifier for the failed connector" }
    },
    returns: "void",
    example: '{{ConnectorResultError(message="API timeout", connectorIdn="calcom_connector")}}'
  }
};
