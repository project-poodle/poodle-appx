import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: react/context                               (~expression|~statement)
// name:                     # context name          (:string) - autosuggest import
const react_context = {

  name: 'react/context',
  desc: 'React Context',
  types: [
    {
      type: 'expression',
    },
    {
      type: 'statement',
    }
  ],
  children: [
    {
      name: 'name',
      desc: 'Context Name',
      types: [
        {
          type: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Context name is required',
        },
      ],
      _variants: [
        {
          variant: 'js/import'
        }
      ],
      _suggestions: [
        {
          __type: 'js/call',
          name: {
            __type: 'js/import',
            name: 'app-x/builder/ui/syntax/util_parse.valid_import_names',
          }
        }
      ],
      _examples: [
        'app-x/builder/ui/NavProvider.Context',
      ],
    },
  ]
}

export default react_context
