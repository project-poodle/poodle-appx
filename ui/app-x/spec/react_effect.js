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
    'statement',
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
          class: 'block',
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/statement',
        }
      ],
      _childNode: [
        {
          class: 'block',
          array: true,
          generate: ' \
            thisData.children.map( \
              child => generate(child) \
            ) \
          ',
          parse: ' \
            thisNode.children \
              .filter(child => !child.data._ref) \
              .map(child => parse(child)) \
          ',
        }
      ],
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
              class: 'expression',
              includes: [
                'js/expression',
              ]
            }
          ]
        },
      ],
      _thisNode: [
        {
          class: 'array',
          array: true,
          input: 'js/expression',
          generate: 'data.map(item => ({ \
            value: item \
          }))',
          parse: 'nodeData.map(item => item.value)',
        }
      ],
    },
  ]
}

export default react_effect
