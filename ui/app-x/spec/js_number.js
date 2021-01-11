import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/number                                   (~number|~primitive|~expression)
// data:                     # number data
export const js_number = {

  type: 'js/number',
  desc: 'Number',
  classes: [
    'number',
  ],
  children: [
    {
      name: 'data',
      desc: 'Number',
      classes: [
        {
          class: 'number'
        },
      ],
      _thisNode: [
        {
          class: 'number',
          input: 'input/text',
        },
      ],
    },
  ]
}

export default js_number
