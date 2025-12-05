#!/usr/bin/env node
/**
 * Newo DSL Language Server
 *
 * Provides IDE features for Newo DSL templates:
 * - Diagnostics (errors/warnings)
 * - Completions with parameter hints
 * - Hover information with documentation
 * - Go to definition
 */

import {
  createConnection,
  TextDocuments,
  Diagnostic as LspDiagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  CompletionItem,
  CompletionItemKind,
  Hover,
  MarkupKind,
  TextDocumentPositionParams,
  DefinitionParams,
  Location,
  InsertTextFormat
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import * as path from 'path';
import * as fs from 'fs';

// ============================================================================
// ACTION DEFINITIONS DATABASE
// Based on actual codebase usage patterns
// ============================================================================

interface ActionParameter {
  type: string;
  required: boolean;
  default?: string;
  description: string;
  allowed?: string[];
}

interface ActionDefinition {
  description: string;
  category: string;
  syntax: string;
  parameters: Record<string, ActionParameter>;
  returns: string;
  example: string;
}

const ACTIONS: Record<string, ActionDefinition> = {
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
  }
};

// ============================================================================
// JINJA BUILT-IN FILTERS AND FUNCTIONS
// ============================================================================

interface JinjaBuiltin {
  description: string;
  syntax: string;
  returns: string;
}

