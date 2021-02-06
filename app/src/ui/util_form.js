const { parse, parseExpression } = require('@babel/parser')
const generate = require('@babel/generator').default
const t = require("@babel/types")
const {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  SPECIAL_CHARACTER,
  CONTEXT_JSX,
  INPUT_REQUIRED,
  TOKEN_IMPORT,
  TOKEN_LOCAL,
  TOKEN_JSX,
  isPrimitive,
  capitalize,
  reg_js_import,
  reg_js_variable,
  reg_react_form,
  js_resolve_ids,
  _js_parse_snippet,
  _js_parse_statements,
  _js_parse_expression,
  _parse_var_full_path,
  lookup_type_for_data,
  type_matches_spec,
  data_matches_spec,
  check_input_data,
} = require('./util_base')

const REACT_FORM_METHODS = [
  'register',
  'unregister',
  'errors',
  'watch',
  'handleSubmit',
  'reset',
  'setError',
  'clearErrors',
  'setValue',
  'getValues',
  'trigger',
  'control',
  'formState',
]

const REACT_FORM_ARRAY_METHODS = [
  'fields',
  'append',
  'prepend',
  'insert',
  'swap',
  'move',
  'remove'
]

const VALID_INPUT_TYPES = [
  'text',
  'number',
  'password',
  'email',
  'tel',
  'url',
  'search',
  'date',
  'time',
  'datetime-local'
]


