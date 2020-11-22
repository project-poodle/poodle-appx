const esprima = require('esprima')
const escodegen = require('escodegen')

const expr1 = 'a[b.c][d]'
let ast1 = esprima.parse(expr1).body
console.log(JSON.stringify(ast1, null, 4))

const expr2 = 'objPath.get(a, objPath.get(b, "c", null), null)'
let ast2 = esprima.parse(expr2).body
console.log(JSON.stringify(ast2, null, 4))


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

const ast_null = {
    "type": "Literal",
    "value": null,
    "raw": "null"
}

function isPrimitive(test) {
    return (test !== Object(test))
}

function traverse_with_obj_path(input) {

    if (isPrimitive(input)) {

        return input

    } else if (Array.isArray(input)) {

        let result = []

        for (child of input) {

            result.push(traverse_with_obj_path(child))
        }

    } else if (typeof input === 'object' && input !== null) {

        let result = {}

        if (('type' in input) && ('object' in input) && ('property' in input) && (input.type == 'MemberExpression')) {

            result.type = 'CallExpression'
            result.callee = { ...ast_objPath_get }

            let object = traverse_with_obj_path(input.object)

            let property = { ...input.property }
            if ('name' in property && 'type' in property && property.type == 'Identifier') {
                property = {
                    type: 'Literal',
                    value: property.name,
                    // raw: `'${property.name}'`
                }
            } else {
                property = traverse_with_obj_path(property)
            }

            result.arguments = [
                object,
                property,
                { ...ast_null }
            ]

        } else {

            for (key in input) {
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

const result = traverse_with_obj_path(ast1[0])
// console.log(JSON.stringify(result, null, 4))

let new_expr = escodegen.generate(result)
console.log(new_expr)
