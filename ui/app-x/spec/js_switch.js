import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/switch                                   (~expression|~statement)
// children:
//   - condition:            # condition expression  (:expression)
//     result:               # result data           (:expression|:statement)
// default:                  # default data          (:expression|:statement)
export const js_switch = {

  type: 'js/switch',
  desc: 'Switch',
  classes: [
    'expression',
    'statement',
  ],
  _expand: true,
  children: [
    {
      name: 'children',
      desc: 'Conditional',
      optional: true,
      array: true,
      classes: [
        {
          class: 'object',
          shape: [
            {
              name: 'condition',
              desc: 'Condition',
              classes: [
                {
                  class: 'expression'
                }
              ],
              rules: [
                {
                  kind: 'required',
                  required: true,
                  message: 'Condition is required'
                },
              ],
            },
            {
              name: 'result',
              desc: 'Result',
              classes: [
                {
                  class: 'expression'
                },
                {
                  class: 'statement'
                },
              ],
            },
          ]
        }
      ],
      _childNode: {
        class: 'any',
        generate: ' \
          (() => { \
            const node = generate(data.result); \
            node.data._isDefault = false; \
            node.data._condition = data.condition; \
            return node \
          })() \
        ',
        parse: ' \
          (() => ({ \
            condition: node.data._condition, \
            result: parse(node) \
          }))() \
        ',
        customs: [
          {
            name: '_ref',
            hidden: true,
            default: null,
          },
          {
            name: '_isDefault',
            desc: 'Is Default',
            input: 'input/switch',
            default: false,
          },
          {
            name: '_condition',
            desc: 'Condition',
            condition: '!form.watch("_isDefault")',
            input: 'input/expression',
            default: '',
          },
        ],
        effects: [
          {
            body: ' \
            form.setValue("_ref", \
              !!form.getValues("_isDefault") \
                ? "default" \
                : null); \
            ',
            states: [
              'form.watch("_isDefault")'
            ]
          }
        ]
      },
    },
    {
      name: 'default',
      desc: 'Default',
      optional: true,
      classes: [
        {
          class: 'expression'
        },
        {
          class: 'statement'
        },
      ],
      _childNode: {
        class: 'any',
        generate: ' \
          (() => { \
            const node = generate(data); \
            node.data._isDefault = true; \
            node.data._condition = ""; \
            return node \
          })() \
        ',
        parse: 'parse(node)',
        customs: [
          {
            name: '_ref',
            hidden: true,
            default: 'default'
          },
          {
            name: '_isDefault',
            desc: 'Is Default',
            input: 'input/switch',
            default: true
          },
          {
            name: '_condition',
            desc: 'Condition',
            condition: '!form.watch("_isDefault")',
            input: 'input/expression',
            default: ''
          },
        ],
        effects: [
          {
            body: ' \
              form.setValue("_ref", \
                !!form.getValues("_isDefault") \
                  ? "default" \
                  : null); \
            ',
            states: [
              'form.watch("_isDefault")'
            ]
          }
        ]
      },
    },
  ],
}

export default js_switch
