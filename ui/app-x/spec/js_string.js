import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/string                                   (~string|~primitive|~expression)
// data:                     # string data
export const js_string = {

  name: 'js/string',
  desc: 'String',
  classes: [
    {
      class: 'string',
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
      desc: 'String',
      classes: [
        {
          class: 'string'
        },
      ],
      _thisNode: {
        input: 'js/string'
      }
    },
  ]
}

export default js_string
