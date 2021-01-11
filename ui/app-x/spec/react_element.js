import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

//import {
//  REGEX_VAR,
//  type
//} from 'app-x/spec/classes.js'

// class: react/element                               (~jsx|~expression)
// name:                     # element name          (:string) - autosuggest import
// props:                    # properties            (:object<:expression>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
export const react_element = {

  type: 'react/element',
  desc: 'React Element',
  classes: [
    'jsx',
    'expression',
  ],
  _expand: true,
  children: [
    {
      name: 'name',
      desc: 'Element Name',
      classes: [
        {
          class: 'string'
        },
      ],
      _thisNode: {
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
    },
    {
      name: 'props',
      desc: 'Properties',
      optional: true,
      classes: [
        {
          class: 'object',
          classes: [
            {
              name: '.+',
              class: 'expression'
            }
          ]
        }
      ],
      _childNode: {
        class: 'object',
        input: 'input/properties',
      },
    },
    {
      name: 'children',
      desc: 'Child Elements',
      optional: true,
      array: true,
      classes:
      [
        {
          class: 'jsx',
        },
      ],
      _childNode: {
        class: 'jsx',
      },
    },
  ]
}

export default react_element
