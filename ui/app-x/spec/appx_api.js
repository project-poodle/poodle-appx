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
  children: [
    {
      name: 'namespace',
      desc: 'Namespace',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: 'input/text',
      },
    },
    {
      name: 'app_name',
      desc: 'App Name',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode:{
        types: 'inherit',
        input: 'input/text',
      },
    },
    {
      name: 'method',
      desc: 'Method',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
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
    },
    {
      name: 'endpoint',
      desc: 'Endpoint',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: 'input/text',
      },
    },
    {
      name: 'data',
      desc: 'Data',
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'class',
          data: 'expression'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: 'input/expression',
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'expression'
          },
        ],
        class: 'expression',
      },
    },
    {
      name: 'init',
      desc: 'Init Code',
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'class',
          data: 'statement'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: 'input/statement'
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'statement'
          },
        ],
      },
    },
    {
      name: 'result',
      desc: 'Result Handler',
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'class',
          data: 'statement'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: 'input/statement'
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'statement'
          },
        ],
        class: 'statement',
      },
    },
    {
      name: 'error',
      desc: 'Error Handler',
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'class',
          data: 'statement'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: 'input/statement'
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'statement'
          },
        ],
        class: 'statement',
      },
    },
  ]
}

export default appx_api
