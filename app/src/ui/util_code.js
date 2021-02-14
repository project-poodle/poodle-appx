//const babel = require('@babel/standalone')
//const generate = require('@babel/generator').default
const _ = require('lodash')
const { parse, parseExpression } = require('@babel/parser')
const t = require("@babel/types")
const db = require('../db/db')
const cache = require('../cache/cache')
const {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  SPECIAL_CHARACTER,
  CONTEXT_JSX,
  CONTEXT_STATEMENT,
  // REQUIRE_FUNCTION,
  isPrimitive,
  capitalize,
  reg_js_import,
  reg_js_variable,
  // reg_react_state,
  js_resolve_ids,
  _js_parse_statements,
  _js_parse_expression,
  _parse_var_full_path,
  lookup_type_for_data,
  type_matches_spec,
  data_matches_spec,
  check_input_data,
} = require('./util_base')
const {
  template_custom,
  template_react_element,
  template_js_object,
} = require('./util_template')

////////////////////////////////////////////////////////////////////////////////
// create primitive js ast
function js_primitive(js_context, ref, input) {

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

  if (!!js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          result
        )
      ]
    )
  } else if (!!js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      result
    )
  } else {
    return result
  }
}

// create string ast
function js_string(js_context, ref, input) {
  // check input._type
  if (!('_type' in input) || input._type !== 'js/string') {
    throw new Error(`ERROR: input._type is not [js/string] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!!js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          t.stringLiteral(String(input.data))
        )
      ]
    )
  } else if (!!js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      t.stringLiteral(String(input.data))
    )
  } else {
    return t.stringLiteral(String(input.data))
  }
}

// create numeric ast
function js_number(js_context, ref, input) {
  // check input._type
  if (!('_type' in input) || input._type !== 'js/number') {
    throw new Error(`ERROR: input._type is not [js/number] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!!js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          t.numericLiteral(Number(input.data))
        )
      ]
    )
  } else if (!!js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      t.numericLiteral(Number(input.data))
    )
  } else {
    return t.numericLiteral(Number(input.data))
  }
}

// create boolean ast
function js_boolean(js_context, ref, input) {
  // check input._type
  if (!('_type' in input) || input._type !== 'js/boolean') {
    throw new Error(`ERROR: input._type is not [js/boolean] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!!js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          t.booleanLiteral(Boolean(input.data))
        )
      ]
    )
  } else if (!!js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      t.booleanLiteral(Boolean(input.data))
    )
  } else {
    return t.booleanLiteral(Boolean(input.data))
  }
}

// create null ast
function js_null(js_context, ref, input) {
  // check input._type
  if (!('_type' in input) || input._type !== 'js/null') {
    throw new Error(`ERROR: input._type is not [js/null] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!!js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          t.nullLiteral()
        )
      ]
    )
  } else if (!!js_context.CONTEXT_JSX) {
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
function js_array(js_context, ref, input) {

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
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        null,
        row
      )
    })
  )

  if (!!js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          arrayExpression
        )
      ]
    )
  } else if (!!js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      arrayExpression
    )
  } else {
    return arrayExpression
  }
}

// create object ast
function js_object(js_context, ref, input) {

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
    Object.keys(input)
      .filter(key => key !== '_type' && key !== '_order')
      .map(key => {
        const value = input[key]
        if (key.startsWith('...')) {
          // handle spread syntax
          return t.spreadElement(
            js_process
            (
              {
                ...js_context,
                CONTEXT_JSX: false,
                CONTEXT_STATEMENT: false,
              },
              null,
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
                CONTEXT_JSX: false,
                CONTEXT_STATEMENT: false,
              },
              key,
              value
            )
          )
        }
      })
  )

  if (!!js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          objectExpression
        )
      ]
    )
  } else if (!!js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      objectExpression
    )
  } else {
    return objectExpression
  }
}

// create import ast
function js_import(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'js/import') {
    throw new Error(`ERROR: input._type is not [js/import] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/import] [${JSON.stringify(input)}]`)
  }

  reg_js_import(js_context, input.name)

  // return imported name as result
  if (!!js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          t.identifier(input.name)
        )
      ]
    )
  } else if (!!js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      t.identifier(input.name)
    )
  } else {
    return t.identifier(input.name)
  }
}

// create export ast
function js_export(js_context, ref, input) {

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
function js_variable(js_context, ref, input) {

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
                CONTEXT_JSX: false,
                CONTEXT_STATEMENT: false,
              },
              ref,
              {
                _type: 'js/expression',
                data: String(input.expression)
              }
            )
          : js_process
            (
              {
                ...js_context,
                CONTEXT_JSX: false,
                CONTEXT_STATEMENT: false,
              },
              ref,
              input.expression
            )
      )
    ]
  )
}