const JINJA_BUILTINS: Record<string, JinjaBuiltin> = {
  // Type conversion filters
  'string': {
    description: 'Convert value to string',
    syntax: 'value | string',
    returns: 'string'
  },
  'int': {
    description: 'Convert value to integer',
    syntax: 'value | int',
    returns: 'int'
  },
  'float': {
    description: 'Convert value to floating point number',
    syntax: 'value | float',
    returns: 'float'
  },
  'bool': {
    description: 'Convert value to boolean',
    syntax: 'value | bool',
    returns: 'boolean'
  },
  'list': {
    description: 'Convert value to list',
    syntax: 'value | list',
    returns: 'list'
  },

  // String filters
  'strip': {
    description: 'Strip leading and trailing whitespace',
    syntax: 'string | strip',
    returns: 'string'
  },
  'lower': {
    description: 'Convert string to lowercase',
    syntax: 'string | lower',
    returns: 'string'
  },
  'upper': {
    description: 'Convert string to uppercase',
    syntax: 'string | upper',
    returns: 'string'
  },
  'title': {
    description: 'Convert string to title case',
    syntax: 'string | title',
    returns: 'string'
  },
  'capitalize': {
    description: 'Capitalize first character',
    syntax: 'string | capitalize',
    returns: 'string'
  },
  'trim': {
    description: 'Strip leading and trailing whitespace',
    syntax: 'string | trim',
    returns: 'string'
  },
  'replace': {
    description: 'Replace occurrences of substring',
    syntax: 'string | replace(old, new)',
    returns: 'string'
  },
  'split': {
    description: 'Split string into list',
    syntax: 'string | split(separator)',
    returns: 'list'
  },
  'join': {
    description: 'Join list elements into string',
    syntax: 'list | join(separator)',
    returns: 'string'
  },
  'truncate': {
    description: 'Truncate string to specified length',
    syntax: 'string | truncate(length)',
    returns: 'string'
  },
  'wordwrap': {
    description: 'Wrap text at specified width',
    syntax: 'string | wordwrap(width)',
    returns: 'string'
  },
  'striptags': {
    description: 'Remove HTML/XML tags',
    syntax: 'string | striptags',
    returns: 'string'
  },
  'escape': {
    description: 'Escape HTML special characters',
    syntax: 'string | escape',
    returns: 'string'
  },
  'safe': {
    description: 'Mark string as safe (no escaping)',
    syntax: 'string | safe',
    returns: 'string'
  },
  'urlencode': {
    description: 'URL encode string',
    syntax: 'string | urlencode',
    returns: 'string'
  },
  'indent': {
    description: 'Indent text by specified amount',
    syntax: 'string | indent(width)',
    returns: 'string'
  },
  'center': {
    description: 'Center string in field of given width',
    syntax: 'string | center(width)',
    returns: 'string'
  },

  // List/Array filters
  'length': {
    description: 'Get length of string, list, or dict',
    syntax: 'value | length',
    returns: 'int'
  },
  'first': {
    description: 'Get first element of list',
    syntax: 'list | first',
    returns: 'any'
  },
  'last': {
    description: 'Get last element of list',
    syntax: 'list | last',
    returns: 'any'
  },
  'reverse': {
    description: 'Reverse list or string',
    syntax: 'value | reverse',
    returns: 'list/string'
  },
  'sort': {
    description: 'Sort list',
    syntax: 'list | sort',
    returns: 'list'
  },
  'unique': {
    description: 'Remove duplicate elements from list',
    syntax: 'list | unique',
    returns: 'list'
  },
  'map': {
    description: 'Apply function to each element',
    syntax: 'list | map(attribute)',
    returns: 'list'
  },
  'select': {
    description: 'Filter list by condition',
    syntax: 'list | select(test)',
    returns: 'list'
  },
  'reject': {
    description: 'Remove elements matching condition',
    syntax: 'list | reject(test)',
    returns: 'list'
  },
  'selectattr': {
    description: 'Filter by attribute value',
    syntax: 'list | selectattr(attribute, test, value)',
    returns: 'list'
  },
  'rejectattr': {
    description: 'Remove elements by attribute value',
    syntax: 'list | rejectattr(attribute, test, value)',
    returns: 'list'
  },
  'batch': {
    description: 'Batch list into sublists of specified size',
    syntax: 'list | batch(size)',
    returns: 'list of lists'
  },
  'slice': {
    description: 'Slice list into sublists',
    syntax: 'list | slice(slices)',
    returns: 'list of lists'
  },
  'groupby': {
    description: 'Group list by attribute',
    syntax: 'list | groupby(attribute)',
    returns: 'list of tuples'
  },

  // Math filters
  'abs': {
    description: 'Get absolute value',
    syntax: 'number | abs',
    returns: 'number'
  },
  'round': {
    description: 'Round number to precision',
    syntax: 'number | round(precision)',
    returns: 'number'
  },
  'sum': {
    description: 'Sum all elements in list',
    syntax: 'list | sum',
    returns: 'number'
  },
  'max': {
    description: 'Get maximum value',
    syntax: 'list | max',
    returns: 'any'
  },
  'min': {
    description: 'Get minimum value',
    syntax: 'list | min',
    returns: 'any'
  },

  // JSON module
  'json': {
    description: 'JSON module - use json.dumps() or json.loads()',
    syntax: 'json.dumps(obj) / json.loads(str)',
    returns: 'string/object'
  },
  'dumps': {
    description: 'Convert object to JSON string',
    syntax: 'json.dumps(obj)',
    returns: 'string'
  },
  'loads': {
    description: 'Parse JSON string to object',
    syntax: 'json.loads(str)',
    returns: 'object'
  },
  'tojson': {
    description: 'Convert value to JSON string (filter)',
    syntax: 'value | tojson',
    returns: 'string'
  },
  'fromjson': {
    description: 'Parse JSON string to object',
    syntax: 'string | fromjson',
    returns: 'object'
  },

  // Dict filters
  'dictsort': {
    description: 'Sort dictionary items',
    syntax: 'dict | dictsort',
    returns: 'list of tuples'
  },
  'items': {
    description: 'Get dictionary items as list of tuples',
    syntax: 'dict | items',
    returns: 'list of tuples'
  },
  'keys': {
    description: 'Get dictionary keys',
    syntax: 'dict | keys',
    returns: 'list'
  },
  'values': {
    description: 'Get dictionary values',
    syntax: 'dict | values',
    returns: 'list'
  },
  'attr': {
    description: 'Get attribute from object',
    syntax: 'object | attr(name)',
    returns: 'any'
  },

  // Test functions
  'defined': {
    description: 'Test if variable is defined',
    syntax: 'value is defined',
    returns: 'boolean'
  },
  'undefined': {
    description: 'Test if variable is undefined',
    syntax: 'value is undefined',
    returns: 'boolean'
  },
  'none': {
    description: 'Test if value is none/null',
    syntax: 'value is none',
    returns: 'boolean'
  },
  'number': {
    description: 'Test if value is a number',
    syntax: 'value is number',
    returns: 'boolean'
  },
  'sequence': {
    description: 'Test if value is a sequence (list)',
    syntax: 'value is sequence',
    returns: 'boolean'
  },
  'mapping': {
    description: 'Test if value is a mapping (dict)',
    syntax: 'value is mapping',
    returns: 'boolean'
  },
  'iterable': {
    description: 'Test if value is iterable',
    syntax: 'value is iterable',
    returns: 'boolean'
  },
  'callable': {
    description: 'Test if value is callable',
    syntax: 'value is callable',
    returns: 'boolean'
  },
  'sameas': {
    description: 'Test if value is same object as other',
    syntax: 'value is sameas(other)',
    returns: 'boolean'
  },
  'eq': {
    description: 'Test equality',
    syntax: 'value is eq(other)',
    returns: 'boolean'
  },
  'ne': {
    description: 'Test inequality',
    syntax: 'value is ne(other)',
    returns: 'boolean'
  },
  'lt': {
    description: 'Test less than',
    syntax: 'value is lt(other)',
    returns: 'boolean'
  },
  'le': {
    description: 'Test less than or equal',
    syntax: 'value is le(other)',
    returns: 'boolean'
  },
  'gt': {
    description: 'Test greater than',
    syntax: 'value is gt(other)',
    returns: 'boolean'
  },
  'ge': {
    description: 'Test greater than or equal',
    syntax: 'value is ge(other)',
    returns: 'boolean'
  },

  // Other common filters
  'default': {
    description: 'Return default value if undefined',
    syntax: 'value | default(default_value)',
    returns: 'any'
  },
  'd': {
    description: 'Alias for default filter',
    syntax: 'value | d(default_value)',
    returns: 'any'
  },
  'format': {
    description: 'Format string with arguments',
    syntax: 'string | format(*args)',
    returns: 'string'
  },
  'pprint': {
    description: 'Pretty print value',
    syntax: 'value | pprint',
    returns: 'string'
  },
  'filesizeformat': {
    description: 'Format file size as human readable',
    syntax: 'bytes | filesizeformat',
    returns: 'string'
  },
  'wordcount': {
    description: 'Count words in string',
    syntax: 'string | wordcount',
    returns: 'int'
  },
  'random': {
    description: 'Get random element from list',
    syntax: 'list | random',
    returns: 'any'
  },
  'xmlattr': {
    description: 'Create XML/HTML attributes from dict',
    syntax: 'dict | xmlattr',
    returns: 'string'
  },

  // Python built-ins commonly used
  'range': {
    description: 'Generate range of numbers',
    syntax: 'range(start, stop, step)',
    returns: 'list'
  },
  'dict': {
    description: 'Create dictionary',
    syntax: 'dict(key=value)',
    returns: 'dict'
  },
  'namespace': {
    description: 'Create namespace object for scoping',
    syntax: 'namespace(var=value)',
    returns: 'namespace'
  },
  'lipsum': {
    description: 'Generate lorem ipsum text',
    syntax: 'lipsum(n)',
    returns: 'string'
  },
  'cycler': {
    description: 'Cycle through values',
    syntax: 'cycler(val1, val2, ...)',
    returns: 'cycler'
  },
  'joiner': {
    description: 'Joins items with separator after first call',
    syntax: 'joiner(sep)',
    returns: 'joiner'
  },

  // Append function (commonly used)
  'append': {
    description: 'Append item to list (method)',
    syntax: 'list.append(item)',
    returns: 'None'
  },
  'extend': {
    description: 'Extend list with another list (method)',
    syntax: 'list.extend(items)',
    returns: 'None'
  },
  'update': {
    description: 'Update dict with another dict (method)',
    syntax: 'dict.update(other)',
    returns: 'None'
  },
  'get': {
    description: 'Get dict value with default (method)',
    syntax: 'dict.get(key, default)',
    returns: 'any'
  },
  'pop': {
    description: 'Remove and return item (method)',
    syntax: 'list.pop() / dict.pop(key)',
    returns: 'any'
  },
  'startswith': {
    description: 'Test if string starts with prefix',
    syntax: 'string.startswith(prefix)',
    returns: 'boolean'
  },
  'endswith': {
    description: 'Test if string ends with suffix',
    syntax: 'string.endswith(suffix)',
    returns: 'boolean'
  },
  'find': {
    description: 'Find substring index',
    syntax: 'string.find(sub)',
    returns: 'int'
  },
  'count': {
    description: 'Count occurrences',
    syntax: 'string.count(sub) / list.count(item)',
    returns: 'int'
  },
  'index': {
    description: 'Find index of item',
    syntax: 'list.index(item)',
    returns: 'int'
  },
  'format_map': {
    description: 'Format string using dict',
    syntax: 'string.format_map(dict)',
    returns: 'string'
  }
};

