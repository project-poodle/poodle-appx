import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: input/rule                                  (~jsx|~expression)
// children:                 # children              (:object:string>)
export const input_text = {

  type: 'input/rule',
  desc: 'Input Rules',
  _input: {
    kind: 'input/list',
    columns: [
      {
        name: 'kind',
        title: 'Kind',
        span: 4,
        required: true,
        input: {
          kind: 'input/select',
          options: [
            {
              value: 'pattern',
            },
            {
              value: 'validate',
            }
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
  children: [
    {
      name: 'data',
      desc: 'Rules',
      array: true,
      types: [
        {
          kind: 'shape',
          data: {
            kind: {
              desc: 'Kind',
              required: true,
              types: [
                {
                  kind: 'class',
                  data: 'string'
                }
              ]
            },
            data: {
              desc: 'Data',
              required: true,
              types: [
                {
                  kind: 'class',
                  data: 'string'
                }
              ]
            },
            message: {
              desc: 'Message',
              required: true,
              types: [
                {
                  kind: 'class',
                  data: 'string'
                }
              ]
            },
          }
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'object'
          },
        ]
      },
    },
  ]
}

export default input_text
