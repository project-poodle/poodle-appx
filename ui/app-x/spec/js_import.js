import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/import                                   (~expression)
// name:                     # import name           (:string|:expression) - autosuggest import
export const js_import = {

  type: 'js/import',
  desc: 'Import',
  classes: [
    'expression',
  ],
  children: [
    {
      name: 'name',
      desc: 'Import Name',
      required: true,
      classes: [
        {
          class: 'string',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/text',
        suggestions: 'auto_suggestions.valid_import_names()',
        suggestionsOnly: true,
        examples: [
          'react',
          'react-dom',
          'react.useState',
          'app-x/router.A',
          'app-x/router.navigate',
          '@material-ui/icons.AddCircleOutline',
          '@material-ui/icons.RemoveCircleOutline',
        ],
      },
    },
  ]
}

export default js_import
