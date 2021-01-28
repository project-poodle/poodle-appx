import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: table/column
// Header:                   # Header of column      (:string)
// columns:                  # columns               (:array<:object>)
export const react_table = {

  type: 'table/column',
  desc: 'Column Group',
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
        input: {
          kind: 'input/text',
        },
      },
    },
    {
      name: 'Cell',
      desc: 'Cell',
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
        input: {
          kind: 'input/text',
        },
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
        input: {
          kind: 'input/text',
        },
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
          data: 'table/column'
        },
      ],
      _childNode: {
        types: 'inherit',
        /*
        input: {
          kind: 'input/list',
          columns: [
            {
              name: 'id',
              title: 'ID',
              required: true,
              span: 4,
              input: {
                kind: 'input/text',
              },
            },
            {
              name: 'Header',
              title: 'Header',
              span: 6,
              input: {
                kind: 'input/text',
              },
            },
            {
              name: 'accessor',
              title: 'Accessor',
              required: true,
              span: 12,
              input: {
                kind: 'input/expression',
              },
            },
          ]
        },
        */
      },
    },
  ]
}

export default react_table
