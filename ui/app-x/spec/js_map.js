import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/map                                      (~expression|~statement)
// data:                     # input data            (:expression)
// result:                   # map result            (:expression|:statement)
export const js_map = {

  name: 'js/map',
  desc: 'Map',
  kinds: [
    {
      kind: 'expression',
    },
    {
      kind: 'statement',
    },
  ],
  _group: 'js_controls',
  children: [
    {
      name: 'data',
      desc: 'Data',
      kinds: [
        {
          kind: 'expression'
        },
      ],
    },
    {
      name: 'result',
      desc: 'Result',
      kinds: [
        {
          kind: 'expression'
        },
        {
          kind: 'statement'
        },
      ],
    },
  ]
}

export default js_map
