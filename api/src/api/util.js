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

    // process object type
    let obj_type = objPath.get(obj, `obj_type`)
    if (!obj_type) {
        let msg = `ERROR: failed to retrieve type for obj [${context.obj_name}] !`
        log_api_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return
    }

    // api sepc
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
        obj_name: context.obj_name,
        obj_type: obj_type,
        key_attrs: key_attrs,
        non_key_attrs: non_key_attrs,
        data_attrs: data_attrs
    }
}

/**
 * load previous object
 */
function load_object(parsed) {

    // create prev sql
    let sql_prev = `SELECT \`id\``
    let sql_prev_params = []

    Object.keys(parsed.key_attrs).forEach((key_attr, i) => {
        sql_prev += ` ,\`${key_attr}\``
    })

    Object.keys(parsed.non_key_attrs).forEach((non_key_attr, i) => {
        sql_prev += ` ,\`${non_key_attr}\``
    })

    if (parsed.obj_type == 'spec') {
        sql_prev += `, \`create_time\``
        sql_prev += `, \`update_time\``
    } else if (parsed.obj_type == 'status') {
        sql_prev += `, \`status_time\``
    }

    sql_prev += ` FROM \`${parsed.obj_name}\` WHERE deleted=0`
    Object.keys(parsed.key_attrs).forEach((key_attr, i) => {

        sql_prev += ` AND \`${key_attr}\`=?`
        sql_prev_params.push(parsed.data_attrs[key_attr])
    })

    let prev = db.query_sync(sql_prev, sql_prev_params)

    if (prev && prev.length != 0) {
        return prev[0]
    } else {
        return null
    }
}

/**
 * record spec audit to database
 */
function record_spec_audit(id, prev, curr, req) {

    let spec_audit = {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        verb: req.context.verb,
        prev: prev,
        curr: curr
    }

    let audit_sql = "INSERT INTO `_spec_audit` (`namespace`, `app_name`, `obj_name`, `obj_id`, `spec_audit`) VALUES (?, ?, ?, ?, ?)"
    let audit_params = [req.context.namespace, req.context.app_name, req.context.obj_name, id, JSON.stringify(spec_audit)]

    try {
        db.query_sync(audit_sql, audit_params)
    } catch (err) {
        console.log(`ERROR: spec audit sql failed ${audit_sql}, ${audit_params}`)
        throw err
    }
}

/**
 * record status audit to database
 */
function record_status_audit(id, status, req) {

    let status_audit = {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        verb: req.context.verb,
        status: status
    }

    let audit_sql = "INSERT INTO `_status_audit` (`namespace`, `app_name`, `obj_name`, `obj_id`, `status_audit`) VALUES (?, ?, ?, ?, ?)"
    let audit_params = [req.context.namespace, req.context.app_name, req.context.obj_name, id, JSON.stringify(status_audit)]

    try {
        db.query_sync(audit_sql, audit_params)
    } catch (err) {
        console.log(`ERROR: status audit sql failed ${audit_sql}, ${audit_params}`)
        throw err
    }

    let history_sql = "INSERT INTO `_status_history` (`namespace`, `app_name`, `obj_name`, `obj_id`, `obj_date`, `status_history`) VALUES (?, ?, ?, ?, CURDATE(), ?) ON DUPLICATE KEY UPDATE status_history=VALUES(status_history)"
    let history_params = [req.context.namespace, req.context.app_name, req.context.obj_name, id, JSON.stringify(status_audit)]

    try {
        db.query_sync(history_sql, history_params)
    } catch (err) {
        console.log(`ERROR: status history sql failed ${history_sql}, ${history_params}`)
        throw err
    }
}

module.exports = {
    get_api_spec: get_api_spec,
    log_api_status: log_api_status,
    parse_for_sql: parse_for_sql,
    load_object: load_object,
    record_spec_audit: record_spec_audit,
    record_status_audit: record_status_audit,
    SUCCESS: SUCCESS,
    FAILURE: FAILURE,
    REGEX_VAR: REGEX_VAR
}
