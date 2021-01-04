import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: js/number                                   (~number|~primitive|~expression)
// data:                     # number data
const js_number = {

  name: 'js/number',
  desc: 'Number',
  types: [
    {
      type: 'number',
    },
    {
      type: 'primitive',
    },
    {
      type: 'expression',
    }
  ],
  _group: 'js_basics',
  children: [
    {
      name: 'data',
      desc: 'Number',
      types: [
        {
          type: 'number'
        },
      ],
      _variants: [
        {
          variant: 'js/number'
        }
      ],
    },
  ]
}

export default js_number
