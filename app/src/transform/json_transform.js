const esprima = require('esprima')
const escodegen = require('escodegen')
const objPath = require("object-path")
const Mustache = require('mustache')

const INVOKE_KEY = '$invoke'

const REGEX_VAR = '[_a-zA-Z][_a-zA-Z0-9]*'
const KEY_SUFFIX = '__k'

// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
}

// JavaScript AST representation of [objPath.get]
const ast_objPath_get = {
    "type": "MemberExpression",
    "computed": false,
    "object": {
        "type": "Identifier",
        "name": "objPath"
    },
    "property": {
        "type": "Identifier",
        "name": "get"
    }
}

// JavaScript AST representation of [null]
const ast_null = {
    "type": "Literal",
    "value": null,
    "raw": "null"
}

// traverse with objPath
function traverse_with_obj_path(input) {

    if (isPrimitive(input)) {

        return input

    } else if (Array.isArray(input)) {

        let result = []

        for (let child of input) {

            result.push(traverse_with_obj_path(child))
        }

    } else if (typeof input === 'object' && input !== null) {

        let result = {}

        if (('type' in input) && ('object' in input) && ('property' in input) && (input.type == 'MemberExpression')) {

            result.type = 'CallExpression'
            result.callee = { ...ast_objPath_get }

            // process object
            let object = traverse_with_obj_path(input.object)

            // process property
            let property = { ...input.property }
            if ('name' in property && 'type' in property && property.type == 'Identifier') {
                // change Identifier property to Literal
                property = {
                    type: 'Literal',
                    value: property.name,
                    // raw: `'${property.name}'`
                }
            } else {
                // process all other property type normally
                property = traverse_with_obj_path(property)
            }

            result.arguments = [
                object,
                property,
                { ...ast_null }
            ]

        } else {

            for (let key in input) {
                result[key] = traverse_with_obj_path(input[key])
            }
        }

        return result

    } else if (input == null) {

        return null

    } else {

        throw new Error(`Unrecognized input [${input}]`)
    }
}

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

    // we have a valid JavaScript expression here, replace MemberExpression with CallExpression
    let ast_tree = esprima.parse(expr).body[0]
    let converted_tree = traverse_with_obj_path(ast_tree)
    let converted_expr = escodegen.generate(converted_tree)

    // console.log(`eval(${expr}), ${ctx}`)
    let r = eval(converted_expr, ctx)
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
                        objPath.set(target, [key], json_transform(objPath.get(target, [key], null), child_source, transform[transform_key], context))
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
                objPath.set(target, [transform_rendered_key], json_transform(objPath.get(target, [transform_rendered_key], null), source, transform[transform_key], context))
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
async function json_trigger(data, trigger, context) {

    // console.log(`INFO: json_trigger(${data}, ${JSON.stringify(trigger)}, ${JSON.stringify(context)})`)

    // create empty context if not already exist
    if (context == null || typeof context == 'undefined') {
        context = {}
    }

    if (Array.isArray(trigger)) {

        for (const trigger_value of trigger) {

            await json_trigger(data, trigger_value, context)
        }

    } else if (typeof trigger === 'object' && trigger !== null) {

        for (const trigger_key of Object.keys(trigger)) {

            if (trigger_key == INVOKE_KEY) {

                // console.log(`INFO: json_trigger(${data}, ${JSON.stringify(trigger)}, ${JSON.stringify(context)})`)

                let mod = require(trigger[trigger_key]['module'])
                let func = mod[trigger[trigger_key]['method']]
                const isAsync = func.constructor.name === 'AsyncFunction'
                let params = json_transform(null, data, trigger[trigger_key]['params'], context)
                // call function
                try {
                    if (isAsync) {
                      // console.log(`async function detected`)
                      await func.call(context, ...params)
                    } else {
                      func.call(context, ...params)
                    }
                    console.log(`INFO: invoke successful ! [${trigger[trigger_key]['module']}/${trigger[trigger_key]['method']}] with ${JSON.stringify(params)} !`)
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

                    for (const key of Object.keys(map)) {

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

                        await json_trigger(child_data, trigger[trigger_key], context)
                    }

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

                    for (const value of arr) {

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
                        await json_trigger(child_data, trigger[trigger_key], context)
                    }

                } else {

                    throw `ERROR: unable to evaluate [${expr}] -- ${arr}`
                }

            } else {

                await json_trigger(data, trigger[trigger_key], context)
            }
        }

    } else {

        return
    }
}

module.exports = {
    json_transform: json_transform,
    json_trigger: json_trigger
}
