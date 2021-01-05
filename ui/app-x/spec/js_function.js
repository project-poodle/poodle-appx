import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/function                                 (~expression)
// params:                                           (:array<:string>)
//   - p1
//   - p2
// body:                     # code body             (:string|:array<:statement>)
export const js_function = {

  name: 'js/function',
  desc: 'Function',
  classes: [
    {
      class: 'expression',
    },
  ],
  _group: 'js_advanced',
  children: [
    {
      name: 'params',
      desc: 'Parameters',
      classes: [
        {
          class: 'array',
          classes: [
            {
              class: 'string'
            }
          ]
        },
      ],
      rules: [
        {
          kind: 'pattern',
          pattern: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _inputs: [
        {
          input: 'js/string',
          array: true,
        }
      ],
    },
    {
      name: 'body',
      desc: 'Body',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'array',
          classes: [
            {
              class: 'statement'
            }
          ]
        },
      ],
      _inputs: [
        {
          input: 'js/statement'
        },
        {
          input: 'js/child'
        }
      ],
      _child: {}
    },
  ]
}

export default js_function
