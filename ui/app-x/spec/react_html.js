import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/html                                  (~jsx|~expression)
// name:                     # html tag name         (:string) - autosuggest non-restrictive
// props:                    # properties            (:object<:expression>)
// style:                    # style                 (:object<:expression>)
// children:                 # children              (:array<:jsx|:primitive|:expression>)
export const react_html = {

  type: 'react/html',
  desc: 'HTML Tag',
  _expand: true,
  children: [
    {
      name: 'name',
      desc: 'HTML Tag',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text',
          options: 'validation.valid_html_tags()',
        },
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
      types: [
        {
          kind: 'class',
          data: 'object'
        },
      ],
      _childNode: {
        types: 'inherit',
        input: {
          kind: 'input/properties'
        },
      },
    },
    {
      name: 'style',
      desc: 'Style',
      types: [
        {
          kind: 'class',
          data: 'object'
        },
      ],
      _childNode: {
        types: 'inherit',
        input: {
          kind: 'input/properties',
          options: 'validation.valid_css_properties()',
        },
      },
    },
    {
      name: 'children',
      desc: 'Child Elements',
      array: true,
      types: [
        {
          kind: 'class',
          data: 'jsx'
        },
      ],
      _childNode: {
        types: 'inherit',
      },
    },
  ]
}

export default react_html
