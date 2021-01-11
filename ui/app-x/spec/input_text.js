import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: input/text                                  (~jsx|~expression)
// name:                     # name of input         (:string)
// array:                    # whether array         (:boolean)
// props:                    # properties            (:object<:any>)
// rules:                    # input rules           (:object<:any>)
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
      classes: [
        {
          class: 'string'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Input name is required',
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/text',
        },
      ],
    },
    {
      name: 'array',
      desc: 'Is Array',
      optional: true,
      classes: [
        {
          class: 'boolean'
        },
      ],
      _thisNode: [
        {
          class: 'boolean',
          input: 'input/switch',
        },
      ],
    },
    {
      name: 'props',
      desc: 'Properties',
      optional: true,
      classes: [
        {
          class: 'object',
          classes: [
            {
              name: '.+',
              class: 'any'
            }
          ]
        }
      ],
      _childNode: [
        {
          class: 'object',
          input: 'input/properties',
        }
      ]
    },
    {
      name: 'rules',
      desc: 'Rules',
      optional: true,
      classes: [
        {
          class: 'object',
          classes: [
            {
              name: '.+',
              class: 'any'
            }
          ]
        }
      ],
      _childNode: [
        {
          class: 'object',
          input: 'input/rules',
        }
      ]
    },
  ]
}

export default input_text
