import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/effect                                (~statement)
// body:                     # code body             (:string|:array<:statement>)
// states:                   # state expressions     (:array<:expression>)
//   - s1
//   - s2
export const react_effect = {

  name: 'react/effect',
  desc: 'React Effect',
  classes: [
    {
      class: 'statement',
    }
  ],
  _group: 'react_concepts',
  children: [
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
    {
      name: 'states',
      desc: 'States',
      classes: [
        {
          class: 'array',
          classes: [
            {
              class: 'expression'
            }
          ]
        },
      ],
      _inputs: [
        {
          input: 'js/expression',
          array: true,
        }
      ],
    },
  ]
}

export default react_effect
