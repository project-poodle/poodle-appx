import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: react/html                                  (~jsx|~expression)
// name:                     # html tag name         (:expression) - autosuggest non-restrictive
// props:                    # properties            (:object<:any>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
const react_html = {

  name: 'react/html',
  desc: 'HTML Tag',
  types: [
    {
      type: 'jsx',
    },
    {
      type: 'expression',
    }
  ],
  _group: 'react_concepts',
  children: [
    {
      name: 'name',
      desc: 'HTML Tag',
      types: [
        {
          type: 'string'
        },
        {
          type: 'expression'
        }
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'HTML tag is required',
        },
      ],
      _variants: [
        {
          variant: 'js/string'
        }
      ],
      _suggestions: [
        {
          __type: 'js/call',
          name: {
            __type: 'js/import',
            name: 'app-x/builder/ui/syntax/util_parse.valid_html_tags',
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
      types: [
        {
          type: 'object',
          types: [
            {
              name: '.+',
              type: 'any'
            }
          ]
        }
      ],
      _variants: [
        {
          variant: 'js/object'
        }
      ],
    },
    {
      name: 'children',
      desc: 'Child Elements',
      types:
      [
        {
          type: 'array',
          types: [
            {
              name: '.+',
              type: 'jsx',
            },
            {
              name: '.+',
              type: 'primitive',
            },
            {
              name: '.+',
              type: 'expression',
            }
          ]
        }
      ],
    },
  ]
}

export default react_html
