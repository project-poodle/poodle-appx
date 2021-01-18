//const babel = require('@babel/standalone')
//const generate = require('@babel/generator').default
const { parse, parseExpression } = require('@babel/parser')
const t = require("@babel/types")
const db = require('../db/db')
const {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  SPECIAL_CHARACTER,
  JSX_CONTEXT,
  // REQUIRE_FUNCTION,
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
  _js_parse_statements,
  _js_parse_expression,
  _parse_var_full_path,
} = require('./util_base')
const {
  react_form,
  input_text,
  input_switch,
  input_select,
  input_rule,
} = require('./util_form')


////////////////////////////////////////////////////////////////////////////////
// create primitive js ast
function js_primitive(js_context, input) {

  let result = null
  switch (typeof input) {
    case 'string':
      result = t.stringLiteral(input)
      break
    case 'number':
      result = t.numericLiteral(input)
      break
    case 'boolean':
      result = t.booleanLiteral(input)
      break
    case 'object':
      if (input === null) {
        result = t.nullLiteral()
        break
      } else {
        throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
      }
    case 'undefined':
      result = t.nullLiteral()
      break
    default:
      throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
  }

  if (!!js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      result
    )
  } else {
    return result
  }
}

// create string ast
function js_string(js_context, input) {
  // check input._type
  if (!('_type' in input) || input._type !== 'js/string') {
    throw new Error(`ERROR: input._type is not [js/string] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!!js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      t.stringLiteral(String(input.data))
    )
  } else {
    return t.stringLiteral(String(input.data))
  }
}

// create numeric ast
function js_number(js_context, input) {
  // check input._type
  if (!('_type' in input) || input._type !== 'js/number') {
    throw new Error(`ERROR: input._type is not [js/number] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!!js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      t.numericLiteral(Number(input.data))
    )
  } else {
    return t.numericLiteral(Number(input.data))
  }
}

// create boolean ast
function js_boolean(js_context, input) {
  // check input._type
  if (!('_type' in input) || input._type !== 'js/boolean') {
    throw new Error(`ERROR: input._type is not [js/boolean] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!!js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      t.booleanLiteral(Boolean(input.data))
    )
  } else {
    return t.booleanLiteral(Boolean(input.data))
  }
}

// create null ast
function js_null(js_context, input) {
  // check input._type
  if (!('_type' in input) || input._type !== 'js/null') {
    throw new Error(`ERROR: input._type is not [js/null] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!!js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      t.nullLiteral()
    )
  } else {
    return t.nullLiteral()
  }
}

// create array js ast
// js_array is true - will return result as an array of data
// js_array is false - will return arrayExpression
function js_array(js_context, input) {

  if (isPrimitive(input)) {
    throw new Error(`ERROR: input is primitive [${JSON.stringify(input)}]`)
  }

  if (typeof input !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${JSON.stringify(input)}]`)
  }

  if (!Array.isArray(input)) {
    throw new Error(`ERROR: input is not array [${typeof input}] [${JSON.stringify(input)}]`)
  }

  const arrayExpression = t.arrayExpression(
    input.map((row, index) => {
      return js_process
      (
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath:
            !!js_context.parentPath
            ? t.memberExpression(js_context.parentPath, t.numericLiteral(index), true)
            : null
        },
        row
      )
    })
  )

  if (!!js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      arrayExpression
    )
  } else {
    return arrayExpression
  }
}

// create object ast
function js_object(js_context, input) {

  if (isPrimitive(input)) {
    throw new Error(`ERROR: input is primitive [${JSON.stringify(input)}]`)
  }

  if (typeof input !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${JSON.stringify(input)}]`)
  }

  if (Array.isArray(input)) {
    throw new Error(`ERROR: input is array [${typeof input}] [${JSON.stringify(input)}]`)
  }

  const objectExpression = t.objectExpression(
    Object.keys(input).map(key => {
      const value = input[key]
      if (key.startsWith('...')) {
        // handle spread syntax
        return t.spreadElement(
          js_process
          (
            {
              ...js_context,
              topLevel: false,
              parentRef: key,
              parentPath:
                !!js_context.parentPath
                ? js_context.parentPath
                : null,
              JSX_CONTEXT: false,
            },
            value
          )
        )
      } else {
        return t.objectProperty(
          t.stringLiteral(key),
          js_process
          (
            {
              ...js_context,
              topLevel: false,
              parentRef: key,
              parentPath:
                !!js_context.parentPath
                ? t.memberExpression(js_context.parentPath, t.identifier(key))
                : null,
              JSX_CONTEXT: false,
            },
            value
          )
        )
      }
    })
  )

  if (!!js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      objectExpression
    )
  } else {
    return objectExpression
  }
}

// create import ast
function js_import(js_context, input) {

  if (!('_type' in input) || input._type !== 'js/import') {
    throw new Error(`ERROR: input._type is not [js/import] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/import] [${JSON.stringify(input)}]`)
  }

  reg_js_import(js_context, input.name, use_default=false)

  // return imported name as result
  return t.identifier(input.name)
}

// create export ast
function js_export(js_context, input) {

  if (!('_type' in input) || input._type !== 'js/export') {
    throw new Error(`ERROR: input._type is not [js/export] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/export] [${JSON.stringify(input)}]`)
  }

  if (input.default) {

    return t.exportDefaultSpecifier(
      t.identifier(input.name)
    )
  } else {

    return t.exportSpecifier(
      t.identifier(input.name),
      t.identifier(input.name)
    )
  }
}

// create variable declaration ast
function js_variable(js_context, input) {

  if (!('_type' in input) || input._type !== 'js/variable') {
    throw new Error(`ERROR: input._type is not [js/variable] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/variable] [${JSON.stringify(input)}]`)
  }

  if (! ('expression' in input)) {
    throw new Error(`ERROR: input.expression missing in [js/variable] [${JSON.stringify(input)}]`)
  }

  return t.variableDeclaration(
    input.kind ? input.kind : 'const',
    [
      t.variableDeclarator(
        t.identifier(input.name),
        isPrimitive(input.expression)
          ? js_process
            (
              {
                ...js_context,
                topLevel: false,
                parentRef: null,
                parentPath: null,
              },
              {
                _type: 'js/expression',
                data: String(input.expression)
              }
            )
          : js_process
            (
              {
                ...js_context,
                topLevel: false,
                parentRef: null,
                parentPath: null,
              },
              input.expression
            )
      )
    ]
  )
}

