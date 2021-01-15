import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/object                                   (~object|~expression)
export const js_object = {

  type: 'js/object',
  desc: 'Object',
  _input: {
    kind: 'input/properties',
  },
  children: [
    {
      name: '*',
      desc: 'Properties',
      types: [
        {
          kind: 'class',
          data: 'expression'
        },
      ],
      _childNode: {
        types: 'inherit',
      },
    },
  ]
}

export default js_object