// create expression ast
function js_expression(js_context, ref, input) {

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

  const parsed = _js_parse_expression(js_context, data, {
    plugins: [
      'jsx', // support jsx
    ]
  })

  if (!!js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          parsed
        )
      ]
    )
  } else if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      parsed
    )
  } else {
    return parsed
  }
}

// create block ast (allow return outside of function)
function js_statement(js_context, ref, input) {

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
    input.body.map((statement, index) => {
      if (typeof statement === 'string') {
        // parse user code snippet
        const parsed_statement = _js_parse_statements(js_context, statement, {
          // sourceType: 'module', // do not support module here
          allowReturnOutsideFunction: true, // allow return in the block statement
          plugins: [
            'jsx', // support jsx
          ]
        })
        // console.log(`statement`, statement, child_statement)
        if (!!parsed_statement.length) {
          t.addComment(parsed_statement[0], 'leading', ` ${ref || 'body'}[${index}] `, true)
          t.addComment(parsed_statement[parsed_statement.length - 1], 'trailing', ` ${ref || 'body'}[${index}] `, true)
          block_statements.push(...parsed_statement)
        }
      } else {
        // process child statements
        const child_statement = js_process(
          {
            ...js_context,
            CONTEXT_JSX: false,
            CONTEXT_STATEMENT: true,
          },
          null,
          statement
        )
        // console.log(`statement`, statement, child_statement)
        if (t.isBlockStatement(child_statement) && !!child_statement.body.length) {
          t.addComment(child_statement.body[0], 'leading', ` ${ref || 'body'}[${index}] `, true)
          t.addComment(child_statement.body[child_statement.body.length - 1], 'trailing', ` ${ref || 'body'}[${index}] `, true)
          block_statements.push(...child_statement.body)
        } else {
          t.addComment(child_statement, 'leading', ` ${ref || 'body'}[${index}] `, true)
          t.addComment(child_statement, 'trailing', ` ${ref || 'body'}[${index}] `, true)
          block_statements.push(child_statement)
        }
      }
    })
  }

  // console.log(`block_statements`, block_statements
  return t.blockStatement(
    block_statements
  )
}

// create array function ast
function js_function(js_context, ref, input) {

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
    input.body.map((statement, index) => {
      if (typeof statement === 'string') {
        // parse user code snippet
        const parsed_statement = _js_parse_statements(js_context, statement, {
          // sourceType: 'module', // do not support module here
          allowReturnOutsideFunction: true, // allow return in the block statement
          plugins: [
            'jsx', // support jsx
          ]
        })
        // console.log(`statement`, statement, child_statement)
        if (!!parsed_statement.length) {
          t.addComment(parsed_statement[0], 'leading', ` ${ref || 'body'}[${index}] `, true)
          t.addComment(parsed_statement[parsed_statement.length - 1], 'trailing', ` ${ref || 'body'}[${index}] `, true)
          block_statements.push(...parsed_statement)
        }
      } else {
        // process child statements
        const child_statement = js_process(
          {
            ...js_context,
            CONTEXT_JSX: false,
            CONTEXT_STATEMENT: true,
          },
          null,
          statement
        )
        // console.log(`statement`, statement, child_statement)
        if (t.isBlockStatement(child_statement) && !!child_statement.body.length) {
          t.addComment(child_statement.body[0], 'leading', ` ${ref || 'body'}[${index}] `, true)
          t.addComment(child_statement.body[child_statement.body.length - 1], 'trailing', ` ${ref || 'body'}[${index}] `, true)
          block_statements.push(...child_statement.body)
        } else {
          t.addComment(child_statement, 'leading', ` ${ref || 'body'}[${index}] `, true)
          t.addComment(child_statement, 'trailing', ` ${ref || 'body'}[${index}] `, true)
          block_statements.push(child_statement)
        }
      }
    })
  }

  // return statement
  if (!!input.return) {
    if (typeof input.return === 'string') {
      // parse user code snippet
      const parsed_expression = _js_parse_expression(js_context, input.return, {
        plugins: [
          'jsx', // support jsx
        ]
      })
      block_statements.push(t.returnStatement(
        parsed_expression
      ))
    } else {
      // process child expression
      const child_expression = js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        null,
        input.return
      )
      block_statements.push(t.returnStatement(
        child_expression
      ))
    }
  }

  const functionExpression = t.arrowFunctionExpression(
    params,
    t.blockStatement(
      block_statements
    ),
    input.async ? true : false
  )

  if (js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          functionExpression
        )
      ]
    )
  } else if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      functionExpression
    )
  } else {
    return functionExpression
  }
}

