const fs = require('fs')
const path = require('path');
const objPath = require("object-path")
const Mustache = require('mustache')
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const babel = require('@babel/standalone')
const generate = require('@babel/generator').default
const t = require("@babel/types")

// console.log(generate)

////////////////////////////////////////////////////////////////////////////////
// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
}

function process_primitive(input) {

  switch (typeof input) {
    case 'string':
      return t.stringLiteral(input)
    case 'number':
      return t.numericLiteral(input)
    case 'boolean':
      return t.booleanLiteral(input)
    case 'object':
      if (input == null) {
        return t.nullLiteral()
      } else {
        throw new Error(`ERROR: input is not primitive [${typeof input}] [${input}]`)
      }
    default:
      throw new Error(`ERROR: input is not primitive [${typeof input}] [${input}]`)
  }
}

function process_object(input) {

  if (typeof input != 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${input}]`)
  }

  if (Array.isArray(input)) {
    return t.arrayExpression(
      input.map(row => {
        return isPrimitive(row) ? process_primitive(row) : process_object(row)
      })
    )
  } else {
    return t.objectExpression(
      Object.keys(input).map(key => {
        const value = input[key]
        return t.objectProperty(
          t.stringLiteral(key),
          isPrimitive(value) ? process_primitive(value) : process_object(value)
        )
      })
    )
  }
}

/**
 * process properties
 */
function process_props(props, context) {

  if (! props) {
    return []
  }

  const results = Object.keys(props).map(prop_key => {
    const prop = props[prop_key]
    return t.jSXAttribute(
      t.jSXIdentifier(prop_key),
      typeof prop == 'string'
        ? t.stringLiteral(prop) // TODO
        : t.jSXExpressionContainer(
            isPrimitive(prop)
              ? process_primitive(prop)
                : process_object(prop)
          )
    )
  })

  // console.log(results)
  return results
}

/**
 * handle_html
 */
function handle_react(req, res) {

    const { ui_deployment, ui_element } = req.context

    if (! ('ui_app_spec' in ui_deployment) || ! ('importMaps' in ui_deployment.ui_app_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_app_spec.importMaps not defined [${ui_deployment}]`
        })
        return
    }

    if (! ('ui_element_spec' in ui_element) || ! ('name' in ui_element.ui_element_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_element_spec.name not defined [${ui_element}]`
        })
        return
    }

    const elem_paths = ui_element.ui_element_name.split("/")
    const elem_name = elem_paths.pop()
    console.log(elem_name)

    const props = ui_element.ui_element_spec.props
    const children = ui_element.ui_element_spec.children

    const program = t.program(
      [
        t.variableDeclaration(
          'const',
          [
            t.variableDeclarator(
              t.identifier(elem_name),
              t.arrowFunctionExpression(
                [
                  t.identifier('props'),
                  t.identifier('children'),
                ],
                t.blockStatement(
                  [
                    t.returnStatement(
                      t.jSXElement(
                        t.jSXOpeningElement(
                          t.jSXIdentifier(elem_name),
                          process_props(props)
                        ),
                        t.jSXClosingElement(
                          t.jSXIdentifier(elem_name)
                        ),
                        children ? children.map(child => {
                          child
                          // TODO - children
                        }) : []
                      )
                    )
                  ]
                )
              )
            )
          ]
        ),
        t.exportDefaultDeclaration(
          t.identifier(elem_name)
        ),
      ],
      [], // program directives
      "module"
    )

    const output = generate(program, {}, {})

    res.status(200).type('application/javascript').send(output.code)
}

// export
module.exports = {
    handle_react: handle_react
}
