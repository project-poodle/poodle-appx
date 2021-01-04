import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: js/map                                      (~expression|~statement)
// data:                     # input data            (:expression)
// result:                   # map result            (:expression|:statement)
const js_map = {

  name: 'js/map',
  desc: 'Map',
  types: [
    {
      type: 'expression',
    },
    {
      type: 'statement',
    },
  ],
  children: [
    {
      name: 'data',
      desc: 'Data',
      types: [
        {
          type: 'expression'
        },
      ],
    },
    {
      name: 'result',
      desc: 'Result',
      types: [
        {
          type: 'expression'
        },
        {
          type: 'statement'
        },
      ],
    },
  ]
}

export default js_map
