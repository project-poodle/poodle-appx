import React from 'react'
import {
  Icon,
  FileOutlined,
  FileTextOutlined,
  // ContainerOutlined,
  // CodepenOutlined,
  SwitcherOutlined,
  QuestionCircleOutlined,
  QuestionOutlined,
  FieldStringOutlined,
  NumberOutlined,
  // SmallDashOutlined,
  // SwapOutlined,
  FullscreenExitOutlined,
  FilterOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  // MenuOutlined,
  // ApartmentOutlined,
  PercentageOutlined,
  // ImportOutlined,
  // FunctionOutlined,
  // FontSizeOutlined,
  // DatabaseOutlined,
  // UngroupOutlined,
  // SisternodeOutlined,
  PoweroffOutlined,
  MinusCircleOutlined,
  FormatPainterOutlined,
  DoubleRightOutlined,
  BranchesOutlined,
  CompressOutlined,
  // AppstoreAddOutlined,
  MinusOutlined,
  StopOutlined,
  DashOutlined,
  HomeOutlined,
} from '@ant-design/icons'
//import {
  // FunctionOutlined as FunctionOutlinedIcon,
  // AllOutOutlined,
//} from '@material-ui/icons'
import { v4 as uuidv4 } from 'uuid'

import ReactIcon from 'app-x/icon/React'
// import Database from 'app-x/icon/Database'
import Html from 'app-x/icon/Html'
import Import from 'app-x/icon/Import'
import Text from 'app-x/icon/Text'
import Css from 'app-x/icon/Css'
import Bracket from 'app-x/icon/Bracket'
import CurlyBracket from 'app-x/icon/CurlyBracket'
import Calculator from 'app-x/icon/Calculator'
import Function from 'app-x/icon/Function'
import Code from 'app-x/icon/Code'
import Branch from 'app-x/icon/Branch'
import Route from 'app-x/icon/Route'
import Effect from 'app-x/icon/Effect'
import State from 'app-x/icon/State'
import Style from 'app-x/icon/Style'
import Pointer from 'app-x/icon/Pointer'

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

////////////////////////////////////////////////////////////////////////////////

// lookup icon by type
function lookup_icon_for_type(type) {
  return lookup_icon_for_input({type: type, data: ''})
}

// lookup icon for input (input.type)
function lookup_icon_for_input(input) {

  function _primitive_icon(data) {
    switch (typeof data) {
      case 'string':
        return <Text />
      case 'number':
        return <NumberOutlined />
      case 'boolean':
        return <PoweroffOutlined />
      case 'undefined':
        return <MinusCircleOutlined />
      case 'object':
        if (input === null) {
          return <MinusCircleOutlined />
        } else {
          throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
        }
      default:
        throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
    }
  }

  if (isPrimitive(input)) {
    return _primitive_icon(input)
  }

  if (Array.isArray(input)) {
    return <Bracket />
  }

  if (! ('type' in input)) {
    return <CurlyBracket />
  }

  // 'type' is presented in the json object
  if (input.type === 'js/string') {

    return <Text />

  } else if (input.type === 'js/number') {

    return  <NumberOutlined />

  } else if (input.type === 'js/boolean') {

    return  <PoweroffOutlined />

  } else if (input.type === 'js/null') {

    return  <MinusCircleOutlined />

  } else if (input.type === 'js/array') {

    return  <Bracket />

  } else if (input.type === 'js/object') {

    return <CurlyBracket />

  } else if (input.type === 'js/import') {

    return <Import />

  } else if (input.type === 'js/expression') {

    return <PercentageOutlined />

  } else if (input.type === 'js/block') {

    return <Code />

  } else if (input.type === 'js/function') {

    return <Function />

  } else if (input.type === 'js/switch') {

    return <Branch />

  } else if (input.type === 'js/map') {

    return <DoubleRightOutlined />

  } else if (input.type === 'js/reduce') {

    return <CompressOutlined />

  } else if (input.type === 'js/filter') {

    return <FilterOutlined />

  } else if (input.type === 'react/element') {

    return <ReactIcon />

  } else if (input.type === 'react/html') {

    return <Html />

  } else if (input.type === 'react/state') {

    return <State />

  } else if (input.type === 'react/effect') {

    return <Effect />

  } else if (input.type === 'mui/style') {

    return <Style />

  } else if (input.type === 'mui/control') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type === 'appx/route') {

    return <Route />

  } else if (input.type === 'pointer') {

    return <Pointer />

  } else if (input.type === '/') {

    return <HomeOutlined />

  } else {

    return <QuestionOutlined />
  }
}

