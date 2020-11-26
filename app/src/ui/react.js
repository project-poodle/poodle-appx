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

function js_primitive(input, js_context) {

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

function js_object(input, js_context) {

  if (typeof input != 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${input}]`)
  }

  if (Array.isArray(input)) {
    return t.arrayExpression(
      input.map(row => {
        return isPrimitive(row) ? js_primitive(row) : js_object(row, js_context)
      })
    )
  } else {
    return t.objectExpression(
      Object.keys(input).map(key => {
        const value = input[key]
        return t.objectProperty(
          t.stringLiteral(key),
          isPrimitive(value) ? js_primitive(value) : js_object(value, js_context)
        )
      })
    )
  }
}

function js_element(element, js_context) {

}

/**
 * process properties
 */
function js_props(props, js_context) {

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
                : js_object(prop, js_context)
          )
    )
  })

  // console.log(results)
  return results
}

function js_reg_variable(js_context, variable_handle, variable_spec) {

    let variable_name = variable_spec.name
    let sequence_id=0

    while (true) {

        const found = Object.keys(js_context.variables).find(key => {
            let spec = js_context.variables[key]
            return spec.name == variable_name
        })

        if (found) {
            sequence_id++
            variable_name = variable_spec.name + '$' + sequence_id
        } else {
            js_context.variables[variable_handle] = {
                ...variable_spec,
                name: variable_name,
                origName: variable_spec.name
            }
            return js_context
        }
    }
}

function js_get_variable(js_context, variable_handle) {

    if (variable_handle in js_context.variables) {
        return js_context.variables[variable_handle]
    } else {
        throw new Error(`ERROR: unable to find variable handle [${variable_handle}]`)
    }
}

function js_reg_import(js_context, variable_handle, import_path) {

    js_context.imports[variable_handle] = import_path
}


/**
 * handle_html
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

    // import maps
    const importMaps = ui_deployment.ui_app_spec.importMaps

    // process context
    const js_context = {
        variables: {},
        imports: {},
    }

    // ui_elem
    const ui_elem_paths = ui_element.ui_element_name.split("/")
    const ui_elem_name = ui_elem_paths.pop()
    js_reg_variable(js_context, 'ui_elem_name', { type: 'const', name: ui_elem_name })
    // console.log(js_get_variable(js_context, 'ui_elem_name'))

    // base_elem
    const base_elem_paths = ui_element.ui_element_spec.base.name.split("/")
    const base_elem_name = base_elem_paths.pop()
    js_reg_variable(js_context, 'base_elem_name', { type: 'const', name: base_elem_name })
    js_reg_import(js_context, 'base_elem_name', ui_element.ui_element_spec.base.name)
    // console.log(js_get_variable(js_context, 'base_elem_name'))

    // props and children for base_elem
    const props = ui_element.ui_element_spec.base.props
    const children = ui_element.ui_element_spec.base.children

    //console.log(js_context)

    //js_add_obj(js_context, 'react_elem_name', react_elem_name)
    //js_add_import(js_context, react_elem_name, importMaps)

    const program = t.program(
      [
        t.variableDeclaration(
          'const',
          [
            t.variableDeclarator(
              t.identifier(js_get_variable(js_context, 'ui_elem_name').name),
              t.arrowFunctionExpression(
                [
                  t.identifier('props'),
                  t.identifier('children'),
                ],
                t.blockStatement(
                  [
                    t.returnStatement(
                      t.jSXElement(
                        t.jSXOpeningElement(
                          t.jSXIdentifier(js_get_variable(js_context, 'base_elem_name').name),
                          js_props(props, js_context)
                        ),
                        t.jSXClosingElement(
                          t.jSXIdentifier(js_get_variable(js_context, 'base_elem_name').name)
                        ),
                        children ? children.map(child => {
                          child
                          // TODO - children
                        }) : []
                      )
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

    // this is to handle a bug that babel/traverse do not work standalone on program
    const wrapped = {
        type: "File",
        program: program
    }
    //console.log(wrapped)

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
      }
    })

    const output = generate(program, {}, {})

    res.status(200).type('application/javascript').send(output.code)
}

// export
module.exports = {
    handle_react: handle_react
}
