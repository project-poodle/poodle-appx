const traverse = require('@babel/traverse').default
const { parse, parseExpression } = require('@babel/parser')
const t = require("@babel/types")

const PATH_SEPARATOR = '/'
const VARIABLE_SEPARATOR = '.'

const SPECIAL_CHARACTER = /[^_a-zA-Z0-9]/g
const JSX_CONTEXT = 'JSX_CONTEXT'

const TOKEN_IMPORT = '$I'
const TOKEN_LOCAL = '$L'
const TOKEN_JSX = '$JSX'
const TOKEN_NAME = '$NAME'

const REACT_FORM_METHODS = [
  'register',
  'unregister',
  'errors',
  'watch',
  'handleSubmit',
  'reset',
  'setError',
  'clearErrors',
  'setValue',
  'getValues',
  'trigger',
  'control',
  'formState',
]

const REACT_FORM_ARRAY_METHODS = [
  'fields',
  'append',
  'prepend',
  'insert',
  'swap',
  'move',
  'remove'
]

const VALID_INPUT_TYPES = [
  'text',
  'number',
  'password',
  'email',
  'tel',
  'url',
  'search',
  'date',
  'time',
  'datetime-local'
]

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
function _js_parse_snippet(js_context, parsed) {

  // console.log(parsed)

  traverse(parsed, {
    // resolve call expressins with TOKEN_IMPORT require syntax
    //   $I('app-x/router|navigate')
    CallExpression(path) {
      // check if matches TOKEN_IMPORT syntax
      if (t.isIdentifier(path.node.callee)
          && path.node.callee.name === TOKEN_IMPORT
          && path.node.arguments.length > 0
          && t.isStringLiteral(path.node.arguments[0])) {
        // register and import TOKEN_IMPORT require syntax
        const name = path.node.arguments[0].value
        reg_js_import(js_context, name)
        path.replaceWith(t.identifier(name))
      }
      // check if matches TOKEN_LOCAL syntax
      if (t.isIdentifier(path.node.callee)
          && path.node.callee.name === TOKEN_LOCAL
          && path.node.arguments.length > 0
          && t.isStringLiteral(path.node.arguments[0])) {
        // register and import TOKEN_IMPORT require syntax
        const name = path.node.arguments[0].value
        reg_js_variable(js_context, name)
        path.replaceWith(t.identifier(name))
      }
    },
    // register all variable declarators with local prefix
    VariableDeclarator(path) {
      if (t.isIdentifier(path.node.id)) {
        // register variable defined by local snippet
        const scope = js_context.SCOPE || `$local`
        const nodeName = `${scope}.${path.node.id.name}`
        reg_js_variable(js_context, nodeName)
        path.node.id.name = nodeName
      }
    },
    JSXElement(path) {
      if
      (
        t.isJSXOpeningElement(path.node.openingElement)
        && t.isJSXIdentifier(path.node.openingElement.name)
        && path.node.openingElement.name.name === TOKEN_JSX
      )
      {
        const name_attr = path.node.openingElement.attributes.find(attr => (
          t.isJSXAttribute(attr)
          && t.isJSXIdentifier(attr.name)
          && attr.name.name === TOKEN_NAME
        ))
        // check that $NAME attr exists
        if (!name_attr) {
          throw new Error(`ERROR: [${TOKEN_JSX}] missing [${TOKEN_NAME}]`)
        }
        // check that value is string literals
        if (!t.isStringLiteral(name_attr.value)) {
          throw new Error(`ERROR: [${TOKEN_JSX}] [${TOKEN_NAME}] is not a string literal`)
        }
        // import
        const import_name = name_attr.value.value
        reg_js_import(js_context, import_name)
        // create replacement
        const replacement = t.jSXElement(
          t.jSXOpeningElement(
            t.jSXIdentifier(
              import_name,
            ),
            path.node.openingElement.attributes.filter(attr => (
              !(
                t.isJSXAttribute(attr)
                && t.isJSXIdentifier(attr.name)
                && attr.name.name === TOKEN_NAME
              )
            ))
          ),
          t.jSXClosingElement(
            t.jSXIdentifier(
              import_name,
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
function _js_parse_statements(js_context, data, options) {

  try {

    const program = parse(data, options)

    // parse user code snippet
    _js_parse_snippet(js_context, program)

    return program.program.body

  } catch (err) {

    console.log(`_js_parse_statements error [${data}]`)
    throw err
  }
}

// parse expression with support of '$I' syntax
function _js_parse_expression(js_context, data, options) {

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
      program
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
                        throw new Error(`ERROR: name resolution conflict [${var_full_path}]`)
                    }
                }
            })
            // update our own variable name
            if (var_prefix) {
                var_name = var_name + '$' + var_prefix.pop().replace(SPECIAL_CHARACTER, '_')
            } else {
                // we have exhausted the full path, throw exception
                throw new Error(`ERROR: name resolution conflict [${var_full_path}]`)
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

function reg_js_import(js_context, var_full_path, use_default=false, suggested_name=null) {

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

// register state
function reg_react_state(js_context, react_state) {

  const { name, setter } = react_state

  // if parentPath is '[]'
  // console.log(`parentPath`, js_context.parentPath)
  if (!!js_context.parentPath) {
    js_context.states[name] = {
      parentPath: js_context.parentPath,
      name: name
    }

    js_context.states[setter] = {
      parentPath: js_context.parentPath,
      name: setter
    }
  }
}

// register form
function reg_react_form(js_context, name, qualifiedName, formProps) {

  // update js_context
  if (!!name) {
    js_context.reactForm = name
  }

  // register form name
  js_context.forms[name] = {
    qualifiedName: qualifiedName,
    formProps: formProps,
  }

  // console.log(`reg_react_form`, js_context.forms)
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
// exports
module.exports = {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  SPECIAL_CHARACTER,
  JSX_CONTEXT,
  TOKEN_IMPORT,
  TOKEN_LOCAL,
  TOKEN_JSX,
  TOKEN_NAME,
  REACT_FORM_METHODS,
  REACT_FORM_ARRAY_METHODS,
  VALID_INPUT_TYPES,
  isPrimitive,
  capitalize,
  reg_js_import,
  reg_js_variable,
  reg_react_state,
  reg_react_form,
  js_resolve_ids,
  // _js_parse_snippet,
  // _js_parse_template,
  _js_parse_statements,
  _js_parse_expression,
  _parse_var_full_path,
}
