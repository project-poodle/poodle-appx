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
  _expand: true,
  children: [
    {
      name: 'body',
      desc: 'Body',
      array: true,
      types: [
        {
          kind: 'class',
          data: 'string',
        },
        {
          kind: 'class',
          data: 'statement'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string',
          },
        ],
        input: {
          kind: 'input/statement'
        },
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'statement'
          },
        ],
        class: 'statement',
      },
    },
    {
      name: 'states',
      desc: 'States',
      array: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/expression',
        },
      },
    },
  ]
}

export default react_effect
