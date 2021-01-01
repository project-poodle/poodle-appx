const fs = require('fs')
const path = require('path')
const objPath = require("object-path")
const db = require('../db/db')
const cache = require('../cache/cache')
const { SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')

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
 * get_ui_component
 */
function get_ui_component(req, res) {

    let context = req.context

    let cache_ui_component = cache.get_cache_for('ui_component')
    //console.log(JSON.stringify(cache_ui_component, null, 4))

    let elem_prop = [
        context.namespace,
        "ui_deployments",
        context.ui_name,
        context.ui_deployment,
        "ui_components",
        context.ui_component_name
    ]
    let elem = objPath.get(cache_ui_component, elem_prop)
    if (!elem) {
        let msg = `ERROR: element not found [${context.ui_component_name}] - [${JSON.stringify(context)}] !`
        log_elem_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        req.fatal = true
        return
    }

    let element_spec = objPath.get(elem, ["ui_component_spec"])
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

    let context = req.context

    let cache_ui_route = cache.get_cache_for('ui_route')
    //console.log(JSON.stringify(cache_ui_component, null, 4))

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
    db.query_sync(`INSERT INTO ui_component_status
                    (
                        namespace,
                        ui_name,
                        ui_deployment,
                        ui_component_name,
                        ui_component_status
                    )
                    VALUES
                    (
                        ?, ?, ?, ?,
                        JSON_OBJECT('status', ?, 'message', ?)
                    )
                    ON DUPLICATE KEY UPDATE
                        ui_component_status=VALUES(ui_component_status)`,
                    [
                        elem_context.namespace,
                        elem_context.ui_name,
                        elem_context.ui_deployment,
                        elem_context.ui_component_name,
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

// walk folder recursivelly
const walk_recursive = function(dir, done) {
  var results = []
  fs.readdir(dir, function(err, list) {
    if (err) return done(err)
    var pending = list.length
    if (!pending) return done(null, results)
    list.forEach(function(file) {
      file = path.resolve(dir, file)
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk_recursive(file, function(err, res) {
            results = results.concat(res)
            if (!--pending) done(null, results)
          })
        } else {
          results.push(file)
          if (!--pending) done(null, results)
        }
      })
    })
  })
}


module.exports = {
  get_ui_deployment: get_ui_deployment,
  get_ui_component: get_ui_component,
  get_ui_route: get_ui_route,
  log_elem_status: log_elem_status,
  log_route_status: log_route_status,
  log_deployment_status: log_deployment_status,
  walk_recursive: walk_recursive,
}
