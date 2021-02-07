const fs = require('fs')
const url = require('url')
const path = require('path');
const objPath = require("object-path")
const prettier = require("prettier")
const Mustache = require('mustache')

const db = require('../db/db')
const { SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const { get_ui_deployment } = require ('./util_lookup')
const { RENDER_JSON, KEY_VALUE } = require('./html')
const { handle_react_component } = require('./react_component')
const { handle_react_provider } = require('./react_provider')

const rootDir = path.join(__dirname, '../../../ui/')
// const INDEX_HTML = 'index.html'

/**
 * handle_render
 */
async function handle_render(req, res, load_from_db=true) {

    try {
        let {
          req_type,
          namespace,
          ui_name,
          ui_ver,
          ui_spec,
          ui_deployment,
          ui_deployment_spec,
          ui_component_name,
          ui_component_type,
          ui_component_spec,
          ui_route_name,
          ui_route_spec,
        } = req.context

        /*
        console.log(
          namespace,
          ui_name,
          ui_ver,
          ui_spec,
          ui_deployment,
          ui_deployment_spec,
          ui_component_name,
          ui_component_type,
          ui_component_spec
        )
        */

        // get ui_component from context
        // let { ui_component } = req.context

        // if loading from db
        if (load_from_db) {

            if (req_type === 'ui_component') {
                // handle ui_component
                let comp_result = await db.query_async(`
                    SELECT
                        ui.namespace,
                        ui.ui_name,
                        ui.ui_ver,
                        ui.ui_spec,
                        ui_deployment.ui_deployment,
                        ui_deployment.ui_deployment_spec,
                        ui_component.ui_component_name,
                        ui_component.ui_component_type,
                        ui_component.ui_component_spec,
                        ui_component.create_time,
                        ui_component.update_time
                    FROM ui_component
                    JOIN ui
                        ON ui_component.namespace = ui.namespace
                        AND ui_component.ui_name = ui.ui_name
                        AND ui_component.ui_ver = ui.ui_ver
                    JOIN ui_deployment
                        ON ui_component.namespace = ui_deployment.namespace
                        AND ui_component.ui_name = ui_deployment.ui_name
                        AND ui_component.ui_ver = ui_deployment.ui_ver
                    WHERE
                        ui.namespace = ?
                        AND ui.ui_name = ?
                        AND ui_deployment.ui_deployment = ?
                        AND ui_component.ui_component_name = ?
                        AND ui.deleted=0
                        AND ui_component.deleted=0
                        AND ui_deployment.deleted=0`,
                    [
                        namespace,
                        ui_name,
                        ui_deployment,
                        ui_component_name,
                    ]
                )

                if (comp_result.length == 0) {
                    return {
                        status: 422,
                        type: 'application/json',
                        data: {
                            status: FAILURE,
                            message: `ERROR: unable to find ui_component [${ui_component_name}]`
                        }
                    }
                }

                // extract result
                req.context = {
                  ...req.context,
                  ...comp_result[0],
                }

                // update local variables
                namespace           = comp_result[0].namespace
                ui_name             = comp_result[0].ui_name
                ui_ver              = comp_result[0].ui_ver
                ui_spec             = comp_result[0].ui_spec
                ui_deployment       = comp_result[0].ui_deployment
                ui_deployment_spec  = comp_result[0].ui_deployment_spec
                ui_component_name     = comp_result[0].ui_component_name
                ui_component_type     = comp_result[0].ui_component_type
                ui_component_spec     = comp_result[0].ui_component_spec

            } else if (req_type === 'ui_route') {
                // handle ui_route
                let comp_result = await db.query_async(`
                    SELECT
                        ui.namespace,
                        ui.ui_name,
                        ui.ui_ver,
                        ui.ui_spec,
                        ui_deployment.ui_deployment,
                        ui_deployment.ui_deployment_spec,
                        ui_route.ui_route_name,
                        ui_route.ui_route_spec,
                        ui_route.create_time,
                        ui_route.update_time
                    FROM ui_route
                    JOIN ui
                        ON ui_route.namespace = ui.namespace
                        AND ui_route.ui_name = ui.ui_name
                        AND ui_route.ui_ver = ui.ui_ver
                    JOIN ui_deployment
                        ON ui_route.namespace = ui_deployment.namespace
                        AND ui_route.ui_name = ui_deployment.ui_name
                        AND ui_route.ui_ver = ui_deployment.ui_ver
                    WHERE
                        ui.namespace = ?
                        AND ui.ui_name = ?
                        AND ui_deployment.ui_deployment = ?
                        AND ui_route.ui_route_name = ?
                        AND ui.deleted=0
                        AND ui_route.deleted=0
                        AND ui_deployment.deleted=0`,
                    [
                        namespace,
                        ui_name,
                        ui_deployment,
                        ui_route_name,
                    ]
                )

                if (comp_result.length == 0) {
                    return {
                        status: 422,
                        type: 'application/json',
                        data: {
                            status: FAILURE,
                            message: `ERROR: unable to find ui_route [${ui_route_name}]`
                        }
                    }
                }

                // extract result
                req.context = {
                  ...req.context,
                  ...comp_result[0],
                }

                // update local variables
                namespace           = comp_result[0].namespace
                ui_name             = comp_result[0].ui_name
                ui_ver              = comp_result[0].ui_ver
                ui_spec             = comp_result[0].ui_spec
                ui_deployment       = comp_result[0].ui_deployment
                ui_deployment_spec  = comp_result[0].ui_deployment_spec
                ui_route_name       = comp_result[0].ui_route_name
                ui_route_spec       = comp_result[0].ui_route_spec

            } else {
                // unrecognized type
                return {
                    status: 422,
                    type: 'application/json',
                    data: {
                        status: FAILURE,
                        message: `ERROR: unrecognized preview type [${req_type}]`
                    }
                }
            }

        } else {

            // load from cache if not exist
            if (!ui_spec || !ui_deployment_spec) {

                const lookup = await get_ui_deployment(req, res)
                if (req.fatal) {
                    return
                }

                // extract result
                req.context = {
                    ...req.context,
                    ui_spec: lookup.ui_spec,
                    ui_deployment_spec: lookup.ui_deployment_spec,
                }

                // update local variables
                ui_spec             = lookup.ui_spec
                ui_deployment_spec  = lookup.ui_deployment_spec

            }
        }

        // check for importMaps
        if (! (ui_spec) || ! ('importMaps' in ui_spec) ) {
            return {
                status: 422,
                type: 'application/json',
                data: {
                    status: FAILURE,
                    message: `ERROR: ui_spec.importMaps not defined [${JSON.stringify(ui_spec)}]`
                }
            }
        }

        // check for ui_spec.index.entry
        if (! ('index' in ui_spec) || ! ('entry' in ui_spec.index)) {
            return {
                status: 422,
                type: 'application/json',
                data: {
                    status: FAILURE,
                    message: `ERROR: ui_spec.index.entry not defined [${JSON.stringify(ui_spec)}]`
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
                    message: `ERROR: ui_deployment_spec.apiMaps not defined [${JSON.stringify(ui_deployment_spec)}]`
                }
            }
        }

        // check for ui_component_spec
        if (req_type === 'ui_component' && (!ui_component_spec) ) {
            return {
                status: 422,
                type: 'application/json',
                data: {
                    status: FAILURE,
                    message: `ERROR: ui_component_spec not defined [${JSON.stringify(ui_component_spec)}]`
                }
            }
        }

        // check for ui_route_spec
        if (req_type === 'ui_route' && (!ui_route_spec) ) {
            return {
                status: 422,
                type: 'application/json',
                data: {
                    status: FAILURE,
                    message: `ERROR: ui_route_spec not defined [${JSON.stringify(ui_route_spec)}]`
                }
            }
        }

        // console.log(ui_component)

        const initjs_content = fs.readFileSync(path.join(rootDir, 'init.js'), "utf8")
        const html_content = fs.readFileSync(path.join(rootDir, 'render.html'), "utf8")

        // context
        let context = {
            APPX_ENV: {
                RENDER_JSON: RENDER_JSON,
                KEY_VALUE: KEY_VALUE,
                AUTH_ROOT: req.mount_options.auth_root,
                API_ROOT: req.mount_options.api_root,
                UI_ROOT: req.mount_options.ui_root,
                RELATIVE_URL: url.parse(req.url).pathname,
                APPX_PATHS: { 'paths': req.appx_paths },
                IMPORT_MAPS: ui_spec.importMaps,
                API_MAPS: { 'api': req.context.ui_deployment_spec.apiMaps},
                SELF: {
                  namespace: req.context.namespace,
                  ui_name: req.context.ui_name,
                  ui_deployment: req.context.ui_deployment,
                },
                SPEC: req.appx_spec,
            },
            entry: '$render$',
            // props: req.data.props,
        }

        // process [init_js]
        context.init_js = Mustache.render(initjs_content, context)
        // console.log(context.init_js)

        if (ui_component_type == 'react/component') {
          // process source code [element_js]
          const element_js = await handle_react_component(req, res)
          if (element_js.status !== 200) {
              return element_js
          }
          context.element_js = element_js.data

        } else if (ui_component_type == 'react/provider') {
          // process source code [element_js]
          const element_js = await handle_react_provider(req, res)
          if (element_js.status !== 200) {
              return element_js
          }
          context.element_js = element_js.data
        }

        // render the html_content
        let rendered = Mustache.render(html_content, context)

        // prettify
        const prettified = prettier.format(rendered, { semi: false, parser: "html" })

        // send back rendered html_content as html
        // console.log(prettified)
        return {
            status: 200,
            type: 'html',
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
    handle_render: handle_render
}
