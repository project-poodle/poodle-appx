import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/array                                    (~array|~expression)
export const js_array = {

  name: 'js/array',
  desc: 'Array',
  classes: [
    'array',
  ],
  _group: 'js_basics',
  children: [
    {
      name: 'children',
      desc: 'Array Items',
      optional: true,
      classes: [
        {
          class: 'array',
          classes: [
            {
              class: 'any',
            }
          ]
        },
      ],
      _childNode: [
        {
          class: 'array',
          array: true,
          generate: ' \
            thisData.children.map(child => generate(child)) \
          ',
          parse: ' \
            thisNode.children.map(child => parse(child)) \
          ',
        }
      ]
    },
  ]
}

export default js_array
