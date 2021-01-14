import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/effect                                (~statement)
// body:                     # code block            (:array<:string>|:array<:statement>)
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
    {
      name: 'states',
      desc: 'States',
      array: true,
      classes: [
        {
          class: 'string',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/expression',
      },
    },
  ]
}

export default react_effect
