import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/array                                    (~array|~expression)
export const js_array = {

  name: 'js/array',
  desc: 'Array',
  kinds: [
    {
      kind: 'array',
    },
    {
      kind: 'expression',
    }
  ],
  _group: 'js_basics',
  children: [
    {
      name: '',
      desc: 'Children',
      kinds: [
        {
          kind: 'any'
        },
      ],
    },
  ]
}

export default js_array
