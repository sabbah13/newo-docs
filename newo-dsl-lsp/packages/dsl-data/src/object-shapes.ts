/**
 * Object shape definitions for Newo DSL action return types.
 *
 * Each shape describes the properties available on objects returned by
 * built-in actions (e.g., GetUser() returns a User shape with .id, .name, etc.).
 * Used by the LSP for dot-access completions, hover info, and type checking.
 */

export interface ObjectShapeProperty {
  type: string;
  description: string;
}

export interface ObjectShape {
  description: string;
  properties: Record<string, ObjectShapeProperty>;
}

export const OBJECT_SHAPES: Record<string, ObjectShape> = {

  User: {
    description: 'User object returned by GetUser()',
    properties: {
      id: { type: 'string', description: 'User UUID' },
      name: { type: 'string', description: 'User display name' },
      title: { type: 'string', description: 'User title' },
      email: { type: 'string', description: 'User email address' },
      phone: { type: 'string', description: 'User phone number' },
      language: { type: 'string', description: 'User language preference' },
      timezone: { type: 'string', description: 'User timezone' },
    }
  },

  Actor: {
    description: 'Actor object returned by GetActor() or elements of GetActors()',
    properties: {
      id: { type: 'string', description: 'Actor UUID' },
      integrationIdn: { type: 'string', description: 'Integration identifier' },
      connectorIdn: { type: 'string', description: 'Connector identifier' },
      externalId: { type: 'string', description: 'External system identifier' },
      name: { type: 'string', description: 'Actor display name' },
      personaId: { type: 'string', description: 'Associated persona UUID' },
    }
  },

  Act: {
    description: 'Act (triggered action) object returned by GetTriggeredAct() or GetAct()',
    properties: {
      arguments: { type: 'object', description: 'Event arguments passed to this act' },
      name: { type: 'string', description: 'Act name / action identifier' },
      targetAction: { type: 'string', description: 'Target action for this act' },
    }
  },

  AgentPersona: {
    description: 'Agent persona object returned by GetAgentPersona()',
    properties: {
      id: { type: 'string', description: 'Persona UUID' },
      name: { type: 'string', description: 'Persona display name' },
    }
  },

  SessionInfo: {
    description: 'Session info object returned by GetSessionInfo()',
    properties: {
      id: { type: 'string', description: 'Session UUID' },
    }
  },

  AkbTopic: {
    description: 'Knowledge base topic from SearchFuzzyAkb() results',
    properties: {
      topicId: { type: 'string', description: 'Topic UUID' },
      summary: { type: 'string', description: 'Topic summary text' },
      facts: { type: 'string', description: 'Topic facts content' },
      name: { type: 'string', description: 'Topic name' },
      source: { type: 'string', description: 'Source of the topic' },
      labels: { type: 'array', description: 'Topic classification labels' },
    }
  },

  ConnectorInfo: {
    description: 'Connector info object returned by GetConnectorInfo()',
    properties: {
      integrationIdn: { type: 'string', description: 'Integration identifier' },
      connectorIdn: { type: 'string', description: 'Connector identifier' },
      title: { type: 'string', description: 'Connector display title' },
      settings: { type: 'object', description: 'Connector configuration settings' },
    }
  },

  AgentInfo: {
    description: 'Agent info object returned by GetAgent()',
    properties: {
      personaId: { type: 'string', description: 'Agent persona UUID' },
      idn: { type: 'string', description: 'Agent identifier' },
    }
  },

  CustomerInfo: {
    description: 'Customer info object returned by GetCustomerInfo()',
    properties: {
      phoneNumber: { type: 'string', description: 'Customer phone number' },
      email: { type: 'string', description: 'Customer email address' },
      name: { type: 'string', description: 'Customer display name' },
    }
  },

  Customer: {
    description: 'Customer object returned by GetCustomer()',
    properties: {
      idn: { type: 'string', description: 'Customer identifier' },
      email: { type: 'string', description: 'Customer email address' },
    }
  },

  Webhook: {
    description: 'Webhook object returned by GetWebhook()',
    properties: {
      webhookIdn: { type: 'string', description: 'Webhook identifier' },
      webhookType: { type: 'string', description: 'Webhook type (incoming/outgoing)' },
      url: { type: 'string', description: 'Webhook URL' },
      headers: { type: 'object', description: 'Webhook HTTP headers' },
      body: { type: 'string', description: 'Webhook body template' },
    }
  },

  LoopContext: {
    description: 'Jinja for-loop context variable (loop)',
    properties: {
      index: { type: 'number', description: 'Current iteration (1-indexed)' },
      index0: { type: 'number', description: 'Current iteration (0-indexed)' },
      first: { type: 'boolean', description: 'True if first iteration' },
      last: { type: 'boolean', description: 'True if last iteration' },
      length: { type: 'number', description: 'Total number of items' },
      revindex: { type: 'number', description: 'Iterations remaining (1-indexed)' },
      revindex0: { type: 'number', description: 'Iterations remaining (0-indexed)' },
    }
  },

};
