import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: mui/style                                   (~expression)
// ...:                      # styles in json        (:object<:any>)
export const mui_style = {

  type: 'mui/style',
  desc: 'MUI Style',
  classes: [
    'expression',
  ],
  children: [
    {
      name: '*',
      desc: 'Styles',
      classes: [
        {
          class: 'object',
        },
      ],
      _childNode: {
        class: 'object',
        input: 'input/properties',
      },
    },
  ]
}

export default mui_style
