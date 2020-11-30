const fs = require('fs')
const path = require('path')
const objPath = require("object-path")
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const prettier = require("prettier")
const babel = require('@babel/standalone')
const generate = require('@babel/generator').default
const t = require("@babel/types")
const {
    reg_js_variable,
    reg_js_import,
    jsx_element,
    js_process,
    js_resolve
} = require('./util')
const db = require('../db/db')

// console.log(generate)


/**
 * handle_jsx
 */
function handle_jsx(req, res) {

    const { ui_deployment, ui_element } = req.context

    if (! ('ui_spec' in ui_deployment) || ! ('importMaps' in ui_deployment.ui_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_spec.importMaps not defined [${ui_deployment}]`
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
    const importMaps = ui_deployment.ui_spec.importMaps

    // process context
    const js_context = {
        variables: {},
        imports: {},
        appx: req.context
    }

    // ui_elem
    const ui_elem_name = ('self/' + ui_element.ui_element_name).replace(/\/+/g, '/')
    reg_js_variable(js_context, ui_elem_name)
    //console.log(get_js_variable(js_context, ui_elem_name))

    reg_js_import(js_context, 'react', true, 'React')
    reg_js_import(js_context, 'react-dom', true, 'ReactDOM')

    /*
    const useStyles = makeStyles((theme) => ({

      paper: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }
    }))
    */

    // create block statement
    const block_statements = []

    // if styles exist, handle styles
    if (ui_element.ui_element_spec.styles) {

      // console.log(ui_element.ui_element_spec.styles)
      delete ui_element.ui_element_spec.styles.type

      reg_js_import(js_context, '@material-ui/core|makeStyles')
      reg_js_variable(js_context, 'styles')

      block_statements.push(
        t.variableDeclaration(
          'const',
          [
            t.variableDeclarator(
              t.identifier('styles'),
              t.callExpression(
                t.callExpression(
                  t.identifier('@material-ui/core|makeStyles'),
                  [
                    t.arrowFunctionExpression(
                      [
                        t.identifier('theme')
                      ],
                      js_process(js_context, ui_element.ui_element_spec.styles)
                    )
                  ]
                ),
                []
              )
            )
          ]
        )
      )
    }

    // return statement
    block_statements.push(
      t.returnStatement(
        jsx_element(js_context, ui_element.ui_element_spec.base)
      )
    )

    // create ast tree for the program
    const ast_tree = t.file(
      t.program(
        [
          t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                t.identifier(ui_elem_name),
                t.arrowFunctionExpression(
                  [
                    t.identifier('props')
                  ],
                  t.blockStatement(
                    block_statements
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
    )

    // console.log(js_context)

    // resolve imports and variables in the ast_tree
    js_resolve(js_context, ast_tree)

    // generate code
    const output = generate(ast_tree, {}, {})
    // console.log(output.code)

    const prettified = prettier.format(output.code, { semi: false, parser: "babel" })

    res.status(200).type('application/javascript').send(prettified)
}

// export
module.exports = {
    handle_jsx: handle_jsx
}
