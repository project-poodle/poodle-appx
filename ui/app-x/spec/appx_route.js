import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: appx/route                                  (~expression)
// name:                     # route folder name     (:string|:expression) - default to '/'
export const appx_route = {

  name: 'appx/route',
  desc: 'Routes',
  kinds: [
    {
      kind: 'expression',
    }
  ],
  _group: 'appx',
  children: [
    {
      name: 'name',
      desc: 'Router Path',
      kinds: [
        {
          kind: 'string'
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