// Set of all Jinja built-in names for quick lookup
const JINJA_BUILTIN_NAMES = new Set(Object.keys(JINJA_BUILTINS));

// ============================================================================
// VALIDATION RULES - based on actual codebase patterns
// ============================================================================

interface ValidationRule {
  requiredParams: string[];
  paramConstraints?: Record<string, { min?: number; max?: number; allowed?: string[] }>;
}

const VALIDATION_RULES: Record<string, ValidationRule> = {
  SendMessage: { requiredParams: ['message'] },
  SendCommand: { requiredParams: ['commandIdn', 'integrationIdn', 'connectorIdn'] },
  Set: { requiredParams: ['name', 'value'] },
  SetState: { requiredParams: ['name', 'value'] },
  GetState: { requiredParams: ['name'] },
  GetCustomerAttribute: { requiredParams: ['field'] },
  SetCustomerAttribute: { requiredParams: ['field', 'value'] },
  SetCustomerMetadataAttribute: { requiredParams: ['idn', 'field', 'value'] },
  GetCustomerMetadataAttribute: { requiredParams: ['idn'] },
  GetProjectAttribute: { requiredParams: ['field'] },
  SetProjectAttribute: { requiredParams: ['field', 'value'] },
  SetProjectMetadataAttribute: { requiredParams: ['idn', 'field', 'value'] },
  GetConnectorInfo: { requiredParams: ['integrationIdn', 'connectorIdn'] },
  CreateConnector: { requiredParams: ['integrationIdn', 'connectorIdn', 'title'] },
  DeleteConnector: { requiredParams: ['integrationIdn', 'connectorIdn'] },
  CreatePersona: { requiredParams: ['name'] },
  CreateActor: { requiredParams: ['integrationIdn', 'connectorIdn', 'externalId', 'personaId'] },
  Return: { requiredParams: [] },  // val is OPTIONAL!
  Gen: { requiredParams: [] },     // All params optional - can be used inline
  IsSimilar: {
    requiredParams: ['val1', 'val2'],
    paramConstraints: {
      threshold: { min: 0.0, max: 1.0 },
      strategy: { allowed: ['hamming', 'levenshtein', 'symbols'] }
    }
  },
  IsEmpty: { requiredParams: ['text'] },
  GetValueJSON: { requiredParams: ['obj', 'key'] },
  UpdateValueJSON: { requiredParams: ['obj', 'key', 'value'] },
  GetDateTime: {
    requiredParams: [],
    paramConstraints: {
      format: { allowed: ['datetime', 'date', 'time'] }
    }
  },
  GetMemory: {
    requiredParams: [],
    paramConstraints: {
      fromPerson: { allowed: ['User', 'Agent', 'Both'] }
    }
  },
  DUMMY: { requiredParams: [] },
  GetUser: { requiredParams: [] },
  GetActors: { requiredParams: [] },
  GetActor: { requiredParams: [] },
  GetTriggeredAct: { requiredParams: [] },
  GetCurrentPrompt: { requiredParams: [] },
  GetAgentPersona: { requiredParams: [] },
  GetPersonaAttribute: { requiredParams: ['id', 'field'] },
  SetPersonaAttribute: { requiredParams: ['id', 'field', 'value'] },
  UpdateUser: { requiredParams: ['value'] },  // field/name are aliases, value is required
  SendSystemEvent: { requiredParams: ['eventIdn'] },

  // New validation rules for discovered functions
  DeleteCustomerAttribute: { requiredParams: ['field'] },
  SearchFuzzyAkb: {
    requiredParams: ['query'],
    paramConstraints: {
      fromPerson: { allowed: ['Agent', 'User', 'Both'] }
    }
  },
  DeleteAkb: { requiredParams: ['ids'] },
  UpdateAkb: { requiredParams: ['id'] },
  SetManualAkb: { requiredParams: ['personaId'] },
  GetAgent: { requiredParams: [] },  // All params optional - can be called with no args
  GetCustomerInfo: { requiredParams: [] },
  GetCustomer: { requiredParams: [] },
  GetWebhook: {
    requiredParams: ['webhookIdn', 'webhookType'],
    paramConstraints: {
      webhookType: { allowed: ['incoming', 'outgoing'] }
    }
  },
  CreateWebhook: {
    requiredParams: ['webhookIdn', 'webhookType'],
    paramConstraints: {
      webhookType: { allowed: ['incoming', 'outgoing'] }
    }
  },
  DeleteWebhook: {
    requiredParams: ['webhookIdn', 'webhookType'],
    paramConstraints: {
      webhookType: { allowed: ['incoming', 'outgoing'] }
    }
  },
  GetAct: { requiredParams: ['id'] },
  CreateMessageAct: {
    requiredParams: ['text'],
    paramConstraints: {
      from: { allowed: ['user', 'agent'] }
    }
  },
  GetIndexesOfItemsArrayJSON: { requiredParams: ['array', 'filterPath'] },
  AppendItemsArrayJSON: { requiredParams: ['array', 'items'] },
  AsStringJSON: { requiredParams: ['val'] },
  GetItemsArrayByIndexesJSON: { requiredParams: ['array', 'indexes'] },
  GetRandomChoice: { requiredParams: [] },  // Takes positional array
  Sleep: {
    requiredParams: ['duration'],
    paramConstraints: {
      interruptible: { allowed: ['True', 'False', 'y', 'n'] }
    }
  },
  StartNotInterruptibleBlock: { requiredParams: [] },
  StopNotInterruptibleBlock: { requiredParams: [] },
  SendTypingStart: { requiredParams: [] },
  SendTypingStop: { requiredParams: [] },
  GenStream: { requiredParams: [] },
  SetConnectorInfo: { requiredParams: ['integrationIdn', 'connectorIdn', 'field', 'value'] },
  GetDatetime: {
    requiredParams: [],
    paramConstraints: {
      format: { allowed: ['datetime', 'date', 'time'] }
    }
  },
  CreateArray: { requiredParams: [] },  // Variadic
  Concat: { requiredParams: [] },       // Variadic
  Stringify: { requiredParams: [] },    // Takes positional value
  Do: { requiredParams: ['action'] }
};

