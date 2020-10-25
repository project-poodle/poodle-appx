const fs = require('fs')
const YAML = require('yaml')
const dotProp = require('dot-prop')
const db = require('../db/db')

db.getPool("../../conf.d/mysql_appx.json")

function load_sql(filepath) {

    let variables = {}

    definition = YAML.parse(fs.readFileSync(filepath, 'utf8'))
    definition.forEach((def, i) => {

        //console.log(JSON.stringify(def, null, 4))
        let results = db.query_sync(def.query, [])

        if ('map_def' in def) {

            def.map_def.forEach((map_def, i) => {

                let map = {}
                results.forEach((result, i) => {

                    let curr_map = map
                    map_def.key.forEach((k, i) => {

                        let key = eval(k.replace(/\$@/g, 'result'))
                        if (! (key in curr_map)) {
                            curr_map[key] = {}
                        }

                        curr_map = curr_map[key]
                    });

                    let value = eval(map_def.value.replace(/\$@/g, 'result'))
                    Object.assign(curr_map, value)
                });

                dotProp.set(variables, map_def.name, map)
            });
        }



        if ('arr_def' in def) {

            def.arr_def.forEach((arr_def, i) => {

                let arr = []
                results.forEach((result, i) => {
                    arr.push(eval(arr_def.value.replace(/\$@/g, 'result')))
                });

                dotProp.set(variables, arr_def.name, arr)
            });
        }
    });

    return variables
}

module.exports = {
    load_sql: load_sql
}
