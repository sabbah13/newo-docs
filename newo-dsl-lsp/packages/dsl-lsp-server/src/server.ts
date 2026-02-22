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
  InsertTextFormat,
  CodeAction,
  CodeActionKind,
  CodeActionParams,
  TextEdit,
  SemanticTokensParams,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import * as path from 'path';
import * as fs from 'fs';

import {
  ACTIONS,
  JINJA_BUILTINS,
  OBJECT_SHAPES,
  type ActionDefinition,
} from '@newo-dsl/data';

// Set of all Jinja built-in names for quick lookup (used by completions and semantic tokens)
const JINJA_BUILTIN_NAMES = new Set(Object.keys(JINJA_BUILTINS));

import {
  validateTemplateText,
  getSkillInfo,
} from './validate';

import {
  detectFormatVersion,
  scanDirectoryForSkills,
  scanV2ModuleForSkills,
  scanDirectoryForAttributes,
  parseSkillMetadata,
  parseV2FlowYaml,
  type SkillInfo,
  type SkillParameter,
  type AttributeCatalog
} from './format-utils';

import {
  getVariablesAtLine,
  findDefinition,
  type VariableTable,
} from './variable-tracker';

import {
  TOKEN_TYPES,
  TOKEN_MODIFIERS,
  computeSemanticTokens,
} from './semantic-tokens';

let skillIndex: Map<string, SkillInfo> = new Map();
let skillIndexBuilt = false;

/** Add a skill to the index, preferring entries with more parameter info. */
function addToSkillIndex(skill: SkillInfo): void {
  const existing = skillIndex.get(skill.name);
  if (!existing || skill.parameters.length > existing.parameters.length) {
    skillIndex.set(skill.name, skill);
  }
}

// Per-document variable table cache
const variableTableCache: Map<string, VariableTable> = new Map();

// Project-wide attribute catalog (field names discovered from template files)
let attributeCatalog: AttributeCatalog = new Map();

/**
 * Build the skill index from workspace.
 * Supports V1 (project/, newo_customers/) and V2 (modules with import_version.txt) formats.
 */
function buildSkillIndex(rootPath: string): void {
  skillIndex.clear();

  // Also scan parent directories for project structure
  let searchPaths: string[] = [rootPath];

  // If rootPath contains newo-dsl-lsp, also scan the parent newo project
  if (rootPath.includes('newo-dsl-lsp')) {
    const parentDir = path.dirname(rootPath.replace(/\/newo-dsl-lsp.*$/, ''));
    const newoCustomers = path.join(parentDir, 'newo_customers');
    if (fs.existsSync(newoCustomers)) {
      searchPaths.push(newoCustomers);
    }
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
    path.join(rootPath, 'temp'),
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p) && !searchPaths.includes(p)) {
      searchPaths.push(p);
    }
  }

  for (const searchPath of searchPaths) {
    const version = detectFormatVersion(searchPath);

    if (version === 'v2') {
      // V2: scan each module directory within the project
      connection.console.log(`V2 format detected at: ${searchPath}`);
      try {
        const entries = fs.readdirSync(searchPath, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;

          const entryPath = path.join(searchPath, entry.name);

          // Check if this is the project root (has import_version.txt)
          if (fs.existsSync(path.join(entryPath, 'import_version.txt'))) {
            // Scan each module inside the project root
            const moduleEntries = fs.readdirSync(entryPath, { withFileTypes: true });
            for (const moduleEntry of moduleEntries) {
              if (!moduleEntry.isDirectory()) continue;
              if (moduleEntry.name === 'akb') continue;
              const modulePath = path.join(entryPath, moduleEntry.name);
              // Check if it has agents/ or libraries/ (it's a module)
              if (fs.existsSync(path.join(modulePath, 'agents')) ||
                  fs.existsSync(path.join(modulePath, 'libraries'))) {
                const moduleSkills = scanV2ModuleForSkills(modulePath);
                for (const skill of moduleSkills) {
                  addToSkillIndex(skill);
                }
              }
            }
          } else if (fs.existsSync(path.join(entryPath, 'agents')) ||
                     fs.existsSync(path.join(entryPath, 'libraries'))) {
            // Direct module directory
            const moduleSkills = scanV2ModuleForSkills(entryPath);
            for (const skill of moduleSkills) {
              addToSkillIndex(skill);
            }
          }
        }
      } catch { /* ignore */ }
    } else {
      // V1: standard recursive scan
      const skills = scanDirectoryForSkills(searchPath);
      for (const skill of skills) {
        addToSkillIndex(skill);
      }
    }
  }

  skillIndexBuilt = true;
  connection.console.log(`Skill index built: ${skillIndex.size} skills found`);

  // Build attribute catalog from project files
  attributeCatalog = new Map();
  for (const searchPath of searchPaths) {
    const pathCatalog = scanDirectoryForAttributes(searchPath);
    for (const [category, values] of pathCatalog) {
      if (!attributeCatalog.has(category)) {
        attributeCatalog.set(category, new Set());
      }
      for (const v of values) {
        attributeCatalog.get(category)!.add(v);
      }
    }
  }

  let totalAttrs = 0;
  for (const [, values] of attributeCatalog) {
    totalAttrs += values.size;
  }
  connection.console.log(`Attribute catalog built: ${totalAttrs} unique field names found`);
}

