import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/filter                                   (~expression)
// data:                     # input data            (:expression)
// filter:                   # filter expression     (:expression)
export const js_filter = {

  type: 'js/filter',
  desc: 'Filter',
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
        }
      },
      _childNode: {
        types: 'inherit',
      },
    },
    {
      name: 'filter',
      desc: 'Filter',
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
        }
      },
    },
  ]
}

export default js_filter
