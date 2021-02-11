const traverse = require('@babel/traverse').default
const { parse, parseExpression } = require('@babel/parser')
const generate = require('@babel/generator').default
const t = require("@babel/types")

const PATH_SEPARATOR = '/'
const VARIABLE_SEPARATOR = '.'

const CONTEXT_JSX = 'CONTEXT_JSX'
const CONTEXT_STATEMENT = 'CONTEXT_STATEMENT'
const CONTEXT_SCOPE = 'CONTEXT_SCOPE'
const CONTEXT_CUSTOM_CHILD = 'CONTEXT_CUSTOM_CHILD'

const SPECIAL_CHARACTER = /[^_a-zA-Z0-9]/g
const INPUT_REQUIRED = 'INPUT_REQUIRED'

const TOKEN_IMPORT = '$I'
const TOKEN_LOCAL = '$L'
const TOKEN_JSX = '$J'
const TOKEN_PARSED = '$P'


////////////////////////////////////////////////////////////////////////////////
// utilities

// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
}

// capitalize string
function capitalize(s) {
    if (typeof s !== 'string') {
        throw new Error(`ERROR: capitalize input is not string [${typeof s}]`)
    }
    return s.charAt(0).toUpperCase() + s.slice(1)
}

// reserved test
function isReserved(test) {
    try {
        eval('var ' + test + ' = 1')
        return false
    } catch {
        return true
    }
}

////////////////////////////////////////////////////////////////////////////////
// parse utilities
function _js_parse_snippet(js_context, parsed, variables) {

  // console.log(parsed)

  traverse(parsed, {
    // custom variables
    Identifier(path) {
      if (!!variables && !!variables[path.node.name]) {
        // console.log(`replace`, path.node.name, variables[path.node.name])
        path.replaceWith(variables[path.node.name])
      }
    },
    JSXIdentifier(path) {
      if (!!variables && !!variables[path.node.name]) {
        // console.log(`replace`, path.node.name, variables[path.node.name])
        path.replaceWith(variables[path.node.name])
      }
    },
    // resolve call expressins with TOKEN_IMPORT require syntax
    //   $I('app-x/router|navigate')
    CallExpression(path) {
      // check if matches TOKEN_IMPORT syntax
      if (t.isIdentifier(path.node.callee)
          && path.node.callee.name === TOKEN_IMPORT
          && path.node.arguments.length > 0
          && t.isStringLiteral(path.node.arguments[0])) {
        // register and import TOKEN_IMPORT syntax
        const name = path.node.arguments[0].value
        reg_js_import(js_context, name)
        path.replaceWith(t.identifier(name))
      }
      // check if matches TOKEN_LOCAL syntax
      if (t.isIdentifier(path.node.callee)
          && path.node.callee.name === TOKEN_LOCAL
          && path.node.arguments.length > 0
          && t.isStringLiteral(path.node.arguments[0])) {
        // register variable for TOKEN_LOCAL syntax
        // const scope = js_context.CONTEXT_SCOPE || `$local`
        // const name = `${scope}.${path.node.arguments[0].value}`
        const name = `${path.node.arguments[0].value}`
        // reg_js_variable(js_context, name)
        path.replaceWith(t.identifier(name))
      }
      // check if matches TOKEN_PARSED syntax
      if (t.isIdentifier(path.node.callee)
          && path.node.callee.name === TOKEN_PARSED
          && path.node.arguments.length > 0
          && t.isStringLiteral(path.node.arguments[0])) {
        // replace with parsed syntax
        const name = path.node.arguments[0].value
        // console.log(`$P`, name, js_context.parsed[name])
        path.replaceWith(js_context.parsed[name])
      }
    },
    // register all variable declarators with local prefix
    // VariableDeclarator(path) {
    //   if (t.isIdentifier(path.node.id)) {
    //     // register variable defined by local snippet
    //     const scope = `${js_context.CONTEXT_SCOPE}`
    //     const nodeName = `${scope}.${path.node.id.name}`
    //     console.log(`VariableDeclarator - scope`, js_context.CONTEXT_SCOPE, scope, path.node.id.name, nodeName)
    //     reg_js_variable(js_context, nodeName)
    //     path.node.id.name = nodeName
    //   }
    // },
    JSXElement(path) {
      if
      (
        t.isJSXOpeningElement(path.node.openingElement)
        && t.isJSXIdentifier(path.node.openingElement.name)
        && path.node.openingElement.name.name === TOKEN_JSX
      )
      {
        const import_name_attr = path.node.openingElement.attributes.find(attr => (
          t.isJSXAttribute(attr)
          && t.isJSXIdentifier(attr.name)
          && attr.name.name === TOKEN_IMPORT
        ))
        const local_name_attr = path.node.openingElement.attributes.find(attr => (
          t.isJSXAttribute(attr)
          && t.isJSXIdentifier(attr.name)
          && attr.name.name === TOKEN_LOCAL
        ))
        // check that $I or $L attr exists
        if (!import_name_attr && !local_name_attr) {
          throw new Error(`ERROR: [${TOKEN_JSX}] missing [${TOKEN_IMPORT}] or [${TOKEN_LOCAL}]`)
        }
        // get name_attr
        const name_attr = import_name_attr || local_name_attr
        let i_name = ''
        if (!!import_name_attr) {
          i_name = name_attr.value.value
          reg_js_import(js_context, i_name)
        } else {
          // const scope = js_context.CONTEXT_SCOPE || `$local`
          // i_name = `${scope}.${name_attr.value.value}`
          i_name = `${name_attr.value.value}`
          // reg_js_variable(js_context, i_name)
        }
        // check that value is string literals
        if (!t.isStringLiteral(name_attr.value)) {
          throw new Error(`ERROR: [${TOKEN_JSX}] name is not a string literal`)
        }
        // create replacement
        const replacement = t.jSXElement(
          t.jSXOpeningElement(
            t.jSXIdentifier(
              i_name,
            ),
            path.node.openingElement.attributes.filter(attr => (
              !(
                t.isJSXAttribute(attr)
                && t.isJSXIdentifier(attr.name)
                && (attr.name.name === TOKEN_IMPORT || attr.name.name === TOKEN_LOCAL)
              )
            ))
          ),
          t.jSXClosingElement(
            t.jSXIdentifier(
              i_name,
            ),
          ),
          path.node.children
        )
        // console.log(replacement)
        // replace
        path.replaceWith(replacement)
      }
    }
  })

  // parsed object is already modified, return same object for convinience
  return parsed
}

