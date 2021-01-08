import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/reduce                                   (~expression)
// data:                     # input data            (:expression)
// reducer:                  # return expression     (:expression)
// init:                     # init data             (:expression)
export const js_reduce = {

  name: 'js/reduce',
  desc: 'Reduce',
  classes: [
    {
      class: 'expression',
    },
  ],
  _group: 'js_controls',
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
        condition: '!data || data._type === "js/expression"',
        input: 'js/expression',
      },
      _childNode: {}
    },
    {
      name: 'reducer',
      desc: 'Reducer',
      classes: [
        {
          class: 'expression'
        }
      ],
      _thisNode: {
        input: 'js/expression'
      }
    },
    {
      name: 'init',
      desc: 'Initial Value',
      optional: true,
      classes: [
        {
          class: 'expression'
        },
      ],
      _thisNode: {
        input: 'js/expression'
      }
    },
  ]
}

export default js_reduce
