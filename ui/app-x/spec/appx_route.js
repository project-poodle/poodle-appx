import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: appx/route                                  (~expression)
// name:                     # route folder name     (:string|:expression) - default to '/'
const appx_route = {

  name: 'appx/route',
  desc: 'Routes',
  types: [
    {
      type: 'expression',
    }
  ],
  children: [
    {
      name: 'name',
      desc: 'Router Path',
      types: [
        {
          type: 'string'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Form name is required',
        },
      ],
      _variants: [
        {
          variant: 'js/string'
        }
      ],
    },
  ]
}

export default appx_route
