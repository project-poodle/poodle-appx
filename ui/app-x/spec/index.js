// this file is the spec of APP-X UI builder language

import classes from 'app-x/spec/classes.js'
// react constructs
import react_element from 'app-x/spec/react_element.js'
import react_html from 'app-x/spec/react_html.js'
import react_state from 'app-x/spec/react_state.js'
import react_context from 'app-x/spec/react_context.js'
import react_effect from 'app-x/spec/react_effect.js'
// forms and inputs
import react_form from 'app-x/spec/react_form.js'
import input_text from 'app-x/spec/input_text.js'
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
// map, reduce, swith, filter
import js_switch from 'app-x/spec/js_switch.js'
import js_map from 'app-x/spec/js_map.js'
import js_reduce from 'app-x/spec/js_reduce.js'
import js_filter from 'app-x/spec/js_filter.js'
// others
import mui_style from 'app-x/spec/mui_style.js'
import appx_api from 'app-x/spec/appx_api.js'
import appx_route from 'app-x/spec/appx_route.js'

const types = [
  // react constructs
  react_element,
  react_html,
  react_state,
  react_context,
  react_effect,
  // form and inputs
  react_form,
  input_text,
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
  // map, reduce, switch, filter
  js_switch,
  js_map,
  js_reduce,
  js_filter,
  // others
  mui_style,
  appx_api,
  appx_route,
  // map
]
.map(item => {
  // validity checks
  if (!item.type) {
    throw new Error(`ERROR: type spec missing [type] [${JSON.stringify(item)}]`)
  }
  // check children
  if (!!item.children) {
    if (!Array.isArray(item.children)) {
      throw new Error(`ERROR: type spec children is not an array [${item.type}]`)
    }
    let wild_card_count = 0
    let child_array_count = 0
    let child_count = 0
    item.children.map(childSpec => {
      if (!childSpec.name) {
        throw new Error(`ERROR: type spec [${item.type}] missing child spec name [${JSON.stringify(childSpec)}]`)
      }
      child_count++
      if (childSpec.name === '*') {
        wild_card_count++
      }
      if (!!childSpec.array && !!childSpec._childNode) {
        child_array_count++
      }
      // check _thisNode
      if (!!childSpec._thisNode) {
        if (!childSpec._thisNode.class) {
          throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] _thisNode missing [class]`)
        }
        if (!childSpec._thisNode.input) {
          throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] _thisNode missing [input]`)
        }
        if (!Object.keys(classes).includes(childSpec._thisNode.class)) {
          throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] _thisNode invalid class [childSpec._thisNode.class]`)
        }
      }
      // check _childNode
      if (!!childSpec._childNode) {
        if (!childSpec._childNode.class) {
          throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] _childNode missing [class]`)
        }
        if (!Object.keys(classes).includes(childSpec._childNode.class)) {
          throw new Error(`ERROR: type spec [${item.type}] [${childSpec.name}] _childNode invalid class [childSpec._thisNode.class]`)
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
  } else {
    item.children = []
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
