import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: mui/style                                   (~expression)
// ...:                      # styles in json        (:object<:any>)
export const mui_style = {

  type: 'mui/style',
  desc: 'MUI Style',
  children: [
    {
      name: '*',
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
  ]
}

export default mui_style
