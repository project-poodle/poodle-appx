import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/number                                   (~number|~primitive|~expression)
// data:                     # number data
export const js_number = {

  type: 'js/number',
  desc: 'Number',
  children: [
    {
      name: 'data',
      desc: 'Number',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'number',
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text',
          variant: 'number',
        }
      },
    },
  ]
}

export default js_number
