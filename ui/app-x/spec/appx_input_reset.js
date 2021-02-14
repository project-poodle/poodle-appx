import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/input/reset                            (~jsx|~expression)
// name:                     # name of input         (:string)
export const appx_input_reset = {

  type: 'appx/input/reset',
  desc: 'Reset',
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
      name: 'BoxProps',
      desc: 'Box Properties',
      types: [
        {
          kind: 'class',
          data: 'object'
        }
      ],
      _childNode: {
        types: 'inherit',
        input: {
          kind: 'input/properties',
          options: 'validation.valid_propTypes_for("@material-ui/core.Box")',
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

export default appx_input_reset