/** Local shorthand that passes the module-level skillIndex to the pure function. */
function getSkillInfoLocal(skillName: string): SkillInfo | undefined {
  return getSkillInfo(skillIndex, skillName);
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
      definitionProvider: true,
      codeActionProvider: {
        codeActionKinds: [CodeActionKind.QuickFix]
      },
      semanticTokensProvider: {
        legend: {
          tokenTypes: [...TOKEN_TYPES],
          tokenModifiers: [...TOKEN_MODIFIERS],
        },
        full: true,
      },
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

// Handle schema reload requests from the extension
connection.onNotification('newo-dsl/reloadSchemas', () => {
  connection.console.log('Reloading schemas (rebuilding skill index)...');
  if (workspaceRoot) {
    let rootPath = workspaceRoot;
    if (rootPath.startsWith('file://')) {
      rootPath = rootPath.replace('file://', '');
    }
    buildSkillIndex(rootPath);

    // Re-validate all open documents with updated skill index
    documents.all().forEach(doc => {
      validateDocument(doc);
    });
    connection.console.log('Schemas reloaded successfully');
  }
});

// ============================================================================
// DIAGNOSTICS
// ============================================================================

async function validateDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const uri = textDocument.uri;

  // Resolve skill params for this file (depends on module-level skillIndex)
  const fileName = uri.split('/').pop() || '';
  const fileBaseName = fileName.replace(/\.(jinja|guidance|nsl|nslg)$/, '');
  let skillParams: SkillParameter[] | undefined;

  // 1. Exact file path match, 2. Exact base name match
  for (const [, skill] of skillIndex) {
    if (uri.endsWith(skill.filePath)) {
      skillParams = skill.parameters;
      break;
    }
    if (skill.name === fileBaseName) {
      skillParams = skill.parameters;
      break;
    }
  }

  // 3. Fallback: read metadata/flow YAML from the file's own directory
  if ((!skillParams || skillParams.length === 0) && uri.startsWith('file://')) {
    const filePath = uri.replace('file://', '');
    const skillDir = path.dirname(filePath);

    // V1 fallback: metadata.yaml in same directory
    const metadataPath = path.join(skillDir, 'metadata.yaml');
    if (fs.existsSync(metadataPath)) {
      const parsed = parseSkillMetadata(metadataPath);
      if (parsed.length > 0) {
        skillParams = parsed;
      }
    }

    // V2 fallback: flow YAML in parent directory (skills/ -> FlowName/)
    if ((!skillParams || skillParams.length === 0) && path.basename(skillDir) === 'skills') {
      const flowDir = path.dirname(skillDir);
      const flowName = path.basename(flowDir);
      const flowYaml = path.join(flowDir, `${flowName}.yaml`);
      if (fs.existsSync(flowYaml)) {
        const flowParamsMap = parseV2FlowYaml(flowYaml);
        const params = flowParamsMap.get(fileBaseName);
        if (params && params.length > 0) {
          skillParams = params;
        }
      }
    }
  }

  // Delegate to the pure validation function (testable without LSP transport)
  const { diagnostics, varTable } = validateTemplateText(text, {
    uri,
    skillIndex,
    skillIndexBuilt,
    skillParams,
  });

  variableTableCache.set(uri, varTable);
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

  // Check if we're inside an expression {{ }} or statement {% %}
  const inExpression = (beforeCursor.match(/\{\{/g) || []).length >
                       (beforeCursor.match(/\}\}/g) || []).length;
  const inStatement = (beforeCursor.match(/\{%/g) || []).length >
                      (beforeCursor.match(/%\}/g) || []).length;

  // Check if we're completing a dot-access (e.g., user. or loop.)
  const dotAccessMatch = beforeCursor.match(/\b([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z0-9_]*)$/);
  if (dotAccessMatch && (inExpression || inStatement)) {
    const [, varName, partial] = dotAccessMatch;
    const varTable = variableTableCache.get(params.textDocument.uri);
    if (varTable) {
      const varDef = findDefinition(varTable, varName, params.position.line);
      if (varDef) {
        // Determine which shape to use
        let shapeKey = varDef.shapeKey;

        // For for-loop variables iterating over typed arrays, use the element shape
        if (varDef.source === 'for-loop' && varDef.elementShapeKey) {
          shapeKey = varDef.elementShapeKey;
        }

        if (shapeKey && OBJECT_SHAPES[shapeKey]) {
          const shape = OBJECT_SHAPES[shapeKey];
          for (const [propName, prop] of Object.entries(shape.properties)) {
            if (propName.toLowerCase().startsWith(partial.toLowerCase())) {
              completions.push({
                label: propName,
                kind: CompletionItemKind.Property,
                detail: `(${prop.type}) ${varName}.${propName}`,
                documentation: {
                  kind: MarkupKind.Markdown,
                  value: `**${varName}.${propName}**\n\n${prop.description}\n\n**Type:** \`${prop.type}\`\n\n*From ${shape.description}*`
                },
                insertText: propName,
                insertTextFormat: InsertTextFormat.PlainText
              });
            }
          }
          if (completions.length > 0) {
            return completions;
          }
        }
      }
    }
  }

  // Check if we're completing a parameter value
  const paramMatch = beforeCursor.match(/(\w+)\s*\(\s*(?:[^)]*,\s*)?(\w+)\s*=\s*["']?([^"',)]*)$/);

  if (paramMatch) {
    const [, actionName, paramName, partialValue] = paramMatch;

    // Check for attribute field/name completions from project discovery
    const attrCategoryMap: Record<string, Record<string, string>> = {
      GetCustomerAttribute: { field: 'customer' },
      SetCustomerAttribute: { field: 'customer' },
      GetCustomerMetadataAttribute: { field: 'customer' },
      SetCustomerMetadataAttribute: { field: 'customer' },
      GetProjectAttribute: { field: 'project' },
      SetProjectAttribute: { field: 'project' },
      GetProjectMetadataAttribute: { field: 'project' },
      SetProjectMetadataAttribute: { field: 'project' },
      GetPersonaAttribute: { field: 'persona' },
      SetPersonaAttribute: { field: 'persona' },
      GetState: { name: 'state' },
      SetState: { name: 'state' },
    };

    const categoryLookup = attrCategoryMap[actionName];
    if (categoryLookup && categoryLookup[paramName]) {
      const category = categoryLookup[paramName];
      const discoveredValues = attributeCatalog.get(category);
      if (discoveredValues && discoveredValues.size > 0) {
        for (const val of discoveredValues) {
          if (val.toLowerCase().startsWith(partialValue.toLowerCase())) {
            completions.push({
              label: val,
              kind: CompletionItemKind.Value,
              detail: `(${category} attribute) discovered from project`,
              insertText: val,
              insertTextFormat: InsertTextFormat.PlainText
            });
          }
        }
        if (completions.length > 0) {
          return completions;
        }
      }
    }

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
    const skillInfo = getSkillInfoLocal(funcName);
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

  if (inExpression || inStatement) {
    // Add variable completions
    const varTable = variableTableCache.get(params.textDocument.uri);
    if (varTable) {
      const varsAtLine = getVariablesAtLine(varTable, params.position.line);
      for (const varDef of varsAtLine) {
        const typeInfo = varDef.inferredType ? ` : ${varDef.inferredType}` : '';
        const sourceLabel = varDef.source === 'parameter' ? 'skill parameter'
          : varDef.source === 'for-loop' ? 'loop variable'
          : varDef.source === 'for-loop-context' ? 'loop context'
          : varDef.source === 'set-action' ? 'Set() variable'
          : 'variable';

        completions.push({
          label: varDef.name,
          kind: CompletionItemKind.Variable,
          detail: `(${sourceLabel})${typeInfo}`,
          documentation: {
            kind: MarkupKind.Markdown,
            value: formatVariableDoc(varDef)
          },
          sortText: `0_${varDef.name}`, // Sort variables before actions/skills
          insertText: varDef.name,
          insertTextFormat: InsertTextFormat.PlainText
        });
      }
    }

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
    if (inExpression) {
      // Guidance-style control flow (inside {{ }})
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

    if (inStatement) {
      // Jinja-style control flow (inside {% %})
      const stmtKeywords = [
        { name: 'set', snippet: 'set ${1:name} = ${2:value} %}\n', detail: 'Variable assignment' },
        { name: 'if', snippet: 'if ${1:condition} %}\n  $0\n{% endif', detail: 'Conditional block' },
        { name: 'elif', snippet: 'elif ${1:condition} %}', detail: 'Else-if branch' },
        { name: 'else', snippet: 'else %}', detail: 'Else branch' },
        { name: 'for', snippet: 'for ${1:item} in ${2:items} %}\n  $0\n{% endfor', detail: 'Loop block' },
        { name: 'endif', snippet: 'endif %}', detail: 'End conditional' },
        { name: 'endfor', snippet: 'endfor %}', detail: 'End loop' },
        { name: 'macro', snippet: 'macro ${1:name}(${2:params}) %}', detail: 'Macro definition' },
        { name: 'endmacro', snippet: 'endmacro %}', detail: 'End macro' },
      ];
      for (const kw of stmtKeywords) {
        completions.push({
          label: kw.name,
          kind: CompletionItemKind.Keyword,
          detail: kw.detail,
          insertText: kw.snippet,
          insertTextFormat: InsertTextFormat.Snippet
        });
      }
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

  // Check for dot-access hover (e.g., user.name - hovering over "name")
  const beforePos = line.substring(0, params.position.character);
  const afterPos = line.substring(params.position.character);

  // Match pattern: varName.property where cursor is on "property"
  const dotHoverMatch = beforePos.match(/\b([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)$/);
  const afterPropMatch = afterPos.match(/^([A-Za-z0-9_]*)/);

  if (dotHoverMatch) {
    const varName = dotHoverMatch[1];
    const propPrefix = dotHoverMatch[2];
    const propSuffix = afterPropMatch?.[1] || '';
    const propName = propPrefix + propSuffix;

    const varTable = variableTableCache.get(params.textDocument.uri);
    if (varTable) {
      const varDef = findDefinition(varTable, varName, params.position.line);
      if (varDef) {
        let shapeKey = varDef.shapeKey;
        if (varDef.source === 'for-loop' && varDef.elementShapeKey) {
          shapeKey = varDef.elementShapeKey;
        }

        if (shapeKey && OBJECT_SHAPES[shapeKey]) {
          const shape = OBJECT_SHAPES[shapeKey];
          const prop = shape.properties[propName];
          if (prop) {
            return {
              contents: {
                kind: MarkupKind.Markdown,
                value: `**${varName}.${propName}**\n\n${prop.description}\n\n**Type:** \`${prop.type}\`\n\n*From ${shape.description}*`
              }
            };
          }
        }
      }
    }
  }

  // Find word at position
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
  const skillInfo = getSkillInfoLocal(word);
  if (skillInfo) {
    let doc = `## ${word}\n\n`;
    doc += `Newo DSL Skill\n\n`;

    if (skillInfo.parameters.length > 0) {
      doc += `**Parameters:**\n`;
      for (const p of skillInfo.parameters) {
        const req = p.required ? '*(required)*' : `*(optional${p.defaultValue ? `, default: \`${p.defaultValue}\`` : ''})*`;
        doc += `- \`${p.name}\` ${req}\n`;
      }
    } else {
      doc += `**Parameters:** None`;
    }

    // Parameter hints: show signature when hovering over a skill call
    const afterWord = line.substring(params.position.character + (afterMatch?.[1]?.length || 0));
    if (afterWord.trimStart().startsWith('(') && skillInfo.parameters.length > 0) {
      const sig = skillInfo.parameters.map(p => {
        const opt = p.required ? '' : '?';
        const def = p.defaultValue ? ` = '${p.defaultValue}'` : '';
        return `${p.name}${opt}: string${def}`;
      }).join(', ');
      doc += `\n**Signature:** \`${word}(${sig})\``;
    }

    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: doc
      }
    };
  }

  // Check if it's a variable from the variable table
  const varTable = variableTableCache.get(params.textDocument.uri);
  if (varTable) {
    const varDef = findDefinition(varTable, word, params.position.line);
    if (varDef) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: formatVariableDoc(varDef)
        }
      };
    }
  }

  // Unknown function - neither built-in action nor found skill
  // Only show warning if it looks like a function call (followed by parenthesis)
  const afterWord = line.substring(params.position.character + (afterMatch?.[1]?.length || 0));
  if (afterWord.trimStart().startsWith('(')) {
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: `**${word}**\n\n**Unknown function!**\n\nNot a built-in action and no matching skill file (.jinja/.guidance/.nsl/.nslg) found.`
      }
    };
  }

  return null;
});

