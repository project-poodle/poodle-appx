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
      name: 'Header',
      desc: 'Group Header',
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
      name: 'columns',
      desc: 'Columns',
      array: true,
      types: [
        {
          kind: 'shape',
          data: {
            'Header': {
              desc: 'Header',
              types: [
                {
                  kind: 'class',
                  data: 'string',
                }
              ]
            },
            'accessor': {
              desc: 'Accessor',
              types: [
                {
                  kind: 'class',
                  data: 'string',
                }
              ]
            }
          }
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'object',
          }
        ],
        input: {
          kind: 'input/list',
          columns: [
            {
              name: 'Header',
              title: 'Header',
              span: 10,
              required: true,
              input: {
                kind: 'input/text',
              },
            },
            {
              name: 'accessor',
              title: 'Accessor',
              span: 10,
              required: true,
              input: {
                kind: 'input/expression',
              },
            },
          ]
        },
      },
    },
  ]
}

export default react_table