// ============================================================================
// SKILL INDEX - tracks all skills in the workspace with parameter info
// ============================================================================

interface SkillParameter {
  name: string;
  defaultValue?: string;
  required: boolean;
}

interface SkillInfo {
  name: string;
  filePath: string;
  metadataPath?: string;
  type: 'jinja' | 'guidance';
  parameters: SkillParameter[];
}

let skillIndex: Map<string, SkillInfo> = new Map();
let skillIndexBuilt = false;

/**
 * Parse metadata.yaml to extract skill parameters
 */
function parseSkillMetadata(metadataPath: string): SkillParameter[] {
  const params: SkillParameter[] = [];

  try {
    if (!fs.existsSync(metadataPath)) return params;

    const content = fs.readFileSync(metadataPath, 'utf-8');

    // Check for empty parameters: [] first
    if (content.match(/parameters:\s*\[\]/)) {
      return params;
    }

    // Extract all parameter names from the file
    // The format is: parameters:\n  - id: ...\n    name: param_name\n    default_value: ...
    const nameMatches = content.matchAll(/^\s+name:\s*(\w+)/gm);
    for (const match of nameMatches) {
      const paramName = match[1];
      // Skip if this is not a parameter name (e.g., could be model name)
      // Check if it appears after 'parameters:' section
      const paramSectionMatch = content.match(/parameters:/);
      if (paramSectionMatch) {
        const paramSection = content.substring(paramSectionMatch.index!);
        if (paramSection.includes(`name: ${paramName}`)) {
          // Check for default_value
          const defaultMatch = paramSection.match(new RegExp(`name:\\s*${paramName}[\\s\\S]*?default_value:\\s*["']?([^"'\\n]*)["']?`));
          const hasDefault = defaultMatch && defaultMatch[1].trim() !== '';
          params.push({
            name: paramName,
            defaultValue: hasDefault ? defaultMatch[1].trim() : undefined,
            required: !hasDefault
          });
        }
      }
    }
  } catch (err) {
    // Ignore parsing errors
  }

  return params;
}

/**
 * Recursively scan directory for .jinja and .guidance files
 * Also load metadata.yaml for parameter info
 */
function scanDirectoryForSkills(dir: string): SkillInfo[] {
  const skills: SkillInfo[] = [];

  try {
    if (!fs.existsSync(dir)) return skills;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          skills.push(...scanDirectoryForSkills(fullPath));
        }
      } else if (entry.isFile()) {
        // Check for skill files
        if (entry.name.endsWith('.jinja') || entry.name.endsWith('.guidance')) {
          const isJinja = entry.name.endsWith('.jinja');
          const skillName = entry.name.replace(isJinja ? '.jinja' : '.guidance', '');

          // Look for metadata.yaml in same directory
          const metadataPath = path.join(path.dirname(fullPath), 'metadata.yaml');
          const parameters = parseSkillMetadata(metadataPath);

          skills.push({
            name: skillName,
            filePath: fullPath,
            metadataPath: fs.existsSync(metadataPath) ? metadataPath : undefined,
            type: isJinja ? 'jinja' : 'guidance',
            parameters
          });
        }
      }
    }
  } catch (err) {
    // Ignore permission errors and continue
  }

  return skills;
}

