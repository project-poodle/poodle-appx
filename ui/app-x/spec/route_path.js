import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: route/path
// path:                      # path                  (:string)
// element:                   # element               (:jsx)
// children:                  # children              (:array<:route/path>)
export const route_path = {

  type: 'route/path',
  desc: 'Route Path',
  _expand: true,
  children: [
    {
      name: 'path',
      desc: 'Path',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text',
        },
      },
    },
    {
      name: 'element',
      desc: 'Element',
      types: [
        {
          kind: 'class',
          data: 'jsx'
        },
      ],
      _childNode: {
        types: 'inherit',
      },
    },
    {
      name: 'children',
      desc: 'Children',
      array: true,
      types: [
        {
          kind: 'type',
          data: 'route/path'
        },
      ],
      _childNode: {
        types: 'inherit',
      },
    },
  ]
}

export default route_path
