import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: react/form                                  (~jsx|~expression)
// name:                     # name of the form      (:string)             - unique in a file
// onSubmit:                 # function for submit   (:string|:array<:statement>)
// onError:                  # function for error    (:string|:array<:statement>)
// props:                    # props for 'form' tag  (:object<:any>)
// formProps:                # props for hook form   (:object<:any>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
const react_form = {

  name: 'react/form',
  desc: 'React Form',
  types: [
    {
      type: 'jsx',
    },
    {
      type: 'expression',
    },
  ],
  _group: 'form_input',
  children: [
    {
      name: 'name',
      desc: 'Form Name',
      types: [
        {
          type: 'string'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Form name is required',
        },
        {
          kind: 'pattern',
          pattern: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _variants: [
        {
          variant: 'js/string'
        }
      ],
    },
    {
      name: 'onSubmit',
      desc: 'onSubmit',
      types: [
        {
          type: 'string'
        },
        {
          type: 'array',
          types: [
            {
              type: 'statement'
            }
          ]
        },
      ],
      _variants: [
        {
          variant: 'js/statement'
        }
      ],
    },
    {
      name: 'onError',
      desc: 'onError',
      types: [
        {
          type: 'string'
        },
        {
          type: 'array',
          types: [
            {
              type: 'statement'
            }
          ]
        },
      ],
      _variants: [
        {
          variant: 'js/statement'
        }
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
      name: 'formProps',
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
      name: 'children',
      desc: 'Child Elements',
      types:
      [
        {
          type: 'array',
          types: [
            {
              type: 'jsx',
            },
            {
              type: 'primitive',
            },
            {
              type: 'expression',
            }
          ]
        }
      ],
    },
  ]
}

export default react_form
