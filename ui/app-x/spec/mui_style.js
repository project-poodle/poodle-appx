import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: mui/style                                   (~expression)
// ...:                      # styles in json        (:object<:any>)
export const mui_style = {

  name: 'mui/style',
  desc: 'MUI Style',
  classes: [
    'expression',
  ],
  children: [
    {
      name: '*',
      desc: '`${node.data.name}`',
      optional: true,
      classes: [
        {
          class: 'any',
        },
      ],
      _childNode: [
        {
          class: 'any',
          input: 'input/properties',
        }
      ]
    },
  ]
}

export default mui_style
