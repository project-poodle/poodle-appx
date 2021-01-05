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
  children: [
    {
      name: 'data',
      desc: 'Data',
      classes: [
        {
          class: 'expression'
        },
      ],
      _child: {}
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
      _child: {}
    },
  ]
}

export default js_map
