const fs = require('fs')
const path = require('path')
const objPath = require("object-path")
const db = require('../db/db')
const cache = require('../cache/cache')
const { SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')

const DEFAULT_BATCH_SIZE = 50

// sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
        log_comp_status(context, FAILURE, msg)
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

    let comp_prop = [
        context.namespace,
        "ui_deployments",
        context.ui_name,
        context.ui_deployment,
        "ui_components",
        context.ui_component_name
    ]
    let elem = objPath.get(cache_ui_component, comp_prop)
    if (!elem) {
        let msg = `ERROR: component not found [${context.ui_component_name}] - [${JSON.stringify(context)}] !`
        log_comp_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        req.fatal = true
        return
    }

    let component_spec = objPath.get(elem, ["ui_component_spec"])
    if (!component_spec) {
        let msg = `ERROR: component_spec not found - [${JSON.stringify(context)}] !`
        log_comp_status(context, FAILURE, msg)
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
const deployment_status_logs = []
const log_deployment_status = (deployment_context, status, message) => {
    // add to log
    deployment_status_logs.push({
      deployment_context: deployment_context,
      status: status,
      message: message
    })
}

// api status worker
async function deployment_status_worker() {

    const async_log_batch = async (batch) => {
        await db.query_async(
            `INSERT INTO ui_deployment_status
            (
                namespace,
                ui_name,
                ui_deployment,
                ui_deployment_status
            )
            VALUES ?
            ON DUPLICATE KEY UPDATE
                ui_deployment_status=VALUES(ui_deployment_status)`,
            [
                batch.map(data => [
                    data.deployment_context.namespace,
                    data.deployment_context.ui_name,
                    data.deployment_context.ui_deployment,
                    JSON.stringify({
                      status: data.status,
                      message: data.message
                    })
                ])
            ]
        )
    }

    while (true) {
        try {
            if (deployment_status_logs.length <= 0) {
                await sleep(100)
            } else {
                const batch_data = deployment_status_logs.splice(
                  0,
                  Math.min(deployment_status_logs.length, DEFAULT_BATCH_SIZE)
                )
                await async_log_batch(batch_data)
                // console.log(`INFO: flush deployment status log [${batch_data.length}]`)
            }
        } catch (err) {
            console.log(`ERROR: failed deployment_status_worker`, err)
        }
    }
}

deployment_status_worker()

/**
 * log_comp_status
 */
const comp_status_logs = []
const log_comp_status = (comp_context, status, message) => {
    // add to log
    comp_status_logs.push({
      comp_context: comp_context,
      status: status,
      message: message
    })
}

// elem status worker
async function comp_status_worker() {

    const async_log_batch = async (batch) => {
        await db.query_async(
            `INSERT INTO ui_component_status
            (
                namespace,
                ui_name,
                ui_deployment,
                ui_component_name,
                ui_component_status
            )
            VALUES ?
            ON DUPLICATE KEY UPDATE
                ui_component_status=VALUES(ui_component_status)`,
            [
                batch.map(data => [
                    data.comp_context.namespace,
                    data.comp_context.ui_name,
                    data.comp_context.ui_deployment,
                    data.comp_context.ui_component_name,
                    JSON.stringify({
                      status: data.status,
                      message: data.message
                    })
                ])
            ]
        )
    }

    while (true) {
        try {
            if (comp_status_logs.length <= 0) {
                await sleep(100)
            } else {
                const batch_data = comp_status_logs.splice(
                  0,
                  Math.min(comp_status_logs.length, DEFAULT_BATCH_SIZE)
                )
                await async_log_batch(batch_data)
                // console.log(`INFO: flush elem status log [${batch_data.length}]`)
            }
        } catch (err) {
            console.log(`ERROR: failed comp_status_worker`, err)
        }
    }
}

comp_status_worker()

/**
 * log_route_status
 */
const route_status_logs = []
const log_route_status = (route_context, status, message) => {
    // add to log
    route_status_logs.push({
      route_context: route_context,
      status: status,
      message: message
    })
}

// elem status worker
async function route_status_worker() {

    const async_log_batch = async (batch) => {
        await db.query_async(
            `INSERT INTO ui_route_status
            (
                namespace,
                ui_name,
                ui_deployment,
                ui_route_name,
                ui_route_status
            )
            VALUES ?
            ON DUPLICATE KEY UPDATE
                ui_route_status=VALUES(ui_route_status)`,
            [
                batch.map(data => [
                    data.route_context.namespace,
                    data.route_context.ui_name,
                    data.route_context.ui_deployment,
                    data.route_context.ui_route_name,
                    JSON.stringify({
                      status: data.status,
                      message: data.message
                    })
                ])
            ]
        )
    }

    while (true) {
        try {
            if (route_status_logs.length <= 0) {
                await sleep(100)
            } else {
                const batch_data = route_status_logs.splice(
                  0,
                  Math.min(route_status_logs.length, DEFAULT_BATCH_SIZE)
                )
                await async_log_batch(batch_data)
                // console.log(`INFO: flush route status log [${batch_data.length}]`)
            }
        } catch (err) {
            console.log(`ERROR: failed route_status_worker`, err)
        }
    }
}

route_status_worker()

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
  log_comp_status: log_comp_status,
  log_route_status: log_route_status,
  log_deployment_status: log_deployment_status,
  walk_recursive: walk_recursive,
}
