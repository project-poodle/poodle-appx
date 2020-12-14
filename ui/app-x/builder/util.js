import React from 'react'
import {
  Icon,
  FileOutlined,
  FileTextOutlined,
  ContainerOutlined,
  CodepenOutlined,
  SwitcherOutlined,
  QuestionCircleOutlined,
  QuestionOutlined,
  FieldStringOutlined,
  NumberOutlined,
  SmallDashOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  MenuOutlined,
  ApartmentOutlined,
  PercentageOutlined,
  ImportOutlined,
  FunctionOutlined,
  FontSizeOutlined,
  DatabaseOutlined,
  UngroupOutlined,
  SisternodeOutlined,
  PoweroffOutlined,
  MinusCircleOutlined,
  FormatPainterOutlined,
} from '@ant-design/icons'
import {
  // FunctionOutlined as FunctionOutlinedIcon,
  AllOutOutlined,
} from '@material-ui/icons'
import { v4 as uuidv4 } from 'uuid'

import ReactIcon from 'app-x/icon/React'
// import ReactSvg from 'app-x/icon/react.svg'

const PATH_SEPARATOR = '/'
const VARIABLE_SEPARATOR = '.'

////////////////////////////////////////////////////////////////////////////////
// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
}

// parse variable full path
function parse_var_full_path(var_full_path) {

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

// create new node
function js_new_node(title, icon, data, isLeaf) {
  return {
    key: uuidv4(),
    title: title ? title : (data ? (data.name ? data.name : '') : ''),
    icon: icon ? icon : <QuestionOutlined />,
    isLeaf: isLeaf ? true : false,
    data: data ? data : null,
    children: isLeaf ? null : [],
  }
}

////////////////////////////////////////////////////////////////////////////////
// processors

// create primitive tree node
function js_primitive(js_context, name, input) {

  const prefix = name ? name + ': ' : ''

  // tree node data
  const data = {
    name: name,
    type: 'js/primitive',
    data: input,
  }

  switch (typeof input) {
    case 'string':
      const stringTitle = prefix + (input.length > 32 ? input.substring(0, 30) + '...' : input)
      return js_new_node(stringTitle, <FontSizeOutlined />, data, true)
    case 'number':
      return js_new_node(prefix + input.toString(), <NumberOutlined />, data, true)
    case 'boolean':
      return js_new_node(prefix + input.toString(), <PoweroffOutlined />, data, true)
    case 'object':
      if (input === null) {
        return js_new_node(prefix + 'null', <MinusCircleOutlined />, data, true)
      } else {
        throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
      }
    default:
      throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
  }
}

// return array tree
function js_array(js_context, name, input) {

  if (isPrimitive(input)) {
    throw new Error(`ERROR: input is primitive [${JSON.stringify(input)}]`)
  }

  if (typeof input !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${JSON.stringify(input)}]`)
  }

  if (!Array.isArray(input)) {
    throw new Error(`ERROR: input is not array [${typeof input}] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    name: name,
    type: 'js/array',
  }

  const node = js_new_node(name, <MenuOutlined />, data, false)

  // do not expand array by default
  // js_context.expandKeys.push(node.key)

  node.children = input.map(item => {
    return js_process(js_context, null, item)
  })

  return node
}

// create object tree
function js_object(js_context, name, input) {

  if (isPrimitive(input)) {
    throw new Error(`ERROR: input is primitive [${JSON.stringify(input)}]`)
  }

  if (typeof input !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${JSON.stringify(input)}]`)
  }

  if (Array.isArray(input)) {
    throw new Error(`ERROR: input is array [${typeof input}] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    name: name,
    type: 'js/object',
  }

  const node = js_new_node(name, <ApartmentOutlined />, data, false)

  // do not expand object by default
  // js_context.expandKeys.push(node.key)

  // return children sorted
  Object.keys(input).sort().map(key => {
    node.children.push(
      js_process(js_context, key, input[key])
    )
  })

  return node
}

// create import tree node
function js_import(js_context, name, input) {

  if (!('type' in input) || input.type !== 'js/import') {
    throw new Error(`ERROR: input.type is not [js/import] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/import] [${JSON.stringify(input)}]`)
  }

  // compute title
  const prefix = name ? name + ': ' : ''

  const parsed = parse_var_full_path(input.name)
  const title = prefix + parsed.full_paths.pop()

  // tree node data
  const data = {
    name: name,
    type: input.type,
    data: input.name,
  }

  const node = js_new_node(title, <ImportOutlined />, data, true)

  return node
}

