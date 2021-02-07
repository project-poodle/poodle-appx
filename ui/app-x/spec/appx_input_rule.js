import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/input/rule                             (~jsx|~expression)
// children:                 # children              (:object:string>)
export const appx_input_rule = {

  type: 'appx/input/rule',
  desc: 'Input Rules',
  template: {
    kind: 'custom',
    expr: ' \
      ((data) => {  \
        const pattern = data.find(row => row.kind === "pattern"); \
        const result = !!pattern \
          ? { \
              pattern: {  \
                value: eval(pattern.data),  \
                message: eval(pattern.message), \
              } \
            } \
          : {}; \
        let i=1;  \
        result.validate = data \
          .filter(row => row.kind === "validate") \
          .reduce((accumulator, item) => {  \
            accumulator[`${validate}_${i++}`] = (value) => {  \
              try { \
                return eval(item.data) || eval(item.message)  \
              } catch (e) { \
                return e.message || String(e)  \
              } \
            } \
          }, {}); \
        return result \
      })($data)  \
    ',
  },
  _input: {
    kind: 'input/tabular',
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

export default appx_input_rule