/**
 * Build the skill index from workspace
 */
function buildSkillIndex(rootPath: string): void {
  skillIndex.clear();

  // Also scan parent directories for project structure
  let searchPaths = [rootPath];

  // If rootPath contains newo-dsl-lsp, also scan the parent newo project
  if (rootPath.includes('newo-dsl-lsp')) {
    const parentDir = path.dirname(rootPath.replace(/\/newo-dsl-lsp.*$/, ''));
    const newoCustomers = path.join(parentDir, 'newo_customers');
    if (fs.existsSync(newoCustomers)) {
      searchPaths.push(newoCustomers);
    }
    // Also check for project folder
    const projectDir = path.join(rootPath, '..', '..', 'project');
    if (fs.existsSync(projectDir)) {
      searchPaths.push(projectDir);
    }
  }

  // Look for newo_customers or projects folder relative to workspace
  const commonPaths = [
    path.join(rootPath, 'newo_customers'),
    path.join(rootPath, 'project'),
    path.join(rootPath, 'projects'),
    path.join(rootPath, '..', 'newo_customers'),
    path.join(rootPath, '..', 'project'),
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p) && !searchPaths.includes(p)) {
      searchPaths.push(p);
    }
  }

  for (const searchPath of searchPaths) {
    const skills = scanDirectoryForSkills(searchPath);
    for (const skill of skills) {
      // Store with normalized name (without leading underscore for matching)
      skillIndex.set(skill.name, skill);
    }
  }

  skillIndexBuilt = true;
  connection.console.log(`Skill index built: ${skillIndex.size} skills found`);
}

/**
 * Get skill info by name (handles both _SkillName and SkillName patterns)
 */
function getSkillInfo(skillName: string): SkillInfo | undefined {
  // Direct match
  if (skillIndex.has(skillName)) {
    return skillIndex.get(skillName);
  }

  // Try without leading underscore
  if (skillName.startsWith('_')) {
    const withoutUnderscore = skillName.substring(1);
    if (skillIndex.has(withoutUnderscore)) {
      return skillIndex.get(withoutUnderscore);
    }
  }

  // Try with leading underscore
  const withUnderscore = '_' + skillName;
  if (skillIndex.has(withUnderscore)) {
    return skillIndex.get(withUnderscore);
  }

  return undefined;
}

// ============================================================================
// SERVER IMPLEMENTATION
// ============================================================================

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let workspaceRoot: string = '';

connection.onInitialize((params: InitializeParams): InitializeResult => {
  workspaceRoot = params.rootPath || params.rootUri || '';

  connection.console.log(`Newo DSL Language Server initializing`);
  connection.console.log(`Workspace: ${workspaceRoot}`);
  connection.console.log(`Actions loaded: ${Object.keys(ACTIONS).length}`);

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: false,
        triggerCharacters: ['.', '(', '"', "'", '{', '_', '=']
      },
      hoverProvider: true,
      definitionProvider: true
      // Diagnostics use push model via onDidChangeContent + sendDiagnostics
    }
  };
});

connection.onInitialized(() => {
  connection.console.log('Server initialized with action definitions');

  // Build skill index from workspace
  if (workspaceRoot) {
    // Handle file:// URI
    let rootPath = workspaceRoot;
    if (rootPath.startsWith('file://')) {
      rootPath = rootPath.replace('file://', '');
    }
    buildSkillIndex(rootPath);

    // Re-validate all open documents now that skill index is built
    documents.all().forEach(doc => {
      validateDocument(doc);
    });
  }
});

// ============================================================================
// DIAGNOSTICS
// ============================================================================

