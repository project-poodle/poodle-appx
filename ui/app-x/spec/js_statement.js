import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: js/statement                                (~statement)
// body:                     # code block            (:string|:array<:statement>)
const js_statement = {

  name: 'js/statement',
  desc: 'Statement',
  types: [
    {
      type: 'statement',
    },
  ],
  children: [
    {
      name: 'body',
      desc: 'Body',
      types: [
        {
          type: 'string'
        },
        {
          type: 'array',
          types: [
            {
              type: 'statement'
            }
          ]
        },
      ],
      _variants: [
        {
          variant: 'js/statement'
        }
      ],
    },
  ]
}

export default js_statement
