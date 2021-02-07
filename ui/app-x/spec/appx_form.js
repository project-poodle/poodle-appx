import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/form                                  (~jsx|~expression)
// name:                     # name of the form      (:string)             - unique in a file
// onSubmit:                 # function for submit   (:string|:array<:statement>)
// onError:                  # function for error    (:string|:array<:statement>)
// formProps:                # props for hook form   (:object<:expression>)
// props:                    # props for 'form' tag  (:object<:expression>)
// style:                    # style for 'form' tag  (:object<:expression>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
export const appx_form = {

  type: 'appx/form',
  desc: 'App-X Form',
  template: {
    kind: 'react/element',
  },
  _expand: true,
  children: [
    {
      name: 'name',
      desc: 'Name',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text',
          options: 'validation.valid_import_names()',
          optionSelfImportNames: true,
          optionsOnly: true,
        },
      },
    },
    {
      name: 'onSubmit',
      desc: 'onSubmit',
      types: [
        {
          kind: 'type',
          data: 'js/function',
        },
      ],
      _childNode: {
        types: 'inherit'
      },
    },
    {
      name: 'onError',
      desc: 'onError',
      types: [
        {
          kind: 'type',
          data: 'js/function',
        },
      ],
      _childNode: {
        types: 'inherit'
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

export default appx_form
