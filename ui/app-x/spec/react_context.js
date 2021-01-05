import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/context                               (~expression|~statement)
// name:                     # context name          (:string) - autosuggest import
export const react_context = {

  name: 'react/context',
  desc: 'React Context',
  classes: [
    {
      class: 'expression',
    },
    {
      class: 'statement',
    }
  ],
  _group: 'react_concepts',
  children: [
    {
      name: 'name',
      desc: 'Context Name',
      classes: [
        {
          class: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Context name is required',
        },
      ],
      _inputs: [
        {
          input: 'js/import'
        }
      ],
      _suggestions: [
        {
          __class: 'js/call',
          name: {
            __class: 'js/import',
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
