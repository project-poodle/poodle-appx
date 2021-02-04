import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/condition                                (~expression|~statement)
// children:
//   - condition:            # condition expression  (:expression)
//     result:               # result data           (:expression|:statement)
// default:                  # default data          (:expression|:statement)
export const js_condition = {

  type: 'js/condition',
  desc: 'Condition',
  _expand: true,
  children: [
    {
      name: 'children',
      desc: 'Conditional',
      array: true,
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
            context: [ 'add', 'move', 'editor' ],
            input: {
              kind: 'input/switch'
            },
          },
          {
            name: '_condition',
            desc: 'Condition',
            class: 'string',
            required: true,
            context: [ 'add', 'move', 'editor' ],
            input: {
              kind: 'input/expression',
            },
          },
        ],
        effects: [
          {
            context: [ 'add', 'move', 'editor' ],
            data: [
              '(() => { \
                const refTarget = !!form.getValues("_isDefault") ? "default" : "children"; \
                states.setRef(refTarget); \
              })()',
              '(() => { if (!!form.getValues("_isDefault")) states.setHidden("_condition", true) })()',
              '(() => { if (!form.getValues("_isDefault")) states.setHidden("_condition", false) })()',
              '(() => { states.setDisabled("_ref", true) })()',
              '(() => { form.trigger("_ref") })()',
            ]
          }
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
            context: [ 'add', 'move', 'editor' ],
            input: {
              kind: 'input/switch',
            },
          },
          {
            name: '_condition',
            desc: 'Condition',
            class: 'string',
            context: [ 'add', 'move', 'editor' ],
            input: {
              kind: 'input/expression',
            },
          },
        ],
        effects: [
          {
            context: [ 'add', 'move', 'editor' ],
            data: [
              '(() => { \
                const refTarget = !!form.getValues("_isDefault") ? "default" : "children"; \
                states.setRef(refTarget); \
              })()',
              '(() => { if (!!form.getValues("_isDefault")) states.setHidden("_condition", true) })()',
              '(() => { if (!form.getValues("_isDefault")) states.setHidden("_condition", false) })()',
              '(() => { states.setDisabled("_ref", true) })()',
              '(() => { form.trigger("_ref") })()',
            ]
          }
        ]
      },
    },
  ],
}

export default js_condition