// create expression ast
function js_expression(js_context, input) {

  let data = ''
  if (typeof input === 'string' && input.trim().startsWith('`') && input.trim().endsWith('`')) {

    data = input

  } else if (isPrimitive(input)) {

    return js_primitive(js_context, input)

  } else {

    if (!('_type' in input) || input._type !== 'js/expression') {
      throw new Error(`ERROR: input._type is not [js/expression] [${input._type}] [${JSON.stringify(input)}]`)
    }

    if (! ('data' in input)) {
      throw new Error(`ERROR: input.data missing in [js/expression] [${JSON.stringify(input)}]`)
    }

    data = String(input.data)
  }

  if (js_context.JSX_CONTEXT) {
    const parsed = _js_parse_expression(js_context, data, {
      plugins: [
        'jsx', // support jsx here
      ]
    })
    return t.jSXExpressionContainer(
      parsed
    )
  } else {
    const parsed = _js_parse_expression(js_context, data, {
      plugins: [
        // 'jsx', // do not support jsx here
      ]
    })
    return parsed
  }
}

// create block ast (allow return outside of function)
function js_statement(js_context, input) {

  if (!('_type' in input) || input._type !== 'js/statement') {
    throw new Error(`ERROR: input._type is not [js/statement] [${input._type}] [${JSON.stringify(input)}]`)
  }

  // block statements
  const block_statements = []
  if (!!input.body) {
    if (!Array.isArray(input.body)) {
      throw new Error(`ERROR: input.body is not [array] [${input._type}] [${JSON.stringify(input)}]`)
    }
    // handle body
    input.body.map(statement => {
      if (typeof statement === 'string') {
        // parse user code snippet
        const statements = _js_parse_statements(js_context, statement, {
          // sourceType: 'module', // do not support module here
          allowReturnOutsideFunction: true, // allow return in the block statement
          plugins: [
            // 'jsx', // do not support jsx here
          ]
        })
        // add to block statements
        statements.map(sub_statement => {
          block_statements.push(sub_statement)
        })
      } else {
        // process child statements
        const child_statement = js_process(
          {
            ...js_context,
            topLevel: false,
            parentRef: null,
            parentPath: null,
            JSX_CONTEXT: false,
          },
          statement
        )
        // console.log(`statement`, statement, child_statement)
        // add to block statements
        if (t.isBlockStatement(child_statement)) {
          child_statement.body.map(sub_statement => {
            block_statements.push(sub_statement)
          })
        } else {
          block_statements.push(child_statement)
        }
      }
    })
  }

  return t.blockStatement(
    block_statements
  )
}

// create array function ast
function js_function(js_context, input) {

  if (!('_type' in input) || input._type !== 'js/function') {
    throw new Error(`ERROR: input._type is not [js/function] [${input._type}] [${JSON.stringify(input)}]`)
  }

  const params =
    !!input.params
    ? input.params.map(
        param => {
          if (typeof param === 'string') {
            return t.identifier(param)
          } else if (typeof param === 'object'
                    && !!param
                    && !!param.value
                    && typeof param.value === 'string') {
            return t.identifier(param.value)
          } else {
            throw new Error(`ERROR: invalid params format in [js/function] [${JSON.stringify(input)}]`)
          }
        }
      )
    : []

  // block statements
  const block_statements = []
  if (!!input.body) {
    if (!Array.isArray(input.body)) {
      throw new Error(`ERROR: input.body is not [array] [${input._type}] [${JSON.stringify(input)}]`)
    }
    // handle body
    input.body.map(statement => {
      if (typeof statement === 'string') {
        // parse user code snippet
        const statements = _js_parse_statements(js_context, statement, {
          // sourceType: 'module', // do not support module here
          allowReturnOutsideFunction: true, // allow return in the block statement
          plugins: [
            // 'jsx', // do not support jsx here
          ]
        })
        // add to block statements
        statements.map(sub_statement => {
          block_statements.push(sub_statement)
        })
      } else {
        // process child statements
        const child_statement = js_process(
          {
            ...js_context,
            topLevel: false,
            parentRef: null,
            parentPath: null,
            JSX_CONTEXT: false,
          },
          statement
        )
        // console.log(`statement`, statement, child_statement)
        // add to block statements
        if (t.isBlockStatement(child_statement)) {
          child_statement.body.map(sub_statement => {
            block_statements.push(sub_statement)
          })
        } else {
          block_statements.push(child_statement)
        }
      }
    })
  }

  const functionExpression = t.arrowFunctionExpression(
    params,
    t.blockStatement(
      block_statements
    ),
    input.async ? true : false
  )

  if (!!js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      functionExpression
    )
  } else {
    return functionExpression
  }
}

// create call ast
function js_call(js_context, input) {

  if (!('_type' in input) || input._type !== 'js/function') {
    throw new Error(`ERROR: input._type is not [js/call] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/call] [${JSON.stringify(input)}]`)
  }

  const callExpression = t.callExpression(
    t.identifier(input.name),
    input.params ? input.params.map(
      param => js_process
      (
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        param))
     : []
  )

  if (!!js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      callExpression
    )
  } else {
    return callExpression
  }
}

