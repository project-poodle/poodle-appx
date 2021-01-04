import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/filter                                   (~expression)
// data:                     # input data            (:expression)
// filter:                   # filter expression     (:expression)
export const js_filter = {

  name: 'js/filter',
  desc: 'Filter',
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
      name: 'filterr',
      desc: 'Filter',
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
  ]
}

export default js_filter
