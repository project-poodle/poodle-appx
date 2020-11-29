//const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
//const babel = require('@babel/standalone')
//const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const { parse, parseExpression } = require('@babel/parser')
const t = require("@babel/types")
const db = require('../db/db')


////////////////////////////////////////////////////////////////////////////////
// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
}

// reserved test
function isReserved(test) {
  try {
    eval('var ' + test + ' = 1');
    return false
  } catch {
    return true
  }
}

// create primitive js ast
function js_primitive(js_context, input) {

  switch (typeof input) {
    case 'string':
      return t.stringLiteral(input)
    case 'number':
      return t.numericLiteral(input)
    case 'boolean':
      return t.booleanLiteral(input)
    case 'object':
      if (input == null) {
        return t.nullLiteral()
      } else {
        throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
      }
    default:
      throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
  }
}

// create array js ast
// js_array is true - will return result as an array of data
// js_array is false - will return arrayExpression
function js_array(js_context, input) {

  if (isPrimitive(input)) {
    throw new Error(`ERROR: input is primitive [${JSON.stringify(input)}]`)
  }

  if (typeof input != 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${JSON.stringify(input)}]`)
  }

  if (!Array.isArray(input)) {
    throw new Error(`ERROR: input is not array [${typeof input}] [${JSON.stringify(input)}]`)
  }

  return t.arrayExpression(
    input.map(row => {
      return js_process(js_context, row)
    })
  )
}

function js_object(js_context, input) {

  if (isPrimitive(input)) {
    throw new Error(`ERROR: input is primitive [${JSON.stringify(input)}]`)
  }

  if (typeof input != 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${JSON.stringify(input)}]`)
  }

  if (Array.isArray(input)) {
    throw new Error(`ERROR: input is array [${typeof input}] [${JSON.stringify(input)}]`)
  }

  return t.objectExpression(
    Object.keys(input).map(key => {
      const value = input[key]
      return t.objectProperty(
        t.stringLiteral(key),
        js_process(js_context, value)
      )
    })
  )
}

// create import ast
function js_import(js_context, input) {

  if (!('type' in input) || input.type != 'js/import') {
    throw new Error(`ERROR: input.type is not [js/import] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/import] [${JSON.stringify(input)}]`)
  }

  reg_js_import(js_context, input.name, use_default=false)

  // do we need to return anything?
  return t.identifier(input.name)
}

// create export ast
function js_export(js_context, input) {

  if (!('type' in input) || input.type != 'js/export') {
    throw new Error(`ERROR: input.type is not [js/export] [${input.type}] [${JSON.stringify(input)}]`)
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

  if (!('type' in input) || input.type != 'js/variable') {
    throw new Error(`ERROR: input.type is not [js/variable] [${input.type}] [${JSON.stringify(input)}]`)
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
        js_process(js_context, input.value)
      )
    ]
  )
}

// create expression ast
function js_expression(js_context, input) {

  if (!('type' in input) || input.type != 'js/expression') {
    throw new Error(`ERROR: input.type is not [js/expression] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.data missing in [js/expression] [${JSON.stringify(input)}]`)
  }

  return parseExpression(input.data)
}

// create block ast (allow return outside of function)
function js_block(js_context, input) {

  if (!('type' in input) || input.type != 'js/expression') {
    throw new Error(`ERROR: input.type is not [js/block] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.data missing in [js/block] [${JSON.stringify(input)}]`)
  }

  const program = parse(input.data, {
    // sourceType: 'module', // do not support module here
    allowReturnOutsideFunction: true, // allow return in the block statement
    plugins: [
      // 'jsx', // do not support jsx here
    ]
  })

  return t.blockStatement(
    program.program.body
  )
}

