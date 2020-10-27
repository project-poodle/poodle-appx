const dotProp = require('dot-prop')
const db = require('../db/db')
const cache = require('../cache/cache')
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('./util')

let DEF_START = 0
let MAX_START = 200 * 1000

let DEF_LIMIT = 5 * 1000
let MAX_LIMIT = 200 * 1000

/**
 * parse_get
 */
function parse_get(api_context, req, res) {

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

    let obj_prop = `object.${api_context.namespace}.runtimes.${api_context.runtime_name}.deployments.${api_context.app_name}.objs.${api_context.obj_name}`
    let obj = dotProp.get(cache_obj, obj_prop)
    // console.log(JSON.stringify(obj, null, 4))

    let api_spec = dotProp.get(obj, `apis_by_method.${api_context.api_method}.${api_context.api_endpoint}.api_spec`)
    if (!api_spec) {
        let msg = `ERROR: api_spec not found - [${JSON.stringify(api_context)}] !`
        log_api_status(api_context, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        fatal = true
        return
    }

    let verb = dotProp.get(api_spec, 'syntax.verb')
    let join = dotProp.get(api_spec, 'syntax.join')

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

    // process select attrs
    Object.keys(obj_attrs).forEach((obj_attr, i) => {
        select_attrs[`${obj_attr}`] = `\`${api_context.obj_name}\`.\`${obj_attr}\``
    });

    // process join statement
    let lookup_tables = [ api_context.obj_name ]
    if (join) {
        join.forEach((join_spec, i) => {

            let join_name = join_spec['obj']
            let join_type = join_spec['type']

            // process join obj attributes
            let join_obj_prop = `object.${api_context.namespace}.runtimes.${api_context.runtime_name}.deployments.${api_context.app_name}.objs.${join_name}`
            let join_obj = dotProp.get(cache_obj, join_obj_prop)
            if (!join_obj) {
                let msg = `ERROR: failed to retrieve join obj [${join_name}] !`
                log_api_status(api_context, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                fatal = true
                return
            }

            let join_obj_attrs = dotProp.get(join_obj, `attrs`)
            if (!join_obj_attrs) {
                let msg = `ERROR: failed to retrieve attrs for join obj [${join_name}] !`
                log_api_status(api_context, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                fatal = true
                return
            }

            Object.keys(join_obj_attrs).forEach((join_attr, i) => {
                if (! (join_attr in select_attrs)) {
                    select_attrs[`${join_attr}`] = `\`${join_name}\`.\`${join_attr}\``
                }
            });

            // process relations
            let relation_spec = null

            let lookup_tables = [api_context.obj_name, ...Object.keys(join_tables)]
            // console.log(lookup_tables)
            for (let i=0; i<lookup_tables.length; i++) {

                // lookup_name
                let lookup_name = lookup_tables[i]

                // lookup_obj
                let lookup_obj_prop = `object.${api_context.namespace}.runtimes.${api_context.runtime_name}.deployments.${api_context.app_name}.objs.${lookup_name}`
                let lookup_obj = dotProp.get(cache_obj, lookup_obj_prop)
                if (!lookup_obj) {
                    let msg = `ERROR: failed to retrieve lookup obj [${lookup_name}] !`
                    log_api_status(api_context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return
                }

                // lookup_obj_attrs
                let lookup_obj_attrs = dotProp.get(lookup_obj, `attrs`)
                if (!lookup_obj_attrs) {
                    let msg = `ERROR: failed to retrieve attrs for other obj [${lookup_tables[i]}] !`
                    log_api_status(api_context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return
                }

                // lookup_relations
                let lookup_relations_1ton = dotProp.get(lookup_obj, `relations_1ton`)
                let lookup_relations_nto1 = dotProp.get(lookup_obj, `relations_nto1`)

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
                    log_api_status(api_context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return
                }

                relation_attrs = []
                relation_spec['attrs'].forEach((rel_attr, i) => {

                    if (! (rel_attr.src in lookup_obj_attrs)) {
                        return
                    }
                    if (! (rel_attr.tgt in join_obj_attrs)) {
                        return
                    }

                    let src = `\`${api_context.obj_name}\`.\`${rel_attr.src}\``
                    let tgt = `\`${join_name}\`.\`${rel_attr.tgt}\``

                    relation_attrs.push({
                        src: src,
                        tgt: tgt
                    })
                });

                // we are here if relation_spec is found
                if (relation_attrs.length == 0) {
                    let msg = `ERROR: empty relation attrs for join obj [${join_name}] - relation_spec [${JSON.stringify(relation_spec)}] !`
                    log_api_status(api_context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return
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
                log_api_status(api_context, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                fatal = true
                return
            }
        });
    }

    // cut short if fatal
    if (fatal) {
        return { fatal: fatal }
    }

    // process req.params
    let params = req.params || {}
    Object.keys(params).forEach((param_key, i) => {

        if (! (param_key in select_attrs)) {
            let msg = `ERROR: param_key not found [${param_key}] - [${api_context.api_endpoint}] !`
            log_api_status(api_context, FAILURE, msg)
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            fatal = true
            return
        }

        let where_clause = {
            attr: select_attrs[param_key],
            value: params[param_key]
        }

        where_clauses.push(where_clause)
    });

    // process query string
    let queries = req.query || {}
    Object.keys(queries).forEach((query_key, i) => {
        if (query_key == '_sort') {

            let sortKeys = queries[query_key].split(",")
            sortKeys.forEach((sortKey, i) => {

                let regex = `^(${REGEX_VAR})(\\.${REGEX_VAR})*(\\((asc|desc)\\))?$`
                //console.log(sortKey)
                //console.log(regex)
                let match = sortKey.match(new RegExp(regex))
                //console.log(match)

                if (! match) {
                    let msg = `ERROR: unrecognized sort key [${sortKey}] - [${req.url}] !`
                    log_api_status(api_context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return
                }

                if (! (match[1] in select_attrs)) {
                    let msg = `ERROR: unable to find attr for sort key [${sortKey}] - [${req.url}] !`
                    log_api_status(api_context, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    fatal = true
                    return
                }

                order_bys.push({
                    attr: select_attrs[match[1]],
                    json_attr: match[2],
                    order: match[4] ? match[4] : 'asc'
                })
            });

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
                log_api_status(api_context, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                fatal = true
                return
            }

            if (! (match[1] in select_attrs)) {
                let msg = `ERROR: unable to find attr for query key [${query_key}] - [${req.url}] !`
                log_api_status(api_context, FAILURE, msg)
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
    });

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
function handle_get(api_context, req, res) {

    let parsed = parse_get(api_context, req, res)

    if (parsed.fatal) {
        return
    }

    // select
    let sql = "SELECT "
    Object.keys(parsed.select_attrs).forEach((attr, i) => {
        sql = sql + `${parsed.select_attrs[attr]}, `
    });
    sql = sql + `\`${api_context.obj_name}\`.\`id\``
    sql = sql + ` FROM \`${api_context.obj_name}\``

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
            sql = sql + ` AND ${join_attr.src} = ${join_attr.tgt}`
        });
    });

    // where statement
    sql = sql + ` WHERE \`${api_context.obj_name}\`.\`deleted\` = 0`

    let sql_params = []
    parsed.where_clauses.forEach((where_clause, i) => {
        if (where_clause.json_attr) {
            sql = sql + ` AND JSON_EXTRACT(${where_clause.attr}, '\$${where_clause.json_attr}') = ?`
        } else {
            sql = sql + ` AND ${where_clause.attr} = ?`
        }
        sql_params.push(`${where_clause.value}`)
    });

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
        });
    }

    // limit
    if (parsed.limit) {
        sql = sql + ` LIMIT ${parsed.limit._start}, ${parsed.limit._limit}`
    }

    // log the sql and run query
    console.log(`INFO: ${sql}, [${sql_params}]`)
    let result = db.query_sync(sql, sql_params)

    // send back the result
    res.status(200).send(JSON.stringify(result, null, 4))
}

// export
module.exports = {
    handle_get: handle_get
}
