const objPath = require("object-path")
const express = require('express')
const db = require('../db/db')
const cache = require('../cache/cache')
const { log_api_status, SUCCESS, FAILURE } = require('./util')
const { handle_get } = require('./get')
const { handle_upsert } = require('./upsert')
const { handle_update } = require('./update')
const { handle_patch } = require('./patch')
const { handle_delete } = require('./delete')
const { handle_status } = require('./status')

// track a list of endpoints
// let endpoints = []

/**
 * decode params
 */
function decode_params(params) {

  const result = {}
  Object.keys(params).map(paramKey => {
    const paramValue = params[paramKey]
    if (paramValue.startsWith('base64:')) {
      // console.log(paramValue)
      const decodedValue = Buffer.from(paramValue.substring('base64:'.length), 'base64').toString('utf8')
      result[paramKey] = decodedValue
    } else {
      result[paramKey] = paramValue
    }
  })
  return result
}

/**
 * get_api_spec
 */
function get_api_spec(context, req, res) {

    let fatal = false

    // console.log(cache.get_cache_for('object'))
    let cache_obj = cache.get_cache_for('object')
    let obj_prop = [
        //"object",
        context.namespace,
        "app_deployments",
        context.app_name,
        context.app_deployment,
        "objs",
        context.obj_name
    ]
    let obj = objPath.get(cache_obj, obj_prop)
    if (!obj) {
        let msg = `ERROR: obj not found [${context.obj_name}] - [${JSON.stringify(context)}] !`
        log_api_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return
    }

    let api_spec = objPath.get(obj, ["apis_by_method", context.api_method, context.api_endpoint, "api_spec"])
    if (!api_spec) {
        let msg = `ERROR: api_spec not found - [${JSON.stringify(context)}] !`
        log_api_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return null
    }

    // check verb
    let verb = objPath.get(api_spec, ["syntax", "verb"])
    if (!verb) {
        let msg = `ERROR: api syntax missing verb - [${JSON.stringify(api_spec)}] !`
        log_api_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return null
    }

    return api_spec
}

async function handle_req(req, res) {

    try {
        // check api_spec
        let api_spec = get_api_spec(req.context, req, res)
        if (! api_spec) {
            return
        }

        if ('permission' in api_spec) {
            let permission = api_spec.permission

            if (req.context.user.func_perms.includes(permission)) {

                req.context.func_perm_granted = true

            } else {

                let obj_perm_granted = false
                Object.keys(req.context.user.obj_perms).map(obj_type => {

                    if (req.context.user.obj_perms[obj_type].includes(permission)) {
                        obj_perm_granted = true
                    }
                })

                if (! obj_perm_granted) {
                    res.status(403).json({status: FAILURE, message: `Access Denied`})
                    return
                }
            }
        }

        req.context = Object.assign({}, req.context, { verb: api_spec.syntax.verb, trigger: api_spec.syntax.trigger })
        //console.log(req.context)

        // handle request by verb
        switch(api_spec.syntax.verb) {
            case "get":
                await handle_get(req.context, req, res)
                return

            case "upsert":
                await handle_upsert(req.context, req, res)
                return

            case "update":
                await handle_update(req.context, req, res)
                return

            case "patch":
                await handle_patch(req.context, req, res)
                return

            case "delete":
                await handle_delete(req.context, req, res)
                return

            case "status":
                await handle_status(req.context, req, res)
                return

            default:
                log_api_status(context, FAILURE,
                    `ERROR: unsupported verb [${api_spec.syntax.verb}] - [${JSON.stringify(api_spec)}]`)
        }

    } catch (err) {
        console.log(err)
        try {
            res.status(500).json({
                status: FAILURE,
                message: String(err)
            })
        } catch (err2) {
            console.log(err2)
        }
    }
}

async function load_api_router(namespace, app_name, app_deployment) {

    let api_results = await db.query_async(`SELECT
                    api.namespace,
                    api.app_name,
                    app_deployment.app_deployment,
                    app_runtime.app_runtime,
                    api.app_ver,
                    api.app_rev,
                    api.obj_name,
                    api.api_method,
                    api.api_endpoint,
                    api.api_spec,
                    app_deployment.app_deployment_spec,
                    api.create_time,
                    api.update_time
                FROM api
                JOIN app_deployment
                    ON api.namespace = app_deployment.namespace
                    AND api.app_name = app_deployment.app_name
                    AND api.app_ver = app_deployment.app_ver
                    AND api.app_rev = app_deployment.app_rev
                JOIN app_runtime
                    ON api.namespace = app_runtime.namespace
                    AND api.app_name = app_runtime.app_name
                    AND api.app_ver = app_runtime.app_ver
                    AND app_deployment.app_runtime = app_runtime.app_runtime
                WHERE
                    api.namespace = ?
                    AND api.app_name = ?
                    AND app_deployment.app_deployment = ?
                    AND api.deleted=0
                    AND app_deployment.deleted=0`,
                [
                    namespace,
                    app_name,
                    app_deployment
                ]
    )

    // console.log(api_results)

    let router = express.Router()

    for (const api_result of api_results) {

        let api_context = {
            namespace: api_result.namespace,
            app_name: api_result.app_name,
            app_deployment: api_result.app_deployment,
            app_runtime: api_result.app_runtime,
            obj_name: api_result.obj_name,
            api_method: api_result.api_method,
            api_endpoint: api_result.api_endpoint
        }

        switch (api_result.api_method.toLowerCase()) {

            case "get":

                router.get(api_result.api_endpoint, async (req, res) => {

                    req.params = decode_params(req.params)
                    req.context = Object.assign({}, api_context, req.context)
                    await handle_req(req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "post":
                router.post(api_result.api_endpoint, async (req, res) => {

                    req.params = decode_params(req.params)
                    req.context = Object.assign({}, api_context, req.context)
                    await handle_req(req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "put":
                router.put(api_result.api_endpoint, async (req, res) => {

                    req.params = decode_params(req.params)
                    req.context = Object.assign({}, api_context, req.context)
                    await handle_req(req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "patch":
                router.patch(api_result.api_endpoint, async (req, res) => {

                    req.params = decode_params(req.params)
                    req.context = Object.assign({}, api_context, req.context)
                    await handle_req(req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "delete":
                router.delete(api_result.api_endpoint, async (req, res) => {

                    req.params = decode_params(req.params)
                    req.context = Object.assign({}, api_context, req.context)
                    await handle_req(req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            default:
                log_api_status(api_result, FAILURE,
                    `unknow api method: ${api_result.api_method} [${JSON.stringify(api_result)}]`)
        }
    }

    router.use('/', (req, res) => {
        res.status(404).json({status: FAILURE, message: `ERROR: ${req.method} API for [${req.url}] not found !`})
    })

    return router
}

//export this router to use in our index.js
module.exports = {
    load_api_router: load_api_router
}
