const YAML = require('yaml');

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

function transform(transformer, input) {

}

input =

transformer = YAML.parse(fs.readFileSync("model.transform.yaml", 'utf8'))

eval_with_context(expr)
