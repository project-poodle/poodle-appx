import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/function                                 (~expression)
// params:                                           (:array<:string>)
//   - p1
//   - p2
// body:                     # code body             (:string|:array<:statement>)
export const js_function = {

  name: 'js/function',
  desc: 'Function',
  classes: [
    'expression',
  ],
  _group: 'js_advanced',
  children: [
    {
      name: 'params',
      desc: 'Parameters',
      optional: true,
      classes: [
        {
          class: 'array',
          classes: [
            {
              class: 'string'
            }
          ]
        },
      ],
      rules: [
        {
          kind: 'pattern',
          pattern: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _thisNode: [
        {
          class: 'array',
          array: true,
          input: 'js/string',
          generate: 'data.map(item => ({ \
            value: item \
          }))',
          parse: 'nodeData.map(item => item.value)',
        }
      ],
    },
    {
      name: 'body',
      desc: 'Body',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'block',
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/statement',
        }
      ],
      _childNode: [
        {
          class: 'block',
          array: true,
          generate: ' \
            thisData.children.map( \
              child => generate(child) \
            ) \
          ',
          parse: ' \
            thisNode.children \
              .filter(child => !child.data._ref) \
              .map(child => parse(child)) \
          ',
        }
      ],
    },
  ]
}

export default js_function
