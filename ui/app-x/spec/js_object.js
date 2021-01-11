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
  children: [
    {
      name: '*',
      desc: '`${node.data.name}`',
      optional: true,
      classes: [
        {
          class: 'expression',
        },
      ],
      _childNode: {
        class: 'expression',
        input: 'input/properties',
      },
    },
  ]
}

export default js_object