// create call ast
function js_call(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'js/call') {
    throw new Error(`ERROR: input._type is not [js/call] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('func' in input)) {
    throw new Error(`ERROR: input.func missing in [js/call] [${JSON.stringify(input)}]`)
  }

  // func expression
  const funcExpression = (() => {
    if (typeof input.func === 'string') {
      // parse user code snippet
      const parsed_expression = _js_parse_expression(js_context, input.func, {
        plugins: [
          'jsx', // support jsx
        ]
      })
      return parsed_expression
    } else {
      // process child expression
      const child_expression = js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        null,
        input.func
      )
      return child_expression
    }
  })()

  const callExpression = t.callExpression(
    funcExpression,
    input.params ? input.params.map(
      param => js_process
      (
        {
          ...js_context,
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        null,
        param))
     : []
  )

  // check statement context
  if (js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          callExpression
        )
      ]
    )
  } else if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      callExpression
    )
  } else {
    return callExpression
  }
}

// create switch ast
function js_condition(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'js/condition') {
    throw new Error(`ERROR: input._type is not [js/condition] [${input._type}] [${JSON.stringify(input)}]`)
  }

  // create default return statement
  let ifElseStatements =
    !!js_context.CONTEXT_STATEMENT
    ? t.blockStatement([])
    : t.returnStatement(
        t.nullLiteral()
      )
  if ('default' in input) {
    const processed = js_process(
      {
        ...js_context,
        CONTEXT_JSX: false
        // CONTEXT_STATEMENT: preserve
      },
      null,
      input.default
    )
    // update if else statements
    ifElseStatements =
      !!js_context.CONTEXT_STATEMENT
      ? processed
      : t.returnStatement(
          processed
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
        throw new Error(`ERROR: [js/condition] child is empty [${JSON.stringify(child)}]`)
      }
      if (typeof child !== 'object') {
        throw new Error(`ERROR: [js/condition] child is not object type [${JSON.stringify(child)}]`)
      }
      if (! ('condition' in child)) {
        throw new Error(`ERROR: [js/condition] child missing [condition] [${JSON.stringify(child)}]`)
      }
      if (! ('result' in child)) {
        throw new Error(`ERROR: [js/condition] child missing [result] [${JSON.stringify(child)}]`)
      }
      // process statement body
      const processed = js_process(
        {
          ...js_context,
          CONTEXT_JSX: false
          // CONTEXT_STATEMENT: preserve
        },
        null,
        child.result
      )
      // stack if/else statement
      ifElseStatements = t.ifStatement(
        js_process(
          {
            ...js_context,
            CONTEXT_JSX: false,
            CONTEXT_STATEMENT: false,
          },
          null,
          {
            _type: 'js/expression',
            data: String(child.condition),
          }
        ),
        !!js_context.CONTEXT_STATEMENT
          ? processed
          : t.returnStatement(
              processed
            ),
        ifElseStatements
      )
    })
  }

  // check statement context
  if (js_context.CONTEXT_STATEMENT) {
    // if statement context
    return ifElseStatements
  } else {
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
    // return with jsx context
    if (js_context.CONTEXT_JSX) {
      return t.jSXExpressionContainer(
        callExpression
      )
    } else {
      return callExpression
    }
  }
}

// create js map ast
function js_map(js_context, ref, input) {

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
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        null,
        input.data
      )
    : t.arrayExpression([])   // return empty array if not

  // process mapper expression
  const processed =
    !!input.result
    ? js_process // process result if exists
      (
        {
          ...js_context,
          CONTEXT_JSX: false
          // CONTEXT_STATEMENT: preserve
        },
        null,
        input.result
      )
    : !!js_context.CONTEXT_STATEMENT
      ? t.blockStatement([])
      : t.nullLiteral()

  // result
  const resultStatement =
    !!js_context.CONTEXT_STATEMENT
    ? processed
    : t.returnStatement(processed)

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
                          // result statement
                          resultStatement
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
                                // result statement
                                resultStatement
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
  if (js_context.CONTEXT_STATEMENT) {
    return t.expressionStatement(
      callExpression
    )
  } else if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      callExpression
    )
  } else {
    return callExpression
  }
}

// create js reduce ast
function js_reduce(js_context, ref, input) {

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
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        null,
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
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        null,
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
            CONTEXT_JSX: false,
            CONTEXT_STATEMENT: false,
          },
          null,
          {
            _type: 'js/expression',
            data: String(input.init)
          }
        )
      : js_process                    // process init as typed object
        (
          {
            ...js_context,
            CONTEXT_JSX: false,
            CONTEXT_STATEMENT: false,
          },
          null,
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
  if (js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.expressionStatement(
      callExpression
    )
  } else if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      callExpression
    )
  } else {
    return callExpression
  }
}

// create js reduce ast
function js_filter(js_context, ref, input) {

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
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        null,
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
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        null,
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
  if (js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.expressionStatement(
      callExpression
    )
  } else if (js_context.CONTEXT_JSX) {
    return t.jSXExpressionContainer(
      callExpression
    )
  } else {
    return callExpression
  }
}

// create jsx element ast
function react_element(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'react/element') {
    throw new Error(`ERROR: input._type is not [react/element] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/element] [${JSON.stringify(input)}]`)
  }

  // capitalize element name and register
  const parsed_var = _parse_var_full_path(input.name)
  const capitalized_name = capitalize(parsed_var.full_paths.pop())

  // if (parsed_var.sub_vars.length > 0) {
  //   // do not use default import if we are importing sub_var
  //   reg_js_import(js_context, input.name, use_default=false, suggested_name=capitalized_name)
  // } else {
  //   // use default import if we are importing top element
  reg_js_import(js_context, input.name, use_default=true, suggested_name=capitalized_name)
  // }

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
      return null
    }
  })()

  // process props and style
  const propsExpression = (() => {
    let result = []
    // check input.props
    if (!!input.props) {
      result = react_element_props(
        {
          ...js_context,
          CONTEXT_JSX: true,
          CONTEXT_STATEMENT: false,
        },
        input.props
      )
    }
    // check input.style
    if (!!styleExpression) {
      result.push(
        t.jSXAttribute(
          t.jSXIdentifier('style'),
          t.jSXExpressionContainer(
            styleExpression
          )
        )
      )
    }
    // return
    return result
  })()

  // create react element with props and children
  const react_element = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier(input.name),
      propsExpression
    ),
    t.jSXClosingElement(
      t.jSXIdentifier(input.name),
    ),
    react_element_children(
      {
        ...js_context,
        CONTEXT_JSX: true,
        CONTEXT_STATEMENT: false,
      },
      input.children
    )
  )

  if (js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          react_element,
        )
      ]
    )
  } else {
    // return react element
    return react_element
  }
}

// create jsx html element ast
function react_html(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'react/html') {
    throw new Error(`ERROR: input._type is not [react/html] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/html] [${JSON.stringify(input)}]`)
  }

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
      return null
    }
  })()

  // process props and style
  const propsExpression = (() => {
    let result = []
    // check input.props
    if (!!input.props) {
      result = react_element_props(
        {
          ...js_context,
          CONTEXT_JSX: true,
          CONTEXT_STATEMENT: false,
        },
        input.props
      )
    }
    // check input.style
    if (!!styleExpression) {
      result.push(
        t.jSXAttribute(
          t.jSXIdentifier('style'),
          t.jSXExpressionContainer(
            styleExpression
          )
        )
      )
    }
    // return
    return result
  })()

  // create react element with props and children
  const react_element = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier(input.name),
      propsExpression
    ),
    t.jSXClosingElement(
      t.jSXIdentifier(input.name),
    ),
    react_element_children(
      {
        ...js_context,
        CONTEXT_JSX: true,
        CONTEXT_STATEMENT: false,
      },
      input.children
    )
  )

  if (js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          react_element,
        )
      ]
    )
  } else {
    // return react element
    return react_element
  }
}

// create jsx element props ast
function react_element_props(js_context, props) {

  if (! props) {
    return []
  }

  if (typeof props !== 'object') {
    throw new Error(`ERROR: input.props is not object [${typeof props}] [${JSON.stringify(props)}]`)
  }

  if (Array.isArray(props)) {
    throw new Error(`ERROR: input.props is array [${JSON.stringify(props)}]`)
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
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        null,
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

// create jsx element style ast
function react_element_style(js_context, style) {

  if (!style) {
    return t.objectExpression([])
  }

  if (typeof style !== 'object') {
    throw new Error(`ERROR: input.style is not object [${typeof style}] [${JSON.stringify(style)}]`)
  }

  if (Array.isArray(style)) {
    throw new Error(`ERROR: input.style is array [${JSON.stringify(style)}]`)
  }

  const results = Object.keys(style).map(style_key => {
    // process syntax
    let syntax = null
    const style_value = style[style_key]
    if (typeof style_value == 'string') {
      syntax = t.stringLiteral(style_value)
    } else {
      const processed = js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: false,
        },
        null,
        style_value
      )
      syntax = processed
    }
    // return
    return t.objectProperty(
      t.identifier(style_key),
      syntax
    )
  })

  return t.objectExpression(
    results
  )
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
          CONTEXT_JSX: true,
          CONTEXT_STATEMENT: false,
        },
        null,
        row
      )
    }
  }).flat()
}

// create react state ast
function react_state(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'react/state') {
    throw new Error(`ERROR: input._type is not [react/state] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/state] [${JSON.stringify(input)}]`)
  }

  if (! ('setter' in input)) {
    throw new Error(`ERROR: input.setter missing in [react/state] [${JSON.stringify(input)}]`)
  }

  // console.trace()

  const initExpression =
    !!input.init
    ? !!isPrimitive(input.init)
      ? js_process                    // process init as expression if primitive
        (
          {
            ...js_context,
            CONTEXT_JSX: false,
            CONTEXT_STATEMENT: false,
          },
          null,
          {
            _type: 'js/expression',
            data: String(input.init)
          }
        )
      : js_process                    // process init as typed data
        (
          {
            ...js_context,
            CONTEXT_JSX: false,
            CONTEXT_STATEMENT: false,
          },
          null,
          input.init,
        )
    : t.nullLiteral()                 // return null if not exists

  // register react.useState
  reg_js_import(js_context, 'react.useState')

  /*
  // register react state
  // console.log(`reg_react_state`)
  reg_react_state(js_context, {
    name: input.name,
    setter: input.setter,
  })
  */

  // useState
  const statesExpression = t.callExpression(
    t.identifier('react.useState'),
    [
      initExpression,
    ]
  )

  const callExpression = t.callExpression(
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
                statesExpression
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

  // if CONTEXT_STATEMENT
  if (!!js_context.CONTEXT_STATEMENT) {
    // console.log(`here`)
    if (ref.startsWith('...')) {
      reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${input.name}`)
      reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${input.setter}`)
      return t.variableDeclaration(
        'const',
        [
          t.variableDeclarator(
            t.arrayPattern(
              [
                t.identifier(input.name),
                t.identifier(input.setter)
              ]
            ),
            statesExpression
          )
        ]
      )
    } else {
      reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
      return t.variableDeclaration(
        'const',
        [
          t.variableDeclarator(
            t.identifier(ref),
            callExpression
          )
        ]
      )
    }
  } else {  // else
    // return a nested expression if not statement context
    return callExpression
  }
}

// create react context ast
function react_context(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'react/context') {
    throw new Error(`ERROR: input._type is not [react/context] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/context] [${JSON.stringify(input)}]`)
  }

  // register react.useContext
  reg_js_import(js_context, 'react.useContext')

  // register context name
  reg_js_import(js_context, input.name)

  const callExpression = t.callExpression(
    t.identifier('react.useContext'),
    [
      t.identifier(input.name)
    ]
  )

  // if CONTEXT_STATEMENT
  if (!!js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          callExpression
        )
      ]
    )
  } else {
    return callExpression
  }
}

// create react effect block ast (do not allow return outside of function)
function react_effect(js_context, ref, input) {

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
                CONTEXT_JSX: false,
                CONTEXT_STATEMENT: false,
              },
              null,
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
    input.body.map((statement, index) => {
      if (typeof statement === 'string') {
        // parse user code snippet
        const parsed_statement = _js_parse_statements(js_context, statement, {
          // sourceType: 'module', // do not support module here
          allowReturnOutsideFunction: true, // allow return in the block statement
          plugins: [
            'jsx', // support jsx
          ]
        })
        // console.log(`statement`, statement, child_statement)
        if (!!parsed_statement.length) {
          t.addComment(parsed_statement[0], 'leading', ` ${ref || 'body'}[${index}] `, true)
          t.addComment(parsed_statement[parsed_statement.length - 1], 'trailing', ` ${ref || 'body'}[${index}] `, true)
          block_statements.push(...parsed_statement)
        }
      } else {
        // process child statements
        const child_statement = js_process(
          {
            ...js_context,
            CONTEXT_JSX: false,
            CONTEXT_STATEMENT: true,
          },
          null,
          statement
        )
        // console.log(`statement`, statement, child_statement)
        if (t.isBlockStatement(child_statement) && !!child_statement.body.length) {
          t.addComment(child_statement.body[0], 'leading', ` ${ref || 'body'}[${index}] `, true)
          t.addComment(child_statement.body[child_statement.body.length - 1], 'trailing', ` ${ref || 'body'}[${index}] `, true)
          block_statements.push(...child_statement.body)
        } else {
          t.addComment(child_statement, 'leading', ` ${ref || 'body'}[${index}] `, true)
          t.addComment(child_statement, 'trailing', ` ${ref || 'body'}[${index}] `, true)
          block_statements.push(child_statement)
        }
      }
    })
  }

  // call expression
  const callExpression = t.callExpression(
    t.identifier('react.useEffect'),
    [
      t.arrowFunctionExpression(
        [],
        t.blockStatement(
          block_statements
        )
      ),
      statesExpression,
    ]
  )

  // return with context
  if (js_context.CONTEXT_STATEMENT) {
    return t.expressionStatement(
      callExpression
    )
  } else {
    return callExpression
  }
}

// create mui style ast
function mui_style(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'mui/style') {
    throw new Error(`ERROR: input._type is not [mui/style] [${input._type}] [${JSON.stringify(input)}]`)
  }

  // register material ui makeStyles
  reg_js_import(js_context, '@material-ui/core.makeStyles')

  // prepare styles object
  const styles = { ...input }
  delete styles._type

  // return function call
  const callExpression = t.callExpression(
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
              CONTEXT_JSX: false,
              CONTEXT_STATEMENT: false,
            },
            null,
            styles
          )
        )
      ]
    ),
    []
  )

  // check statement context
  if (js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          callExpression,
        )
      ]
    )
  } else {
    return callExpression
  }
}

// create mui theme ast
function mui_theme(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'mui/theme') {
    throw new Error(`ERROR: input._type is not [mui/theme] [${input._type}] [${JSON.stringify(input)}]`)
  }

  // register material ui makeStyles
  reg_js_import(js_context, '@material-ui/styles.useTheme')

  // return function call
  const callExpression = t.callExpression(
    t.identifier('@material-ui/styles.useTheme'),
    []
  )

  // check statement context
  if (js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          callExpression,
        )
      ]
    )
  } else {
    return callExpression
  }
}

// create route path ast
function route_path(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'route/path') {
    throw new Error(`ERROR: input._type is not [route/path] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('path' in input)) {
    throw new Error(`ERROR: input.path missing in [route/path] [${JSON.stringify(input)}]`)
  }

  // register material ui makeStyles
  reg_js_import(js_context, 'react-router-dom.Route')

  const childrenExpression = (() => {
    if (!!input.children) {
      if (!Array.isArray(input.children)) {
        throw new Error(`ERROR: [route/path] children is not an array [${JSON.stringify(input.children)}]`)
      }
      return input.children.map(child => {
        return js_process(
          {
            ...js_context,
            CONTEXT_JSX: true,
            CONTEXT_STATEMENT: false,
          },
          null,
          child
        )
      })
    } else {
      return []
    }
  })()

  // create jsx element with props and children
  const jsx_element = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier('react-router-dom.Route'),
      [
        t.jSXAttribute(
          t.jSXIdentifier('path'),
          t.stringLiteral(input.path),
        ),
        t.jSXAttribute(
          t.jSXIdentifier('element'),
          !!input.element
          ? js_process(
              {
                ...js_context,
                CONTEXT_JSX: true,
                CONTEXT_STATEMENT: false,
              },
              'element',
              input.element
            )
          : t.jSXExpressionContainer(
            t.nullLiteral()
          )
        )
      ]
    ),
    t.jSXClosingElement(
      t.jSXIdentifier('react-router-dom.Route'),
    ),
    childrenExpression
  )

  // check statement context
  if (js_context.CONTEXT_STATEMENT) {
    reg_js_variable(js_context, `${js_context.CONTEXT_SCOPE}.${ref}`)
    return t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ref),
          callExpression,
        )
      ]
    )
  } else {
    return jsx_element
  }
}

