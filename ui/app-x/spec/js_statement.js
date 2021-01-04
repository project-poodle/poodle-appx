import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/statement                                (~statement)
// body:                     # code block            (:string|:array<:statement>)
export const js_statement = {

  name: 'js/statement',
  desc: 'Statement',
  kinds: [
    {
      kind: 'statement',
    },
  ],
  _group: 'js_advanced',
  children: [
    {
      name: 'body',
      desc: 'Body',
      kinds: [
        {
          kind: 'string'
        },
        {
          kind: 'array',
          kinds: [
            {
              kind: 'statement'
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
