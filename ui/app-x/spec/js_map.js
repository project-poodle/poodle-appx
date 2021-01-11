import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/map                                      (~expression|~statement)
// data:                     # input data            (:expression)
// result:                   # map result            (:expression|:statement)
export const js_map = {

  name: 'js/map',
  desc: 'Map',
  classes: [
    'expression',
    'statement',
  ],
  _expand: true,
  children: [
    {
      name: 'data',
      desc: 'Data',
      classes: [
        {
          class: 'expression'
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/expression',
        },
      ],
      _childNode: [
        {
          class: 'expression',
          input: 'input/expression',
        }
      ]
    },
    {
      name: 'result',
      desc: 'Result',
      classes: [
        {
          class: 'expression'
        },
        {
          class: 'statement'
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/expression',
        },
      ],
      _childNode: [
        {
          class: 'expression',
          input: 'input/expression',
        },
        {
          class: 'statement',
          input: 'input/statement',
        }
      ]
    },
  ]
}

export default js_map
