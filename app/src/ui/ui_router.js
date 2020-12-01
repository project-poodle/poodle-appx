const objPath = require("object-path")
const express = require('express')
const db = require('../db/db')
const cache = require('../cache/cache')
const { REGEX_VAR, SUCCESS, FAILURE }  = require('../api/util')
const { handle_html } = require('./html')
const { handle_react } = require('./react')

const ELEM_ROUTE_PREFIX = "/_elem/"

const EXCLUDED_TYPES = [
  "html",
]

/**
 * get_ui_deployment
 */
function get_ui_deployment(req, res) {

    let context = req.context

    let cache_ui_deployment = cache.get_cache_for('ui_deployment')
    //console.log(JSON.stringify(cache_ui_deployment, null, 4))

    let dp_prop = [
        context.namespace,
        "ui_deployments",
        context.ui_name,
        context.ui_deployment
    ]
    let ui_deployment = objPath.get(cache_ui_deployment, dp_prop)
    if (!ui_deployment) {
        let msg = `ERROR: ui_deployment not found - [${JSON.stringify(context)}] !`
        log_deployment_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        req.fatal = true
        return
    }

    let ui_deployment_spec = objPath.get(ui_deployment, ["ui_deployment_spec"])
    if (!ui_deployment_spec) {
        let msg = `ERROR: ui_deployment_spec not found - [${JSON.stringify(context)}] !`
        log_deployment_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        req.fatal = true
        return null
    }

    let ui_spec = objPath.get(ui_deployment, ["ui_spec"])
    if (!ui_spec) {
        let msg = `ERROR: ui_spec not found - [${JSON.stringify(context)}] !`
        log_elem_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        req.fatal = true
        return null
    }

    return ui_deployment
}

/**
 * get_ui_element
 */
function get_ui_element(req, res) {

    let context = req.context.ui_element

    let cache_ui_element = cache.get_cache_for('ui_element')
    //console.log(JSON.stringify(cache_ui_element, null, 4))

    let elem_prop = [
        context.namespace,
        "ui_deployments",
        context.ui_name,
        context.ui_deployment,
        "ui_elements",
        context.ui_element_name
    ]
    let elem = objPath.get(cache_ui_element, elem_prop)
    if (!elem) {
        let msg = `ERROR: element not found [${context.ui_element_name}] - [${JSON.stringify(context)}] !`
        log_elem_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        req.fatal = true
        return
    }

    let element_spec = objPath.get(elem, ["ui_element_spec"])
    if (!element_spec) {
        let msg = `ERROR: element_spec not found - [${JSON.stringify(context)}] !`
        log_elem_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        req.fatal = true
        return null
    }

    return elem
}

/**
 * get_ui_route
 */
function get_ui_route(req, res) {

    let context = req.context.ui_route

    let cache_ui_route = cache.get_cache_for('ui_route')
    //console.log(JSON.stringify(cache_ui_element, null, 4))

    let route_prop = [
        context.namespace,
        "ui_deployments",
        context.ui_name,
        context.ui_deployment,
        "ui_routes",
        context.ui_route_name
    ]
    let route = objPath.get(cache_ui_route, route_prop)
    if (!route) {
        let msg = `ERROR: route not found [${context.ui_route_name}] - [${JSON.stringify(context)}] !`
        log_route_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        req.fatal = true
        return
    }

    let route_spec = objPath.get(route, ["ui_route_spec"])
    if (!route_spec) {
        let msg = `ERROR: route_spec not found - [${JSON.stringify(context)}] !`
        log_route_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        req.fatal = true
        return null
    }

    return route
}

/**
 * handle_elment
 */