// lookup title for input (input.type / input.name / input.data ...)
function lookup_title_for_input(ref, input) {

  const prefix = ref ? ref + ': ' : ''

  function _primitive_title(data) {
    switch (typeof data) {
      case 'string':
        return prefix + (data.length > 32 ? data.substring(0, 30) + '...' : data)
      case 'number':
        return prefix + data.toString()
      case 'boolean':
        return prefix + data.toString()
      case 'undefined':
        return prefix + 'null'
      case 'object':
        if (data === null) {
          return prefix + 'null'
        } else {
          throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
        }
      default:
        throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
    }
  }

  if (isPrimitive(input)) {
    return _primitive_title(input)
  }

  if (Array.isArray(input)) {
    return ref ? ref : ''
  }

  if (! ('type' in input)) {
    return ref ? ref : ''
  }

  // 'type' is presented in the json object
  if (input.type === 'js/string') {

    return _primitive_title(String(input.data))

  } else if (input.type === 'js/number') {

    return _primitive_title(isNaN(Number(input.data)) ? 0 : Number(input.data))

  } else if (input.type === 'js/boolean') {

    return _primitive_title(Boolean(input.data))

  } else if (input.type === 'js/null') {

    return _primitive_title(null)

  } else if (input.type === 'js/array') {

    return ref ? ref : ''

  } else if (input.type === 'js/object') {

    return ref ? ref : ''

  } else if (input.type === 'js/import') {

    const parsed = parse_var_full_path(input.name)
    return prefix + parsed.full_paths.pop()

  } else if (input.type === 'js/expression') {

    return prefix + (input.data.length > 32 ? input.data.substring(0, 30) + '...' : input.data)

  } else if (input.type === 'js/block') {

    return prefix + (input.data.length > 32 ? input.data.substring(0, 30) + '...' : input.data)

  } else if (input.type === 'js/function') {

    return prefix + 'function(' + (input.params ? input.params.join(', ') : '') +  ')'

  } else if (input.type === 'js/switch') {

    return prefix + 'Switch'

  } else if (input.type === 'js/map') {

    return prefix + 'Map'

  } else if (input.type === 'js/reduce') {

    return prefix + 'Reduce'

  } else if (input.type === 'js/filter') {

    return prefix + 'Filter'

  } else if (input.type === 'react/element') {

    const parsed = parse_var_full_path(input.name)
    return prefix + parsed.full_paths.pop()

  } else if (input.type === 'react/html') {

    const parsed = parse_var_full_path(input.name)
    return prefix + parsed.full_paths.pop()

  } else if (input.type === 'react/state') {

    return prefix + input.name

  } else if (input.type === 'react/effect') {

    return prefix + (input.data.length > 32 ? input.data.substring(0, 30) + '...' : input.data)

  } else if (input.type === 'mui/style') {

    return ref ? ref : ''

  } else if (input.type === 'mui/control') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type === 'appx/route') {

    return ref ? ref : ''

  } else {

    return ref ? ref : ''
  }
}

////////////////////////////////////////////////////////////////////////////////
// create new node
function new_js_node(title, icon, data, parentKey, isLeaf) {
  return {
    key: uuidv4(),
    parentKey: parentKey,
    title: title ? title : (data ? (data.__ref ? data.__ref : '') : ''),
    data: data ? data : null,
    icon: icon ? icon : <QuestionOutlined />,
    isLeaf: isLeaf ? true : false,
    children: isLeaf ? null : [],
  }
}

// create new root node
function new_root_node() {
  return {
    key: '/',
    parentKey: null,
    title: '/',
    data: {
      __ref: null,
      type: '/'
    },
    icon: lookup_icon_for_type('/'),
    isLeaf: true,
    children: null,
  }
}

////////////////////////////////////////////////////////////////////////////////
// processors

