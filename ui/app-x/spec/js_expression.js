expression {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: js/expression                               (~expression)
// data:                     # expression
const js_expression = {

  name: 'js/expression',
  desc: 'Expression',
  types: [
    {
      type: 'expression',
    },
  ],
  children: [
    {
      name: 'data',
      desc: 'Expression',
      types: [
        {
          type: 'expression'
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
