import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/boolean                                  (~boolean|~primitive|~expression)
// data:                     # boolean data
export const js_boolean = {

  name: 'js/boolean',
  desc: 'Boolean',
  kinds: [
    {
      kind: 'boolean',
    },
    {
      kind: 'primitive',
    },
    {
      kind: 'expression',
    }
  ],
  _group: 'js_basics',
  children: [
    {
      name: 'data',
      desc: 'Boolean',
      kinds: [
        {
          kind: 'boolean'
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
