const fs = require('fs')
const url = require('url')
const path = require('path');
const objPath = require("object-path")
const prettier = require("prettier")
const Mustache = require('mustache')

const db = require('../db/db')
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const { RENDER_JSON, KEY_VALUE } = require('./html')
const { handle_react } = require('./react')

const rootDir = path.join(__dirname, '../../../ui/')
// const INDEX_HTML = 'index.html'

/**
 * handle_render
 */
function handle_render(req, res, load_from_db=true) {

    let {
      namespace,
      ui_name,
      ui_ver,
      ui_spec,
      ui_deployment,
      ui_deployment_spec,
      ui_element_name,
      ui_element_type,
      ui_element_spec,
    } = req.context

    /*
    console.log(
      namespace,
      ui_name,
      ui_ver,
      ui_spec,
      ui_deployment,
      ui_deployment_spec,
      ui_element_name,
      ui_element_type,
      ui_element_spec
    )
    */

    // get ui_element from context
    // let { ui_element } = req.context

    // if loading from db
    if (load_from_db) {

        let elem_result = db.query_sync(`
            SELECT
                ui.namespace,
                ui.ui_name,
                ui.ui_ver,
                ui.ui_spec,
                ui_deployment.ui_deployment,
                ui_deployment.ui_deployment_spec,
                ui_element.ui_element_name,
                ui_element.ui_element_type,
                ui_element.ui_element_spec,
                ui_element.create_time,
                ui_element.update_time
            FROM ui_element
            JOIN ui
                ON ui_element.namespace = ui.namespace
                AND ui_element.ui_name = ui.ui_name
                AND ui_element.ui_ver = ui.ui_ver
            JOIN ui_deployment
                ON ui_element.namespace = ui_deployment.namespace
                AND ui_element.ui_name = ui_deployment.ui_name
                AND ui_element.ui_ver = ui_deployment.ui_ver
            WHERE
                ui.namespace = ?
                AND ui.ui_name = ?
                AND ui_deployment.ui_deployment = ?
                AND ui_element.ui_element_name = ?
                AND ui.deleted=0
                AND ui_element.deleted=0
                AND ui_deployment.deleted=0`,
            [
                namespace,
                ui_name,
                ui_deployment,
                ui_element_name,
            ]
        )

        if (elem_result.length == 0) {
            return {
                status: 422,
                type: 'application/json',
                data: {
                    status: FAILURE,
                    message: `ERROR: unable to find ui_element [${ui_element_name}]`
                }
            }
        }

        // extract result
        req.context = {
          ...req.context,
          ...elem_result[0],
        }

        namespace           = elem_result[0].namespace
        ui_name             = elem_result[0].ui_name
        ui_ver              = elem_result[0].ui_ver
        ui_spec             = elem_result[0].ui_spec
        ui_deployment       = elem_result[0].ui_deployment
        ui_deployment_spec  = elem_result[0].ui_deployment_spec
        ui_element_name     = elem_result[0].ui_element_name
        ui_element_type     = elem_result[0].ui_element_type
        ui_element_spec     = elem_result[0].ui_element_spec
    }

    // check for importMaps
    if (! (ui_spec) || ! ('importMaps' in ui_spec) ) {
        return {
            status: 422,
            type: 'application/json',
            data: {
                status: FAILURE,
                message: `ERROR: ui_spec.importMaps not defined [${ui_spec}]`
            }
        }
    }

    // check for apiMaps
    if (! (ui_deployment_spec) || ! ('apiMaps' in ui_deployment_spec) ) {
        return {
            status: 422,
            type: 'application/json',
            data: {
                status: FAILURE,
                message: `ERROR: ui_deployment_spec.apiMaps not defined [${ui_deployment_spec}]`
            }
        }
    }

    // check for ui_element_spec
    if (! (ui_element_spec) ) {
        return {
            status: 422,
            type: 'application/json',
            data: {
                status: FAILURE,
                message: `ERROR: ui_element_spec not defined [${ui_element_spec}]`
            }
        }
    }

    // console.log(ui_element)

    const initjs_content = fs.readFileSync(path.join(rootDir, 'init.js'), "utf8")
    const html_content = fs.readFileSync(path.join(rootDir, load_from_db ? 'index.html' : 'render.html'), "utf8")

    // context
    let context = {
        APPX_ENV: {
            RENDER_JSON: RENDER_JSON,
            KEY_VALUE: KEY_VALUE,
            AUTH_ROOT: req.mount_options.auth_root,
            API_ROOT: req.mount_options.api_root,
            UI_ROOT: req.mount_options.ui_root,
            RELATIVE_URL: url.parse(req.url).pathname,
            IMPORT_MAPS: ui_spec.importMaps,
            API_MAPS: ui_deployment_spec.apiMaps,
        },
        entry: ui_element_name,
        // props: req.data.props,
    }

    // process [init_js]
    context.init_js = Mustache.render(initjs_content, context)
    // console.log(context.init_js)

    // process source code [element_js]
    const element_js = handle_react(req, res)
    if (element_js.status !== 200) {
        return element_js
    }
    context.element_js = element_js.data

    // render the html_content
    let rendered = Mustache.render(html_content, context)

    // prettify
    const prettified = prettier.format(rendered, { semi: false, parser: "html" })

    // send back rendered html_content as html
    console.log(prettified)
    return {
        status: 200,
        type: 'html',
        data: prettified,
    }
}

// export
module.exports = {
    handle_render: handle_render
}
