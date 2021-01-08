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
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Input name is required',
        },
      ],
      _thisNode: {
        input: 'js/string'
      },
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
      _thisNode: {
        input: 'js/boolean'
      },
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
      _childNode: {
        input: 'js/object'
      },
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
      _childNode: {
        input: 'js/rule'
      }
    },
  ]
}

export default input_text
