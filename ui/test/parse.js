const fs = require('fs')
const acorn = require("acorn")
const jsx = require("acorn-jsx")

////////////////////////////////////////////////////////////////////////////////
// parse arguments
const { ArgumentParser } = require('argparse')
const parser = new ArgumentParser({
  description: 'parse code to ast tree'
})

parser.add_argument('-f', '--filepath', { help: 'javascript code filepath' })
args = parser.parse_args()

let code = fs.readFileSync(args.filepath, 'utf8')

console.log('------------------------------')
console.log('parse [' + args.filepath + ']')
const JSXParser = acorn.Parser.extend(jsx())
let ast_tree = JSXParser.parse(code, {ecmaVersion: 2020, sourceType: "module"})
console.log(JSON.stringify(ast_tree, null, 4))

console.log('------------------------------')
