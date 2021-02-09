import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/call                                     (~expression)
// params:                                           (:array<:expression)
//   - p1
//   - p2
export const js_call = {

  type: 'js/call',
  desc: 'Function Call',
  _expand: true,
  children: [
    {
      name: 'func',
      desc: 'Function',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'type',
          data: 'js/function'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: {
          kind: 'input/expression',
        }
      },
      _childNode: {
        types: [
          {
            kind: 'type',
            data: 'js/function'
          },
        ],
      },
    },
    {
      name: 'params',
      desc: 'Parameters',
      array: true,
      types: [
        {
          kind: 'class',
          data: 'expression'
        },
      ],
      _childNode: {
        types: 'inherit',
      },
    },
  ]
}

export default js_call
