const objPath = require("object-path")
const db = require('../db/db')
const cache = require('../cache/cache')

const SUCCESS = "ok"
const FAILURE = "error"

const REGEX_VAR = '[_a-zA-Z][_a-zA-Z0-9]*'

/**
 * log_api_status
 */
const log_api_status = (api_result, status, message) => {

    db.query_sync(`INSERT INTO api_status
                    (
                        namespace,
                        runtime_name,
                        app_name,
                        obj_name,
                        api_method,
                        api_endpoint,
                        api_status
                    )
                    VALUES
                    (
                        ?, ?, ?, ?, ?, ?,
                        JSON_OBJECT('status', '${status}', 'message', '${message}')
                    )
                    ON DUPLICATE KEY UPDATE
                        api_status=VALUES(api_status)`,
                    [
                        api_result.namespace,
                        api_result.runtime_name,
                        api_result.app_name,
                        api_result.obj_name,
                        api_result.api_method,
                        api_result.api_endpoint
                    ])
}

/**
 * get_api_spec
 */
function get_api_spec(context, req, res) {

    let fatal = false

    // console.log(cache.get_cache_for('object'))
    let cache_obj = cache.get_cache_for('object')

    let obj_prop = ["object", context.namespace, "runtimes", context.runtime_name, "deployments", context.app_name, "objs", context.obj_name]
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


/**
 * parse_upsert
 */
function parse_for_sql(context, req, res) {

    let fatal = false

    // parse for sql
    let key_attrs = {}
    let non_key_attrs = {}
    let data_attrs = {}

    // console.log(cache.get_cache_for('object'))
    let cache_obj = cache.get_cache_for('object')

    let obj_prop = ["object", context.namespace, "runtimes", context.runtime_name, "deployments", context.app_name, "objs", context.obj_name]
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
        return
    }

    let verb = objPath.get(api_spec, ["syntax", "verb"])
    if (!verb) {
        let msg = `ERROR: api syntax missing verb - [${JSON.stringify(api_spec)}] !`
        log_api_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return
    }

    // process object attrs
    let obj_attrs = objPath.get(obj, `attrs`)
    if (!obj_attrs) {
        let msg = `ERROR: failed to retrieve attrs for obj [${context.obj_name}] !`
        log_api_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return
    }

    // update select attrs
    Object.keys(obj_attrs).forEach((obj_attr_key, i) => {
        let obj_attr = obj_attrs[obj_attr_key]
        if ('key' in obj_attr.attr_spec && obj_attr.attr_spec.key) {
            key_attrs[`${obj_attr_key}`] = `\`${obj_attr_key}\``
        } else {
            if ((!('managed' in obj_attr.attr_spec)) || obj_attr.attr_spec.managed) {
                non_key_attrs[`${obj_attr_key}`] = `\`${obj_attr_key}\``
            }
        }
    });

    //console.log(key_attrs)
    //console.log(non_key_attrs)

    // process req.params
    let params = req.params || {}
    Object.keys(params).forEach((param_key, i) => {

        if (fatal) {
            return
        }

        if (! (param_key in key_attrs) && ! (param_key in non_key_attrs)) {
            let msg = `ERROR: param_key not found [${param_key}] - [${context.api_endpoint}] !`
            log_api_status(context, FAILURE, msg)
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            fatal = true
            return
        }

        data_attrs[param_key] = `${params[param_key]}`
    });

    // process req.body
    let body = req.body || {}
    Object.keys(body).forEach((body_key, i) => {

        if (fatal) {
            return
        }

        if (! (body_key in non_key_attrs)) {
            let msg = `ERROR: body_key not found [${body_key}] - [${body}] !`
            log_api_status(context, FAILURE, msg)
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            fatal = true
            return
        }

        data_attrs[body_key] = body[body_key]
    });

    // return result
    return {
        fatal: fatal,
        key_attrs: key_attrs,
        non_key_attrs: non_key_attrs,
        data_attrs: data_attrs
    }
}


module.exports = {
    get_api_spec: get_api_spec,
    log_api_status: log_api_status,
    parse_for_sql: parse_for_sql,
    SUCCESS: SUCCESS,
    FAILURE: FAILURE,
    REGEX_VAR: REGEX_VAR
}