// create route context ast
function route_context(js_context, ref, input) {

  if (!('_type' in input) || input._type !== 'route/context') {
    throw new Error(`ERROR: input._type is not [route/context] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/context] [${JSON.stringify(input)}]`)
  }

  // register
  reg_js_import(js_context, 'react-router-dom.useNavigate')
  reg_js_import(js_context, 'react-router-dom.useLocation')
  reg_js_import(js_context, 'react-router-dom.useParams')
  // reg_js_import(js_context, 'react-router-dom.useRouteMatch')

  // register context name
  reg_js_import(js_context, input.name)

  // contextExpression
  const contextExpression = t.callExpression(
    t.identifier('react.useContext'),
    [
      t.identifier(input.name)
    ]
  )

  const resultExpression = _js_parse_expression(
    js_context,
    `
    (() => {
      const routerContext = $I('react.useContext')($I('${input.name}'))
      const _navigate = $I('react-router-dom.useNavigate')()
      const navigate = (path) => {
        const new_path = (routerContext.basename + '/' + path).replace(/\\/+/g, '/')
        _navigate(new_path)
      }
      const _location = $I('react-router-dom.useLocation')()
      const pathname = (() => {
        if (_location.pathname.startsWith(routerContext.basename)) {
          const newUrl = ('/' + _location.pathname.substring(routerContext.basename.length))
          return newUrl.replace(/\\/+/g, '/')
        } else {
          return _location.pathname
        }
      })()
      const search = _location.search
      const params = $I('react-router-dom.useParams')()
      return {
        ...routerContext,
        navigate: navigate,
        pathname: pathname,
        search: search,
        params: params,
      }
    })()
    `,
    {
      plugins: [
        'jsx', // support jsx here
      ]
    }
  )

  // if CONTEXT_STATEMENT
  if (!!js_context.CONTEXT_STATEMENT) {
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
  } else {
    return resultExpression
  }
}

