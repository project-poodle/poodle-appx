const express = require('express')
const dotProp = require('dot-prop')
const db = require('../db/db')
const cache = require('../cache/cache')
const { log_api_status, SUCCESS, FAILURE } = require('./util')
const { handle_get } = require('./get')
const { handle_upsert } = require('./upsert')

// track a list of endpoints
// let endpoints = []

function get_api_spec(api_context) {

    let fatal = false

    // console.log(cache.get_cache_for('object'))
    let cache_obj = cache.get_cache_for('object')

    let obj_prop = `object.${api_context.namespace}.runtimes.${api_context.runtime_name}.deployments.${api_context.app_name}.objs.${api_context.obj_name}`
    let obj = dotProp.get(cache_obj, obj_prop)
    if (!obj) {
        let msg = `ERROR: obj not found [${api_context.obj_name}] - [${JSON.stringify(api_context)}] !`
        log_api_status(api_context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return
    }


    let api_spec = dotProp.get(obj, `apis_by_method.${api_context.api_method}.${api_context.api_endpoint}.api_spec`)
    if (!api_spec) {
        let msg = `ERROR: api_spec not found - [${JSON.stringify(api_context)}] !`
        log_api_status(api_context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return null
    }

    // check verb
    let verb = dotProp.get(api_spec, 'syntax.verb')
    if (!verb) {
        let msg = `ERROR: api syntax missing verb - [${JSON.stringify(api_spec)}] !`
        log_api_status(api_context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return null
    }

    return api_spec
}

function handle_req(api_context, req, res) {

    // check api_spec
    let api_spec = get_api_spec(api_context)
    if (! api_spec) {
        return
    }

    // handle request by verb
    switch(api_spec.syntax.verb) {
        case "get":
            handle_get(api_context, req, res)
            return

        case "upsert":
            handle_upsert(api_context, req, res)
            return

        case "update":
        case "delete":
        case "status":
        default:
            log_api_status(api_context, FAILURE,
                `ERROR: unsupported verb [${api_spec.syntax.verb}] - [${JSON.stringify(api_spec)}]`)
    }
}

function get_router(namespace, runtime_name, app_name) {

    let api_results = db.query_sync(`SELECT
                    api.namespace,
                    api.app_name,
                    api.app_ver,
                    deployment.runtime_name,
                    api.obj_name,
                    api.api_method,
                    api.api_endpoint,
                    api.api_spec,
                    deployment.deployment_spec,
                    api.create_time,
                    api.update_time
                FROM api
                JOIN deployment
                    ON api.namespace = deployment.namespace
                    AND api.app_name = deployment.app_name
                    AND api.app_ver = deployment.app_ver
                WHERE
                    api.namespace = '${namespace}'
                    AND deployment.runtime_name = '${runtime_name}'
                    AND api.app_name = '${app_name}'
                    AND api.deleted=0
                    AND deployment.deleted=0`)

    let router = express.Router()

    api_results.forEach((api_result) => {

        let api_context = {
            namespace: api_result.namespace,
            runtime_name: api_result.runtime_name,
            app_name: api_result.app_name,
            obj_name: api_result.obj_name,
            api_method: api_result.api_method,
            api_endpoint: api_result.api_endpoint
        }

        switch (api_result.api_method) {

            case "get":

                router.get(api_result.api_endpoint, (req, res) => {

                    handle_req(api_context, req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "post":
                router.post(api_result.api_endpoint, (req, res) => {

                    handle_req(api_context, req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "put":
                router.put(api_result.api_endpoint, (req, res) => {

                    handle_req(api_context, req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "delete":
                router.delete(api_result.api_endpoint, (req, res) => {

                    handle_req(api_context, req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            default:
                log_api_status(api_result, FAILURE,
                    `unknow api method: ${api_result.api_method} [${JSON.stringify(api_result)}]`)
        }
    });

    return router
}

//export this router to use in our index.js
module.exports = {
    get_router: get_router
}
