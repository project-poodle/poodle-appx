const dotProp = require('dot-prop')
const Mustache = require('mustache');

const INVOKE_KEY = '$invoke'

const REGEX_VAR = '[_a-zA-Z][_a-zA-Z0-9]*'
const REGEX_OBJ = REGEX_VAR + '(\\.' + REGEX_VAR + ')*'
const REGEX_FNC = REGEX_OBJ + '\\s*\\(\\s*' + REGEX_OBJ + '\\s*(\\s*,\\s*' + REGEX_OBJ + '\\s*)*' + '\\s*\\)'
const REGEX_FNC2 = REGEX_OBJ + '\\s*\\(\\s*(' + REGEX_FNC + '|' + REGEX_OBJ + ')\\s*(\\s*,\\s*(' + REGEX_FNC + '|' + REGEX_OBJ + ')\\s*)*' + '\\s*\\)'
const REGEX_FNC3 = REGEX_OBJ + '\\s*\\(\\s*(' + REGEX_FNC2 + '|' + REGEX_FNC + '|' + REGEX_OBJ + ')\\s*(\\s*,\\s*(' + REGEX_FNC2 + '|' + REGEX_FNC + '|' + REGEX_OBJ + ')\\s*)*' + '\\s*\\)'
const KEY_SUFFIX = '__k'

/**
 * evaluate expression with context
 */
function eval_with_input(expr, ctx) {

    // if not string, just return eval(expr)
    if (typeof expr != 'string') {
        return eval(expr, ctx)
    }

    // substitute variable
    let regex = new RegExp('\\$(' + REGEX_VAR + ')', 'g');
    expr = expr.replace(regex, 'ctx.$1')

    // substitute key
    expr = expr.replace(new RegExp('\\@(' + REGEX_VAR + ')', 'g'), 'ctx.$1' + KEY_SUFFIX)

    // substitute nested keys
    while (expr.match(new RegExp('\\@(ctx\\.' + REGEX_VAR + '(' + KEY_SUFFIX + ')+)', 'g'))) {
        expr = expr.replace(new RegExp('\\@(ctx\\.' + REGEX_VAR + '(' + KEY_SUFFIX + ')+)', 'g'), '$1' + KEY_SUFFIX)
    }

    // substitute [] index
    while (expr.match(new RegExp('(' + REGEX_OBJ + '|' + REGEX_FNC + '|' + REGEX_FNC2 + '|' + REGEX_FNC3 + ')' + '\\[([^\\]]+)\\]'))) {
        // console.log(`eval(${expr})`)
        expr = expr.replace(new RegExp('(' + REGEX_OBJ + '|' + REGEX_FNC + '|' + REGEX_FNC2 + '|' + REGEX_FNC3 + ')' + '\\[([^\\]]+)\\]'), 'dotProp.get($1, $63, null)')
    }

    // console.log(`eval(${expr}), ${ctx}`)
    let r = eval(expr, ctx)
    //console.log(`eval(${expr}) => ${r}`)
    return r
}

/**
 * transform source json with transform spec, produce and return target json
 */
