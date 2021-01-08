import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/boolean                                  (~boolean|~primitive|~expression)
// data:                     # boolean data
export const js_boolean = {

  name: 'js/boolean',
  desc: 'Boolean',
  classes: [
    {
      class: 'boolean',
    },
    {
      class: 'primitive',
    },
    {
      class: 'expression',
    }
  ],
  _group: 'js_basics',
  children: [
    {
      name: 'data',
      desc: 'Boolean',
      classes: [
        {
          class: 'boolean'
        },
      ],
      _thisNode: {
        input: 'js/boolean',
      },
    },
  ]
}

export default js_boolean
