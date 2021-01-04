import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: react/element                               (~jsx|~expression)
// name:                     # element name          (:string|:expression) - autosuggest import
// props:                    # properties            (:object<:any>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
const react_element = {

  name: 'react/element',
  desc: 'React Element',
  types: [
    {
      type: 'jsx',
    },
    {
      type: 'expression',
    }
  ],
  children: [
    {
      name: 'name',
      desc: 'Element Name',
      types: [
        {
          type: 'string'
        },
        {
          type: 'expression'
        }
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Element name is required',
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
        '@material-ui/core.Box',
        '@material-ui/core.Grid',
        '@material-ui/core.TextField',
        '@material-ui/icons.AddCircleOutline',
        '@material-ui/icons.RemoveCircleOutline',
        'antd.Layout.Header'
        'antd.Layout.Footer'
        'antd.Layout.Sider'
        'antd.Layout.Content'
      ],
    },
    {
      name: 'props',
      types: [
        {
          type: 'object',
          types: [
            {
              name: '.+',
              type: 'any'
            }
          ]
        }
      ],
      _variants: [
        {
          variant: 'js/object'
        }
      ],
    },
    {
      name: 'children',
      desc: 'Child Elements',
      types:
      [
        {
          type: 'array',
          types: [
            {
              type: 'jsx',
            },
            {
              type: 'primitive',
            },
            {
              type: 'expression',
            }
          ]
        }
      ],
    },
  ]
}

export default react_element
