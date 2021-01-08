export const REGEX_VAR = /^[_a-zA-Z][_a-zA-Z0-9]*$/

export const classes = {
  // all classes
  // string
  'string': [
    'JS_STRING_LITERAL',
  ],
  // number
  'number': [
    'JS_NUMBER_LITERAL',
  ],
  // boolean
  'boolean': [
    'JS_BOOLEAN_LITERAL',
  ],
  // null
  'null': [
    'JS_NULL_LITERAL',
  ],
  // primitive
  'primitive': [
    'string',
    'number',
    'boolean',
    'null',
  ],
  // array
  'array': [
    'JS_ARRAY_LITERAL',
  ],
  // object
  'object': [
    'JS_OBJECT_LITERAL',
  ],
  // expression
  'expression': [
    'primitive',
    'array',
    'object',
    'js/string',
    'js/number',
    'js/boolean',
    'js/null',
    'js/array',
    'js/object',
    'js/import',
    'js/expression',
    'js/function',
    'js/call',
    'js/switch',
    'js/map',
    'js/reduce',
    'js/filter',
    'jsx',
    'react/state',
    'react/context',
    'mui/style',
    'appx/route',
  ],
  // statement
  'statement': [
    'js/statement',
    'js/variable',
    'react/state',
    'react/context',
    'react/effect',
    'js/switch',
    'js/map',
    'appx/api',
  ],
  // jsx
  'jsx': [
    'react/element',
    'react/html',
    'react/form',
    'input/text',
  ],
  // any
  'any': [
    'primitive',
    'array',
    'object',
    'expression',
    'statement',
  ]
}

export default classes
