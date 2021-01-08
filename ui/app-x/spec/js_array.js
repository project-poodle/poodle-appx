import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/array                                    (~array|~expression)
export const js_array = {

  name: 'js/array',
  desc: 'Array',
  classes: [
    {
      class: 'array',
    },
    {
      class: 'expression',
    }
  ],
  _group: 'js_basics',
  children: [
    {
      name: 'children',
      desc: 'Children',
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
      _childNode: {
        array: true,
        generate: ' \
          thisData.children.map(child => generate(child)) \
        ',
        parse: ' \
          thisNode._children.map(child => parse(child)) \
        ',
      }
    },
  ]
}

export default js_array
