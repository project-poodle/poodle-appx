const { parse, parseExpression } = require('@babel/parser')
const generate = require('@babel/generator').default
const t = require("@babel/types")
const prettier = require("prettier")
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
  js_resolve_ids,
  _js_parse_snippet,
  _js_parse_statements,
  _js_parse_expression,
  _js_generate_expression,
  _parse_var_full_path,
  lookup_type_for_data,
  type_matches_spec,
  data_matches_spec,
  check_input_data,
} = require('./util_base')


////////////////////////////////////////////////////////////////////////////////
// utility function to process child
function _process_child(js_context, childSpec, childData) {
  // require here to avoid circular require reference
  const { js_process } = require('./util_code')
  // base process
  let processed = js_process(
    js_context,
    childSpec.name,
    childData
  )
  // check type spec
  const found = childSpec.types.find(type => data_matches_spec(js_context, childData, [type]))
  if (!!found) {
    if (!!found.parse) {
      processed = _js_parse_expression(
        js_context,
        String(childData),
        {
          plugins: [
            'jsx', // support jsx
          ]
        },
        {
          '$child': processed
        }
      )
      // JSX context
      if (!!js_context.CONTEXT_JSX) {
        processed = t.jSXExpressionContainer(
          processed
        )
      }
    } else if (!!found.expr) {
      processed = _js_parse_expression(
        js_context,
        found.expr,
        {
          plugins: [
            'jsx', // support jsx
          ]
        },
        {
          '$child': processed
        }
      )
      // JSX context
      if (!!js_context.CONTEXT_JSX) {
        processed = t.jSXExpressionContainer(
          processed
        )
      }
    } else if (!!found.stmt) {
      processed = _js_parse_statements(
        js_context,
        found.stmt,
        {
          plugins: [
            'jsx', // support jsx
          ]
        },
        {
          '$child': processed
        }
      )
    }
  }
  // return
  return processed
}


////////////////////////////////////////////////////////////////////////////////
// create template custom
function template_custom(js_context, ref, input) {
  // require here to avoid circular require reference
  const { js_process } = require('./util_code')

  if (!('_type' in input)) {
    throw new Error(`ERROR: input._type is not defined [${input._type}] [${JSON.stringify(input)}]`)
  }

  check_input_data(js_context, input)

  const typeSpec = js_context.spec.types[input._type]
  if (typeSpec.template?.kind !== 'custom') {
    throw new Error(`ERROR: [${input._type}] template is not custom [${typeSpec.template}]`)
  }

  // prepare variables
  const variables = (() => {
    const result = {}
    typeSpec.children
      .map(child => {
        if (child.name === '*') {
          Object.keys(input)
            .filter(key => key !== '_type')
            .map(key => {
            result[`$${key}`] = _process_child(
              {
                ...js_context,
                CONTEXT_STATEMENT: false,
                CONTEXT_JSX: false,
                CONTEXT_CUSTOM_CHILD: child.customChild,
              },
              child,
              input[key]
            )
            result[`$${key}$raw`] = input[key]
          })
        } else if (! (child.name in input)) {
          // if not present
          result[`$${child.name}`] = t.nullLiteral()
          result[`$${child.name}$raw`] = t.nullLiteral()
        } else if (!!child.array) {
          // if array
          result[`$${child.name}`] = t.arrayExpression(
            input[child.name].map(data => {
              return _process_child(
                {
                  ...js_context,
                  CONTEXT_STATEMENT: false,
                  CONTEXT_JSX: false,
                  CONTEXT_CUSTOM_CHILD: child.customChild,
                },
                child,
                data
              )
            })
          )
          result[`$${child.name}$raw`] = input[child.name]
        } else {
          // if not array
          result[`$${child.name}`] = _process_child(
            {
              ...js_context,
              CONTEXT_STATEMENT: false,
              CONTEXT_JSX: false,
              CONTEXT_CUSTOM_CHILD: child.customChild,
            },
            child,
            input[child.name]
          )
          result[`$${child.name}$raw`] = input[child.name]
        }
      })
    return result
  })()

  // typeSpec expr
  let stmt = false
  let processed = null
  if (!!typeSpec.template?.expr) {
    // if expr is defined
    // const expr = prettier.format(typeSpec.template.expr, { semi: false, parser: "babel" })
    // console.log(expr)
    processed = _js_parse_expression(
      js_context,
      typeSpec.template.expr,
      {
        plugins: [
          'jsx', // support jsx
        ]
      },
      variables
    )
  } else if (!!typeSpec.template?.stmt) {
    // if stmt is defined
    // const stmt = prettier.format(typeSpec.template.stmt, { semi: false, parser: "babel" })
    // console.log(stmt)
    processed = _js_parse_statements(
      js_context,
      typeSpec.template.stmt,
      {
        plugins: [
          'jsx', // support jsx
        ]
      },
      variables
    )
    stmt = true
  } else {
    // invalid syntax
    throw new Error(`ERROR: [${input._type}] template [custom] missing [expr] or [stmt] [${JSON.stringify(input.template, null, 2)}]`)
  }

  //////////////////////////////////////////////////////////////////////
  // check for CONTEXT_JSX and return
  if (!!stmt) {
    // console.log(processed)
    return t.blockStatement(
      processed
    )
  } else if (js_context.CONTEXT_STATEMENT) {
    // console.log(`reg`, js_context, ref)
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          processed
        )
      ]
    )
  } else if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      processed
    )
  } else {
    return processed
  }
}

