import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/input/array                            (~jsx|~expression)
// name:                     # name of input         (:string)
// id:                       # id of input           (:string)
export const appx_input_array = {

  type: 'appx/input/array',
  desc: 'Input Array',
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
      name: 'id',
      desc: 'Input ID',
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
          kind: 'input/text'
        },
      },
    },
    {
      name: 'item',
      desc: 'Array Item',
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

export default appx_input_array