// create array function ast
function js_function(js_context, input) {

  if (!('type' in input) || input.type != 'js/function') {
    throw new Error(`ERROR: input.type is not [js/function] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('body' in input)) {
    throw new Error(`ERROR: input.body missing in [js/function] [${JSON.stringify(input)}]`)
  }

  return t.arrowFunctionExpression(
    input.params ? input.params.map(param => js_process(js_context, param)) : [],
    js_block(input.data),
    input.async ? true : false
  )
}

// create call ast
function js_call(js_context, input) {

  if (!('type' in input) || input.type != 'js/function') {
    throw new Error(`ERROR: input.type is not [js/call] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/call] [${JSON.stringify(input)}]`)
  }

  return t.callExpression(
    t.identifier(input.name),
    input.params ? input.params.map(param => js_process(js_context, param)) : []
  )
}

// create jsx element ast
function jsx_element(js_context, input) {

  if (!('type' in input) || input.type != 'jsx/element') {
    throw new Error(`ERROR: input.type is not [jsx/element] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [jsx/element] [${JSON.stringify(input)}]`)
  }

  reg_js_import(js_context, input.name, use_default=true)

  return t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier(input.name),
      'props' in input ? jsx_element_props(js_context, input.props) : []
    ),
    t.jSXClosingElement(
      t.jSXIdentifier(input.name),
    ),
    jsx_element_children(js_context, input.children)
  )
}

// create jsx element props ast
function jsx_element_props(js_context, props) {

  if (! props) {
    return []
  }

  if (typeof props != 'object') {
    throw new Error(`ERROR: input is not object [${typeof props}] [${JSON.stringify(props)}]`)
  }

  if (Array.isArray(props)) {
    throw new Error(`ERROR: input is array [${typeof props}] [${JSON.stringify(props)}]`)
  }

  const results = Object.keys(props).map(prop_key => {
    const prop = props[prop_key]
    return t.jSXAttribute(
      t.jSXIdentifier(prop_key),
      typeof prop == 'string'
        ? t.stringLiteral(prop) // TODO
        : t.jSXExpressionContainer(
            js_process(js_context, prop)
          )
    )
  })

  return results
}

// create jsx element children ast
function jsx_element_children(js_context, children) {

  // console.log(children)
  if (! children) {
    return []
  }

  if (typeof children != 'object') {
    throw new Error(`ERROR: input is not object [${typeof children}] [${JSON.stringify(children)}]`)
  }

  if (!Array.isArray(children)) {
    throw new Error(`ERROR: input is not array [${typeof children}] [${JSON.stringify(children)}]`)
  }

  return children.map(row => js_process(js_context, row))
}

// create jsx route ast
function jsx_route(js_context, input) {

  if (!('type' in input) || input.type != 'jsx/route') {
    throw new Error(`ERROR: input.type is not [jsx/route] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (!('appx' in js_context) || !('ui_deployment' in js_context.appx)) {
    throw new Error(`ERROR: context missing appx.ui_deployment [${JSON.stringify(js_context)}]`)
  }

  const { ui_deployment } = js_context.appx

  let route_results = db.query_sync(`SELECT
                  ui_route.namespace,
                  ui_route.app_name,
                  ui_route.ui_app_ver,
                  ui_deployment.runtime_name,
                  ui_deployment.ui_deployment_spec,
                  ui_route.ui_route_name,
                  ui_route.ui_route_spec,
                  ui_route.create_time,
                  ui_route.update_time
              FROM ui_route
              JOIN ui_deployment
                  ON ui_route.namespace = ui_deployment.namespace
                  AND ui_route.app_name = ui_deployment.app_name
                  AND ui_route.ui_app_ver = ui_deployment.ui_app_ver
              WHERE
                  ui_route.namespace = ?
                  AND ui_deployment.runtime_name = ?
                  AND ui_route.app_name = ?
                  AND ui_route.ui_app_ver = ?
                  AND ui_route.deleted=0
                  AND ui_deployment.deleted=0`,
              [
                  ui_deployment.namespace,
                  ui_deployment.runtime_name,
                  ui_deployment.app_name,
                  ui_deployment.ui_app_ver
              ])

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
                js_process(js_context, route.ui_route_spec)
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

  if (! ('type' in input)) {
    // no 'type' is treated as json object
    return js_object(js_context, input)
  }

  // 'type' is presented in the json object
  if (input.type == 'js/import') {

    return js_import(js_context, input)

  } else if (input.type == 'js/export') {

    return js_export(js_context, input)

  } else if (input.type == 'js/variable') {

    return js_variable(js_context, input)

  } else if (input.type == 'js/expression') {

    return js_expression(js_context, input)

  } else if (input.type == 'js/block') {

    return js_block(js_context, input)

  } else if (input.type == 'js/function') {

    return js_function(js_context, input)

  } else if (input.type == 'js/call') {

    return js_call(js_context, input)

  } else if (input.type == 'js/call/transform') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type == 'js/call/trigger') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type == 'jsx/element') {

    return jsx_element(js_context, input)

  } else if (input.type == 'jsx/route') {

    return jsx_route(js_context, input)

  } else if (input.type == 'jsx/control') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else {

    throw new Error(`ERROR: unrecognized input.type [${input.type}]`)
  }
}

