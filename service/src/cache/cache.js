const fs = require('fs');
const YAML = require('yaml')
const { sql_load } = require('../transform/sql_load')
const { json_transform } = require('../transform/json_transform')

var CACHE_VARS = {}
var CACHE_EXPORTS = {}

var cache_conf = YAML.parse(fs.readFileSync(__dirname + '/cache.yaml', 'utf8'))

function get_random_between(min, max) {
    return min + Math.random() * Math.abs(max - min)
}

function load_cache_conf() {

    try {

        cache_conf = YAML.parse(fs.readFileSync(__dirname + '/cache.yaml', 'utf8'))

        Object.keys(cache_conf).forEach((name, i) => {

            // load CACHE_VARS if not already loaded
            if (! (name in CACHE_VARS)) {
                load_cache_for(name)
            }

            CACHE_EXPORTS[name] = () => {
                return CACHE_VARS[name]
            }
        });

    } catch (e) {

        console.log(e.stack)
        console.log(`ERROR: ${__filename} load_cache_conf -- ${e.toString()}`)

    } finally {

        let sleep = get_random_between(60, 120) * 1000
        // console.log(`INFO: load_cache_conf - sleep for ${Math.round(sleep/1000)} sec(s)`)
        setTimeout(() => { load_cache_conf() }, sleep)
    }
}

function load_cache_for(name) {

    try {
        let input = sql_load(__dirname + '/' + cache_conf[name].sql_input)
        //console.log(JSON.stringify(input, null, 4))

        let transform = YAML.parse(fs.readFileSync(__dirname + '/' + cache_conf[name].transform, 'utf8'))
        //console.log(JSON.stringify(transform, null, 4))

        let result = json_transform(transform, input)
        //console.log(JSON.stringify(result, null, 4))

        CACHE_VARS[name] = result
        console.log(`INFO: load_cache_for("${name}") - success !`)

        return result

    } catch (e) {

        console.log(e.stack)
        console.log(`ERROR: ${__filename} load_cache_for("${name}") -- ${e.toString()}`)

    } finally {

        let sleep = get_random_between(cache_conf[name].refresh.min, cache_conf[name].refresh.max) * 1000
        console.log(`INFO: load_cache_for("${name}") - sleep for ${Math.round(sleep/1000)} sec(s)`)
        setTimeout(() => { load_cache_for(name) }, sleep)
    }
}


load_cache_conf()

module.exports = CACHE_EXPORTS