// process input
function js_process(js_context, ref, input) {

  if (isPrimitive(input)) {
    return js_primitive(js_context, ref, input)
  }

  if (Array.isArray(input)) {
    return js_array(js_context, ref, input)
  }

  if (! ('_type' in input)) {
    // no '_type' is treated as json object
    return js_object(js_context, ref, input)
  }

  const typeSpec = js_context.spec.types[input._type]
  if (!typeSpec) {
    throw new Error(`ERROR: unknown type [${input._type}]`)
  }

  if (typeSpec.template?.kind === 'custom') {

    return template_custom(js_context, ref, input)

  } else if (typeSpec.template?.kind === 'react/element') {

    return template_react_element(js_context, ref, input)

  } else if (typeSpec.template?.kind === 'js/object') {

    return template_js_object(js_context, ref, input)

  } else if (input._type === 'js/string') {

    return js_string(js_context, ref, input)

  } else if (input._type === 'js/number') {

    return js_number(js_context, ref, input)

  } else if (input._type === 'js/boolean') {

    return js_boolean(js_context, ref, input)

  } else if (input._type === 'js/null') {

    return js_null(js_context, ref, nput)

  } else if (input._type === 'js/import') {

    return js_import(js_context, ref, input)

  } else if (input._type === 'js/export') {

    return js_export(js_context, ref, input)

  } else if (input._type === 'js/variable') {

    return js_variable(js_context, ref, input)

  } else if (input._type === 'js/expression') {

    return js_expression(js_context, ref, input)

  } else if (input._type === 'js/statement') {

    return js_statement(js_context, ref, input)

  } else if (input._type === 'js/function') {

    return js_function(js_context, ref, input)

  } else if (input._type === 'js/call') {

    return js_call(js_context, ref, input)

  } else if (input._type === 'js/condition') {

    return js_condition(js_context, ref, input)

  } else if (input._type === 'js/map') {

    return js_map(js_context, ref, input)

  } else if (input._type === 'js/reduce') {

    return js_reduce(js_context, ref, input)

  } else if (input._type === 'js/filter') {

    return js_filter(js_context, ref, input)

  } else if (input._type === 'js/transform') {

    // TODO
    throw new Error(`ERROR: unsupported input._type [${input._type}]`)

  } else if (input._type === 'js/trigger') {

    // TODO
    throw new Error(`ERROR: unsupported input._type [${input._type}]`)

  } else if (input._type === 'react/element') {

    return react_element(js_context, ref, input)

  } else if (input._type === 'react/html') {

    return react_html(js_context, ref, input)

  } else if (input._type === 'react/state') {

    return react_state(js_context, ref, input)

  } else if (input._type === 'react/effect') {

    return react_effect(js_context, ref, input)

  } else if (input._type === 'react/context') {

    return react_context(js_context, ref, input)

  } else if (input._type === 'mui/style') {

    return mui_style(js_context, ref, input)

  } else if (input._type === 'mui/theme') {

    return mui_theme(js_context, ref, input)

  } else if (input._type === 'route/path') {

    return route_path(js_context, ref, input)

  } else if (input._type === 'route/context') {

    return route_context(js_context, ref, input)

  } else {

    throw new Error(`ERROR: unrecognized input._type [${input._type}] [${JSON.stringify(input)}]`)
  }
}

