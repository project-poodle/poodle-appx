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
} = require('./util_code')
const db = require('../db/db')

/**
 * handle_react_element
 */
function handle_react_element(req, res) {

    // const { ui_deployment, ui_element } = req.context
    // console.log(req.context)

    if (! ('ui_spec' in req.context) || ! ('importMaps' in req.context.ui_spec) ) {
        return {
            status: 422,
            type: 'application/json',
            data: {
                status: FAILURE,
                message: `ERROR: ui_spec.importMaps not defined [${req.context.ui_spec}]`
            }
        }
    }

    if (! ('ui_element_spec' in req.context) || ! ('element' in req.context.ui_element_spec) ) {
        return {
            status: 422,
            type: 'application/json',
            data: {
                status: FAILURE,
                message: `ERROR: ui_element_spec.element not defined [${req.context.ui_element_spec}]`
            }
        }
    }

    if (! ('type' in req.context.ui_element_spec.element) || req.context.ui_element_spec.element.type != 'react/element') {
        return {
            status: 422,
            type: 'application/json',
            data: {
                status: FAILURE,
                message: `ERROR: unrecognized ui_element_spec.element.type [${req.context.ui_element_spec.element.type}]`
            }
        }
    }

    // import maps
    const importMaps = req.context.ui_spec.importMaps

    // process context
    const js_context = {
        topLevel: true,
        variables: {},
        imports: {},
        states: {},
        appx: req.context
    }

    // ui_elem
    const ui_elem_name = ('self/' + req.context.ui_element_name).replace(/\/+/g, '/')
    reg_js_variable(js_context, ui_elem_name)
    //console.log(get_js_variable(js_context, ui_elem_name))

    reg_js_import(js_context, 'react', true, 'React')
    //reg_js_import(js_context, 'react-dom', true, 'ReactDOM')

    const input = req.context.ui_element_spec

    // check if there are any block statements
    const block_statements = []
    Object.keys(input).map(key => {
      // ignore type / name / props / children
      if (key === 'type' || key === 'element' || key === 'propTypes') {
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

      } else if (input[key].type === 'js/block') {
        // if input[key] is 'js/block'
        // adds each of the block statement
        block_statements.push(...(js_process(
          js_context,
          input[key]).body
        ))

      } else if (key.startsWith('...')) {
        // if input[key] starts with '...'
        if (input[key].type === 'react/state') {
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
            throw new Error(`ERROR: unrecognized top level definition [${key}] [${input[key].type}]`)
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
                        react_element(js_context, req.context.ui_element_spec.element)
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

    // res.status(200).type('application/javascript').send(prettified)
    return {
        status: 200,
        type: 'application/javascript',
        data: prettified,
    }
}

// export
module.exports = {
    handle_react_element: handle_react_element
}