// ============================================================================
// CODE ACTIONS (Quick Fixes)
// ============================================================================

connection.onCodeAction((params: CodeActionParams): CodeAction[] => {
  const actions: CodeAction[] = [];

  for (const diagnostic of params.context.diagnostics) {
    if (diagnostic.source !== 'newo-dsl') continue;

    const data = diagnostic.data as { suggestions?: string[]; original?: string } | undefined;
    if (!data?.suggestions || !data.original) continue;

    // Create a quick-fix for each suggestion (up to 3)
    for (const suggestion of data.suggestions.slice(0, 3)) {
      actions.push({
        title: `Replace '${data.original}' with '${suggestion}'`,
        kind: CodeActionKind.QuickFix,
        diagnostics: [diagnostic],
        isPreferred: suggestion === data.suggestions[0],
        edit: {
          changes: {
            [params.textDocument.uri]: [
              TextEdit.replace(diagnostic.range, suggestion)
            ]
          }
        }
      });
    }
  }

  return actions;
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

  // For built-in actions, try to find the data definition source file
  if (ACTIONS.hasOwnProperty(word)) {
    // Try multiple paths to find actions.ts (works in dev and bundled builds)
    const candidatePaths = [
      // Dev mode: server.ts is at packages/dsl-lsp-server/src/server.ts
      path.resolve(__dirname, '../../dsl-data/src/actions.ts'),
      // Bundled mode: server.js is at vscode-extension/dist/server.js
      path.resolve(__dirname, '../../packages/dsl-data/src/actions.ts'),
      // Workspace root relative
      workspaceRoot ? path.resolve(workspaceRoot.replace('file://', ''), 'packages/dsl-data/src/actions.ts') : '',
    ].filter(Boolean);

    for (const dataActionsPath of candidatePaths) {
      if (fs.existsSync(dataActionsPath)) {
        // Find the line where the action is defined
        const content = fs.readFileSync(dataActionsPath, 'utf-8');
        const actionLines = content.split('\n');
        let targetLine = 0;
        for (let i = 0; i < actionLines.length; i++) {
          if (actionLines[i].match(new RegExp(`^\\s+${word}:\\s*\\{`))) {
            targetLine = i;
            break;
          }
        }
        return {
          uri: 'file://' + dataActionsPath,
          range: {
            start: { line: targetLine, character: 0 },
            end: { line: targetLine, character: 0 }
          }
        };
      }
    }
    return null;
  }

  // Go to skill definition
  const skillInfo = getSkillInfoLocal(word);
  if (skillInfo) {
    return {
      uri: 'file://' + skillInfo.filePath,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 }
      }
    };
  }

  // Go to variable definition
  const varTable = variableTableCache.get(params.textDocument.uri);
  if (varTable) {
    const varDef = findDefinition(varTable, word, params.position.line);
    if (varDef) {
      // For parameters, try to jump to the metadata.yaml or FlowName.yaml
      if (varDef.source === 'parameter') {
        // Find the skill that owns this document
        for (const [, skill] of skillIndex) {
          if (params.textDocument.uri.endsWith(skill.filePath) || params.textDocument.uri.includes(skill.name)) {
            if (skill.metadataPath) {
              return {
                uri: 'file://' + skill.metadataPath,
                range: {
                  start: { line: 0, character: 0 },
                  end: { line: 0, character: 0 }
                }
              };
            }
            break;
          }
        }
      }

      // Jump to the definition line in the current file
      return {
        uri: params.textDocument.uri,
        range: {
          start: { line: varDef.line, character: varDef.column },
          end: { line: varDef.line, character: varDef.column + varDef.name.length }
        }
      };
    }
  }

  return null;
});