function json_transform(target, source, transform, context) {

    // create empty context if not already exist
    if (context == null || typeof context == 'undefined') {
        context = {}
    }

    // console.log('transform')
    // console.log(transform)

    if (Array.isArray(transform)) {

        let result = []
        transform.forEach((transform_value, i) => {

            result.push(json_transform(null, source, transform_value, context))
        });

        // update target with result array
        if (Array.isArray(target)) {
            while(target.length) {
                target.pop();
            }
            result.forEach((r, i) => {
                target.push(r)
            });
        } else {
            target = result
        }

        return target

    } else if (typeof transform === 'object' && transform !== null) {

        // let result = {}
        if (target == null) {
            target = {}
        }

        //console.log(`transform: ${JSON.stringify(transform, null, 4)}`)

        Object.keys(transform).forEach((transform_key, i) => {

            // render transform_key
            let transform_rendered_key = Mustache.render(transform_key, context)

            let tokens = transform_rendered_key.match(new RegExp('^([#-])(' + REGEX_VAR + ')\\{([^\\}]+)\\}(\\{\\?([^\\}]+)\\})*$')) || []
            // console.log(tokens)
            if (tokens.length > 3 && tokens[1] == "#") {

                let variable = tokens[2]
                let expr = tokens[3]

                // evaluate map
                let map = {}
                try {
                    map = eval_with_input(expr, source)
                } catch (error) {
                    console.log(`WARN: failed to evaluate { ${expr} } -- ${error.toString()}`)
                }

                if (typeof map === 'object' && map !== null) {

                    Object.keys(map).forEach((key, i) => {

                        // console.log('source')
                        // console.log(source)

                        let child_source = { ...source }
                        child_source[variable] = {}

                        // build child value
                        child_source[variable] = Object.assign(child_source[variable], map[key])

                        // build child key(s)
                        let key_idx = KEY_SUFFIX
                        while (variable in source && (variable + key_idx) in source) {
                            key_idx = key_idx + KEY_SUFFIX
                        }
                        while (key_idx.length > KEY_SUFFIX.length) {
                            let parent_idx = key_idx.substring(0, key_idx.length - KEY_SUFFIX.length)
                            child_source[variable + key_idx] = source[variable + parent_idx]
                            key_idx = parent_idx
                        }
                        child_source[variable + KEY_SUFFIX] = key

                        // update target
                        // console.log('child_source')
                        // console.log(child_source)
                        dotProp.set(target, key, json_transform(dotProp.get(target, key, null), child_source, transform[transform_key], context))
                    });

                } else if (map) {

                    throw `ERROR: unable to evaluate [${expr}] -- ${map}`
                }

            } else if (tokens.length > 3 && tokens[1] == "-") {

                let variable = tokens[2]
                let expr = tokens[3]

                let arr = []
                try {
                    arr = eval_with_input(Mustache.render(expr, context), source)
                } catch (error) {
                    console.log(`WARN: failed to evaluate { ${expr} } -- ${error.toString()}`)
                }

                let result = []
                if (Array.isArray(arr)) {

                    arr.forEach((value, i) => {

                        let child_source = { ...source }
                        child_source[variable] = {}

                        // build child value
                        child_source[variable] = value

                        // build child key(s)
                        let key_idx = KEY_SUFFIX
                        while (variable in source && (variable + key_idx) in source) {
                            key_idx = key_idx + KEY_SUFFIX
                        }
                        while (key_idx.length > KEY_SUFFIX.length) {
                            let parent_idx = key_idx.substring(0, key_idx.length - KEY_SUFFIX.length)
                            child_source[variable + key_idx] = source[variable + parent_idx]
                            key_idx = parent_idx
                        }
                        child_source[variable + KEY_SUFFIX] = i

                        // update result
                        result.push(json_transform(null, child_source, transform[transform_key], context))
                    });

                    // update target with result array
                    if (Array.isArray(target)) {
                        while(target.length) {
                            target.pop();
                        }
                        result.forEach((r, i) => {
                            target.push(r)
                        });
                    } else {
                        target = result
                    }

                } else {

                    throw `ERROR: unable to evaluate [${expr}] -- ${arr}`
                }

            } else {

                // console.log(`transform_rendered_key: ${transform_rendered_key} - transform_key: ${transform_key}`)
                dotProp.set(target, transform_rendered_key, json_transform(dotProp.get(target, transform_rendered_key, null), source, transform[transform_key], context))
            }
        });

        return target

    } else {

        if (transform == null || typeof transform == 'undefined') {
            return null
        } else if (typeof transform == 'string') {
            transform = Mustache.render(transform, context)
            return eval_with_input(transform, source)
        } else {
            return eval_with_input(transform, source)
        }
    }
}

/**
 * trigger json with trigger spec
 */
