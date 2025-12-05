/**
 * Schema Validator for Newo DSL
 *
 * Validates template contents against extracted schemas:
 * - Skill existence and parameters
 * - Built-in function usage
 * - Attribute names
 * - Event references
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class SchemaValidator {
  constructor(schemasDir) {
    this.schemasDir = schemasDir;
    this.schemas = {
      skills: null,
      builtins: null,
      events: null,
      attributes: null
    };
    this.skillIndex = new Map();
    this.builtinIndex = new Map();
    this.attributeIndex = new Set();
    this.eventIndex = new Set();
  }

  /**
   * Load all schemas from the schemas directory
   */
  loadSchemas() {
    const schemaFiles = {
      skills: 'skills.schema.yaml',
      builtins: 'builtins.schema.yaml',
      events: 'events.schema.yaml',
      attributes: 'attributes.schema.yaml'
    };

    for (const [key, filename] of Object.entries(schemaFiles)) {
      const filePath = path.join(this.schemasDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          this.schemas[key] = yaml.load(content);
        } catch (e) {
          console.error(`Warning: Could not load ${filename}: ${e.message}`);
        }
      }
    }

    this.buildIndexes();
  }

  /**
   * Build lookup indexes for fast validation
   */
  buildIndexes() {
    // Index skills
    if (this.schemas.skills?.skills) {
      for (const skill of this.schemas.skills.skills) {
        this.skillIndex.set(skill.idn, {
          name: skill.idn,
          parameters: skill.parameters || [],
          path: skill.path,
          runner_type: skill.runner_type
        });
      }
    }

    // Index built-in functions
    if (this.schemas.builtins?.functions) {
      for (const func of this.schemas.builtins.functions) {
        this.builtinIndex.set(func.name, {
          name: func.name,
          parameters: func.parameters || [],
          category: func.category,
          returns: func.returns
        });
      }
    }

    // Index attributes
    if (this.schemas.attributes?.attributes) {
      for (const attr of this.schemas.attributes.attributes) {
        this.attributeIndex.add(attr.name);
      }
    }

    // Index events
    if (this.schemas.events?.events) {
      for (const event of this.schemas.events.events) {
        this.eventIndex.add(event.idn);
      }
    }
  }

  /**
   * Validate a parsed template result
   * @param {object} parseResult - Result from JinjaParser or GuidanceParser
   * @returns {array} Array of diagnostics
   */
  validate(parseResult) {
    const diagnostics = [];

    // Validate skill calls
    for (const skillCall of parseResult.skillCalls || []) {
      const skillDiags = this.validateSkillCall(skillCall);
      diagnostics.push(...skillDiags);
    }

    // Validate built-in calls
    for (const builtinCall of parseResult.builtinCalls || []) {
      const builtinDiags = this.validateBuiltinCall(builtinCall);
      diagnostics.push(...builtinDiags);
    }

    // Validate unknown function calls (might be skills or builtins)
    for (const funcCall of parseResult.functionCalls || []) {
      if (funcCall.type === 'unknown') {
        const funcDiags = this.validateUnknownCall(funcCall);
        diagnostics.push(...funcDiags);
      }
    }

    return diagnostics;
  }

  /**
   * Validate a skill call
   */
  validateSkillCall(skillCall) {
    const diagnostics = [];
    const skillInfo = this.skillIndex.get(skillCall.name);

    if (!skillInfo) {
      // Check for similar skill names (typo detection)
      const suggestions = this.findSimilarSkills(skillCall.name);
      let message = `Unknown skill: ${skillCall.name}`;
      if (suggestions.length > 0) {
        message += `. Did you mean: ${suggestions.slice(0, 3).join(', ')}?`;
      }

      diagnostics.push({
        severity: 'error',
        code: 'E100',
        message,
        line: skillCall.line,
        column: skillCall.column,
        source: 'newo-lint'
      });
      return diagnostics;
    }

    // Validate parameters
    const paramDiags = this.validateParameters(
      skillCall,
      skillInfo.parameters,
      'skill'
    );
    diagnostics.push(...paramDiags);

    return diagnostics;
  }

  /**
   * Validate a built-in function call
   */
  validateBuiltinCall(builtinCall) {
    const diagnostics = [];
    const funcInfo = this.builtinIndex.get(builtinCall.name);

    if (!funcInfo) {
      // Built-in not in schema - might be missing from builtins.schema.yaml
      diagnostics.push({
        severity: 'warning',
        code: 'W100',
        message: `Built-in function not in schema: ${builtinCall.name}`,
        line: builtinCall.line,
        column: builtinCall.column,
        source: 'newo-lint'
      });
      return diagnostics;
    }

    // Validate parameters
    const paramDiags = this.validateParameters(
      builtinCall,
      funcInfo.parameters,
      'builtin'
    );
    diagnostics.push(...paramDiags);

    return diagnostics;
  }

  /**
   * Validate an unknown function call
   */
  validateUnknownCall(funcCall) {
    const diagnostics = [];

    // Check if it's a skill
    if (this.skillIndex.has(funcCall.name)) {
      return []; // Valid skill, just not recognized by pattern
    }

    // Check if it's a builtin
    if (this.builtinIndex.has(funcCall.name)) {
      return []; // Valid builtin
    }

    // Check common function patterns
    const commonFunctions = [
      'utils_', 'get_', 'set_', 'check_', 'validate_', 'process_',
      'json', 'range', 'dict', 'list', 'str', 'int', 'float', 'bool'
    ];

    const isLikelyValid = commonFunctions.some(prefix =>
      funcCall.name.toLowerCase().startsWith(prefix)
    );

    if (!isLikelyValid) {
      // Find suggestions
      const skillSuggestions = this.findSimilarSkills(funcCall.name);
      const builtinSuggestions = this.findSimilarBuiltins(funcCall.name);
      const allSuggestions = [...builtinSuggestions, ...skillSuggestions];

      let message = `Unknown function: ${funcCall.name}`;
      if (allSuggestions.length > 0) {
        message += `. Did you mean: ${allSuggestions.slice(0, 3).join(', ')}?`;
      }

      diagnostics.push({
        severity: 'warning',
        code: 'W101',
        message,
        line: funcCall.line,
        column: funcCall.column,
        source: 'newo-lint'
      });
    }

    return diagnostics;
  }

  /**
   * Validate parameters against expected schema
   */
  validateParameters(call, expectedParams, callType) {
    const diagnostics = [];
    const providedParams = call.parameters || [];

    // Build map of expected parameters
    const expectedMap = new Map();
    for (const param of expectedParams) {
      expectedMap.set(param.name, param);
    }

    // Check for unknown parameters
    for (const provided of providedParams) {
      if (provided.type === 'keyword' && provided.name) {
        if (!expectedMap.has(provided.name)) {
          // Find similar parameter names
          const similar = this.findSimilarParams(provided.name, expectedParams);
          let message = `Unknown parameter '${provided.name}' for ${call.name}`;
          if (similar.length > 0) {
            message += `. Did you mean: ${similar.join(', ')}?`;
          }

          diagnostics.push({
            severity: 'warning',
            code: 'W102',
            message,
            line: call.line,
            column: call.column,
            source: 'newo-lint'
          });
        }
      }
    }

    // Check for missing required parameters
    for (const [name, param] of expectedMap) {
      if (param.required) {
        const isProvided = providedParams.some(
          p => p.type === 'keyword' && p.name === name
        );
        if (!isProvided) {
          diagnostics.push({
            severity: 'error',
            code: 'E101',
            message: `Missing required parameter '${name}' for ${call.name}`,
            line: call.line,
            column: call.column,
            source: 'newo-lint'
          });
        }
      }
    }

    return diagnostics;
  }

  /**
   * Validate attribute name
   */
  validateAttributeName(attrName, line, column) {
    if (this.attributeIndex.size === 0) {
      return []; // No attribute schema loaded
    }

    if (!this.attributeIndex.has(attrName)) {
      const similar = this.findSimilarAttributes(attrName);
      let message = `Unknown attribute: ${attrName}`;
      if (similar.length > 0) {
        message += `. Did you mean: ${similar.slice(0, 3).join(', ')}?`;
      }

      return [{
        severity: 'warning',
        code: 'W103',
        message,
        line,
        column,
        source: 'newo-lint'
      }];
    }

    return [];
  }

  /**
   * Find similar skill names (for typo suggestions)
   */
  findSimilarSkills(name) {
    const suggestions = [];
    const nameLower = name.toLowerCase();

    for (const skillName of this.skillIndex.keys()) {
      const distance = this.levenshteinDistance(nameLower, skillName.toLowerCase());
      if (distance <= 3) {
        suggestions.push({ name: skillName, distance });
      }
    }

    return suggestions
      .sort((a, b) => a.distance - b.distance)
      .map(s => s.name);
  }

  /**
   * Find similar builtin names
   */
  findSimilarBuiltins(name) {
    const suggestions = [];
    const nameLower = name.toLowerCase();

    for (const funcName of this.builtinIndex.keys()) {
      const distance = this.levenshteinDistance(nameLower, funcName.toLowerCase());
      if (distance <= 2) {
        suggestions.push({ name: funcName, distance });
      }
    }

    return suggestions
      .sort((a, b) => a.distance - b.distance)
      .map(s => s.name);
  }

  /**
   * Find similar parameter names
   */
  findSimilarParams(name, params) {
    const suggestions = [];
    const nameLower = name.toLowerCase();

    for (const param of params) {
      const distance = this.levenshteinDistance(nameLower, param.name.toLowerCase());
      if (distance <= 2) {
        suggestions.push(param.name);
      }
    }

    return suggestions;
  }

  /**
   * Find similar attribute names
   */
  findSimilarAttributes(name) {
    const suggestions = [];
    const nameLower = name.toLowerCase();

    for (const attrName of this.attributeIndex) {
      const distance = this.levenshteinDistance(nameLower, attrName.toLowerCase());
      if (distance <= 3) {
        suggestions.push({ name: attrName, distance });
      }
    }

    return suggestions
      .sort((a, b) => a.distance - b.distance)
      .map(s => s.name);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Get statistics about loaded schemas
   */
  getStats() {
    return {
      skills: this.skillIndex.size,
      builtins: this.builtinIndex.size,
      attributes: this.attributeIndex.size,
      events: this.eventIndex.size
    };
  }
}

module.exports = SchemaValidator;
