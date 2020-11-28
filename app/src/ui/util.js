//const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
//const babel = require('@babel/standalone')
//const generate = require('@babel/generator').default
//const traverse = require('@babel/traverse').default
const { parse, parseExpression } = require('@babel/parser')
const t = require("@babel/types")


////////////////////////////////////////////////////////////////////////////////
// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
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
      return js_process(row)
    })
  )
}

function js_object(is_context, input) {

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
        js_process(value)
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

  reg_js_import(input.name)

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

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.value missing in [js/variable] [${JSON.stringify(input)}]`)
  }

  return t.variableDeclaration(
    input.kind ? input.kind : 'const',
    [
      t.variableDeclarator(
        t.identifier(input.name),
        js_process(input.value)
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
    input.params ? input.params.map(param => js_process(param)) : [],
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
    input.params ? input.params.map(param => js_process(param)) : []
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

  js_reg_import(js_context, input.name)

  return t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier(input.name),
      'props' in input ? jsx_element_props(js_context, input.props) : []
    ),
    t.jSXClosingElement(
      t.jSXIdentifier(input.name),
    ),
    jsx_element_children(input.children)
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
            js_process(prop)
          )
    )
  })

  return results
}

// create jsx element children ast
function jsx_element_children(js_context, children) {

  if (! children) {
    return []
  }

  if (typeof children != 'object') {
    throw new Error(`ERROR: input is not object [${typeof children}] [${JSON.stringify(children)}]`)
  }

  if (!Array.isArray(children)) {
    throw new Error(`ERROR: input is not array [${typeof children}] [${JSON.stringify(children)}]`)
  }

  return children.map(row => js_process(row))
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
    return js_object(input)
  }

  // 'type' is presented in the json object
  if (input.type == 'js/import') {

    return js_export(input)

  } else if (input.type == 'js/export') {

    return js_export(input)

  } else if (input.type == 'js/variable') {

    return js_variable(input)

  } else if (input.type == 'js/expression') {

    return js_expression(input)

  } else if (input.type == 'js/block') {

    return js_block(input)

  } else if (input.type == 'js/function') {

    return js_function(input)

  } else if (input.type == 'js/call') {

    return js_call(input)

  } else if (input.type == 'js/call/transform') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type == 'js/call/trigger') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type == 'jsx/element') {

    return jsx_element(js_context, input)

  } else if (input.type == 'jsx/control') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else {

    throw new Error(`ERROR: unrecognized input.type [${input.type}]`)
  }
}

// register variables
function reg_js_variable(js_context, variable_full_path, kind='const', do_import=false) {

    const variable_paths = variable_full_path.split('/')
    let variable_qualified_name = (variable_paths.pop() || variable_paths.pop()).replace(/[^_a-zA-Z0-9]/g, '_')

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
                    if (variable_spec.path_prefix) {
                        variable_spec.name = variable_spec.name + '$' + variable_spec.path_prefix.pop().replace(/[^_a-zA-Z0-9]/g, '_')
                    } else {
                        // we have exhausted the full path, throw exception
                        throw new Error(`ERROR: name resolution conflict [${variable_full_path}]`)
                    }
                }
            })
            // update our own variable name
            if (variable_paths) {
                variable_qualified_name = variable_qualified_name + '$' + variable_paths.pop().replace(/[^_a-zA-Z0-9]/g, '_')
            } else {
                // we have exhausted the full path, throw exception
                throw new Error(`ERROR: name resolution conflict [${variable_full_path}]`)
            }
        } else {
            js_context.variables[variable_full_path] = {
                kind: kind,
                name: variable_qualified_name,
                full_path: variable_full_path,
                path_prefix: variable_paths
            }
            if (do_import) {
                js_context.imports[variable_full_path] = variable_full_path
            }
            return js_context
        }
    }
}

function reg_js_import(js_context, variable_full_path) {

    reg_js_variable(js_context, variable_full_path, 'const', true)
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
  js_primitive: js_primitive,
  js_array: js_array,
  js_object: js_object,
  js_export: js_expirt,
  js_variable: js_variable,
  js_expression: js_expression,
  js_block: js_block,
  js_function: js_function,
  js_call: js_call,
  jsx_element: jsx_element,
  jsx_element_props: jsx_element_props,
  reg_js_variable: reg_js_variable,
  get_js_variable: get_js_variable,
}
