// this file is the spec of APP-X UI builder language

import classes from 'app-x/spec/classes.js'
// react constructs
import react_element from 'app-x/spec/react_element.js'
import react_html from 'app-x/spec/react_html.js'
import react_state from 'app-x/spec/react_state.js'
import react_context from 'app-x/spec/react_context.js'
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
].map(item => ({
  key: item.name,
  value: item
})).reduce(
  (accumulator, item) => { accumulator[item.key] = item.value; return accumulator; },
  {}
)

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
