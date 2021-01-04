import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: js/null             # null                  (~null|~primitive|~expression)
export const js_null = {

  name: 'js/null',
  desc: 'Null',
  kinds: [
    {
      kind: 'null',
    },
    {
      kind: 'primitive',
    },
    {
      kind: 'expression',
    }
  ],
  _group: 'js_basics',
  children: []
}

export default js_null
