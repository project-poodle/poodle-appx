import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/string                                   (~string|~primitive|~expression)
// data:                     # string data
export const js_string = {

  type: 'js/string',
  desc: 'String',
  children: [
    {
      name: 'data',
      desc: 'String',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text',
        },
      },
    },
  ]
}

export default js_string
