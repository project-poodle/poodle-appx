import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: js/filter                                   (~expression)
// data:                     # input data            (:expression)
// filter:                   # filter expression     (:expression)
const js_filter = {

  name: 'js/filter',
  desc: 'Filter',
  types: [
    {
      type: 'expression',
    },
  ],
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
