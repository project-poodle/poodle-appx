const fs = require('fs')
const acorn = require("acorn")
const jsx = require("acorn-jsx")
const escodegen = require('escodegen')
const { clone, cloneDeep } = require('lodash') // Import the clone, cleanDeep

////////////////////////////////////////////////////////////////////////////////
// import maps
const default_import_maps = {
  imports: {
    "app-x/": "http://localhost:3001/",
    "self/": "http://localhost:3001/ui/sys/appx/base/current/"
  },
  libs: {
    main: {
      path: "../dist/lib/main.js",
      modules: [
        "react",
        "react-dom",
        "prop-types",
        "reflectPropTypes",
        "react-redux",
        "redux",
        "hookrouter",
        "react-router",
        "react-router-dom",
        "react-helmet",
        "react-feather",
        "clsx",
        "lodash",
        "axios",
      ]
    },
    "material": {
      path: "../dist/lib/material.js",
      modules: [
        "@material-ui/core",
        "@material-ui/icons",
        "@material-ui/styles",
      ]
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// parse arguments
const { ArgumentParser } = require('argparse')
const parser = new ArgumentParser({
  description: 'transform import statement'
})

parser.add_argument('-f', '--filepath', { help: 'javascript code filepath' })
args = parser.parse_args()

// validate template file
if (!fs.existsSync(args.filepath)) {
    console.error("ERROR: filepath does NOT exist [" + args.filepath + "] !")
    process.exit(1)
}

let code = fs.readFileSync(args.filepath, 'utf8')

////////////////////////////////////////////////////////////////////////////////
// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
}


/**
 * default import declaration for lib_name
 */
function get_default_import_declaration(lib_name, lib_path) {

  return {
    "type": "ImportDeclaration",
    "specifiers": [
      {
        "type": "ImportSpecifier",
        "imported": {
          "type": "Identifier",
          "name": "default"
        },
        "local": {
          "type": "Identifier",
          "name": lib_name
        }
      }
    ],
    "source": {
      "type": "Literal",
      "value": lib_path
    }
  }
}

/**
 * generate init properties for import specifiers
 */
function get_init_properties_from_import_specifiers(specifiers) {

  let results = []
  specifiers.map(row => {

    switch (row.type) {
      case "ImportDefaultSpecifier":
        results.push({
          "type": "Property",
          "method": false,
          "shorthand": false,
          "computed": false,
          "key": {
              "type": "Identifier",
              "name": "default"
          },
          "value": {
              "type": "Identifier",
              "name": row.local.name
          },
          "kind": "init"
        })
        break

      case "ImportSpecifier":
        results.push({
          "type": "Property",
          "method": false,
          "shorthand": false,
          "computed": false,
          "key": {
              "type": "Identifier",
              "name": row.imported.name
          },
          "value": {
              "type": "Identifier",
              "name": row.local.name
          },
          "kind": "init"
        })
        break

      default:
        throw new Error(`ERROR: unknown import specifier type [${row.type}]`)
    }
  })

  return results
}

/**
 * generage variable declaration from import declaration
 */
function get_variable_declaration_from_import_declaration (lib_name, module_name, specifiers) {

  return {
    "type": "VariableDeclaration",
    "declarations": [
      {
        "type": "VariableDeclarator",
        "id": {
          "type": "ObjectPattern",
          "properties": get_init_properties_from_import_specifiers(specifiers)
        },
        "init": {
            "type": "MemberExpression",
            "object": {
                "type": "Identifier",
                "name": lib_name
            },
            "property": {
                "type": "Literal",
                "value": module_name
            },
            "computed": true,
            "optional": false
        }
      }
    ],
    "kind": "const"
  }
}

////////////////////////////////////////////////////////////////////////////////
// traverse
function traverse(input, import_maps, context) {

  if (!import_maps) {
    return input
  }

  if (isPrimitive(input)) {

    return input

  } else if (Array.isArray(input)) {

    let result = []

    for (let child of input) {

        const data = traverse(child, import_maps, context)
        result.push(data)
    }

    return result

  } else if (typeof input === 'object' && input !== null) {

    let result = {}

    if (('type' in input)
        && (input.type == 'ImportDeclaration')
        && ('specifiers' in input)
        && ('source' in input)
        && ('type' in input.source)
        && (input.source.type == 'Literal')
        && ('value' in input.source)
      ) {

      let src_val = input.source.value
      if (src_val.startsWith('.') || src_val.startsWith('/')) {
        return input
      }

      let found = false

      // check 'imports'
      Object.keys(import_maps.imports).map(key => {
        if (found) {
          return
        } else if (src_val == key) {
          found = true
          result = cloneDeep(input)
          result.source.value = import_maps.imports[key]
        } else if (key.endsWith('/') && src_val.startsWith(key)) {
          found = true
          result = cloneDeep(input)
          result.source.value = import_maps.imports[key] + src_val.substring(key.length)
        }
      })

      // check 'libs'
      if (!found) {
        Object.keys(import_maps.libs).map(lib_key => {
          const lib = import_maps.libs[lib_key]
          if (found) {
            return
          } else if (lib.modules) {
            lib.modules.map(module_name => {
              if (found) {
                return
              } else if (src_val.startsWith(module_name)) {
                found = true
                if (!context.globalImports) {
                  context.globalImports = {}
                }
                context.globalImports[lib_key] = lib.path
                result = get_variable_declaration_from_import_declaration(lib_key, module_name, input.specifiers)
              }
            })
          }
        })
      }

      if (!found) {
        throw new Error('ERROR: import cannot be resolved [' + src_val + '].')
      }

      return result

    } else {

      for (let key in input) {
        const data = traverse(input[key], import_maps, context)
        result[key] = data
      }
    }

    return result

  } else {

    throw new Error(`Unrecognized input source [${input}]`)
  }
}

console.log('------------------------------')
console.log('parse [' + args.filepath + ']')
const JSXParser = acorn.Parser.extend(jsx())
let ast_tree = JSXParser.parse(code, {ecmaVersion: 2020, sourceType: "module"})
console.log(JSON.stringify(ast_tree, null, 4))

console.log('------------------------------')
console.log('transpile [' + args.filepath + ']')
let context = {}
let converted_tree = traverse(ast_tree, default_import_maps, context)
if (context.globalImports) {
  Object.keys(context.globalImports).map(lib_key => {
    converted_tree.body.unshift(get_default_import_declaration(lib_key, context.globalImports[lib_key]))
  })
}
console.log(JSON.stringify(converted_tree, null, 4))
let converted = escodegen.generate(converted_tree)

console.log('------------------------------')
console.log(converted)
console.log('------------------------------')
