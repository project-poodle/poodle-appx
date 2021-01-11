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

  type: 'react/effect',
  desc: 'React Effect',
  classes: [
    'statement',
  ],
  children: [
    {
      name: 'body',
      desc: 'Body',
      optional: true,
      array: true,
      classes: [
        {
          class: 'statement',
        },
      ],
      _childNode: {
        class: 'statement',
      },
    },
    {
      name: 'code',
      desc: 'Code',
      optional: true,
      classes: [
        {
          class: 'string',
        }
      ],
      _thisNode: {
        class: 'string',
        input: 'input/statement',
      },
    },
    {
      name: 'states',
      desc: 'States',
      optional: true,
      array: true,
      classes: [
        {
          class: 'string',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/expression',
        generate: 'data.map(item => ({ value: item }))',
        parse: 'nodeData.map(item => item.value)',
      },
    },
  ]
}

export default react_effect
