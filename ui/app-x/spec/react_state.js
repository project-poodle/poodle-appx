import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/state                                 (~expression|~statement)
// name:                     # name of the state     (:string)
// setter:                   # name of the setter    (:string)
// init:                     # init value            (:expression)
export const react_state = {

  type: 'react/state',
  desc: 'React State',
  _customs: [
    {
      name: '_customRef',
      desc: 'Custom Reference',
      input: 'input/switch',
      context: [ "add", "move" ],
    }
  ],
  _effects: {
    context: [ "add", "move" ],
    data: [
      '(() => { if (!form.getValues("_customRef")) states.setRef("..." + form.getValues("name")) })()',
      '(() => { if (!form.getValues("_customRef")) states.setDisabled("_ref", true) })()',
      '(() => { if (!!form.getValues("_customRef")) states.setDisabled("_ref", false) })()',
    ]
  },
  children: [
    {
      name: 'name',
      desc: 'Name',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      rules: [
        {
          kind: 'pattern',
          data: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: 'input/text',
        examples: [
          'open',
          'show',
          'loaded',
          'sideNavOpen',
          'previewEnabled',
          'peerConnected',
        ],
      },
    },
    {
      name: 'setter',
      desc: 'Setter',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      rules: [
        {
          kind: 'pattern',
          data: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: 'input/text',
        examples: [
          'setOpen',
          'setShow',
          'setLoaded',
          'setSideNavOpen',
          'setPreviewEnabled',
          'setPeerConnected',
        ],
      },
    },
    {
      name: 'init',
      desc: 'Init Value',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: 'input/expression',
        examples: [
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
    },
  ]
}

export default react_state
