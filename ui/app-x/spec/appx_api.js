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
        {
          class: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Namespace is required',
        },
      ],
      _inputs: [
        {
          input: 'js/string'
        },
      ],
    },
    {
      name: 'app_name',
      desc: 'App Name',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'App name is required',
        },
      ],
      _inputs: [
        {
          input: 'js/string'
        }
      ],
    },
    {
      name: 'method',
      desc: 'Method',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Method is required',
        },
      ],
      _inputs: [
        {
          input: 'js/string'
        }
      ],
    },
    {
      name: 'endpoint',
      desc: 'Endpoint',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Endpoint is required',
        },
      ],
      _inputs: [
        {
          input: 'js/string'
        }
      ],
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
      _inputs: [
        {
          input: 'js/expression'
        },
        {
          input: 'js/child'
        },
      ],
      _child: {},
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
      _inputs: [
        {
          input: 'js/statement'
        },
        {
          input: 'js/child'
        },
      ],
      _child: {},
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
      _inputs: [
        {
          input: 'js/statement'
        },
        {
          input: 'js/child'
        },
      ],
      _child: {},
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
      _inputs: [
        {
          input: 'js/statement'
        },
        {
          input: 'js/child'
        },
      ],
      _child: {},
    },
  ]
}

export default appx_api
