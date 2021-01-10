import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/html                                  (~jsx|~expression)
// name:                     # html tag name         (:string) - autosuggest non-restrictive
// props:                    # properties            (:object<:any>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
export const react_html = {

  name: 'react/html',
  desc: 'HTML Tag',
  classes: [
    'jsx',
    'expression',
  ],
  _group: 'react_concepts',
  _expand: true,
  children: [
    {
      name: 'name',
      desc: 'HTML Tag',
      classes: [
        {
          class: 'string'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'HTML tag is required',
        },
      ],
      _thisNode: {
        input: 'js/string'
      },
      _suggestions: [
        {
          __class: 'js/call',
          name: {
            __class: 'js/import',
            name: 'app-x/builder/ui/syntax/util_generate.valid_html_tags',
          }
        }
      ],
      _examples: [
        'div',
        'span',
        'form',
        'input',
        'body',
        'html',
      ],
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
      _childNode: [
        {
          class: 'object',
          input: 'input/properties',
          generate: 'generate(data)',
          parse: 'parse(node)',
        }
      ]
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
              name: '.+',
              class: 'jsx',
            },
            {
              name: '.+',
              class: 'primitive',
            },
            {
              name: '.+',
              class: 'expression',
            }
          ]
        }
      ],
      _childNode: [
        {
          class: 'array',
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
      ]
    },
  ]
}

export default react_html
