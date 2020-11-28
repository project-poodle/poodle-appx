const fs = require('fs')
const path = require('path');
const objPath = require("object-path")
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const babel = require('@babel/standalone')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require("@babel/types")
const {
    js_primitive,
    js_array,
    js_object,
    reg_js_variable,
    get_js_variable,
    jsx_element,
    jsx_props
} = require('./util')

// console.log(generate)

/**
 * handle_jsx
 */
function handle_jsx(req, res) {

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

    if (! ('type' in ui_element.ui_element_spec.base) || ui_element.ui_element_spec.base.type != 'jsx/element') {
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
    reg_js_variable(js_context, ui_elem_name)
    //console.log(get_js_variable(js_context, ui_elem_name))

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
                      jsx_element(js_context, ui_element.ui_element_spec.base)
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
    handle_jsx: handle_jsx
}
