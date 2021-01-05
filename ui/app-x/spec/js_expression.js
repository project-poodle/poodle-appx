import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/expression                               (~expression)
// data:                     # expression
export const js_expression = {

  name: 'js/expression',
  desc: 'Expression',
  classes: [
    {
      class: 'expression',
    },
  ],
  _group: 'js_advanced',
  children: [
    {
      name: 'data',
      desc: 'Expression',
      classes: [
        {
          class: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Expression is required',
        },
      ],
      _inputs: [
        {
          input: 'js/expression'
        }
      ],
    },
  ]
}

export default js_expression
