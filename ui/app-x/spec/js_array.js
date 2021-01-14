import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/array                                    (~array|~expression)
export const js_array = {

  type: 'js/array',
  desc: 'Array',
  children: [
    {
      name: 'children',
      desc: 'Array Items',
      array: true,
      types: [
        {
          kind: 'class',
          data: 'expression'
        },
      ],
      _childNode: {
        types: 'inherit'
      },
    },
  ]
}

export default js_array
