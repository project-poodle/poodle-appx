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
    react_element,
    js_process,
    js_resolve_ids,
    isPrimitive,
} = require('./util')
const db = require('../db/db')

// console.log(generate)


/**
 * handle_react
 */
function handle_react(req, res) {

    const { ui_deployment, ui_element } = req.context

    if (! ('ui_spec' in ui_deployment) || ! ('importMaps' in ui_deployment.ui_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_spec.importMaps not defined [${ui_deployment}]`
        })
        return
    }

    if (! ('ui_element_spec' in ui_element) || ! ('element' in ui_element.ui_element_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_element_spec.element not defined [${ui_element}]`
        })
        return
    }

    if (! ('type' in ui_element.ui_element_spec.element) || ui_element.ui_element_spec.element.type != 'react/element') {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: unrecognized ui_element_spec.element.type [${ui_element.ui_element_spec.element.type}]`
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
    //reg_js_import(js_context, 'react-dom', true, 'ReactDOM')

    const input = ui_element.ui_element_spec

    // check if there are any block statements
    const block_statements = []
    Object.keys(input).map(key => {
      // ignore type / name / props / children
      if (key === 'type' || key === 'element' || key === 'propTypes') {
        return
      }
      // check if input[key] is 'js/block'
      if (!isPrimitive(input[key]) && input[key].type === 'js/block') {
        // adds each of the block statement
        block_statements.push(...(js_process(js_context, input[key]).body))

      } else {
        // process input[key] and assign to declared variable
        const variableDeclaration = t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                t.identifier(key),
                js_process(js_context, input[key])
              )
            ]
          )
        //t.addComment(variableDeclaration, 'leading', ' ' + key, true)
        t.addComment(variableDeclaration, 'trailing', ' ' + key, true)
        block_statements.push(
          variableDeclaration
        )
        // add empty statement
        //block_statements.push(
        //  t.emptyStatement()
        //)
      }
    })

    // console.log(t.addComment)
    // console.log(t.addComments)

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
                    [
                      ...block_statements,
                      t.returnStatement(
                        react_element(js_context, ui_element.ui_element_spec.element)
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
    )

    // console.log(js_context)

    // resolve imports and variables in the ast_tree
    js_resolve_ids(js_context, ast_tree)

    // generate code
    const output = generate(ast_tree, {}, {})
    // console.log(output.code)

    const prettified = prettier.format(output.code, { semi: false, parser: "babel" })

    res.status(200).type('application/javascript').send(prettified)
}

// export
module.exports = {
    handle_react: handle_react
}
