import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: appx/api                                    (~statement)
// namespace:                # namespace             (:string|:expression)
// app_name:                 # app_name              (:string|:expression)
// method:                   # get, post, put, etc   (:string|:expression)
// endpoint:                 # endpoint              (:string|:expression)
// endpointParams:           # endpoint params       (:string|:object)
// data:                     # api data              (:expression)         - for post, put, patch
// resultHandler:            # result handler        (:string|:js/function)
// errorHandler:             # error handler         (:string|:js/function)
export const appx_api = {

  type: 'appx/api',
  desc: 'API',
  template: {
    kind: 'custom',
    stmt: ' \
      ( \
        ( \
          namespace,  \
          app_name, \
          method, \
          endpoint, \
          endpointParams, \
          data, \
          resultHandler,  \
          errorHandler, \
        ) => {  \
          $I("app-x/api.request")(  \
            namespace,  \
            app_name, \
            { \
              method: method, \
              endpoint: endpoint, \
              endpointParams: endpointParams, \
              data: data, \
            },  \
            resultHandler,  \
            errorHandler, \
          ) \
        } \
      ) \
      ( \
        $namespace, \
        $app_name,  \
        $method,  \
        $endpoint,  \
        $endpointParams,  \
        $data,  \
        $resultHandler,  \
        $errorHandler, \
      ) \
    ',
  },
  _expand: true,
  _effects: [
    {
      context: [ "add", "move", "editor" ],
      data: [
        '(() => { if (["post", "put", "patch"].includes(form.getValues("method"))) states.setHidden("data", false) })()',
        '(() => { if (!(["post", "put", "patch"].includes(form.getValues("method")))) states.setHidden("data", true) })()',
      ]
    },
  ],
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
        input: {
          kind: 'input/text',
          options: 'validation.valid_namespaces()',
          optionsOnly: true,
        },
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
        input: {
          kind: 'input/text',
          options: 'validation.valid_app_names()',
          optionsOnly: true,
        },
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
        input: {
          kind: 'input/select',
          options: 'validation.valid_api_methods()',
          optionsOnly: true,
        },
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
        input: {
          kind: 'input/text',
          options: 'validation.valid_api_endpoints()',
          optionsOnly: false,
        },
      },
    },
    {
      name: 'endpointParams',
      desc: 'Endpoint Parameters',
      types: [
        {
          kind: 'class',
          data: 'object'
        },
      ],
      _childNode: {
        types: 'inherit',
        input: {
          kind: 'input/properties'
        }
      },
    },
    {
      name: 'data',
      desc: 'Data',
      types: [
        {
          kind: 'class',
          data: 'string',
          parse: true,
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
        input: {
          kind: 'input/expression',
        },
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'expression'
          },
        ],
      },
    },
    {
      name: 'resultHandler',
      desc: 'Result Handler',
      types: [
        {
          kind: 'class',
          data: 'string',
          parse: true,
        },
        {
          kind: 'type',
          data: 'js/function',
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: {
          kind: 'input/expression',
        },
      },
      _childNode: {
        types: [
          {
            kind: 'type',
            data: 'js/function',
          },
        ],
      },
    },
    {
      name: 'errorHandler',
      desc: 'Error Handler',
      types: [
        {
          kind: 'class',
          data: 'string',
          parse: true,
        },
        {
          kind: 'type',
          data: 'js/function',
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: {
          kind: 'input/expression',
        },
      },
      _childNode: {
        types: [
          {
            kind: 'type',
            data: 'js/function',
          },
        ],
      },
    },
  ]
}

export default appx_api
