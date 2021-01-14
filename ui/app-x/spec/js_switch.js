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
  _expand: true,
  children: [
    {
      name: 'children',
      desc: 'Conditional',
      array: true,
      types: [
        {
          kind: 'shape',
          data: {
            condition: {
              desc: 'Condition',
              required: true,
              types: [
                {
                  kind: 'class',
                  data: 'expression'
                }
              ],
            },
            result: {
              desc: 'Result',
              required: true,
              types: [
                {
                  kind: 'class',
                  data: 'expression'
                },
                {
                  kind: 'class',
                  data: 'statement'
                },
              ],
            }
          }
        }
      ],
      _childNode: {
        types: 'inherit',
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
            name: '_isDefault',
            desc: 'Is Default',
            class: 'boolean',
            required: true,
            input: 'input/switch',
          },
          {
            name: '_condition',
            desc: 'Condition',
            class: 'string',
            required: true,
            input: 'input/expression',
          },
        ],
        effects: [
          '(() => { \
            const refTarget = !!form.getValues("_isDefault") ? "default" : "children"; \
            states.setRef(refTarget); \
          })()',
          '(() => { if (!!form.getValues("_isDefault")) states.setHidden("_condition", true) })()',
          '(() => { if (!form.getValues("_isDefault")) states.setHidden("_condition", false) })()',
          '(() => { states.setDisabled("_ref", true) })()',
          '(() => { form.trigger("_ref") })()',
        ]
      },
    },
    {
      name: 'default',
      desc: 'Default',
      types: [
        {
          kind: 'class',
          data: 'expression'
        },
        {
          kind: 'class',
          data: 'statement'
        },
      ],
      _childNode: {
        types: 'inherit',
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
            name: '_isDefault',
            desc: 'Is Default',
            class: 'boolean',
            input: 'input/switch',
          },
          {
            name: '_condition',
            desc: 'Condition',
            class: 'string',
            input: 'input/expression',
          },
        ],
        effects: [
          '(() => { \
            const refTarget = !!form.getValues("_isDefault") ? "default" : "children"; \
            states.setRef(refTarget); \
          })()',
          '(() => { if (!!form.getValues("_isDefault")) states.setHidden("_condition", true) })()',
          '(() => { if (!form.getValues("_isDefault")) states.setHidden("_condition", false) })()',
          '(() => { states.setDisabled("_ref", true) })()',
          '(() => { form.trigger("_ref") })()',
        ]
      },
    },
  ],
}

export default js_switch
