const express = require('express')
const db = require('../db/db')
const cache = require('../cache/cache')
const { log_api_status, get_api_spec, SUCCESS, FAILURE } = require('./util')
const { handle_get } = require('./get')
const { handle_upsert } = require('./upsert')
const { handle_update } = require('./update')
const { handle_delete } = require('./delete')
const { handle_status } = require('./status')

// track a list of endpoints
// let endpoints = []

function handle_req(context, req, res) {

    // check api_spec
    let api_spec = get_api_spec(context, req, res)
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
                res.status(403).json({status: FAILURE, message: `Permission Denied`})
                return
            }
        }
    }

    console.log(req.context)

    // handle request by verb
    switch(api_spec.syntax.verb) {
        case "get":
            handle_get(context, req, res)
            return

        case "upsert":
            handle_upsert(context, req, res)
            return

        case "update":
            handle_update(context, req, res)
            return

        case "delete":
            handle_delete(context, req, res)
            return

        case "status":
            handle_status(context, req, res)
            return

        default:
            log_api_status(context, FAILURE,
                `ERROR: unsupported verb [${api_spec.syntax.verb}] - [${JSON.stringify(api_spec)}]`)
    }
}

function get_router(namespace, app_name, runtime_name) {

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
            app_name: api_result.app_name,
            runtime_name: api_result.runtime_name,
            obj_name: api_result.obj_name,
            api_method: api_result.api_method,
            api_endpoint: api_result.api_endpoint
        }

        switch (api_result.api_method) {

            case "get":

                router.get(api_result.api_endpoint, (req, res) => {

                    let context = Object.assign({}, api_context, req.context)
                    handle_req(context, req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "post":
                router.post(api_result.api_endpoint, (req, res) => {

                    let context = Object.assign({}, api_context, req.context)
                    handle_req(context, req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "put":
                router.put(api_result.api_endpoint, (req, res) => {

                    let context = Object.assign({}, api_context, req.context)
                    handle_req(context, req, res)
                })
                log_api_status(api_result, SUCCESS,
                    `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "delete":
                router.delete(api_result.api_endpoint, (req, res) => {

                    let context = Object.assign({}, api_context, req.context)
                    handle_req(context, req, res)
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
