const objPath = require("object-path")
const express = require('express')
const db = require('../db/db')
const cache = require('../cache/cache')
const { REGEX_VAR, SUCCESS, FAILURE }  = require('../api/util')
const { handle_html } = require('./html')

/**
 * get_element_spec
 */
function get_ui_element(context, req, res) {

    //let cache_ui_deployment = cache.get_cache_for('ui_deployment')
    //console.log(JSON.stringify(cache_ui_deployment, null, 4))

    let cache_ui_element = cache.get_cache_for('ui_element')
    //console.log(JSON.stringify(cache_ui_element, null, 4))

    //console.log(context)

    let elem_prop = [
        "ui_element",
        context.namespace,
        "ui_apps",
        context.app_name,
        context.ui_app_ver,
        "ui_deployments",
        context.runtime_name,
        context.element_name
    ]
    let elem = objPath.get(cache_ui_element, elem_prop)
    if (!elem) {
        let msg = `ERROR: element not found [${context.element_name}] - [${JSON.stringify(context)}] !`
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        req.fatal = true
        return
    }

    let element_spec = objPath.get(elem, ["element_spec"])
    if (!element_spec) {
        let msg = `ERROR: element_spec not found - [${JSON.stringify(context)}] !`
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        req.fatal = true
        return null
    }

    return elem
}

/**
 * handle_req
 */
function handle_req(req, res) {

    // check ui_element
    let ui_element = get_ui_element(req.context, req, res)
    if (req.fatal) {
        return
    }

    req.context = Object.assign({}, req.context, { ui_element: ui_element })
    //console.log(req.context)

    // handle request by verb
    switch(ui_element.element_type) {
        case "html":
            handle_html(req.context, req, res)
            return

        case "js":
            handle_js(req.context, req, res)
            return

        default:
            let msg = `ERROR: unsupported ui element type [${ui_element.element_type}] - [${JSON.stringify(ui_element)}]`
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            return
    }
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
                        element_name,
                        element_status
                    )
                    VALUES
                    (
                        ?, ?, ?, ?, ?,
                        JSON_OBJECT('status', ?, 'message', ?)
                    )
                    ON DUPLICATE KEY UPDATE
                        element_status=VALUES(element_status)`,
                    [
                        elem_context.namespace,
                        elem_context.app_name,
                        elem_context.ui_app_ver,
                        elem_context.runtime_name,
                        elem_context.element_name,
                        status,
                        message
                    ])
}

/**
 * load_ui_router
 */
function load_ui_router(namespace, app_name, runtime_name, ui_app_ver) {

    let elem_results = db.query_sync(`SELECT
                    ui_element.namespace,
                    ui_element.app_name,
                    ui_element.ui_app_ver,
                    ui_deployment.runtime_name,
                    ui_deployment.ui_deployment_spec,
                    ui_element.element_name,
                    ui_element.element_type,
                    ui_element.element_spec,
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

    let router = express.Router()

    elem_results.forEach((elem_result) => {

        let elem_context = {
            namespace: elem_result.namespace,
            app_name: elem_result.app_name,
            runtime_name: elem_result.runtime_name,
            ui_app_ver: elem_result.ui_app_ver,
            element_name: elem_result.element_name,
            element_type: elem_result.element_type
        }

        router.get(elem_result.element_name, (req, res) => {

            req.context = Object.assign({}, elem_context, req.context)
            handle_req(req, res)
        })

        log_elem_status(elem_context,
            SUCCESS,
            `INFO: published successfully [${JSON.stringify(elem_context)}] !`)
    })

    router.use('/', (req, res) => {
        res.status(404).json({status: FAILURE, message: `ERROR: UI element for [${req.url}] not found !`})
    })

    return router
}

//export this router to use in our index.js
module.exports = {
    load_ui_router: load_ui_router
}