// create switch ast
function js_switch(js_context, input) {

  if (!('_type' in input) || input._type !== 'js/switch') {
    throw new Error(`ERROR: input._type is not [js/switch] [${input._type}] [${JSON.stringify(input)}]`)
  }

  // create default return statement
  let ifElseStatements = t.returnStatement(
    t.nullLiteral()
  )
  if ('default' in input) {
    ifElseStatements = t.returnStatement(
      js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.default
      )
    )
  }

  // input.children is optional
  if (!!input.children) {
    // check input.children is an array
    if (! Array.isArray(input.children)) {
      throw new Error(`ERROR: input.children is not Array [${JSON.stringify(input)}]`)
    }

    // stack the conditions
    [...input.children].reverse().map(child => {
      if (!child) {
        throw new Error(`ERROR: [js/switch] child is empty [${JSON.stringify(child)}]`)
      }
      if (typeof child !== 'object') {
        throw new Error(`ERROR: [js/switch] child is not object type [${JSON.stringify(child)}]`)
      }
      if (! ('condition' in child)) {
        throw new Error(`ERROR: [js/switch] child missing [condition] [${JSON.stringify(child)}]`)
      }
      if (! ('result' in child)) {
        throw new Error(`ERROR: [js/switch] child missing [result] [${JSON.stringify(child)}]`)
      }
      // stack if/else statement
      ifElseStatements = t.ifStatement(
        js_process(
          {
            ...js_context,
            topLevel: false,
            parentRef: null,
            parentPath: null,
            JSX_CONTEXT: false,
          },
          {
            _type: 'js/expression',
            data: String(child.condition),
          }
        ),
        t.returnStatement(
          js_process(
            {
              ...js_context,
              topLevel: false,
              parentRef: null,
              parentPath: null,
            },
            child.result
          )
        ),
        ifElseStatements
      )
    })
  }

  // generate call expression
  const callExpression = t.callExpression(
    t.functionExpression(
      null,
      [],
      t.blockStatement(
        [
          ifElseStatements
        ]
      )
    ),
    []
  )

  // return with context
  if (js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      callExpression
    )
  } else {
    return callExpression
  }
}

// create js map ast
function js_map(js_context, input) {

  if (!('_type' in input) || input._type !== 'js/map') {
    throw new Error(`ERROR: input._type is not [js/map] [${input._type}] [${JSON.stringify(input)}]`)
  }

  // process input expression
  const dataExpression =
    !!input.data
    ? js_process              // process data if exists
      (
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.data
      )
    : t.arrayExpression([])   // return empty array if not

  // process mapper expression
  const resultExpression =
    !!input.result
    ? js_process              // process result if exists
      (
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
        },
        input.result
      )
    : t.nullLiteral()         // return null if not

  // process call expression
  const callExpression = t.callExpression(
    t.functionExpression(
      null,
      [],
      t.blockStatement(
        [
          // const input = inputExpression
          t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                t.identifier('data'),
                dataExpression
              )
            ]
          ),
          // check if input is null, array, or object, or neither
          t.ifStatement(
            // !input (input is null or undefined)
            t.unaryExpression(
              '!',
              t.identifier('data')
            ),
            // return null
            t.returnStatement(
              t.nullLiteral()
            ),
            // else if
            t.ifStatement(
              t.callExpression(
                // Array.isArray(input)
                t.memberExpression(
                  t.identifier('Array'),
                  t.identifier('isArray')
                ),
                [
                  t.identifier('data')
                ]
              ),
              // return input.map((item, key) => { ... })
              t.returnStatement(
                t.callExpression(
                  t.memberExpression(
                    t.identifier('data'),
                    t.identifier('map')
                  ),
                  [
                    t.arrowFunctionExpression(
                      [
                        t.identifier('item'),
                        t.identifier('key')
                      ],
                      t.blockStatement(
                        [
                          // return ...mapper
                          t.returnStatement(
                            resultExpression
                          )
                        ]
                      )
                    )
                  ]
                )
              ),
              // else if
              t.ifStatement(
                // typeof input == 'object'
                t.binaryExpression(
                  "===",
                  t.unaryExpression(
                    "typeof",
                    t.identifier('data')
                  ),
                  t.stringLiteral('object')
                ),
                t.blockStatement(
                  [
                    // Object.keys(input).map(key => { ... })
                    t.returnStatement(
                      t.callExpression(
                        t.memberExpression(
                          t.callExpression(
                            t.memberExpression(
                              t.identifier('Object'),
                              t.identifier('keys')
                            ),
                            [
                              t.identifier('data'),
                            ]
                          ),
                          t.identifier('map')
                        ),
                        [
                          t.arrowFunctionExpression(
                            [
                              t.identifier('key')
                            ],
                            t.blockStatement(
                              [
                                // const item = input[key]
                                t.variableDeclaration(
                                  'const',
                                  [
                                    t.variableDeclarator(
                                      t.identifier('item'),
                                      t.memberExpression(
                                        t.identifier('data'),
                                        t.identifier('key'),
                                        computed=true
                                      )
                                    )
                                  ]
                                ),
                                // return ...mapper
                                t.returnStatement(
                                  resultExpression
                                )
                              ]
                            )
                          )
                        ]
                      )
                    )
                  ]
                ),
                // else
                t.throwStatement(
                  // throw new Error(`ERROR mapper input is neither Array nor Object [typeof input]`)
                  t.newExpression(
                    t.identifier('Error'),
                    [
                      t.binaryExpression(
                        '+',
                        t.stringLiteral(
                          'ERROR: mapper input data is neither Array nor Object ['
                        ),
                        t.binaryExpression(
                          '+',
                          t.parenthesizedExpression(
                            t.unaryExpression(
                              'typeof',
                              t.identifier('data')
                            )
                          ),
                          t.stringLiteral(']')
                        )
                      )
                    ]
                  )
                )
              )
            )
          )
        ]
      )
    ),
    []
  )

  // return with context
  if (js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      callExpression
    )
  } else {
    return callExpression
  }
}

