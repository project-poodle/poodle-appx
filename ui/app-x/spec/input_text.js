import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: input/text                                  (~jsx|~expression)
// name:                     # name of input         (:string|:expression)
// array:                    # whether array         (:boolean)
// props:                    # properties            (:object<:any>)
// rules:                    # input rules           (:object<:any>)
export const input_text = {

  name: 'input/text',
  desc: 'Text Input',
  kinds: [
    {
      kind: 'jsx',
    },
    {
      kind: 'expression',
    },
  ],
  _group: 'form_input',
  children: [
    {
      name: 'name',
      desc: 'Input Name',
      kinds: [
        {
          kind: 'string'
        },
        {
          kind: 'expression'
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
      kinds: [
        {
          kind: 'boolean'
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
      kinds: [
        {
          kind: 'object',
          kinds: [
            {
              name: '.+',
              kind: 'any'
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
      kinds: [
        {
          kind: 'object',
          kinds: [
            {
              name: '.+',
              kind: 'any'
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
