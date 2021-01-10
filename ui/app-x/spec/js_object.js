import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/object                                   (~object|~expression)
export const js_object = {

  name: 'js/object',
  desc: 'Object',
  classes: [
    'object',
  ],
  _group: 'js_basics',
  children: [
    {
      name: '*',
      desc: '`${node.data.name}`',
      optional: true,
      classes: [
        {
          class: 'any',
        },
      ],
      _childNode: [
        {
          class: 'any',
          input: 'input/properties',
        }
      ]
    },
  ]
}

export default js_object
