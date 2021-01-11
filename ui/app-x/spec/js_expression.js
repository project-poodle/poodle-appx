import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/expression                               (~expression)
// data:                     # expression
export const js_expression = {

  type: 'js/expression',
  desc: 'Expression',
  classes: [
    'expression',
  ],
  children: [
    {
      name: 'data',
      desc: 'Expression',
      classes: [
        {
          class: 'string',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/expression',
      },
    },
  ]
}

export default js_expression
