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
    {
      class: 'statement',
    },
  ],
  _group: 'js_advanced',
  children: [
    {
      name: 'body',
      desc: 'Body',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'array',
          classes: [
            {
              class: 'statement'
            }
          ]
        },
      ],
      _inputs: [
        {
          input: 'js/statement'
        },
        {
          input: 'js/child'
        }
      ],
      _child: {}
    },
  ]
}

export default js_statement
