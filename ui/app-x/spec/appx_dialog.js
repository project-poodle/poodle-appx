import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/dialog                                   (~jsx|~expression)
// name:                     # react element name      (:string)
// open:                     # open state              (:string)
// setOpen:                  # setOpen method          (:string)
// title:                    # title                   (:string)
// icon:                     # icon                    (:jsx)
// defaultValue:             # default value           (:string|:object)
// onSubmit:                 # function for submit     (:string|:array<:statement>)
// FormProps:                # props for hook dialog   (:object<:expression>)
// DialogProps:              # props for 'dialog' tag  (:object<:expression>)
// style:                    # style for 'dialog' tag  (:object<:expression>)
// children:                 # children                (:array<:jsx|:primitive|:expression>)
export const appx_dialog = {

  type: 'appx/dialog',
  desc: 'App-X Dialog',
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
      name: 'open',
      desc: 'Open',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string',
          parse: true,
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/expression',
        }
      },
    },
    {
      name: 'setOpen',
      desc: 'Set Open',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string',
          parse: true,
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/expression',
        }
      },
    },
    {
      name: 'title',
      desc: 'Title',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string',
          parse: true,
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/expression',
        }
      },
    },
    {
      name: 'icon',
      desc: 'Icon',
      types: [
        {
          kind: 'class',
          data: 'jsx',
        },
      ],
      _childNode: {
        types: 'inherit',
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
      name: 'DialogProps',
      desc: 'Dialog Properties',
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
          options: 'validation.valid_propTypes_for("@material-ui/core.Dialog")',
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

export default appx_dialog
