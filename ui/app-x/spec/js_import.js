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
      classes: [
        {
          class: 'string',
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Import name is required',
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
            'react',
            'react-dom',
            'react.useState',
            'app-x/router.A',
            'app-x/router.navigate',
            '@material-ui/icons.AddCircleOutline',
            '@material-ui/icons.RemoveCircleOutline',
          ],
        },
      ],
    },
  ]
}

export default js_import
