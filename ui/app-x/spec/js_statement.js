import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/statement                                (~statement)
// body:                     # code block            (:array<:string>|:array<:statement>)
export const js_statement = {

  type: 'js/statement',
  desc: 'Statement',
  classes: [
    'statement',
  ],
  children: [
    {
      name: 'body',
      desc: 'Body',
      optional: true,
      array: true,
      classes: [
        {
          class: 'string',
        },
        {
          class: 'statement',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/statement',
      },
      _childNode: {
        class: 'statement',
      },
    },
  ]
}

export default js_statement
