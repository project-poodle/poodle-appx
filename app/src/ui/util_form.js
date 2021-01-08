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

  //////////////////////////////////////////////////////////////////////
  // start processing after reg_react_form
  const onSubmitStatements = (() => {
    if (!!input.onSubmit) {
      return _js_parse_statements(js_context, input.onSubmit)
    } else {
      return []
    }
  })()

  const onErrorStatements = (() => {
    if (!!input.onError) {
      return _js_parse_statements(js_context, input.onError)
    } else {
      return []
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
                      t.blockStatement(
                        onSubmitStatements,
                      )
                    ),
                    t.arrowFunctionExpression(
                      [
                        t.identifier('error')
                      ],
                      t.blockStatement(
                        onErrorStatements,
                      )
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

  //////////////////////////////////////////////////////////////////////
  // start processing after reg_react_form

  // process name
  const name = (() => {
    if (isPrimitive(input.name)) {
      return t.stringLiteral(String(input.name))
    } else {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.name
      )
    }
  })()

  // process main props
  const props = input.props || {}

  // basic types - extension not supported
  // multiline and autocomplete options
  const multiline = !!props.multiline || false
  const autocomplete = !!props.autocomplete || false
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
        // {...restProps} - the styles goes here
        t.jSXSpreadAttribute(
          t.identifier('restProps')
        ),
        // name={input.name}
        t.jSXAttribute(
          t.jSXIdentifier('name'),
          t.jSXExpressionContainer(
            name,
          )
        ),
        // label={props.label}
        t.jSXAttribute(
          t.jSXIdentifier('label'),
          t.jSXExpressionContainer(
            t.memberExpression(
              t.identifier('props'),
              t.identifier('label')
            )
          )
        ),
        // type={props.type}
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
                  t.expressionStatement(
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
                    )
                  ),
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
                    name
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
            t.optionalMemberExpression(
              t.callExpression(
                t.memberExpression(
                  t.identifier('lodash.default'),
                  t.identifier('get')
                ),
                [
                  t.identifier(`${qualifiedName}.errors`),
                  name
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
                    [
                      t.logicalExpression(
                        '||',
                        t.memberExpression(
                          t.identifier('props'),
                          t.identifier('options')
                        ),
                        t.arrayExpression()
                      )
                    ]
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
                    // options={states.options}
                    t.jSXAttribute(
                      t.jSXIdentifier('options'),
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
                              t.expressionStatement(
                                t.callExpression(
                                  t.memberExpression(
                                    t.identifier('innerProps'),
                                    t.identifier('onChange')
                                  ),
                                  [
                                    t.identifier('data')
                                  ]
                                )
                              ),
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
                            ]
                          )
                        )
                      )
                    ),
                    // onSearch={s => {...}}
                    t.jSXAttribute(
                      t.jSXIdentifier('onSearch'),
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
                                          ],
                                          t.unaryExpression(
                                            '!',
                                            t.unaryExpression(
                                              '!',
                                              t.identifier('s')
                                            )
                                          )
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
                                'const',
                                [
                                  t.variableDeclarator(
                                    t.identifier('found_options'),
                                    t.callExpression(
                                      t.memberExpression(
                                        t.logicalExpression(
                                          '||',
                                          t.memberExpression(
                                            t.identifier('props'),
                                            t.identifier('options')
                                          ),
                                          t.arrayExpression()
                                        ),
                                        t.identifier('filter')
                                      ),
                                      [
                                        t.arrowFunctionExpression(
                                          [
                                            t.identifier('option')
                                          ],
                                          t.blockStatement(
                                            [
                                              t.variableDeclaration(
                                                'const',
                                                [
                                                  t.variableDeclarator(
                                                    t.identifier('upper'),
                                                    t.callExpression(
                                                      t.optionalMemberExpression(
                                                        t.optionalMemberExpression(
                                                          t.identifier('option'),
                                                          t.identifier('value'),
                                                          computed=false,
                                                          optional=true,
                                                        ),
                                                        t.identifier('toUpperCase'),
                                                        computed=false,
                                                        optional=true,
                                                      ),
                                                      []
                                                    )
                                                  )
                                                ]
                                              ),
                                              /*
                                              t.expressionStatement(
                                                t.callExpression(
                                                  t.memberExpression(
                                                    t.identifier('console'),
                                                    t.identifier('log')
                                                  ),
                                                  [
                                                    t.identifier('upper')
                                                  ]
                                                )
                                              ),
                                              */
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
                                                      t.logicalExpression(
                                                        '&&',
                                                        t.unaryExpression(
                                                          '!',
                                                          t.unaryExpression(
                                                            '!',
                                                            t.identifier('accumulator')
                                                          )
                                                        ),
                                                        t.callExpression(
                                                          t.memberExpression(
                                                            t.identifier('upper'),
                                                            t.identifier('includes')
                                                          ),
                                                          [
                                                            t.identifier('item')
                                                          ]
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
                              t.expressionStatement(
                                t.callExpression(
                                  t.identifier('__setSearchOptions'),
                                  [
                                    t.identifier('found_options')
                                  ]
                                )
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

  // console.log(innerElement)

  // register imported components
  reg_js_import(js_context, 'react-hook-form.Controller')
  reg_js_import(js_context, '@material-ui/core.FormControl')

  const controlElement = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier('react-hook-form.Controller'),
      [
        // key={props.name}
        t.jSXAttribute(
          t.jSXIdentifier('key'),
          t.jSXExpressionContainer(
            name
          )
        ),
        // name={input.name}
        t.jSXAttribute(
          t.jSXIdentifier('name'),
          t.jSXExpressionContainer(
            name
          )
        ),
        // control={qualifiedName.control}
        t.jSXAttribute(
          t.jSXIdentifier('control'),
          t.jSXExpressionContainer(
            t.identifier(`${qualifiedName}.control`)
          )
        ),
        // defaultValue={props.defaultValue}
        t.jSXAttribute(
          t.jSXIdentifier('defaultValue'),
          t.jSXExpressionContainer(
            t.memberExpression(
              t.identifier('props'),
              t.identifier('defaultValue')
            )
          )
        ),
        // rules={props.rules}
        t.jSXAttribute(
          t.jSXIdentifier('rules'),
          t.jSXExpressionContainer(
            t.identifier('rules')
          )
        ),
        // render={<Element>...</Element>}
        t.jSXAttribute(
          t.jSXIdentifier('render'),
          t.jSXExpressionContainer(
            t.arrowFunctionExpression(
              [
                t.identifier('innerProps')
              ],
              t.jSXElement(
                t.jSXOpeningElement(
                  t.jSXIdentifier('@material-ui/core.FormControl'),
                  [
                    // style={width:"100%"}
                    t.jSXAttribute(
                      t.jSXIdentifier('style'),
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
                  t.jSXExpressionContainer(
                    innerElement  // innerElement here
                  )
                ]
              )
            )
          )
        )
      ]
    ),
    t.jSXClosingElement(
      t.jSXIdentifier('react-hook-form.Controller')
    ),
    // no children
    []
  )

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

  // return ((props, rules) => <Controller>...</Controller>)()
  const result = t.callExpression(
    t.arrowFunctionExpression(
      [
        t.identifier('props'),
        t.identifier('rules')
      ],
      t.blockStatement(
        [
          t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                t.objectPattern(
                  [
                    t.objectProperty(
                      t.identifier('type'),
                      t.identifier('type')
                    ),
                    t.objectProperty(
                      t.identifier('label'),
                      t.identifier('label')
                    ),
                    t.objectProperty(
                      t.identifier('defaultValue'),
                      t.identifier('defaultValue')
                    ),
                    t.objectProperty(
                      t.identifier('multiline'),
                      t.identifier('multiline')
                    ),
                    t.objectProperty(
                      t.identifier('autocomplete'),
                      t.identifier('autocomplete')
                    ),
                    t.objectProperty(
                      t.identifier('options'),
                      t.identifier('options')
                    ),
                    t.objectProperty(
                      t.identifier('callback'),
                      t.identifier('callback')
                    ),
                    t.restElement(
                      t.identifier('restProps')
                    )
                  ]
                ),
                t.identifier('props')
              )
            ]
          ),
          t.returnStatement(
            controlElement
          )
        ]
      )
    ),
    [
      propsExpression,
      rulesExpression,
    ]
  )

  // check for JSX_CONTEXT
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

  //////////////////////////////////////////////////////////////////////
  // start processing after reg_react_form

  // process name
  const name = (() => {
    if (isPrimitive(input.name)) {
      return t.stringLiteral(String(input.name))
    } else {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.name
      )
    }
  })()

  // process main props
  const props = input.props || {}

  // basic types - extension not supported
  // multiline and autocomplete options
  const multiline = !!props.multiline || false
  const autocomplete = !!props.autocomplete || false
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
        // {...restProps} - the styles goes here
        t.jSXSpreadAttribute(
          t.identifier('restProps')
        ),
        // name={input.name}
        t.jSXAttribute(
          t.jSXIdentifier('name'),
          t.jSXExpressionContainer(
            name,
          )
        ),
        // type={props.type}
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
                  t.expressionStatement(
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
                    )
                  ),
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
                    // `name[${index}].value`
                    t.templateLiteral(
                      [
                        t.templateElement({
                          raw: '',
                          cooked: '',
                        }),
                        t.templateElement({
                          raw: '[',
                          cooked: '[',
                        }),
                        t.templateElement({
                          raw: '].value',
                          cooked: '].value',
                        }),
                      ],
                      [
                        name,
                        t.identifier('index')
                      ]
                    )
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
            t.optionalMemberExpression(
              t.callExpression(
                t.memberExpression(
                  t.identifier('lodash.default'),
                  t.identifier('get')
                ),
                [
                  t.identifier(`${qualifiedName}.errors`),
                  t.templateLiteral(
                    [
                      t.templateElement({
                        raw: '',
                        cooked: '',
                      }),
                      t.templateElement({
                        raw: '[',
                        cooked: '[',
                      }),
                      t.templateElement({
                        raw: '].value',
                        cooked: '].value',
                      }),
                    ],
                    [
                      name,
                      t.identifier('index')
                    ]
                  )
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
                    [
                      t.logicalExpression(
                        '||',
                        t.memberExpression(
                          t.identifier('props'),
                          t.identifier('options')
                        ),
                        t.arrayExpression()
                      )
                    ]
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
                    // options={states.options}
                    t.jSXAttribute(
                      t.jSXIdentifier('options'),
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
                              t.expressionStatement(
                                t.callExpression(
                                  t.memberExpression(
                                    t.identifier('innerProps'),
                                    t.identifier('onChange')
                                  ),
                                  [
                                    t.identifier('data')
                                  ]
                                )
                              ),
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
                            ]
                          )
                        )
                      )
                    ),
                    // onSearch={s => {...}}
                    t.jSXAttribute(
                      t.jSXIdentifier('onSearch'),
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
                                          ],
                                          t.unaryExpression(
                                            '!',
                                            t.unaryExpression(
                                              '!',
                                              t.identifier('s')
                                            )
                                          )
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
                                'const',
                                [
                                  t.variableDeclarator(
                                    t.identifier('found_options'),
                                    t.callExpression(
                                      t.memberExpression(
                                        t.logicalExpression(
                                          '||',
                                          t.memberExpression(
                                            t.identifier('props'),
                                            t.identifier('options')
                                          ),
                                          t.arrayExpression()
                                        ),
                                        t.identifier('filter')
                                      ),
                                      [
                                        t.arrowFunctionExpression(
                                          [
                                            t.identifier('option')
                                          ],
                                          t.blockStatement(
                                            [
                                              t.variableDeclaration(
                                                'const',
                                                [
                                                  t.variableDeclarator(
                                                    t.identifier('upper'),
                                                    t.callExpression(
                                                      t.optionalMemberExpression(
                                                        t.optionalMemberExpression(
                                                          t.identifier('option'),
                                                          t.identifier('value'),
                                                          computed=false,
                                                          optional=true,
                                                        ),
                                                        t.identifier('toUpperCase'),
                                                        computed=false,
                                                        optional=true,
                                                      ),
                                                      []
                                                    )
                                                  )
                                                ]
                                              ),
                                              /*
                                              t.expressionStatement(
                                                t.callExpression(
                                                  t.memberExpression(
                                                    t.identifier('console'),
                                                    t.identifier('log')
                                                  ),
                                                  [
                                                    t.identifier('upper')
                                                  ]
                                                )
                                              ),
                                              */
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
                                                      t.logicalExpression(
                                                        '&&',
                                                        t.unaryExpression(
                                                          '!',
                                                          t.unaryExpression(
                                                            '!',
                                                            t.identifier('accumulator')
                                                          )
                                                        ),
                                                        t.callExpression(
                                                          t.memberExpression(
                                                            t.identifier('upper'),
                                                            t.identifier('includes')
                                                          ),
                                                          [
                                                            t.identifier('item')
                                                          ]
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
                              t.expressionStatement(
                                t.callExpression(
                                  t.identifier('__setSearchOptions'),
                                  [
                                    t.identifier('found_options')
                                  ]
                                )
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

  // console.log(innerElement)

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
  reg_js_import(js_context, '@material-ui/core.IconButton')
  reg_js_import(js_context, '@material-ui/icons.AddCircleOutline')
  reg_js_import(js_context, '@material-ui/icons.RemoveCircleOutline')

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
        t.logicalExpression(
          '&&',
          t.unaryExpression(
            '!',
            t.unaryExpression(
              '!',
              t.memberExpression(
                t.identifier('props'),
                t.identifier('label')
              )
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
              t.jSXExpressionContainer(
                t.memberExpression(
                  t.identifier('props'),
                  t.identifier('label')
                )
              )
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
              t.jSXElement(
                t.jSXOpeningElement(
                  t.jSXIdentifier('@material-ui/core.Box'),
                  [
                    // key={item.id}
                    t.jSXAttribute(
                      t.jSXIdentifier('key'),
                      t.jSXExpressionContainer(
                        t.memberExpression(
                          t.identifier('item'),
                          t.identifier('id')
                        )
                      )
                    ),
                    // display="flex"
                    t.jSXAttribute(
                      t.jSXIdentifier('display'),
                      t.stringLiteral('flex')
                    ),
                    // style={width: '100%'}
                    t.jSXAttribute(
                      t.jSXIdentifier('style'),
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
                  t.jSXIdentifier('@material-ui/core.Box')
                ),
                [
                  // <Controller>...</Controller>
                  t.jSXElement(
                    t.jSXOpeningElement(
                      t.jSXIdentifier('react-hook-form.Controller'),
                      [
                        // key={item.id}
                        t.jSXAttribute(
                          t.jSXIdentifier('key'),
                          t.jSXExpressionContainer(
                            t.memberExpression(
                              t.identifier('item'),
                              t.identifier('id')
                            )
                          )
                        ),
                        // name={"input.name[${index}].value"}
                        t.jSXAttribute(
                          t.jSXIdentifier('name'),
                          t.jSXExpressionContainer(
                            // `name[${index}].value`
                            t.templateLiteral(
                              [
                                t.templateElement({
                                  raw: '',
                                  cooked: '',
                                }),
                                t.templateElement({
                                  raw: '[',
                                  cooked: '[',
                                }),
                                t.templateElement({
                                  raw: '].value',
                                  cooked: '].value',
                                }),
                              ],
                              [
                                name,
                                t.identifier('index')
                              ]
                            )
                          )
                        ),
                        // control={qualifiedName.control}
                        t.jSXAttribute(
                          t.jSXIdentifier('control'),
                          t.jSXExpressionContainer(
                            t.identifier(`${qualifiedName}.control`)
                          )
                        ),
                        // defaultValue={props.defaultValue}
                        t.jSXAttribute(
                          t.jSXIdentifier('defaultValue'),
                          t.jSXExpressionContainer(
                            t.optionalMemberExpression(
                              t.identifier('item'),
                              t.identifier('value'),
                              computed=false,
                              optional=true,
                            )
                          )
                        ),
                        // rules={props.rules}
                        t.jSXAttribute(
                          t.jSXIdentifier('rules'),
                          t.jSXExpressionContainer(
                            t.identifier('rules')
                          )
                        ),
                        // render={<Element>...</Element>}
                        t.jSXAttribute(
                          t.jSXIdentifier('render'),
                          t.jSXExpressionContainer(
                            t.arrowFunctionExpression(
                              [
                                t.identifier('innerProps')
                              ],
                              t.jSXElement(
                                t.jSXOpeningElement(
                                  t.jSXIdentifier('@material-ui/core.FormControl'),
                                  [
                                    // style={width: '100%'}
                                    t.jSXAttribute(
                                      t.jSXIdentifier('style'),
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
                                  t.jSXExpressionContainer(
                                    innerElement  // innerElement here
                                  )
                                ]
                              )
                            )
                          )
                        )
                      ]
                    ),
                    t.jSXClosingElement(
                      t.jSXIdentifier('react-hook-form.Controller'),
                    ),
                    []
                  ),
                  // <IconButton
                  //   key="remove"
                  //   aria-label="Remove"
                  //   size={props.size}
                  //   onClick={e => {
                  //     remove(index)
                  //     if (!!props.callback) {
                  //       props.callback()
                  //     }
                  //   }}
                  //   >
                  //   <RemoveCircleOutline />
                  // </IconButton>
                  t.jSXElement(
                    t.jSXOpeningElement(
                      t.jSXIdentifier('@material-ui/core.IconButton'),
                      [
                        t.jSXAttribute(
                          t.jSXIdentifier('key'),
                          t.stringLiteral('remove')
                        ),
                        t.jSXAttribute(
                          t.jSXIdentifier('aria-label'),
                          t.stringLiteral('Remove')
                        ),
                        t.jSXAttribute(
                          t.jSXIdentifier('size'),
                          t.jSXExpressionContainer(
                            t.memberExpression(
                              t.identifier('props'),
                              t.identifier('size')
                            )
                          )
                        ),
                        t.jSXAttribute(
                          t.jSXIdentifier('onClick'),
                          t.jSXExpressionContainer(
                            t.arrowFunctionExpression(
                              [
                                t.identifier('e')
                              ],
                              t.blockStatement(
                                [
                                  t.expressionStatement(
                                    t.callExpression(
                                      t.identifier(`${qualifiedName}.useFieldArray.${input.name}.remove`),
                                      [
                                        t.identifier('index')
                                      ]
                                    )
                                  ),
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
                                        []
                                      )
                                    )
                                  )
                                ]
                              )
                            )
                          )
                        )
                      ]
                    ),
                    t.jSXClosingElement(
                      t.jSXIdentifier('@material-ui/core.IconButton')
                    ),
                    [
                      t.jSXElement(
                        t.jSXOpeningElement(
                          t.jSXIdentifier('@material-ui/icons.RemoveCircleOutline'),
                          []
                        ),
                        t.jSXClosingElement(
                          t.jSXIdentifier('@material-ui/icons.RemoveCircleOutline')
                        ),
                        []
                      )
                    ]
                  )
                ]
              )
            )
          ]
        )
      ),
      // <IconButton
      //   key="add"
      //   aria-label="Add"
      //   size={props.size}
      //   onClick={e => {
      //     append({
      //       value: '',
      //     })
      //   }}
      //   >
      //   <AddCircleOutline />
      // </IconButton>
      t.jSXElement(
        t.jSXOpeningElement(
          t.jSXIdentifier('@material-ui/core.IconButton'),
          [
            t.jSXAttribute(
              t.jSXIdentifier('key'),
              t.stringLiteral('add')
            ),
            t.jSXAttribute(
              t.jSXIdentifier('aria-label'),
              t.stringLiteral('Add')
            ),
            t.jSXAttribute(
              t.jSXIdentifier('size'),
              t.jSXExpressionContainer(
                t.memberExpression(
                  t.identifier('props'),
                  t.identifier('size')
                )
              )
            ),
            t.jSXAttribute(
              t.jSXIdentifier('onClick'),
              t.jSXExpressionContainer(
                t.arrowFunctionExpression(
                  [
                    t.identifier('e')
                  ],
                  t.blockStatement(
                    [
                      t.expressionStatement(
                        t.callExpression(
                          t.identifier(`${qualifiedName}.useFieldArray.${input.name}.append`),
                          [
                            t.objectExpression(
                              [
                                t.objectProperty(
                                  t.identifier('value'),
                                  t.stringLiteral('')
                                )
                              ]
                            )
                          ]
                        )
                      )
                    ]
                  )
                )
              )
            )
          ]
        ),
        t.jSXClosingElement(
          t.jSXIdentifier('@material-ui/core.IconButton'),
        ),
        [
          t.jSXElement(
            t.jSXOpeningElement(
              t.jSXIdentifier('@material-ui/icons.AddCircleOutline'),
              []
            ),
            t.jSXClosingElement(
              t.jSXIdentifier('@material-ui/icons.AddCircleOutline')
            ),
            []
          )
        ]
      )
    ]
  )

  //////////////////////////////////////////////////////////////////////
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

  // set values
  const setValueExpression = (() => {
    return t.callExpression(
      t.identifier(`${qualifiedName}.setValue`),
      [
        name,
        t.memberExpression(
          t.identifier('props'),
          t.identifier('defaultValue')
        )
      ]
    )
  })()

  // return ((props, rules) => <Controller>...</Controller>)()
  const result = t.callExpression(
    t.arrowFunctionExpression(
      [
        t.identifier('props'),
        t.identifier('rules')
      ],
      t.blockStatement(
        [
          // const {...} = useFieldArray()
          fieldArrayVariables,
          // const {...} = props
          t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                t.objectPattern(
                  [
                    t.objectProperty(
                      t.identifier('type'),
                      t.identifier('type')
                    ),
                    t.objectProperty(
                      t.identifier('label'),
                      t.identifier('label')
                    ),
                    t.objectProperty(
                      t.identifier('defaultValue'),
                      t.identifier('defaultValue')
                    ),
                    t.objectProperty(
                      t.identifier('multiline'),
                      t.identifier('multiline')
                    ),
                    t.objectProperty(
                      t.identifier('autocomplete'),
                      t.identifier('autocomplete')
                    ),
                    t.objectProperty(
                      t.identifier('options'),
                      t.identifier('options')
                    ),
                    t.objectProperty(
                      t.identifier('callback'),
                      t.identifier('callback')
                    ),
                    t.restElement(
                      t.identifier('restProps')
                    )
                  ]
                ),
                t.identifier('props')
              )
            ]
          ),
          // setValue(input.name, props.defaultValue)
          t.expressionStatement(
            setValueExpression
          ),
          //  return <Controller>...</Controller>
          t.returnStatement(
            controlElement
          )
        ]
      )
    ),
    [
      propsExpression,
      rulesExpression,
    ]
  )

  // check for JSX_CONTEXT
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
