const fs = require('fs')
//const acorn = require("acorn")
//const jsx = require("acorn-jsx")
const { parse, parseExpression } = require('@babel/parser')

////////////////////////////////////////////////////////////////////////////////
// parse arguments
const { ArgumentParser } = require('argparse')
const parser = new ArgumentParser({
  description: 'parse code to ast tree'
})

parser.add_argument('-f', '--filepath', { help: 'javascript code filepath' })
args = parser.parse_args()

// validate template file
if (!fs.existsSync(args.filepath)) {
    console.error("ERROR: filepath does NOT exist [" + args.filepath + "] !")
    process.exit(1)
}

let code = fs.readFileSync(args.filepath, 'utf8')

console.log('------------------------------')
console.log('parse [' + args.filepath + ']')
//const JSXParser = acorn.Parser.extend(jsx())
let ast_tree = parse(code, {
  sourceType: 'module',
  plugins: [
    'jsx'
  ]
})
console.log(JSON.stringify(ast_tree, null, 4))

console.log('------------------------------')
