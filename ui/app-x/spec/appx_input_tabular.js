import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/input/tabular                          (~jsx|~expression)
// name:                     # name of input         (:string)
// id:                       # id of input           (:string)
export const appx_input_tabular = {

  type: 'appx/input/tabular',
  desc: 'Tabular Input',
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
      name: 'disabled',
      desc: 'Disabled',
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
        },
      },
    },
    {
      name: 'actionSpan',
      desc: 'Action Span (total 24 spans)',
      types: [
        {
          kind: 'class',
          data: 'number'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text',
          variant: 'number',
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
      name: 'columns',
      desc: 'Columns',
      array: true,
      types: [
        {
          kind: 'type',
          data: 'appx/input/text'
        },
        {
          kind: 'type',
          data: 'appx/input/switch'
        },
        {
          kind: 'type',
          data: 'appx/input/select'
        },
      ],
      customChild: [
        {
          name: '_span',
          desc: 'Span',
          required: true,
          types: [
            {
              kind: 'type',
              data: 'number',
            }
          ]
        }
      ],
      _childNode: {
        types: 'inherit',
        generate: ' \
          (() => {  \
            const node = generate(data); \
            node.data._span = data._span; \
            return node \
          })() \
        ',
        parse: ' \
          (() => ({ \
            ...parse(node), \
            _span: node.data._span \
          }))() \
        ',
        customs: [
          {
            name: '_span',
            desc: 'Span',
            class: 'number',
            required: true,
            context: [ 'add', 'move', 'editor' ],
            input: {
              kind: 'input/text',
              variant: 'number',
            },
          },
        ]
      },
    },
  ]
}

export default appx_input_tabular
