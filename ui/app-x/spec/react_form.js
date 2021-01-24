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
  _expand: true,
  children: [
    {
      name: 'name',
      desc: 'Form Name',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
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
        types: 'inherit',
        input: {
          kind: 'input/text',
        },
      },
    },
    {
      name: 'onSubmit',
      desc: 'onSubmit',
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'class',
          data: 'statement'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: {
          kind: 'input/statement',
        },
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'statement'
          },
        ],
      },
    },
    {
      name: 'onError',
      desc: 'onError',
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'class',
          data: 'statement'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: {
          kind: 'input/statement',
        },
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'statement'
          },
        ],
      },
    },
    {
      name: 'formProps',
      desc: 'Form Properties',
      types: [
        {
          kind: 'class',
          data: 'object'
        },
      ],
      _childNode: {
        types: 'inherit',
        input: {
          kind: 'input/properties'
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
        },
      ],
      _childNode: {
        types: 'inherit',
        input: {
          kind: 'input/properties'
        },
      },
    },
    {
      name: 'style',
      desc: 'Style',
      types: [
        {
          kind: 'class',
          data: 'object'
        },
      ],
      _childNode: {
        types: 'inherit',
        input: {
          kind: 'input/properties',
          options: 'validation.valid_css_properties()',
        },
      },
    },
    {
      name: 'children',
      desc: 'Child Elements',
      array: true,
      types: [
        {
          kind: 'class',
          data: 'jsx'
        },
      ],
      _childNode: {
        types: 'inherit',
      },
    },
  ]
}

export default react_form
