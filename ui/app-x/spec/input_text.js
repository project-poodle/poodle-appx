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
  classes: [
    'jsx',
    'expression',
  ],
  children: [
    {
      name: 'name',
      desc: 'Input Name',
      required: true,
      classes: [
        {
          class: 'string'
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/text',
      },
    },
    {
      name: 'required',
      desc: 'Required',
      classes: [
        {
          class: 'boolean'
        },
      ],
      _thisNode: {
        class: 'boolean',
        input: 'input/switch',
      },
    },
    {
      name: 'array',
      desc: 'Is Array',
      classes: [
        {
          class: 'boolean'
        },
      ],
      _thisNode: {
        class: 'boolean',
        input: 'input/switch',
      },
    },
    {
      name: 'props',
      desc: 'Properties',
      classes: [
        {
          class: 'object',
          classes: [
            {
              name: '*',
              class: 'expression',
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
      name: 'rules',
      desc: 'Rules',
      classes: [
        {
          class: 'object',
          classes: [
            {
              name: '*',
              class: 'expression',
            }
          ]
        }
      ],
      _childNode: {
        class: 'object',
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
