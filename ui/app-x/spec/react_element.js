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
// style:                    # style                 (:object<:expression>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
export const react_element = {

  type: 'react/element',
  desc: 'React Element',
  _expand: true,
  children: [
    {
      name: 'name',
      desc: 'Element Name',
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
      types: [
        {
          kind: 'class',
          data: 'object'
        },
      ],
      _childNode: {
        types: 'inherit',
        input: {
          kind: 'input/properties',
        },
      },
    },
    {
      name: 'style',
      desc: 'Style',
      types: [
        {
          kind: 'class',
          data: 'object'
        },
      ],
      _childNode: {
        types: 'inherit',
        input: {
          kind: 'input/properties',
          options: 'validation.valid_css_properties()',
        },
      },
    },
    {
      name: 'children',
      desc: 'Child Elements',
      array: true,
      types: [
        {
          kind: 'class',
          data: 'jsx'
        },
      ],
      _childNode: {
        types: 'inherit',
      },
    },
  ]
}

export default react_element
