import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: input/switch                                (~jsx|~expression)
// name:                     # name of input         (:string)
// props:                    # properties            (:object<:expression>)
// rules:                    # input rules           (:input/rule)
export const input_switch = {

  type: 'input/switch',
  desc: 'Text Input',
  children: [
    {
      name: 'name',
      desc: 'Input Name',
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
      name: 'props',
      desc: 'Properties',
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
          data: 'input/rule'
        },
      ],
      _childNode: {
        types: 'inherit',
        input: {
          kind: 'input/list',
          type: 'input/rule',
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

export default input_switch
