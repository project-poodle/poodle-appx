import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/null             # null                  (~null|~primitive|~expression)
export const js_null = {

  name: 'js/null',
  desc: 'Null',
  classes: [
    {
      class: 'null',
    },
    {
      class: 'primitive',
    },
    {
      class: 'expression',
    }
  ],
  _group: 'js_basics',
  children: []
}

export default js_null