function handle_element(req, res) {

    // check ui_deployment
    let ui_deployment = get_ui_deployment(req, res)
    if (req.fatal) {
        return
    }

    // check ui_element
    let ui_element = get_ui_element(req, res)
    if (req.fatal) {
        return
    }

    req.context = Object.assign(
        {},
        req.context,
        {
            ui_deployment: ui_deployment,
            ui_element: ui_element
        }
    )
    //console.log(req.context)

    // handle request by element type
    if (ui_element.ui_element_type == 'html'
        || ui_element.ui_element_type.startsWith('html/')) {

        handle_html(req, res)
        return

    } else if (ui_element.ui_element_type == 'react' || ui_element.ui_element_type.startsWith('react/')) {

        handle_react(req, res)
        return

    } else if (ui_element.ui_element_type == 'js' || ui_element.ui_element_type.startsWith('js/')) {

        handle_js(req, res)
        return

    } else {

        let msg = `ERROR: unsupported ui element type [${ui_element.ui_element_type}] - [${JSON.stringify(ui_element)}]`
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        return
    }
}

/**
 * handle_ruote
 */
function handle_route(req, res) {

    // check ui_route
    let ui_route = get_ui_route(req, res)
    if (req.fatal) {
        return
    }

    req.context = Object.assign({},
        req.context,
        {
            ui_route: ui_route
        },
        {
            ui_element: {
                namespace: ui_route.namespace,
                ui_name: ui_route.ui_name,
                ui_deployment: ui_route.ui_deployment,
                ui_element_name: '/'
            }
        }
    )

    // handle root element '/'
    handle_element(req, res)
    return
}

/**
 * log_deployment_status
 */
const log_deployment_status = (deployment_context, status, message) => {

    // console.log(message)
    db.query_sync(`INSERT INTO ui_deployment_status
                    (
                        namespace,
                        ui_name,
                        ui_deployment,
                        ui_deployment_status
                    )
                    VALUES
                    (
                        ?, ?, ?,
                        JSON_OBJECT('status', ?, 'message', ?)
                    )
                    ON DUPLICATE KEY UPDATE
                        ui_deployment_status=VALUES(ui_deployment_status)`,
                    [
                        deployment_context.namespace,
                        deployment_context.ui_name,
                        deployment_context.ui_deployment,
                        status,
                        message
                    ])
}

/**
 * log_elem_status
 */
const log_elem_status = (elem_context, status, message) => {

    // console.log(message)
    db.query_sync(`INSERT INTO ui_element_status
                    (
                        namespace,
                        ui_name,
                        ui_deployment,
                        ui_element_name,
                        ui_element_status
                    )
                    VALUES
                    (
                        ?, ?, ?, ?,
                        JSON_OBJECT('status', ?, 'message', ?)
                    )
                    ON DUPLICATE KEY UPDATE
                        ui_element_status=VALUES(ui_element_status)`,
                    [
                        elem_context.namespace,
                        elem_context.ui_name,
                        elem_context.ui_deployment,
                        elem_context.ui_element_name,
                        status,
                        message
                    ])
}

/**
 * log_route_status
 */
