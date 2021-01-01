const objPath = require("object-path")
const express = require('express')
const db = require('../db/db')
const cache = require('../cache/cache')
const { SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const {
  get_ui_deployment,
  get_ui_component,
  get_ui_route,
  log_elem_status,
  log_route_status,
  log_deployment_status,
} = require ('./util_lookup')
const { handle_html } = require('./html')
const { handle_react_component } = require('./react_component')
const { handle_react_provider } = require('./react_provider')
const { handle_appx_route } = require('./appx_route')
const { handle_render } = require('./render')
const { handle_preview } = require('./preview')

const ELEM_PREFIX = "/_elem/"
const ROUTE_PREFIX = "/_route/"

const EXCLUDED_TYPES = [
  "html",
]

/**
 * handle_elment
 */
function handle_element(req, res) {

    // check ui_deployment
    let ui_deployment = get_ui_deployment(req, res)
    if (req.fatal) {
        return
    }

    // check ui_component
    let ui_component = get_ui_component(req, res)
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

    // handle request by element type
    if (ui_component.ui_component_type == 'html'
        || ui_component.ui_component_type.startsWith('html/')) {

        const result = handle_html(req, res)
        res.status(result.status)
            .type(result.type)
            .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
        return

    } else if (ui_component.ui_component_type == 'react/component') {

        const result = handle_react_component(req, res)
        res.status(result.status)
            .type(result.type)
            .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
        return

    } else if (ui_component.ui_component_type == 'react/provider') {

        const result = handle_react_provider(req, res)
        res.status(result.status)
            .type(result.type)
            .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
        return

    } else {

        let msg = `ERROR: unsupported ui element type [${ui_component.ui_component_type}] - [${JSON.stringify(ui_component)}]`
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        return
    }
}

/**
 * handle_ruote
 */
function handle_route(req, res) {

    // check ui_deployment
    let ui_deployment = get_ui_deployment(req, res)
    if (req.fatal) {
        return
    }

    // check ui_route
    let ui_route = get_ui_route(req, res)
    if (req.fatal) {
        return
    }

    req.context = {
      ...req.context,
      ...ui_deployment,
      ...ui_route,
      ui_component_name: '/index'
    }

    // handle root element '/index'
    handle_element(req, res)
    return
}

/**
 * handle route as element
 */
function handle_route_element(req, res) {

  // check ui_deployment
  let ui_deployment = get_ui_deployment(req, res)
  if (req.fatal) {
      return
  }

  // check ui_route
  let ui_route = get_ui_route(req, res)
  if (req.fatal) {
      return
  }

  // update context
  req.context = {
      ...req.context,
      ...ui_deployment,
      ...ui_route,
  }
  //console.log(req.context)

  const result = handle_appx_route(req, res)
  res.status(result.status)
      .type(result.type)
      .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
  return
}

/**
 * load_ui_router
 */
function load_ui_router(namespace, ui_name, ui_deployment) {

    // query ui_route
    let route_results = db.query_sync(`SELECT
                    ui_route.namespace,
                    ui_route.ui_name,
                    ui_route.ui_ver,
                    ui_deployment.ui_deployment,
                    ui_deployment.ui_deployment_spec,
                    ui_route.ui_route_name,
                    ui_route.ui_route_spec,
                    ui_route.create_time,
                    ui_route.update_time
                FROM ui_route
                JOIN ui_deployment
                    ON ui_route.namespace = ui_deployment.namespace
                    AND ui_route.ui_name = ui_deployment.ui_name
                    AND ui_route.ui_ver = ui_deployment.ui_ver
                WHERE
                    ui_route.namespace = ?
                    AND ui_route.ui_name = ?
                    AND ui_deployment.ui_deployment = ?
                    AND ui_route.deleted=0
                    AND ui_deployment.deleted=0`,
                [
                    namespace,
                    ui_name,
                    ui_deployment,
                ]
    )

    let router = express.Router()

    route_results.forEach((route_result) => {

        let route_context = {
            namespace: route_result.namespace,
            ui_name: route_result.ui_name,
            ui_deployment: route_result.ui_deployment,
            ui_route_name: route_result.ui_route_name,
        }

        const route_path = route_result.ui_route_name.replace(/\/+/g, '/')
        router.get(route_path, (req, res) => {

            req.context = {...route_context, ...req.context}
            // req.context = Object.assign({}, {ui_route: route_context}, req.context)
            handle_route(req, res)
        })

        const prefix_route_path = (ROUTE_PREFIX + route_path).replace(/\*/g, '/').replace(/\/+/g, '/')
        if (prefix_route_path.endsWith('/') || prefix_route_path.endsWith('*')) {
            // route path add 'index.js' and 'index.source'
            const new_route_path = prefix_route_path.slice(0,-1) + '/index.js'
            router.get(new_route_path, (req, res) => {
                req.context = {...route_context, ...req.context}
                // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                handle_route_element(req, res)
            })
            const source_route_path = prefix_route_path.slice(0,-1) + '/index.source'
            router.get(source_route_path, (req, res) => {
                req.context = {...route_context, ...req.context}
                // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                handle_route_element(req, res)
            })
            const render_route_path = prefix_route_path.slice(0,-1) + '/index.html'
            router.get(render_route_path, (req, res) => {
                req.context = {...route_context, ...req.context, req_type: 'ui_route'}
                // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                const result = handle_render(req, res, load_from_db=true)
                res.status(result.status)
                    .type(result.type)
                    .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
            })
        } else {
            // route path without '.js' will add '.js' and '.source'
            const new_route_path = prefix_route_path + '.js'
            router.get(new_route_path, (req, res) => {
                req.context = {...route_context, ...req.context}
                // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                handle_route_element(req, res)
            })
            const source_route_path = prefix_route_path + '.source'
            router.get(source_route_path, (req, res) => {
                req.context = {...route_context, ...req.context}
                // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                handle_route_element(req, res)
            })
            const render_route_path = prefix_route_path + '.html'
            router.get(render_route_path, (req, res) => {
                req.context = {...route_context, ...req.context, req_type: 'ui_route'}
                // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                const result = handle_render(req, res, load_from_db=true)
                res.status(result.status)
                    .type(result.type)
                    .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
            })
        }

        log_route_status(route_context,
            SUCCESS,
            `INFO: route published successfully [${JSON.stringify(route_context)}] !`)
    })

    // query ui_component
    let elem_results = db.query_sync(`SELECT
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

    elem_results.forEach((elem_result) => {

        let elem_context = {
            namespace: elem_result.namespace,
            ui_name: elem_result.ui_name,
            ui_deployment: elem_result.ui_deployment,
            ui_component_name: elem_result.ui_component_name,
            ui_component_type: elem_result.ui_component_type,
        }

        // console.log(elem_context)
        if (EXCLUDED_TYPES.includes(elem_result.ui_component_type)
            || EXCLUDED_TYPES.find(row => elem_result.ui_component_type.startsWith(row + '/'))) {

            // not JAVASCRIPT types - handles normally
            const route_path = (ELEM_PREFIX + elem_result.ui_component_name).replace(/\/+/g, '/')
            router.get(route_path, (req, res) => {
                req.context = {...elem_context, ...req.context}
                handle_element(req, res)
            })

        } else {
            // add index.js if directory; add .js if no suffix

            let js_route_path = (ELEM_PREFIX + elem_result.ui_component_name).replace(/\/+/g, '/')
            if (js_route_path.endsWith('.js') || js_route_path.endsWith('.jsx')) {

                // JAVASCRIPT types, ensure route has .js suffix
                router.get(js_route_path, (req, res) => {
                    req.context = {...elem_context, ...req.context}
                    handle_element(req, res)
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
                    router.get(new_js_route_path, (req, res) => {
                        req.context = {...elem_context, ...req.context}
                        // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                        handle_element(req, res)
                    })
                    source_js_route_path = js_route_path + 'index.source'
                    router.get(source_js_route_path, (req, res) => {
                        req.context = {...elem_context, ...req.context}
                        // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                        handle_element(req, res)
                    })
                    // generate render page if ui_component_type === 'react/component'
                    if (elem_context.ui_component_type === 'react/component') {
                        render_js_route_path = js_route_path + 'index.html'
                        router.get(render_js_route_path, (req, res) => {
                            req.context = {...elem_context, ...req.context, req_type: 'ui_component'}
                            // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                            const result = handle_render(req, res, load_from_db=true)
                            res.status(result.status)
                                .type(result.type)
                                .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
                        })
                    }
                } else {
                    // route path without '.js' will add '.js' and '.source'
                    new_js_route_path = js_route_path + '.js'
                    router.get(new_js_route_path, (req, res) => {
                        req.context = {...elem_context, ...req.context}
                        // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                        handle_element(req, res)
                    })
                    source_js_route_path = js_route_path + '.source'
                    router.get(source_js_route_path, (req, res) => {
                        req.context = {...elem_context, ...req.context}
                        // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                        handle_element(req, res)
                    })
                    // generate render page if ui_component_type === 'react/component'
                    if (elem_context.ui_component_type === 'react/component') {
                        render_js_route_path = js_route_path + '.html'
                        router.get(render_js_route_path, (req, res) => {
                            req.context = {...elem_context, ...req.context, req_type: 'ui_component'}
                            // req.context = Object.assign({}, {ui_component: elem_context}, req.context)
                            const result = handle_render(req, res, load_from_db=true)
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
        }

        log_elem_status(elem_context,
            SUCCESS,
            `INFO: element published successfully [${JSON.stringify(elem_context)}] !`)
    })

    // preview route
    router.post('/', (req, res) => {
        // post to '/' will handle preview
        handle_preview(req, res)
    })

    // default route
    router.use('/', (req, res) => {

        // console.log(`default route [${req.url}]`)
        if (req.url.startsWith(ELEM_PREFIX) || req.url.startsWith(ROUTE_PREFIX)) {
            // return 404 if under ELEM_PREFIX
            res.status(404).json({status: FAILURE, message: `ERROR: UI route or element not found [${req.url}] !`})

        } else {

            // treat as '/' element for all other paths
            req.context = {
                ...req.context,
                ui_component_name: '/index',
            }

            // handle root element '/'
            handle_element(req, res)
        }
    })

    return router
}

//export this router to use in our index.js
module.exports = {
    load_ui_router: load_ui_router
}
