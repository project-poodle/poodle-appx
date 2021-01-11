import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/filter                                   (~expression)
// data:                     # input data            (:expression)
// filter:                   # filter expression     (:expression)
export const js_filter = {

  name: 'js/filter',
  desc: 'Filter',
  classes: [
    'expression',
  ],
  children: [
    {
      name: 'data',
      desc: 'Data',
      classes: [
        {
          class: 'expression'
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/expression',
        },
      ],
      _childNode: [
        {
          class: 'expression',
          input: 'input/expression',
        }
      ]
    },
    {
      name: 'filter',
      desc: 'Filter',
      classes: [
        {
          class: 'string',
        }
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/expression',
        },
      ],
    },
  ]
}

export default js_filter
