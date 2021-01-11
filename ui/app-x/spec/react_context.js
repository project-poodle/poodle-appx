import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/context                               (~expression|~statement)
// name:                     # context name          (:string) - autosuggest import
export const react_context = {

  type: 'react/context',
  desc: 'React Context',
  classes: [
    'expression',
    'statement',
  ],
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
      _thisNode: [
        {
          class: 'string',
          input: 'input/text',
          suggestions: [
            {
              __class: 'js/call',
              name: {
                __class: 'js/import',
                name: 'app-x/builder/ui/syntax/util_base.valid_import_names',
              }
            }
          ],
          examples: [
            'app-x/builder/ui/NavProvider.Context',
          ],
        },
      ],
    },
  ]
}

export default react_context
