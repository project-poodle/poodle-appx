export const REGEX_VAR = /^[_a-zA-Z][_a-zA-Z0-9]*$/

export const classes = {
  // all classes
  // string
  'string': {
    literals: [
      'JS_STRING_LITERAL',
    ],
    types: [
      'js/string',
    ]
  },
  // number
  'number': {
    literals: [
      'JS_NUMBER_LITERAL',
    ],
    types: [
      'js/number',
    ]
  },
  // boolean
  'boolean': {
    literals: [
      'JS_BOOLEAN_LITERAL',
    ],
    types: [
      'js/boolean',
    ]
  },
  // null
  'null': {
    literals: [
      'JS_NULL_LITERAL',
    ],
    types: [
      'js/null',
    ]
  },
  // primitive
  'primitive': {
    classes: [
      'string',
      'number',
      'boolean',
      'null',
    ]
  },
  // array
  'array': {
    literals: [
      'JS_ARRAY_LITERAL',
    ],
    types: [
      'js/array',
    ]
  },
  // object
  'object': {
    literals: [
      'JS_OBJECT_LITERAL',
    ],
    types: [
      'js/object',
    ]
  },
  // expression
  'expression': {
    classes: [
      'primitive',
      'array',
      'object',
      'jsx',
    ],
    types: [
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
      'react/state',
      'react/context',
      'mui/style',
      'appx/route',
    ]
  },
  // statement
  'statement': {
    types: [
      'js/statement',
      'react/state',
      'react/context',
      'js/switch',
      'js/map',
      'appx/api',
    ]
  },
  // jsx
  'jsx': {
    classes: [
      'primitive',
    ],
    types: [
      'react/element',
      'react/html',
      'react/form',
      'input/text',
      'js/expression',
      'js/map',
      'js/switch',
      'js/reduce',
      'js/filter',
    ]
  },
  // any
  'any': {
    classes: [
      'primitive',
      'array',
      'object',
      'expression',
      'statement',
    ]
  }
}

export default classes
