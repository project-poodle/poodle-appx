import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/form                                   (~jsx|~expression)
// name:                     # react element name    (:string)
// defaultValue:             # default value         (:string|:object)
// onSubmit:                 # function for submit   (:string|:array<:statement>)
// FormProps:                # props for hook form   (:object<:expression>)
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
      name: 'defaultValue',
      desc: 'Default Value',
      types: [
        {
          kind: 'class',
          data: 'string',
          parse: true,
        },
        {
          kind: 'class',
          data: 'object'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string',
          }
        ],
        input: {
          kind: 'input/expression',
        }
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'object',
          }
        ],
      },
    },
    {
      name: 'onSubmit',
      desc: 'onSubmit',
      types: [
        {
          kind: 'class',
          data: 'string',
          parse: true,
        },
        {
          kind: 'type',
          data: 'js/function',
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string',
          }
        ],
        input: {
          kind: 'input/expression',
        }
      },
      _childNode: {
        types: 'inherit'
      },
    },
    {
      name: 'onReset',
      desc: 'onReset',
      types: [
        {
          kind: 'class',
          data: 'string',
          parse: true,
        },
        {
          kind: 'type',
          data: 'js/function',
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string',
          }
        ],
        input: {
          kind: 'input/expression',
        }
      },
      _childNode: {
        types: 'inherit'
      },
    },
    {
      name: 'FormProps',
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
          kind: 'input/properties',
          options: [
            'mode',
            'reValidateMode',
            'resolver',
            'context',
            'criteriaMode',
            'shouldFocusError',
            'shouldUnregister',
          ]
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
