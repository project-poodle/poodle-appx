const fs = require('fs')
const YAML = require('yaml')
const objPath = require("object-path")
const Mustache = require('mustache');
const db = require('../db/db')

try {
    db.getPool(__dirname + '/../../conf.d/mysql_appx.json')
} catch (err) {
    console.warn(`WARN: ${err.toString()}`)
}

/**
 * load sql data
 */
async function sql_load(filepath, context) {

    // console.log(`INFO: sql_load(${filepath}, ${JSON.stringify(context)})`)

    // create empty context if not already exist
    if (context == null || typeof context == 'undefined') {
        context = {}
    }

    let variables = {}

    definition = YAML.parse(fs.readFileSync(filepath, 'utf8'))
    for (const def of definition) {

        let results = null
        let sql = null
        try {
          //console.log(JSON.stringify(def, null, 4))
          sql = Mustache.render(def.query, context)
          results = await db.query_async(sql, [])
        } catch (err) {
          console.log(`ERROR: Failed to load [${sql}] ${JSON.stringify(def)}`)
          console.log(err)
          throw err
        }

        if ('map_def' in def) {

            def.map_def.forEach((map_def, i) => {

                let map = {}
                results.forEach((result, i) => {

                    let curr_map = map
                    map_def.key.forEach((k, i) => {

                        let key = eval(Mustache.render(k, context).replace(/\$@/g, 'result'))
                        if (! (key in curr_map)) {
                            curr_map[key] = {}
                        }

                        curr_map = curr_map[key]
                    });

                    let value = eval(Mustache.render(map_def.value, context).replace(/\$@/g, 'result'))
                    Object.assign(curr_map, value)
                });

                objPath.set(variables, [map_def.name], map)
            });
        }

        if ('arr_def' in def) {

            def.arr_def.forEach((arr_def, i) => {

                let arr = []
                results.forEach((result, i) => {
                    arr.push(eval(Mustache.render(arr_def.value, context).replace(/\$@/g, 'result')))
                });

                objPath.set(variables, arr_def.name, arr)
            });
        }
    }

    return variables
}

module.exports = {
    sql_load: sql_load
}
