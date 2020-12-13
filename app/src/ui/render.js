const fs = require('fs')
const url = require('url')
const path = require('path');
const objPath = require("object-path")
const prettier = require("prettier")
const Mustache = require('mustache')

const db = require('../db/db')
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const { RENDER_JSON, KEY_VALUE } = require('./html')

const rootDir = path.join(__dirname, '../../../ui/')
// const INDEX_HTML = 'index.html'

/**
 * handle_render
 */
function handle_render(req, res) {

    const { namespace, ui_name, ui_deployment, ui_element_name } = req.context.ui_element

    console.log(namespace, ui_name, ui_deployment, ui_element_name)

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
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: unable to find ui_element [${req.context.ui_element}]`
        })
        return
    }

    const ui_element = elem_result[0]

    // check for importMaps
    if (! ('ui_spec' in ui_element) || ! ('importMaps' in ui_element.ui_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_spec.importMaps not defined [${ui_element}]`
        })
        return
    }

    // check for apiMaps
    if (! ('ui_deployment_spec' in ui_element) || ! ('apiMaps' in ui_element.ui_deployment_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_deployment_spec.apiMaps not defined [${ui_element}]`
        })
        return
    }

    // check for ui_element_spec
    if (! ('ui_element_spec' in ui_element) ) {
      res.status(422).json({
          status: FAILURE,
          message: `ERROR: ui_element_spec not defined [${ui_element}]`
      })
      return
    }

    fs.readFile(path.join(rootDir, 'init.js'), "utf8", (err, initjs_content) => {

        if (err) {
            res.status(422).json({
                status: FAILURE,
                message: `ERROR: cannot read init.js`
            })
            return
        }

        fs.readFile(path.join(rootDir, 'index.html'), "utf8", (err, html_content) => {

            if (err) {
                res.status(422).json({
                    status: FAILURE,
                    message: `ERROR: cannot read inde.html`
                })
                return
            }

            // context
            let context = {
                APPX_ENV: {
                    RENDER_JSON: RENDER_JSON,
                    KEY_VALUE: KEY_VALUE,
                    AUTH_ROOT: req.mount_options.auth_root,
                    API_ROOT: req.mount_options.api_root,
                    UI_ROOT: req.mount_options.ui_root,
                    RELATIVE_URL: url.parse(req.url).pathname,
                    IMPORT_MAPS: ui_element.ui_spec.importMaps,
                    API_MAPS: ui_element.ui_deployment_spec.apiMaps,
                },
                entry: ui_element.ui_element_name,
                // props: req.data.props,
            }

            context.init_js = Mustache.render(initjs_content, context)
            // console.log(context.init_js)

            // render the html_content
            let rendered = Mustache.render(html_content, context)

            // prettify
            const prettified = prettier.format(rendered, { semi: false, parser: "html" })

            // send back rendered html_content as html
            res.status(200).type('html').send(prettified)
        })
    })
}

// export
module.exports = {
    handle_render: handle_render
}