// create js reduce ast
function js_reduce(js_context, input) {

  if (!('_type' in input) || input._type !== 'js/reduce') {
    throw new Error(`ERROR: input._type is not [js/reduce] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('reducer' in input)) {
    throw new Error(`ERROR: input.reducer missing in [js/reduce] [${JSON.stringify(input)}]`)
  }

  // process input expression
  const dataExpression =
    !!input.data
    ? js_process                  // process data if exist
      (
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.data
      )
    : t.arrayExpression([])       // return empty array if not

  // process mapper expression
  const reducerExpression =
    !!input.reducer
    ? js_process                  // return reducer expression if exist
      (
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        {
          _type: 'js/expression',
          data: String(input.reducer)
        }
      )
    : t.returnStatement           // return the last item if not
      (
        t.identifier('item')
      )

  // process init expression
  const initExpression =
    !!input.init
    ? !!isPrimitive(input.init)
      ? js_process                    // process init as expression if primitive
        (
          {
            ...js_context,
            topLevel: false,
            parentRef: null,
            parentPath: null,
            JSX_CONTEXT: false,
          },
          {
            _type: 'js/expression',
            data: String(input.init)
          }
        )
      : js_process                    // process init as typed object
        (
          {
            ...js_context,
            topLevel: false,
            parentRef: null,
            parentPath: null,
            JSX_CONTEXT: false,
          },
          input.init,
        )
    : t.nullLiteral()                 // return null if not exists

  // process call expression
  const callExpression = t.callExpression(
    t.functionExpression(
      null,
      [],
      t.blockStatement(
        [
          // const input = inputExpression
          t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                t.identifier('data'),
                dataExpression
              )
            ]
          ),
          // check if input is null, array, or object, or neither
          t.ifStatement(
            // !input (input is null or undefined)
            t.unaryExpression(
              '!',
              t.identifier('data')
            ),
            // return null
            t.returnStatement(
              t.nullLiteral()
            ),
            // else if
            t.ifStatement(
              t.callExpression(
                // Array.isArray(input)
                t.memberExpression(
                  t.identifier('Array'),
                  t.identifier('isArray')
                ),
                [
                  t.identifier('data')
                ]
              ),
              // return input.map((item, key) => { ... })
              t.returnStatement(
                t.callExpression(
                  t.memberExpression(
                    t.identifier('data'),
                    t.identifier('reduce')
                  ),
                  t.arrowFunctionExpression(
                    [
                      t.identifier('result'),
                      t.identifier('item'),
                      t.identifier('key')
                    ],
                    t.blockStatement(
                      [
                        // return ...reducer
                        t.returnStatement(
                          reducerExpression
                        )
                      ]
                    )
                  ),
                  initExpression
                )
              ),
              // else if
              t.ifStatement(
                // typeof input == 'object'
                t.binaryExpression(
                  "===",
                  t.unaryExpression(
                    "typeof",
                    t.identifier('data')
                  ),
                  t.stringLiteral('object')
                ),
                t.blockStatement(
                  [
                    // Object.keys(input).map(key => { ... })
                    t.returnStatement(
                      t.callExpression(
                        t.memberExpression(
                          t.callExpression(
                            t.memberExpression(
                              t.identifier('Object'),
                              t.identifier('keys')
                            ),
                            [
                              t.identifier('data'),
                            ]
                          ),
                          t.identifier('reduce')
                        ),
                        [
                          t.arrowFunctionExpression(
                            [
                              t.identifier('result'),
                              t.identifier('key')
                            ],
                            t.blockStatement(
                              [
                                // const item = input[key]
                                t.variableDeclaration(
                                  'const',
                                  [
                                    t.variableDeclarator(
                                      t.identifier('item'),
                                      t.memberExpression(
                                        t.identifier('input'),
                                        t.identifier('key'),
                                        computed=true
                                      )
                                    )
                                  ]
                                ),
                                // return ...reducer
                                t.returnStatement(
                                  reduceExpression
                                )
                              ]
                            )
                          ),
                          initExpression
                        ]
                      )
                    )
                  ]
                ),
                // else
                t.throwStatement(
                  // throw new Error(`ERROR mapper input is neither Array nor Object [typeof input]`)
                  t.newExpression(
                    t.identifier('Error'),
                    [
                      t.binaryExpression(
                        '+',
                        t.stringLiteral(
                          'ERROR: reducer input data is neither Array nor Object ['
                        ),
                        t.binaryExpression(
                          '+',
                          t.parenthesizedExpression(
                            t.unaryExpression(
                              'typeof',
                              t.identifier('data')
                            )
                          ),
                          t.stringLiteral(']')
                        )
                      )
                    ]
                  )
                )
              )
            )
          )
        ]
      )
    ),
    []
  )

  // return with context
  if (js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      callExpression
    )
  } else {
    return callExpression
  }
}

// create js reduce ast
function js_filter(js_context, input) {

  if (!('_type' in input) || input._type !== 'js/filter') {
    throw new Error(`ERROR: input._type is not [js/filter] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('filter' in input)) {
    throw new Error(`ERROR: input.filter missing in [js/filter] [${JSON.stringify(input)}]`)
  }

  // process input expression
  const dataExpression =
    !!input.data
    ? js_process                  // process input.data if exists
      (
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.data
      )
    : t.arrayExpression([])       // return empty array if not

  // process filter expression
  const filterExpression =
    !!input.filter
    ? js_process                  // parse filter expression if exists
      (
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        {
          _type: 'js/expression',
          data: String(input.filter),
        }
      )
    : t.booleanLiteral(true)      // return true if not

  // process call expression
  const callExpression = t.callExpression(
    t.functionExpression(
      null,
      [],
      t.blockStatement(
        [
          // const input = inputExpression
          t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                t.identifier('data'),
                dataExpression
              )
            ]
          ),
          // check if input is null, array, or object, or neither
          t.ifStatement(
            // !input (input is null or undefined)
            t.unaryExpression(
              '!',
              t.identifier('data')
            ),
            // return null
            t.returnStatement(
              t.nullLiteral()
            ),
            // else if
            t.ifStatement(
              t.callExpression(
                // Array.isArray(input)
                t.memberExpression(
                  t.identifier('Array'),
                  t.identifier('isArray')
                ),
                [
                  t.identifier('data')
                ]
              ),
              // return input.map((item, key) => { ... })
              t.returnStatement(
                t.callExpression(
                  t.memberExpression(
                    t.identifier('data'),
                    t.identifier('filter')
                  ),
                  [
                    t.arrowFunctionExpression(
                      [
                        t.identifier('item'),
                        t.identifier('key')
                      ],
                      t.blockStatement(
                        [
                          // return ...filter
                          t.returnStatement(
                            filterExpression
                          )
                        ]
                      )
                    )
                  ]
                )
              ),
              // else if
              t.ifStatement(
                // typeof input == 'object'
                t.binaryExpression(
                  "===",
                  t.unaryExpression(
                    "typeof",
                    t.identifier('data')
                  ),
                  t.stringLiteral('object')
                ),
                t.blockStatement(
                  [
                    // Object.keys(input).map(key => { ... })
                    t.returnStatement(
                      t.callExpression(
                        t.memberExpression(
                          t.callExpression(
                            t.memberExpression(
                              t.identifier('Object'),
                              t.identifier('keys')
                            ),
                            [
                              t.identifier('input'),
                            ]
                          ),
                          t.identifier('filter')
                        ),
                        [
                          t.arrowFunctionExpression(
                            [
                              t.identifier('key'),
                            ],
                            t.blockStatement(
                              [
                                // const item = input[key]
                                t.variableDeclaration(
                                  'const',
                                  [
                                    t.variableDeclarator(
                                      t.identifier('item'),
                                      t.memberExpression(
                                        t.identifier('data'),
                                        t.identifier('key'),
                                        computed=true
                                      )
                                    )
                                  ]
                                ),
                                // return ...filter
                                t.returnStatement(
                                  filterExpression
                                )
                              ]
                            )
                          )
                        ]
                      )
                    )
                  ]
                ),
                // else
                t.throwStatement(
                  // throw new Error(`ERROR mapper input is neither Array nor Object [typeof input]`)
                  t.newExpression(
                    t.identifier('Error'),
                    [
                      t.binaryExpression(
                        '+',
                        t.stringLiteral(
                          'ERROR: filter input data is neither Array nor Object ['
                        ),
                        t.binaryExpression(
                          '+',
                          t.parenthesizedExpression(
                            t.unaryExpression(
                              'typeof',
                              t.identifier('data')
                            )
                          ),
                          t.stringLiteral(']')
                        )
                      )
                    ]
                  )
                )
              )
            )
          )
        ]
      )
    ),
    []
  )

  // return with context
  if (js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      callExpression
    )
  } else {
    return callExpression
  }
}