////////////////////////////////////////////////////////////////////////////////
// create template react/element
function template_react_element(js_context, ref, input) {

  // require here to avoid circular require reference
  const { js_process } = require('./util_code')

  if (!('_type' in input)) {
    throw new Error(`ERROR: input._type is not defined [${input._type}] [${JSON.stringify(input)}]`)
  }

  check_input_data(js_context, input)

  const typeSpec = js_context.spec.types[input._type]
  if (typeSpec.template?.kind !== 'react/element') {
    throw new Error(`ERROR: [${input._type}] template is not react/element [${typeSpec.template}]`)
  }

  reg_js_import(js_context, input.name)

  // result element
  const resultElement = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier(input.name),
      typeSpec.children
        .filter(child => child.name !== '*' && child.name !== 'name' && child.name !== 'children')
        .map(child => {
          if (! (child.name in input)) {
            // if not present
            return undefined
          } else if (!!child.array) {
            // if array
            return t.jSXAttribute(
              t.jSXIdentifier(child.name),
              t.jSXExpressionContainer(
                t.arrayExpression(
                  input[child.name].map(data => {
                    return _process_child(
                      {
                        ...js_context,
                        CONTEXT_STATEMENT: false,
                        CONTEXT_JSX: false,
                        CONTEXT_CUSTOM_CHILD: child.customChild,
                      },
                      child,
                      data
                    )
                  })
                )
              )
            )
          } else {
            // if not array
            return t.jSXAttribute(
              t.jSXIdentifier(child.name),
              _process_child(
                {
                  ...js_context,
                  CONTEXT_STATEMENT: false,
                  CONTEXT_JSX: true,
                  CONTEXT_CUSTOM_CHILD: child.customChild,
                },
                child,
                input[child.name]
              )
            )
          }
        })
        .concat(
          js_context.CONTEXT_CUSTOM_CHILD?.map(child => {
            if (! (child.name in input)) {
              // if not present
              return undefined
            } else if (!!child.array) {
              // if array
              return t.jSXAttribute(
                t.jSXIdentifier(child.name),
                t.jSXExpressionContainer(
                  t.arrayExpression(
                    input[child.name].map(data => {
                      return _process_child(
                        {
                          ...js_context,
                          CONTEXT_STATEMENT: false,
                          CONTEXT_JSX: false,
                          CONTEXT_CUSTOM_CHILD: child.customChild,
                        },
                        child,
                        data
                      )
                    })
                  )
                )
              )
            } else {
              // if not array
              return t.jSXAttribute(
                t.jSXIdentifier(child.name),
                _process_child(
                  {
                    ...js_context,
                    CONTEXT_STATEMENT: false,
                    CONTEXT_JSX: true,
                    CONTEXT_CUSTOM_CHILD: child.customChild,
                  },
                  child,
                  input[child.name]
                )
              )
            }
          })
        )
        .flat(2)
        .filter(child => child !== undefined) // remove undefined
    ),
    t.jSXClosingElement(
      t.jSXIdentifier(input.name)
    ),
    !!input.children
    ? input.children.map(child => {
        return js_process(
          {
            ...js_context,
            CONTEXT_STATEMENT: false,
            CONTEXT_JSX: true,
            CONTEXT_CUSTOM_CHILD: child.customChild,
          },
          null,
          child
        )
      })
    : []
  )

  //////////////////////////////////////////////////////////////////////
  // check for CONTEXT_JSX and return
  if (js_context.CONTEXT_STATEMENT) {
    // console.log(`reg`, js_context, ref)
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          resultElement
        )
      ]
    )
  // } else if (js_context.CONTEXT_JSX) {
  //   return t.jSXExpressionContainer(
  //     resultElement
  //   )
  } else {
    return resultElement
  }
}


