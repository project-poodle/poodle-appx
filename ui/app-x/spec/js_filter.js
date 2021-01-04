import {
  REGEX_VAR,
  types
} from 'app-x/spec/types.js'

// type: js/filter                                   (~expression)
// data:                     # input data            (:expression)
// filter:                   # filter expression     (:expression)
export const js_filter = {

  name: 'js/filter',
  desc: 'Filter',
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
      name: 'filterr',
      desc: 'Filter',
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
  ]
}

export default js_filter
