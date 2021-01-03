const { parse, parseExpression } = require('@babel/parser')
const t = require("@babel/types")
const {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  SPECIAL_CHARACTER,
  JSX_CONTEXT,
  REQUIRE_FUNCTION,
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

  if (!('type' in input) || input.type !== 'react/form') {
    throw new Error(`ERROR: input.type is not [react/form] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (!input.name) {
    throw new Error(`ERROR: input.name not set in [react/form] [${JSON.stringify(input)}]`)
  }

  const onSubmitStatements = (() => {
    if (!!input.onSubmit) {
      return _js_parse_statements(js_context, input.onSubmit)
    } else {
      return t.blockStatement([])
    }
  })()

  const onErrorStatements = (() => {
    if (!!input.onError) {
      return _js_parse_statements(js_context, input.onError)
    } else {
      return t.blockStatement([])
    }
  })()

  // props expression
  const props = (() => {
    if (!!input.props) {
      return t.objectExpression(
        [
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
        ]
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })

  // formProps expression
  const formProps = (() => {
    if (!!input.formProps) {
      return t.objectExpression(
        [
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
        ]
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

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

  // register react hook form with [input.name]
  const qualifiedName = `react-hook-form.useForm.${input.name}`
  reg_react_form(js_context, input.name, qualifiedName, formProps)
  // register import
  reg_js_import(js_context, 'react-hook-form.useForm')
  reg_js_import(js_context, 'react-hook-form.FormProvider')

  // register variables
  REACT_FORM_METHODS.map(method => {
    reg_js_variable(js_context, `${qualifiedName}.${method}`)
  })

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

  if (!('type' in input) || input.type !== 'input/text') {
    throw new Error(`ERROR: input.type is not [input/text] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (!input.name) {
    throw new Error(`ERROR: input.name not set in [input/text] [${JSON.stringify(input)}]`)
  }

  if (!!input.array) {
    return input_text_array(js_context, input)
  }

  // check valid input types
  const inputType = (() => {
    if (!!input.type && VALID_INPUT_TYPES.includes(input.type.toLowerCase()))
    {
      return input.type.toLowerCase()
    }
    else
    {
      return 'text'
    }
  })()

  // process defaultValue
  const defaultValue = (() => {
    if (!!input.defaultValue) {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.defaultValue
      )
    } else {
      return []
    }
  })()

  // process options
  const options = (() => {
    if (!!input.options) {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.options
      )
    } else {
      return []
    }
  })()

  // process rules
  const rules = (() => {
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

  // process callback
  const callback = (() => {
    if (!!input.callback) {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.callback
      )
    } else {
      // return null
      return t.nullLiteral()
    }
  })()

  // other options
  const multiline = !!input.multiline || false
  const autocomplete = !!input.autocomplete || false
  const qualifiedName = !!js_context.reactForm
    ? `react-hook-form.useForm.${js_context.reactForm}`
    : `react-hook-form.useContext`

  // if js_context.reactForm is not already set, register empty string
  if (!js_context.reactForm) {
    reg_react_form(js_context, '', qualifiedName, null)
  }

  // register import
  reg_js_import(js_context, 'lodash.default')
  reg_js_import(js_context, '@material-ui/core.TextField')
  // register variables, no import needed
  REACT_FORM_METHODS.map(method => {
    reg_js_variable(js_context, `${qualifiedName}.${method}`)
  })

  // inner element
  let innerElement = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier('@material-ui/core.TextField'),
      [
        // key="textfield"
        t.jSXAttribute(
          t.jSXIdentifier('key'),
          t.stringLiteral('textfield')
        ),
        // name={input.label}
        t.jSXAttribute(
          t.jSXIdentifier('label'),
          t.stringLiteral(input.label)
        ),
        // name={input.name}
        t.jSXAttribute(
          t.jSXIdentifier('name'),
          t.stringLiteral(input.name)
        ),
        // type={inputType}
        t.jSXAttribute(
          t.jSXIdentifier('type'),
          t.stringLiteral(inputType)
        ),
        // multiline={multiline}
        t.jSXAttribute(
          t.jSXIdentifier('multiline'),
          t.jSXExpressionContainer(
            t.booleanLiteral(multiline)
          )
        ),
        // value={innerProps.value}
        t.jSXAttribute(
          t.jSXIdentifier('value'),
          t.jSXExpressionContainer(
            t.memberExpression(
              t.identifier('innerProps'),
              t.identifier('value')
            )
          )
        ),
        // onChange={e => {...}}
        t.jSXAttribute(
          t.jSXIdentifier('onChange'),
          t.jSXExpressionContainer(
            t.arrowFunctionExpression(
              [
                t.identifier('e')
              ],
              t.blockStatement(
                [
                  // innerProps.onChange(e.target.value)
                  t.callExpression(
                    t.memberExpression(
                      t.identifier('innerProps'),
                      t.identifier('onChange')
                    ),
                    [
                      t.memberExpression(
                        t.memberExpression(
                          t.identifier('e'),
                          t.identifier('target')
                        ),
                        t.identifier('value')
                      )
                    ]
                  ),
                  // if (props.callback) {
                  //   props.callback(e.target.value)
                  // }
                  t.ifStatement(
                    t.unaryExpression(
                      '!',
                      t.unaryExpression(
                        '!',
                        callback
                      )
                    ),
                    t.expressionStatement(
                      t.callExpression(
                        callback,
                        [
                          t.memberExpression(
                            t.memberExpression(
                              t.identifier('e'),
                              t.identifier('target')
                            ),
                            t.identifier('value')
                          )
                        ]
                      )
                    )
                  )
                ]
              )
            )
          )
        ),
        t.jSXAttribute(
          t.jSXIdentifier('error'),
          t.jSXExpressionContainer(
            // !!lodash.get(errors, props.name)
            t.unaryExpression(
              '!',
              t.unaryExpression(
                '!',
                t.callExpression(
                  t.memberExpression(
                    t.identifier('lodash.default'),
                    t.identifier('get')
                  ),
                  [
                    t.identifier(`${qualifiedName}.errors`),
                    t.stringLiteral(input.name)
                  ]
                )
              )
            )
          )
        ),
        t.jSXAttribute(
          t.jSXIdentifier('helperText'),
          t.jSXExpressionContainer(
            // lodash.get(errors, props.name)?.message
            t.memberExpression(
              t.callExpression(
                t.memberExpression(
                  t.identifier('lodash.default'),
                  t.identifier('get')
                ),
                [
                  t.identifier(`${qualifiedName}.errors`),
                  t.stringLiteral(input.name)
                ]
              ),
              t.identifier('message'),
              computed=false,
              optional=true,
            )
          )
        )
      ]
    ),
    t.jSXClosingElement(
      t.jSXIdentifier('@material-ui/core.TextField')
    ),
    []
  )

  // if auto complete
  if (!!autocomplete) {

    // register react.useState & antd.AutoComplete
    reg_js_import(js_context, 'react.useState')
    reg_js_import(js_context, 'antd.AutoComplete')

    // update innerElement with AutoComplete
    // return (() => {...})()
    innerElement = t.callExpression(
      t.arrowFunctionExpression(
        [],
        t.blockStatement(
          [
            // const [ __searchOptions, __setSearchOptions ] = React.useState(props.options)
            t.variableDeclaration(
              'const',
              [
                t.variableDeclarator(
                  t.arrayPattern(
                    [
                      t.identifier('__searchOptions'),
                      t.identifier('__setSearchOptions'),
                    ]
                  ),
                  t.callExpression(
                    t.identifier('react.useState'),
                    options
                  )
                )
              ]
            ),
            // return <AutoComplete>...</AutoComplete>
            t.returnStatement(
              t.jSXElement(
                t.jSXOpeningElement(
                  t.jSXIdentifier('antd.AutoComplete'),
                  [
                    // key="autocomplete"
                    t.jSXAttribute(
                      t.jSXIdentifier('key'),
                      t.stringLiteral('autocomplete')
                    ),
                    // options={states.options}
                    t.jSXAttribute(
                      t.identifier('options'),
                      t.jSXExpressionContainer(
                        t.identifier('__searchOptions')
                      )
                    ),
                    // valud={innerProps.value}
                    t.jSXAttribute(
                      t.jSXIdentifier('value'),
                      t.jSXExpressionContainer(
                        t.memberExpression(
                          t.identifier('innerProps'),
                          t.identifier('value')
                        )
                      )
                    ),
                    // onChange={data => {...}}
                    t.jSXAttribute(
                      t.jSXIdentifier('onChange'),
                      t.jSXExpressionContainer(
                        t.arrowFunctionExpression(
                          [
                            t.identifier('data')
                          ],
                          t.blockStatement(
                            [
                              // innerProps.onChange(data)
                              t.callExpression(
                                t.memberExpression(
                                  t.identifier('innerProps'),
                                  t.identifier('onChange')
                                ),
                                [
                                  t.identifier('data')
                                ]
                              ),
                              /*
                              // if (props.callback) {
                              //   props.callback(data)
                              // }
                              t.ifStatement(
                                t.unaryExpression(
                                  '!',
                                  t.unaryExpression(
                                    '!',
                                    t.memberExpression(
                                      t.identifier('props'),
                                      t.identifier('callback')
                                    )
                                  )
                                ),
                                t.expressionStatement(
                                  t.callExpression(
                                    t.memberExpression(
                                      t.identifier('props'),
                                      t.identifier('callback')
                                    ),
                                    [
                                      t.identifier('data')
                                    ]
                                  )
                                )
                              )
                              */
                            ]
                          )
                        )
                      )
                    ),
                    // onSearch={s => {...}}
                    t.jSXAttribute(
                      t.identifier('onSearch'),
                      t.jSXExpressionContainer(
                        t.arrowFunctionExpression(
                          [
                            t.identifier('s')
                          ],
                          t.blockStatement(
                            [
                              // const s_list = s.toUpperCase().split(' ').filter(s => !!s)
                              t.variableDeclaration(
                                'const',
                                [
                                  t.variableDeclarator(
                                    t.identifier('s_list'),
                                    t.callExpression(
                                      t.memberExpression(
                                        t.callExpression(
                                          t.memberExpression(
                                            t.callExpression(
                                              t.memberExpression(
                                                t.identifier('s'),
                                                t.identifier('toUpperCase')
                                              ),
                                              []
                                            ),
                                            t.identifier('split')
                                          ),
                                          [
                                            t.stringLiteral(' ')
                                          ]
                                        ),
                                        t.identifier('filter')
                                      ),
                                      [
                                        t.arrowFunctionExpression(
                                          [
                                            t.identifier('s'),
                                            t.unaryExpression(
                                              '!',
                                              t.unaryExpression(
                                                '!',
                                                t.identifier('s')
                                              )
                                            )
                                          ]
                                        )
                                      ]
                                    )
                                  )
                                ]
                              ),
                              // const found_options = props.options.filter(name => {
                              //  const name_upper = name.toUpperCase()
                              //  return s_list.reduce(
                              //    (accumulator, item) => !!accumulator && name_upper.includes(item.value),
                              //    true)
                              // })
                              t.variableDeclaration(
                                [
                                  t.variableDeclarator(
                                    'const',
                                    t.identifier('found_options'),
                                    t.callExpression(
                                      t.memberExpression(
                                        options,
                                        t.identifier('filter')
                                      ),
                                      [
                                        t.arrowFunctionExpression(
                                          [
                                            t.identifier('name')
                                          ],
                                          t.blockStatement(
                                            [
                                              t.variableDeclaration(
                                                [
                                                  t.variableDeclarator(
                                                    'const',
                                                    t.identifier('name_upper'),
                                                    t.callExpression(
                                                      t.memberExpression(
                                                        t.identifier('name'),
                                                        t.identifier('toUpperCase')
                                                      ),
                                                      []
                                                    )
                                                  )
                                                ]
                                              ),
                                              t.returnStatement(
                                                t.callExpression(
                                                  t.memberExpression(
                                                    t.identifier('s_list'),
                                                    t.identifier('reduce')
                                                  ),
                                                  [
                                                    t.arrowFunctionExpression(
                                                      [
                                                        t.identifier('accumulator'),
                                                        t.identifier('item')
                                                      ],
                                                      t.binaryExpression(
                                                        '&&',
                                                        t.unaryExpression(
                                                          '!',
                                                          t.unaryExpression(
                                                            '!',
                                                            t.identifier('accumulator')
                                                          )
                                                        )
                                                      ),
                                                      t.callExpression(
                                                        t.memberExpression(
                                                          t.identifier('name_upper'),
                                                          t.identifier('includes')
                                                        ),
                                                        t.memberExpression(
                                                          t.identifier('item'),
                                                          t.identifier('value'),
                                                          computed=false,
                                                          optional=true,
                                                        )
                                                      )
                                                    ),
                                                    t.booleanLiteral(true)
                                                  ]
                                                )
                                              )
                                            ]
                                          )
                                        )
                                      ]
                                    )
                                  )
                                ]
                              ),
                              // setOptions(found_options)
                              t.callExpression(
                                t.identifier('__setSearchOptions'),
                                t.identifier(found_options)
                              )
                            ]
                          )
                        )
                      )
                    )
                  ]
                ),
                t.jSXClosingElement(
                  t.jSXIdentifier('antd.AutoComplete')
                ),
                [
                  innerElement  // add TextField as inner element
                ]
              )
            )
          ]
        )
      ),
      []
    )
  }

  // register imported components
  reg_js_import(js_context, 'react-hook-form.Controller')
  reg_js_import(js_context, '@material-ui/core.FormControl')

  const controlElement = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier('react-hook-form.Controller'),
      [
        // key={props.name}
        t.jSXAttribute(
          t.identifier('key'),
          t.jSXExpressionContainer(
            t.memberExpression(
              t.identifier('props'),
              t.identifier('name')
            )
          )
        ),
        // name={input.name}
        t.jSXAttribute(
          t.identifier('name'),
          t.stringLiteral(input.name)
        ),
        // control={qualifiedName.control}
        t.jSXAttribute(
          t.identifier('control'),
          t.jSXExpressionContainer(
            t.identifier(`${qualifiedName}.control`)
          )
        ),
        // defaultValue={props.defaultValue}
        t.jSXAttribute(
          t.identifier('defaultValue'),
          defaultValue
        ),
        // rules={props.rules}
        t.jSXAttribute(
          t.identifier('rules'),
          rules,
        ),
        // render={<Element>...</Element>}
        t.jSXAttribute(
          t.identifier('render'),
          t.jSXExpressionContainer(
            t.jSXElement(
              t.jSXOpeningElement(
                t.jSXIdentifier('@material-ui/core.FormControl'),
                [
                  // className={props.className}
                  t.jSXSpreadAttribute(
                    t.identifier('props')
                  )
                ]
              ),
              t.jSXClosingElement(
                t.jSXIdentifier('@material-ui/core.FormControl')
              ),
              [
                innerElement  // innerElement here
              ]
            )
          )
        )
      ]
    )
  )

  // return <Controller>...</Controller>
  return controlElement
}

