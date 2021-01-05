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
      desc: 'Children',
      classes: [
        {
          class: 'any'
        },
      ],
      _inputs: [
        {
          input: 'js/object'
        }
      ],
      _child: {}
    },
  ]
}

export default mui_style
