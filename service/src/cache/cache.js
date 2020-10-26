const fs = require('fs');
const YAML = require('yaml')
const dotProp = require('dot-prop')
const { sql_load } = require('../transform/sql_load')
const { json_transform, json_trigger } = require('../transform/json_transform')

// utility method
function get_random_between(min, max) {
    return min + Math.random() * Math.abs(max - min)
}

// cache_vars
const CACHE_VARS = {}

// cache conf
var cache_conf = YAML.parse(fs.readFileSync(__dirname + '/cache.yaml', 'utf8'))

// initialize cache
function init_cache() {

    try {

        cache_conf = YAML.parse(fs.readFileSync(__dirname + '/cache.yaml', 'utf8'))

        Object.keys(cache_conf).forEach((name, i) => {

            // load cache without parameters
            if (! (cache_conf[name]['params'])) {
                load_cache_for(name, null)
            }
        });

    } catch (e) {

        console.log(e.stack)
        console.log(`ERROR: ${__filename} init_cache -- ${e.toString()}`)

    } finally {

        let sleep = get_random_between(60, 120) * 1000
        setTimeout(() => { init_cache() }, sleep)
        // console.log(`INFO: init_cache - reconcile in ${Math.round(sleep/1000)} sec(s)`)
    }
}

function get_cache_for(name, params) {

    if (name in CACHE_VARS) {
        return CACHE_VARS[name]
    } else {
        return null
    }
}

function load_cache_for(name, params) {

    // console.log(`INFO: load_cache_for("${name}", ${JSON.stringify(params)}) - starting ...`)

    if (! (name in CACHE_VARS)) {
        CACHE_VARS[name] = {}
    }

    try {
        if (! ('sql_input' in cache_conf[name])) {
            console.log(`ERROR: [sql_input] not configured for ${name}`)
            return
        }

        let sql_filepath = __dirname + '/' + cache_conf[name].sql_input
        if (! fs.existsSync(sql_filepath)) {
            console.log(`ERROR: filepath [${sql_filepath}] not found for ${name}`)
            return
        }

        let input = sql_load(sql_filepath, {params: params})
        //console.log(JSON.stringify(input, null, 4))

        if (! ('transform' in cache_conf[name])) {
            console.log(`ERROR: [transform] not configured for ${name}`)
            return
        }

        let transform_filepath = __dirname + '/' + cache_conf[name].transform
        if (! fs.existsSync(transform_filepath)) {
            console.log(`ERROR: filepath [${transform_filepath}] not found for ${name}`)
            return
        }

        let transform = YAML.parse(fs.readFileSync(transform_filepath, 'utf8'))
        //console.log(JSON.stringify(transform, null, 4))

        let result = json_transform(dotProp.get(CACHE_VARS, name, null), input, transform, {params: params})
        // console.log(JSON.stringify(result, null, 4))

        // assign CACHE_VARS only if params is null
        if (! (params)) {
            CACHE_VARS[name] = Object.assign(CACHE_VARS[name], result)
        }

        console.log(`INFO: load_cache_for("${name}", ${JSON.stringify(params)}) - success !`)

        // run triggers
        if ('trigger' in cache_conf[name]) {

            console.log(`INFO: load_cache_for("${name}", ${JSON.stringify(params)}) - triggering ...`)
            // console.log(`INFO: CACHE_VARS[${name}] ${JSON.stringify(CACHE_VARS[name])}`)

            json_trigger(CACHE_VARS, cache_conf[name]['trigger'], {params: params})
        }

        return result

    } catch (e) {

        console.log(e.stack)
        console.log(`ERROR: load_cache_for("${name}", ${JSON.stringify(params)}) - failed ! -- ${e.toString()}`)

    } finally {

        let min = 60
        if ('reconcile' in cache_conf[name] && 'min' in cache_conf[name].reconcile) {
            min = Math.min(Math.max(cache_conf[name].reconcile.min, 60), 300)
        }

        let max = 300
        if ('reconcile' in cache_conf[name] && 'max' in cache_conf[name].reconcile) {
            max = Math.max(min, Math.min(Math.max(cache_conf[name].reconcile.max, 120), 600))
        }

        let sleep = get_random_between(min, max) * 1000
        setTimeout(() => { load_cache_for(name, params) }, sleep)
        console.log(`INFO: load_cache_for("${name}", ${JSON.stringify(params)}) - reconcile in ${Math.round(sleep/1000)} sec(s)`)
    }
}

module.exports = {
    get_cache_for: get_cache_for,
    load_cache_for: load_cache_for
}

init_cache()