// ============================================================================
// SEMANTIC TOKENS
// ============================================================================

connection.languages.semanticTokens.on((params: SemanticTokensParams) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return { data: [] };
  const text = document.getText();
  const varTable = variableTableCache.get(params.textDocument.uri);
  return computeSemanticTokens(text, varTable, {
    actionNames: new Set(Object.keys(ACTIONS)),
    skillNames: new Set(skillIndex.keys()),
    jinjaBuiltinNames: JINJA_BUILTIN_NAMES,
  });
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

function formatVariableDoc(def: import('./variable-tracker').VariableDefinition): string {
  let doc = `**${def.name}**\n\n`;

  const sourceLabels: Record<string, string> = {
    'set': '`{% set %}` assignment',
    'set-action': '`Set()` action call',
    'parameter': 'Skill parameter',
    'for-loop': 'For-loop variable',
    'for-loop-context': 'Jinja loop context',
  };

  doc += `**Source:** ${sourceLabels[def.source] || def.source}\n\n`;

  if (def.inferredType) {
    doc += `**Type:** \`${def.inferredType}\`\n\n`;
  }

  if (def.shapeKey) {
    doc += `**Shape:** ${def.shapeKey}\n\n`;
  }

  if (def.valueExpr) {
    doc += `**Value:** \`${def.valueExpr}\`\n\n`;
  }

  if (def.literalValues && def.literalValues.length > 0) {
    if (def.literalValues.length === 1) {
      doc += `**Literal:** \`${def.literalValues[0]}\`\n`;
    } else {
      doc += `**Possible values:** ${def.literalValues.map(v => `\`${v}\``).join(' | ')}\n`;
    }
  }

  if (def.source !== 'parameter') {
    doc += `\n*Defined at line ${def.line + 1}*`;
  }

  return doc;
}

// ============================================================================
// START SERVER
// ============================================================================

documents.listen(connection);
connection.listen();

connection.console.log('Newo DSL Language Server started');
