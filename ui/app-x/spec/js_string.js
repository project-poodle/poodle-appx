import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/string                                   (~string|~primitive|~expression)
// data:                     # string data
export const js_string = {

  type: 'js/string',
  desc: 'String',
  classes: [
    'string',
  ],
  children: [
    {
      name: 'data',
      desc: 'String',
      classes: [
        {
          class: 'string'
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/text',
        },
      ],
    },
  ]
}

export default js_string
