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
    {
      class: 'expression',
    }
  ],
  _group: 'mui',
  children: [
    {
      name: '*',
      desc: 'Styles',
      optional: true,
      classes: [
        {
          class: 'any'
        },
      ],
      _childNode: {
        input: 'js/object'
      }
    },
  ]
}

export default mui_style
