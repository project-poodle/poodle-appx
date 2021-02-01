import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/table                                 (~jsx|~expression)
// name:                     # name of the form      (:string)             - unique in a file
// data:                     # table data            (:string|:expression)
// tableProps:               # table options         (:object<:expression>)
// columns:              # column options        (:array<:object<:expression>>)
// props:                    # props for container   (:object<:expression>)
// style:                    # style for container   (:object<:expression>)
export const react_table = {

  type: 'react/table',
  desc: 'React Table',
  _expand: true,
  children: [
    {
      name: 'name',
      desc: 'Table Name',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      rules: [
        {
          kind: 'pattern',
          data: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text',
        },
      },
    },
    {
      name: 'data',
      desc: 'Data',
      types: [
        {
          kind: 'class',
          data: 'expression'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: {
          kind: 'input/expression',
        }
      },
      _childNode: {
        types: 'inherit',
      },
    },
    {
      name: 'toolbar',
      desc: 'Toolbar',
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
    {
      name: 'rowPanel',
      desc: 'Row Panel',
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
    {
      name: 'columns',
      desc: 'Columns',
      array: true,
      types: [
        {
          kind: 'type',
          data: 'table/column'
        },
      ],
      _childNode: {
        types: 'inherit',
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
          kind: 'input/properties'
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
  ]
}

export default react_table
