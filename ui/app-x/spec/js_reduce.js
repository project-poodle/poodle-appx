import {
  REGEX_VAR,
  types
} from 'app-x/spec/types.js'

// type: js/reduce                                   (~expression)
// data:                     # input data            (:expression)
// reducer:                  # return expression     (:expression)
// init:                     # init data             (:expression)
export const js_reduce = {

  name: 'js/reduce',
  desc: 'Reduce',
  types: [
    {
      type: 'expression',
    },
  ],
  _group: 'js_controls',
  children: [
    {
      name: 'data',
      desc: 'Data',
      types: [
        {
          type: 'expression'
        },
      ],
    },
    {
      name: 'reducer',
      desc: 'Reducer',
      types: [
        {
          type: 'expression'
        }
      ],
      _variants: [
        {
          variant: 'js/expression'
        }
      ],
    },
    {
      name: 'init',
      desc: 'Initial Value',
      types: [
        {
          type: 'expression'
        },
      ],
      _variants: [
        {
          variant: 'js/expression'
        }
      ],
    },
  ]
}

export default js_reduce
