#!/usr/bin/env node
/**
 * Newo DSL Schema Generator
 *
 * Scans the Newo codebase to extract and generate schemas for:
 * - Skills (from metadata.yaml files)
 * - Events (from flows.yaml)
 * - Attributes (from attributes-map.json)
 * - Flows structure
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const CONFIG = {
  newoRoot: process.env.NEWO_ROOT || path.resolve(__dirname, '../../../newo'),
  outputDir: __dirname,
  projectsPath: 'newo_customers/default/projects',
  cachePath: '.newo/default'
};

/**
 * Recursively find files matching a pattern
 */
function findFiles(dir, pattern, results = []) {
  if (!fs.existsSync(dir)) return results;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, pattern, results);
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  return results;
}

/**
 * Parse YAML file safely
 */
function parseYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (e) {
    console.error(`Error parsing ${filePath}: ${e.message}`);
    return null;
  }
}

/**
 * Parse JSON file safely
 */
function parseJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`Error parsing ${filePath}: ${e.message}`);
    return null;
  }
}

/**
 * Extract skill information from metadata.yaml
 */
function extractSkillMetadata(metadataPath) {
  const metadata = parseYaml(metadataPath);
  if (!metadata || !metadata.idn) return null;

  const dir = path.dirname(metadataPath);
  const hasJinja = fs.existsSync(path.join(dir, `${metadata.idn}.jinja`));
  const hasGuidance = fs.existsSync(path.join(dir, `${metadata.idn}.guidance`));

  // Determine skill type from naming convention
  let skillType = 'standard';
  if (metadata.idn.startsWith('_utils')) skillType = 'utility';
  else if (metadata.idn.startsWith('_')) skillType = 'private';
  else if (metadata.idn.includes('Schema')) skillType = 'schema';
  else if (metadata.idn.includes('Tool')) skillType = 'tool';
  else if (metadata.idn.startsWith('Result')) skillType = 'result';

  return {
    id: metadata.id,
    idn: metadata.idn,
    title: metadata.title || metadata.idn,
    runner_type: metadata.runner_type || 'nsl',
    model: metadata.model || null,
    parameters: (metadata.parameters || []).map(p => ({
      name: p.name,
      type: inferType(p.default_value),
      default_value: p.default_value,
      required: p.default_value === undefined || p.default_value === null
    })),
    skill_type: skillType,
    has_jinja: hasJinja,
    has_guidance: hasGuidance,
    path: path.relative(CONFIG.newoRoot, dir)
  };
}

/**
 * Infer type from default value
 */
function inferType(value) {
  if (value === null || value === undefined) return 'any';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'any';
}

/**
 * Extract events from flows.yaml
 */
function extractEvents(flowsPath) {
  const flows = parseYaml(flowsPath);
  if (!flows || !flows.flows) return [];

  const events = [];

  for (const agentFlow of flows.flows) {
    const agentIdn = agentFlow.agent_idn;

    for (const flow of agentFlow.agent_flows || []) {
      const flowIdn = flow.idn;

      for (const event of flow.events || []) {
        events.push({
          idn: event.idn,
          agent_idn: agentIdn,
          flow_idn: flowIdn,
          skill_selector: event.skill_selector,
          skill_idn: event.skill_idn,
          state_idn: event.state_idn,
          integration_idn: event.integration_idn || 'system',
          connector_idn: event.connector_idn || 'system',
          interrupt_mode: event.interrupt_mode || 'queue'
        });
      }
    }
  }

  return events;
}

/**
 * Extract flow structure from flows.yaml
 */
function extractFlows(flowsPath) {
  const flows = parseYaml(flowsPath);
  if (!flows || !flows.flows) return [];

  const result = [];

  for (const agentFlow of flows.flows) {
    const agent = {
      agent_idn: agentFlow.agent_idn,
      agent_description: agentFlow.agent_description,
      flows: []
    };

    for (const flow of agentFlow.agent_flows || []) {
      agent.flows.push({
        idn: flow.idn,
        title: flow.title,
        default_runner_type: flow.default_runner_type || 'nsl',
        default_provider_idn: flow.default_provider_idn,
        default_model_idn: flow.default_model_idn,
        skill_count: (flow.skills || []).length,
        event_count: (flow.events || []).length,
        skills: (flow.skills || []).map(s => s.idn)
      });
    }

    result.push(agent);
  }

  return result;
}

/**
 * Extract attributes from attributes-map.json
 */
function extractAttributes(attributesPath) {
  const attributes = parseJson(attributesPath);
  if (!attributes) return [];

  return Object.entries(attributes).map(([name, id]) => {
    // Categorize by prefix
    let category = 'custom';
    if (name.startsWith('project_business_')) category = 'business';
    else if (name.startsWith('project_representative_agent_')) category = 'agent';
    else if (name.startsWith('project_attributes_private_')) category = 'private';
    else if (name.startsWith('project_attributes_')) category = 'attributes';
    else if (name.startsWith('project_')) category = 'project';
    else if (name.startsWith('calcom_')) category = 'integration';

    return {
      name,
      id,
      category,
      type: 'string' // Default type, could be enhanced with usage analysis
    };
  });
}

/**
 * Generate skills schema
 */