// create primitive tree node
function parse_js_primitive(js_context, parentKey, ref, input) {

  const prefix = ref ? ref + ': ' : ''

  // tree node data
  const data = {
    __ref: ref,
    type: (input === null || typeof input === 'undefined') ? 'js/null' : ('js/' + typeof input),
    data: (input === null || typeof input === 'undefined') ? null : input,
  }

  switch (typeof input) {
    case 'string':
      return new_js_node(
        lookup_title_for_input(ref, input),
        lookup_icon_for_input(input),
        data,
        parentKey,
        true)
    case 'number':
      return new_js_node(
        lookup_title_for_input(ref, input),
        lookup_icon_for_input(input),
        data,
        parentKey,
        true)
    case 'boolean':
      return new_js_node(
        lookup_title_for_input(ref, input),
        lookup_icon_for_input(input),
        data,
        parentKey,
        true)
    case 'undefined':                         // treat undefined as null
      return new_js_node(
        lookup_title_for_input(ref, input),
        lookup_icon_for_input(input),
        data,
        parentKey,
        true)
    case 'object':
      if (input === null) {
        return new_js_node(
          lookup_title_for_input(ref, input),
          lookup_icon_for_input(input),
          data,
          parentKey,
          true)
      } else {
        throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
      }
    default:
      throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
  }
}

// return array tree
function parse_js_array(js_context, parentKey, ref, input) {

  // tree node data
  const data = {
    __ref: ref,
    __childrenWithRef: {
      enable: false
    },
    __childrenWithoutRef: {
      enable: true
    },
    type: 'js/array',
  }

  // empty input
  if (!input) {

    return new_js_node(
      lookup_title_for_input(ref, {type: 'js/array'}),
      lookup_icon_for_input({type: 'js/array'}),
      data,
      parentKey,
      false)
  }

  // for non empty input
  if (isPrimitive(input)) {
    throw new Error(`ERROR: input is primitive [${JSON.stringify(input)}]`)
  }

  if (typeof input !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${JSON.stringify(input)}]`)
  }

  if (!Array.isArray(input)) {
    throw new Error(`ERROR: input is not array [${typeof input}] [${JSON.stringify(input)}]`)
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    false)

  // do not expand array by default
  // js_context.expandedKeys.push(node.key)

  if (js_context.topLevel) {

    input.map(item => {
      node.children.push(
        parse_js(
          {
            ...js_context,
            topLevel: false,
          },
          null,
          null,
          item
        )
      )
    })

    // return node with children
    return node

  } else {
    node.children = input.map(item => {
      return parse_js(
        js_context,
        node.key,
        null,
        item
      )
    })

    return node
  }
}

// create object tree
function parse_js_object(js_context, parentKey, ref, input) {

  // tree node data
  const data = {
    __ref: ref,
    __childrenWithRef: {
      enable: true
    },
    __childrenWithoutRef: {
      enable: false
    },
    type: 'js/object',
  }

  // empty input
  if (!input) {

    return new_js_node(
      lookup_title_for_input(ref, {type: 'js/object'}),
      lookup_icon_for_input({type: 'js/object'}),
      data,
      parentKey,
      false)
  }

  // for non empty input
  if (isPrimitive(input)) {
    throw new Error(`ERROR: input is primitive [${JSON.stringify(input)}]`)
  }

  if (typeof input !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${JSON.stringify(input)}]`)
  }

  if (Array.isArray(input)) {
    throw new Error(`ERROR: input is array [${typeof input}] [${JSON.stringify(input)}]`)
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    false)

  // do not expand object by default
  // js_context.expandedKeys.push(node.key)

  if (js_context.topLevel) {
    // return children only
    const results = []
    Object.keys(input).map(key => {
      // skip keys starts with '__'
      if (key.startsWith('__')) {
        return
      }
      // add children to node
      results.push(
        parse_js(
          {
            ...js_context,
            topLevel: false,
          },
          null,
          key,
          input[key]
        )
      )
    })

    // add root element to the top level
    results.unshift(new_root_node())

    return results
  } else {
    // return node with children
    Object.keys(input).map(key => {
      // skip keys starts with '__'
      if (key.startsWith('__')) {
        return
      }
      // add children to node
      node.children.push(
        parse_js(
          js_context,
          node.key,
          key,
          input[key]
        )
      )
    })

    return node
  }
}

