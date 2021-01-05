import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/array                                    (~array|~expression)
export const js_array = {

  name: 'js/array',
  desc: 'Array',
  classes: [
    {
      class: 'array',
    },
    {
      class: 'expression',
    }
  ],
  _group: 'js_basics',
  children: [
    {
      name: null,
      desc: 'Children',
      classes: [
        {
          class: 'any'
        },
      ],
      _child: {
        array: true,
      }
    },
  ]
}

export default js_array
