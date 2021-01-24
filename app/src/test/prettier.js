const fs = require('fs')
const prettier = require("prettier")

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

console.log(prettier.format(code, { semi: false, parser: "babel" }))
