const fs = require('fs')
const path = require('path')
const objPath = require("object-path")
const { SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const prettier = require("prettier")
const babel = require('@babel/standalone')
const generate = require('@babel/generator').default
const t = require("@babel/types")
const {
  isPrimitive,
  capitalize,
} = require('./util_base')
const {
    reg_js_variable,
    reg_js_import,
    js_process,
    react_provider,
    js_resolve_ids,
} = require('./util_code')
const db = require('../db/db')

/**
 * handle_react_provider
 */
async function handle_react_provider(req, res) {

    try {
        // const { ui_deployment, ui_component } = req.context
        // console.log(req.context)

        if (! ('ui_spec' in req.context)
            || ! (req.context.ui_spec.importMaps)
        ) {
            return {
                status: 422,
                type: 'application/json',
                data: {
                    status: FAILURE,
                    message: `ERROR: ui_spec.importMaps not defined [${JSON.stringify(req.context.ui_spec)}]`
                }
            }
        }

        if (! ('ui_component_spec' in req.context)
            || ! (req.context.ui_component_spec.provider)
        ) {
            return {
                status: 422,
                type: 'application/json',
                data: {
                    status: FAILURE,
                    message: `ERROR: ui_component_spec.provider not defined [${JSON.stringify(req.context.ui_component_spec)}]`
                }
            }
        }

        // import maps
        const importMaps = req.context.ui_spec.importMaps

        // process context
        const js_context = {
            spec: req.appx_spec,
            variables: {},
            imports: {},
            states: {},
            forms: {},
            tables: {},
            parsed: {},
            appx: req.context
        }

        // ui_elem
        const ui_comp_name = ('self/' + req.context.ui_component_name).replace(/\/+/g, '/')
        reg_js_variable(js_context, `${ui_comp_name}`, 'const', capitalize(req.context.ui_component_name))
        js_context.self = `${ui_comp_name}`

        // register other variables
        reg_js_variable(js_context, `${ui_comp_name}_Context`)
        reg_js_variable(js_context, `${ui_comp_name}_Context.Provider`)
        reg_js_variable(js_context, `${ui_comp_name}_Function`)

        reg_js_import(js_context, 'react', use_default=true, 'React')
        //reg_js_import(js_context, 'react-dom', use_default=true, 'ReactDOM')

        // console.log(req.context.ui_component_spec)
        // console.log(js_context.states)

        // create ast tree for the program
        const ast_tree = t.file(
          t.program(
            react_provider(js_context, req.context.ui_component_spec, ui_comp_name),
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

    } catch (err) {

        console.log(err)
        return {
            status: 500,
            type: 'application/json',
            data: String(err),
        }
    }
}

// export
module.exports = {
    handle_react_provider: handle_react_provider
}
