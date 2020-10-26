const dotProp = require('dot-prop')
const db = require('../db/db')
const cache = require('../cache/cache')
const { log_api_status, SUCCESS, FAILURE } = require('./util')


function handle_get(api_result, req, res) {

    let terminal = false

    // console.log(cache.get_cache_for('object'))
    let cache_obj = cache.get_cache_for('object')

    let obj_prop = `object.${api_result.namespace}.runtimes.${api_result.runtime_name}.deployments.${api_result.app_name}.objs.${api_result.obj_name}`
    let obj = dotProp.get(cache_obj, obj_prop)
    // console.log(JSON.stringify(obj, null, 4))

    let relations_1ton = dotProp.get(obj, `relations_1ton`)
    let relations_nto1 = dotProp.get(obj, `relations_nto1`)

    let verb = dotProp.get(api_result.api_spec, 'syntax.verb')
    let join = dotProp.get(api_result.api_spec, 'syntax.join')

    if (!verb) {
        let msg = `ERROR: api syntax missing verb - [${JSON.stringify(api_result.api_spec)}] !`
        log_api_status(api_result, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        terminal = true
        return
    }

    // let obj_attrs = dotProp.get(obj, `attrs.${api_result.obj_name}`)
    let obj_attrs = dotProp.get(obj, `attrs`)
    if (!obj_attrs) {
        let msg = `ERROR: failed to retrieve attrs for obj [${api_result.obj_name}] !`
        log_api_status(api_result, FAILURE, msg)
        res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
        terminal = true
        return
    }

    // generate sql statement
    let select_attrs = {}
    let join_tables = []
    let lookup_tables = [ api_result.obj_name ]

    // process select statement
    Object.keys(obj_attrs).forEach((obj_attr, i) => {
        select_attrs[`${obj_attr}`] = `\`${api_result.obj_name}\`.\`${obj_attr}\``
    });

    // process join statement
    if (join) {
        join.forEach((join_spec, i) => {

            let join_name = join_spec['obj']
            let join_type = join_spec['type']

            // process join obj attributes
            let join_obj_prop = `object.${api_result.namespace}.runtimes.${api_result.runtime_name}.deployments.${api_result.app_name}.objs.${join_name}`
            let join_obj = dotProp.get(cache_obj, join_obj_prop)
            if (!join_obj) {
                let msg = `ERROR: failed to retrieve join obj [${join_name}] !`
                log_api_status(api_result, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                terminal = true
                return
            }

            let join_obj_attrs = dotProp.get(join_obj, `attrs`)
            if (!join_obj_attrs) {
                let msg = `ERROR: failed to retrieve attrs for join obj [${join_name}] !`
                log_api_status(api_result, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                terminal = true
                return
            }

            Object.keys(join_obj_attrs).forEach((join_attr, i) => {
                if (! (join_attr in select_attrs)) {
                    select_attrs[`${join_attr}`] = `\`${join_name}\`.\`${join_attr}\``
                }
            });

            // process relations
            let relation_spec = null

            let lookup_tables = [api_result.obj_name, ...join_tables.map((item)=>{return item.name})]
            console.log(lookup_tables)
            for (let i=0; i<lookup_tables.length; i++) {

                // lookup_name
                let lookup_name = lookup_tables[i]

                let join_table = {
                    name: join_name,
                    type: join_type,
                    attrs: []
                }

                // lookup_obj
                let lookup_obj_prop = `object.${api_result.namespace}.runtimes.${api_result.runtime_name}.deployments.${api_result.app_name}.objs.${lookup_name}`
                let lookup_obj = dotProp.get(cache_obj, lookup_obj_prop)
                if (!lookup_obj) {
                    let msg = `ERROR: failed to retrieve lookup obj [${lookup_name}] !`
                    log_api_status(api_result, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    terminal = true
                    return
                }

                // lookup_obj_attrs
                let lookup_obj_attrs = dotProp.get(lookup_obj, `attrs`)
                if (!lookup_obj_attrs) {
                    let msg = `ERROR: failed to retrieve attrs for other obj [${lookup_tables[i]}] !`
                    log_api_status(api_result, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    terminal = true
                    return
                } else {
                    console.log(lookup_obj_attrs)
                }

                // add attr to select if not already exist
                //Object.keys(lookup_obj_attrs).forEach((lookup_attr, i) => {
                //    if (! (lookup_attr in select_attrs)) {
                //        select_attrs[`${lookup_attr}`] = `\`${lookup_name}\`.\`${lookup_attr}\``
                //    }
                //});

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
                    log_api_status(api_result, FAILURE, msg)
                    res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                    terminal = true
                    return
                }

                relation_spec['attrs'].forEach((rel_attr, i) => {

                    if (! (rel_attr.src in lookup_obj_attrs)) {
                        return
                    }
                    if (! (rel_attr.tgt in join_obj_attrs)) {
                        return
                    }

                    let src = `\`${api_result.obj_name}\`.\`${rel_attr.src}\``
                    let tgt = `\`${join_name}\`.\`${rel_attr.tgt}\``

                    join_table.attrs.push({
                        src: src,
                        tgt: tgt
                    })
                });

                // add join table
                join_tables.push(join_table)
            }

            // if relation_spec not found
            if (! relation_spec) {
                let msg = `ERROR: cannot find relation for join obj [${join_name}] - [${JSON.stringify(api_result.api_spec)}] !`
                log_api_status(api_result, FAILURE, msg)
                res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
                terminal = true
                return
            }
        });
    }

    if (terminal) {
        return
    }

    // select
    let sql = "SELECT "
    Object.keys(select_attrs).forEach((attr, i) => {
        sql = sql + `${select_attrs[attr]}, `
    });
    sql = sql + `\`${api_result.obj_name}\`.\`id\``
    sql = sql + ` FROM \`${api_result.obj_name}\``

    // join
    join_tables.forEach((join_table, i) => {
        if (join_table.type) {
            sql = sql + ` ${join_table.type.toUpperCase()} JOIN \`${join_table.name}\``
        } else {
            sql = sql + ` JOIN \`${join_table.name}\``
        }
        sql = sql + ` ON \`${join_table.name}\`.\`deleted\` = 0`
        join_table.attrs.forEach((join_attr, i) => {
            sql = sql + ` AND ${join_attr.src} = ${join_attr.tgt}`
        });
    });

    // where statement
    sql = sql + ` WHERE \`${api_result.obj_name}\`.\`deleted\` = 0`

    // log the sql and run query
    console.log(`INFO: ${sql}`)
    let result = db.query_sync(sql)

    // send back the result
    res.status(200).send(JSON.stringify(result, null, 4))
}

// export
module.exports = {
    handle_get: handle_get
}
