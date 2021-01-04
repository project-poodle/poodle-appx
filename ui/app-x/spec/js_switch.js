import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: js/switch                                   (~expression|~statement)
// children:
//   - condition:            # condition expression  (:expression)
//     result:               # result data           (:expression|:statement)
// default:                  # default data          (:expression|:statement)
const js_switch = {

  name: 'js/switch',
  desc: 'Switch',
  types: [
    {
      type: 'expression',
    },
    {
      type: 'statement',
    },
  ],
  _group: 'js_controls',
  children: [
    {
      name: 'children',
      desc: 'Conditional',
      types: [
        {
          type: 'array',
          types: [
            {
              type: 'object',
              shape: [
                {
                  name: 'condition',
                  desc: 'Condition',
                  types: [
                    {
                      type: 'expression'
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
                  types: [
                    {
                      type: 'expression'
                    },
                    {
                      type: 'statement'
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
      types: [
        {
          type: 'expression'
        },
        {
          type: 'statement'
        },
      ],
    },
  ]
}

export default js_switch