// parse user code snippet
function _js_parse_statements(js_context, data, options, variables) {

  try {

    const program = parse(data, options)

    // parse user code snippet
    _js_parse_snippet(js_context, program, variables)

    return program.program.body

  } catch (err) {

    console.log(`_js_parse_statements error [${data}]`)
    throw err
  }
}

// parse expression with support of '$I' syntax
function _js_parse_expression(js_context, data, options, variables) {

  try {
    // console.log(`_js_parse_expression`, data)
    const parsed = parseExpression(data, options)

    const program = t.file(
      t.program(
        [
          t.returnStatement(
            parsed
          )
        ]
      )
    )

    // parse user code snippet
    _js_parse_snippet(
      js_context,
      program,
      variables
    )

    // return statement
    // console.log(program.program.body[0])

    // return parsed expression
    return program.program.body[0].argument

  } catch (err) {

    console.log(`_js_parse_expression error [${data}]`)
    throw err
  }
}

////////////////////////////////////////////////////////////////////////////////
// generate utilities
function _js_generate_snippet(js_context, ast) {

  // console.log(ast)

  traverse(ast, {
    JSXElement(path) {
      if
      (
        t.isJSXOpeningElement(path.node.openingElement)
        && t.isJSXIdentifier(path.node.openingElement.name)
        && path.node.openingElement.name.name !== TOKEN_JSX
      )
      {
        // name attr
        const name = path.node.openingElement.name.name
        let name_attr = null
        if (name.startsWith('$local')) {
          name_attr = t.jSXAttribute(
            t.jSXIdentifier(TOKEN_LOCAL),
            t.stringLiteral(name)
          )
        } else {
          name_attr = t.jSXAttribute(
            t.jSXIdentifier(TOKEN_IMPORT),
            t.stringLiteral(name)
          )
        }
        // create replacement
        const replacement = t.jSXElement(
          t.jSXOpeningElement(
            t.jSXIdentifier(
              TOKEN_JSX,
            ),
            [
              name_attr,
              ...path.node.openingElement.attributes
            ]
          ),
          t.jSXClosingElement(
            t.jSXIdentifier(
              TOKEN_JSX,
            ),
          ),
          path.node.children
        )
        // replace
        // console.log(`replacement [${name}]`, name_attr, replacement)
        path.replaceWith(replacement)
      }
    }
  })

  // ast object is already modified, return same object for convinience
  return ast
}

