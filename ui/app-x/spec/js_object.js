import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: js/object                                   (~object|~expression)
const js_object = {

  name: 'js/object',
  desc: 'Object',
  types: [
    {
      type: 'object',
    },
    {
      type: 'expression',
    }
  ],
  _group: 'js_basics',
  children: [
    {
      name: '*',
      desc: 'Children',
      types: [
        {
          type: 'any'
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
