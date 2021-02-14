// this file is the spec of APP-X UI builder language

import { REGEX_VAR, classes } from 'app-x/spec/classes.js'
// react constructs
import react_element from 'app-x/spec/react_element.js'
import react_html from 'app-x/spec/react_html.js'
import react_state from 'app-x/spec/react_state.js'
import react_effect from 'app-x/spec/react_effect.js'
import react_context from 'app-x/spec/react_context.js'
// form, dialog, and inputs
import appx_form from 'app-x/spec/appx_form.js'
import appx_dialog from 'app-x/spec/appx_dialog.js'
import appx_input_text from 'app-x/spec/appx_input_text.js'
import appx_input_textarray from 'app-x/spec/appx_input_textarray.js'
import appx_input_switch from 'app-x/spec/appx_input_switch.js'
import appx_input_select from 'app-x/spec/appx_input_select.js'
import appx_input_tabular from 'app-x/spec/appx_input_tabular.js'
import appx_input_collection from 'app-x/spec/appx_input_collection.js'
import appx_input_submit from 'app-x/spec/appx_input_submit.js'
import appx_input_reset from 'app-x/spec/appx_input_reset.js'
import appx_input_rule from 'app-x/spec/appx_input_rule.js'
// appx table and columns
import appx_table from 'app-x/spec/appx_table.js'
import appx_table_column from 'app-x/spec/appx_table_column.js'
// javascript classes
import js_null from 'app-x/spec/js_null.js'
import js_string from 'app-x/spec/js_string.js'
import js_number from 'app-x/spec/js_number.js'
import js_boolean from 'app-x/spec/js_boolean.js'
import js_object from 'app-x/spec/js_object.js'
import js_array from 'app-x/spec/js_array.js'
// expressin, function,
import js_import from 'app-x/spec/js_import.js'
import js_expression from 'app-x/spec/js_expression.js'
import js_statement from 'app-x/spec/js_statement.js'
import js_function from 'app-x/spec/js_function.js'
import js_call from 'app-x/spec/js_call.js'
// map, reduce, swith, filter
import js_condition from 'app-x/spec/js_condition.js'
import js_map from 'app-x/spec/js_map.js'
import js_reduce from 'app-x/spec/js_reduce.js'
import js_filter from 'app-x/spec/js_filter.js'
// mui
import mui_style from 'app-x/spec/mui_style.js'
import mui_theme from 'app-x/spec/mui_theme.js'
// routes
import route_path from 'app-x/spec/route_path.js'
import route_context from 'app-x/spec/route_context.js'
// appx api
import appx_api from 'app-x/spec/appx_api.js'

// check type spec
function check_type_spec(typeSpec) {
  // basic checks
  if (typeof typeSpec === 'string') {
    if (typeSpec === 'inherit') {
      return true
    } else {
      throw new Error(`ERROR: unrecognized type spec [${typeSpec}]`)
    }
  } else if (!Array.isArray(typeSpec)) {
    throw new Error(`ERROR: type spec is not [inherit] or Array [${JSON.stringify(typeSpec)}]`)
  // } else {
  //  throw new Error(`ERROR: unrecognized type spec [${JSON.stringify(typeSpec)}]`)
  }
  // iterate type spec array
  typeSpec.map(spec => {
    if (typeof spec !== 'object' || !spec) {
      throw new Error(`ERROR: unrecognized type spec [${JSON.stringify(spec)}]`)
    }
    if (!spec.kind) {
      throw new Error(`ERROR: type spec missing [kind] [${JSON.stringify(spec)}]`)
    }
    if (!spec.data) {
      throw new Error(`ERROR: type spec missing [data] [${JSON.stringify(spec)}]`)
    }
    // check kind
    switch (spec.kind) {
      case 'class':
        // check class name is valid
        if (!classes[spec.data]) {
          throw new Error(`ERROR: unrecognized type spec [class] [${spec.data}]`)
        }
        break
      case 'type':
        // check spec.data is string
        if (typeof spec.data !== 'string') {
          throw new Error(`ERROR: unrecognized type spec [type] [${spec.data}]`)
        }
        break
      case 'shape':
        // check spec.data is object
        if (typeof spec.data !== 'object' || !spec.data) {
          throw new Error(`ERROR: unrecognized type spec [shape] [${spec.data}]`)
        }
        // iterate all types in shape data
        Object.keys(spec.data).map(shapeKey => {
          if (!shapeKey.match(REGEX_VAR)) {
            throw new Error(`ERROR: shape key is not a valid name [${shapeKey}]`)
          }
          const shapeSpec = spec.data[shapeKey]
          if (!shapeSpec.desc) {
            throw new Error(`ERROR: shape spec missing [desc] [${JSON.stringify(shapeSpec)}]`)
          }
          if (!shapeSpec.types) {
            throw new Error(`ERROR: shape spec missing [types] [${JSON.stringify(shapeSpec)}]`)
          }
          check_type_spec(shapeSpec.types)
        })
        break
      default:
        throw new Error(`ERROR: unrecognized type spec [kind] [${spec.kind}]`)
    }
  })
  // we are here if all checks passed
  return true
}

