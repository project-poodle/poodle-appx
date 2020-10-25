const fs = require('fs');
const YAML = require('yaml')
const { load_sql } = require('./load_sql')

// let re = /(\#|\@|\$|\+{1,2}|\-{1,2}|\*{1,2}|\/|\&{1,2}|\|{1,2}|\^|\!|\~|={1,3}|\?|\:|\[|\]|\(|\)|\{|\}|[A-Za-z_][A-Za-z_0-9]*)+/

expr = "$deployments_by_app[@namespaces][@@apps]"

function eval_with_context(expr, ctx) {

    expr = expr.replace(/\$([_a-zA-Z_][_a-zA-Z0-9]*)/g, "ctx.$1")

    expr = expr.replace(/\@([_a-zA-Z_][_a-zA-Z0-9]*)/g, "ctx.$1.__key")

    while (expr.match(/\@(ctx\.[_a-zA-Z_][_a-zA-Z0-9]*\.(__key)+)/)) {
        expr = expr.replace(/\@(ctx\.[_a-zA-Z_][_a-zA-Z0-9]*\.(__key)+)/g, "$1__key")
    }

    console.log(expr)
    return eval(expr, ctx)
}

function transform_json(transform, input) {

    if (Array.isArray(transform)) {

    } else {
        
    }
}

let input = load_sql("model.input.yaml")

let transform = YAML.parse(fs.readFileSync("model.transform.yaml", 'utf8'))

console.log(JSON.stringify(input, null, 4))

console.log(JSON.stringify(transform, null, 4))

//eval_with_context(expr, input)
