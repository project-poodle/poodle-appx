import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/object                                   (~object|~expression)
export const js_object = {

  name: 'js/object',
  desc: 'Object',
  kinds: [
    {
      kind: 'object',
    },
    {
      kind: 'expression',
    }
  ],
  _group: 'js_basics',
  children: [
    {
      name: '*',
      desc: 'Children',
      kinds: [
        {
          kind: 'any'
        },
      ],
      _variants: [
        {
          variant: 'js/object'
        }
      ],
    },
  ]
}

export default js_object
