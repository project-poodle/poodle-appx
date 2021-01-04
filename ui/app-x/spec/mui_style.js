import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: mui/style                                   (~expression)
// ...:                      # styles in json        (:object<:any>)
const mui_style = {

  name: 'mui/style',
  desc: 'MUI Style',
  types: [
    {
      type: 'expression',
    }
  ],
  _group: 'mui',
  children: [
    {
      name: '*',
      desc: 'Children',
      types: [
        {
          type: 'any'
        },
      ],
      _variants: [
        {
          variant: 'js/object'
        }
      ],
    },
  ]
}

export default mui_style