function generateSkillsSchema(skills) {
  const schema = {
    version: '1.0',
    description: 'Newo DSL Skills Schema - Auto-generated',
    generated_at: new Date().toISOString(),
    total_count: skills.length,
    by_type: {},
    skills: []
  };

  // Count by type
  for (const skill of skills) {
    schema.by_type[skill.skill_type] = (schema.by_type[skill.skill_type] || 0) + 1;
  }

  // Sort skills by type, then by name
  skills.sort((a, b) => {
    if (a.skill_type !== b.skill_type) {
      return a.skill_type.localeCompare(b.skill_type);
    }
    return a.idn.localeCompare(b.idn);
  });

  schema.skills = skills;

  return schema;
}

/**
 * Generate events schema
 */
function generateEventsSchema(events) {
  return {
    version: '1.0',
    description: 'Newo DSL Events Schema - Auto-generated',
    generated_at: new Date().toISOString(),
    total_count: events.length,
    events: events
  };
}

/**
 * Generate flows schema
 */
function generateFlowsSchema(flows) {
  return {
    version: '1.0',
    description: 'Newo DSL Flows Schema - Auto-generated',
    generated_at: new Date().toISOString(),
    agents: flows.map(a => ({
      ...a,
      flow_count: a.flows.length,
      total_skills: a.flows.reduce((sum, f) => sum + f.skill_count, 0)
    }))
  };
}

/**
 * Generate attributes schema
 */
function generateAttributesSchema(attributes) {
  const byCategory = {};
  for (const attr of attributes) {
    if (!byCategory[attr.category]) byCategory[attr.category] = [];
    byCategory[attr.category].push(attr);
  }

  return {
    version: '1.0',
    description: 'Newo DSL Attributes Schema - Auto-generated',
    generated_at: new Date().toISOString(),
    total_count: attributes.length,
    by_category: Object.fromEntries(
      Object.entries(byCategory).map(([k, v]) => [k, v.length])
    ),
    attributes: attributes
  };
}

/**
 * Main generation function
 */
async function generate() {
  console.log('Newo DSL Schema Generator');
  console.log('========================\n');
  console.log(`Source: ${CONFIG.newoRoot}`);
  console.log(`Output: ${CONFIG.outputDir}\n`);

  const projectsDir = path.join(CONFIG.newoRoot, CONFIG.projectsPath);
  const cacheDir = path.join(CONFIG.newoRoot, CONFIG.cachePath);

  // Check if source exists
  if (!fs.existsSync(projectsDir)) {
    console.error(`Error: Projects directory not found: ${projectsDir}`);
    process.exit(1);
  }

  // 1. Extract Skills
  console.log('Extracting skills from metadata.yaml files...');
  const metadataFiles = findFiles(projectsDir, /^metadata\.yaml$/);
  const skills = [];

  for (const file of metadataFiles) {
    // Skip flow/agent level metadata, only process skill metadata
    const dir = path.dirname(file);
    const dirName = path.basename(dir);

    // Check if this is a skill directory (has .jinja or .guidance file)
    const hasTemplates = fs.readdirSync(dir).some(f =>
      f.endsWith('.jinja') || f.endsWith('.guidance')
    );

    if (hasTemplates) {
      const skill = extractSkillMetadata(file);
      if (skill) skills.push(skill);
    }
  }

  console.log(`  Found ${skills.length} skills`);

  // 2. Extract Events
  console.log('Extracting events from flows.yaml...');
  const flowsPath = path.join(projectsDir, 'flows.yaml');
  const events = fs.existsSync(flowsPath) ? extractEvents(flowsPath) : [];
  console.log(`  Found ${events.length} events`);

  // 3. Extract Flows
  console.log('Extracting flow structure...');
  const flows = fs.existsSync(flowsPath) ? extractFlows(flowsPath) : [];
  console.log(`  Found ${flows.length} agents with ${flows.reduce((s, a) => s + a.flows.length, 0)} flows`);

  // 4. Extract Attributes
  console.log('Extracting attributes...');
  const attributesPath = path.join(cacheDir, 'attributes-map.json');
  const attributes = fs.existsSync(attributesPath) ? extractAttributes(attributesPath) : [];
  console.log(`  Found ${attributes.length} attributes`);

  // Generate schemas
  console.log('\nGenerating schemas...');

  const skillsSchema = generateSkillsSchema(skills);
  const eventsSchema = generateEventsSchema(events);
  const flowsSchema = generateFlowsSchema(flows);
  const attributesSchema = generateAttributesSchema(attributes);

  // Write schemas
  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'skills.schema.yaml'),
    yaml.dump(skillsSchema, { lineWidth: 120, noRefs: true })
  );
  console.log('  Written: skills.schema.yaml');

  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'events.schema.yaml'),
    yaml.dump(eventsSchema, { lineWidth: 120, noRefs: true })
  );
  console.log('  Written: events.schema.yaml');

  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'flows.schema.yaml'),
    yaml.dump(flowsSchema, { lineWidth: 120, noRefs: true })
  );
  console.log('  Written: flows.schema.yaml');

  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'attributes.schema.yaml'),
    yaml.dump(attributesSchema, { lineWidth: 120, noRefs: true })
  );
  console.log('  Written: attributes.schema.yaml');

  // Summary
  console.log('\n✓ Schema generation complete!');
  console.log(`  Skills: ${skills.length}`);
  console.log(`  Events: ${events.length}`);
  console.log(`  Flows: ${flows.reduce((s, a) => s + a.flows.length, 0)}`);
  console.log(`  Attributes: ${attributes.length}`);
}

// Run if called directly
if (require.main === module) {
  generate().catch(e => {
    console.error('Generation failed:', e);
    process.exit(1);
  });
}

module.exports = { generate, extractSkillMetadata, extractEvents, extractFlows, extractAttributes };
