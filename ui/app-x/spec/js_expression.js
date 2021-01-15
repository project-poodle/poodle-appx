import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/expression                               (~expression)
// data:                     # expression
export const js_expression = {

  type: 'js/expression',
  desc: 'Expression',
  children: [
    {
      name: 'data',
      desc: 'Expression',
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
          kind: 'input/expression',
        }
      },
    },
  ]
}

export default js_expression
