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

  type: 'appx/api',
  desc: 'API',
  classes: [
    'statement',
  ],
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
      _thisNode: [
        {
          class: 'string',
          input: 'input/text',
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
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'App name is required',
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/text',
        },
      ],
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
      _thisNode: [
        {
          class: 'string',
          input: 'input/text',
          options: [
            "get",
            "post",
            "put",
            "delete",
            "head",
            "patch",
          ]
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
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Endpoint is required',
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/text',
        },
      ],
    },
    {
      name: 'data',
      desc: 'Data',
      optional: true,
      classes: [
        {
          class: 'string'
        },
        {
          class: 'expression'
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/expression',
        },
      ],
      _childNode: [
        {
          class: 'expression',
        }
      ],
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
          class: 'statement',
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/statement'
        }
      ],
      _childNode: [
        {
          class: 'statement',
        }
      ]
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
          class: 'statement',
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/statement'
        }
      ],
      _childNode: [
        {
          class: 'statement',
        }
      ]
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
          class: 'statement',
        },
      ],
      _thisNode: [
        {
          class: 'string',
          input: 'input/statement'
        }
      ],
      _childNode: [
        {
          class: 'statement',
        }
      ]
    },
  ]
}

export default appx_api
