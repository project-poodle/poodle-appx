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
      _thisNode: {
        class: 'string',
        input: 'input/expression',
      },
      _childNode: {
        class: 'expression',
      },
    },
    {
      name: 'reducer',
      desc: 'Reducer',
      classes: [
        {
          class: 'string',
        }
      ],
      _thisNode: {
        class: 'string',
        input: 'input/expression',
      },
    },
    {
      name: 'init',
      desc: 'Initial Value',
      optional: true,
      classes: [
        {
          class: 'string',
        }
      ],
      _thisNode: {
        class: 'string',
        input: 'input/expression',
      },
    },
  ]
}

export default js_reduce
