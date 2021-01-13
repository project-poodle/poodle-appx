import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/object                                   (~object|~expression)
export const js_object = {

  type: 'js/object',
  desc: 'Object',
  classes: [
    'object',
  ],
  _input: 'input/properties',
  children: [
    {
      name: '*',
      desc: 'Properties',
      optional: true,
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

export default js_object
