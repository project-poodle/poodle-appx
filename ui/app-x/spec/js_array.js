import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/array                                    (~array|~expression)
export const js_array = {

  type: 'js/array',
  desc: 'Array',
  classes: [
    'array',
  ],
  children: [
    {
      name: 'children',
      desc: 'Array Items',
      array: true,
      classes: [
        {
          class: 'expression',
        },
      ],
      _childNode: {
        class: 'expression',
      },
    },
  ]
}

export default js_array
