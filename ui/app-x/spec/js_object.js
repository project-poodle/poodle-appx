import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/object                                   (~object|~expression)
export const js_object = {

  name: 'js/object',
  desc: 'Object',
  classes: [
    {
      class: 'object',
    },
    {
      class: 'expression',
    }
  ],
  _group: 'js_basics',
  children: [
    {
      name: '*',
      desc: 'Property',
      optional: true,
      classes: [
        {
          class: 'any'
        },
      ],
      _childNode: {
        input: 'js/object',
      }
    },
  ]
}

export default js_object
