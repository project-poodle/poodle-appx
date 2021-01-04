import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: input/text                                  (~jsx|~expression)
// name:                     # name of input         (:string|:expression)
// array:                    # whether array         (:boolean)
// props:                    # properties            (:object<:any>)
// rules:                    # input rules           (:object<:any>)
const input_text = {

  name: 'input/text',
  desc: 'Text Input',
  types: [
    {
      type: 'jsx',
    },
    {
      type: 'expression',
    },
  ],
  children: [
    {
      name: 'name',
      desc: 'Input Name',
      types: [
        {
          type: 'string'
        },
        {
          type: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Input name is required',
        },
      ],
      _variants: [
        {
          variant: 'js/string'
        },
        {
          variant: 'js/expression'
        },
      ],
    },
    {
      name: 'array',
      desc: 'Is Array',
      types: [
        {
          type: 'boolean'
        },
      ],
      _variants: [
        {
          variant: 'js/boolean'
        },
      ],
    },
    {
      name: 'props',
      types: [
        {
          type: 'object',
          types: [
            {
              name: '.+',
              type: 'any'
            }
          ]
        }
      ],
      _variants: [
        {
          variant: 'js/object'
        }
      ],
    },
    {
      name: 'rules',
      types: [
        {
          type: 'object',
          types: [
            {
              name: '.+',
              type: 'any'
            }
          ]
        }
      ],
      _variants: [
        {
          variant: 'js/object'
        }
      ],
    },
  ]
}

export default input_text
