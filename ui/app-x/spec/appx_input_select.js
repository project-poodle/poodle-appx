import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/input/select                           (~jsx|~expression)
// name:                     # name of input         (:string)
// id:                       # id of input           (:string)
// rules:                    # input rules           (:appx/input/rule)
export const appx_input_select = {

  type: 'appx/input/select',
  desc: 'Text Input',
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
      name: 'label',
      desc: 'Label',
      types: [
        {
          kind: 'class',
          data: 'string'
        }
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text',
        },
      },
    },
    {
      name: 'required',
      desc: 'Required',
      types: [
        {
          kind: 'class',
          data: 'boolean'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/switch'
        },
      },
    },
    {
      name: 'options',
      desc: 'Options',
      array: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'type',
          data: 'js/expression',
          expr: '$child.flat()'
        }
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: {
          kind: 'input/text'
        },
      },
      _childNode: {
        types: [
          {
            kind: 'type',
            data: 'js/expression'
          }
        ]
      }
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
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: {
          kind: 'input/expression'
        },
      },
    },
    {
      name: 'callback',
      desc: 'Callback',
      types: [
        {
          kind: 'class',
          data: 'string',
          parse: true,
        },
        {
          kind: 'type',
          data: 'js/function'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string',
          },
        ],
        input: {
          kind: 'input/expression'
        },
      },
      _childNode: {
        types: [
          {
            kind: 'type',
            data: 'js/function'
          }
        ]
      }
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
      name: 'TextProps',
      desc: 'TextField Properties',
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
          options: 'validation.valid_propTypes_for("@material-ui/core.TextField")',
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
      name: 'rules',
      desc: 'Rules',
      types: [
        {
          kind: 'type',
          data: 'appx/input/rule'
        },
      ],
      _childNode: {
        types: 'inherit',
        input: {
          kind: 'input/tabular',
          type: 'appx/input/rule',
          field: 'data',
          columns: [
            {
              name: 'kind',
              title: 'Kind',
              span: 4,
              required: true,
              input: {
                kind: 'input/select',
                options: [
                  'pattern',
                  'validate',
                ],
                optionsOnly: true,
              },
            },
            {
              name: 'data',
              title: 'Data',
              span: 8,
              required: true,
              input: {
                kind: 'input/text'
              },
              rules: [
                {
                  kind: 'validate',
                  data: '(() => { parseExpression(value); return true })()',
                  message: 'Must be a valid expression',
                },
                {
                  kind: 'validate',
                  data: '(() => { \
                    const kindName = name.replace(/.data$/, ".kind"); \
                    const kind = form.getValues(kindName); \
                    if (kind === "pattern") { \
                      return (eval(value) instanceof RegExp) \
                    } else { \
                      return true \
                    } \
                  })()',
                  message: 'Must be a valid RegExp expression',
                }
              ]
            },
            {
              name: 'message',
              title: 'Message',
              span: 10,
              required: true,
              input: {
                kind: 'input/text',
              },
              rules: [
                {
                  kind: 'validate',
                  data: '(() => { parseExpression(value); return true })()',
                  message: 'Must be a valid expression',
                }
              ]
            }
          ]
        },
      },
    },
  ]
}

export default appx_input_select