const types = [
  // react constructs
  react_element,
  react_html,
  react_state,
  react_effect,
  react_context,
  // form and inputs
  appx_form,
  appx_dialog,
  appx_input_text,
  appx_input_textarray,
  appx_input_switch,
  appx_input_select,
  appx_input_tabular,
  appx_input_collection,
  appx_input_submit,
  appx_input_reset,
  appx_input_rule,
  // table and columns
  appx_table,
  appx_table_column,
  // javascript classes,
  js_null,
  js_string,
  js_number,
  js_boolean,
  js_object,
  js_array,
  // expression, function and etc
  js_import,
  js_expression,
  js_statement,
  js_function,
  js_call,
  // map, reduce, switch, filter
  js_condition,
  js_map,
  js_reduce,
  js_filter,
  // mui
  mui_style,
  mui_theme,
  // route
  route_path,
  route_context,
  // appx
  appx_api,
  // map
]
.map(item => {
  // validity checks
  if (!item.type) {
    throw new Error(`ERROR: type spec missing [type] [${JSON.stringify(item)}]`)
  }
  // check desc
  if (!item.desc) {
    throw new Error(`ERROR: type spec [${item.type}] missing [desc]`)
  }
  // check children
  if (!item.children) {
    throw new Error(`ERROR: type spec [${item.type}] missing [children]`)
  }
  // children array check
  if (!Array.isArray(item.children)) {
    throw new Error(`ERROR: type spec children is not an array [${item.type}]`)
  }
  // iterate children
  let wild_card_count = 0
  let child_array_count = 0
  let child_count = 0
  item.children.map(childSpec => {
    if (!childSpec.name) {
      throw new Error(`ERROR: type spec [${item.type}] child missing name [${JSON.stringify(childSpec)}]`)
    }
    // check desc
    if (!childSpec.desc) {
      throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] missing [desc]`)
    }
    // check types
    if (!childSpec.types) {
      throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] missing [types]`)
    } else {
      check_type_spec(childSpec.types)
    }
    // check children
    child_count++
    if (childSpec.name === '*') {
      wild_card_count++
    }
    if (!!childSpec.array && !!childSpec._childNode) {
      child_array_count++
    }
    // at least one of _thisNode or _childNode must exist
    if (!childSpec._thisNode && !childSpec._childNode) {
      throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] missing [_thisNode] or [_childNode]`)
    }
    // check _thisNode
    if (!!childSpec._thisNode) {
      if (!childSpec._thisNode.types) {
        throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] _thisNode missing [types]`)
      } else {
        check_type_spec(childSpec._thisNode.types)
      }
      if (!!childSpec._thisNode.input) {
      //   throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] _thisNode missing [input]`)
        if (!childSpec._thisNode.input.kind) {
          throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] _thisNode missing [input.kind]`)
        }
      }
    }
    // check _childNode
    if (!!childSpec._childNode) {
      if (!childSpec._childNode.types) {
        throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] _childNode missing [types]`)
      } else {
        check_type_spec(childSpec._childNode.types)
      }
      if (!!childSpec._childNode.input) {
        if (!childSpec._childNode.input.kind) {
          throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] _childNode missing [input.kind]`)
        }
      }
    }
  })
  // check wild_card_count
  if (wild_card_count > 1) {
    throw new Error(`ERROR: type_spec has more than one child with wildcard name [${item.type}]`)
  }
  // check array_count
  if (child_array_count > 1) {
    throw new Error(`ERROR: type_spec has more than one [array] child node [${item.type}]`)
  }
  // check no wild_card_count and child_array_count
  if (wild_card_count + child_array_count > 1) {
    throw new Error(`ERROR: type_spec has both wildcard and [array] child node [${item.type}]`)
  }
  // check no other children if wild_card_count exists
  if (wild_card_count > 0 && child_count > 1) {
    throw new Error(`ERROR: type_spec has mixed wildcard and non-wildcard children [${item.type}]`)
  }
  // we are here if we have passed all validity checks
  return item
})
.map(item => ({
  key: item.type,
  value: item
}))
.reduce(
  (accumulator, item) => { accumulator[item.key] = item.value; return accumulator; },
  {}
)

// define unique
Object.defineProperty(Array.prototype, 'unique', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: function() {
    var a = this.concat()
    for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
        if(a[i] === a[j]) {
          a.splice(j--, 1)
        }
      }
    }
    return a
  }
})

// update classes to fill all defs
Object.keys(classes).map(cls => {
  const def = classes[cls]
  const newDef = {
    classes: def.classes || [],
    types: def.types || [],
    literals: def.literals || [],
  }
  // add self to classes
  newDef.classes = (def.classes || []).concat(cls).sort().unique()
  // merge classes
  newDef.classes.map(derivedClass => {
    if (!!classes[derivedClass] && !!classes[derivedClass].classes) {
      newDef.classes = newDef.classes.concat(classes[derivedClass].classes).sort().unique()
    } else {
      newDef.classes = newDef.classes.sort().unique()
    }
  })
  // merge types
  newDef.classes.map(derivedClass => {
    if (!!classes[derivedClass] && !!classes[derivedClass].types) {
      newDef.types = (newDef.types || []).concat(classes[derivedClass].types).sort().unique()
    } else {
      newDef.types = newDef.types.sort().unique()
    }
  })
  // merge literals
  newDef.classes.map(derivedClass => {
    if (!!classes[derivedClass] && !!classes[derivedClass].literals) {
      newDef.literals = (newDef.literals || []).concat(classes[derivedClass].literals).sort().unique()
    } else {
      newDef.literals = newDef.literals.sort().unique()
    }
  })
  // update def
  classes[cls] = {
    ...def,
    ...newDef,
  }
})
// console.log(`classes`, JSON.stringify(classes, null, 2))

// export specific spec
export {
  classes as classes,
  types as types,
}

// export default
export default {
  classes: classes,
  types: types,
}
