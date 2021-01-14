import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/function                                 (~expression)
// params:                                           (:array<:string>)
//   - p1
//   - p2
// body:                     # code block            (:array<:string>|:array<:statement>)
export const js_function = {

  type: 'js/function',
  desc: 'Function',
  classes: [
    'expression',
  ],
  children: [
    {
      name: 'params',
      desc: 'Parameters',
      optional: true,
      array: true,
      classes: [
        {
          class: 'string'
        },
      ],
      rules: [
        {
          kind: 'pattern',
          data: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/text',
      },
    },
    {
      name: 'body',
      desc: 'Body',
      optional: true,
      array: true,
      classes: [
        {
          class: 'string',
        },
        {
          class: 'statement',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/statement',
      },
      _childNode: {
        class: 'statement',
      },
    },
  ]
}

export default js_function