function json_trigger(data, trigger, context) {

    // console.log(`INFO: json_trigger(${data}, ${JSON.stringify(trigger)}, ${JSON.stringify(context)})`)

    // create empty context if not already exist
    if (context == null || typeof context == 'undefined') {
        context = {}
    }

    if (Array.isArray(trigger)) {

        trigger.forEach((trigger_value, i) => {

            json_trigger(data, trigger_value, context)
        });

    } else if (typeof trigger === 'object' && trigger !== null) {

        Object.keys(trigger).forEach((trigger_key, i) => {

            if (trigger_key == INVOKE_KEY) {

                // console.log(`INFO: json_trigger(${data}, ${JSON.stringify(trigger)}, ${JSON.stringify(context)})`)

                let mod = require(trigger[trigger_key]['module'])
                let func = mod[trigger[trigger_key]['method']]
                let params = json_transform(null, data, trigger[trigger_key]['params'], context)
                // call function
                try {
                    func.call(context, ...params)
                    console.log(`INFO: invoked [${trigger[trigger_key]['module']}/${trigger[trigger_key]['method']}] with ${JSON.stringify(params)} !`)
                } catch (err) {
                    console.log(`INFO: invoke failed ! [${err}] [${trigger[trigger_key]['module']}/${trigger[trigger_key]['method']}] with ${JSON.stringify(params)}`)
                } finally {
                    return
                }
            }

            // render trigger
            let trigger_rendered_key = Mustache.render(trigger_key, context)

            let tokens = trigger_rendered_key.match(new RegExp('^([#-])(' + REGEX_VAR + ')\\{([^\\}]+)\\}(\\{\\?([^\\}]+)\\})*$')) || []
            if (tokens.length > 3 && tokens[1] == "#") {

                let variable = tokens[2]
                let expr = tokens[3]

                // evaluate map
                let map = {}
                try {
                    map = eval_with_input(expr, data)
                } catch (error) {
                    console.log(`WARN: failed to evaluate { ${expr} } -- ${error.toString()}`)
                }

                if (typeof map === 'object' && map !== null) {

                    Object.keys(map).forEach((key, i) => {

                        // console.log('source')
                        // console.log(source)

                        let child_data = { ...data }
                        child_data[variable] = {}

                        // build child value
                        child_data[variable] = Object.assign(child_data[variable], map[key])

                        // build child key(s)
                        let key_idx = KEY_SUFFIX
                        while (variable in data && (variable + key_idx) in data) {
                            key_idx = key_idx + KEY_SUFFIX
                        }
                        while (key_idx.length > KEY_SUFFIX.length) {
                            let parent_idx = key_idx.substring(0, key_idx.length - KEY_SUFFIX.length)
                            child_data[variable + key_idx] = data[variable + parent_idx]
                            key_idx = parent_idx
                        }
                        child_data[variable + KEY_SUFFIX] = key

                        json_trigger(child_data, trigger[trigger_key], context)
                    });

                } else if (map) {

                    throw `ERROR: unable to evaluate [${expr}] -- ${map}`
                }

            } else if (tokens.length > 3 && tokens[1] == "-") {

                let variable = tokens[2]
                let expr = tokens[3]

                let arr = []
                try {
                    arr = eval_with_input(Mustache.render(expr, context), source)
                } catch (error) {
                    console.log(`WARN: failed to evaluate { ${expr} } -- ${error.toString()}`)
                }

                if (Array.isArray(arr)) {

                    arr.forEach((value, i) => {

                        let child_data = { ...data }
                        child_data[variable] = {}

                        // build child value
                        child_data[variable] = value

                        // build child key(s)
                        let key_idx = KEY_SUFFIX
                        while (variable in data && (variable + key_idx) in data) {
                            key_idx = key_idx + KEY_SUFFIX
                        }
                        while (key_idx.length > KEY_SUFFIX.length) {
                            let parent_idx = key_idx.substring(0, key_idx.length - KEY_SUFFIX.length)
                            child_data[variable + key_idx] = data[variable + parent_idx]
                            key_idx = parent_idx
                        }
                        child_data[variable + KEY_SUFFIX] = i

                        // update result
                        json_trigger(child_data, trigger[trigger_key], context)
                    });

                } else {

                    throw `ERROR: unable to evaluate [${expr}] -- ${arr}`
                }

            } else {

                json_trigger(data, trigger[trigger_key], context)
            }
        });

    } else {

        return
    }
}

module.exports = {
    json_transform: json_transform,
    json_trigger: json_trigger
}
