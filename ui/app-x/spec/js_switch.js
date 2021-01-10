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

  name: 'js/switch',
  desc: 'Switch',
  classes: [
    'expression',
    'statement',
  ],
  _group: 'js_controls',
  _expand: true,
  children: [
    {
      name: 'children',
      desc: 'Conditional',
      optional: true,
      classes: [
        {
          class: 'array',
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
        },
      ],
      _childNode: [
        {
          class: 'array',
          array: true,
          generate: ' \
            thisData.children.map( \
              child => (() => { \
                const node = generate(child.result); \
                node.data._isDefault = false; \
                node.data._condition = child.condition; \
                return node \
              })() \
            ) \
          ',
          parse: ' \
            thisNode.children \
              .filter(childNode => !childNode.data._isDefault) \
              .map(childNode => ({ \
                condition: childNode.data._condition, \
                result: parse(childNode) \
              })) \
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
              input: 'js/boolean',
              default: false,
            },
            {
              name: '_condition',
              desc: 'Condition',
              condition: '!form.watch("_isDefault")',
              input: 'js/expression',
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
        }
      ]
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
      _childNode: [
        {
          class: 'expression',
          otherClasses: [
            'statement'
          ],
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
              input: 'js/boolean',
              default: true
            },
            {
              name: '_condition',
              desc: 'Condition',
              condition: '!form.watch("_isDefault")',
              input: 'js/expression',
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
      ],
    },
  ],
}

export default js_switch
