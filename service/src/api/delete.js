const db = require('../db/db')
const cache = require('../cache/cache')
const { log_api_status, parse_for_sql, SUCCESS, FAILURE, REGEX_VAR } = require('./util')

/**
 * handle_delete
 */
function handle_delete(context, req, res) {

    let parsed = parse_for_sql(context, req, res)

    if (parsed.fatal) {
        return
    }

    let sql_params = []

    // delete (logical)
    let sql = `UPDATE \`${context.obj_name}\` SET \`deleted\`=1`

    // set clause
    Object.keys(parsed.data_attrs).forEach((attr_key, i) => {

        // skip key columns
        if (attr_key in parsed.key_attrs) {
            return
        }

        // set attr
        sql = sql + `, \`${attr_key}\`=?`

        // add attr_value
        let attr_value = parsed.data_attrs[attr_key]
        if (typeof attr_value != 'object') {
            sql_params.push(attr_value)
        } else if (attr_value == null) {
            sql_params.push(null)
        } else {
            sql_params.push(`${JSON.stringify(attr_value)}`)
        }
    })

    // where clause
    first = true
    Object.keys(parsed.key_attrs).forEach((attr_key, i) => {

        if (! (attr_key in parsed.data_attrs)) {
            let msg = `ERROR: key attr not found [${attr_key}] !`
            log_api_status(context, FAILURE, msg)
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            fatal = true
            return
        }

        // where clause
        if (first) {
            sql = sql + ` WHERE \`${attr_key}\`=?`
            first = false
        } else {
            sql = sql + ` AND \`${attr_key}\`=?`
        }

        // add attr_value
        let attr_value = parsed.data_attrs[attr_key]
        if (typeof attr_value != 'object') {
            sql_params.push(attr_value)
        } else if (attr_value == null) {
            sql_params.push(null)
        } else {
            sql_params.push(`${JSON.stringify(attr_value)}`)
        }
    })

    // log the sql and run query
    console.log(`INFO: ${sql}, [${sql_params}]`)
    let result = db.query_sync(sql, sql_params)

    // send back the result
    res.status(200).json({status: SUCCESS})
}

// export
module.exports = {
    handle_delete: handle_delete
}