// create expression tree node
function js_expression(js_context, name, input) {

  if (!('type' in input) || input.type !== 'js/expression') {
    throw new Error(`ERROR: input.type is not [js/expression] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.data missing in [js/expression] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    name: name,
    type: input.type,
    data: input.data,
  }

  // compute title
  const prefix = name ? name + ': ' : ''
  const title = prefix + (input.data.length > 32 ? input.data.substring(0, 30) + '...' : input.data)

  const node = js_new_node(title, <PercentageOutlined />, data, true)

  return node
}

// create block ast (allow return outside of function)
function js_block(js_context, name, input) {

  if (!('type' in input) || input.type !== 'js/block') {
    throw new Error(`ERROR: input.type is not [js/block] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.data missing in [js/block] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    name: name,
    type: input.type,
    data: input.data,
  }

  // compute title
  const prefix = name ? name + ': ' : ''
  const title = prefix + (input.data.length > 32 ? input.data.substring(0, 30) + '...' : input.data)

  const node = js_new_node(title, <CodepenOutlined />, data, true)

  return node
}

// create array function tree node
function js_function(js_context, name, input) {

  if (!('type' in input) || input.type !== 'js/function') {
    throw new Error(`ERROR: input.type is not [js/function] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('body' in input)) {
    throw new Error(`ERROR: input.body missing in [js/function] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    name: name,
    type: input.type,
    params: input.params,
    body: input.body,
  }

  // compute title
  const prefix = name ? name + ': ' : ''
  const title = prefix + 'function(' + (input.params ? input.params.join(', ') : '') +  ')'

  const node = js_new_node(title, <FunctionOutlined />, data, true)

  return node
}

// create switch ast
function js_switch(js_context, name, input) {

  if (!('type' in input) || input.type !== 'js/switch') {
    throw new Error(`ERROR: input.type is not [js/switch] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('children' in input)) {
    throw new Error(`ERROR: input.children missing in [js/switch] [${JSON.stringify(input)}]`)
  }

  if (! Array.isArray(input.children)) {
    throw new Error(`ERROR: input.children is not Array [${JSON.stringify(input)}]`)
  }

  // compute title
  const prefix = name ? name + ': ' : ''
  const title = prefix + 'Switch'

  // tree node data
  const data = {
    name: name,
    type: input.type,
  }

  const node = js_new_node(title, <SisternodeOutlined />, data, false)

  // expand switch by default
  js_context.expandKeys.push(node.key)

  // add each conditions and results
  input.children.map(child => {

    if (! ('condition' in child)) {
      throw new Error(`ERROR: [js/switch] child missing [condition] [${JSON.stringify(child)}]`)
    }
    if (! ('result' in child)) {
      throw new Error(`ERROR: [js/switch] child missing [result] [${JSON.stringify(child)}]`)
    }

    // process result as child node
    const childNode = js_process(js_context, null, child.result)
    // add condition data to childNode
    childNode.data.condition = child.condition

    node.children.push(childNode)
  })

  // add default if exist
  if (input.default) {
    node.children.push(
      js_process(js_context, 'default', input.default ? input.default : null)
    )
  }

  return node
}

// create js map ast
function js_map(js_context, name, input) {

  if (!('type' in input) || input.type !== 'js/map') {
    throw new Error(`ERROR: input.type is not [js/map] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.data missing in [js/map] [${JSON.stringify(input)}]`)
  }

  if (! ('result' in input)) {
    throw new Error(`ERROR: input.result missing in [js/map] [${JSON.stringify(input)}]`)
  }

  // compute title
  const prefix = name ? name + ': ' : ''
  const title = prefix + 'Map'

  // tree node data
  const data = {
    name: name,
    type: input.type,
  }

  const node = js_new_node(title, <SwapOutlined />, data, false)

  // expand map by default
  js_context.expandKeys.push(node.key)

  // add input.data
  node.children.push(
    js_process(js_context, 'data', input.data)
  )

  // add input.result
  node.children.push(
    js_process(js_context, 'result', input.result)
  )

  return node
}

// create js reduce ast
function js_reduce(js_context, name, input) {

  if (!('type' in input) || input.type !== 'js/reduce') {
    throw new Error(`ERROR: input.type is not [js/reduce] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.data missing in [js/reduce] [${JSON.stringify(input)}]`)
  }

  if (! ('reducer' in input)) {
    throw new Error(`ERROR: input.reducer missing in [js/reduce] [${JSON.stringify(input)}]`)
  }

  if (! ('init' in input)) {
    throw new Error(`ERROR: input.init missing in [js/reduce] [${JSON.stringify(input)}]`)
  }

  // compute title
  const prefix = name ? name + ': ' : ''
  const title = prefix + 'Reduce'

  // tree node data
  const data = {
    name: name,
    type: input.type,
  }

  const node = js_new_node(title, <FullscreenExitOutlined />, data, false)

  // input filter
  node.data.reducer = input.reducer

  // expand reduce by default
  js_context.expandKeys.push(node.key)

  // add input.data
  node.children.push(
    js_process(js_context, 'data', input.data)
  )

  // add input.init
  node.children.push(
    js_process(js_context, 'init', input.init)
  )

  return node
}

// create js reduce ast
function js_filter(js_context, name, input) {

  if (!('type' in input) || input.type !== 'js/filter') {
    throw new Error(`ERROR: input.type is not [js/filter] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.data missing in [js/filter] [${JSON.stringify(input)}]`)
  }

  if (! ('filter' in input)) {
    throw new Error(`ERROR: input.filter missing in [js/filter] [${JSON.stringify(input)}]`)
  }

  // compute title
  const prefix = name ? name + ': ' : ''
  const title = prefix + 'Filter'

  // tree node data
  const data = {
    name: name,
    type: input.type,
  }

  const node = js_new_node(title, <FilterOutlined />, data, false)

  // input filter
  node.data.filter = input.filter

  // expand filter by default
  js_context.expandKeys.push(node.key)

  // add input.data
  node.children.push(
    js_process(js_context, 'data', input.data)
  )

  return node
}

// create jsx element ast
function react_element(js_context, name, input) {

  if (!('type' in input) || input.type !== 'react/element') {
    throw new Error(`ERROR: input.type is not [react/element] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/element] [${JSON.stringify(input)}]`)
  }

  // compute title
  const parsed = parse_var_full_path(input.name)

  const prefix = name ? name + ': ' : ''
  const title = prefix + parsed.full_paths.pop()

  // tree node data
  const data = {
    name: name,
    type: input.type,
  }

  const node = js_new_node(title, <ReactIcon />, data, false)

  // expand react element by default
  js_context.expandKeys.push(node.key)

  // add input.props
  if (input.props) {
    node.children.push(
      js_process(js_context, 'props', input.props)
    )
  }

  // add input.children
  if ('children' in input && input.children) {
    if (!Array.isArray(input.children)) {
      throw new Error(`ERROR: input.children is not Array [${typeof input.children}]`)
    }

    input.children.map(child => {
      node.children.push(
        js_process(js_context, null, child)
      )
    })
  }

  return node
}

// create jsx html element ast
function react_html(js_context, name, input) {

  if (!('type' in input) || input.type !== 'react/html') {
    throw new Error(`ERROR: input.type is not [react/html] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/html] [${JSON.stringify(input)}]`)
  }

  // compute title
  const parsed = parse_var_full_path(input.name)

  const prefix = name ? name + ': ' : ''
  const title = prefix + parsed.full_paths.pop()

  // tree node data
  const data = {
    name: name,
    type: input.type,
  }

  const node = js_new_node(title, <ContainerOutlined />, data, false)

  // expand react html by default
  js_context.expandKeys.push(node.key)

  // add input.props
  node.children.push(
    js_process(js_context, 'props', 'props' in input ? input.props : null)
  )

  // add input.children
  if ('children' in input && input.children) {
    if (!Array.isArray(input.children)) {
      throw new Error(`ERROR: input.children is not Array [${typeof input.children}]`)
    }

    input.children.map(child => {
      node.children.push(
        js_process(js_context, null, child)
      )
    })
  }

  return node
}

// create react state ast
function react_state(js_context, name, input) {

  if (!('type' in input) || input.type !== 'react/state') {
    throw new Error(`ERROR: input.type is not [react/state] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/state] [${JSON.stringify(input)}]`)
  }

  if (! ('setter' in input)) {
    throw new Error(`ERROR: input.setter missing in [react/state] [${JSON.stringify(input)}]`)
  }

  if (! ('init' in input)) {
    throw new Error(`ERROR: input.init missing in [react/state] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    name: name,
    type: input.type,
    data: {
      name: input.name,
      setter: input.setter,
      init: input.init,
    }
  }

  const node = js_new_node(name, <DatabaseOutlined />, data, true)

  return node
}