// create jsx element ast
function react_element(js_context, input) {

  if (!('_type' in input) || input._type !== 'react/element') {
    throw new Error(`ERROR: input._type is not [react/element] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/element] [${JSON.stringify(input)}]`)
  }

  // capitalize element name and register
  const parsed_var = _parse_var_full_path(input.name)
  const capitalized_name = capitalize(parsed_var.full_paths.pop())

  if (parsed_var.sub_vars.length > 0) {
    // do not use default import if we are importing sub_var
    reg_js_import(js_context, input.name, use_default=false, suggested_name=capitalized_name)
  } else {
    // use default import if we are importing top element
    reg_js_import(js_context, input.name, use_default=true, suggested_name=capitalized_name)
  }

  // create react element with props and children
  const react_element = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier(input.name),
      'props' in input ? react_element_props(
        { ...js_context, JSX_CONTEXT: true },
        input.props
      ) : []
    ),
    t.jSXClosingElement(
      t.jSXIdentifier(input.name),
    ),
    react_element_children(
      { ...js_context, JSX_CONTEXT: true },
      input.children
    )
  )

  // return react element
  return react_element
}

// create jsx html element ast
function react_html(js_context, input) {

  if (!('_type' in input) || input._type !== 'react/html') {
    throw new Error(`ERROR: input._type is not [react/html] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/html] [${JSON.stringify(input)}]`)
  }

  // create react element with props and children
  const react_element = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier(input.name),
      'props' in input ? react_element_props(
        { ...js_context, JSX_CONTEXT: true },
        input.props
      ) : []
    ),
    t.jSXClosingElement(
      t.jSXIdentifier(input.name),
    ),
    react_element_children(
      { ...js_context, JSX_CONTEXT: true },
      input.children
    )
  )

  // return react element
  return react_element
}

// create jsx element props ast
function react_element_props(js_context, props) {

  if (! props) {
    return []
  }

  if (typeof props !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof props}] [${JSON.stringify(props)}]`)
  }

  if (Array.isArray(props)) {
    throw new Error(`ERROR: input is array [${typeof props}] [${JSON.stringify(props)}]`)
  }

  const results = Object.keys(props).map(prop_key => {
    // process syntax
    let syntax = null
    const prop = props[prop_key]
    if (typeof prop == 'string') {
      syntax = t.stringLiteral(prop)
    } else {
      const processed = js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: prop_key,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        prop
      )
      syntax = processed
    }
    // return
    if (prop_key.startsWith('...')) {
      return t.jSXSpreadAttribute(
        syntax
      )
    } else {
      return t.jSXAttribute(
        t.jSXIdentifier(prop_key),
        (t.isJSXExpressionContainer(syntax))
          ? syntax
          : t.jSXExpressionContainer(syntax)
      )
    }
  })

  return results
}

// create jsx element children ast
function react_element_children(js_context, children) {

  // console.log(children)
  if (! children) {
    return []
  }

  if (typeof children !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof children}] [${JSON.stringify(children)}]`)
  }

  if (!Array.isArray(children)) {
    throw new Error(`ERROR: input is not array [${typeof children}] [${JSON.stringify(children)}]`)
  }

  return children.map(row => {
    if (typeof row === 'string') {
      return t.jSXText(row)
    } else {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: true,
        },
        row
      )
    }
  }).flat()
}

// create react state ast
function react_state(js_context, input) {

  if (!('_type' in input) || input._type !== 'react/state') {
    throw new Error(`ERROR: input._type is not [react/state] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/state] [${JSON.stringify(input)}]`)
  }

  if (! ('setter' in input)) {
    throw new Error(`ERROR: input.setter missing in [react/state] [${JSON.stringify(input)}]`)
  }

  const initExpression =
    !!input.init
    ? !!isPrimitive(input.init)
      ? js_process                    // process init as expression if primitive
        (
          {
            ...js_context,
            topLevel: false,
            parentRef: null,
            parentPath: null,
            JSX_CONTEXT: false,
          },
          {
            _type: 'js/expression',
            data: String(input.init)
          }
        )
      : js_process                    // process init as typed data
        (
          {
            ...js_context,
            topLevel: false,
            parentRef: null,
            parentPath: null,
            JSX_CONTEXT: false,
          },
          input.init,
        )
    : t.nullLiteral()                 // return null if not exists

  // register react.useState
  reg_js_import(js_context, 'react.useState')

  // register react state
  // console.log(`reg_react_state`)
  reg_react_state(js_context, {
    name: input.name,
    setter: input.setter,
  })

  // if topLevel
  if (!!js_context.topLevel
      && !!js_context.parentRef
      && js_context.parentRef.startsWith('...')) {

    // return useState(initExpression)
    return t.callExpression(
      t.identifier('react.useState'),
      [
        initExpression,
      ]
    )

  } else {  // else
    // return a nested expression if not top level
    return t.callExpression(
      t.arrowFunctionExpression(
        [],
        t.blockStatement(
          [
            t.variableDeclaration(
              'const',
              [
                t.variableDeclarator(
                  t.arrayPattern(
                    [
                      t.identifier(input.name),
                      t.identifier(input.setter)
                    ]
                  ),
                  t.callExpression(
                    t.identifier('react.useState'),
                    [
                      initExpression,
                    ]
                  )
                )
              ]
            ),
            t.returnStatement(
              t.objectExpression(
                [
                  t.objectProperty(
                    t.stringLiteral(input.name),
                    t.identifier(input.name)
                  ),
                  t.objectProperty(
                    t.stringLiteral(input.setter),
                    t.identifier(input.setter)
                  )
                ]
              )
            )
          ]
        )
      ),
      []
    )
  }
}

