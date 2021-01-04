import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: react/effect                                (~statement)
// body:                     # code body             (:string|:array<:statement>)
// states:                   # state expressions     (:array<:expression>)
//   - s1
//   - s2
export const react_effect = {

  name: 'react/effect',
  desc: 'React Effect',
  kinds: [
    {
      kind: 'statement',
    }
  ],
  _group: 'react_concepts',
  children: [
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
    {
      name: 'states',
      desc: 'States',
      kinds: [
        {
          kind: 'array',
          kinds: [
            {
              kind: 'expression'
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
