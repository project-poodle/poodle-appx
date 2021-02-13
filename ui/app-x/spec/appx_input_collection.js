import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/input/collection                       (~jsx|~expression)
// name:                     # name of input         (:string)
// id:                       # id of input           (:string)
export const appx_input_collection = {

  type: 'appx/input/collection',
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
      name: 'itemPanel',
      desc: 'Item Panel',
      types: [
        {
          kind: 'class',
          data: 'jsx',
          expr: '({item, index, formProps, fieldArrayProps}) => $child'
        },
      ],
      context: [
        {
          name: 'item',
          desc: 'a single item in [fields] from [react-hook-form.useFieldArray]'
        },
        {
          name: 'index',
          desc: 'index for item in [fields] from [react-hook-form.useFieldArray]'
        },
        {
          name: 'formProps',
          desc: 'method props from [react-hook-form.useFormContext]'
        },
        {
          name: 'fieldArrayProps',
          desc: 'method props from [react-hook-form.useFieldArray]'
        }
      ],
      _childNode: {
        types: 'inherit',
      },
    },
    {
      name: 'render',
      desc: 'Render',
      types: [
        {
          kind: 'class',
          data: 'jsx',
          expr: '({itemPanels, formProps, fieldArrayProps}) => $child'
        },
      ],
      context: [
        {
          name: 'itemPanels',
          desc: 'a list of rendered item panel elements'
        },
        {
          name: 'formProps',
          desc: 'method props from [react-hook-form.useFormContext]'
        },
        {
          name: 'fieldArrayProps',
          desc: 'method props from [react-hook-form.useFieldArray]'
        }
      ],
      _childNode: {
        types: 'inherit',
      },
    },
  ]
}

export default appx_input_collection
