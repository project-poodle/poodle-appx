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
    {
      class: 'expression',
    },
    {
      class: 'statement',
    },
  ],
  _group: 'js_controls',
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
      _thisNode: {
        condition: '!data || data._type === "js/expression"',
        input: 'js/expression',
      },
      _childNode: {}
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
      _childNode: {}
    },
  ]
}

export default js_map
