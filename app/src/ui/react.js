const fs = require('fs')
const path = require('path');
const objPath = require("object-path")
const Mustache = require('mustache')
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const babel = require('@babel/standalone')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require("@babel/types")

// console.log(generate)

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

    if (input.type == 'react/element') {

      return js_element(js_context, input)

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

// create element js ast
function js_element(js_context, input) {

  if (!('type' in input) || input.type != 'react/element') {
    throw new Error(`ERROR: input.type is not [react/element] [${input.type}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/element] [${input}]`)
  }

  js_reg_import(js_context, input.name)

  return t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier(input.name),
      'props' in input ? js_props(js_context, input.props) : []
    ),
    t.jSXClosingElement(
      t.jSXIdentifier(input.name),
    ),
    'children' in input ? js_array(js_context, input.children, true) : []
  )
}

// create props js ast
function js_props(js_context, props) {

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


/**
 * handle_react
 */
function handle_react(req, res) {

    const { ui_deployment, ui_element } = req.context

    if (! ('ui_app_spec' in ui_deployment) || ! ('importMaps' in ui_deployment.ui_app_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_app_spec.importMaps not defined [${ui_deployment}]`
        })
        return
    }

    if (! ('ui_element_spec' in ui_element) || ! ('base' in ui_element.ui_element_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_element_spec.base not defined [${ui_element}]`
        })
        return
    }

    if (! ('type' in ui_element.ui_element_spec.base) || ui_element.ui_element_spec.base.type != 'react/element') {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: unrecognized ui_element_spec.base.type [${ui_element.ui_element_spec.base.type}]`
        })
        return
    }

    // import maps
    const importMaps = ui_deployment.ui_app_spec.importMaps

    // process context
    const js_context = {
        variables: {},
        imports: {},
    }

    // ui_elem
    const ui_elem_name = ('self/' + ui_element.ui_element_name).replace(/\/+/g, '/')
    js_reg_variable(js_context, ui_elem_name)
    //console.log(js_get_variable(js_context, ui_elem_name))

    const program = t.program(
      [
        t.variableDeclaration(
          'const',
          [
            t.variableDeclarator(
              t.identifier(ui_elem_name),
              t.arrowFunctionExpression(
                [
                  t.identifier('props'),
                  t.identifier('children'),
                ],
                t.blockStatement(
                  [
                    t.returnStatement(
                      js_element(js_context, ui_element.ui_element_spec.base)
                    )
                  ]
                )
              )
            )
          ]
        ),
        t.exportDefaultDeclaration(
          t.identifier(ui_elem_name)
        ),
      ],
      [], // program directives
      "module"
    )

    // this is to handle a bug that @babel/traverse do not work on standalone program
    const wrapped = {
        type: "File",
        program: program
    }
    //console.log(wrapped)

    console.log(js_context)

    // add imports and other context to the code
    traverse(wrapped, {
      Program: {
        exit(path) {
          //console.log(`exit`)
          Object.keys(js_context.imports).map(importKey => {
            let import_name = js_context.variables[importKey].name
            let import_path = js_context.imports[importKey]
            path.unshiftContainer(
              'body',
              t.importDeclaration(
                [
                  t.importSpecifier(
                    t.identifier(import_name),
                    t.identifier('default'),
                  )
                ],
                t.stringLiteral(import_path)
              )
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

    // generate code
    const output = generate(program, {}, {})

    res.status(200).type('application/javascript').send(output.code)
}

// export
module.exports = {
    handle_react: handle_react
}
