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

  type: 'input/text',
  desc: 'Text Input',
  children: [
    {
      name: 'name',
      desc: 'Input Name',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: 'input/text',
      },
    },
    {
      name: 'required',
      desc: 'Required',
      types: [
        {
          kind: 'class',
          data: 'boolean'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: 'input/switch',
      },
    },
    {
      name: 'array',
      desc: 'Is Array',
      types: [
        {
          kind: 'class',
          data: 'boolean'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: 'input/switch',
      },
    },
    {
      name: 'props',
      desc: 'Properties',
      types: [
        {
          kind: 'class',
          data: 'object'
        }
      ],
      _childNode: {
        types: 'inherit',
        input: 'input/properties',
      },
    },
    {
      name: 'rules',
      desc: 'Rules',
      types: [
        {
          kind: 'type',
          data: 'input/rule'
        }
      ],
      _childNode: {
        types: 'inherit',
        input: 'input/list',
        inputSpec: {
          columns: [
            {
              name: 'kind',
              desc: 'Kind',
              required: true,
              input: 'input/select',
              options: [
                {
                  value: 'pattern',
                },
                {
                  value: 'validate',
                }
              ]
            },
            {
              name: 'data',
              desc: 'Data',
              required: true,
              input: 'input/text'
            },
            {
              name: 'message',
              desc: 'Message',
              required: true,
              input: 'input/text',
            }
          ]
        }
      },
    },
  ]
}

export default input_text