// create react effect block ast (do not allow return outside of function)
function react_effect(js_context, name, input) {

  if (!('type' in input) || input.type !== 'react/effect') {
    throw new Error(`ERROR: input.type is not [react/effect] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.data missing in [react/effect] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    name: name,
    type: input.type,
    data: input.data,
  }

  const node = js_new_node(name, <UngroupOutlined />, data, true)

  return node
}


// create mui style expression
function mui_style(js_context, name, input) {

  if (!('type' in input) || input.type !== 'mui/style') {
    throw new Error(`ERROR: input.type is not [mui/style] [${input.type}] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    name: name,
    type: input.type,
  }

  const node = js_new_node(name, <FormatPainterOutlined />, data, false)

  // do not expand mui styles by default
  // js_context.expandKeys.push(node.key)

  // add all styles children
  Object.keys(input).sort().map(key => {
    if (key == 'type') {
      return
    }
    node.children.push(
      js_process(js_context, key, input[key])
    )
  })

  return node
}

// create jsx route ast
function appx_route(js_context, name, input) {

  if (!('type' in input) || input.type !== 'appx/route') {
    throw new Error(`ERROR: input.type is not [appx/route] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (!('appx' in js_context) || !('ui_deployment' in js_context.appx)) {
    throw new Error(`ERROR: context missing appx.ui_deployment [${JSON.stringify(js_context)}]`)
  }

  // tree node data
  const data = {
    name: name,
    type: input.type,
  }

  const node = js_new_node(name, <AllOutOutlined />, data, true)

  return node
}

////////////////////////////////////////////////////////////////////////////////

// process input data and return tree data
function js_process(js_context, name, input) {

  if (! ('expandKeys' in js_context)) {
    js_context.expandKeys = []
  }

  if (isPrimitive(input)) {
    return js_primitive(js_context, name, input)
  }

  if (Array.isArray(input)) {
    return js_array(js_context, name, input)
  }

  if (! ('type' in input)) {
    // no 'type' is treated as json object
    return js_object(js_context, name, input)
  }

  // 'type' is presented in the json object
  if (input.type === 'js/import') {

    return js_import(js_context, name, input)

  } else if (input.type === 'js/export') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)


  } else if (input.type === 'js/variable') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type === 'js/expression') {

    return js_expression(js_context, name, input)

  } else if (input.type === 'js/block') {

    return js_block(js_context, name, input)

  } else if (input.type === 'js/function') {

    return js_function(js_context, name, input)

  } else if (input.type === 'js/call') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type === 'js/switch') {

    return js_switch(js_context, name, input)

  } else if (input.type === 'js/map') {

    return js_map(js_context, name, input)

  } else if (input.type === 'js/reduce') {

    return js_reduce(js_context, name, input)

  } else if (input.type === 'js/filter') {

    return js_filter(js_context, name, input)

  } else if (input.type === 'js/transform') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type === 'js/trigger') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type === 'react/element') {

    return react_element(js_context, name, input)

  } else if (input.type === 'react/html') {

    return react_html(js_context, name, input)

  } else if (input.type === 'react/state') {

    return react_state(js_context, name, input)

  } else if (input.type === 'react/effect') {

    return react_effect(js_context, name, input)

  } else if (input.type === 'mui/style') {

    return mui_style(js_context, name, input)

  } else if (input.type === 'mui/control') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type === 'appx/route') {

    return appx_route(js_context, name, input)

  } else {

    throw new Error(`ERROR: unrecognized input.type [${input.type}] [${JSON.stringify(input)}]`)
  }
}

export {
  js_process,
}
