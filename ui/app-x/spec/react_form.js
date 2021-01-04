import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: react/form                                  (~jsx|~expression)
// name:                     # name of the form      (:string)             - unique in a file
// onSubmit:                 # function for submit   (:string|:array<:statement>)
// onError:                  # function for error    (:string|:array<:statement>)
// props:                    # props for 'form' tag  (:object<:any>)
// formProps:                # props for hook form   (:object<:any>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
export const react_form = {

  name: 'react/form',
  desc: 'React Form',
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
      desc: 'Form Name',
      kinds: [
        {
          kind: 'string'
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
      kinds: [
        {
          kind: 'string'
        },
        {
          kind: 'array',
          kinds: [
            {
              kind: 'statement'
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
      kinds: [
        {
          kind: 'string'
        },
        {
          kind: 'array',
          kinds: [
            {
              kind: 'statement'
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
      name: 'formProps',
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
      name: 'children',
      desc: 'Child Elements',
      kinds:
      [
        {
          kind: 'array',
          kinds: [
            {
              kind: 'jsx',
            },
            {
              kind: 'primitive',
            },
            {
              kind: 'expression',
            }
          ]
        }
      ],
    },
  ]
}

export default react_form
