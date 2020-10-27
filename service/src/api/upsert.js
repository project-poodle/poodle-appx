const dotProp = require('dot-prop')
const db = require('../db/db')
const cache = require('../cache/cache')
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('./util')

/**
 * parse_get
 */
function parse_upsert(api_context, req, res) {

    let fatal = false

    // generate sql statement
    let key_attrs = {}
    let non_key_attrs = {}
    let data_attrs = {}

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
        return
    }

    let verb = dotProp.get(api_spec, 'syntax.verb')
    if (!verb) {
        let msg = `ERROR: api syntax missing verb - [${JSON.stringify(api_spec)}] !`
        log_api_status(api_context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return
    }

    // process object attrs
    let obj_attrs = dotProp.get(obj, `attrs`)
    if (!obj_attrs) {
        let msg = `ERROR: failed to retrieve attrs for obj [${api_context.obj_name}] !`
        log_api_status(api_context, FAILURE, msg)
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
            let msg = `ERROR: param_key not found [${param_key}] - [${api_context.api_endpoint}] !`
            log_api_status(api_context, FAILURE, msg)
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            fatal = true
            return
        }

        data_attrs[param_key] = `${params[param_key]}`
    });

    // process req.body
    console.log(req.body)
    let body = req.body || {}
    Object.keys(body).forEach((body_key, i) => {

        if (fatal) {
            return
        }

        if (! (body_key in non_key_attrs)) {
            let msg = `ERROR: body_key not found [${body_key}] - [${body}] !`
            log_api_status(api_context, FAILURE, msg)
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

/**
 * handle_upsert
 */
function handle_upsert(api_context, req, res) {

    let parsed = parse_upsert(api_context, req, res)

    if (parsed.fatal) {
        return
    }

    let sql_params = []

    // select
    let sql = `INSERT INTO \`${api_context.obj_name}\``
    let first = true
    Object.keys(parsed.data_attrs).forEach((attr, i) => {
        if (first) {
            sql = sql + `(\`${attr}\``
            first = false
        } else {
            sql = sql + `, \`${attr}\``
        }
    })
    sql = sql + `) VALUES (`
    first = true
    Object.keys(parsed.data_attrs).forEach((attr_key, i) => {
        if (first) {
            first = false
        } else {
            sql = sql + `, `
        }
        let attr_value = parsed.data_attrs[attr_key]
        if (typeof attr_value != 'object') {
            sql = sql + `?`
            sql_params.push(attr_value)
        } else if (attr_value == null) {
            sql = sql + `?`
            sql_params.push(null)
        } else {
            sql = sql + `?`
            sql_params.push(`${JSON.stringify(attr_value)}`)
        }
    })
    sql = sql + `)`

    Object.keys(parsed.key_attrs).forEach((key_attr, i) => {

        if (! (key_attr in parsed.data_attrs)) {
            let msg = `ERROR: key attr not found [${key_attr}] !`
            log_api_status(api_context, FAILURE, msg)
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            fatal = true
            return
        }
    })

    first = true
    Object.keys(parsed.data_attrs).forEach((data_attr, i) => {

        if (data_attr in parsed.non_key_attrs) {
            if (first) {
                sql = sql + ` ON DUPLICATE KEY UPDATE `
                first = false
            } else {
                sql = sql + ` ,`
            }
            sql = sql + `\`${data_attr}\`=VALUES(\`${data_attr}\`)`
        }
    });

    // log the sql and run query
    console.log(`INFO: ${sql}, [${sql_params}]`)
    let result = db.query_sync(sql, sql_params)

    // send back the result
    res.status(200).json({status: SUCCESS})
}

// export
module.exports = {
    handle_upsert: handle_upsert
}
