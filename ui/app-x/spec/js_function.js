import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: js/function                                 (~expression)
// params:                                           (:array<:string>)
//   - p1
//   - p2
// body:                     # code body             (:string|:array<:statement>)
const js_function = {

  name: 'js/function',
  desc: 'Function',
  types: [
    {
      type: 'expression',
    },
  ],
  children: [
    {
      name: 'params',
      desc: 'Parameters',
      types: [
        {
          type: 'array',
          types: [
            {
              type: 'string'
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
      types: [
        {
          type: 'string'
        },
        {
          type: 'array',
          types: [
            {
              type: 'statement'
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