async function validateDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const uri = textDocument.uri;
  const diagnostics: LspDiagnostic[] = [];
  const lines = text.split('\n');

  // Check for unbalanced braces
  const openExpr = (text.match(/\{\{/g) || []).length;
  const closeExpr = (text.match(/\}\}/g) || []).length;

  if (openExpr !== closeExpr) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
      message: `Unbalanced expression braces: ${openExpr} {{ vs ${closeExpr} }}`,
      source: 'newo-dsl'
    });
  }

  const openStmt = (text.match(/\{%/g) || []).length;
  const closeStmt = (text.match(/%\}/g) || []).length;

  if (openStmt !== closeStmt) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
      message: `Unbalanced statement braces: ${openStmt} {% vs ${closeStmt} %}`,
      source: 'newo-dsl'
    });
  }

  // Find action/skill calls and validate them in both expression and statement contexts
  let match;

  // First pass: expression-style calls {{ Action( }}
  const expressionPattern = /\{\{([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  while ((match = expressionPattern.exec(text)) !== null) {
    const actionName = match[1];
    const matchPos = match.index;

    // Find line number
    let charCount = 0;
    let lineNum = 0;
    let colNum = 0;
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= matchPos) {
        lineNum = i;
        colNum = matchPos - charCount + 2;
        break;
      }
      charCount += lines[i].length + 1;
    }

    // Check if this is a known built-in action or Jinja built-in
    const isKnownAction = ACTIONS.hasOwnProperty(actionName);
    const isJinjaBuiltin = JINJA_BUILTIN_NAMES.has(actionName);

    // Extract the full call to analyze parameters
    const callStart = matchPos;
    let depth = 0;
    let callEnd = callStart;
    for (let i = matchPos; i < text.length; i++) {
      if (text[i] === '(') depth++;
      if (text[i] === ')') {
        depth--;
        if (depth === 0) {
          callEnd = i + 1;
          break;
        }
      }
    }
    const callText = text.substring(callStart, callEnd);

    // Extract passed parameter names from the call
    const passedParams: string[] = [];
    const paramPattern = /(\w+)\s*=/g;
    let paramMatch;
    while ((paramMatch = paramPattern.exec(callText)) !== null) {
      passedParams.push(paramMatch[1]);
    }

    // If NOT a known action and NOT a Jinja built-in, it must be a skill call - validate it
    if (!isKnownAction && !isJinjaBuiltin && skillIndexBuilt) {
      const skillInfo = getSkillInfo(actionName);
      if (!skillInfo) {
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: {
            start: { line: lineNum, character: colNum },
            end: { line: lineNum, character: colNum + actionName.length }
          },
          message: `Unknown function '${actionName}' - not a built-in action and no matching skill file (.jinja/.guidance) found`,
          source: 'newo-dsl'
        });
      } else if (skillInfo.parameters.length > 0) {
        // Validate skill parameters
        const expectedParams = skillInfo.parameters.map(p => p.name);

        // Check for unknown parameters (typos!)
        for (const passed of passedParams) {
          if (!expectedParams.includes(passed)) {
            diagnostics.push({
              severity: DiagnosticSeverity.Error,
              range: {
                start: { line: lineNum, character: colNum },
                end: { line: lineNum, character: colNum + actionName.length }
              },
              message: `${actionName}: unknown parameter '${passed}'. Expected: ${expectedParams.join(', ')}`,
              source: 'newo-dsl'
            });
          }
        }

        // Check for missing required parameters
        for (const param of skillInfo.parameters) {
          if (param.required && !passedParams.includes(param.name)) {
            diagnostics.push({
              severity: DiagnosticSeverity.Warning,
              range: {
                start: { line: lineNum, character: colNum },
                end: { line: lineNum, character: colNum + actionName.length }
              },
              message: `${actionName}: missing parameter '${param.name}'`,
              source: 'newo-dsl'
            });
          }
        }
      }
    }

    // Validate required parameters for known actions
    const rule = VALIDATION_RULES[actionName];
    if (rule && rule.requiredParams.length > 0) {
      for (const param of rule.requiredParams) {
        if (!passedParams.includes(param)) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
              start: { line: lineNum, character: colNum },
              end: { line: lineNum, character: colNum + actionName.length }
            },
            message: `${actionName}: missing required parameter '${param}'`,
            source: 'newo-dsl'
          });
        }
      }
    }
  }

  // Second pass: statement-style calls {% set x = Action() %} or {% if Action() %}
  // This pattern finds function calls inside {% %} blocks
  const stmtBlockPattern = /\{%[^%]*%\}/g;
  let stmtMatch;
  while ((stmtMatch = stmtBlockPattern.exec(text)) !== null) {
    const stmtBlock = stmtMatch[0];
    const stmtPos = stmtMatch.index;

    // Find all function calls within this statement block
    const funcCallPattern = /([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
    let funcMatch;
    while ((funcMatch = funcCallPattern.exec(stmtBlock)) !== null) {
      const funcName = funcMatch[1];

      // Skip Jinja keywords and built-ins
      const jinjaKeywords = ['set', 'if', 'elif', 'else', 'endif', 'for', 'endfor', 'block', 'endblock', 'macro', 'endmacro', 'call', 'filter', 'raw', 'include', 'import', 'from', 'extends', 'with', 'autoescape', 'range', 'loop', 'not', 'and', 'or', 'in', 'is', 'true', 'false', 'none', 'True', 'False', 'None'];
      if (jinjaKeywords.includes(funcName) || jinjaKeywords.includes(funcName.toLowerCase())) {
        continue;
      }

      // Skip Jinja built-in filters/functions
      if (JINJA_BUILTIN_NAMES.has(funcName)) {
        continue;
      }

      // Calculate the actual position in the original text
      const funcPosInBlock = funcMatch.index;
      const actualPos = stmtPos + funcPosInBlock;

      // Find line number and column
      let charCount = 0;
      let lineNum = 0;
      let colNum = 0;
      for (let i = 0; i < lines.length; i++) {
        if (charCount + lines[i].length >= actualPos) {
          lineNum = i;
          colNum = actualPos - charCount;
          break;
        }
        charCount += lines[i].length + 1;
      }

      // Check if this is a known action
      const isKnownAction = ACTIONS.hasOwnProperty(funcName);

      // Extract the full call to analyze parameters
      // Find matching closing parenthesis from the function position
      const callStartInBlock = funcMatch.index;
      let depth = 0;
      let callEndInBlock = callStartInBlock;
      for (let i = callStartInBlock; i < stmtBlock.length; i++) {
        if (stmtBlock[i] === '(') depth++;
        if (stmtBlock[i] === ')') {
          depth--;
          if (depth === 0) {
            callEndInBlock = i + 1;
            break;
          }
        }
      }
      const callText = stmtBlock.substring(callStartInBlock, callEndInBlock);

      // Extract passed parameter names from the call
      const passedParams: string[] = [];
      const paramPattern = /(\w+)\s*=/g;
      let paramMatch;
      while ((paramMatch = paramPattern.exec(callText)) !== null) {
        passedParams.push(paramMatch[1]);
      }

      // If NOT a known action and NOT a Jinja built-in, check if it's a skill
      if (!isKnownAction && skillIndexBuilt) {
        const skillInfo = getSkillInfo(funcName);
        if (!skillInfo) {
          // Unknown function - but only report if it looks like an action (PascalCase)
          if (/^[A-Z]/.test(funcName)) {
            diagnostics.push({
              severity: DiagnosticSeverity.Error,
              range: {
                start: { line: lineNum, character: colNum },
                end: { line: lineNum, character: colNum + funcName.length }
              },
              message: `Unknown function '${funcName}' - not a built-in action and no matching skill file (.jinja/.guidance) found`,
              source: 'newo-dsl'
            });
          }
        } else if (skillInfo.parameters.length > 0) {
          // Validate skill parameters
          const expectedParams = skillInfo.parameters.map(p => p.name);

          // Check for unknown parameters
          for (const passed of passedParams) {
            if (!expectedParams.includes(passed)) {
              diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                  start: { line: lineNum, character: colNum },
                  end: { line: lineNum, character: colNum + funcName.length }
                },
                message: `${funcName}: unknown parameter '${passed}'. Expected: ${expectedParams.join(', ')}`,
                source: 'newo-dsl'
              });
            }
          }

          // Check for missing required parameters
          for (const param of skillInfo.parameters) {
            if (param.required && !passedParams.includes(param.name)) {
              diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: {
                  start: { line: lineNum, character: colNum },
                  end: { line: lineNum, character: colNum + funcName.length }
                },
                message: `${funcName}: missing parameter '${param.name}'`,
                source: 'newo-dsl'
              });
            }
          }
        }
      }

      // Validate required parameters for known actions
      const rule = VALIDATION_RULES[funcName];
      if (rule && rule.requiredParams.length > 0) {
        for (const param of rule.requiredParams) {
          if (!passedParams.includes(param)) {
            diagnostics.push({
              severity: DiagnosticSeverity.Warning,
              range: {
                start: { line: lineNum, character: colNum },
                end: { line: lineNum, character: colNum + funcName.length }
              },
              message: `${funcName}: missing required parameter '${param}'`,
              source: 'newo-dsl'
            });
          }
        }
      }
    }
  }

  connection.sendDiagnostics({ uri, diagnostics });
}

