/**
 * Validation rules for Newo DSL built-in actions.
 * Extracted from packages/dsl-lsp-server/src/server.ts
 */

import { ValidationRule } from './types';

export const VALIDATION_RULES: Record<string, ValidationRule> = {
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
  DeletePersonaAttribute: { requiredParams: ['id', 'field'] },
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
  Do: { requiredParams: ['action'] },

  // Previously missing validation rules
  IsGlobal: { requiredParams: ['name'] },
  GetDateInterval: { requiredParams: ['start', 'offset'] },

  // V2-era built-in actions
  GetSessionInfo: { requiredParams: [] },
  DisableFollowUp: { requiredParams: [] },
  EnableFollowUp: { requiredParams: [] },
  SetCustomerInfo: { requiredParams: [] },  // All params optional

  // V2-era error reporting + FastPrompt
  FastPrompt: { requiredParams: [] },
  Error: { requiredParams: ['message'] },
  ResultError: { requiredParams: [] },
  ConnectorResultError: { requiredParams: [] }
};
