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
      _thisNode: {
        condition: '!data || typeof data === "string"',
        input: 'js/statement'
      },
      _childNode: {}
    },
    {
      name: 'states',
      desc: 'States',
      optional: true,
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
      _thisNode: {
        array: true,
        input: 'js/expression',
        generate: 'data.map(item => ({ \
          value: item \
        }))',
        parse: 'nodeData.map(item => item.value)',
      }
    },
  ]
}

export default react_effect
