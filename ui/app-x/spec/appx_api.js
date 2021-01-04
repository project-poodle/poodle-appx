import {
  REGEX_VAR,
  types
} from 'app-x/spec/types'

// type: appx/api                                    (~statement)
// namespace:                # namespace             (:string|:expression)
// app_name:                 # app_name              (:string|:expression)
// method:                   # get, post, put, etc   (:string|:expression)
// endpoint:                 # endpoint              (:string|:expression) - autosuggest
// data:                     # api data              (:expression)         - for post, put, patch
// prep:                     # prep code             (:string|:array<:statement>)
// result:                   # result code           (:string|:array<:statement>)
// error:                    # error code            (:string|:array<:statement>)
const appx_api = {

  name: 'appx/api',
  desc: 'API',
  types: [
    {
      type: 'statement',
    }
  ],
  _group: 'appx',
  children: [
    {
      name: 'namespace',
      desc: 'Namespace',
      types: [
        {
          type: 'js/string'
        },
        {
          type: 'expression'
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
      types: [
        {
          type: 'js/string'
        },
        {
          type: 'expression'
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
      types: [
        {
          type: 'js/string'
        },
        {
          type: 'expression'
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
      types: [
        {
          type: 'js/string'
        },
        {
          type: 'expression'
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
      types: [
        {
          type: 'expression'
        },
      ],
    },
    {
      name: 'filterr',
      desc: 'Filter',
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
    },
    {
      name: 'init',
      desc: 'Initial Code',
      types: [
        {
          type: 'string'
        },
        {
          type: 'array',
          types: [
            {
              type: 'statement'
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
      types: [
        {
          type: 'string'
        },
        {
          type: 'array',
          types: [
            {
              type: 'statement'
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
      types: [
        {
          type: 'string'
        },
        {
          type: 'array',
          types: [
            {
              type: 'statement'
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
