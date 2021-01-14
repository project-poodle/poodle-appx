import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/form                                  (~jsx|~expression)
// name:                     # name of the form      (:string)             - unique in a file
// onSubmit:                 # function for submit   (:string|:array<:statement>)
// onError:                  # function for error    (:string|:array<:statement>)
// props:                    # props for 'form' tag  (:object<:expression>)
// formProps:                # props for hook form   (:object<:expression>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
export const react_form = {

  type: 'react/form',
  desc: 'React Form',
  classes: [
    'jsx',
    'expression',
  ],
  _expand: true,
  children: [
    {
      name: 'name',
      desc: 'Form Name',
      classes: [
        {
          class: 'string'
        },
      ],
      rules: [
        {
          kind: 'pattern',
          data: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/text',
      },
    },
    {
      name: 'onSubmit',
      desc: 'onSubmit',
      optional: true,
      classes: [
        {
          class: 'string'
        },
        {
          class: 'statement',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/statement',
      },
      _childNode: {
        class: 'statement',
      },
    },
    {
      name: 'onError',
      desc: 'onError',
      optional: true,
      classes: [
        {
          class: 'string'
        },
        {
          class: 'statement',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/statement',
      },
      _childNode: {
        class: 'statement',
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
      name: 'formProps',
      desc: 'Form Properties',
      optional: true,
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
      name: 'children',
      desc: 'Child Elements',
      optional: true,
      array: true,
      classes:
      [
        {
          class: 'jsx',
        },
      ],
      _childNode: {
        class: 'jsx',
      },
    },
  ]
}

export default react_form
