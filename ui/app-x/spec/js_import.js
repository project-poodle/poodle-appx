import {
  REGEX_VAR,
  types
} from 'app-x/spec/types.js'

// type: js/import                                   (~expression)
// name:                     # import name           (:string|:expression) - autosuggest import
export const js_import = {

  name: 'js/import',
  desc: 'Import',
  types: [
    {
      type: 'expression',
    },
  ],
  _group: 'js_advanced',
  children: [
    {
      name: 'name',
      desc: 'Import Name',
      types: [
        {
          type: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Import name is required',
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
        'react',
        'react-dom',
        'react.useState',
        'app-x/router.A',
        'app-x/router.navigate',
        '@material-ui/icons.AddCircleOutline',
        '@material-ui/icons.RemoveCircleOutline',
      ],
    },
  ]
}

export default js_import
