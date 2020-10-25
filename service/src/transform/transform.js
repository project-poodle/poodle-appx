const fs = require('fs');
const YAML = require('yaml')
const { load_sql } = require('./load_sql')

// let re = /(\#|\@|\$|\+{1,2}|\-{1,2}|\*{1,2}|\/|\&{1,2}|\|{1,2}|\^|\!|\~|={1,3}|\?|\:|\[|\]|\(|\)|\{|\}|[A-Za-z_][A-Za-z_0-9]*)+/

const REGEX_VAR = '[_a-zA-Z][_a-zA-Z0-9]*'
const KEY_SUFFIX = '__k'

expr = "$deployments_by_app[@namespaces][@@apps]"

function eval_with_context(expr, ctx) {

    // substitute variable
    let regex = new RegExp('\\$(' + REGEX_VAR + ')', 'g');
    expr = expr.replace(regex, 'ctx.$1')

    // substitute key
    expr = expr.replace(new RegExp('\\@(' + REGEX_VAR + ')', 'g'), 'ctx.$1' + KEY_SUFFIX)

    // substitute nested keys
    while (expr.match(new RegExp('\\@(ctx\\.' + REGEX_VAR + '(' + KEY_SUFFIX + ')+)', 'g'))) {
        expr = expr.replace(new RegExp('\\@(ctx\\.' + REGEX_VAR + '(' + KEY_SUFFIX + ')+)', 'g'), '$1' + KEY_SUFFIX)
    }

    //console.log(`eval(${expr})`)
    let r = eval(expr, ctx)
    //console.log(`eval(${expr}) => ${r}`)
    return r
}

function transform_json(transform, context) {

    //console.log('transform')
    //console.log(transform)

    if (Array.isArray(transform)) {

        let result = []
        transform.forEach((transform_value, i) => {
            result.append(transform_json(transform_value, context))
        });

        return result

    } else if (typeof transform === 'object' && transform !== null) {

        let result = {}
        Object.keys(transform).forEach((transform_key, i) => {

            let tokens = transform_key.match(new RegExp('^([#-])(' + REGEX_VAR + ')\\{([^\\}]+)\\}(\\{\\?([^\\}]+)\\})*$')) || []
            // console.log(tokens)
            if (tokens.length > 3 && tokens[1] == "#") {

                let variable = tokens[2]
                let expr = tokens[3]

                // evaluate map
                let map = {}
                try {
                    map = eval_with_context(expr, context)
                } catch (error) {
                    console.warn(`WARN: failed to evaluate [${expr}] -- ${error.toString()}`)
                }

                if (typeof map === 'object' && map !== null) {

                    Object.keys(map).forEach((key, i) => {

                        //console.log('context')
                        //console.log(context)

                        let child_context = { ...context }
                        child_context[variable] = {}

                        // build child value
                        child_context[variable] = Object.assign(child_context[variable], map[key])

                        // build child key(s)
                        let key_idx = KEY_SUFFIX
                        while (variable in context && (variable + key_idx) in context) {
                            key_idx = key_idx + KEY_SUFFIX
                        }
                        while (key_idx.length > KEY_SUFFIX.length) {
                            let parent_idx = key_idx.substring(0, key_idx.length - KEY_SUFFIX.length)
                            child_context[variable + key_idx] = context[variable + parent_idx]
                            key_idx = parent_idx
                        }
                        child_context[variable + KEY_SUFFIX] = key

                        // update result
                        //console.log('child_context')
                        //console.log(child_context)
                        result[key] = transform_json(transform[transform_key], child_context)
                    });

                } else if (map) {

                    throw `ERROR: unable to evaluate [${expr}] -- ${map}`
                }

            } else if (tokens.length > 3 && tokens[1] == "-") {

                let variable = tokens[2]
                let expr = tokens[3]

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
                        result.push(transform_json(transform[transform_key], child_context))
                    });

                } else {

                    throw `ERROR: unable to evaluate [${expr}] -- ${arr}`
                }

            } else {

                result[transform_key] = transform_json(transform[transform_key], context)
            }
        });

        return result

    } else {

        return eval_with_context(transform, context)
    }
}

//console.log('input')
let input = load_sql("model.input.yaml")
//console.log(JSON.stringify(input, null, 4))

//console.log('transform')
let transform = YAML.parse(fs.readFileSync("model.transform.yaml", 'utf8'))
//console.log(JSON.stringify(transform, null, 4))

console.log('result')
let result = transform_json(transform, input)
console.log(JSON.stringify(result, null, 4))
