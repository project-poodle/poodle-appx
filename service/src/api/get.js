const dotProp = require('dot-prop')
const db = require('../db/db')
const cache = require('../cache/cache')
const { log_api_status } = require('./router')


const handle_get = (api_result, req, res) => {
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
        res.status(422).send(JSON.stringify({error: msg}))
        return
    }

    // let obj_attrs = dotProp.get(obj, `attrs.${api_result.obj_name}`)
    let obj_attrs = dotProp.get(obj, `attrs`)
    if (!obj_attrs) {
        let msg = `ERROR: failed to retrieve attrs for obj [${api_result.obj_name}] !`
        log_api_status(api_result, FAILURE, msg)
        res.status(422).send(JSON.stringify({error: msg}))
        return
    }

    // generate sql statement
    let select_attrs = {}
    let join_tables = []

    // process select statement
    Object.keys(obj_attrs).forEach((obj_attr, i) => {
        select_attrs[`${obj_attr}`] = `\`${api_result.obj_name}\`.\`${obj_attr}\``
    });

    // process join statement
    if (join) {
        join.forEach((join_obj, i) => {

            let other_name = join_obj['obj']
            let join_type = join_obj['type']
            let join_table = {
                name: other_name,
                type: join_type,
                attrs: []
            }

            // process attributes
            let other_obj_prop = `object.${api_result.namespace}.runtimes.${api_result.runtime_name}.deployments.${api_result.app_name}.objs.${other_name}`
            let other_obj = dotProp.get(cache_obj, other_obj_prop)
            let other_obj_attrs = dotProp.get(other_obj, `attrs`)
            if (!other_obj_attrs) {
                let msg = `ERROR: failed to retrieve attrs for other obj [${other_name}] !`
                log_api_status(api_result, FAILURE, msg)
                res.status(422).send(JSON.stringify({error: msg}))
                return
            }

            Object.keys(other_obj_attrs).forEach((obj_attr, i) => {
                if (! (obj_attr in select_attrs)) {
                    select_attrs[`${obj_attr}`] = `\`${other_name}\`.\`${obj_attr}\``
                }
            });

            // process join tables
            join_tables.push(join_table)

            let relation_spec = {}
            if (other_name in relations_1ton) {
                relation_spec = relations_1ton[other_name]['relation_spec']
            } else if (other_name in relations_nto1) {
                relation_spec = relations_nto1[other_name]['relation_spec']
            } else {
                let msg = `ERROR: cannot find relation for join obj [${other_name}] - [${JSON.stringify(api_result.api_spec)}] !`
                log_api_status(api_result, FAILURE, msg)
                res.status(422).send(JSON.stringify({error: msg}))
                return
            }

            // we are here if relation_spec is found
            if (! ('attrs' in relation_spec) || !Array.isArray(relation_spec['attrs'])) {
                let msg = `ERROR: cannot parse relation for join obj [${other_name}] - relation_spec [${JSON.stringify(relation_spec)}] !`
                log_api_status(api_result, FAILURE, msg)
                res.status(422).send(JSON.stringify({error: msg}))
                return
            }

            relation_spec['attrs'].forEach((rel_attr, i) => {

                if (! (rel_attr.src in obj_attrs)) {
                    return
                }
                if (! (rel_attr.tgt in other_obj_attrs)) {
                    return
                }

                let src = `\`${api_result.obj_name}\`.\`${rel_attr.src}\``
                let tgt = `\`${other_name}\`.\`${rel_attr.tgt}\``

                join_table.attrs.push({
                    src: src,
                    tgt: tgt
                })
            });
        });
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
