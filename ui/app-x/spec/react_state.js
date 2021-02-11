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
      context: [ "add", "move" ],
      input: {
        kind: 'input/switch',
      },
    }
  ],
  _effects: [
    {
      context: [ "add", "move" ],
      data: [
        '(() => { if (!states.getValue("_customRef")) states.setRef("..." + states.getValue("name")) })()',
        '(() => { if (!states.getValue("_customRef")) states.setDisabled("_ref", true) })()',
        '(() => { if (!states.getValue("_customRef")) states.setDisabled("setter", true) })()',
        '(() => { if (!!states.getValue("_customRef")) states.setDisabled("_ref", false) })()',
        '(() => { if (!!states.getValue("_customRef")) states.setDisabled("setter", false) })()',
        '(() => { const name = states.getValue("name") || ""; if (!states.getValue("_customRef")) states.setValue("setter", "set" + name.charAt(0).toUpperCase() + name.slice(1)) })()',
      ]
    },
    {
      context: [ "editor" ],
      data: [
        '(() => { states.setDisabled("_ref", true) })()',
        '(() => { if (states.getValue("_ref").startsWith("...")) states.setDisabled("setter", true) })()',
        '(() => { if (!states.getValue("_ref").startsWith("...")) states.setDisabled("setter", false) })()',
        '(() => { if (states.getValue("_ref").startsWith("...")) states.setRef("..." + states.getValue("name")) })()',
        '(() => { const name = states.getValue("name") || ""; if (states.getValue("_ref").startsWith("...")) states.setValue("setter", "set" + name.charAt(0).toUpperCase() + name.slice(1)) })()',
      ]
    }
  ],
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
        input: {
          kind: 'input/text',
        },
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
        input: {
          kind: 'input/text',
        },
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
        input: {
          kind: 'input/expression',
        },
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
