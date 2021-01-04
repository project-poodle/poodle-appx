import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

// type: react/state                                 (~expression|~statement)
// name:                     # name of the state     (:string)
// setter:                   # name of the setter    (:string)
// init:                     # init value            (:expression)
export const react_state = {

  name: 'react/state',
  desc: 'React State',
  kinds: [
    {
      kind: 'expression',
    },
    {
      kind: 'statement',
    }
  ],
  _group: 'react_concepts',
  children: [
    {
      name: 'name',
      desc: 'State Name',
      kinds: [
        {
          kind: 'string'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'State name is required',
        },
        {
          pattern: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _variants: [
        {
          variant: 'js/string'
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
      kinds: [
        {
          kind: 'string'
        }
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'State setter is required',
        },
        {
          pattern: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _variants: [
        {
          variant: 'js/string'
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
      kinds: [
        {
          kind: 'expression'
        }
      ],
      _variants: [
        {
          variant: 'js/expression'
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