////////////////////////////////////////////////////////////////////////////////
// create react/form ast
function react_form(js_context, ref, input) {

  // require here to avoid circular require reference
  const { js_process, react_element_style } = require('./util_code')

  if (!('_type' in input) || input._type !== 'react/form') {
    throw new Error(`ERROR: input._type is not [react/form] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!input.name) {
    throw new Error(`ERROR: input.name not set in [react/form] [${JSON.stringify(input)}]`)
  }

  // establish scope
  const scope = `${js_context.CONTEXT_SCOPE}.form.${input.name}`
  js_context = {
    ...js_context,
    CONTEXT_SCOPE: scope,
  }

  // formProps expression
  const formProps = (() => {
    if (!!input.formProps) {
      return t.objectExpression(
        Object.keys(input.formProps)
          .map(key => (
            t.objectProperty(
              t.identifier(key),
              js_process(
                {
                  ...js_context,
                  CONTEXT_JSX: false,
                },
                null,
                input.formProps[key]
              )
            )
          )
        )
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

  // process style
  const styleExpression = (() => {
    if (!!input.style) {
      const style = react_element_style(
        {
          ...js_context,
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        input.style
      )
      return style
    } else {
      return t.objectExpression(
        []
      )
    }
  })()

  // register import
  reg_js_import(js_context, 'react-hook-form.useForm')
  reg_js_import(js_context, 'react-hook-form.FormProvider')
  // register react hook form with [input.name]
  // const qualifiedName = `react-hook-form.useForm.${input.name}`
  // reg_js_variable(js_context, qualifiedName)
  // register form
  // reg_react_form(js_context, input.name, qualifiedName, formProps)
  // console.log(`js_context.reactForm`, js_context.reactForm)
  // register variables
  const qualifiedName = `react-hook-form.useForm`
  REACT_FORM_METHODS.map(method => {
    reg_js_variable(js_context, `${qualifiedName}.${method}`)
  })

  //////////////////////////////////////////////////////////////////////
  // start processing after reg_react_form
  const onSubmitStatements = (() => {
    if (!!input.onSubmit) {
      if (isPrimitive(input.onSubmit)) {
        return t.blockStatement(
          _js_parse_statements(js_context, input.onSubmit, {
            plugins: [
              'jsx', // support jsx
            ]
          })
        )
      } else {
        return js_process(
          {
            ...js_context,
            CONTEXT_JSX: false,
          },
          null,
          input.onSubmit
        )
      }
    } else {
      return t.blockStatement([])
    }
  })()

  const onErrorStatements = (() => {
    if (!!input.onError) {
      if (isPrimitive(input.onError)) {
        return t.blockStatement(
          _js_parse_statements(js_context, input.onError, {
            plugins: [
              'jsx', // support jsx
            ]
          })
        )
      } else {
        return js_process(
          {
            ...js_context,
            CONTEXT_JSX: false,
          },
          null,
          input.onError
        )
      }
    } else {
      return t.blockStatement([])
    }
  })()

  // props expression
  const props = (() => {
    if (!!input.props) {
      return t.objectExpression(
        Object.keys(input.props)
          .map(key => (
            t.objectProperty(
              t.identifier(key),
              js_process(
                {
                  ...js_context,
                  CONTEXT_JSX: false,
                },
                null,
                input.props[key]
              )
            )
          )
        )
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })

  // process children
  const children_elements = (() => {
    if (!!input.children) {
      return input.children.map(child => (
        js_process(
          {
            ...js_context,
            CONTEXT_JSX: true,
          },
          null,
          child
        )
      ))
    } else {
      // return []
      return []
    }
  })()

  // result element
  const resultElement = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier('react-hook-form.FormProvider'),
      // add all hook form methods
      REACT_FORM_METHODS.map(method => (
        t.jSXAttribute(
          t.jSXIdentifier(method),
          t.jSXExpressionContainer(
            t.identifier(`${qualifiedName}.${method}`)
          )
        )
      ))
    ),
    t.jSXClosingElement(
      t.jSXIdentifier('react-hook-form.FormProvider'),
    ),
    [
      t.jSXElement(
        t.jSXOpeningElement(
          t.jSXIdentifier('form'),
          [
            // {...props}
            t.jSXSpreadAttribute(
              t.identifier('props')
            ),
            // onSubmit={handleSubmit(onSubmit, onError)}
            t.jSXAttribute(
              t.jSXIdentifier('onSubmit'),
              t.jSXExpressionContainer(
                t.callExpression(
                  t.identifier(`${qualifiedName}.handleSubmit`),
                  [
                    t.arrowFunctionExpression(
                      [
                        t.identifier('data')
                      ],
                      onSubmitStatements,
                    ),
                    t.arrowFunctionExpression(
                      [
                        t.identifier('error')
                      ],
                      onErrorStatements,
                    )
                  ]
                )
              )
            ),
            t.jSXAttribute(
              t.jSXIdentifier('style'),
              t.jSXExpressionContainer(
                styleExpression
              )
            )
          ]
        ),
        t.jSXClosingElement(
          t.jSXIdentifier('form')
        ),
        children_elements
      )
    ]
  )

  // return
  return resultElement
}

////////////////////////////////////////////////////////////////////////////////
// create input/text ast
function input_text(js_context, ref, input) {

  // require here to avoid circular require reference
  const { js_process, react_element_style } = require('./util_code')

  if (!('_type' in input) || input._type !== 'input/text') {
    throw new Error(`ERROR: input._type is not [input/text] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!input.name) {
    throw new Error(`ERROR: input.name not set in [input/text] [${JSON.stringify(input)}]`)
  }

  if (!!input.array) {
    return input_text_array(js_context, ref, input)
  }

  //////////////////////////////////////////////////////////////////////
  // process form context and reg_react_form before processing others
  // check for js_context.reactForm exist
  if (!(js_context.reactForm)) {
    // console.log(`reg_js_import`, `react-hook-form.useFormContext`)
    reg_js_import(js_context, `react-hook-form.useFormContext`)
  }
  // qualified name
  const qualifiedName = !!(js_context.reactForm)
    ? `react-hook-form.useForm.${js_context.reactForm}`
    : `react-hook-form.useFormContext`
  // console.log(`js_context.reactForm`, js_context.reactForm, qualifiedName)
  // if js_context.reactForm is not already set, register empty string
  if (!js_context.reactForm) {
    reg_react_form(js_context, '', qualifiedName, null)
  }
  // register variables, no import needed
  REACT_FORM_METHODS.map(method => {
    reg_js_variable(js_context, `${qualifiedName}.${method}`)
  })

  //////////////////////////////////////////////////////////////////////
  // start processing after reg_react_form
  // process name
  const nameExpression = (() => {
    if (isPrimitive(input.name)) {
      return t.stringLiteral(String(input.name))
    } else {
      throw new Error(`ERROR: [input/text] input.name is not string [${JSON.stringify(input.name)}]`)
    }
  })()

  // process main props
  const props = input.props || {}
  // basic types - extension not supported
  // multiline and autoSuggest options
  const required = !!input.required
  const multiline = !!props.multiline || false
  const autoSuggest = !!props.autoSuggest || false
  // check valid input types
  const inputType = (() => {
    if (!!props.type && VALID_INPUT_TYPES.includes(props.type.toLowerCase()))
    {
      return props.type.toLowerCase()
    }
    else
    {
      return 'text'
    }
  })()

  // process style
  const styleExpression = (() => {
    if (!!input.style) {
      const style = react_element_style(
        {
          ...js_context,
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        input.style
      )
      return style
    } else {
      return t.objectExpression(
        []
      )
    }
  })()

  // default value
  const defaultValueExpression = (() => {
    if (!!props.defaultValue) {
      if (isPrimitive(props.defaultValue)) {
        return t.stringLiteral(String(props.defaultValue))
      } else {
        return js_process(
          {
            ...js_context,
            CONTEXT_JSX: false,
          },
          null,
          props.defaultValue
        )
      }
    } else {
      return t.stringLiteral('')
    }
  })()
  js_context.parsed['props.defaultValue'] = defaultValueExpression

  // compute props
  const propsExpression = (() => {
    if (!!input.props) {
      return js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
        },
        null,
        input.props
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

  // compute rules
  const required_desc = !!input.props.label && isPrimitive(input.props.label) ? String(input.props.label) : input.name
  const rulesExpression = (() => {
    if (!!input.rules) {
      return js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
          INPUT_REQUIRED: !!input.required ? required_desc : false
        },
        null,
        input.rules
      )
    } else if (!!input.required) {
      return t.objectExpression(
        [
          t.objectProperty(
            t.stringLiteral('required'),
            t.stringLiteral(`${required_desc} is required`)
          )
        ]
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()


  //////////////////////////////////////////////////////////////////////
  // TextField
  let innerElement = `
    <$J $I='@material-ui/core.TextField'
      // {...restProps}
      name={name}
      type="${inputType}"
      size={props.size}
      required={${required}}
      style={{width:'100%'}}
      multiline={!!props.multiline}
      value={innerProps.value}
      onChange={e => {
        innerProps.onChange(e.target.value)
        if (!!props.callback) {
          props.callback(e.target.value)
        }
      }}
      error={!!$I('lodash.default').get($L('${qualifiedName}.errors'), name)}
      helperText={$I('lodash.default').get($L('${qualifiedName}.errors'), name)?.message}
      >
    </$J>
  `

  //////////////////////////////////////////////////////////////////////
  // if autoSuggest
  if (!!props.autoSuggest) {
    innerElement = `
      (() => {
        const [ _searchSuggestions, _setSearchSuggestions ] = $I('react.useState')(props.options)
        return (
          <$J $I='antd.AutoComplete'
            name={name}
            style={{width:'100%'}}
            options={_searchSuggestions}
            value={innerProps.value}
            onChange={data => {
              innerProps.onChange(data)
              if (!!props.callback) {
                props.callback(data)
              }
            }}
            onSearch={s => {
              const s_list = s.toUpperCase().split(' ').filter(s => !!s)
              const matches = props.options
                .filter(option => {
                  const upper = option?.value.toUpperCase()
                  return s_list.reduce((accumulator, item) => {
                    return !!accumulator && upper.includes(item)
                  }, true)
                })
              _setSearchSuggestions(matches)
            }}
            >
            {
              ${innerElement}
            }
          </$J>
        )
      })()
    `
  }

  //////////////////////////////////////////////////////////////////////
  // control element
  const controlElement = `
    <$J $I='react-hook-form.Controller'
      key={name}
      name={name}
      required={${required}}
      constrol={$L('${qualifiedName}.control')}
      defaultValue={$P('props.defaultValue')}
      rules={rules}
      render={innerProps => (
        <$J $I='@material-ui/core.Box'
          style={style}
          {...restProps}
          >
          <$J $I='@material-ui/core.FormControl'
            style={{width:'100%'}}
            error={!!$I('lodash.default').get($L('${qualifiedName}.errors'), name)}
            >
            {
              !!props?.label
              &&
              (
                <$J $I='@material-ui/core.Box'
                  style={{width: '100%', paddingBottom: '16px'}}
                  >
                  <$J $I='@material-ui/core.InputLabel'
                    key="label"
                    shrink={true}
                    required={${required}}
                  >
                    { props.label }
                  </$J>
                </$J>
              )
            }
            {
              ${innerElement}
            }
          </$J>
        </$J>
      )}
    >
    </$J>
  `

  //////////////////////////////////////////////////////////////////////
  const result = t.callExpression(
    _js_parse_expression(
      js_context,
      `
      (name, props, style, rules) => {
        // destruct props
        const {
          type,
          label,
          defaultValue,
          multiline,
          autoSuggest,
          options,
          callback,
          ...restProps
        } = props
        // return
        return (
          ${controlElement}
        )
      }
      `,
      {
        plugins: [
          'jsx', // support jsx here
        ]
      }
    ),
    [
      nameExpression,
      propsExpression,
      styleExpression,
      rulesExpression,
    ]
  )

  //////////////////////////////////////////////////////////////////////
  // check for CONTEXT_JSX and return
  if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      result
    )
  } else {
    return result
  }
}

////////////////////////////////////////////////////////////////////////////////
// create input/text [array] ast
function input_text_array(js_context, ref, input) {

  // require here to avoid circular require reference
  const { js_process, react_element_style } = require('./util_code')

  if (!('_type' in input) || input._type !== 'input/text') {
    throw new Error(`ERROR: input._type is not [input/text] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!input.name) {
    throw new Error(`ERROR: input.name not set in [input/text] [${JSON.stringify(input)}]`)
  }

  if (!input.array) {
    throw new Error(`ERROR: input.array not set [input/text - array] [${JSON.stringify(input)}]`)
  }

  //////////////////////////////////////////////////////////////////////
  // process form context and reg_react_form before processing others
  // check for js_context.reactForm exist
  if (!(js_context.reactForm)) {
    // console.log(`reg_js_import`, `react-hook-form.useFormContext`)
    reg_js_import(js_context, `react-hook-form.useFormContext`)
  }
  // qualified name
  const qualifiedName = !!(js_context.reactForm)
    ? `react-hook-form.useForm.${js_context.reactForm}`
    : `react-hook-form.useFormContext`
  // console.log(`js_context.reactForm`, js_context.reactForm, qualifiedName)
  // if js_context.reactForm is not already set, register empty string
  if (!js_context.reactForm) {
    reg_react_form(js_context, '', qualifiedName, null)
  }
  // register import
  // register variables, no import needed
  REACT_FORM_METHODS.map(method => {
    reg_js_variable(js_context, `${qualifiedName}.${method}`)
  })
  // import useFieldArray
  // reg_js_import(js_context, 'react-hook-form.useFieldArray')
  // register field array variables
  // REACT_FORM_ARRAY_METHODS.map(method => {
  //   reg_js_variable(js_context, `${qualifiedName}.useFieldArray.${input.name}.${method}`)
  // })

  //////////////////////////////////////////////////////////////////////
  // start processing after reg_react_form
  // process name
  const nameExpression = (() => {
    if (isPrimitive(input.name)) {
      return t.stringLiteral(String(input.name))
    } else {
      throw new Error(`ERROR: [input/text] input.name is not string [${JSON.stringify(input.name)}]`)
    }
  })()

  // process main props
  const props = input.props || {}
  // basic types - extension not supported
  // multiline and autoSuggest options
  const required = !!input.required
  const multiline = !!props.multiline || false
  const autoSuggest = !!props.autoSuggest || false
  // check valid input types
  const inputType = (() => {
    if (!!props.type && VALID_INPUT_TYPES.includes(props.type.toLowerCase()))
    {
      return props.type.toLowerCase()
    }
    else
    {
      return 'text'
    }
  })()

  // compute props
  const propsExpression = (() => {
    if (!!input.props) {
      return js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
        },
        null,
        input.props
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

  // process style
  const styleExpression = (() => {
    if (!!input.style) {
      const style = react_element_style(
        {
          ...js_context,
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        input.style
      )
      return style
    } else {
      return t.objectExpression(
        []
      )
    }
  })()

  // compute rules
  const required_desc = !!input.props.label && isPrimitive(input.props.label) ? String(input.props.label) : input.name
  const rulesExpression = (() => {
    if (!!input.rules) {
      return js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
          INPUT_REQUIRED: !!input.required ? required_desc : false
        },
        null,
        input.rules
      )
    } else if (!!input.required) {
      return t.objectExpression(
        [
          t.objectProperty(
            t.stringLiteral('required'),
            t.stringLiteral(`${required_desc} is required`)
          )
        ]
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

  //////////////////////////////////////////////////////////////////////
  // innerElement
  let innerElement = `
    <$J $I='@material-ui/core.TextField'
      // {...restProps}
      name={\`\${name}[\${index}].value\`}
      type="${inputType}"
      required={${required}}
      size={props.size}
      style={{width:'100%'}}
      multiline={!!props.multiline}
      value={innerProps.value}
      onChange={e => {
        innerProps.onChange(e.target.value)
        if (!!props.callback) {
          props.callback(e.target.value)
        }
      }}
      error={!!$I('lodash.default').get($L('${qualifiedName}.errors'), \`\${name}[\${index}].value\`)}
      helperText={$I('lodash.default').get($L('${qualifiedName}.errors'), \`\${name}[\${index}].value\`)?.message}
      >
    </$J>
  `

  //////////////////////////////////////////////////////////////////////
  // if autoSuggest
  if (!!props.autoSuggest) {
    innerElement = `
      (() => {
        const [ _searchSuggestions, _setSearchSuggestions ] = $I('react.useState')(props.options)
        return (
          <$J $I='antd.AutoComplete'
            options={_searchSuggestions}
            name={\`\${name}[\${index}].value\`}
            value={innerProps.value}
            onChange={data => {
              innerProps.onChange(data)
              if (!!props.callback) {
                props.callback(data)
              }
            }}
            onSearch={s => {
              const s_list = s.toUpperCase().split(' ').filter(s => !!s)
              const matches = props.options
                .filter(option => {
                  const upper = option?.value.toUpperCase()
                  return s_list.reduce((accumulator, item) => {
                    return !!accumulator && upper.includes(item)
                  }, true)
                })
              _setSearchSuggestions(matches)
            }}
            >
            {
              ${innerElement}
            }
          </$J>
        )
      })()
    `
  }

  //////////////////////////////////////////////////////////////////////
  // control element
  const controlElement = `
    <$J $I='@material-ui/core.Box'
      {...restProps}
      style={style}
      >
      {
        !!props?.label
        &&
        (
          <$J $I='@material-ui/core.InputLabel'
            key="label"
            shrink={true}
            required={${required}}
          >
            { props.label }
          </$J>
        )
      }
      {
        // $L('${qualifiedName}.useFieldArray.${input.name}.fields')
        fields
          .map((item, index) => {
            return (
              <$J $I='@material-ui/core.Box'
                key={item.id}
                display="flex"
                style={{width:'100%'}}
              >
                <$J $I='react-hook-form.Controller'
                  key={item.id}
                  name={\`\${name}[\${index}].value\`}
                  constrol={$L('${qualifiedName}.control')}
                  required={${required}}
                  defaultValue={item.value}
                  rules={rules}
                  render={innerProps => (
                    <$J $I='@material-ui/core.FormControl'
                      style={{width:'100%'}}
                      error={!!$I('lodash.default').get($L('${qualifiedName}.errors'), name)}
                      >
                      {
                        ${innerElement}
                      }
                    </$J>
                  )}
                >
                </$J>
                {
                  !props.readOnly
                  &&
                  (
                    <$J $I='@material-ui/core.Box'
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      >
                      <$J $I='@material-ui/core.IconButton'
                        key="remove"
                        aria-label="Remove"
                        size={props.size}
                        onClick={e => {
                          remove(index)
                          if (!!props.callback) {
                            props.callback(index, \`\${name}[\${index}]\`)
                          }
                        }}
                        >
                        <$J $I='@material-ui/icons.RemoveCircleOutline' />
                      </$J>
                    </$J>
                  )
                }
              </$J>
            )
          })
      }
      {
        !props.readOnly
        &&
        (
          <$J $I='@material-ui/core.IconButton'
            key="add"
            aria-label="Add"
            size={props.size}
            onClick={e => {
              append({
                value: '',
              })
              // if (!!props.callback) {
              //   props.callback('', name, 'add')
              // }
            }}
            >
            <$J $I='@material-ui/icons.AddCircleOutline' />
          </$J>
        )
      }
    </$J>
  `

  //////////////////////////////////////////////////////////////////////
  const result = t.callExpression(
    _js_parse_expression(
      js_context,
      `
      (name, props, style, rules) => {
        // setup field arrays
        const {
          fields,
          append,
          prepend,
          insert,
          swap,
          move,
          remove,
        } = $I('react-hook-form.useFieldArray') ({
          control: $L('${qualifiedName}.control'),
          name: name,
        })
        // destruct props
        const {
          type,
          label,
          defaultValue,
          multiline,
          autoSuggest,
          options,
          callback,
          ...restProps
        } = props
        // set value
        $I('react.useEffect')(() => {
          $L('${qualifiedName}.setValue')(name, props.defaultValue || [])
        }, [])
        // return
        return (
          ${controlElement}
        )
      }
      `,
      {
        plugins: [
          'jsx', // support jsx here
        ]
      }
    ),
    [
      nameExpression,
      propsExpression,
      styleExpression,
      rulesExpression,
    ]
  )

  //////////////////////////////////////////////////////////////////////
  // check for CONTEXT_JSX and return
  if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      result
    )
  } else {
    return result
  }
}

////////////////////////////////////////////////////////////////////////////////
// create input/switch ast
function input_switch(js_context, ref, input) {

  // require here to avoid circular require reference
  const { js_process, react_element_style } = require('./util_code')

  if (!('_type' in input) || input._type !== 'input/switch') {
    throw new Error(`ERROR: input._type is not [input/switch] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!input.name) {
    throw new Error(`ERROR: input.name not set in [input/switch] [${JSON.stringify(input)}]`)
  }

  //////////////////////////////////////////////////////////////////////
  // process form context and reg_react_form before processing others
  // check for js_context.reactForm exist
  if (!(js_context.reactForm)) {
    // console.log(`reg_js_import`, `react-hook-form.useFormContext`)
    reg_js_import(js_context, `react-hook-form.useFormContext`)
  }
  // qualified name
  const qualifiedName = !!(js_context.reactForm)
    ? `react-hook-form.useForm.${js_context.reactForm}`
    : `react-hook-form.useFormContext`
  // console.log(`js_context.reactForm`, js_context.reactForm, qualifiedName)
  // if js_context.reactForm is not already set, register empty string
  if (!js_context.reactForm) {
    reg_react_form(js_context, '', qualifiedName, null)
  }
  // register variables, no import needed
  REACT_FORM_METHODS.map(method => {
    reg_js_variable(js_context, `${qualifiedName}.${method}`)
  })

  //////////////////////////////////////////////////////////////////////
  // start processing after reg_react_form
  // process name
  const nameExpression = (() => {
    if (isPrimitive(input.name)) {
      return t.stringLiteral(String(input.name))
    } else {
      throw new Error(`ERROR: [input/text] input.name is not string [${JSON.stringify(input.name)}]`)
    }
  })()

  // process main props
  const props = input.props || {}
  // basic types - extension not supported
  // multiline and autoSuggest options
  const required = !!input.required

  // process style
  const styleExpression = (() => {
    if (!!input.style) {
      const style = react_element_style(
        {
          ...js_context,
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        input.style
      )
      return style
    } else {
      return t.objectExpression(
        []
      )
    }
  })()

  // default value
  const defaultValueExpression = (() => {
    if (!!props.defaultValue) {
      if (isPrimitive(props.defaultValue)) {
        return t.stringLiteral(String(props.defaultValue))
      } else {
        return js_process(
          {
            ...js_context,
            CONTEXT_JSX: false,
          },
          null,
          props.defaultValue
        )
      }
    } else {
      return t.booleanLiteral(false)
    }
  })()
  js_context.parsed['props.defaultValue'] = defaultValueExpression

  // compute props
  const propsExpression = (() => {
    if (!!input.props) {
      return js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
        },
        null,
        input.props
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

  // compute rules
  const required_desc = !!input.props.label && isPrimitive(input.props.label) ? String(input.props.label) : input.name
  const rulesExpression = (() => {
    if (!!input.rules) {
      return js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
          INPUT_REQUIRED: !!input.required ? required_desc : false
        },
        null,
        input.rules
      )
    } else if (!!input.required) {
      return t.objectExpression(
        [
          t.objectProperty(
            t.stringLiteral('required'),
            t.stringLiteral(`${required_desc} is required`)
          )
        ]
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()


  //////////////////////////////////////////////////////////////////////
  // TextField
  let innerElement = `
    <$J $I='@material-ui/core.Switch'
      // {...restProps}
      name={name}
      // style={{width:'100%'}}
      checked={innerProps.value}
      size={props.size}
      onChange={e => {
        innerProps.onChange(e.target.checked)
        if (!!props.callback) {
          props.callback(e.target.checked)
        }
      }}
      // error={!!$I('lodash.default').get($L('${qualifiedName}.errors'), name)}
      // helperText={$I('lodash.default').get($L('${qualifiedName}.errors'), name)?.message}
      >
    </$J>
  `

  //////////////////////////////////////////////////////////////////////
  // control element
  const controlElement = `
    <$J $I='react-hook-form.Controller'
      key={name}
      name={name}
      required={${required}}
      constrol={$L('${qualifiedName}.control')}
      defaultValue={$P('props.defaultValue')}
      rules={rules}
      render={innerProps => (
        <$J $I='@material-ui/core.Box'
          {...restProps}
          style={style}
          >
          <$J $I='@material-ui/core.FormControl'
            style={{width:'100%'}}
            error={!!$I('lodash.default').get($L('${qualifiedName}.errors'), name)}
            >
            {
              !!props?.label
              &&
              (
                <$J $I='@material-ui/core.Box'
                  style={{width: '100%', paddingBottom: '16px'}}
                  >
                  <$J $I='@material-ui/core.InputLabel'
                    key="label"
                    shrink={true}
                    required={${required}}
                  >
                    { props.label }
                  </$J>
                </$J>
              )
            }
            {
              ${innerElement}
            }
            {
              !!$I('lodash.default').get($L('${qualifiedName}.errors'), name)
              &&
              <$J $I='@material-ui/core.FormHelperText'>
                {
                  $I('lodash.default').get($L('${qualifiedName}.errors'), name)?.message
                }
              </$J>
            }
          </$J>
        </$J>
      )}
    >
    </$J>
  `

  //////////////////////////////////////////////////////////////////////
  const result = t.callExpression(
    _js_parse_expression(
      js_context,
      `
      (name, props, style, rules) => {
        // destruct props
        const {
          type,
          label,
          defaultValue,
          multiline,
          autoSuggest,
          options,
          callback,
          ...restProps
        } = props
        // return
        return (
          ${controlElement}
        )
      }
      `,
      {
        plugins: [
          'jsx', // support jsx here
        ]
      }
    ),
    [
      nameExpression,
      propsExpression,
      styleExpression,
      rulesExpression,
    ]
  )

  //////////////////////////////////////////////////////////////////////
  // check for CONTEXT_JSX and return
  if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      result
    )
  } else {
    return result
  }
}

////////////////////////////////////////////////////////////////////////////////
// create input/select ast
function input_select(js_context, ref, input) {

  // require here to avoid circular require reference
  const { js_process, react_element_style } = require('./util_code')

  if (!('_type' in input) || input._type !== 'input/select') {
    throw new Error(`ERROR: input._type is not [input/select] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!input.name) {
    throw new Error(`ERROR: input.name not set in [input/select] [${JSON.stringify(input)}]`)
  }

  //////////////////////////////////////////////////////////////////////
  // process form context and reg_react_form before processing others
  // check for js_context.reactForm exist
  if (!(js_context.reactForm)) {
    // console.log(`reg_js_import`, `react-hook-form.useFormContext`)
    reg_js_import(js_context, `react-hook-form.useFormContext`)
  }
  // qualified name
  const qualifiedName = !!(js_context.reactForm)
    ? `react-hook-form.useForm.${js_context.reactForm}`
    : `react-hook-form.useFormContext`
  // console.log(`js_context.reactForm`, js_context.reactForm, qualifiedName)
  // if js_context.reactForm is not already set, register empty string
  if (!js_context.reactForm) {
    reg_react_form(js_context, '', qualifiedName, null)
  }
  // register variables, no import needed
  REACT_FORM_METHODS.map(method => {
    reg_js_variable(js_context, `${qualifiedName}.${method}`)
  })

  //////////////////////////////////////////////////////////////////////
  // start processing after reg_react_form
  // process name
  const nameExpression = (() => {
    if (isPrimitive(input.name)) {
      return t.stringLiteral(String(input.name))
    } else {
      throw new Error(`ERROR: [input/text] input.name is not string [${JSON.stringify(input.name)}]`)
    }
  })()

  // process main props
  const props = input.props || {}
  // basic types - extension not supported
  // multiline and autoSuggest options
  const required = !!input.required

  // process style
  const styleExpression = (() => {
    if (!!input.style) {
      const style = react_element_style(
        {
          ...js_context,
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        input.style
      )
      return style
    } else {
      return t.objectExpression(
        []
      )
    }
  })()

  // default value
  const defaultValueExpression = (() => {
    if (!!props.defaultValue) {
      if (isPrimitive(props.defaultValue)) {
        return t.stringLiteral(String(props.defaultValue))
      } else {
        return js_process(
          {
            ...js_context,
            CONTEXT_JSX: false,
          },
          null,
          props.defaultValue
        )
      }
    } else {
      return t.stringLiteral('')
    }
  })()
  js_context.parsed['props.defaultValue'] = defaultValueExpression

  // compute props
  const propsExpression = (() => {
    if (!!input.props) {
      return js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
        },
        null,
        input.props
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

  // compute rules
  const required_desc = !!input.props.label && isPrimitive(input.props.label) ? String(input.props.label) : input.name
  const rulesExpression = (() => {
    if (!!input.rules) {
      return js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
          INPUT_REQUIRED: !!input.required ? required_desc : false
        },
        null,
        input.rules
      )
    } else if (!!input.required) {
      return t.objectExpression(
        [
          t.objectProperty(
            t.stringLiteral('required'),
            t.stringLiteral(`${required_desc} is required`)
          )
        ]
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()


  //////////////////////////////////////////////////////////////////////
  // TextField
  let innerElement = `
    <$J $I='@material-ui/core.TextField'
      // {...restProps}
      name={name}
      select={true}
      required={${required}}
      size={props.size}
      style={{width:'100%'}}
      value={innerProps.value}
      onChange={e => {
        innerProps.onChange(e.target.value)
        if (!!props.callback) {
          props.callback(e.target.value)
        }
      }}
      error={!!$I('lodash.default').get($L('${qualifiedName}.errors'), name)}
      helperText={$I('lodash.default').get($L('${qualifiedName}.errors'), name)?.message}
      >
      {
        !!props.options
        &&
        (
          props.options.map(option => {
            return (
              <$J $I='@material-ui/core.MenuItem'
                key={option.value}
                value={option.value}
                >
                { option.value }
              </$J>
            )
          })
        )
      }
    </$J>
  `

  //////////////////////////////////////////////////////////////////////
  // control element
  const controlElement = `
    <$J $I='react-hook-form.Controller'
      key={name}
      name={name}
      required={${required}}
      constrol={$L('${qualifiedName}.control')}
      defaultValue={$P('props.defaultValue')}
      rules={rules}
      render={innerProps => (
        <$J $I='@material-ui/core.Box'
          {...restProps}
          style={style}
          >
          <$J $I='@material-ui/core.FormControl'
            style={{width:'100%'}}
            error={!!$I('lodash.default').get($L('${qualifiedName}.errors'), name)}
            >
            {
              !!props?.label
              &&
              (
                <$J $I='@material-ui/core.Box'
                  style={{width: '100%', paddingBottom: '16px'}}
                  >
                  <$J $I='@material-ui/core.InputLabel'
                    key="label"
                    shrink={true}
                    required={${required}}
                    >
                    { props.label }
                  </$J>
                </$J>
              )
            }
            {
              ${innerElement}
            }
          </$J>
        </$J>
      )}
    >
    </$J>
  `

  //////////////////////////////////////////////////////////////////////
  const result = t.callExpression(
    _js_parse_expression(
      js_context,
      `
      (name, props, style, rules) => {
        // destruct props
        const {
          type,
          label,
          defaultValue,
          multiline,
          autoSuggest,
          options,
          callback,
          ...restProps
        } = props
        // return
        return (
          ${controlElement}
        )
      }
      `,
      {
        plugins: [
          'jsx', // support jsx here
        ]
      }
    ),
    [
      nameExpression,
      propsExpression,
      styleExpression,
      rulesExpression,
    ]
  )

  //////////////////////////////////////////////////////////////////////
  // check for CONTEXT_JSX and return
  if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      result
    )
  } else {
    return result
  }
}

////////////////////////////////////////////////////////////////////////////////
// process input/rule ast
function input_rule(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'input/rule') {
    throw new Error(`ERROR: input._type is not [input/rule] [${input._type}] [${JSON.stringify(input)}]`)
  }

  // if empty, return empty rule
  if (!input.data || !Array.isArray(input.data)) {
    return t.objectExpression([])
  }

  const rules = {
    validate: {}
  }

  // process required flags
  if (!!js_context[INPUT_REQUIRED]) {
    rules.required = t.stringLiteral(`${js_context[INPUT_REQUIRED]} is required`)
  }

  let validate_count = 0
  input.data.map(rule => {
    // validity check
    if (!rule.kind) {
      throw new Error(`ERROR: [input/rule] missing [kind] [${JSON.stringify(rule)}]`)
    }
    if (!rule.data) {
      throw new Error(`ERROR: [input/rule] missing [data] [${JSON.stringify(rule)}]`)
    }
    if (!rule.message) {
      throw new Error(`ERROR: [input/rule] missing [message] [${JSON.stringify(rule)}]`)
    }
    // pattern
    if (rule.kind === 'pattern') {
      const regexSyntax = eval(rule.data)
      if (! (regexSyntax instanceof RegExp)) {
        throw new Error(`ERROR: [input/rule] pattern [data] is not valid regex expression [${JSON.stringify(rule.data)}]`)
      }
      rules.pattern = t.objectExpression(
        [
          t.objectProperty(
            t.identifier('value'),
            t.regExpLiteral(regexSyntax.source, regexSyntax.flags)
          ),
          t.objectProperty(
            t.identifier('message'),
            t.callExpression(
              t.identifier('eval'),
              [
                t.stringLiteral(rule.message)
              ]
            )
          )
        ]
      )
    } else if (rule.kind === 'validate') {
      rules.validate[String(`validate_${validate_count++}`)] = t.arrowFunctionExpression(
        [
          t.identifier('value'),
        ],
        t.blockStatement(
          [
            t.tryStatement(
              t.blockStatement(
                [
                  t.ifStatement(
                    t.callExpression(
                      t.identifier('eval'),
                      [
                        t.stringLiteral(rule.data)
                      ]
                    ),
                    t.returnStatement(
                      t.booleanLiteral(true)
                    ),
                    t.returnStatement(
                      t.callExpression(
                        t.identifier('eval'),
                        [
                          t.stringLiteral(rule.message)
                        ]
                      )
                    )
                  )
                ]
              ),
              t.catchClause(
                t.identifier('error'),
                t.blockStatement(
                  [
                    t.returnStatement(
                      t.callExpression(
                        t.identifier('String'),
                        [
                          t.identifier('error')
                        ]
                      )
                    )
                  ]
                )
              )
            )
          ]
        )
      )
    }
  })

  return t.objectExpression(
    Object.keys(rules).map(key => {
      if (key !== 'validate') {
        return t.objectProperty(
          t.stringLiteral(key),
          rules[key]
        )
      } else {
        return t.objectProperty(
          t.stringLiteral(key),
          t.objectExpression(
            Object.keys(rules[key]).map(validate_key => {
              return t.objectProperty(
                t.stringLiteral(validate_key),
                rules[key][validate_key]
              )
            })
          )
        )
      }
    })
  )
}

////////////////////////////////////////////////////////////////////////////////
// export
module.exports = {
  REACT_FORM_METHODS: REACT_FORM_METHODS,
  react_form: react_form,
  input_text: input_text,
  input_switch: input_switch,
  input_select: input_select,
  input_rule: input_rule,
}