// create import tree node
function parse_js_import(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'js/import') {
    throw new Error(`ERROR: input.type is not [js/import] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/import] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    __ref: ref,
    type: input.type,
    name: input.name,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    true)

  return node
}

// create expression tree node
function parse_js_expression(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'js/expression') {
    throw new Error(`ERROR: input.type is not [js/expression] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.data missing in [js/expression] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    __ref: ref,
    type: input.type,
    data: input.data,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    true)

  return node
}

// create block tree node (allow return outside of function)
function parse_js_block(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'js/block') {
    throw new Error(`ERROR: input.type is not [js/block] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.data missing in [js/block] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    __ref: ref,
    type: input.type,
    data: input.data,
  }

  // compute title
  const title = lookup_title_for_input(ref, input)

  const node = new_js_node(title, lookup_icon_for_input(input), data, parentKey, true)

  return node
}

// create array function tree node
function parse_js_function(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'js/function') {
    throw new Error(`ERROR: input.type is not [js/function] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('body' in input)) {
    throw new Error(`ERROR: input.body missing in [js/function] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    __ref: ref,
    type: input.type,
    params: input.params,
    body: input.body,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    true)

  return node
}

// create switch tree node
function parse_js_switch(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'js/switch') {
    throw new Error(`ERROR: input.type is not [js/switch] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('children' in input)) {
    throw new Error(`ERROR: input.children missing in [js/switch] [${JSON.stringify(input)}]`)
  }

  if (! Array.isArray(input.children)) {
    throw new Error(`ERROR: input.children is not Array [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    __ref: ref,
    __childrenWithRef: {
      enable: true,
      validRefs: [ 'default' ],
    },
    __childrenWithoutRef: {
      enable: true,
      extraProps: [ 'condition' ],
    },
    type: input.type,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    false)

  // expand switch by default
  js_context.expandedKeys.push(node.key)

  // add each conditions and results
  input.children.map(child => {

    if (! ('condition' in child)) {
      throw new Error(`ERROR: [js/switch] child missing [condition] [${JSON.stringify(child)}]`)
    }
    if (! ('result' in child)) {
      throw new Error(`ERROR: [js/switch] child missing [result] [${JSON.stringify(child)}]`)
    }

    // process result as child node
    const childNode = parse_js(
      {
        ...js_context,
        topLevel: false,
      },
      node.key,
      null,
      child.result
    )
    // add condition data to childNode
    childNode.data.condition = child.condition

    node.children.push(childNode)
  })

  // add default if exist
  if (input.default) {
    node.children.push(
      parse_js(
        {
          ...js_context,
          topLevel: false,
        },
        node.key,
        'default',
        input.default ? input.default : null
      )
    )
  }

  return node
}

// create js map tree node
function parse_js_map(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'js/map') {
    throw new Error(`ERROR: input.type is not [js/map] [${input.type}] [${JSON.stringify(input)}]`)
  }

  //if (! ('data' in input)) {
  //  throw new Error(`ERROR: input.data missing in [js/map] [${JSON.stringify(input)}]`)
  //}

  //if (! ('result' in input)) {
  //  throw new Error(`ERROR: input.result missing in [js/map] [${JSON.stringify(input)}]`)
  //}

  // tree node data
  const data = {
    __ref: ref,
    __childrenWithRef: {
      enable: true,
      validRefs: [ 'data', 'result' ],
    },
    __childrenWithoutRef: {
      enable: false,
    },
    type: input.type,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    false)

  // expand map by default
  js_context.expandedKeys.push(node.key)

  // add input.data
  node.children.push(
    parse_js(
      {
        ...js_context,
        topLevel: false,
      },
      node.key,
      'data',
      input.data
    )
  )

  // add input.result
  node.children.push(
    parse_js(
      {
        ...js_context,
        topLevel: false,
      },
      node.key,
      'result',
      input.result
    )
  )

  return node
}

// create js reduce tree node
function parse_js_reduce(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'js/reduce') {
    throw new Error(`ERROR: input.type is not [js/reduce] [${input.type}] [${JSON.stringify(input)}]`)
  }

  //if (! ('data' in input)) {
  //  throw new Error(`ERROR: input.data missing in [js/reduce] [${JSON.stringify(input)}]`)
  //}

  if (! ('reducer' in input)) {
    throw new Error(`ERROR: input.reducer missing in [js/reduce] [${JSON.stringify(input)}]`)
  }

  //if (! ('init' in input)) {
  //  throw new Error(`ERROR: input.init missing in [js/reduce] [${JSON.stringify(input)}]`)
  //}

  // tree node data
  const data = {
    __ref: ref,
    __childrenWithRef: {
      enable: true,
      validRefs: [ 'data', 'init' ],
    },
    __childrenWithoutRef: {
      enable: false,
    },
    type: input.type,
    reducer: input.reducer,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    false)

  // input filter
  node.data.reducer = input.reducer

  // expand reduce by default
  js_context.expandedKeys.push(node.key)

  // add input.data
  node.children.push(
    parse_js(
      {
        ...js_context,
        topLevel: false,
      },
      node.key,
      'data',
      input.data
    )
  )

  // add input.init
  node.children.push(
    parse_js(
      {
        ...js_context,
        topLevel: false,
      },
      node.key,
      'init',
      input.init
    )
  )

  return node
}

// create js filter tree node
function parse_js_filter(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'js/filter') {
    throw new Error(`ERROR: input.type is not [js/filter] [${input.type}] [${JSON.stringify(input)}]`)
  }

  //if (! ('data' in input)) {
  //  throw new Error(`ERROR: input.data missing in [js/filter] [${JSON.stringify(input)}]`)
  //}

  if (! ('filter' in input)) {
    throw new Error(`ERROR: input.filter missing in [js/filter] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    __ref: ref,
    __childrenWithRef: {
      enable: true,
      validRefs: [ 'data' ],
    },
    __childrenWithoutRef: {
      enable: false,
    },
    type: input.type,
    filter: input.filter,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    false)

  // input filter
  node.data.filter = input.filter

  // expand filter by default
  js_context.expandedKeys.push(node.key)

  // add input.data
  node.children.push(
    parse_js(
      {
        ...js_context,
        topLevel: false,
      },
      node.key,
      'data',
      input.data
    )
  )

  return node
}

// create react element tree node
function parse_react_element(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'react/element') {
    throw new Error(`ERROR: input.type is not [react/element] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/element] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    __ref: ref,
    __childrenWithRef: {
      enable: true,
      validRefs: [ 'props' ],
    },
    __childrenWithoutRef: {
      enable: true,
    },
    type: input.type,
    name: input.name,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    false)

  // expand react element by default
  js_context.expandedKeys.push(node.key)

  // add input.props if exist
  if (input.props) {
    node.children.push(
      parse_js(
        {
          ...js_context,
          topLevel: false,
        },
        node.key,
        'props',
        input.props
      )
    )
  }

  // add input.children
  if ('children' in input && input.children) {
    if (!Array.isArray(input.children)) {
      throw new Error(`ERROR: input.children is not Array [${typeof input.children}]`)
    }

    input.children.map(child => {
      node.children.push(
        parse_js(
          {
            ...js_context,
            topLevel: false,
          },
          node.key,
          null,
          child
        )
      )
    })
  }

  return node
}

// create jsx html element ast
function parse_react_html(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'react/html') {
    throw new Error(`ERROR: input.type is not [react/html] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/html] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    __ref: ref,
    __childrenWithRef: {
      enable: true,
      validRefs: [ 'props' ],
    },
    __childrenWithoutRef: {
      enable: true,
    },
    type: input.type,
    name: input.name,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    false)

  // expand react html by default
  js_context.expandedKeys.push(node.key)

  // add input.props if exist
  if (input.props) {
    node.children.push(
      parse_js(
        {
          ...js_context,
          topLevel: false,
        },
        node.key,
        'props',
        input.props
      )
    )
  }

  // add input.children
  if ('children' in input && input.children) {
    if (!Array.isArray(input.children)) {
      throw new Error(`ERROR: input.children is not Array [${typeof input.children}]`)
    }

    input.children.map(child => {
      node.children.push(
        parse_js(
          {
            ...js_context,
            topLevel: false,
          },
          node.key,
          null,
          child
        )
      )
    })
  }

  return node
}

// create react state ast
function parse_react_state(js_context, parentKey, ref, input) {

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
    __ref: ref,
    type: input.type,
    name: input.name,
    setter: input.setter,
    init: input.init,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    true)

  return node
}

