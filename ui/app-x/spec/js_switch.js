import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/switch                                   (~expression|~statement)
// children:
//   - condition:            # condition expression  (:expression)
//     result:               # result data           (:expression|:statement)
// default:                  # default data          (:expression|:statement)
export const js_switch = {

  name: 'js/switch',
  desc: 'Switch',
  kinds: [
    {
      kind: 'expression',
    },
    {
      kind: 'statement',
    },
  ],
  _group: 'js_controls',
  children: [
    {
      name: 'children',
      desc: 'Conditional',
      kinds: [
        {
          kind: 'array',
          kinds: [
            {
              kind: 'object',
              shape: [
                {
                  name: 'condition',
                  desc: 'Condition',
                  kinds: [
                    {
                      kind: 'expression'
                    }
                  ],
                  rules: [
                    {
                      kind: 'required',
                      required: true,
                      message: 'Condition is required'
                    },
                  ],
                  _variants: [
                    {
                      variant: 'js/expression'
                    }
                  ],
                },
                {
                  name: 'result',
                  desc: 'Result',
                  kinds: [
                    {
                      kind: 'expression'
                    },
                    {
                      kind: 'statement'
                    },
                  ],
                },
              ]
            }
          ],
        },
      ],
    },
    {
      name: 'default',
      desc: 'Default',
      kinds: [
        {
          kind: 'expression'
        },
        {
          kind: 'statement'
        },
      ],
    },
  ]
}

export default js_switch
