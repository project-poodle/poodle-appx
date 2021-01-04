import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: react/html                                  (~jsx|~expression)
// name:                     # html tag name         (:expression) - autosuggest non-restrictive
// props:                    # properties            (:object<:any>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
export const react_html = {

  name: 'react/html',
  desc: 'HTML Tag',
  kinds: [
    {
      kind: 'jsx',
    },
    {
      kind: 'expression',
    }
  ],
  _group: 'react_concepts',
  children: [
    {
      name: 'name',
      desc: 'HTML Tag',
      kinds: [
        {
          kind: 'string'
        },
        {
          kind: 'expression'
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
          __kind: 'js/call',
          name: {
            __kind: 'js/import',
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
      kinds: [
        {
          kind: 'object',
          kinds: [
            {
              name: '.+',
              kind: 'any'
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
      kinds:
      [
        {
          kind: 'array',
          kinds: [
            {
              name: '.+',
              kind: 'jsx',
            },
            {
              name: '.+',
              kind: 'primitive',
            },
            {
              name: '.+',
              kind: 'expression',
            }
          ]
        }
      ],
    },
  ]
}

export default react_html