// create react effect block ast (do not allow return outside of function)
function parse_react_effect(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'react/effect') {
    throw new Error(`ERROR: input.type is not [react/effect] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('data' in input)) {
    throw new Error(`ERROR: input.data missing in [react/effect] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    __ref: ref,
    type: input.type,
    data: input.data,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    true)

  return node
}


// create mui style expression
function parse_mui_style(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'mui/style') {
    throw new Error(`ERROR: input.type is not [mui/style] [${input.type}] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    __ref: ref,
    __childrenWithRef: {
      enable: true,
    },
    __childrenWithoutRef: {
      enable: false,
    },
    type: input.type,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data,
    parentKey,
    false)

  // do not expand mui styles by default
  // js_context.expandedKeys.push(node.key)

  // add all styles children
  Object.keys(input).map(key => {
    if (key == 'type') {
      return
    }
    node.children.push(
      parse_js(
        {
          ...js_context,
          topLevel: false,
        },
        node.key,
        key,
        input[key]
      )
    )
  })

  return node
}

// create jsx route ast
function parse_appx_route(js_context, parentKey, ref, input) {

  if (!('type' in input) || input.type !== 'appx/route') {
    throw new Error(`ERROR: input.type is not [appx/route] [${input.type}] [${JSON.stringify(input)}]`)
  }

  // tree node data
  const data = {
    __ref: ref,
    type: input.type,
  }

  const node = new_js_node(
    lookup_title_for_input(ref, input),
    lookup_icon_for_input(input),
    data, parentKey,
    true)

  return node
}

////////////////////////////////////////////////////////////////////////////////

// process input data and return tree data
function parse_js(js_context, parentKey, ref, input) {

  if (! ('expandedKeys' in js_context)) {
    js_context.expandedKeys = []
  }

  if (isPrimitive(input)) {
    return parse_js_primitive(js_context, parentKey, ref, input)
  }

  if (Array.isArray(input)) {
    return parse_js_array(js_context, parentKey, ref, input)
  }

  if (! ('type' in input)) {
    // no 'type' is treated as json object
    return parse_js_object(js_context, parentKey, ref, input)
  }

  // 'type' is presented in the json object
  if (input.type === 'js/string' || input.type === 'js/number' || input.type === 'js/boolean' || input.type === 'js/null') {

    return parse_js_primitive(js_context, parentKey, ref, input.data)

  } else if (input.type === 'js/object') {

    return parse_js_object(js_context, parentKey, ref, input.data)

  } else if (input.type === 'js/array') {

    return parse_js_array(js_context, parentKey, ref, input.data)

  } else if (input.type === 'js/import') {

    return parse_js_import(js_context, parentKey, ref, input)

  } else if (input.type === 'js/expression') {

    return parse_js_expression(js_context, parentKey, ref, input)

  } else if (input.type === 'js/block') {

    return parse_js_block(js_context, parentKey, ref, input)

  } else if (input.type === 'js/function') {

    return parse_js_function(js_context, parentKey, ref, input)

  } else if (input.type === 'js/switch') {

    return parse_js_switch(js_context, parentKey, ref, input)

  } else if (input.type === 'js/map') {

    return parse_js_map(js_context, parentKey, ref, input)

  } else if (input.type === 'js/reduce') {

    return parse_js_reduce(js_context, parentKey, ref, input)

  } else if (input.type === 'js/filter') {

    return parse_js_filter(js_context, parentKey, ref, input)

  } else if (input.type === 'react/element') {

    return parse_react_element(js_context, parentKey, ref, input)

  } else if (input.type === 'react/html') {

    return parse_react_html(js_context, parentKey, ref, input)

  } else if (input.type === 'react/state') {

    return parse_react_state(js_context, parentKey, ref, input)

  } else if (input.type === 'react/effect') {

    return parse_react_effect(js_context, parentKey, ref, input)

  } else if (input.type === 'mui/style') {

    return parse_mui_style(js_context, parentKey, ref, input)

  } else if (input.type === 'mui/control') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type === 'appx/route') {

    return parse_appx_route(js_context, parentKey, ref, input)

  } else {

    throw new Error(`ERROR: unrecognized input.type [${input.type}] [${JSON.stringify(input)}]`)
  }
}

// https://html.spec.whatwg.org/#elements-3
const html_tags = [
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'slot',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr'
]

// return a list of valid html tags
function valid_html_tags() {
  return html_tags.sort()
}

// stores a list of valid import_names
const _valid_import_data = {}
const _valid_import_names = []

// load valid import names
function load_valid_import_data() {

  if (!globalThis.appx?.IMPORT_MAPS) {
    throw new Error(`ERROR: appx.IMPORT_MAPS not set`)
  }

  const libs = globalThis.appx?.IMPORT_MAPS.libs
  if (libs) {
    // iterate libs
    Object.keys(libs).map(lib_key => {
      const path = libs[lib_key].path
      // import lib path
      import(path).then(path_module => {
        // load module
        const modules = libs[lib_key].modules
        if (modules && modules.length) {
          // iterate modules
          modules.map(module_name => {
            // console.log(module_name)
            const module_content = path_module['default'][module_name]
            if (typeof module_content === 'object' && module_content) {
              // console.log(module_content)
              Object.keys(module_content).map(variable_name => {
                if (variable_name === 'default') {
                  // add default
                  _valid_import_data[module_name] = {
                    title: module_name,
                    module: module_name,
                    variable: variable_name,
                  }
                }
                const title = module_name + VARIABLE_SEPARATOR + variable_name
                _valid_import_data[title] = {
                  title: title,
                  module: module_name,
                  variable: variable_name,
                }
              })
            }
          })
        }
      })
    })
  }
}

load_valid_import_data()

// return a list of valid import names
function valid_import_names() {
  // if import data is not initialized
  if (!_valid_import_names.length) {
    Object.keys(_valid_import_data).sort().map(key => {
      _valid_import_names.push(key)
    })
    console.log(`valid_import_names`, _valid_import_names.length)
  }
  return _valid_import_names
}

// valid child types
function lookup_valid_child_types(type) {
  if (!type || type === '/') {
    return {
      'ref': {
        names: null,
        types: [
          'js/string',
          'js/number',
          'js/boolean',
          'js/null',
          null,
          'js/object',
          'js/array',
          null,
          'react/element',
          'react/html',
          'react/state',
          'react/effect',
          null,
          'js/import',
          'js/expression',
          'js/function',
          'js/block',
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          null,
          'mui/style',
          'appx/route',
        ]
      }
    }
  } else if (type === 'js/string') {
    return null         // leaf
  } else if (type === 'js/number') {
    return null         // leaf
  } else if (type === 'js/boolean') {
    return null         // leaf
  } else if (type === 'js/null') {
    return null         // leaf
  } else if (type === 'js/object') {
    return {
      'ref': {
        names: null,
        types: [
          'js/string',
          'js/number',
          'js/boolean',
          'js/null',
          null,
          'js/object',
          'js/array',
          null,
          'react/element',
          'react/html',
          'react/state',
          // 'react/effect',  // effect code not allowed
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/block',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/route',    // appx/route not allowed
        ]
      }
    }
  } else if (type === 'js/array') {
    return {
      '_': {
        types: [
          'js/string',
          'js/number',
          'js/boolean',
          'js/null',
          null,
          'js/object',
          'js/array',
          null,
          'react/element',
          'react/html',
          'react/state',
          // 'react/effect',  // effect code not allowed
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/block',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/route',    // appx/route not allowed
        ]
      }
    }
  } else if (type === 'js/import') {
    return null         // leaf
  } else if (type === 'js/expression') {
    return null         // leaf
  } else if (type === 'js/function') {
    return null         // leaf
  } else if (type === 'js/block') {
    return null         // leaf
  } else if (type === 'js/switch') {
    return {
      ref: {
        names: [
          'default'
        ],
        types: [
          'js/string',
          'js/number',
          'js/boolean',
          'js/null',
          null,
          'js/object',
          'js/array',
          null,
          'react/element',
          'react/html',
          // 'react/state',   // state code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/block',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/route',    // appx/route not allowed
        ]
      },
      '_': {
        attrs: [
          'condition'
        ],
        types: [
          'js/string',
          'js/number',
          'js/boolean',
          'js/null',
          null,
          'js/object',
          'js/array',
          null,
          'react/element',
          'react/html',
          // 'react/state',   // state code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/block',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/route',    // appx/route not allowed
        ]
      }
    }
  } else if (type === 'js/map') {
    return {
      ref: {
        names: [
          'data',
          'result',
        ],
        types: [
          'js/string',
          'js/number',
          'js/boolean',
          'js/null',
          null,
          'js/object',
          'js/array',
          null,
          'react/element',
          'react/html',
          // 'react/state',   // state code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/block',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/route',    // appx/route not allowed
        ]
      }
    }
  } else if (type === 'js/reduce') {
    return {
      ref: {
        names: [
          'data',
          'init',
        ],
        types: [
          'js/string',
          'js/number',
          'js/boolean',
          'js/null',
          null,
          'js/object',
          'js/array',
          null,
          'react/element',
          'react/html',
          // 'react/state',   // state code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/block',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/route',    // appx/route not allowed
        ]
      }
    }
  } else if (type === 'js/filter') {
    return {
      ref: {
        names: [
          'data',
        ],
        types: [
          'js/string',
          'js/number',
          'js/boolean',
          'js/null',
          null,
          'js/object',
          'js/array',
          null,
          'react/element',
          'react/html',
          // 'react/state',   // state code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/block',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/route',    // appx/route not allowed
        ]
      }
    }
  } else if (type === 'react/element') {
    return {
      ref: {
        names: [
          'props',
        ],
        types: [
          'js/object',
        ]
      },
      '_': {
        types: [
          'react/element',
          'react/html',
          // 'react/state',
          // 'react/effect',
          null,
          'js/string',
          // 'js/number',
          // 'js/boolean',
          // 'js/null',
          // null,
          // 'js/object',
          // 'js/array',
          // null,
          // 'js/import',
          'js/expression',
          'js/function',
          // 'js/block',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // 'mui/style',
          // 'appx/route',
        ]
      }
    }
  } else if (type === 'react/html') {
    return {
      ref: {
        names: [
          'props',
        ],
        types: [
          'js/object',
        ]
      },
      '_': {
        types: [
          'react/element',
          'react/html',
          // 'react/state',
          // 'react/effect',
          null,
          'js/string',
          // 'js/number',
          // 'js/boolean',
          // 'js/null',
          // null,
          // 'js/object',
          // 'js/array',
          // null,
          // 'js/import',
          'js/expression',
          'js/function',
          // 'js/block',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // 'mui/style',
          // 'appx/route',
        ]
      }
    }
  } else if (type === 'react/state') {
    return null         // leaf
  } else if (type === 'react/effect') {
    return null         // leaf
  } else if (type === 'mui/style') {
    return {
      ref: {
        names: null,
        types: [
          // 'js/string',
          // 'js/number',
          // 'js/boolean',
          // 'js/null',
          'js/object',
          // 'js/array',
          // null,
          // 'js/import',
          'js/expression',
          // 'js/function',
          // 'js/block',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // 'react/element',
          // 'react/html',
          // 'react/state',
          // 'react/effect',
          // 'mui/style',
          // 'appx/route',
        ]
      }
    }
  } else if (type === 'appx/route') {
    return null         // leaf
  } else {
    return null         // leaf
  }
}

function lookup_classname_by_type(type) {
  const classname =
    (!type || type === '/')
    ? 'appx-type-root'
    : 'appx-type-' + type.replace(/[^a-zA-Z0-9]/g, '-')
  // console.log(classname)
  return classname
}

// lookup type by classname
function lookup_type_by_classname(className) {
  // handle root
  if (className.includes('appx-type-root')) {
    return '/'
  }
  // search others
  let found = null
  lookup_valid_child_types('/').ref.types.forEach(type => {
    if (!type || found) {
      return
    }
    if (className.includes(lookup_classname_by_type(type))) {
      found = type
      return
    }
  })
  return found
}

export {
  parse_js,
  lookup_icon_for_type,
  lookup_icon_for_input,
  lookup_title_for_input,
  lookup_valid_child_types,
  lookup_classname_by_type,
  lookup_type_by_classname,
  valid_import_names,
  valid_html_tags,
}
