import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: js/array                                    (~array|~expression)
const js_array = {

  name: 'js/array',
  desc: 'Array',
  types: [
    {
      type: 'array',
    },
    {
      type: 'expression',
    }
  ],
  _group: 'js_basics',
  children: [
    {
      name: '',
      desc: 'Children',
      types: [
        {
          type: 'any'
        },
      ],
    },
  ]
}

export default js_array