// return an react component function
function react_component(js_context, input) {

  if (!input.component) {
    throw new Error(`ERROR: react/component [component] not defined ${JSON.stringify(input)}`)
  }

  js_context = {
    ...js_context,
    CONTEXT_STATEMENT: true,
    CONTEXT_SCOPE: '$local',
  }

  const block_statements = []

  // check if there are any block statements
  Object.keys(input)
    .sort((a, b) => {
      if (!!input[a]._order && !!input[b]._order) {
        return input[a]._order - input[b]._order
      } else {
        return 0
      }
    })
    .map(key => {
      // ignore type / name / props / children
      if (key === 'component' || key.startsWith('_')) {
        return
      }

      if (key.startsWith('...') && input[key]._type !== 'react/state') {
        // unrecognized component definition starting with '...'
        throw new Error(`ERROR: unrecognized react component spread definition [${key}] [${input[key]._type}]`)
      }

      // console.log(`input[${key}]`, input[key])
      const statement = js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: true
        },
        key,
        input[key]
      )

      if (t.isBlockStatement(statement)) {
        t.addComment(statement.body[0], 'leading', ` ${key} `, false)
        t.addComment(statement.body[statement.body.length - 1], 'trailing', ` ${key} `, false)
        block_statements.push(...(statement.body))
      } else {
        t.addComment(statement, 'leading', ` ${key} `, false)
        t.addComment(statement, 'trailing', ` ${key} `, false)
        block_statements.push(statement)
      }
    })

  // process components, this will register such as 'forms'
  const result_component = react_element(
    {
      ...js_context,
      CONTEXT_JSX: false,
      CONTEXT_STATEMENT: false
    },
    null,
    input.component
  )

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
        t.addComment(formDeclaration, 'leading', ` useFormContext() `, false)
        t.addComment(formDeclaration, 'trailing', ` useFormContext() `, false)
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
        t.addComment(formDeclaration, 'leading', ` useForm[${name}] `, false)
        t.addComment(formDeclaration, 'trailing', ` useForm[${name}] `, false)
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
          result_component,
        )
      ]
    )
  )

  return result
}

