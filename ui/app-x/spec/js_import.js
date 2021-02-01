import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/import                                   (~expression)
// name:                     # import name           (:string|:expression) - autosuggest import
export const js_import = {

  type: 'js/import',
  desc: 'Import',
  children: [
    {
      name: 'name',
      desc: 'Import Name',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text'
        },
        options: 'validation.valid_import_names()',
        optionSelfImportNames: true,
        optionsOnly: true,
        examples: [
          'react',
          'react-dom',
          'react.useState',
          'app-x/route/RouteProvider',
          'app-x/route/RouteProvider.hnavigate',
          '@material-ui/icons.AddCircleOutline',
          '@material-ui/icons.RemoveCircleOutline',
        ],
      },
    },
  ]
}

export default js_import
