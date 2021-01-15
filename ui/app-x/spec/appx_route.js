import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/route                                  (~expression)
// name:                     # route folder name     (:string|:expression) - default to '/'
export const appx_route = {

  type: 'appx/route',
  desc: 'Routes',
  children: [
    {
      name: 'name',
      desc: 'Router Path',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        }
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text'
        },
      },
    },
  ]
}

export default appx_route