// create react context ast
function react_context(js_context, input) {

  if (!('_type' in input) || input._type !== 'react/context') {
    throw new Error(`ERROR: input._type is not [react/context] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/context] [${JSON.stringify(input)}]`)
  }

  // register react.useContext
  reg_js_import(js_context, 'react.useContext')

  // register context name
  reg_js_import(js_context, input.name, use_default=false)

  // return all context variables
  return t.callExpression(
    t.identifier('react.useContext'),
    [
      t.identifier(input.name)
    ]
  )
}

// create react effect block ast (do not allow return outside of function)
function react_effect(js_context, input) {

  if (!('_type' in input) || input._type !== 'react/effect') {
    throw new Error(`ERROR: input._type is not [react/effect] [${input._type}] [${JSON.stringify(input)}]`)
  }

  const statesExpression =
    !!input.states
    ? t.arrayExpression
      (
        input.states.map
        (
          state =>
          {
            return js_process
            (
              {
                ...js_context,
                topLevel: false,
                parentRef: null,
                parentPath: null,
                JSX_CONTEXT: false,
              },
              {
                _type: 'js/expression',
                data:
                  isPrimitive(state)
                    ? String(state)
                    : String(state.value)
              }
            )
          }
        )
      )
    : t.arrayExpression([])

  // register react useEffect
  reg_js_import(js_context, 'react.useEffect')

  // block statements
  const block_statements = []
  if (!!input.body) {
    if (!Array.isArray(input.body)) {
      throw new Error(`ERROR: input.body is not [array] [${input._type}] [${JSON.stringify(input)}]`)
    }
    // handle body
    input.body.map(statement => {
      if (typeof statement === 'string') {
        // parse user code snippet
        const statements = _js_parse_statements(js_context, statement, {
          // sourceType: 'module', // do not support module here
          allowReturnOutsideFunction: true, // allow return in the block statement
          plugins: [
            // 'jsx', // do not support jsx here
          ]
        })
        // add to block statements
        statements.map(sub_statement => {
          block_statements.push(sub_statement)
        })
      } else {
        // process child statements
        const child_statement = js_process(
          {
            ...js_context,
            topLevel: false,
            parentRef: null,
            parentPath: null,
            JSX_CONTEXT: false,
          },
          statement
        )
        // console.log(`statement`, statement, child_statement)
        // add to block statements
        if (t.isBlockStatement(child_statement)) {
          child_statement.body.map(sub_statement => {
            block_statements.push(sub_statement)
          })
        } else {
          block_statements.push(child_statement)
        }
      }
    })
  }

  return t.expressionStatemen(
    t.callExpression(
      t.identifier('react.useEffect'),
      [
        t.arrowFunctionExpression(
          [],
          t.blockStatement(
            block_statements,
          )
        ),
        statesExpression,
      ]
    )
  )
}

// create mui style ast
function mui_style(js_context, input) {

  if (!('_type' in input) || input._type !== 'mui/style') {
    throw new Error(`ERROR: input._type is not [mui/style] [${input._type}] [${JSON.stringify(input)}]`)
  }

  // register material ui makeStyles
  reg_js_import(js_context, '@material-ui/core.makeStyles')

  // prepare styles object
  const styles = { ...input }
  delete styles._type

  // return function call
  return t.callExpression(
    t.callExpression(
      t.identifier('@material-ui/core.makeStyles'),
      [
        t.arrowFunctionExpression(
          [
            t.identifier('theme')
          ],
          js_process(
            {
              ...js_context,
              topLevel: false,
              parentRef: null,
              parentPath: null,
              JSX_CONTEXT: false,
            },
            styles
          )
        )
      ]
    ),
    []
  )
}

