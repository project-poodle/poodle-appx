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
      required: true,
      classes: [
        {
          class: 'string'
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/text',
      },
    },
    {
      name: 'app_name',
      desc: 'App Name',
      required: true,
      classes: [
        {
          class: 'string'
        },
      ],
      _thisNode:{
        class: 'string',
        input: 'input/text',
      },
    },
    {
      name: 'method',
      desc: 'Method',
      required: true,
      classes: [
        {
          class: 'string'
        },
      ],
      _thisNode: {
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
    },
    {
      name: 'endpoint',
      desc: 'Endpoint',
      required: true,
      classes: [
        {
          class: 'string'
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/text',
      },
    },
    {
      name: 'data',
      desc: 'Data',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'expression'
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/expression',
      },
      _childNode: {
        class: 'expression',
      },
    },
    {
      name: 'init',
      desc: 'Init Code',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'statement',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/statement'
      },
      _childNode: {
        class: 'statement',
      },
    },
    {
      name: 'result',
      desc: 'Result Handler',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'statement',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/statement'
      },
      _childNode: {
        class: 'statement',
      },
    },
    {
      name: 'error',
      desc: 'Error Handler',
      classes: [
        {
          class: 'string'
        },
        {
          class: 'statement',
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/statement'
      },
      _childNode: {
        class: 'statement',
      },
    },
  ]
}

export default appx_api
