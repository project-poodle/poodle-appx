import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/api                                    (~statement)
// namespace:                # namespace             (:string|:expression)
// app_name:                 # app_name              (:string|:expression)
// method:                   # get, post, put, etc   (:string|:expression)
// endpoint:                 # endpoint              (:string|:expression) - autosuggest
// data:                     # api data              (:expression)         - for post, put, patch
// prep:                     # prep code             (:string|:array<:statement>)
// result:                   # result code           (:string|:array<:statement>)
// error:                    # error code            (:string|:array<:statement>)
export const appx_api = {

  name: 'appx/api',
  desc: 'API',
  classes: [
    {
      class: 'statement',
    }
  ],
  _group: 'appx',
  children: [
    {
      name: 'namespace',
      desc: 'Namespace',
      classes: [
        {
          class: 'string'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Namespace is required',
        },
      ],
      _thisNode: {
        input: 'js/string'
      },
    },
    {
      name: 'app_name',
      desc: 'App Name',
      classes: [
        {
          class: 'string'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'App name is required',
        },
      ],
      _thisNode: {
        input: 'js/string'
      },
    },
    {
      name: 'method',
      desc: 'Method',
      classes: [
        {
          class: 'string'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Method is required',
        },
      ],
      _thisNode: {
        input: 'js/string'
      },
    },
    {
      name: 'endpoint',
      desc: 'Endpoint',
      classes: [
        {
          class: 'string'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Endpoint is required',
        },
      ],
      _thisNode: {
        input: 'js/string'
      },
    },
    {
      name: 'data',
      desc: 'Data',
      optional: true,
      classes: [
        {
          class: 'expression'
        },
      ],
      _thisNode: {
        condition: '!data || typeof data === "string"',
        input: 'js/expression',
      },
      _childNode: {},
    },
    {
      name: 'init',
      desc: 'Init Code',
      optional: true,
      classes: [
        {
          class: 'string'
        },
        {
          class: 'array',
          classes: [
            {
              class: 'statement'
            }
          ]
        },
      ],
      _thisNode: {
        condition: '!data || typeof data === "string"',
        input: 'js/statement',
      },
      _childNode: {},
    },
    {
      name: 'result',
      desc: 'Result Handler',
      optional: true,
      classes: [
        {
          class: 'string'
        },
        {
          class: 'array',
          classes: [
            {
              class: 'statement'
            },
          ]
        },
      ],
      _thisNode: {
        condition: '!data || typeof data === "string"',
        input: 'js/statement',
      },
      _childNode: {},
    },
    {
      name: 'error',
      desc: 'Error Handler',
      optional: true,
      classes: [
        {
          class: 'string'
        },
        {
          class: 'array',
          classes: [
            {
              class: 'statement'
            },
          ]
        },
      ],
      _thisNode: {
        condition: '!data || typeof data === "string"',
        input: 'js/statement',
      },
      _childNode: {},
    },
  ]
}

export default appx_api
