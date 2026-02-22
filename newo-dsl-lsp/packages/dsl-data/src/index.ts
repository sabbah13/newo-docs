/**
 * @newo-dsl/data - Shared data definitions for Newo DSL
 *
 * Provides built-in action definitions, Jinja builtins, validation rules,
 * type definitions, and string similarity utilities.
 */

export { ACTIONS } from './actions';
export { JINJA_BUILTINS } from './jinja-builtins';
export { VALIDATION_RULES } from './validation-rules';
export { OBJECT_SHAPES } from './object-shapes';
export { levenshteinDistance, findSimilar } from './levenshtein';
export type { ActionDefinition, ActionParameter, JinjaBuiltin, ValidationRule } from './types';
export type { ObjectShape, ObjectShapeProperty } from './object-shapes';
