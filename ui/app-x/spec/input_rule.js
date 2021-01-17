import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: input/text                                  (~jsx|~expression)
// name:                     # name of input         (:string)
// array:                    # whether array         (:boolean)
// props:                    # properties            (:object<:expression>)
// rules:                    # input rules           (:object<:expression>)
export const input_text = {

  type: 'input/rule',
  desc: 'Input Rules',
  _input: {
    kind: 'input/list',
    columns: [
      {
        name: 'kind',
        title: 'Kind',
        required: true,
        input: {
          kind: 'input/select',
          options: [
            {
              value: 'pattern',
            },
            {
              value: 'validate',
            }
          ],
          default: 'validate',
        },
      },
      {
        name: 'data',
        title: 'Data',
        required: true,
        input: {
          kind: 'input/text'
        }
      },
      {
        name: 'message',
        title: 'Message',
        required: true,
        input: {
          kind: 'input/text',
        },
      }
    ]
  },
  children: [
    {
      name: 'children',
      desc: 'Rule',
      array: true,
      types: [
        {
          kind: 'shape',
          data: {
            kind: {
              desc: 'Kind',
              required: true,
              types: [
                {
                  kind: 'class',
                  type: 'string'
                }
              ]
            },
            data: {
              desc: 'Data',
              required: true,
              types: [
                {
                  kind: 'class',
                  type: 'string'
                }
              ]
            },
            message: {
              desc: 'Message',
              required: true,
              types: [
                {
                  kind: 'class',
                  type: 'string'
                }
              ]
            },
          }
        },
      ],
      _childNode: {
        types: 'inherit',
      },
    },
  ]
}

export default input_text
