//import * as acorn from 'acorn'
//import jsx from 'acorn-jsx'
//import escodegen from 'escodegen'
//import Babel from '@babel/standalone'
import babel from "@babel/standalone"
import t from "@babel/types"
//import { clone, cloneDeep } from 'lodash' // Import the clone, cleanDeep

////////////////////////////////////////////////////////////////////////////////
// babel conf
const babelConf = {
  presets: [
    'es2017',
    'react'
  ]
}

////////////////////////////////////////////////////////////////////////////////
// import maps
const default_import_maps = {
  imports: {
    "app-x/": "/app-x/",
  },
  libs: {
    "main": {
      path: "/dist/lib/main.js",
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
        "@material-ui/core",
        "@material-ui/icons",
        "@material-ui/styles",
        "clsx",
        "lodash",
        "axios",
      ]
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// transpile import map
function importMapPlugin(import_maps, globalImports) {

  return {

    visitor: {

      Program:{
        exit(path, state) {
          //console.log(`exit`)
          Object.keys(globalImports).map(importKey => {
            let module_path = globalImports[importKey]
            path.unshiftContainer(
              'body',
              t.importDeclaration(
                [
                  t.importSpecifier(
                    t.identifier(importKey),
                    t.identifier('default'),
                  )
                ],
                t.stringLiteral(module_path)
              )
            )
          })
        }
      },

      ImportDeclaration(path) {

        // console.log(`INFO: import_maps [${JSON.stringify(import_maps)}]`)
        if (!import_maps) {
            return
        }

        // in this example change all the variable `n` to `x`
        if (path.isImportDeclaration()) {

          let src_val = path.node.source.value

          // do not transform relative path
          if (src_val.startsWith('.') || src_val.startsWith('/')) {
            return
          }

          let found = false

          // check 'imports'
          if (import_maps.imports) {
            Object.keys(import_maps.imports).map(key => {
              if (found) {
                return
              } else if (src_val == key) {
                found = true
                path.node.source.value = import_maps.imports[key]
              } else if (key.endsWith('/') && src_val.startsWith(key)) {
                found = true
                path.node.source.value = import_maps.imports[key] + src_val.substring(key.length)
              }
            })
          }

          // check 'libs'
          if (!found && import_maps.libs) {
            Object.keys(import_maps.libs).map(lib_key => {
              const lib = import_maps.libs[lib_key]
              if (found) {
                return
              } else if (lib.modules) {
                lib.modules.map(module_name => {

                  if (found) {

                    return

                  } else if (src_val == module_name) {

                    found = true

                    // add lib.path to global imports
                    globalImports[lib_key] = lib.path
                    //console.log(globalImports)

                    path.replaceWithMultiple(
                      path.node.specifiers.map(specifier => {
                        if (specifier.type == 'ImportDefaultSpecifier') {
                          return t.variableDeclaration('const', [
                            t.variableDeclarator(
                              t.identifier(specifier.local.name),
                              t.memberExpression(
                                t.identifier(lib_key),
                                t.stringLiteral(module_name),
                                true
                              )
                            )
                          ])
                        } else {
                          return t.variableDeclaration('const', [
                            t.variableDeclarator(
                              t.objectPattern([
                                t.objectProperty(
                                  t.identifier(specifier.imported.name),
                                  t.identifier(specifier.local.name),
                                )
                              ]),
                              t.memberExpression(
                                t.identifier(lib_key),
                                t.stringLiteral(module_name),
                                true
                              )
                            )
                          ])
                        }
                      })
                    )
                  } else if (src_val.startsWith(module_name + '/')) {

                    // TODO
                    throw new Error('ERROR: submodule not yet implemented [' + src_val + '].')
                  }
                })
              }
            })
          }

          if (!found) {
            throw new Error('ERROR: import cannot be resolved [' + src_val + '].')
          }
        }
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

export default function transpile(input, import_maps) {

  try {
    //console.log(input)
    var output = babel.transform(input, {
      ...babelConf,
      plugins: [
        importMapPlugin(import_maps || default_import_maps, {})
      ],
    })
    //console.log(output.code)
    return output.code

  } catch (err) {

    console.log(err.stack)
    throw err
  }
}
