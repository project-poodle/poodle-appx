import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/state                                 (~expression|~statement)
// name:                     # name of the state     (:string)
// setter:                   # name of the setter    (:string)
// init:                     # init value            (:expression)
export const react_state = {

  name: 'react/state',
  desc: 'React State',
  classes: [
    {
      class: 'expression',
    },
    {
      class: 'statement',
    }
  ],
  _group: 'react_concepts',
  children: [
    {
      name: 'name',
      desc: 'State Name',
      classes: [
        {
          class: 'string'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Name is required',
        },
        {
          pattern: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _inputs: [
        {
          input: 'js/string'
        }
      ],
      _examples: [
        'open',
        'show',
        'loaded',
        'sideNavOpen',
        'previewEnabled',
        'peerConnected',
      ],
    },
    {
      name: 'setter',
      desc: 'State Setter',
      classes: [
        {
          class: 'string'
        }
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Setter is required',
        },
        {
          kind: 'pattern',
          pattern: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _inputs: [
        {
          input: 'js/string'
        }
      ],
      _examples: [
        'setOpen',
        'setShow',
        'setLoaded',
        'setSideNavOpen',
        'setPreviewEnabled',
        'setPeerConnected',
      ],
    },
    {
      name: 'init',
      desc: 'Init Value',
      optional: true,
      classes: [
        {
          class: 'expression'
        }
      ],
      _inputs: [
        {
          input: 'js/expression'
        }
      ],
      _examples: [
        null,
        true,
        false,
        'START',
        [],
        {},
        {
          initialized: false,
          data: [],
        },
      ],
    },
  ]
}

export default react_state
