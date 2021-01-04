import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/string                                   (~string|~primitive|~expression)
// data:                     # string data
export const js_string = {

  name: 'js/string',
  desc: 'String',
  kinds: [
    {
      kind: 'string',
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
      desc: 'String',
      kinds: [
        {
          kind: 'string'
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