////////////////////////////////////////////////////////////////////////////////
// create input/text [array] ast
function input_text_array(js_context, input) {

  if (!('type' in input) || input.type !== 'input/text') {
    throw new Error(`ERROR: input.type is not [input/text] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (!input.name) {
    throw new Error(`ERROR: input.name not set in [input/text] [${JSON.stringify(input)}]`)
  }

  if (!input.array) {
    throw new Error(`ERROR: input.array not set [input/text - array] [${JSON.stringify(input)}]`)
  }

  // process defaultValue
  const defaultValue = (() => {
    if (!!input.defaultValue) {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.defaultValue
      )
    } else {
      return []
    }
  })()

  // process options
  const options = (() => {
    if (!!input.options) {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.options
      )
    } else {
      return []
    }
  })()

  // process rules
  const rules = (() => {
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

  // process callback
  const callback = (() => {
    if (!!input.callback) {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.callback
      )
    } else {
      // return null
      return t.nullLiteral()
    }
  })()

  // other options
  const multiline = !!input.multiline || false
  const autocomplete = !!input.autocomplete || false
  const qualifiedName = !!js_context.reactForm
    ? `react-hook-form.useForm.${js_context.reactForm}`
    : `react-hook-form.useContext`

  // if js_context.reactForm is not already set, register empty string
  if (!js_context.reactForm) {
    reg_react_form(js_context, '', qualifiedName, null)
  }

  // register import
  reg_js_import(js_context, 'lodash.default')
  reg_js_import(js_context, '@material-ui/core.TextField')
  // register variables, no import needed
  REACT_FORM_METHODS.map(method => {
    reg_js_variable(js_context, `${qualifiedName}.${method}`)
  })

  // register useFieldArray
  reg_js_import(js_context, 'react-hook-form.useFieldArray')

  // inner element
  let innerElement = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier('@material-ui/core.TextField'),
      [
        // key="textfield"
        t.jSXAttribute(
          t.jSXIdentifier('key'),
          t.stringLiteral('textfield')
        ),
        // name=`"input.name"[${index}].value`
        t.jSXAttribute(
          t.jSXIdentifier('name'),
          t.jSXExpressionContainer(
            t.templateLiteral(
              [
                t.templateElement({
                  raw: `${input.name}[`,
                  cooked: `${input.name}[`,
                }),
                t.templateElement({
                  raw: '].value',
                  cooked: '].value',
                }),
              ],
              [
                t.identifier('index')
              ]
            ),
          )
        ),
        // type="inputType"
        t.jSXAttribute(
          t.jSXIdentifier('type'),
          t.stringLiteral(inputType)
        ),
        // multiline={multiline}
        t.jSXAttribute(
          t.jSXIdentifier('multiline'),
          t.jSXExpressionContainer(
            t.booleanLiteral(multiline)
          )
        ),
        // value={innerProps.value}
        t.jSXAttribute(
          t.jSXIdentifier('value'),
          t.jSXExpressionContainer(
            t.memberExpression(
              t.identifier('innerProps'),
              t.identifier('value')
            )
          )
        ),
        // onChange={e => {...}}
        t.jSXAttribute(
          t.jSXIdentifier('onChange'),
          t.jSXExpressionContainer(
            t.arrowFunctionExpression(
              [
                t.identifier('e')
              ],
              t.blockStatement(
                [
                  // innerProps.onChange(e.target.value)
                  t.callExpression(
                    t.memberExpression(
                      t.identifier('innerProps'),
                      t.identifier('onChange')
                    ),
                    [
                      t.memberExpression(
                        t.memberExpression(
                          t.identifier('e'),
                          t.identifier('target')
                        ),
                        t.identifier('value')
                      )
                    ]
                  ),
                  // if (callback) {
                  //   callback(e.target.value)
                  // }
                  t.ifStatement(
                    t.unaryExpression(
                      '!',
                      t.unaryExpression(
                        '!',
                        callback
                      )
                    ),
                    t.expressionStatement(
                      t.callExpression(
                        callback
                        [
                          t.memberExpression(
                            t.memberExpression(
                              t.identifier('e'),
                              t.identifier('target')
                            ),
                            t.identifier('value')
                          )
                        ]
                      )
                    )
                  )
                ]
              )
            )
          )
        ),
        t.jSXAttribute(
          t.jSXIdentifier('error'),
          t.jSXExpressionContainer(
            // !!lodash.get(errors, props.name)
            // && !!lodash.get(errors, props.name)[index]?.value
            t.binaryExpression(
              '&&',
              // !!lodash.get(errors, props.name)
              t.unaryExpression(
                '!',
                t.unaryExpression(
                  '!',
                  t.callExpression(
                    t.memberExpression(
                      t.identifier('lodash.default'),
                      t.identifier('get')
                    ),
                    [
                      t.identifier(`${qualifiedName}.errors`),
                      t.stringLiteral(input.name)
                    ]
                  )
                )
              ),
              // !!lodash.get(errors, props.name)[index]?.value
              t.unaryExpression(
                '!',
                t.unaryExpression(
                  '!',
                  t.memberExpression(
                    t.memberExpression(
                      t.callExpression(
                        t.memberExpression(
                          t.identifier('lodash.default'),
                          t.identifier('get')
                        ),
                        [
                          t.identifier(`${qualifiedName}.errors`),
                          t.stringLiteral(input.name)
                        ]
                      ),
                      t.identifier('index'),
                      computed=true
                    ),
                    t.identifier('value'),
                    computed=false,
                    optional=true
                  )
                )
              )
            )
          )
        ),
        t.jSXAttribute(
          t.jSXIdentifier('helperText'),
          t.jSXExpressionContainer(
            // !!_.get(errors, props.name)
            // && _.get(errors, props.name)[index]?.type?.message
            t.binaryExpression(
              '&&',
              // !!lodash.get(errors, props.name)
              t.unaryExpression(
                '!',
                t.unaryExpression(
                  '!',
                  t.callExpression(
                    t.memberExpression(
                      t.identifier('lodash.default'),
                      t.identifier('get')
                    ),
                    [
                      t.identifier(`${qualifiedName}.errors`),
                      t.stringLiteral(input.name)
                    ]
                  )
                )
              ),
              // !!lodash.get(errors, props.name)[index]?.value
              t.memberExpression(
                t.memberExpression(
                  t.memberExpression(
                    t.callExpression(
                      t.memberExpression(
                        t.identifier('lodash.default'),
                        t.identifier('get')
                      ),
                      [
                        t.identifier(`${qualifiedName}.errors`),
                        t.stringLiteral(input.name)
                      ]
                    ),
                    t.identifier('index'),
                    computed=true
                  ),
                  t.identifier('value'),
                  computed=false,
                  optional=true
                ),
                t.identifier('message'),
                computed=false,
                optional=true,
              )
            )
          )
        )
      ]
    ),
    t.jSXClosingElement(
      t.jSXIdentifier('@material-ui/core.TextField')
    ),
    []
  )

  // if auto complete
  if (!!autocomplete) {

    // register react.useState & antd.AutoComplete
    reg_js_import(js_context, 'react.useState')
    reg_js_import(js_context, 'antd.AutoComplete')

    // update innerElement with AutoComplete
    // return (() => {...})()
    innerElement = t.callExpression(
      t.arrowFunctionExpression(
        [],
        t.blockStatement(
          [
            // const [ __searchOptions, __setSearchOptions ] = React.useState(props.options)
            t.variableDeclaration(
              'const',
              [
                t.variableDeclarator(
                  t.arrayPattern(
                    [
                      t.identifier('__searchOptions'),
                      t.identifier('__setSearchOptions'),
                    ]
                  ),
                  t.callExpression(
                    t.identifier('react.useState'),
                    options,
                  )
                )
              ]
            ),
            // return <AutoComplete>...</AutoComplete>
            t.returnStatement(
              t.jSXElement(
                t.jSXOpeningElement(
                  t.jSXIdentifier('antd.AutoComplete'),
                  [
                    // key="autocomplete"
                    t.jSXAttribute(
                      t.jSXIdentifier('key'),
                      t.stringLiteral('autocomplete')
                    ),
                    // options={states.options}
                    t.jSXAttribute(
                      t.identifier('options'),
                      t.jSXExpressionContainer(
                        t.identifier('__searchOptions')
                      )
                    ),
                    // valud={innerProps.value}
                    t.jSXAttribute(
                      t.jSXIdentifier('value'),
                      t.jSXExpressionContainer(
                        t.memberExpression(
                          t.identifier('innerProps'),
                          t.identifier('value')
                        )
                      )
                    ),
                    // onChange={data => {...}}
                    t.jSXAttribute(
                      t.jSXIdentifier('onChange'),
                      t.jSXExpressionContainer(
                        t.arrowFunctionExpression(
                          [
                            t.identifier('data')
                          ],
                          t.blockStatement(
                            [
                              // innerProps.onChange(data)
                              t.callExpression(
                                t.memberExpression(
                                  t.identifier('innerProps'),
                                  t.identifier('onChange')
                                ),
                                [
                                  t.identifier('data')
                                ]
                              ),
                            ]
                          )
                        )
                      )
                    ),
                    // onSearch={s => {...}}
                    t.jSXAttribute(
                      t.identifier('onSearch'),
                      t.jSXExpressionContainer(
                        t.arrowFunctionExpression(
                          [
                            t.identifier('s')
                          ],
                          t.blockStatement(
                            [
                              // const s_list = s.toUpperCase().split(' ').filter(s => !!s)
                              t.variableDeclaration(
                                'const',
                                [
                                  t.variableDeclarator(
                                    t.identifier('s_list'),
                                    t.callExpression(
                                      t.memberExpression(
                                        t.callExpression(
                                          t.memberExpression(
                                            t.callExpression(
                                              t.memberExpression(
                                                t.identifier('s'),
                                                t.identifier('toUpperCase')
                                              ),
                                              []
                                            ),
                                            t.identifier('split')
                                          ),
                                          [
                                            t.stringLiteral(' ')
                                          ]
                                        ),
                                        t.identifier('filter')
                                      ),
                                      [
                                        t.arrowFunctionExpression(
                                          [
                                            t.identifier('s'),
                                            t.unaryExpression(
                                              '!',
                                              t.unaryExpression(
                                                '!',
                                                t.identifier('s')
                                              )
                                            )
                                          ]
                                        )
                                      ]
                                    )
                                  )
                                ]
                              ),
                              // const found_options = props.options.filter(name => {
                              //  const name_upper = name.toUpperCase()
                              //  return s_list.reduce(
                              //    (accumulator, item) => !!accumulator && name_upper.includes(item.value),
                              //    true)
                              // })
                              t.variableDeclaration(
                                [
                                  t.variableDeclarator(
                                    'const',
                                    t.identifier('found_options'),
                                    t.callExpression(
                                      t.memberExpression(
                                        options,
                                        t.identifier('filter')
                                      ),
                                      [
                                        t.arrowFunctionExpression(
                                          [
                                            t.identifier('name')
                                          ],
                                          t.blockStatement(
                                            [
                                              t.variableDeclaration(
                                                [
                                                  t.variableDeclarator(
                                                    'const',
                                                    t.identifier('name_upper'),
                                                    t.callExpression(
                                                      t.memberExpression(
                                                        t.identifier('name'),
                                                        t.identifier('toUpperCase')
                                                      ),
                                                      []
                                                    )
                                                  )
                                                ]
                                              ),
                                              t.returnStatement(
                                                t.callExpression(
                                                  t.memberExpression(
                                                    t.identifier('s_list'),
                                                    t.identifier('reduce')
                                                  ),
                                                  [
                                                    t.arrowFunctionExpression(
                                                      [
                                                        t.identifier('accumulator'),
                                                        t.identifier('item')
                                                      ],
                                                      t.binaryExpression(
                                                        '&&',
                                                        t.unaryExpression(
                                                          '!',
                                                          t.unaryExpression(
                                                            '!',
                                                            t.identifier('accumulator')
                                                          )
                                                        )
                                                      ),
                                                      t.callExpression(
                                                        t.memberExpression(
                                                          t.identifier('name_upper'),
                                                          t.identifier('includes')
                                                        ),
                                                        t.memberExpression(
                                                          t.identifier('item'),
                                                          t.identifier('value'),
                                                          computed=false,
                                                          optional=true,
                                                        )
                                                      )
                                                    ),
                                                    t.booleanLiteral(true)
                                                  ]
                                                )
                                              )
                                            ]
                                          )
                                        )
                                      ]
                                    )
                                  )
                                ]
                              ),
                              // setOptions(found_options)
                              t.callExpression(
                                t.identifier('__setSearchOptions'),
                                t.identifier(found_options)
                              )
                            ]
                          )
                        )
                      )
                    )
                  ]
                ),
                t.jSXClosingElement(
                  t.jSXIdentifier('antd.AutoComplete')
                ),
                [
                  innerElement  // add TextField as inner element
                ]
              )
            )
          ]
        )
      ),
      []
    )
  }

  // import useFieldArray
  reg_js_import(js_context, 'react-hook-form.useFieldArray')
  // register field array variables
  REACT_FORM_ARRAY_METHODS.map(method => {
    reg_js_variable(js_context, `${qualifiedName}.useFieldArray.${input.name}.${method}`)
  })

  // const {...} = useFieldArray(control, name)
  const fieldArrayVariables = t.variableDeclaration(
    'const',
    [
      t.variableDeclarator(
        t.objectPattern(
          REACT_FORM_ARRAY_METHODS.map(method => (
            t.objectProperty(
              t.identifier(method),
              // `qualilfiedName.useFieldArray.${input.name}.method`
              t.identifier(`${qualifiedName}.useFieldArray.${input.name}.${method}`)
            )
          ))
        ),
        // useFormContext()
        t.callExpression(
          t.identifier('react-hook-form.useFieldArray'),
          [
            t.objectExpression(
              [
                t.objectProperty(
                  t.identifier('control'),
                  t.identifier(`${qualifiedName}.control`)
                ),
                t.objectProperty(
                  t.identifier('name'),
                  t.stringLiteral(input.name)
                )
              ]
            )
          ]
        )
      )
    ]
  )

  // register imported components
  reg_js_import(js_context, '@material-ui/core.Box')
  reg_js_import(js_context, 'react-hook-form.Controller')
  reg_js_import(js_context, '@material-ui/core.FormControl')
  reg_js_import(js_context, '@material-ui/core.FormHelperText')

  const controlElement = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier('@material-ui/core.Box'),
      [
        t.jSXSpreadAttribute(
          t.identifier('props')
        )
      ]
    ),
    t.jSXClosingElement(
      t.jSXIdentifier('@material-ui/core.Box')
    ),
    [
      // {
      //    (!!props.label)
      //    &&
      //    (
      //      <FormHelperText key="label">{props.label}</FormHelperText>
      //    )
      // }
      t.jSXExpressionContainer(
        t.binaryExpression(
          '&&',
          t.unaryExpression(
            '!',
            t.unaryExpression(
              '!',
              t.stringLiteral(input.label || '')
            )
          ),
          t.jSXElement(
            t.jSXOpeningElement(
              t.jSXIdentifier('@material-ui/core.FormHelperText'),
              [
                t.jSXAttribute(
                  t.jSXIdentifier('key'),
                  t.stringLiteral('label')
                )
              ]
            ),
            t.jSXClosingElement(
              t.jSXIdentifier('@material-ui/core.FormHelperText')
            ),
            [
              t.stringLiteral(input.label || '')
            ]
          )
        )
      ),
      // {
      //    fields.map((item, index) => {
      //      return (
      //        <Box key={item.id} style={width:"100%"}>
      //          <Controller>
      //            ...
      //          </Controller>
      //        </Box>
      //      )
      //    })
      // }
      t.jSXExpressionContainer(
        t.callExpression(
          t.memberExpression(
            t.identifier(`${qualifiedName}.useFieldArray.${input.name}.fields`),
            t.identifier('map')
          ),
          [
            t.arrowFunctionExpression(
              [
                t.identifier('item'),
                t.identifier('index')
              ],
              // <Controller>...</Controller>
              t.jSXElement(
                t.jSXOpeningElement(
                  t.jSXIdentifier('react-hook-form.Controller'),
                  [
                    // key={props.name}
                    t.jSXAttribute(
                      t.identifier('key'),
                      t.jSXExpressionContainer(
                        t.memberExpression(
                          t.identifier('item'),
                          t.identifier('id')
                        )
                      )
                    ),
                    // name={"input.name[${index}].value"}
                    t.jSXAttribute(
                      t.identifier('name'),
                      t.jSXExpressionContainer(
                        t.templateLiteral(
                          [
                            t.templateElement({
                              raw: `${input.name}[`,
                              cooked: `${input.name}[`,
                            }),
                            t.templateElement({
                              raw: `].value`,
                              cooked: `].value`,
                            })
                          ],
                          [
                            t.identifier('index')
                          ]
                        )
                      )
                    ),
                    // control={qualifiedName.control}
                    t.jSXAttribute(
                      t.identifier('control'),
                      t.jSXExpressionContainer(
                        t.identifier(`${qualifiedName}.control`)
                      )
                    ),
                    // defaultValue={props.defaultValue}
                    t.jSXAttribute(
                      t.identifier('defaultValue'),
                      t.jSXExpressionContainer(
                        defaultValue
                      )
                    ),
                    // rules={props.rules}
                    t.jSXAttribute(
                      t.identifier('rules'),
                      t.jSXExpressionContainer(
                        rules
                      )
                    ),
                    // render={<Element>...</Element>}
                    t.jSXAttribute(
                      t.identifier('render'),
                      t.jSXExpressionContainer(
                        t.jSXElement(
                          t.jSXOpeningElement(
                            t.jSXIdentifier('@material-ui/core.FormControl'),
                            [
                              // style={width:"100%"}
                              t.jSXAttribute(
                                t.identifier('style'),
                                t.jSXExpressionContainer(
                                  t.objectExpression(
                                    [
                                      t.objectProperty(
                                        t.identifier('width'),
                                        t.stringLiteral('100%')
                                      )
                                    ]
                                  )
                                )
                              )
                            ]
                          ),
                          t.jSXClosingElement(
                            t.jSXIdentifier('@material-ui/core.FormControl')
                          ),
                          [
                            innerElement  // innerElement here
                          ]
                        )
                      )
                    )
                  ]
                )
              )
            )
          ]
        )
      )
    ]
  )

  // return (() => {
  //  const {...} = useFieldArray()
  //  return <Controller>...</Controller>
  // })()
  return t.callExpression(
    t.arrowFunctionExpression(
      [],
      t.blockStatement(
        [
          // const {...} = useFieldArray()
          fieldArrayVariables,
          //  return <Controller>...</Controller>
          t.returnStatement(
            controlElement
          )
        ]
      )
    ),
    []
  )
}

// export
module.exports = {
  react_form: react_form,
  input_text: input_text,
}
