import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/statement                                (~statement)
// body:                     # code block            (:array<:string>|:array<:statement>)
export const js_statement = {

  type: 'js/statement',
  desc: 'Statement',
  children: [
    {
      name: 'body',
      desc: 'Body',
      array: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'class',
          data: 'statement'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: {
          kind: 'input/statement',
        },
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'statement'
          },
        ],
      },
    },
  ]
}

export default js_statement
