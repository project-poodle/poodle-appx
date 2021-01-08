import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/import                                   (~expression)
// name:                     # import name           (:string|:expression) - autosuggest import
export const js_import = {

  name: 'js/import',
  desc: 'Import',
  classes: [
    {
      class: 'expression',
    },
  ],
  _group: 'js_advanced',
  children: [
    {
      name: 'name',
      desc: 'Import Name',
      classes: [
        {
          class: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Import name is required',
        },
      ],
      _thisNode: {
        input: 'js/import',
      },
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
