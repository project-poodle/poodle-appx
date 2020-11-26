const objPath = require("object-path")
const express = require('express')
const db = require('../db/db')
const cache = require('../cache/cache')
const { REGEX_VAR, SUCCESS, FAILURE }  = require('../api/util')
const { handle_html } = require('./html')
const { handle_react } = require('./react')

const ELEM_ROUTE_PREFIX = "/_elem/"

const JAVASCRIPT_TYPES = [
  "react",
  "js"
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
        "ui_apps",
        context.app_name,
        context.ui_app_ver,
        "ui_deployments",
        context.runtime_name
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

    let ui_app_spec = objPath.get(ui_deployment, ["ui_app_spec"])
    if (!ui_app_spec) {
        let msg = `ERROR: ui_app_spec not found - [${JSON.stringify(context)}] !`
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
        "ui_apps",
        context.app_name,
        context.ui_app_ver,
        "ui_deployments",
        context.runtime_name,
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
        "ui_apps",
        context.app_name,
        context.ui_app_ver,
        "ui_deployments",
        context.runtime_name,
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
    switch(ui_element.ui_element_type) {
        case "html":
            handle_html(req, res)
            return

        case "react":
            handle_react(req, res)
            return

        default:
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
                app_name: ui_route.app_name,
                runtime_name: ui_route.runtime_name,
                ui_app_ver: ui_route.ui_app_ver,
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

    db.query_sync(`INSERT INTO ui_deployment_status
                    (
                        namespace,
                        app_name,
                        ui_app_ver,
                        runtime_name,
                        ui_deployment_status
                    )
                    VALUES
                    (
                        ?, ?, ?, ?,
                        JSON_OBJECT('status', ?, 'message', ?)
                    )
                    ON DUPLICATE KEY UPDATE
                        ui_deployment_status=VALUES(ui_deployment_status)`,
                    [
                        deployment_context.namespace,
                        deployment_context.app_name,
                        deployment_context.ui_app_ver,
                        deployment_context.runtime_name,
                        status,
                        message
                    ])
}

/**
 * log_elem_status
 */
const log_elem_status = (elem_context, status, message) => {

    db.query_sync(`INSERT INTO ui_element_status
                    (
                        namespace,
                        app_name,
                        ui_app_ver,
                        runtime_name,
                        ui_element_name,
                        ui_element_status
                    )
                    VALUES
                    (
                        ?, ?, ?, ?, ?,
                        JSON_OBJECT('status', ?, 'message', ?)
                    )
                    ON DUPLICATE KEY UPDATE
                        ui_element_status=VALUES(ui_element_status)`,
                    [
                        elem_context.namespace,
                        elem_context.app_name,
                        elem_context.ui_app_ver,
                        elem_context.runtime_name,
                        elem_context.ui_element_name,
                        status,
                        message
                    ])
}

/**
 * log_route_status
 */
const log_route_status = (route_context, status, message) => {

    db.query_sync(`INSERT INTO ui_route_status
                    (
                        namespace,
                        app_name,
                        ui_app_ver,
                        runtime_name,
                        ui_route_name,
                        ui_route_status
                    )
                    VALUES
                    (
                        ?, ?, ?, ?, ?,
                        JSON_OBJECT('status', ?, 'message', ?)
                    )
                    ON DUPLICATE KEY UPDATE
                        ui_route_status=VALUES(ui_route_status)`,
                    [
                        route_context.namespace,
                        route_context.app_name,
                        route_context.ui_app_ver,
                        route_context.runtime_name,
                        route_context.ui_route_name,
                        status,
                        message
                    ])
}

/**
 * load_ui_router
 */
function load_ui_router(namespace, app_name, runtime_name, ui_app_ver) {

    // query ui_route
    let route_results = db.query_sync(`SELECT
                    ui_route.namespace,
                    ui_route.app_name,
                    ui_route.ui_app_ver,
                    ui_deployment.runtime_name,
                    ui_deployment.ui_deployment_spec,
                    ui_route.ui_route_name,
                    ui_route.ui_route_spec,
                    ui_route.create_time,
                    ui_route.update_time
                FROM ui_route
                JOIN ui_deployment
                    ON ui_route.namespace = ui_deployment.namespace
                    AND ui_route.app_name = ui_deployment.app_name
                    AND ui_route.ui_app_ver = ui_deployment.ui_app_ver
                WHERE
                    ui_route.namespace = '${namespace}'
                    AND ui_deployment.runtime_name = '${runtime_name}'
                    AND ui_route.app_name = '${app_name}'
                    AND ui_route.ui_app_ver = '${ui_app_ver}'
                    AND ui_route.deleted=0
                    AND ui_deployment.deleted=0`)

    let router = express.Router()

    route_results.forEach((route_result) => {

        let route_context = {
            namespace: route_result.namespace,
            app_name: route_result.app_name,
            runtime_name: route_result.runtime_name,
            ui_app_ver: route_result.ui_app_ver,
            ui_route_name: route_result.ui_route_name
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
                    ui_element.app_name,
                    ui_element.ui_app_ver,
                    ui_deployment.runtime_name,
                    ui_deployment.ui_deployment_spec,
                    ui_element.ui_element_name,
                    ui_element.ui_element_type,
                    ui_element.ui_element_spec,
                    ui_element.create_time,
                    ui_element.update_time
                FROM ui_element
                JOIN ui_deployment
                    ON ui_element.namespace = ui_deployment.namespace
                    AND ui_element.app_name = ui_deployment.app_name
                    AND ui_element.ui_app_ver = ui_deployment.ui_app_ver
                WHERE
                    ui_element.namespace = '${namespace}'
                    AND ui_deployment.runtime_name = '${runtime_name}'
                    AND ui_element.app_name = '${app_name}'
                    AND ui_element.ui_app_ver = '${ui_app_ver}'
                    AND ui_element.deleted=0
                    AND ui_deployment.deleted=0`)

    elem_results.forEach((elem_result) => {

        let elem_context = {
            namespace: elem_result.namespace,
            app_name: elem_result.app_name,
            runtime_name: elem_result.runtime_name,
            ui_app_ver: elem_result.ui_app_ver,
            ui_element_name: elem_result.ui_element_name
        }

        //console.log(route_path)

        // add index.js if directory; add .js if no suffix
        if (JAVASCRIPT_TYPES.includes(elem_result.ui_element_type)) {

            // JAVASCRIPT types, ensure route has .js suffix
            let js_route_path = (ELEM_ROUTE_PREFIX + elem_result.ui_element_name).replace(/\/+/g, '/')
            if (js_route_path.endsWith('.js') || js_route_path.endsWith('.jsx')) {

                router.get(js_route_path, (req, res) => {
                    req.context = Object.assign({}, {ui_element: elem_context}, req.context)
                    handle_element(req, res)
                })

            } else {

                let new_js_route_path = js_route_path
                if (js_route_path.endsWith('/') && js_route_path != '/') {
                    // route path without '/' will add '/'
                    let redirect_url = (req.baseUrl + js_route_path).replace(/\/+/g, '/')
                    router.get(js_route_path.substring(0, js_route_path.Length - 1), (req, res) => {
                        res.status(301).redirect(redirect_url).json({
                            status: SUCCESS,
                            message: `INFO: redirect to [${redirect_url}]`
                        })
                    })
                    new_js_route_path = js_route_path + 'index.js'
                    router.get(new_js_route_path, (req, res) => {
                        req.context = Object.assign({}, {ui_element: elem_context}, req.context)
                        handle_element(req, res)
                    })
                } else {
                    new_js_route_path = js_route_path + '.js'
                    router.get(new_js_route_path, (req, res) => {
                        req.context = Object.assign({}, {ui_element: elem_context}, req.context)
                        handle_element(req, res)
                    })
                }

                // console.log(elem_result)
                // redirect to new js path
                router.get(js_route_path, (req, res) => {
                    let redirect_url = (req.baseUrl + new_js_route_path).replace(/\/+/g, '/')
                    res.status(301).redirect(redirect_url).json({
                        status: SUCCESS,
                        message: `INFO: redirect to [${redirect_url}]`
                    })
                })
            }

        } else {

            // none JAVASCRIPT types - handles normally
            const route_path = (ELEM_ROUTE_PREFIX + elem_result.ui_element_name).replace(/\/+/g, '/')
            router.get(route_path, (req, res) => {
                req.context = Object.assign({}, {ui_element: elem_context}, req.context)
                handle_element(req, res)
            })
        }

        log_elem_status(elem_context,
            SUCCESS,
            `INFO: element published successfully [${JSON.stringify(elem_context)}] !`)
    })

    router.use('/', (req, res) => {
        res.status(404).json({status: FAILURE, message: `ERROR: UI route or element not found [${req.url}] !`})
    })

    return router
}

//export this router to use in our index.js
module.exports = {
    load_ui_router: load_ui_router
}