// Validate on content change
documents.onDidChangeContent(change => {
  validateDocument(change.document);
});

// Also validate when document is opened
documents.onDidOpen(event => {
  validateDocument(event.document);
});

// ============================================================================
// COMPLETIONS
// ============================================================================

connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const lines = text.split('\n');
  const line = lines[params.position.line];
  const beforeCursor = line.substring(0, params.position.character);

  const completions: CompletionItem[] = [];

  // Check if we're inside an expression {{ }}
  const inExpression = (beforeCursor.match(/\{\{/g) || []).length >
                       (beforeCursor.match(/\}\}/g) || []).length;

  // Check if we're completing a parameter value
  const paramMatch = beforeCursor.match(/(\w+)\s*\(\s*(?:[^)]*,\s*)?(\w+)\s*=\s*["']?([^"',)]*)$/);

  if (paramMatch) {
    const [, actionName, paramName, partialValue] = paramMatch;
    const action = ACTIONS[actionName];

    if (action) {
      const param = action.parameters[paramName];
      if (param?.allowed) {
        for (const val of param.allowed) {
          if (val.toLowerCase().startsWith(partialValue.toLowerCase())) {
            completions.push({
              label: val,
              kind: CompletionItemKind.EnumMember,
              detail: `Valid value for ${paramName}`,
              insertText: val
            });
          }
        }
        return completions;
      }
    }
  }

  // Check if we're inside a skill/function call - suggest parameters
  const insideCallMatch = beforeCursor.match(/(\w+)\s*\([^)]*$/);
  if (insideCallMatch) {
    const funcName = insideCallMatch[1];
    // Check if it's a skill
    const skillInfo = getSkillInfo(funcName);
    if (skillInfo && skillInfo.parameters.length > 0) {
      // Get already used parameters
      const usedParams = [...beforeCursor.matchAll(/(\w+)\s*=/g)].map(m => m[1]);

      for (const param of skillInfo.parameters) {
        if (!usedParams.includes(param.name)) {
          completions.push({
            label: param.name,
            kind: CompletionItemKind.Property,
            detail: param.required ? '(required)' : '(optional)',
            insertText: `${param.name}=`,
            insertTextFormat: InsertTextFormat.PlainText
          });
        }
      }
      if (completions.length > 0) {
        return completions;
      }
    }
  }

  if (inExpression) {
    // Add all actions with documentation
    for (const [name, action] of Object.entries(ACTIONS)) {
      // Build parameter snippet
      const requiredParams = Object.entries(action.parameters)
        .filter(([, p]) => p.required)
        .map(([pName], idx) => `${pName}=\${${idx + 1}}`);

      const snippet = requiredParams.length > 0
        ? `${name}(${requiredParams.join(', ')})$0`
        : `${name}($1)$0`;

      completions.push({
        label: name,
        kind: CompletionItemKind.Function,
        detail: `(${action.category}) ${action.description.substring(0, 60)}...`,
        documentation: {
          kind: MarkupKind.Markdown,
          value: formatActionDoc(name, action)
        },
        insertText: snippet,
        insertTextFormat: InsertTextFormat.Snippet
      });
    }

    // Add skills with parameter snippets
    for (const [name, skill] of skillIndex) {
      const requiredParams = skill.parameters
        .filter(p => p.required)
        .map((p, idx) => `${p.name}=\${${idx + 1}}`);

      const snippet = requiredParams.length > 0
        ? `${name}(${requiredParams.join(', ')})$0`
        : `${name}($1)$0`;

      const paramDesc = skill.parameters.length > 0
        ? `Params: ${skill.parameters.map(p => p.name).join(', ')}`
        : 'No parameters';

      completions.push({
        label: name,
        kind: CompletionItemKind.Function,
        detail: `(skill) ${paramDesc}`,
        documentation: {
          kind: MarkupKind.Markdown,
          value: `**${name}**\n\nNewo DSL Skill\n\n**Parameters:** ${skill.parameters.map(p => p.name).join(', ') || 'None'}`
        },
        insertText: snippet,
        insertTextFormat: InsertTextFormat.Snippet
      });
    }

    // Add control flow keywords
    const keywords = [
      { name: 'if', snippet: '#if ${1:condition}}}\n  $0\n{{/if' },
      { name: 'else', snippet: 'else}}' },
      { name: 'elif', snippet: 'elif ${1:condition}}}' },
      { name: 'for', snippet: '#for ${1:item} in ${2:items}}}\n  $0\n{{/for' },
      { name: 'set', snippet: 'set ${1:name} = ${2:value}' }
    ];

    for (const kw of keywords) {
      completions.push({
        label: kw.name,
        kind: CompletionItemKind.Keyword,
        detail: 'Control flow keyword',
        insertText: kw.snippet,
        insertTextFormat: InsertTextFormat.Snippet
      });
    }
  }

  return completions;
});

