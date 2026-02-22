#!/usr/bin/env npx ts-node
/**
 * Export actions data as YAML schema for external tooling.
 *
 * Usage:
 *   npx ts-node packages/dsl-data/scripts/export-yaml.ts > actions.schema.yaml
 */

import * as yaml from 'js-yaml';
import { ACTIONS, JINJA_BUILTINS, VALIDATION_RULES } from '../src/index';

const schema = {
  version: '0.2.0',
  generated: new Date().toISOString(),
  actions: Object.fromEntries(
    Object.entries(ACTIONS).map(([name, def]) => [
      name,
      {
        description: def.description,
        category: def.category,
        syntax: def.syntax,
        parameters: Object.fromEntries(
          Object.entries(def.parameters).map(([pName, p]) => [
            pName,
            {
              type: p.type,
              required: p.required,
              ...(p.default ? { default: p.default } : {}),
              description: p.description,
              ...(p.allowed ? { allowed: p.allowed } : {}),
            },
          ])
        ),
        returns: def.returns,
        example: def.example,
      },
    ])
  ),
  jinja_builtins: Object.fromEntries(
    Object.entries(JINJA_BUILTINS).map(([name, def]) => [
      name,
      {
        description: def.description,
        syntax: def.syntax,
        returns: def.returns,
      },
    ])
  ),
  validation_rules: Object.fromEntries(
    Object.entries(VALIDATION_RULES).map(([name, rule]) => [
      name,
      {
        required_params: rule.requiredParams,
        ...(rule.paramConstraints
          ? { param_constraints: rule.paramConstraints }
          : {}),
      },
    ])
  ),
};

process.stdout.write(yaml.dump(schema, { lineWidth: 120, noRefs: true }));
