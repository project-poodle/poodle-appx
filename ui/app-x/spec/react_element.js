import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

//import {
//  REGEX_VAR,
//  type
//} from 'app-x/spec/kinds.js'

// kind: react/element                               (~jsx|~expression)
// name:                     # element name          (:string|:expression) - autosuggest import
// props:                    # properties            (:object<:any>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
export const react_element = {

  name: 'react/element',
  desc: 'React Element',
  kinds: [
    {
      kind: 'jsx',
    },
    {
      kind: 'expression',
    }
  ],
  _group: 'react_concepts',
  children: [
    {
      name: 'name',
      desc: 'Element Name',
      kinds: [
        {
          kind: 'string'
        },
        {
          kind: 'expression'
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
          __kind: 'js/call',
          name: {
            __kind: 'js/import',
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
        'antd.Layout.Header',
        'antd.Layout.Footer',
        'antd.Layout.Sider',
        'antd.Layout.Content',
      ],
    },
    {
      name: 'props',
      kinds: [
        {
          kind: 'object',
          kinds: [
            {
              name: '.+',
              kind: 'any'
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
      kinds:
      [
        {
          kind: 'array',
          kinds: [
            {
              kind: 'jsx',
            },
            {
              kind: 'primitive',
            },
            {
              kind: 'expression',
            }
          ]
        }
      ],
    },
  ]
}

export default react_element
