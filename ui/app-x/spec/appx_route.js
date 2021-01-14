import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/route                                  (~expression)
// name:                     # route folder name     (:string|:expression) - default to '/'
export const appx_route = {

  type: 'appx/route',
  desc: 'Routes',
  classes: [
    'expression',
  ],
  children: [
    {
      name: 'name',
      desc: 'Router Path',
      required: true,
      classes: [
        {
          class: 'string'
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/text',
      },
    },
  ]
}

export default appx_route