// return an react component function
function react_provider(js_context, input, ui_comp_name) {

  if (!input.provider) {
    throw new Error(`ERROR: react/provider [provider] not defined ${JSON.stringify(input)}`)
  }

  js_context = {
    ...js_context,
    CONTEXT_STATEMENT: true,
    CONTEXT_SCOPE: '$local'
  }

  const block_statements = []

  // check if there are any block statements
  Object.keys(input)
    .sort((a, b) => {
      if (!!input[a]._order && !!input[b]._order) {
        return input[a]._order - input[b]._order
      } else {
        return 0
      }
    })
    .map(key => {
      // ignore type / name / props / children
      if (key === 'provider' || key.startsWith('_')) {
        return
      }

      if (key.startsWith('...') && input[key]._type !== 'react/state') {
        // unrecognized component definition starting with '...'
        throw new Error(`ERROR: unrecognized react component spread definition [${key}] [${input[key]._type}]`)
      }

      // console.log(`input[${key}]`, input[key])
      const statement = js_process(
        {
          ...js_context,
          CONTEXT_JSX: false,
          CONTEXT_STATEMENT: true
        },
        key,
        input[key]
      )

      if (t.isBlockStatement(statement)) {
        t.addComment(statement.body[0], 'leading', ` ${key} `, false)
        t.addComment(statement.body[statement.body.length - 1], 'trailing', ` ${key} `, false)
        block_statements.push(...(statement.body))
      } else {
        t.addComment(statement, 'leading', ` ${key} `, false)
        t.addComment(statement, 'trailing', ` ${key} `, false)
        block_statements.push(statement)
      }
    })

  // provider expression
  const providerExpression =
    t.objectExpression
      (
        Object
          .keys(input.provider)
          .map(key =>
          {
            const value = input.provider[key]
            return t.objectProperty(
              t.identifier(key),
              js_process
              (
                {
                  ...js_context,
                  CONTEXT_JSX: false,
                  CONTEXT_STATEMENT: false
                },
                key,
                value
              )
            )
          }
        )
      )

  // register js context
  reg_js_import(js_context, 'react.createContext')
  reg_js_variable(js_context, `${ui_comp_name}`)
  reg_js_variable(js_context, `${ui_comp_name}_Context`)
  reg_js_variable(js_context, `${ui_comp_name}_Context.Provider`)
  // reg_js_import(js_context, 'react.Provider')

  // return a list of statement
  const result = [
    // const comp_name_Context = React.createContext()
    t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(`${ui_comp_name}_Context`),
          t.callExpression(
            t.identifier('react.createContext'),
            [],
          )
        )
      ]
    ),
    t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(`${ui_comp_name}_Context.Provider`),
          t.memberExpression(
            t.identifier(`${ui_comp_name}_Context`),
            t.identifier('Provider')
          )
        )
      ]
    ),
    /*
    t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(ui_comp_name),
          t.callExpression(
            t.arrowFunctionExpression(
              [],
              t.blockStatement(
                [
                  */
                  // const comp_name_Function = (props) => {}
    t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier(`${ui_comp_name}`),
          t.arrowFunctionExpression(
            [
              t.identifier('props')
            ],
            t.blockStatement(
              [
                // insert block_statements from earlier
                ...block_statements,
                t.returnStatement(
                  t.jSXElement(
                    t.jSXOpeningElement(
                      t.jSXIdentifier(`${ui_comp_name}_Context.Provider`),
                      [
                        t.jSXAttribute(
                          t.jSXIdentifier('value'),
                          t.jSXExpressionContainer(
                            providerExpression,
                          )
                        )
                      ]
                    ),
                    t.jSXClosingElement(
                      t.jSXIdentifier(`${ui_comp_name}_Context.Provider`),
                    ),
                    [
                      t.jSXExpressionContainer(
                        t.memberExpression(
                          t.identifier('props'),
                          t.identifier('children')
                        )
                      )
                    ]
                  )
                )
              ]
            )
          )
        )
      ]
    ),
    t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(
          t.identifier(`${ui_comp_name}`),
          t.identifier('Context')
        ),
        t.identifier(`${ui_comp_name}_Context`)
      )
    ),
    t.exportNamedDeclaration(
      null,
      [
        t.exportSpecifier(
          t.identifier(`${ui_comp_name}_Context`),
          t.identifier(`Context`)
        )
      ]
    ),
    t.exportDefaultDeclaration(
      t.identifier(ui_comp_name)
    ),
  ]

  return result
}

// export
module.exports = {
  // top methods
  js_process,
  react_component,
  react_provider,
  // register & resolve
  reg_js_import,
  reg_js_variable,
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
  js_import,
  js_export,
  js_variable,
  js_expression,
  js_statement,
  js_function,
  js_call,
}
