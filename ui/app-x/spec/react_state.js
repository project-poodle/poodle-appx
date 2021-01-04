import {
  REGEX_VAR,
  types
} from 'app-x/spec/types.js'

// type: react/state                                 (~expression|~statement)
// name:                     # name of the state     (:string)
// setter:                   # name of the setter    (:string)
// init:                     # init value            (:expression)
export const react_state = {

  name: 'react/state',
  desc: 'React State',
  types: [
    {
      type: 'expression',
    },
    {
      type: 'statement',
    }
  ],
  _group: 'react_concepts',
  children: [
    {
      name: 'name',
      desc: 'State Name',
      types: [
        {
          type: 'string'
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
      types: [
        {
          type: 'string'
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
      types: [
        {
          type: 'expression'
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
