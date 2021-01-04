import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/function                                 (~expression)
// params:                                           (:array<:string>)
//   - p1
//   - p2
// body:                     # code body             (:string|:array<:statement>)
export const js_function = {

  name: 'js/function',
  desc: 'Function',
  kinds: [
    {
      kind: 'expression',
    },
  ],
  _group: 'js_advanced',
  children: [
    {
      name: 'params',
      desc: 'Parameters',
      kinds: [
        {
          kind: 'array',
          kinds: [
            {
              kind: 'string'
            }
          ]
        },
      ],
      rules: [
        {
          pattern: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _variants: [
        {
          variant: 'js/string',
          array: true,
        }
      ],
    },
    {
      name: 'body',
      desc: 'Body',
      kinds: [
        {
          kind: 'string'
        },
        {
          kind: 'array',
          kinds: [
            {
              kind: 'statement'
            }
          ]
        },
      ],
      _variants: [
        {
          variant: 'js/statement'
        }
      ],
    },
  ]
}

export default js_function
