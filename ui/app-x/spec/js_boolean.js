import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/boolean                                  (~boolean|~primitive|~expression)
// data:                     # boolean data
export const js_boolean = {

  type: 'js/boolean',
  desc: 'Boolean',
  children: [
    {
      name: 'data',
      desc: 'Boolean',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'boolean'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/switch'
        }
      },
    },
  ]
}

export default js_boolean
