/**
 * Shared type definitions for Newo DSL data structures.
 * Extracted from packages/dsl-lsp-server/src/server.ts
 */

export interface ActionParameter {
  type: string;
  required: boolean;
  default?: string;
  description: string;
  allowed?: string[];
}

export interface ActionDefinition {
  description: string;
  category: string;
  syntax: string;
  parameters: Record<string, ActionParameter>;
  returns: string;
  example: string;
}

export interface JinjaBuiltin {
  description: string;
  syntax: string;
  returns: string;
}

export interface ValidationRule {
  requiredParams: string[];
  paramConstraints?: Record<string, { min?: number; max?: number; allowed?: string[] }>;
}
