import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/statement                                (~statement)
// body:                     # code block            (:string|:array<:statement>)
export const js_statement = {

  name: 'js/statement',
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
          class: 'statement',
        },
      ],
      _childNode: [
        {
          class: 'statement',
        }
      ],
    },
    {
      name: 'code',
      desc: 'Code',
      optional: true,
      classes: [
        {
          class: 'string',
        }
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/statement',
        }
      ]
    }
  ]
}

export default js_statement
