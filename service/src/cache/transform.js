const fs = require('fs');
const YAML = require('yaml')
const { load_sql } = require('./load_sql')

// let re = /(\#|\@|\$|\+{1,2}|\-{1,2}|\*{1,2}|\/|\&{1,2}|\|{1,2}|\^|\!|\~|={1,3}|\?|\:|\[|\]|\(|\)|\{|\}|[A-Za-z_][A-Za-z_0-9]*)+/

const REGEX_VAR = '[_a-zA-Z][_a-zA-Z0-9]*'
const KEY_SUFFIX = '__key'

expr = "$deployments_by_app[@namespaces][@@apps]"

function eval_with_context(expr, ctx) {

    // substitute variable
    expr = expr.replace(new RegExp('\\$(' + REGEX_VAR + ')/g'), 'ctx.$1')

    // substitute key
    expr = expr.replace(new RegExp('\\@(' + REGEX_VAR + ')/g'), 'ctx.$1.' + KEY_SUFFIX)

    // substitute nested keys
    while (expr.match(new RegExp('\\@(ctx\\.' + REGEX_VAR + '\\.(' + KEY_SUFFIX + ')+)/g'))) {
        expr = expr.replace(new RegExp('\\@(ctx\\.' + REGEX_VAR + '\\.(' + KEY_SUFFIX + ')+)/g'), 'ctx.$1' + KEY_SUFFIX)
    }

    console.log(expr)
    return eval(expr, ctx)
}

function transform_json(transform, context) {

    if (Array.isArray(transform)) {

        let result = []
        transform.forEach((transform_value, i) => {
            result.append(transform_json(transform_value, context))
        });

        return result

    } else {

        let result = {}
        Object.keys(transform).forEach((transform_key, i) => {

            let tokens = transform_key.match(new RegExp('^([#-])(' + REGEX_VAR + ')\\{([^\\}]+)\\}(\\{\\?([^\\}]+)\\})*$')) || []
            if (tokens.length > 3 && tokens[1] == "#") {

                let variable = tokens[2]
                let expr = tokens[3]

                try {

                    let map = eval_with_context(expr, context)
                    if (typeof map === 'object' && map !== null) {

                        Object.keys(map).forEach((key, i) => {

                            let child_context = { ...context }

                            // build child key(s)
                            let key_idx = KEY_SUFFIX
                            while (key_idx in child_context) {
                                key_idx = key_idx + KEY_SUFFIX
                            }
                            while (key_idx.length > KEY_SUFFIX.length) {
                                let parent_idx = key_idx.substring(0, key_idx.length - KEY_SUFFIX.length)
                                child_context[key_idx] = child_context[parent_idx]
                                key_idx = parent_idx
                            }
                            child_context[KEY_SUFFIX] = key

                            // build child value
                            child_context[variable] = map[key]

                            // update result
                            result[variable] = transform_json(transform[transform_key], child_context)
                        });

                    } else {

                        throw `ERROR: unable to evaluate [${expr}] -- ${map}`
                    }
                } catch (error) {

                    throw `ERROR: failed to process [${transform_key}]` + string(error)
                }

            } else if (tokens.length > 3 && tokens[1] == "-") {

                let variable = tokens[2]
                let expr = tokens[3]

                try {

                    let arr = eval_with_context(expr, context)

                    if (Array.isArray(arr)) {

                        arr.forEach((value, i) => {

                            let child_context = { ...context }

                            // build child key(s)
                            let key_idx = KEY_SUFFIX
                            while (key_idx in child_context) {
                                key_idx = key_idx + KEY_SUFFIX
                            }
                            while (key_idx.length > KEY_SUFFIX.length) {
                                let parent_idx = key_idx.substring(0, key_idx.length - KEY_SUFFIX.length)
                                child_context[key_idx] = child_context[parent_idx]
                                key_idx = parent_idx
                            }
                            child_context[KEY_SUFFIX] = i

                            // build child value
                            child_context[variable] = value

                            // update result
                            result[variable] = transform_json(transform[transform_key], child_context)
                        });

                    } else {

                        throw `ERROR: unable to evaluate [${expr}] -- ${arr}`
                    }
                } catch (error) {

                    throw `ERROR: failed to process [${transform_key}]` + string(error)
                }

            } else {
                let result = []
            }
        });

        return result
    }
}

let input = load_sql("model.input.yaml")

let transform = YAML.parse(fs.readFileSync("model.transform.yaml", 'utf8'))

console.log('input')
console.log(JSON.stringify(input, null, 4))

console.log('transform')
console.log(JSON.stringify(transform, null, 4))

let result = transform_json(transform, input)
console.log('result')
console.log(JSON.stringify(result, null, 4))
