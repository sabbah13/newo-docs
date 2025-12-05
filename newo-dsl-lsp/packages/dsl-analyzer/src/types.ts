/**
 * Type definitions for Newo DSL Analyzer
 */

export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint';

export interface Position {
  line: number;
  column: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface Diagnostic {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  range: Range;
  source?: string;
  relatedInformation?: DiagnosticRelatedInfo[];
  data?: any;
}

export interface DiagnosticRelatedInfo {
  location: { uri: string; range: Range };
  message: string;
}

export interface FunctionCall {
  name: string;
  type: 'skill' | 'builtin' | 'unknown';
  parameters: Parameter[];
  range: Range;
}

export interface Parameter {
  name?: string;
  value: string;
  type: 'keyword' | 'positional';
  range?: Range;
}

export interface Variable {
  name: string;
  range: Range;
  defined: boolean;
}

export interface Block {
  name: string;
  args?: string;
  type: 'open' | 'close';
  range: Range;
}

export interface ParseResult {
  filePath: string;
  languageId: 'newo-jinja' | 'newo-guidance';
  functionCalls: FunctionCall[];
  skillCalls: FunctionCall[];
  builtinCalls: FunctionCall[];
  variables: {
    defined: Variable[];
    referenced: Variable[];
  };
  blocks: Block[];
  diagnostics: Diagnostic[];
}

export interface SkillSchema {
  idn: string;
  title: string;
  parameters: ParameterSchema[];
  runner_type: string;
  path?: string;
}

export interface ParameterSchema {
  name: string;
  type: string;
  required: boolean;
  default_value?: any;
  description?: string;
}

export interface BuiltinSchema {
  name: string;
  category: string;
  parameters: ParameterSchema[];
  returns?: { type: string; description?: string };
  description?: string;
}

export interface AttributeSchema {
  name: string;
  id: string;
  category: string;
  type: string;
}

export interface SchemaRegistry {
  skills: Map<string, SkillSchema>;
  builtins: Map<string, BuiltinSchema>;
  attributes: Set<string>;
  events: Set<string>;
}

export interface CompletionItem {
  label: string;
  kind: CompletionKind;
  detail?: string;
  documentation?: string;
  insertText?: string;
  sortText?: string;
}

export type CompletionKind =
  | 'function'
  | 'skill'
  | 'builtin'
  | 'variable'
  | 'parameter'
  | 'attribute'
  | 'keyword'
  | 'snippet';

export interface HoverInfo {
  contents: string;
  range?: Range;
}

export interface DefinitionLocation {
  uri: string;
  range: Range;
}
