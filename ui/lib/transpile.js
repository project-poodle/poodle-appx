import babel from "@babel/standalone"
import t from "@babel/types"
import _ from "lodash"

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
        "react-dom/server",
        "prop-types",
        "reflect-prop-types",
        "react-redux",
        "redux",
        // "hookrouter",
        "react-router",
        "react-router-dom",
        "react-hook-form",
        "react-table",
        "react-grid-layout",
        "react-helmet",
        "react-csv",
        "react-feather",
        // "monaco-editor",
        "@monaco-editor/react",
        "yaml",
        "js-yaml",
        "lodash",
        "axios",
        "uuid",
        "flatted",
        "query-string",
        "javascript-time-ago",
        "javascript-time-ago/locale/en",
        "known-css-properties",
      ]
    },
    "mui": {
      path: "/dist/lib/mui.js",
      modules: [
        "@material-ui/core",
        "@material-ui/icons",
        "@material-ui/styles",
        "@material-ui/lab",
        // "material-table",
        "material-ui-nested-menu-item",
      ]
    },
    "antd": {
      path: "/dist/lib/antd.js",
      modules: [
        "antd",
        "@ant-design/icons",
        // "@ant-design/icons-svg",
      ]
    },
    "babel": {
      path: "/dist/lib/babel.js",
      modules: [
        "@babel/standalone",
        // "@babel/traverse",
        "@babel/types",
        "@babel/parser",
        "@babel/generator",
      ]
    },
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

          // do not transform relative path, or absolute path
          if (src_val.startsWith('.') || src_val.startsWith('/') || src_val.includes('//')) {
            return
          }

          let found = false

          // transform self?
          if (!found && src_val.startsWith('self/')) {
            // TODO
          }

          // check 'imports'
          if (import_maps.imports) {
            Object.keys(import_maps.imports).map(key => {
              // compute import key based on configured origin and configured key
              const import_key =
                !!import_maps.origin && !import_maps.imports[key].includes('//')
                ? import_maps.origin + import_maps.imports[key]
                : import_maps.imports[key]
              // process
              if (found) {
                return
              } else if (src_val == key) {
                found = true
                path.node.source.value = import_key
              } else if (key.endsWith('/') && src_val.startsWith(key)) {
                found = true
                path.node.source.value = import_key + src_val.substring(key.length)
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
                  }

                  // use a lib_identifier that is not likely to conflict with source code
                  const lib_identifier = `${lib_key}$$`

                  // compute import key based on configured origin and configured key
                  const lib_path =
                    !!import_maps.origin && !lib.path.includes('//')
                    ? import_maps.origin + lib.path
                    : lib.path

                  if (src_val == module_name) {

                    found = true
                    // console.log(lib_identifier, module_name)

                    // add lib_path to global imports
                    globalImports[lib_identifier] = lib_path
                    //console.log(globalImports)

                    path.replaceWithMultiple(
                      path.node.specifiers.map(specifier => {
                        if (specifier.type == 'ImportDefaultSpecifier') {
                          return t.variableDeclaration('const', [
                            t.variableDeclarator(
                              t.identifier(specifier.local.name),
                              t.memberExpression(
                                t.identifier(lib_identifier),
                                t.stringLiteral(module_name),
                                true
                              )
                            )
                          ])
                        } else if (specifier.type == 'ImportNamespaceSpecifier') {
                          return t.variableDeclaration('const', [
                            t.variableDeclarator(
                              t.identifier(specifier.local.name),
                              t.memberExpression(
                                t.identifier(lib_identifier),
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
                                t.identifier(lib_identifier),
                                t.stringLiteral(module_name),
                                true
                              )
                            )
                          ])
                        }
                      })
                    )
                  } else if (src_val.startsWith(module_name + '/')) {

                    // console.log(lib_identifier, module_name)
                    // throw new Error('ERROR: submodule not yet implemented [' + src_val + '].')
                    // just return and keep searching
                    return
                  }
                })
              }
            })
          }

          if (!found) {
            throw new Error('ERROR: import cannot be resolved [' + src_val + '] [' + JSON.stringify(import_maps) + ']')
          }
        }
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

function transpile(input, import_maps) {

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

    // console.log(err)
    throw err
  }
}

// expose lodash
transpile._ = _

export default transpile
