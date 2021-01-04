import {
  REGEX_VAR,
  kinds
} from 'app-x/spec/kinds.js'

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
  kinds: [
    {
      kind: 'statement',
    }
  ],
  _group: 'appx',
  children: [
    {
      name: 'namespace',
      desc: 'Namespace',
      kinds: [
        {
          kind: 'js/string'
        },
        {
          kind: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Namespace is required',
        },
      ],
      _variants: [
        {
          variant: 'js/string'
        },
      ],
    },
    {
      name: 'app_name',
      desc: 'App Name',
      kinds: [
        {
          kind: 'js/string'
        },
        {
          kind: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'App name is required',
        },
      ],
      _variants: [
        {
          variant: 'js/string'
        }
      ],
    },
    {
      name: 'method',
      desc: 'Method',
      kinds: [
        {
          kind: 'js/string'
        },
        {
          kind: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Method is required',
        },
      ],
      _variants: [
        {
          variant: 'js/string'
        }
      ],
    },
    {
      name: 'endpoint',
      desc: 'Endpoint',
      kinds: [
        {
          kind: 'js/string'
        },
        {
          kind: 'expression'
        },
      ],
      rules: [
        {
          kind: 'required',
          required: true,
          message: 'Endpoint is required',
        },
      ],
      _variants: [
        {
          variant: 'js/string'
        }
      ],
    },
    {
      name: 'data',
      desc: 'Data',
      kinds: [
        {
          kind: 'expression'
        },
      ],
    },
    {
      name: 'filterr',
      desc: 'Filter',
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
    },
    {
      name: 'init',
      desc: 'Initial Code',
      kinds: [
        {
          kind: 'string'
        },
        {
          kind: 'array',
          kinds: [
            {
              kind: 'statement'
            }
          ]
        },
      ],
      _variants: [
        {
          variant: 'js/statement'
        }
      ],
    },
    {
      name: 'result',
      desc: 'Result Handler',
      kinds: [
        {
          kind: 'string'
        },
        {
          kind: 'array',
          kinds: [
            {
              kind: 'statement'
            }
          ]
        },
      ],
      _variants: [
        {
          variant: 'js/statement'
        }
      ],
    },
    {
      name: 'error',
      desc: 'Error Handler',
      kinds: [
        {
          kind: 'string'
        },
        {
          kind: 'array',
          kinds: [
            {
              kind: 'statement'
            }
          ]
        },
      ],
      _variants: [
        {
          variant: 'js/statement'
        }
      ],
    },
  ]
}

export default appx_api
