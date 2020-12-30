const fs = require('fs')
const path = require('path')
const objPath = require("object-path")
const db = require('../db/db')
const cache = require('../cache/cache')

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

    let context = req.context

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
  get_ui_element: get_ui_element,
  get_ui_route: get_ui_route,
  walk_recursive: walk_recursive,
}
