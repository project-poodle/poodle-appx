import {
  REGEX_VAR,
  types
} from 'app-x/spec/types.js'

// type: react/effect                                (~statement)
// body:                     # code body             (:string|:array<:statement>)
// states:                   # state expressions     (:array<:expression>)
//   - s1
//   - s2
export const react_effect = {

  name: 'react/effect',
  desc: 'React Effect',
  types: [
    {
      type: 'statement',
    }
  ],
  _group: 'react_concepts',
  children: [
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
    {
      name: 'states',
      desc: 'States',
      types: [
        {
          type: 'array',
          types: [
            {
              type: 'expression'
            }
          ]
        },
      ],
      _variants: [
        {
          variant: 'js/expression',
          array: true,
        }
      ],
    },
  ]
}

export default react_effect
