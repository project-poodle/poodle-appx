const objPath = require("object-path")
const express = require('express')
const db = require('../db/db')
const cache = require('../cache/cache')
const { SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const {
  get_ui_deployment,
  get_ui_component,
  get_ui_route,
  log_comp_status,
  log_route_status,
  log_deployment_status,
} = require ('./util_lookup')
const { handle_html } = require('./html')
const { handle_react_component } = require('./react_component')
const { handle_react_provider } = require('./react_provider')
const { handle_render } = require('./render')
const { handle_preview } = require('./preview')

const ELEM_PREFIX = "/_elem/"
const ROUTE_PREFIX = "/_route/"

// const EXCLUDED_TYPES = [
//   "html",
// ]

/**
 * handle_elment
 */
async function handle_component(req, res) {

    // check ui_deployment
    let ui_deployment = await get_ui_deployment(req, res)
    if (req.fatal) {
        return
    }

    // check ui_component
    let ui_component = await get_ui_component(req, res)
    if (req.fatal) {
        return
    }

    // update context
    req.context = {
        ...req.context,
        ...ui_deployment,
        ...ui_component,
    }
    //console.log(req.context)

    // handle request by component_js type
    if (ui_component.ui_component_type == 'react/component') {

        const result = await handle_react_component(req, res)
        res.status(result.status)
            .type(result.type)
            .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
        return

    } else if (ui_component.ui_component_type == 'react/provider') {

        const result = await handle_react_provider(req, res)
        res.status(result.status)
            .type(result.type)
            .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
        return

    } else {

        let msg = `ERROR: unsupported ui component_js type [${ui_component.ui_component_type}] - [${JSON.stringify(ui_component)}]`
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        return
    }
}

/**
 * load_ui_router
 */
async function load_ui_router(namespace, ui_name, ui_deployment) {

    let router = express.Router()

    // query ui_component
    let comp_results = await db.query_async(`SELECT
                    ui_component.namespace,
                    ui_component.ui_name,
                    ui_component.ui_ver,
                    ui_deployment.ui_deployment,
                    ui_deployment.ui_deployment_spec,
                    ui_component.ui_component_name,
                    ui_component.ui_component_type,
                    ui_component.ui_component_spec,
                    ui_component.create_time,
                    ui_component.update_time
                FROM ui_component
                JOIN ui_deployment
                    ON ui_component.namespace = ui_deployment.namespace
                    AND ui_component.ui_name = ui_deployment.ui_name
                    AND ui_component.ui_ver = ui_deployment.ui_ver
                WHERE
                    ui_component.namespace = ?
                    AND ui_component.ui_name = ?
                    AND ui_deployment.ui_deployment = ?
                    AND ui_component.deleted=0
                    AND ui_deployment.deleted=0`,
                [
                    namespace,
                    ui_name,
                    ui_deployment,
                ]
    )

    for (const comp_result of comp_results) {

        let comp_context = {
            namespace: comp_result.namespace,
            ui_name: comp_result.ui_name,
            ui_deployment: comp_result.ui_deployment,
            ui_component_name: comp_result.ui_component_name,
            ui_component_type: comp_result.ui_component_type,
        }

        // add index.js if directory; add .js if no suffix

        let js_route_path = (ELEM_PREFIX + comp_result.ui_component_name).replace(/\/+/g, '/')
        if (js_route_path.endsWith('.js') || js_route_path.endsWith('.jsx')) {

            // JAVASCRIPT types, ensure route has .js suffix
            router.get(js_route_path, async (req, res) => {
                req.context = {...comp_context, ...req.context}
                await handle_component(req, res)
            })

        } else {

            let new_js_route_path = js_route_path
            if (js_route_path.endsWith('/')) {
                // route path without '/' will add '/'
                router.get(js_route_path.substring(0, js_route_path.Length - 1), (req, res) => {
                    res.status(302).redirect(redirect_url)
                })
                // route path add 'index.js' and 'index.source'
                new_js_route_path = js_route_path + 'index.js'
                router.get(new_js_route_path, async (req, res) => {
                    req.context = {...comp_context, ...req.context}
                    // req.context = Object.assign({}, {ui_component: comp_context}, req.context)
                    await handle_component(req, res)
                })
                source_js_route_path = js_route_path + 'index.source'
                router.get(source_js_route_path, async (req, res) => {
                    req.context = {...comp_context, ...req.context}
                    // req.context = Object.assign({}, {ui_component: comp_context}, req.context)
                    await handle_component(req, res)
                })
                // generate render page if ui_component_type === 'react/component'
                if (comp_context.ui_component_type === 'react/component') {
                    render_js_route_path = js_route_path + 'index.html'
                    router.get(render_js_route_path, async (req, res) => {
                        req.context = {...comp_context, ...req.context, req_type: 'ui_component'}
                        // req.context = Object.assign({}, {ui_component: comp_context}, req.context)
                        const result = await handle_render(req, res, load_from_db=true)
                        res.status(result.status)
                            .type(result.type)
                            .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
                    })
                }
            } else {
                // route path without '.js' will add '.js' and '.source'
                new_js_route_path = js_route_path + '.js'
                router.get(new_js_route_path, async (req, res) => {
                    req.context = {...comp_context, ...req.context}
                    // req.context = Object.assign({}, {ui_component: comp_context}, req.context)
                    await handle_component(req, res)
                })
                source_js_route_path = js_route_path + '.source'
                router.get(source_js_route_path, async (req, res) => {
                    req.context = {...comp_context, ...req.context}
                    // req.context = Object.assign({}, {ui_component: comp_context}, req.context)
                    await handle_component(req, res)
                })
                // generate render page if ui_component_type === 'react/component'
                if (comp_context.ui_component_type === 'react/component') {
                    render_js_route_path = js_route_path + '.html'
                    router.get(render_js_route_path, async (req, res) => {
                        req.context = {...comp_context, ...req.context, req_type: 'ui_component'}
                        // req.context = Object.assign({}, {ui_component: comp_context}, req.context)
                        const result = await handle_render(req, res, load_from_db=true)
                        res.status(result.status)
                            .type(result.type)
                            .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
                    })
                }
            }

            // redirect to new js path
            router.get(js_route_path, (req, res) => {
                let redirect_url = (req.baseUrl + new_js_route_path).replace(/\/+/g, '/')
                res.status(302).redirect(redirect_url)
            })
        }

        log_comp_status(comp_context,
            SUCCESS,
            `INFO: element published successfully [${JSON.stringify(comp_context)}] !`)
    }

    // preview route
    router.post('/', async (req, res) => {
        // post to '/' will handle preview
        await handle_preview(req, res)
    })

    // default route
    router.use('/', async (req, res) => {

        // console.log(`default route [${req.url}]`)
        if (req.url.startsWith(ELEM_PREFIX) || req.url.startsWith(ROUTE_PREFIX)) {
            // return 404 if under ELEM_PREFIX
            res.status(404).json({status: FAILURE, message: `ERROR: UI route or element not found [${req.url}] !`})

        } else {

            // check ui_deployment
            let ui_deployment = await get_ui_deployment(req, res)
            if (req.fatal) {
                return
            }

            req.context = {
              ...req.context,
              ...ui_deployment,
              // ...ui_route,
              // ui_component_name: '/index'
            }

            // handle root element '/'
            const result = await handle_html(req, res)
            res.status(result.status)
                .type(result.type)
                .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
            return
        }
    })

    return router
}

//export this router to use in our index.js
module.exports = {
    load_ui_router: load_ui_router
}