const log_route_status = (route_context, status, message) => {

    // console.log(message)
    db.query_sync(`INSERT INTO ui_route_status
                    (
                        namespace,
                        ui_name,
                        ui_deployment,
                        ui_route_name,
                        ui_route_status
                    )
                    VALUES
                    (
                        ?, ?, ?, ?,
                        JSON_OBJECT('status', ?, 'message', ?)
                    )
                    ON DUPLICATE KEY UPDATE
                        ui_route_status=VALUES(ui_route_status)`,
                    [
                        route_context.namespace,
                        route_context.ui_name,
                        route_context.ui_deployment,
                        route_context.ui_route_name,
                        status,
                        message
                    ])
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

        router.get(route_result.ui_route_name.replace(/\/+/g, '/'), (req, res) => {

            req.context = Object.assign({}, {ui_route: route_context}, req.context)
            handle_route(req, res)
        })

        log_route_status(route_context,
            SUCCESS,
            `INFO: route published successfully [${JSON.stringify(route_context)}] !`)
    })

    // query ui_element
    let elem_results = db.query_sync(`SELECT
                    ui_element.namespace,
                    ui_element.ui_name,
                    ui_element.ui_ver,
                    ui_deployment.ui_deployment,
                    ui_deployment.ui_deployment_spec,
                    ui_element.ui_element_name,
                    ui_element.ui_element_type,
                    ui_element.ui_element_spec,
                    ui_element.create_time,
                    ui_element.update_time
                FROM ui_element
                JOIN ui_deployment
                    ON ui_element.namespace = ui_deployment.namespace
                    AND ui_element.ui_name = ui_deployment.ui_name
                    AND ui_element.ui_ver = ui_deployment.ui_ver
                WHERE
                    ui_element.namespace = ?
                    AND ui_element.ui_name = ?
                    AND ui_deployment.ui_deployment = ?
                    AND ui_element.deleted=0
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
            ui_element_name: elem_result.ui_element_name,
        }

        // console.log(elem_context)
        if (EXCLUDED_TYPES.includes(elem_result.ui_element_type)
            || EXCLUDED_TYPES.find(row => elem_result.ui_element_type.startsWith(row + '/'))) {

            // not JAVASCRIPT types - handles normally
            const route_path = (ELEM_ROUTE_PREFIX + elem_result.ui_element_name).replace(/\/+/g, '/')
            router.get(route_path, (req, res) => {
                req.context = Object.assign({}, {ui_element: elem_context}, req.context)
                handle_element(req, res)
            })

        } else {
            // add index.js if directory; add .js if no suffix

            let js_route_path = (ELEM_ROUTE_PREFIX + elem_result.ui_element_name).replace(/\/+/g, '/')
            if (js_route_path.endsWith('.js') || js_route_path.endsWith('.jsx')) {

                // JAVASCRIPT types, ensure route has .js suffix
                router.get(js_route_path, (req, res) => {
                    req.context = Object.assign({}, {ui_element: elem_context}, req.context)
                    handle_element(req, res)
                })

            } else {

                let new_js_route_path = js_route_path
                if (js_route_path.endsWith('/')) {
                    // route path without '/' will add '/'
                    router.get(js_route_path.substring(0, js_route_path.Length - 1), (req, res) => {
                        res.status(301).redirect(redirect_url)
                    })
                    // route path add 'index.js' and 'index.source'
                    new_js_route_path = js_route_path + 'index.js'
                    router.get(new_js_route_path, (req, res) => {
                        req.context = Object.assign({}, {ui_element: elem_context}, req.context)
                        handle_element(req, res)
                    })
                    source_js_route_path = js_route_path + 'index.source'
                    router.get(source_js_route_path, (req, res) => {
                        req.context = Object.assign({}, {ui_element: elem_context}, req.context)
                        handle_element(req, res)
                    })
                } else {
                    // route path without '.js' will add '.js' and '.source'
                    new_js_route_path = js_route_path + '.js'
                    router.get(new_js_route_path, (req, res) => {
                        req.context = Object.assign({}, {ui_element: elem_context}, req.context)
                        handle_element(req, res)
                    })
                    source_js_route_path = js_route_path + '.source'
                    router.get(source_js_route_path, (req, res) => {
                        req.context = Object.assign({}, {ui_element: elem_context}, req.context)
                        handle_element(req, res)
                    })
                }

                // redirect to new js path
                router.get(js_route_path, (req, res) => {
                    let redirect_url = (req.baseUrl + new_js_route_path).replace(/\/+/g, '/')
                    res.status(301).redirect(redirect_url)
                })
            }
        }

        log_elem_status(elem_context,
            SUCCESS,
            `INFO: element published successfully [${JSON.stringify(elem_context)}] !`)
    })

    // default route
    router.use('/', (req, res) => {

        // console.log(`default route [${req.url}]`)
        if (req.url.startsWith(ELEM_ROUTE_PREFIX)) {
            // return 404 if under ELEM_ROUTE_PREFIX
            res.status(404).json({status: FAILURE, message: `ERROR: UI route or element not found [${req.url}] !`})

        } else {

            // treat as '/' element for all other paths
            req.context = Object.assign({},
                req.context,
                {
                    ui_element: {
                        namespace: namespace,
                        ui_name: ui_name,
                        ui_deployment: ui_deployment,
                        ui_element_name: '/'
                    }
                }
            )

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
