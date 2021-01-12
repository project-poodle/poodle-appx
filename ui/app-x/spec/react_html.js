import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/html                                  (~jsx|~expression)
// name:                     # html tag name         (:string) - autosuggest non-restrictive
// props:                    # properties            (:object<:expression>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
export const react_html = {

  type: 'react/html',
  desc: 'HTML Tag',
  classes: [
    'jsx',
    'expression',
  ],
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
      _thisNode: {
        class: 'string',
        input: 'input/text',
        suggestions: 'auto_suggestions.valid_html_tags()',
        examples: [
          'div',
          'span',
          'form',
          'input',
          'body',
          'html',
        ],
      },
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
              class: 'expression'
            }
          ]
        }
      ],
      _childNode: {
        class: 'object',
        input: 'input/properties',
      },
    },
    {
      name: 'children',
      desc: 'Child Elements',
      optional: true,
      array: true,
      classes:
      [
        {
          class: 'jsx',
        },
      ],
      _childNode: {
        class: 'jsx',
      },
    },
  ]
}

export default react_html