// create appx api ast
function appx_api(js_context, input) {

  if (!('_type' in input) || input._type !== 'appx/api') {
    throw new Error(`ERROR: input._type is not [appx/api] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('namespace' in input)) {
    throw new Error(`ERROR: input.namespace missing in [appx/api] [${JSON.stringify(input)}]`)
  }

  if (! ('app_name' in input)) {
    throw new Error(`ERROR: input.app_name missing in [appx/api] [${JSON.stringify(input)}]`)
  }

  if (! ('method' in input)) {
    throw new Error(`ERROR: input.method missing in [appx/api] [${JSON.stringify(input)}]`)
  }

  if (! ('endpoint' in input)) {
    throw new Error(`ERROR: input.endpoint missing in [appx/api] [${JSON.stringify(input)}]`)
  }

  // process input.method
  const method = (() => {
    if (input.method.toLowerCase() === 'get') {
      return 'get'
    } else if (input.method.toLowerCase() === 'post') {
      return 'post'
    } else if (input.method.toLowerCase() === 'put') {
      return 'put'
    } else if (input.method.toLowerCase() === 'delete') {
      return 'del'
    } else if (input.method.toLowerCase() === 'head') {
      return 'head'
    } else if (input.method.toLowerCase() === 'patch') {
      return 'patch'
    } else {
      throw new Error(`ERROR: unknown method in [appx/api] [${input.method}]`)
    }
  })()

  // process input.data
  const data = (() => {
    if (!input.data) {
      return t.nullLiteral()
    } else {
      return js_process(
        {
          ...js_context,
          topLevel: false,
          parentRef: null,
          parentPath: null,
          JSX_CONTEXT: false,
        },
        input.prep
      )
    }
  })()

  // add prep code if exist
  const prep_statements = (() => {
    if (!!input.prep) {
      if (isPrimitive(input.prep)) {
        return _js_parse_statements(
          js_context,
          String(input.prep)
        )
      } else {
        return [
          js_process(
            {
              ...js_context,
              topLevel: false,
              parentRef: null,
              parentPath: null,
              JSX_CONTEXT: false,
            },
            input.prep
          )
        ]
      }
    } else {
      return []
    }
  })()

  // add result handler if exist
  const result_statements = (() => {
    if (!!input.result) {
      if (isPrimitive(input.result)) {
        return _js_parse_statements(
          js_context,
          String(input.result)
        )
      } else {
        return [
          js_process(
            {
              ...js_context,
              topLevel: false,
              parentRef: null,
              parentPath: null,
              JSX_CONTEXT: false,
            },
            input.result
          )
        ]
      }
    } else {
      return []
    }
  })()
  // console.log(result_statements)

  // add error handler if exist
  const error_statements = (() => {
    if (!!input.error) {
      if (isPrimitive(input.error)) {
        return _js_parse_statements(
          js_context,
          String(input.error)
        )
      } else {
        return [
          js_process(
            {
              ...js_context,
              topLevel: false,
              parentRef: null,
              parentPath: null,
              JSX_CONTEXT: false,
            },
            input.result
          )
        ]
      }
    } else {
      return []
    }
  })()

  // register react.useContext
  reg_js_import(js_context, 'app-x/api')

  // call api
  return t.expressionStatement(
    t.callExpression(
      t.arrowFunctionExpression(
        [],
        t.blockStatement(
          [
            ...prep_statements,
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(
                  t.identifier('app-x/api'),
                  t.identifier(method),
                ),
                [
                  t.stringLiteral(input.namespace),
                  t.stringLiteral(input.app_name),
                  t.stringLiteral(input.endpoint),
                  (method === 'post' || method === 'put' || method === 'patch')
                  ? data
                  : undefined,
                  t.arrowFunctionExpression(
                    [
                      t.identifier('result')
                    ],
                    t.blockStatement(
                      result_statements
                    )
                  ),
                  t.arrowFunctionExpression(
                    [
                      t.identifier('error')
                    ],
                    t.blockStatement(
                      error_statements
                    )
                  ),
                ].filter(item => typeof item !== 'undefined')
              )
            )
          ]
        )
      ),
      []
    )
  )
}

// create appx route ast
function appx_route(js_context, input) {

  if (!('_type' in input) || input._type !== 'appx/route') {
    throw new Error(`ERROR: input._type is not [appx/route] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!('appx' in js_context) || !('ui_deployment' in js_context.appx)) {
    throw new Error(`ERROR: context missing appx.ui_deployment [${JSON.stringify(js_context)}]`)
  }

  const { namespace, ui_name, ui_deployment } = js_context.appx

  let route_results = db.query_sync(`SELECT
                  ui_route.namespace,
                  ui_route.ui_name,
                  ui_route.ui_ver,
                  ui_deployment.ui_deployment,
                  ui_deployment.ui_deployment_spec,
                  ui_route.ui_route_name,
                  ui_route.ui_route_spec,
                  ui_route.create_time,
                  ui_route.update_time
              FROM ui_route
              JOIN ui_deployment
                  ON ui_route.namespace = ui_deployment.namespace
                  AND ui_route.ui_name = ui_deployment.ui_name
                  AND ui_route.ui_ver = ui_deployment.ui_ver
              WHERE
                  ui_route.namespace = ?
                  AND ui_route.ui_name = ?
                  AND ui_deployment.ui_deployment = ?
                  AND ui_route.deleted=0
                  AND ui_deployment.deleted=0`,
              [
                  namespace,
                  ui_name,
                  ui_deployment,
              ]
  )

  // console.log(route_results)
  return t.objectExpression(
    route_results.map(route => {
      return t.objectProperty(
        t.stringLiteral(route.ui_route_name),
        t.arrowFunctionExpression(
          [],
          t.blockStatement(
            [
              t.returnStatement(
                t.callExpression(
                  react_component(
                    {
                      ...js_context,
                      topLevel: true,
                      parentRef: null,
                      parentPath: null,
                    },
                    route.ui_route_spec,
                  ),
                  []
                )
              )
            ]
          )
        )
      )
    })
  )
}

// process input
function js_process(js_context, input) {

  if (isPrimitive(input)) {
    return js_primitive(js_context, input)
  }

  if (Array.isArray(input)) {
    return js_array(js_context, input)
  }

  if (! ('_type' in input)) {
    // no '_type' is treated as json object
    return js_object(js_context, input)
  }

  // '_type' is presented in the json object
  if (input._type === 'js/string') {

    return js_string(js_context, input)

  } else if (input._type === 'js/number') {

    return js_number(js_context, input)

  } else if (input._type === 'js/boolean') {

    return js_boolean(js_context, input)

  } else if (input._type === 'js/null') {

    return js_null(js_context, input)

  } else if (input._type === 'js/import') {

    return js_import(js_context, input)

  } else if (input._type === 'js/export') {

    return js_export(js_context, input)

  } else if (input._type === 'js/variable') {

    return js_variable(js_context, input)

  } else if (input._type === 'js/expression') {

    return js_expression(js_context, input)

  } else if (input._type === 'js/statement') {

    return js_statement(js_context, input)

  } else if (input._type === 'js/function') {

    return js_function(js_context, input)

  } else if (input._type === 'js/call') {

    return js_call(js_context, input)

  } else if (input._type === 'js/switch') {

    return js_switch(js_context, input)

  } else if (input._type === 'js/map') {

    return js_map(js_context, input)

  } else if (input._type === 'js/reduce') {

    return js_reduce(js_context, input)

  } else if (input._type === 'js/filter') {

    return js_filter(js_context, input)

  } else if (input._type === 'js/transform') {

    // TODO
    throw new Error(`ERROR: unsupported input._type [${input._type}]`)

  } else if (input._type === 'js/trigger') {

    // TODO
    throw new Error(`ERROR: unsupported input._type [${input._type}]`)

  } else if (input._type === 'react/element') {

    return react_element(js_context, input)

  } else if (input._type === 'react/html') {

    return react_html(js_context, input)

  } else if (input._type === 'react/state') {

    return react_state(js_context, input)

  } else if (input._type === 'react/context') {

    return react_context(js_context, input)

  } else if (input._type === 'react/effect') {

    return react_effect(js_context, input)

  } else if (input._type === 'react/form') {

    return react_form(js_context, input)

  } else if (input._type === 'mui/style') {

    return mui_style(js_context, input)

  } else if (input._type === 'input/text') {

    return input_text(js_context, input)

  } else if (input._type === 'input/select') {

    return input_select(js_context, input)

  } else if (input._type === 'input/switch') {

    return input_switch(js_context, input)

  } else if (input._type === 'input/select') {

    return input_select(js_context, input)

  } else if (input._type === 'input/rule') {

    return input_rule(js_context, input)

  } else if (input._type === 'appx/api') {

    return appx_api(js_context, input)

  } else if (input._type === 'appx/route') {

    return appx_route(js_context, input)

  } else {

    throw new Error(`ERROR: unrecognized input._type [${input._type}] [${JSON.stringify(input)}]`)
  }
}

// return an react component function
function react_component(js_context, input) {

  const block_statements = []

  // check if there are any block statements
  Object.keys(input).map(key => {
    // ignore type / name / props / children
    if (key === '_type' || key === 'element' || key === 'propTypes' || key === '_test') {
      return
    }

    if (isPrimitive(input[key])) {
      // process input[key] and assign to declared variable
      const variableDeclaration = t.variableDeclaration(
        'const',
        [
          t.variableDeclarator(
            t.identifier(key),
            js_process(
              {
                ...js_context,
                parentRef: key,
                parentPath: t.identifier(key),
              },
              input[key]
            )
          )
        ]
      )
      // no comments for primitive types
      block_statements.push(
        variableDeclaration
      )

    } else if (input[key]._type === 'js/statement') {
      // if input[key] is 'js/statement'
      // adds each of the block statement
      block_statements.push(...(js_process(
        js_context,
        input[key]).body
      ))

    } else if (key.startsWith('...')) {
      // if input[key] starts with '...'
      if (input[key]._type === 'react/state') {
        const variableDeclaration = t.variableDeclaration(
          'const',
          [
            t.variableDeclarator(
              t.arrayPattern(
                [
                  t.identifier(input[key].name),
                  t.identifier(input[key].setter),
                ]
              ),
              js_process(
                {
                  ...js_context,
                  parentRef: key,
                  parentPath: t.identifier(key),
                },
                input[key]
              )
            )
          ]
        )
        //t.addComment(variableDeclaration, 'leading', ' ' + key, true)
        t.addComment(variableDeclaration, 'trailing', ' ' + key, true)
        block_statements.push(
          variableDeclaration
        )

      } else {
        // unrecognized component definition starting with '...'
        throw new Error(`ERROR: unrecognized react component spread definition [${key}] [${input[key]._type}]`)
      }

    } else {
      // process input[key] and assign to declared variable
      const variableDeclaration = t.variableDeclaration(
          'const',
          [
            t.variableDeclarator(
              t.identifier(key),
              js_process(
                {
                  ...js_context,
                  parentRef: key,
                  parentPath: t.identifier(key),
                },
                input[key]
              )
            )
          ]
        )
      //t.addComment(variableDeclaration, 'leading', ' ' + key, true)
      t.addComment(variableDeclaration, 'trailing', ' ' + key, true)
      block_statements.push(
        variableDeclaration
      )
    }
  })

  // process elements, this will register such as 'forms'
  const result_element = react_element(js_context, input.element)

  // console.log(`react_component - js_context.forms`, JSON.stringify(js_context.forms, null, 4))

  // add react/form useForm or useFormContext here (AFTER react_element)
  if (!!js_context.forms && !!Object.keys(js_context.forms).length) {
    // console.log(`js_context.forms`)
    Object.keys(js_context.forms).sort().reverse().map(name => {
      if (!name) {
        // no name, useFormContext
        // const { ... } = useFormContext()
        const formDeclaration = t.variableDeclaration(
          'const',
          [
            t.variableDeclarator(
              t.objectPattern(
                REACT_FORM_METHODS.map(method => (
                  t.objectProperty(
                    t.identifier(method),
                    t.identifier(`${js_context.forms[name].qualifiedName}.${method}`)
                  )
                ))
              ),
              // useFormContext()
              t.callExpression(
                t.identifier('react-hook-form.useFormContext'),
                []
              )
            )
          ]
        )
        //t.addComment(variableDeclaration, 'leading', ' ' + key, true)
        t.addComment(formDeclaration, 'trailing', ` useFormContext()`, true)
        // add formDeclaration
        block_statements.unshift(formDeclaration)
      } else {
        // has name, useForm
        // const { ... } = useForm(formProps)
        const formDeclaration = t.variableDeclaration(
          'const',
          [
            t.variableDeclarator(
              t.objectPattern(
                REACT_FORM_METHODS.map(method => (
                  t.objectProperty(
                    t.identifier(method),
                    t.identifier(`${js_context.forms[name].qualifiedName}.${method}`)
                  )
                ))
              ),
              // useForm(formProps)
              t.callExpression(
                t.identifier('react-hook-form.useForm'),
                [
                  js_context.forms[name].formProps
                ]
              )
            )
          ]
        )
        //t.addComment(variableDeclaration, 'leading', ' ' + key, true)
        t.addComment(formDeclaration, 'trailing', ` useForm[${name}]`, true)
        // add formDeclaration
        block_statements.unshift(formDeclaration)
      }
    })
  }

  // return arrow function
  const result = t.arrowFunctionExpression(
    [
      t.identifier('props')
    ],
    t.blockStatement(
      [
        ...block_statements,
        t.returnStatement(
          result_element,
        )
      ]
    )
  )

  return result
}

// export
module.exports = {
  // top methods
  js_process,
  react_component,
  // register & resolve
  reg_js_import,
  reg_js_variable,
  reg_react_state,
  reg_react_form,
  js_resolve_ids,
  // types
  js_primitive,
  js_string,
  js_number,
  js_boolean,
  js_null,
  js_array,
  js_object,
  react_element,
  react_html,
  react_state,
  react_context,
  react_effect,
  react_form,
  js_import,
  js_export,
  js_variable,
  js_expression,
  js_function,
  js_statement,
  js_call,
  input_text,
  appx_api,
  appx_route,
}
