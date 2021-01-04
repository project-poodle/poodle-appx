import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/expression                               (~expression)
// data:                     # expression
export const js_expression = {

  name: 'js/expression',
  desc: 'Expression',
  kinds: [
    {
      kind: 'expression',
    },
  ],
  _group: 'js_advanced',
  children: [
    {
      name: 'data',
      desc: 'Expression',
      kinds: [
        {
          kind: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Expression is required',
        },
      ],
      _variants: [
        {
          variant: 'js/expression'
        }
      ],
    },
  ]
}

export default js_expression
