import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/reduce                                   (~expression)
// data:                     # input data            (:expression)
// reducer:                  # return expression     (:expression)
// init:                     # init data             (:expression)
export const js_reduce = {

  type: 'js/reduce',
  desc: 'Reduce',
  children: [
    {
      name: 'data',
      desc: 'Data',
      types: [
        {
          kind: 'class',
          data: 'expression'
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
          kind: 'input/expression'
        },
      },
      _childNode: {
        types: 'inherit'
      },
    },
    {
      name: 'reducer',
      desc: 'Reducer',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/expression'
        },
      },
    },
    {
      name: 'init',
      desc: 'Initial Value',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/expression'
        },
      },
    },
  ]
}

export default js_reduce
