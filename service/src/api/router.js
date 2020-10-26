const express = require('express')
const dotProp = require('dot-prop')
const db = require('../db/db')
const cache = require('../cache/cache')

// track a list of endpoints
// let endpoints = []

const SUCCESS = "ok"
const FAILURE = "failure"

function log_api_status(api_result, status, message) {

    db.query_sync(`INSERT INTO api_status
                    (
                        namespace,
                        runtime_name,
                        app_name,
                        obj_name,
                        api_method,
                        api_endpoint,
                        api_state
                    )
                    VALUES
                    (
                        ?, ?, ?, ?, ?, ?,
                        JSON_OBJECT('status', '${status}', 'message', '${message}')
                    )
                    ON DUPLICATE KEY UPDATE
                        api_state=VALUES(api_state)`,
                    [
                        api_result.namespace,
                        api_result.runtime_name,
                        api_result.app_name,
                        api_result.obj_name,
                        api_result.api_method,
                        api_result.api_endpoint
                    ])
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

        switch (api_result.api_method) {

            case "get":
                router.get(api_result.api_endpoint, (req, res) => {

                    // console.log(cache.get_cache_for('object'))
                    let obj_prop = `object.${api_result.namespace}.runtimes.${api_result.runtime_name}.deployments.${api_result.app_name}.objs.${api_result.obj_name}`
                    let obj = dotProp.get(cache.get_cache_for('object'), obj_prop)
                    // console.log(JSON.stringify(obj, null, 4))

                    let relations_1ton = dotProp.get(obj, `relations_1ton`)
                    let relations_nto1 = dotProp.get(obj, `relations_nto1`)

                    let verb = dotProp.get(api_result.api_spec, 'syntax.verb')
                    let join = dotProp.get(api_result.api_spec, 'syntax.join')

                    if (!verb) {
                        log_api_status(api_result, FAILURE, `ERROR: api syntax missing verb - [${JSON.stringify(api_result.api_spec)}] !`)
                    }

                    // let obj_attrs = dotProp.get(obj, `attrs.${api_result.obj_name}`)
                    let obj_attrs = dotProp.get(obj, `attrs`)
                    if (!obj_attrs) {
                        log_api_status(api_result, FAILURE, `ERROR: failed retrieve attrs for obj [${api_result.obj_name}] !`)
                    }

                    let sql = "SELECT "
                    Object.keys(obj_attrs).forEach((obj_attr, i) => {
                        sql = sql + `\`${api_result.obj_name}\`.\`${obj_attr}\`, `
                    });
                    sql = sql + `\`${api_result.obj_name}\`.\`id\``
                    sql = sql + ` FROM \`${api_result.obj_name}\``

                    if (join) {
                        join.forEach((other_obj, i) => {

                        });

                    }
                    sql = sql + ` WHERE \`${api_result.obj_name}\`.\`deleted\` = 0`

                    console.log(`INFO: ${sql}`)
                    let result = db.query_sync(sql)

                    res.send(JSON.stringify(result, null, 4))
                })

                log_api_status(api_result, SUCCESS, `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "post":
                router.post(api_result.api_endpoint, (req, res) => {
                    res.send(JSON.stringify(api_result, null, 4))
                })
                log_api_status(api_result, SUCCESS, `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "put":
                router.put(api_result.api_endpoint, (req, res) => {
                    res.send(JSON.stringify(api_result, null, 4))
                })
                log_api_status(api_result, SUCCESS, `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            case "delete":
                router.delete(api_result.api_endpoint, (req, res) => {
                    res.send(JSON.stringify(api_result, null, 4))
                })
                log_api_status(api_result, SUCCESS, `INFO: published successfully [${JSON.stringify(api_result.api_spec)}] !`)
                break

            default:
                log_api_status(api_result, FAILURE, `unknow api method: ${api_result.api_method} [${JSON.stringify(api_result)}]`)
        }
    });

    return router
}

//export this router to use in our index.js
module.exports = {
    get_router: get_router
}
