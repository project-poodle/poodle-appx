import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/map                                      (~expression|~statement)
// data:                     # input data            (:expression)
// result:                   # map result            (:expression|:statement)
export const js_map = {

  type: 'js/map',
  desc: 'Map',
  _expand: true,
  children: [
    {
      name: 'data',
      desc: 'Data',
      types: [
        {
          kind: 'class',
          data: 'expression'
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
          kind: 'input/expression',
        }
      },
      _childNode: {
        types: 'inherit',
      },
    },
    {
      name: 'result',
      desc: 'Result',
      types: [
        {
          kind: 'class',
          data: 'expression'
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
          kind: 'input/expression',
        }
      },
      _childNode: {
        types: 'inherit',
      },
    },
  ]
}

export default js_map
