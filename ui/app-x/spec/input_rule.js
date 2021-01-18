import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: input/rule                                  (~jsx|~expression)
// children:                 # children              (:object:string>)
export const input_text = {

  type: 'input/rule',
  desc: 'Input Rules',
  _input: {
    kind: 'input/list',
    columns: [
      {
        name: 'kind',
        title: 'Kind',
        span: 4,
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
        span: 8,
        required: true,
        input: {
          kind: 'input/text'
        }
      },
      {
        name: 'message',
        title: 'Message',
        span: 10,
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
                  data: 'string'
                }
              ]
            },
            data: {
              desc: 'Data',
              required: true,
              types: [
                {
                  kind: 'class',
                  data: 'string'
                }
              ]
            },
            message: {
              desc: 'Message',
              required: true,
              types: [
                {
                  kind: 'class',
                  data: 'string'
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