// generate code snippet
function _js_generate_expression(js_context, ast) {

  try {

    const program = t.file(
      t.program(
        [
          t.returnStatement(
            ast
          )
        ]
      )
    )

    // pre-process ast
    _js_generate_snippet(js_context, program)

    const output = generate(program.program.body[0].argument)

    return output.code

  } catch (err) {

    console.log(`_js_generate_expression error [${JSON.stringify(ast, null, 2)}]`)
    throw err
  }
}

////////////////////////////////////////////////////////////////////////////////
// parse variable full path
function _parse_var_full_path(var_full_path) {

  let import_paths = var_full_path.split(PATH_SEPARATOR)
  let sub_vars = import_paths[import_paths.length - 1].split(VARIABLE_SEPARATOR)

  // add first sub_var to import_path
  import_paths[import_paths.length - 1] = sub_vars.shift()

  return {
    full_paths: [].concat(import_paths, sub_vars),
    import_paths: import_paths,
    sub_vars: sub_vars
  }
}


////////////////////////////////////////////////////////////////////////////////
// registration methods

// register variables
function reg_js_variable(js_context, var_full_path, kind='const', suggested_name=null) {

    // if variable is already registered, just return
    if (var_full_path in js_context.variables) {
      return
    }

    // parse variable
    const parsed_var = _parse_var_full_path(var_full_path)

    let var_prefix = [].concat(parsed_var.full_paths)
    if (suggested_name) {
      var_prefix.pop() // remove most qualified name
      var_prefix.push(suggested_name) // add suggested_name
    }

    // get starting var_name
    let var_name = var_prefix.pop().replace(SPECIAL_CHARACTER, '_')
    if (isReserved(var_name)) {
      var_name = var_name + '$' + var_prefix.pop().replace(SPECIAL_CHARACTER, '_')
    }

    while (true) {

        // check for name conflict
        const found = Object.keys(js_context.variables).find(key => {
            let spec = js_context.variables[key]
            return spec.name === var_name
        })

        // name conflict found
        if (found) {
            // update conflicting variable names
            Object.keys(js_context.variables).map(key => {
                let var_spec = js_context.variables[key]
                if (var_spec.name === var_name) {
                    if (var_spec.var_prefix.length) {
                        var_spec.name = var_spec.name + '$' + var_spec.var_prefix.pop().replace(SPECIAL_CHARACTER, '_')
                    } else {
                        // we have exhausted the full path, throw exception
                        throw new Error(`ERROR: name resolution conflict [${var_full_path}] [${JSON.stringify(js_context.variables, null, 2)}]`)
                    }
                }
            })
            // update our own variable name
            if (!!var_prefix.length) {
                var_name = var_name + '$' + var_prefix.pop().replace(SPECIAL_CHARACTER, '_')
            } else {
                // we have exhausted the full path, throw exception
                throw new Error(`ERROR: name resolution conflict [${var_full_path}] [${JSON.stringify(js_context.variables, null, 2)}]`)
            }
        } else {
            js_context.variables[var_full_path] = {
                kind: kind,
                name: var_name,
                var_full_path: var_full_path,
                var_prefix: var_prefix
            }
            return js_context
        }
    }
}

function reg_js_import(js_context, var_full_path, use_default=true, suggested_name=null) {

    // if variable is already registered, just return
    if (var_full_path in js_context.imports) {
      return
    }

    // parse variable
    const parsed_var = _parse_var_full_path(var_full_path)

    // import_path
    const import_path = parsed_var.import_paths.join(PATH_SEPARATOR)

    if (import_path !== var_full_path) {
        // if import_path is different from variable_full_path, suggested_name applies only to the variable
        reg_js_variable(js_context, import_path, 'const', null)
        reg_js_variable(js_context, var_full_path, 'const', suggested_name)
    } else {
        // if import path is same as variable_full_path, suggested_name applies to both
        // reg_js_variable(js_context, import_path, 'const', suggested_name)
        reg_js_variable(js_context, var_full_path, 'const', suggested_name)
    }

    // update import data
    if (!(import_path in js_context.imports)) {
        js_context.imports[import_path] = {
            use_default: use_default,
            suggested_name: suggested_name,
            path: import_path,
            sub_vars: {}
        }
    }

    // update sub_vars for import
    let sub_vars = [].concat(parsed_var.sub_vars)
    if (sub_vars.length !== 0) {
        // compute sub_var_name and sub_var_full_path
        const sub_var_name = sub_vars.join(VARIABLE_SEPARATOR)
        // register as import sub_var and as variable
        js_context.imports[import_path].sub_vars[sub_var_name] = parsed_var.sub_vars
    }
}

