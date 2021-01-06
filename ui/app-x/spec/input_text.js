import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: input/text                                  (~jsx|~expression)
// name:                     # name of input         (:string|:expression)
// array:                    # whether array         (:boolean)
// props:                    # properties            (:object<:any>)
// rules:                    # input rules           (:object<:any>)
export const input_text = {

  name: 'input/text',
  desc: 'Text Input',
  classes: [
    {
      class: 'jsx',
    },
    {
      class: 'expression',
    },
  ],
  _group: 'form_input',
  children: [
    {
      name: 'name',
      desc: 'Input Name',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Input name is required',
        },
      ],
      _inputs: [
        {
          input: 'js/string'
        },
        {
          input: 'js/expression'
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
      _inputs: [
        {
          input: 'js/boolean'
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
      _inputs: [
        {
          input: 'js/object'
        }
      ],
      _child: {}
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
      _inputs: [
        {
          input: 'js/object'
        }
      ],
      _child: {}
    },
  ]
}

export default input_text
