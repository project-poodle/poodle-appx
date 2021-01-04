import {
  REGEX_VAR,
  types
} from 'app-x/spec/types.js'

// type: js/null             # null                  (~null|~primitive|~expression)
export const js_null = {

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
  _group: 'js_basics',
  children: []
}

export default js_null
