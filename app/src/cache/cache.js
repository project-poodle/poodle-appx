const fs = require('fs');
const YAML = require('yaml')
const objPath = require("object-path")
var SHA256 = require("crypto-js/sha256");
const { sql_load } = require('../transform/sql_load')
const { json_transform, json_trigger } = require('../transform/json_transform')

// utility method
function get_random_between(min, max) {
    return min + Math.random() * Math.abs(max - min)
}

// cache_vars
const CACHE_VARS = {}
const LOAD_CACHE_TIMER_TASKS = {}

// cache conf
var cache_conf = YAML.parse(fs.readFileSync(__dirname + '/cache.yaml', 'utf8'))

// initialize cache
async function init_cache() {

    try {

        cache_conf = YAML.parse(fs.readFileSync(__dirname + '/cache.yaml', 'utf8'))

        for (const name of Object.keys(cache_conf)) {

            // load cache without parameters
            if (! (cache_conf[name]['params'])) {
                await load_cache_for(name, null)
            }
        }

    } catch (e) {

        console.log(e.stack)
        console.log(`ERROR: ${__filename} init_cache -- ${e.toString()}`)

    } finally {

        let sleep = get_random_between(180, 360) * 1000
        setTimeout(() => { init_cache() }, sleep)
        // console.log(`INFO: init_cache - reconcile in ${Math.round(sleep/1000)} sec(s)`)
    }
}

// get all cache
function get_all_cache() {
    return CACHE_VARS
}

function get_cache_for(name, params) {

    if (name in CACHE_VARS) {
        return CACHE_VARS[name]
    } else {
        return null
    }
}

async function load_cache_for(name, params, repeat=false) {

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

        let input = await sql_load(sql_filepath, {params: params})
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

        let result = json_transform(objPath.get(CACHE_VARS, [name], null), input, transform, {params: params})
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

            await json_trigger(CACHE_VARS, cache_conf[name]['trigger'], {params: params})
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

        // check if repeat is needed
        let timer_key = SHA256(name + JSON.stringify(params, params ? Object.keys(params).sort() : null, 4))
        if (! (timer_key in LOAD_CACHE_TIMER_TASKS) || repeat) {
            setTimeout(() => { load_cache_for(name, params, true) }, sleep)
            LOAD_CACHE_TIMER_TASKS[timer_key] = true
            console.log(`INFO: load_cache_for("${name}", ${JSON.stringify(params)}) - reconcile in ${Math.round(sleep/1000)} sec(s)`)
        // } else {
            // console.log(`INFO: load_cache_for("${name}", ${JSON.stringify(params)})`)
        }
    }
}

module.exports = {
    init_cache: init_cache,
    get_all_cache: get_all_cache,
    get_cache_for: get_cache_for,
    load_cache_for: load_cache_for,
}

// init_cache()
