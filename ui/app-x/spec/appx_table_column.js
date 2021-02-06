import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/table/column
// id:                       # column id             (:string)
// accessor:                 # accessor              (:string|:function)
// Header:                   # Header of column      (:string|:function)
// Cell:                     # Cell of column        (:string|:function)
// Footer:                   # Footer of column      (:string|:function)
// suggestedWidth:           # suggested width       (:number)
// columns:                  # columns               (:array<:appx/table/column>)
export const appx_table_column = {

  type: 'appx/table/column',
  desc: 'Table Column',
  template: {
    kind: 'js/object'
  },
  _expand: true,
  children: [
    {
      name: 'id',
      desc: 'Column ID',
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
        },
      },
    },
    {
      name: 'accessor',
      desc: 'Accessor',
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'type',
          data: 'js/function'
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
          kind: 'input/text',
        },
      },
      _childNode: {
        types: [
          {
            kind: 'type',
            data: 'js/function'
          },
        ],
      },
    },
    {
      name: 'Header',
      desc: 'Header',
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'class',
          data: 'jsx',
          expr: '(props) => $child'
        },
      ],
      context: [
        {
          name: 'props',
          desc: 'Props',
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
          kind: 'input/text',
        },
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'jsx'
          },
        ],
      },
    },
    {
      name: 'Cell',
      desc: 'Cell',
      types: [
        {
          kind: 'class',
          data: 'jsx',
          expr: '({row, column, cell, value, ...props}) => $child'
        },
      ],
      context: [
        {
          name: 'row',
          desc: 'Row',
        },
        {
          name: 'column',
          desc: 'Column',
        },
        {
          name: 'cell',
          desc: 'Cell',
        },
        {
          name: 'value',
          desc: 'Value',
        },
        {
          name: 'props',
          desc: 'Props',
        },
      ],
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'jsx'
          },
        ],
      },
    },
    {
      name: 'Footer',
      desc: 'Footer',
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'class',
          data: 'jsx',
          expr: '(props) => $child'
        },
      ],
      context: [
        {
          name: 'props',
          desc: 'Props',
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
          kind: 'input/text',
        },
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'jsx'
          },
        ],
      },
    },
    {
      name: 'suggestedWidth',
      desc: 'Suggested Width',
      types: [
        {
          kind: 'class',
          data: 'number'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text',
          variant: 'number',
        },
      },
    },
    {
      name: 'columns',
      desc: 'Columns',
      array: true,
      types: [
        {
          kind: 'type',
          data: 'appx/table/column'
        },
      ],
      _childNode: {
        types: 'inherit',
      },
    },
  ]
}

export default appx_table_column
