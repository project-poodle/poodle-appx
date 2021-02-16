const db = require('../db/db')
const cache = require('../cache/cache')
const { json_transform, json_trigger } = require('../transform/json_transform')
const { log_api_status, parse_for_sql, load_object, record_status_audit, SUCCESS, FAILURE, REGEX_VAR } = require('./util')

/**
 * handle_status
 */
async function handle_status(context, req, res) {

    let parsed = await parse_for_sql(context, req, res)

    if (parsed.fatal) {
        return
    }

    let sql_params = []

    // select
    let sql = `INSERT INTO \`${context.obj_name}\``
    let first = true
    Object.keys(parsed.data_attrs).forEach((attr_key, i) => {
        // check attr columns
        if (!(attr_key in parsed.key_attrs) && !(attr_key in parsed.non_key_attrs)) {
            let msg = `ERROR: data attr not found [${attr_key}] !`
            log_api_status(context, FAILURE, msg)
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            fatal = true
            return
        }
        if (first) {
            sql = sql + `(\`${attr_key}\``
            first = false
        } else {
            sql = sql + `, \`${attr_key}\``
        }
    })
    sql = sql + `, \`deleted\`) VALUES (`
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
    sql = sql + `, 0)`

    Object.keys(parsed.key_attrs).forEach((key_attr, i) => {

        if (! (key_attr in parsed.data_attrs)) {
            let msg = `ERROR: key attr not found [${key_attr}] !`
            log_api_status(context, FAILURE, msg)
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            fatal = true
            return
        }
    })

    sql = sql + ` ON DUPLICATE KEY UPDATE \`deleted\`=0`
    Object.keys(parsed.data_attrs).forEach((data_attr, i) => {

        if (data_attr in parsed.non_key_attrs) {
            sql = sql + `, \`${data_attr}\`=VALUES(\`${data_attr}\`)`
        }
    });

    // log the sql and run query
    console.log(`INFO: ${sql}, [${sql_params}]`)
    let result = await db.query_async(sql, sql_params)

    // query curr
    let curr = await load_object(parsed)

    // record status audit
    await record_status_audit(curr.id, curr, req)

    // invoke trigger if configured
    if (!!context.trigger) {
      // console.log(`INFO: context.trigger`, context.trigger, JSON.stringify(cache.get_cache_for('ui_deployment'), null, 2))
      const vars = {
        context: req.context,
        params: req.params,
        body: req.body,
        result: result,
        cache: cache.get_all_cache(),
      }
      await json_trigger(vars, context.trigger, {})
    }

    // send back the result
    res.status(200).json({status: SUCCESS, result: result})
}

// export
module.exports = {
    handle_status: handle_status
}