////////////////////////////////////////////////////////////////////////////////
// resolve identifiers
function js_resolve_ids(js_context, ast_tree) {
  // add imports and other context to the code
  traverse(ast_tree, {
    Program: {
      exit(path) {
        const import_statements = []
        ////////////////////////////////////////////////////////////
        // process import statement first, prior to process sub_vars
        Object.keys(js_context.imports).map(importKey => {
          // check for self
          if (importKey === js_context.self) {
            return
          }
          // get basic information of import registration
          // console.log(js_context.imports[importKey])
          let import_name = js_context.variables[importKey].name
          let import_path = js_context.imports[importKey].path
          let sub_vars = js_context.imports[importKey].sub_vars
          // process import statement, then process sub_vars
          if (js_context.imports[importKey].use_default) {
            import_statements.unshift(
              t.importDeclaration(
                [
                  t.ImportDefaultSpecifier(
                    t.identifier(import_name)
                  )
                ],
                t.stringLiteral(import_path)
              )
            )
          } else {
            import_statements.unshift(
              t.importDeclaration(
                [
                  t.importNamespaceSpecifier(
                    t.identifier(import_name)
                  )
                ],
                t.stringLiteral(import_path)
              )
            )
          }
          ////////////////////////////////////////////////////////////
          // we have processed import statement, now process sub_vars
          Object.keys(sub_vars).forEach((sub_var_key, i) => {
            // compute sub_var_name and sub_var_value
            let sub_var_value = sub_vars[sub_var_key]
            if (! sub_var_value.length) {
              return
            }
            //console.log(sub_var_value)
            // get sub_var variable registration
            let sub_var_name = js_context.variables[importKey + VARIABLE_SEPARATOR + sub_var_key].name
            // compose sub_var_expression
            let sub_var_expression = t.memberExpression(
              t.identifier(import_name),
              t.stringLiteral(sub_var_value.shift()),
              true
            )
            while (sub_var_value.length) {
              sub_var_expression = t.memberExpression(
                sub_var_expression,
                t.stringLiteral(sub_var_value.shift()),
                true
              )
            }
            // add sub_var declarations to the body
            import_statements.unshift(
              t.variableDeclaration(
                'const',
                [
                  t.variableDeclarator(
                    t.identifier(sub_var_name),
                    sub_var_expression
                  )
                ]
              )
            )
          })
        })
        ////////////////////////////////////////////////////////////
        // add import statements to program body
        import_statements.forEach((import_statement, i) => {
          path.unshiftContainer(
            'body',
            import_statement
          )
        })
      }
    },
    Identifier(path) {
      if (path.node.name in js_context.variables) {
        path.node.name = js_context.variables[path.node.name].name
      } else {
        // TODO - do we want to resolve all the identifier here
        // console.error(`ERROR: unable to resolve [${path.node.name}]`)
      }
    },
    JSXIdentifier(path) {
      if (path.node.name in js_context.variables) {
        path.node.name = js_context.variables[path.node.name].name
      } else {
        // TODO - do we want to resolve all the identifier here
        // console.error(`ERROR: unable to resolve [${path.node.name}]`)
      }
    }
  })
}

////////////////////////////////////////////////////////////////////////////////
// lookup data type
const lookup_type_for_data = (data) => {
  // get data type
  let dataType = ''
  if (isPrimitive(data)) {
    switch(typeof data) {
      case 'string':
        return 'js/string'
      case 'number':
        return 'js/number'
      case 'boolean':
        return 'js/boolean'
      case 'undefined':
        return 'js/null'
      case 'object':
        if (data === null)
          return 'js/null'
        else
          throw new Error(`ERROR: unexpected primitive data type [${data}]`)
    }
  }

  if (Array.isArray(data)) {
    return 'js/array'
  }

  if (!data._type) {
    return 'js/object'
  }

  return data._type
}

