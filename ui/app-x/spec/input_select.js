import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: input/select                                (~jsx|~expression)
// name:                     # name of input         (:string)
// props:                    # properties            (:object<:expression>)
// rules:                    # input rules           (:object<:expression>)
export const input_select = {

  type: 'input/select',
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
        input: {
          kind: 'input/text'
        },
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
        input: {
          kind: 'input/switch'
        },
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
        input: {
          kind: 'input/properties',
        },
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
        input: {
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
                ]
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
                kind: 'input/text'
              }
            }
          ]
        },
      },
    },
  ]
}

export default input_select
