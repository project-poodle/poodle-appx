import {
  REGEX_VAR,
  types
} from 'app-x/spec/types.js'

// type: js/boolean                                  (~boolean|~primitive|~expression)
// data:                     # boolean data
export const js_boolean = {

  name: 'js/boolean',
  desc: 'Boolean',
  types: [
    {
      type: 'boolean',
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
      desc: 'Boolean',
      types: [
        {
          type: 'boolean'
        },
      ],
      _variants: [
        {
          variant: 'js/boolean'
        }
      ],
    },
  ]
}

export default js_boolean
