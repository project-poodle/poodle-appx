import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: js/string                                   (~string|~primitive|~expression)
// data:                     # string data
const js_string = {

  name: 'js/string',
  desc: 'String',
  types: [
    {
      type: 'string',
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
      desc: 'String',
      types: [
        {
          type: 'string'
        },
      ],
      _variants: [
        {
          variant: 'js/string'
        }
      ],
    },
  ]
}

export default js_string
