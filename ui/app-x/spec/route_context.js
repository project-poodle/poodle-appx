import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: route/context                                (~expression)
export const route_context = {

  type: 'route/context',
  desc: 'Route Context',
  children: [
    {
      name: 'name',
      desc: 'Context Name',
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
          kind: 'input/text',
          options: 'validation.valid_import_names()',
          optionSelfImportNames: true,
          optionsOnly: true,
        },
        examples: [
          'app-x/route/RouterProvider.Context',
        ],
      },
    },
  ]
}

export default route_context
