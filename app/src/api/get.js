const objPath = require("object-path")
const db = require('../db/db')
const cache = require('../cache/cache')
const { json_transform, json_trigger } = require('../transform/json_transform')
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('./util')

let DEF_START = 0
let MAX_START = 200 * 1000

let DEF_LIMIT = 5 * 1000
let MAX_LIMIT = 200 * 1000

/**
 * parse_get
 */
async function parse_get(context, req, res) {

    let fatal = false

    // generate sql statement
    let select_attrs = {}
    let join_tables = {}
    let where_clauses = []
    let order_bys = []
    let limit = {
        _start: DEF_START,
        _limit: DEF_LIMIT
    }

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
        return { fatal: fatal, status: FAILURE, error: msg }
    }

    let api_spec = objPath.get(obj, ["apis_by_method", context.api_method, context.api_endpoint, "api_spec"])
    if (!api_spec) {
        let msg = `ERROR: api_spec not found - [${JSON.stringify(context)}] !`
        log_api_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return { fatal: fatal, status: FAILURE, error: msg }
    }

    let verb = objPath.get(api_spec, ["syntax", "verb"])
    if (!verb) {
        let msg = `ERROR: api syntax missing verb - [${JSON.stringify(api_spec)}] !`
        log_api_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return { fatal: fatal, status: FAILURE, error: msg }
    }

    // process object attrs
    let obj_attrs = objPath.get(obj, `attrs`)
    if (!obj_attrs) {
        let msg = `ERROR: failed to retrieve attrs for obj [${context.obj_name}] !`
        log_api_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return { fatal: fatal, status: FAILURE, error: msg }
    }

    // update select attrs
    Object.keys(obj_attrs).forEach((obj_attr, i) => {
        select_attrs[`${obj_attr}`] = `\`${context.obj_name}\`.\`${obj_attr}\``
    });

    // process object type
    let obj_type = objPath.get(obj, `obj_type`)
    if (!obj_type) {
        let msg = `ERROR: failed to retrieve type for obj [${context.obj_name}] !`
        log_api_status(context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return { fatal: fatal, status: FAILURE, error: msg }
    }

    // add select attrs for obj_type
    if (obj_type == 'spec') {
        select_attrs[`create_time`] = `\`${context.obj_name}\`.\`create_time\``
        select_attrs[`update_time`] = `\`${context.obj_name}\`.\`update_time\``
    } else if (obj_type == 'status') {
        select_attrs[`status_time`] = `\`${context.obj_name}\`.\`status_time\``
    }

    // process join statement
    let join = objPath.get(api_spec, ["syntax", "join"])
    let lookup_tables = [ context.obj_name ]
    if (join) {
        for (const join_spec of join) {

            let join_name = join_spec['obj']
            let join_type = join_spec['type']

            // find join obj
            let join_obj_prop = [
                //"object",
                context.namespace,
                "app_deployments",
                context.app_name,
                context.app_deployment,
                "objs",
                join_name
            ]
            let join_obj = objPath.get(cache_obj, join_obj_prop)
            if (!join_obj) {
                let msg = `ERROR: failed to retrieve join obj [${join_name}] !`
                log_api_status(context, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                fatal = true
                return { fatal: fatal, status: FAILURE, error: msg }
            }

            // process join obj attrs
            let join_obj_attrs = objPath.get(join_obj, `attrs`)
            if (!join_obj_attrs) {
                let msg = `ERROR: failed to retrieve attrs for join obj [${join_name}] !`
                log_api_status(context, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                fatal = true
                return { fatal: fatal, status: FAILURE, error: msg }
            }

            // add select attrs for join_obj
            Object.keys(join_obj_attrs).forEach((join_attr, i) => {
                if (! (join_attr in select_attrs)) {
                    select_attrs[`${join_attr}`] = `\`${join_name}\`.\`${join_attr}\``
                }
            })

            // process join obj type
            let join_obj_type = objPath.get(join_obj, `obj_type`)
            if (!join_obj_type) {
                let msg = `ERROR: failed to retrieve attrs for join obj [${join_name}] !`
                log_api_status(context, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                fatal = true
                return { fatal: fatal, status: FAILURE, error: msg }
            }

            // add select attrs for join_obj_type
            if (join_obj_type == 'spec') {
                if (! (`create_time` in select_attrs)) {
                    select_attrs[`create_time`] = `\`${join_name}\`.\`create_time\``
                }
                if (! (`update_time` in select_attrs)) {
                    select_attrs[`update_time`] = `\`${join_name}\`.\`update_time\``
                }
            } else if (join_obj_type == 'status') {
                if (! (`status_time` in select_attrs)) {
                    select_attrs[`status_time`] = `\`${join_name}\`.\`status_time\``
                }
            }

            // process relations
            let relation_spec = null

            let lookup_tables = [context.obj_name, ...Object.keys(join_tables)]
            // console.log(lookup_tables)
            for (let i=0; i<lookup_tables.length; i++) {

                // lookup_name
                let lookup_name = lookup_tables[i]

                // lookup_obj
                let lookup_obj_prop = [
                    //"object",
                    context.namespace,
                    "app_deployments",
                    context.app_name,
                    context.app_deployment,
                    "objs",
                    lookup_name
                ]
                let lookup_obj = objPath.get(cache_obj, lookup_obj_prop)
                if (!lookup_obj) {
                    let msg = `ERROR: failed to retrieve lookup obj [${lookup_name}] !`
                    log_api_status(context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return { fatal: fatal, status: FAILURE, error: msg }
                }

                // lookup_obj_attrs
                let lookup_obj_attrs = objPath.get(lookup_obj, `attrs`)
                if (!lookup_obj_attrs) {
                    let msg = `ERROR: failed to retrieve attrs for other obj [${lookup_tables[i]}] !`
                    log_api_status(context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return { fatal: fatal, status: FAILURE, error: msg }
                }

                // lookup_relations
                let lookup_relations_1ton = objPath.get(lookup_obj, `relations_1ton`)
                let lookup_relations_nto1 = objPath.get(lookup_obj, `relations_nto1`)

                if (join_name in lookup_relations_1ton) {
                    relation_spec = lookup_relations_1ton[join_name]['relation_spec']
                    // break - if first match wins
                    // no break - if adding all matches
                } else if (join_name in lookup_relations_nto1) {
                    relation_spec = lookup_relations_nto1[join_name]['relation_spec']
                    // break - if first match wins
                    // no break - if adding all matches
                } else {
                    continue
                }

                // we are here if relation_spec is found
                if (! ('attrs' in relation_spec) || !Array.isArray(relation_spec['attrs'])) {
                    let msg = `ERROR: cannot parse relation for join obj [${join_name}] - relation_spec [${JSON.stringify(relation_spec)}] !`
                    log_api_status(context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return { fatal: fatal, status: FAILURE, error: msg }
                }

                relation_attrs = []
                relation_spec['attrs'].forEach((rel_attr, i) => {

                    if (! (rel_attr.src in lookup_obj_attrs)) {
                        return
                    }
                    if (! (rel_attr.tgt in join_obj_attrs)) {
                        return
                    }

                    let srcAttr = rel_attr.src
                    let tgtAttr = rel_attr.tgt

                    relation_attrs.push({
                        srcObj: lookup_obj.obj_name,
                        srcAttr: srcAttr,
                        tgtObj: join_obj.obj_name,
                        tgtAttr: tgtAttr
                    })
                })

                // we are here if relation_spec is found
                if (relation_attrs.length == 0) {
                    let msg = `ERROR: empty relation attrs for join obj [${join_name}] - relation_spec [${JSON.stringify(relation_spec)}] !`
                    log_api_status(context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return { fatal: fatal, status: FAILURE, error: msg }
                }

                // append join table attrs
                if (! (join_name in join_tables)) {
                    join_tables[join_name] = {
                        type: join_type,
                        attrs: []
                    }
                }
                join_tables[join_name].attrs = join_tables[join_name].attrs.concat(relation_attrs)
            }

            // if relation_spec not found
            if (! relation_spec) {
                let msg = `ERROR: cannot find relation for join obj [${join_name}] - [${JSON.stringify(api_spec)}] !`
                log_api_status(context, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                fatal = true
                return { fatal: fatal, status: FAILURE, error: msg }
            }
        }
    }

    // cut short if fatal
    if (fatal) {
        return { fatal: fatal }
    }

    // process req.params
    let params = req.params || {}
    for (const param_key of Object.keys(params)) {

        if (! (param_key in select_attrs)) {
            let msg = `ERROR: param_key not found [${param_key}] - [${context.api_endpoint}] !`
            log_api_status(context, FAILURE, msg)
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            fatal = true
            return
        }

        let where_clause = {
            attr: select_attrs[param_key],
            value: params[param_key]
        }

        where_clauses.push(where_clause)
    }

    // process query string
    let queries = req.query || {}
    for (const query_key of Object.keys(queries)) {

        // cut short if fatal
        if (fatal) {
            return { fatal: fatal }
        }

        if (query_key == '_sort') {

            let sortKeys = queries[query_key].split(",")
            for (const sortKey of sortKeys) {

                let regex = `^(${REGEX_VAR})(\\.${REGEX_VAR})*(\\((asc|desc)\\))?$`
                //console.log(sortKey)
                //console.log(regex)
                let match = sortKey.match(new RegExp(regex))
                //console.log(match)

                if (! match) {
                    let msg = `ERROR: unrecognized sort key [${sortKey}] - [${req.url}] !`
                    log_api_status(context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return
                }

                if (! (match[1] in select_attrs)) {
                    let msg = `ERROR: unable to find attr for sort key [${sortKey}] - [${req.url}] !`
                    log_api_status(context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return
                }

                order_bys.push({
                    attr: select_attrs[match[1]],
                    json_attr: match[2],
                    order: match[4] ? match[4] : 'asc'
                })
            }

        } else if (query_key == '_start') {

            let number = parseInt(queries[query_key])
            if (isNaN(number)) {
                limit['_start'] = DEF_START
            } else {
                limit['_start'] = Math.min(MAX_START, Math.max(0, number))
            }

        } else if (query_key == '_limit') {

            let number = parseInt(queries[query_key])
            if (isNaN(number)) {
                limit['_limit'] = DEF_LIMIT
            } else {
                limit['_limit'] = Math.min(MAX_LIMIT, Math.max(0, number))
            }

        } else {

            // other query columns
            let regex = `^(${REGEX_VAR})(\\.${REGEX_VAR})*$`
            let match = query_key.match(new RegExp(regex))

            if (! match) {
                let msg = `ERROR: unrecognized query key [${query_key}] - [${req.url}] !`
                log_api_status(context, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                fatal = true
                return
            }

            if (! (match[1] in select_attrs)) {
                let msg = `ERROR: unable to find attr for query key [${query_key}] - [${req.url}] !`
                log_api_status(context, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                fatal = true
                return
            }

            let where_clause = {
                attr: select_attrs[match[1]],
                json_attr: match[2],
                value: queries[query_key]
            }

            where_clauses.push(where_clause)
        }
    }

    // return result
    return {
        fatal: fatal,
        select_attrs: select_attrs,
        join_tables: join_tables,
        where_clauses: where_clauses,
        order_bys: order_bys,
        limit: limit
    }
}

/**
 * handle_get
 */
async function handle_get(context, req, res) {

    let parsed = await parse_get(context, req, res)

    if (parsed.fatal) {
        return
    }

    // select
    let sql = "SELECT "
    sql = sql + `\`${context.obj_name}\`.\`id\``
    Object.keys(parsed.select_attrs).forEach((attr, i) => {
        sql = sql + `, ${parsed.select_attrs[attr]}`
    });
    sql = sql + ` FROM \`${context.obj_name}\``

    // join
    Object.keys(parsed.join_tables).forEach((join_name, i) => {
        let join_table = parsed.join_tables[join_name]
        if (join_table.type) {
            sql = sql + ` ${join_table.type.toUpperCase()} JOIN \`${join_name}\``
        } else {
            sql = sql + ` JOIN \`${join_name}\``
        }
        sql = sql + ` ON \`${join_name}\`.\`deleted\` = 0`
        join_table.attrs.forEach((join_attr, i) => {
            sql = sql + ` AND \`${join_attr.srcObj}\`.\`${join_attr.srcAttr}\` = \`${join_attr.tgtObj}\`.${join_attr.tgtAttr}`
        })
    })

    // where statement
    sql = sql + ` WHERE \`${context.obj_name}\`.\`deleted\` = 0`

    let sql_params = []
    parsed.where_clauses.forEach((where_clause, i) => {
        if (where_clause.json_attr) {
            sql = sql + ` AND JSON_EXTRACT(${where_clause.attr}, '\$${where_clause.json_attr}') = ?`
        } else {
            sql = sql + ` AND ${where_clause.attr} = ?`
        }
        sql_params.push(`${where_clause.value}`)
    })

    // sort
    if (parsed.order_bys.length != 0) {
        sql = sql + ` ORDER BY`
        let first = true
        parsed.order_bys.forEach((order_by, i) => {
            if (first) {
                first = false
            } else {
                sql = sql + `,`
            }
            if (order_by.json_attr) {
                sql = sql + ` JSON_EXTRACT(${order_by.attr}, '\$${order_by.json_attr}') ${order_by.order}`
            } else {
                sql = sql + ` ${order_by.attr} ${order_by.order}`
            }
        })
    }

    // limit
    if (parsed.limit) {
        sql = sql + ` LIMIT ${parsed.limit._start}, ${parsed.limit._limit}`
    }

    // log the sql and run query
    console.log(`INFO: ${sql}, [${sql_params}]`)
    let result = await db.query_async(sql, sql_params)

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
    res.status(200).json(result)
}

// export
module.exports = {
    handle_get: handle_get
}
