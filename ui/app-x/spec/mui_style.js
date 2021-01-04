import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: mui/style                                   (~expression)
// ...:                      # styles in json        (:object<:any>)
export const mui_style = {

  name: 'mui/style',
  desc: 'MUI Style',
  kinds: [
    {
      kind: 'expression',
    }
  ],
  _group: 'mui',
  children: [
    {
      name: '*',
      desc: 'Children',
      kinds: [
        {
          kind: 'any'
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