// check if data matches the match spec
const type_matches_spec = (js_context, data_type, typeSpec) => {
  // type spec must be an array
  if (!Array.isArray(typeSpec)) {
    throw new Error(`ERROR: type spec is not an array`)
  }
  // iterate type spec
  return !!typeSpec.find(spec => {
    // if no class in matchSpec
    if (!spec.kind) {
      throw new Error(`ERROR: type spec missing [kind]`)
    }
    if (!spec.data) {
      throw new Error(`ERROR: type spec missing [data]`)
    }
    // check kind
    switch (spec.kind) {
      case 'class':
        // check classSpec
        if (!js_context.spec.classes[spec.data]) {
          return false
        }
        // get classSpec
        const classSpec = js_context.spec.classes[spec.data]
        // check that classSpec includes data_type
        return classSpec.types.includes(data_type)
      case 'type':
        // check data_type matches
        return data_type === spec.data
      case 'shape':
        // check data_type is 'js/object'
        return data_type === 'js/object'
      default:
        throw new Error(`ERROR: unrecognized type spec [kind] [${spec.kind}]`)
    }
  })
}

// check if node matches the match spec
const data_matches_spec = (js_context, data, typeSpec) => {
  const data_type = lookup_type_for_data(data)
  return type_matches_spec(js_context, data_type, typeSpec)
}

////////////////////////////////////////////////////////////////////////////////
const normalize_input = (input) => {
  // check for primitive
  if (isPrimitive(input)) {
    switch (typeof input) {
      case 'string':
        return {_type: 'js/string', data: input}
      case 'number':
        return {_type: 'js/number', data: input}
      case 'boolean':
        return {_type: 'js/boolean', data: input}
      case 'undefined':                         // treat undefined as null
        return {_type: 'js/null'}
      case 'object':
        if (input === null) {
          return {_type: 'js/null'}
        } else {
          throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
        }
      default:
        throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
    }
  }

  // if array
  if (Array.isArray(input)) {
    return {
      _type: 'js/array',
      children: input
    }
  }

  // js/object
  if (!input._type) {
    return {
      _type: 'js/object',
      ...input,
    }
  } else {
    // input has _type, return
    return input
  }
}

const check_input_data = (js_context, input) => {
  // normalize input with _type
  input = normalize_input(input)

  const typeSpec = js_context.spec.types[input._type]
  if (!typeSpec) {
    throw new Error(`ERROR: unable to find type spec [${input._type}]`)
  }

  // check child validity
  typeSpec.children.map(child => {
    if (child.name === '*') {
      if (!!child.array) {
        throw new Error(`ERROR: [${input._type}] wild card attribute [${child.name}] cannot be array`)
      }
      Object.keys(input)
        .filter(key => key !== '_type')
        .map(key => {
          const data = input[key]
          if (! data_matches_spec(js_context, data, child.types)) {
            throw new Error(`ERROR: [${input._type}] attribute [${child.name}] does not match type spec [${JSON.stringify(child.types)}] [${JSON.stringify(input[child.name])}]`)
          }
        })
    } else if (! (child.name in input)) {
      // child.name is missing
      if (!!child.required) {
        throw new Error(`ERROR: [${input._type}] missing required attribute [${child.name}]`)
      }
    } else {
      // child.name exists in input
      if (!!child.array) {
        if (!Array.isArray(input[child.name])) {
          throw new Error(`ERROR: [${input._type}] attribute [${child.name}] is not array [${JSON.stringify(input)}]`)
        }
        // check each child for type spec match
        input[child.name].map(data => {
          if (! data_matches_spec(js_context, data, child.types)) {
            throw new Error(`ERROR: [${input._type}] attribute [${child.name}] does not match type spec [${JSON.stringify(child.types)}] [${JSON.stringify(input[child.name])}]`)
          }
        })
      } else {
        const data = input[child.name]
        if (! data_matches_spec(js_context, data, child.types)) {
          throw new Error(`ERROR: [${input._type}] attribute [${child.name}] does not match type spec [${JSON.stringify(child.types)}] [${JSON.stringify(input[child.name])}]`)
        }
      }
    }
  })
}

////////////////////////////////////////////////////////////////////////////////
// exports
module.exports = {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  SPECIAL_CHARACTER,
  CONTEXT_STATEMENT,
  CONTEXT_JSX,
  CONTEXT_CUSTOM_CHILD,
  INPUT_REQUIRED,
  TOKEN_IMPORT,
  TOKEN_LOCAL,
  TOKEN_JSX,
  isPrimitive,
  capitalize,
  reg_js_import,
  reg_js_variable,
  // reg_react_state,
  js_resolve_ids,
  // _js_parse_snippet,
  // _js_parse_template,
  _js_parse_statements,
  _js_parse_expression,
  _js_generate_expression,
  _parse_var_full_path,
  // lookup
  lookup_type_for_data,
  type_matches_spec,
  data_matches_spec,
  check_input_data,
}
