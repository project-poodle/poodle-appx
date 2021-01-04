import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/reduce                                   (~expression)
// data:                     # input data            (:expression)
// reducer:                  # return expression     (:expression)
// init:                     # init data             (:expression)
export const js_reduce = {

  name: 'js/reduce',
  desc: 'Reduce',
  kinds: [
    {
      kind: 'expression',
    },
  ],
  _group: 'js_controls',
  children: [
    {
      name: 'data',
      desc: 'Data',
      kinds: [
        {
          kind: 'expression'
        },
      ],
    },
    {
      name: 'reducer',
      desc: 'Reducer',
      kinds: [
        {
          kind: 'expression'
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
      kinds: [
        {
          kind: 'expression'
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
