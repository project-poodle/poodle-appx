//const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
//const babel = require('@babel/standalone')
//const generate = require('@babel/generator').default
//const traverse = require('@babel/traverse').default
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
        throw new Error(`ERROR: input is not primitive [${typeof input}] [${input}]`)
      }
    default:
      throw new Error(`ERROR: input is not primitive [${typeof input}] [${input}]`)
  }
}

// create array js ast
function js_array(js_context, input, return_array=false) {

  if (!Array.isArray(input)) {
    throw new Error(`ERROR: input is not array [${typeof input}] [${input}]`)
  }

  if (return_array) {
    return input.map(row => {
      return isPrimitive(row)
        ? js_primitive(js_context, row)
        : Array.isArray(row)
          ? js_array(js_context, row)
          : js_object(js_context, row)
    })
  } else {
    return t.arrayExpression(
      input.map(row => {
        return isPrimitive(row)
          ? js_primitive(js_context, row)
          : Array.isArray(row)
            ? js_array(js_context, row)
            : js_object(js_context, row)
      })
    )
  }
}

// create object js ast
function js_object(js_context, input) {

  if (typeof input != 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${input}]`)
  }

  if (Array.isArray(input)) {
    throw new Error(`ERROR: input is an array [${typeof input}] [${input}]`)
  }

  if ('type' in input) {

    if (input.type == 'jsx/element') {

      return jsx_element(js_context, input)

    } else if (input.type == 'js/module') {

      return js_module(js_context, input)

    } else {

      throw new Error(`ERROR: unrecognized input.type [${input.type}] [${input}]`)
    }

  } else {
    // no 'type' is treated as json object
    return t.objectExpression(
      Object.keys(input).map(key => {
        const value = input[key]
        return t.objectProperty(
          t.stringLiteral(key),
          isPrimitive(value)
            ? js_primitive(js_context, value)
            : Array.isArray(value)
              ? js_array(js_context, value)
              : js_object(js_context, value)
        )
      })
    )
  }
}

// create js module ast
function js_module(js_context, input) {

  if (!('type' in input) || input.type != 'js/module') {
    throw new Error(`ERROR: input.type is not [js/module] [${input.type}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/module] [${input}]`)
  }

  js_reg_import(js_context, input.name)

  return t.identifier(input.name)
}

// create jsx element ast
function jsx_element(js_context, input) {

  if (!('type' in input) || input.type != 'jsx/element') {
    throw new Error(`ERROR: input.type is not [jsx/element] [${input.type}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [jsx/element] [${input}]`)
  }

  js_reg_import(js_context, input.name)

  return t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier(input.name),
      'props' in input ? jsx_props(js_context, input.props) : []
    ),
    t.jSXClosingElement(
      t.jSXIdentifier(input.name),
    ),
    'children' in input ? js_array(js_context, input.children, true) : []
  )
}

// create jsx props ast
function jsx_props(js_context, props) {

  if (! props) {
    return []
  }

  const results = Object.keys(props).map(prop_key => {
    const prop = props[prop_key]
    return t.jSXAttribute(
      t.jSXIdentifier(prop_key),
      typeof prop == 'string'
        ? t.stringLiteral(prop) // TODO
        : t.jSXExpressionContainer(
            isPrimitive(prop)
              ? js_primitive(prop)
                : Array.isArray(prop)
                  ? js_array(js_context, prop)
                  : js_object(js_context, prop)
          )
    )
  })

  // console.log(results)
  return results
}

// register variables
function js_reg_variable(js_context, variable_full_path, kind='const', do_import=false) {

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

function js_reg_import(js_context, variable_full_path) {

    js_reg_variable(js_context, variable_full_path, 'const', true)
}

// get variable definition
function js_get_variable(js_context, variable_full_path) {

    if (variable_full_path in js_context.variables) {
        return js_context.variables[variable_full_path]
    } else {
        throw new Error(`ERROR: unable to find variable [${variable_full_path}]`)
    }
}

// export
module.exports = {
    js_primitive: js_primitive,
    js_array: js_array,
    js_object: js_object,
    js_reg_import: js_reg_import,
    js_reg_variable: js_reg_variable,
    js_get_variable: js_get_variable,
    jsx_element: jsx_element,
    jsx_props: jsx_props
}
