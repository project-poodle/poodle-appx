import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: js/null             # null                  (~null|~primitive|~expression)
const js_null = {

  name: 'js/null',
  desc: 'Null',
  types: [
    {
      type: 'null',
    },
    {
      type: 'primitive',
    },
    {
      type: 'expression',
    }
  ],
  children: []
}

export default js_null
