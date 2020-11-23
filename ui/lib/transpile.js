import * as acorn from 'acorn'
import jsx from 'acorn-jsx'
import escodegen from 'escodegen'
import Babel from '@babel/standalone'
import { clone, cloneDeep } from 'lodash' // Import the clone, cleanDeep

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
    "self/": "/ui/sys/appx/base/internal/"
  }
}

////////////////////////////////////////////////////////////////////////////////
// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
}

////////////////////////////////////////////////////////////////////////////////
// traverse
function traverse(input, import_maps) {

  if (!('imports' in import_maps)) {
    return input
  }

  if (isPrimitive(input)) {

    return input

  } else if (Array.isArray(input)) {

    let result = []

    for (let child of input) {

        result.push(traverse(child, import_maps))
    }

    return result

  } else if (typeof input === 'object' && input !== null) {

    let result = {}

    if (('type' in input)
        && (input.type == 'ImportDeclaration')
        && ('source' in input)
        && ('type' in input.source)
        && (input.source.type == 'Literal')
        && ('value' in input.source)
      ) {

      let src_val = input.source.value
      if (src_val.startsWith('.') || src_val.startsWith('/')) {
        return input
      }

      result = cloneDeep(input)

      let found = false
      Object.keys(import_maps.imports).map(key => {

        if (found) {
          return
        } else if (src_val == key) {
          found = true
          result.source.value = import_maps.imports[key]
        } else if (key.endsWith('/') && src_val.startsWith(key)) {
          found = true
          result.source.value = import_maps.imports[key] + src_val.substring(key.length)
        }
      })

      if (!found) {
        throw new Error('unrecognized import source [' + src_val + ']. Available import maps are: [' + Object.keys(import_maps.imports) + ']')
      }

    } else {

      for (let key in input) {
        result[key] = traverse(input[key], import_maps)
      }
    }

    return result

  } else if (input == null) {

    return null

  } else {

    throw new Error(`Unrecognized input source [${input}]`)
  }
}

export default function transpile(input, import_maps) {

  try {
    //console.log(input)
    var output = Babel.transform(input, babelConf).code;
    //console.log(output)
    const JSXParser = acorn.Parser.extend(jsx())
    let ast_tree = JSXParser.parse(output, {ecmaVersion: 2020, sourceType: "module"})
    //console.log(JSON.stringify(ast_tree, null, 4))
    let converted_tree = traverse(ast_tree, import_maps || default_import_maps)
    //console.log(JSON.stringify(converted_tree, null, 4))
    let converted = escodegen.generate(converted_tree)
    //console.log(converted)
    return converted

  } catch (err) {

    console.log(err.stack)
    throw err
  }
}
