import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/number                                   (~number|~primitive|~expression)
// data:                     # number data
export const js_number = {

  name: 'js/number',
  desc: 'Number',
  classes: [
    {
      class: 'number',
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
      desc: 'Number',
      classes: [
        {
          class: 'number'
        },
      ],
      _thisNode: {
        input: 'js/number'
      }
    },
  ]
}

export default js_number