////////////////////////////////////////////////////////////////////////////////
// process template js/object
function template_js_object(js_context, ref, input) {

  // require here to avoid circular require reference
  const { js_process } = require('./util_code')

  if (!('_type' in input)) {
    throw new Error(`ERROR: input._type is not defined [${input._type}] [${JSON.stringify(input)}]`)
  }

  check_input_data(js_context, input)

  const typeSpec = js_context.spec.types[input._type]
  if (typeSpec.template?.kind !== 'js/object') {
    throw new Error(`ERROR: [${input._type}] template is not js/object [${typeSpec.template}]`)
  }

  // result expression
  const resultExpression = t.objectExpression(
    typeSpec.children
      .map(child => {
        if (child.name === '*') {
          return Object.keys(input).filter(key => key !== '_type').map(key => {
            return t.objectProperty(
              t.identifier(key),
              _process_child(
                {
                  ...js_context,
                  CONTEXT_STATEMENT: false,
                  CONTEXT_JSX: false,
                  CONTEXT_CUSTOM_CHILD: child.customChild,
                },
                child,
                input[key]
              )
            )
          })
        } else if (! (child.name in input)) {
          // if not present
          return undefined
        } else if (!!child.array) {
          // if array
          return t.objectProperty(
            t.identifier(child.name),
            t.arrayExpression(
              input[child.name].map(data => {
                return _process_child(
                  {
                    ...js_context,
                    CONTEXT_STATEMENT: false,
                    CONTEXT_JSX: false,
                    CONTEXT_CUSTOM_CHILD: child.customChild,
                  },
                  child,
                  data
                )
              })
            )
          )
        } else {
          // if not array
          return t.objectProperty(
            t.identifier(child.name),
            _process_child(
              {
                ...js_context,
                CONTEXT_STATEMENT: false,
                CONTEXT_JSX: false,
                CONTEXT_CUSTOM_CHILD: child.customChild,
              },
              child,
              input[child.name]
            )
          )
        }
      })
      .concat(
        js_context.CONTEXT_CUSTOM_CHILD?.map(child => {
          if (! (child.name in input)) {
            // if not present
            return undefined
          } else if (!!child.array) {
            // if array
            return t.objectProperty(
              t.identifier(child.name),
              t.arrayExpression(
                input[child.name].map(data => {
                  return _process_child(
                    {
                      ...js_context,
                      CONTEXT_STATEMENT: false,
                      CONTEXT_JSX: false,
                      CONTEXT_CUSTOM_CHILD: child.customChild,
                    },
                    child,
                    data
                  )
                })
              )
            )
          } else {
            // if not array
            return t.objectProperty(
              t.identifier(child.name),
              _process_child(
                {
                  ...js_context,
                  CONTEXT_STATEMENT: false,
                  CONTEXT_JSX: false,
                  CONTEXT_CUSTOM_CHILD: child.customChild,
                },
                child,
                input[child.name]
              )
            )
          }
        })
      )
      .flat(2)
      .filter(child => child !== undefined) // remove undefined
    )

  //////////////////////////////////////////////////////////////////////
  // check for CONTEXT_JSX and return
  if (js_context.CONTEXT_STATEMENT) {
    // console.log(`reg`, js_context, ref)
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          resultExpression
        )
      ]
    )
  } else if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      resultExpression
    )
  } else {
    return resultExpression
  }
}

////////////////////////////////////////////////////////////////////////////////
// export
module.exports = {
  template_custom: template_custom,
  template_react_element: template_react_element,
  template_js_object: template_js_object,
}
