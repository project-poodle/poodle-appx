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
    'expression',
    'statement',
  ],
  _customs: [
    {
      name: '_ref',
      hidden: true,
      default: '...'
    },
  ],
  _effects: [
    {
      body: ' \
        form.setValue("_ref", "..." + form.getValues("name") \
      ',
      states: [
        'form.watch("name")'
      ]
    }
  ],
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
      _thisNode: [
        {
          class: 'string',
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
      _thisNode: [
        {
          class: 'string',
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
      ],
    },
    {
      name: 'init',
      desc: 'Init Value',
      optional: true,
      classes: [
        {
          class: 'string'
        }
      ],
      _thisNode: [
        {
          class: 'string',
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
      ],
    },
  ]
}

export default react_state
