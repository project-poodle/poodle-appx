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
  _group: 'js_advanced',
  _customs: [
    {
      name: '_bodyChildren',
      default: '',
    },
  ],
  _effects: [
    {
      body: ' \
        form.setValue("_ref", "..." + form.getValues("name") \
      ',
      states: [
        'form.watch("name")'
      ]
    }
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
          parse: ' \
            thisNode.children \
              .filter(child => !child.data._ref) \
              .map(child => parse(child)) \
          ',
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