// ============================================================================
// HOVER
// ============================================================================

connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const text = document.getText();
  const lines = text.split('\n');
  const line = lines[params.position.line];

  // Find word at position
  const beforePos = line.substring(0, params.position.character);
  const afterPos = line.substring(params.position.character);

  const beforeMatch = beforePos.match(/([A-Za-z_][A-Za-z0-9_]*)$/);
  const afterMatch = afterPos.match(/^([A-Za-z0-9_]*)/);

  if (!beforeMatch && !afterMatch) return null;

  const word = (beforeMatch?.[1] || '') + (afterMatch?.[1] || '');

  // Check if it's a known action
  const action = ACTIONS[word];
  if (action) {
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: formatActionDoc(word, action)
      }
    };
  }

  // Check if it's a Jinja built-in
  const jinjaBuiltin = JINJA_BUILTINS[word];
  if (jinjaBuiltin) {
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: `## ${word}\n\n${jinjaBuiltin.description}\n\n**Syntax:** \`${jinjaBuiltin.syntax}\`\n\n**Returns:** ${jinjaBuiltin.returns}\n\n*(Jinja built-in)*`
      }
    };
  }

  // If not a known action, check if it's a skill
  const skillInfo = getSkillInfo(word);
  if (skillInfo) {
    let doc = `## ${word}\n\n`;
    doc += `Newo DSL Skill\n\n`;

    if (skillInfo.parameters.length > 0) {
      const paramNames = skillInfo.parameters.map(p => p.name).join(', ');
      doc += `**Parameters:** ${paramNames}`;
    } else {
      doc += `**Parameters:** None`;
    }

    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: doc
      }
    };
  }

  // Unknown function - neither built-in action nor found skill
  // Only show warning if it looks like a function call (followed by parenthesis)
  const afterWord = line.substring(params.position.character + (afterMatch?.[1]?.length || 0));
  if (afterWord.trimStart().startsWith('(')) {
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: `**${word}** ⚠️\n\n**Unknown function!**\n\nNot a built-in action and no matching skill file (.jinja/.guidance) found.`
      }
    };
  }

  return null;
});

// ============================================================================
// DEFINITION
// ============================================================================

connection.onDefinition((params: DefinitionParams): Location | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const text = document.getText();
  const lines = text.split('\n');
  const line = lines[params.position.line];

  const beforePos = line.substring(0, params.position.character);
  const afterPos = line.substring(params.position.character);

  const beforeMatch = beforePos.match(/([A-Za-z_][A-Za-z0-9_]*)$/);
  const afterMatch = afterPos.match(/^([A-Za-z0-9_]*)/);

  if (!beforeMatch && !afterMatch) return null;

  const word = (beforeMatch?.[1] || '') + (afterMatch?.[1] || '');

  // Go to skill definition (for any function that's not a built-in action)
  if (!ACTIONS.hasOwnProperty(word)) {
    const skillInfo = getSkillInfo(word);
    if (skillInfo) {
      return {
        uri: 'file://' + skillInfo.filePath,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 }
        }
      };
    }
  }

  return null;
});

// ============================================================================
// HELPERS
// ============================================================================

function formatActionDoc(name: string, action: ActionDefinition): string {
  let doc = `## ${name}\n\n`;
  doc += `${action.description}\n\n`;
  doc += `**Category:** ${action.category}\n\n`;
  doc += `**Syntax:**\n\`\`\`newo\n${action.syntax}\n\`\`\`\n\n`;

  if (Object.keys(action.parameters).length > 0) {
    doc += `**Parameters:**\n`;
    for (const [pName, param] of Object.entries(action.parameters)) {
      const req = param.required ? '*(required)*' : '*(optional)*';
      const def = param.default ? ` Default: \`${param.default}\`` : '';
      const allowed = param.allowed ? ` Options: \`${param.allowed.join('`, `')}\`` : '';
      doc += `- \`${pName}\` (${param.type}) ${req}: ${param.description}${def}${allowed}\n`;
    }
    doc += '\n';
  }

  doc += `**Returns:** ${action.returns}\n\n`;
  doc += `**Example:**\n\`\`\`newo\n${action.example}\n\`\`\``;

  return doc;
}

// ============================================================================
// START SERVER
// ============================================================================

documents.listen(connection);
connection.listen();

connection.console.log('Newo DSL Language Server started');
