import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/form                                  (~jsx|~expression)
// name:                     # name of the form      (:string)             - unique in a file
// onSubmit:                 # function for submit   (:string|:array<:statement>)
// onError:                  # function for error    (:string|:array<:statement>)
// props:                    # props for 'form' tag  (:object<:any>)
// formProps:                # props for hook form   (:object<:any>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
export const react_form = {

  name: 'react/form',
  desc: 'React Form',
  classes: [
    {
      class: 'jsx',
    },
    {
      class: 'expression',
    },
  ],
  _group: 'form_input',
  _expand: true,
  children: [
    {
      name: 'name',
      desc: 'Form Name',
      classes: [
        {
          class: 'string'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Form name is required',
        },
        {
          kind: 'pattern',
          pattern: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _thisNode: {
        input: 'js/string'
      },
    },
    {
      name: 'onSubmit',
      desc: 'onSubmit',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'array',
          classes: [
            {
              class: 'statement'
            }
          ]
        },
      ],
      _thisNode: {
        condition: '!data || typeof data === "string"',
        input: 'js/statement'
      },
      _childNode: {}
    },
    {
      name: 'onError',
      desc: 'onError',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'array',
          classes: [
            {
              class: 'statement'
            }
          ]
        },
      ],
      _thisNode: {
        condition: '!data || typeof data === "string"',
        input: 'js/statement'
      },
      _childNode: {}
    },
    {
      name: 'props',
      desc: 'Properties',
      optional: true,
      classes: [
        {
          class: 'object',
          classes: [
            {
              name: '.+',
              class: 'any'
            }
          ]
        }
      ],
      _childNode: {
        input: 'js/object',
        generate: 'generate(data)',
        parse: 'parse(node)',
      }
    },
    {
      name: 'formProps',
      desc: 'Form Properties',
      optional: true,
      classes: [
        {
          class: 'object',
          classes: [
            {
              name: '.+',
              class: 'any'
            }
          ]
        }
      ],
      _childNode: {
        input: 'js/object',
        generate: 'generate(data)',
        parse: 'parse(node)',
      }
    },
    {
      name: 'children',
      desc: 'Child Elements',
      optional: true,
      classes:
      [
        {
          class: 'array',
          classes: [
            {
              class: 'jsx',
            },
            {
              class: 'primitive',
            },
            {
              class: 'expression',
            }
          ]
        }
      ],
      _childNode: {
        array: true,
        generate: ' \
          thisData.children.map( \
            child => generate(child) \
          ) \
        ',
        parse: ' \
          thisNode._children \
            .filter(child => !child._ref) \
            .map(child => parse(child)) \
        ',
      },
    },
  ]
}

export default react_form
