const { parse, parseExpression } = require('@babel/parser')
const generate = require('@babel/generator').default
const t = require("@babel/types")
const {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  SPECIAL_CHARACTER,
  JSX_CONTEXT,
  TOKEN_IMPORT,
  TOKEN_LOCAL,
  TOKEN_JSX,
  TOKEN_NAME,
  REACT_FORM_METHODS,
  REACT_FORM_ARRAY_METHODS,
  VALID_INPUT_TYPES,
  isPrimitive,
  capitalize,
  reg_js_import,
  reg_js_variable,
  reg_react_state,
  reg_react_form,
  js_resolve_ids,
  _js_parse_snippet,
  _js_parse_statements,
  _js_parse_expression,
  _parse_var_full_path,
} = require('./util_base')

////////////////////////////////////////////////////////////////////////////////
// create react/form ast
function react_form(js_context, input) {

  // require here to avoid circular require reference
  const { js_process } = require('./util_code')

  if (!('_type' in input) || input._type !== 'react/form') {
    throw new Error(`ERROR: input._type is not [react/form] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!input.name) {
    throw new Error(`ERROR: input.name not set in [react/form] [${JSON.stringify(input)}]`)
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
                  topLevel: false,
                  parentRef: null,
                  parentPath: null,
                  JSX_CONTEXT: false,
                },
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

  // register import
  reg_js_import(js_context, 'react-hook-form.useForm')
  reg_js_import(js_context, 'react-hook-form.FormProvider')
  // register react hook form with [input.name]
  const qualifiedName = `react-hook-form.useForm.${input.name}`
  reg_js_variable(js_context, qualifiedName)
  // register form
  reg_react_form(js_context, input.name, qualifiedName, formProps)
  // console.log(`js_context.reactForm`, js_context.reactForm)
  // register variables
  REACT_FORM_METHODS.map(method => {
    reg_js_variable(js_context, `${qualifiedName}.${method}`)
  })

  //////////////////////////////////////////////////////////////////////
  // start processing after reg_react_form
  const onSubmitStatements = (() => {
    if (!!input.onSubmit) {
      if (isPrimitive(input.onSubmit)) {
        return t.blockStatement(
          _js_parse_statements(js_context, input.onSubmit)
        )
      } else {
        return js_process(
          {
            ...js_context,
            topLevel: false,
            parentRef: null,
            parentPath: null,
            JSX_CONTEXT: false,
          },
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
          _js_parse_statements(js_context, input.onError)
        )
      } else {
        return js_process(
          {
            ...js_context,
            topLevel: false,
            parentRef: null,
            parentPath: null,
            JSX_CONTEXT: false,
          },
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
                  topLevel: false,
                  parentRef: null,
                  parentPath: null,
                  JSX_CONTEXT: false,
                },
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
            topLevel: false,
            parentRef: null,
            parentPath: null,
            JSX_CONTEXT: true,
          },
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
function input_text(js_context, input) {

  // require here to avoid circular require reference
  const { js_process } = require('./util_code')

  if (!('_type' in input) || input._type !== 'input/text') {
    throw new Error(`ERROR: input._type is not [input/text] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!input.name) {
    throw new Error(`ERROR: input.name not set in [input/text] [${JSON.stringify(input)}]`)
  }

  if (!!input.array) {
    return input_text_array(js_context, input)
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

  // compute props
  const propsExpression = (() => {
    if (!!input.props) {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.props
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

  // compute rules
  const rulesExpression = (() => {
    if (!!input.rules) {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.rules
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

  //////////////////////////////////////////////////////////////////////
  // TextField
  let innerElement = `
    <$JSX $NAME='@material-ui/core.TextField'
      // {...restProps}
      name={name}
      type="${inputType}"
      required={${required}}
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
    </$JSX>
  `

  //////////////////////////////////////////////////////////////////////
  // if autoSuggest
  if (!!input.props.autoSuggest) {
    innerElement = `
      (() => {
        const [ _searchSuggestions, _setSearchSuggestions ] = $I('react.useState')(props.suggestions)
        return (
          <$JSX $NAME='antd.AutoComplete'
            name={name}
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
              const matches = props.suggestions
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
          </$JSX>
        )
      })()
    `
  }

  //////////////////////////////////////////////////////////////////////
  // control element
  const controlElement = `
    <$JSX $NAME='react-hook-form.Controller'
      key={name}
      name={name}
      required={${required}}
      constrol={$L('${qualifiedName}.control')}
      defaultValue={${props.defaultValue} || ''}
      rules={rules}
      render={innerProps => (
        <$JSX $NAME='@material-ui/core.FormControl'
          style={{width:'100%'}}
          >
          {
            ${innerElement}
          }
        </$JSX>
      )}
    >
    </$JSX>
  `

  //////////////////////////////////////////////////////////////////////
  const result = t.callExpression(
    _js_parse_expression(
      js_context,
      `
      (name, props, rules) => {
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
      rulesExpression,
    ]
  )

  //////////////////////////////////////////////////////////////////////
  // check for JSX_CONTEXT and return
  if (js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      result
    )
  } else {
    return result
  }
}

////////////////////////////////////////////////////////////////////////////////
// create input/text [array] ast
function input_text_array(js_context, input) {

  // require here to avoid circular require reference
  const { js_process } = require('./util_code')

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
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.props
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

  // compute rules
  const rulesExpression = (() => {
    if (!!input.rules) {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.rules
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

  //////////////////////////////////////////////////////////////////////
  // innerElement
  let innerElement = `
    <$JSX $NAME='@material-ui/core.TextField'
      // {...restProps}
      name={\`\${name}[\${index}].value\`}
      // name={\`\${name}\`}
      type="${inputType}"
      required={${required}}
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
    </$JSX>
  `

  //////////////////////////////////////////////////////////////////////
  // if autoSuggest
  if (!!input.props.autoSuggest) {
    innerElement = `
      (() => {
        const [ _searchSuggestions, _setSearchSuggestions ] = $I('react.useState')(props.suggestions)
        return (
          <$JSX $NAME='antd.AutoComplete'
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
              const matches = props.suggestions
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
          </$JSX>
        )
      })()
    `
  }

  //////////////////////////////////////////////////////////////////////
  // control element
  const controlElement = `
    <$JSX $NAME='@material-ui/core.Box'
      {...restProps}
      >
      {
        !!props?.label
        &&
        (
          <$JSX $NAME='@material-ui/core.InputLabel'
            key="label"
            shrink={true}
            required={${required}}
          >
            { props.label }
          </$JSX>
        )
      }
      {
        // $L('${qualifiedName}.useFieldArray.${input.name}.fields')
        fields
          .map((item, index) => {
            return (
              <$JSX $NAME='@material-ui/core.Box'
                key={item.id}
                display="flex"
                style={{width:'100%'}}
              >
                <$JSX $NAME='react-hook-form.Controller'
                  key={item.id}
                  name={\`\${name}[\${index}].value\`}
                  constrol={$L('${qualifiedName}.control')}
                  required={${required}}
                  defaultValue={item.value}
                  rules={rules}
                  render={innerProps => (
                    <$JSX $NAME='@material-ui/core.FormControl'
                      style={{width:'100%'}}
                      >
                      {
                        ${innerElement}
                      }
                    </$JSX>
                  )}
                >
                </$JSX>
                {
                  !props.readOnly
                  &&
                  (
                    <$JSX $NAME='@material-ui/core.Box'
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      >
                      <$JSX $NAME='@material-ui/core.IconButton'
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
                        <$JSX $NAME='@material-ui/icons.RemoveCircleOutline' />
                      </$JSX>
                    </$JSX>
                  )
                }
              </$JSX>
            )
          })
      }
      {
        !props.readOnly
        &&
        (
          <$JSX $NAME='@material-ui/core.IconButton'
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
            <$JSX $NAME='@material-ui/icons.AddCircleOutline' />
          </$JSX>
        )
      }
    </$JSX>
  `

  //////////////////////////////////////////////////////////////////////
  const result = t.callExpression(
    _js_parse_expression(
      js_context,
      `
      (name, props, rules) => {
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
      rulesExpression,
    ]
  )

  //////////////////////////////////////////////////////////////////////
  // check for JSX_CONTEXT and return
  if (js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      result
    )
  } else {
    return result
  }
}

// export
module.exports = {
  react_form: react_form,
  input_text: input_text,
}