function js_resolve(js_context, ast_tree) {
  // add imports and other context to the code
  traverse(ast_tree, {
    Program: {
      exit(path) {
        //console.log(`exit`)
        const import_statements = []
        Object.keys(js_context.imports).map(importKey => {
          // get basic information of import registration
          // console.log(js_context.imports[importKey])
          let import_name = js_context.variables[importKey].name
          let import_path = js_context.imports[importKey].path
          let sub_vars = js_context.imports[importKey].sub_vars
          // process import statement, then process sub_vars
          if (js_context.imports[importKey].use_default) {
            import_statements.unshift(
              t.importDeclaration(
                [
                  t.ImportDefaultSpecifier(
                    t.identifier(import_name)
                  )
                ],
                t.stringLiteral(import_path)
              )
            )
          } else {
            import_statements.unshift(
              t.importDeclaration(
                [
                  t.importNamespaceSpecifier(
                    t.identifier(import_name)
                  )
                ],
                t.stringLiteral(import_path)
              )
            )
          }
          // process import statement, then process sub_vars
          Object.keys(sub_vars).forEach((sub_var_key, i) => {
            // compute sub_var_name and sub_var_value
            let sub_var_value = sub_vars[sub_var_key]
            if (! sub_var_value) {
              return
            }
            //console.log(sub_var_value)
            // get sub_var variable registration
            let sub_var_name = js_context.variables[importKey + '|' + sub_var_key].name
            // compose sub_var_expression
            let sub_var_expression = t.memberExpression(
              t.identifier(import_name),
              t.stringLiteral(sub_var_value.shift()),
              true
            )
            while (sub_var_value.length) {
              sub_var_expression = t.memberExpression(
                sub_var_expression,
                t.stringLiteral(sub_var_value.shift()),
                true
              )
            }
            // add sub_var declarations to the body
            import_statements.unshift(
              t.variableDeclaration(
                'const',
                [
                  t.variableDeclarator(
                    t.identifier(sub_var_name),
                    sub_var_expression
                  )
                ]
              )
            )
          })
        })
        //
        import_statements.forEach((import_statement, i) => {
          path.unshiftContainer(
            'body',
            import_statement
          )
        })
      }
    },
    Identifier(path) {
      if (path.node.name in js_context.variables) {
        path.node.name = js_context.variables[path.node.name].name
      }
    },
    JSXIdentifier(path) {
      if (path.node.name in js_context.variables) {
        path.node.name = js_context.variables[path.node.name].name
      }
    }
  })
}

// register variables
function reg_js_variable(js_context, variable_full_path, kind='const', suggested_name=null) {

    let import_path = variable_full_path.split('|')[0]
    let sub_vars = variable_full_path.split('|')
    sub_vars.shift()

    let variable_prefix_paths = import_path.split('/')
    variable_prefix_paths = variable_prefix_paths.concat(sub_vars)
    if (suggested_name) {
      variable_prefix_paths.push(suggested_name)
    }
    // console.log(variable_prefix_paths)
    let variable_qualified_name = variable_prefix_paths.pop().replace(/[^_a-zA-Z0-9]/g, '_')
    if (isReserved(variable_qualified_name)) {
      variable_qualified_name = variable_qualified_name + '$' + variable_prefix_paths.pop().replace(/[^_a-zA-Z0-9]/g, '_')
    }

    // if variable is already registered, just return
    if (variable_full_path in js_context.variables) {
      return
    }

    while (true) {

        const found = Object.keys(js_context.variables).find(key => {
            let spec = js_context.variables[key]
            return spec.name == variable_qualified_name
        })

        // name conflict found
        if (found) {
            // update conflicting variable names
            Object.keys(js_context.variables).map(key => {
                let variable_spec = js_context.variables[key]
                if (variable_spec.name == variable_qualified_name) {
                    if (variable_spec.path_prefix.length) {
                        variable_spec.name = variable_spec.name + '$' + variable_spec.path_prefix.pop().replace(/[^_a-zA-Z0-9]/g, '_')
                    } else {
                        // we have exhausted the full path, throw exception
                        throw new Error(`ERROR: name resolution conflict [${variable_full_path}]`)
                    }
                }
            })
            // update our own variable name
            if (variable_prefix_paths) {
                variable_qualified_name = variable_qualified_name + '$' + variable_prefix_paths.pop().replace(/[^_a-zA-Z0-9]/g, '_')
            } else {
                // we have exhausted the full path, throw exception
                throw new Error(`ERROR: name resolution conflict [${variable_full_path}]`)
            }
        } else {
            js_context.variables[variable_full_path] = {
                kind: kind,
                name: variable_qualified_name,
                full_path: variable_full_path,
                path_prefix: variable_prefix_paths
            }
            return js_context
        }
    }
}

function reg_js_import(js_context, variable_full_path, use_default=false, suggested_name=null) {

    let import_path = variable_full_path.split('|')[0]
    let sub_vars = variable_full_path.split('|')
    sub_vars.shift()

    reg_js_variable(js_context, import_path, 'const', suggested_name)
    reg_js_variable(js_context, variable_full_path, 'const', suggested_name)

    if (!(import_path in js_context.imports)) {
      js_context.imports[import_path] = {
        use_default: use_default,
        suggested_name: suggested_name,
        path: import_path,
        sub_vars: {}
      }
    }

    if (sub_vars.length) {
      js_context.imports[import_path].sub_vars[sub_vars.join('|')] = sub_vars
    }
}

// get variable definition
function get_js_variable(js_context, variable_full_path) {

    if (variable_full_path in js_context.variables) {
        return js_context.variables[variable_full_path]
    } else {
        throw new Error(`ERROR: unable to find variable [${variable_full_path}]`)
    }
}

// export
module.exports = {
  js_process: js_process,
  js_resolve: js_resolve,
  js_array: js_array,
  js_object: js_object,
  js_primitive: js_primitive,
  js_import: js_import,
  js_export: js_export,
  js_variable: js_variable,
  js_expression: js_expression,
  js_block: js_block,
  js_function: js_function,
  js_call: js_call,
  jsx_element: jsx_element,
  reg_js_variable: reg_js_variable,
  reg_js_import: reg_js_import,
}
