import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: react/context                               (~expression|~statement)
// name:                     # context name          (:string) - autosuggest import
export const react_context = {

  name: 'react/context',
  desc: 'React Context',
  kinds: [
    {
      kind: 'expression',
    },
    {
      kind: 'statement',
    }
  ],
  _group: 'react_concepts',
  children: [
    {
      name: 'name',
      desc: 'Context Name',
      kinds: [
        {
          kind: 'expression'
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
          __kind: 'js/call',
          name: {
            __kind: 'js/import',
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
