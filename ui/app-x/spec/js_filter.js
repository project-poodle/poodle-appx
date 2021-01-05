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
      _child: {}
    },
    {
      name: 'filterr',
      desc: 'Filter',
      classes: [
        {
          class: 'expression'
        }
      ],
      _inputs: [
        {
          input: 'js/expression'
        }
      ],
    },
  ]
}

export default js_filter
