/**
 * Jinja built-in filters and functions for Newo DSL.
 * Extracted from packages/dsl-lsp-server/src/server.ts
 */

import { JinjaBuiltin } from './types';

export const JINJA_BUILTINS: Record<string, JinjaBuiltin> = {
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
export const JINJA_BUILTIN_NAMES = new Set(Object.keys(JINJA_BUILTINS));
