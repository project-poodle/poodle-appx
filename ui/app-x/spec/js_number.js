import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/number                                   (~number|~primitive|~expression)
// data:                     # number data
export const js_number = {

  name: 'js/number',
  desc: 'Number',
  kinds: [
    {
      kind: 'number',
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
      desc: 'Number',
      kinds: [
        {
          kind: 'number'
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
