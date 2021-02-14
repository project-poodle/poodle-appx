import React from 'react'
import {
  Icon,
  FileOutlined,
  FileTextOutlined,
  SwitcherOutlined,
  QuestionCircleOutlined,
  QuestionOutlined,
  FieldStringOutlined,
  NumberOutlined,
  FullscreenExitOutlined,
  FilterOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  PercentageOutlined,
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
import { v4 as uuidv4 } from 'uuid'

import ReactIcon from 'app-x/icon/React'
import Html from 'app-x/icon/Html'
import Import from 'app-x/icon/Import'
import Text from 'app-x/icon/Text'
import Css from 'app-x/icon/Css'
import Bracket from 'app-x/icon/Bracket'
import CurlyBracket from 'app-x/icon/CurlyBracket'
import Calculator from 'app-x/icon/Calculator'
import Function from 'app-x/icon/Function'
import FunctionCall from 'app-x/icon/FunctionCall'
import Code from 'app-x/icon/Code'
import Branch from 'app-x/icon/Branch'
import Route from 'app-x/icon/Route'
import Router from 'app-x/icon/Router'
import Effect from 'app-x/icon/Effect'
import State from 'app-x/icon/State'
import Form from 'app-x/icon/Form'
import Dialog from 'app-x/icon/Dialog'
import Context from 'app-x/icon/Context'
import InputText from 'app-x/icon/InputText'
import InputTextArray from 'app-x/icon/InputTextArray'
import InputSwitch from 'app-x/icon/InputSwitch'
import InputSelect from 'app-x/icon/InputSelect'
import InputTabular from 'app-x/icon/InputTabular'
import InputCollection from 'app-x/icon/InputCollection'
import InputSubmit from 'app-x/icon/InputSubmit'
import InputReset from 'app-x/icon/InputReset'
import InputRule from 'app-x/icon/InputRule'
import Filter from 'app-x/icon/Filter'
import API from 'app-x/icon/API'
import Style from 'app-x/icon/Style'
import Table from 'app-x/icon/Table'
import TableColumn from 'app-x/icon/TableColumn'
import Theme from 'app-x/icon/Theme'
import Pointer from 'app-x/icon/Pointer'

import {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  isPrimitive,
  parse_var_full_path,
  lookup_type_for_data,
  type_matches_spec,
  data_matches_spec,
} from 'app-x/builder/ui/syntax/util_base'


////////////////////////////////////////////////////////////////////////////////

// lookup icon by type
function lookup_icon_for_type(type) {
  return lookup_icon_for_input({_type: type, data: ''})
}

// lookup icon by node
function lookup_icon_for_node(node) {
  return lookup_icon_for_input({_type: node.data?._type, ...node?.data})
}

// lookup icon for input (input._type)
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

  if (! ('_type' in input)) {
    return <CurlyBracket />
  }

  // '_type' is presented in the json object
  if (input._type === 'js/string') {

    return <Text />

  } else if (input._type === 'js/number') {

    return  <NumberOutlined />

  } else if (input._type === 'js/boolean') {

    return  <PoweroffOutlined />

  } else if (input._type === 'js/null') {

    return  <MinusCircleOutlined />

  } else if (input._type === 'js/array') {

    return  <Bracket />

  } else if (input._type === 'js/object') {

    return <CurlyBracket />

  } else if (input._type === 'js/import') {

    return <Import />

  } else if (input._type === 'js/expression') {

    return <PercentageOutlined />

  } else if (input._type === 'js/statement') {

    return <Code />

  } else if (input._type === 'js/function') {

    return <Function />

  } else if (input._type === 'js/call') {

    return <FunctionCall />

  } else if (input._type === 'js/condition') {

    return <Branch />

  } else if (input._type === 'js/map') {

    return <DoubleRightOutlined />

  } else if (input._type === 'js/reduce') {

    return <CompressOutlined />

  } else if (input._type === 'js/filter') {

    return <Filter />

  } else if (input._type === 'react/element') {

    return <ReactIcon />

  } else if (input._type === 'react/html') {

    return <Html />

  } else if (input._type === 'react/state') {

    return <State />

  } else if (input._type === 'react/context') {

    return <Context />

  } else if (input._type === 'react/effect') {

    return <Effect />

  } else if (input._type === 'appx/form') {

    return <Form />

  } else if (input._type === 'appx/dialog') {

    return <Dialog />

  } else if (input._type === 'appx/input/text') {

    return <InputText />

  } else if (input._type === 'appx/input/textarray') {

    return <InputTextArray />

  } else if (input._type === 'appx/input/switch') {

    return <InputSwitch />

  } else if (input._type === 'appx/input/select') {

    return <InputSelect />

  } else if (input._type === 'appx/input/tabular') {

    return <InputTabular />

  } else if (input._type === 'appx/input/collection') {

    return <InputCollection />

  } else if (input._type === 'appx/input/submit') {

    return <InputSubmit />

  } else if (input._type === 'appx/input/reset') {

    return <InputReset />

  } else if (input._type === 'appx/input/rule') {

    return <InputRule />

  } else if (input._type === 'appx/table') {

    return <Table />

  } else if (input._type === 'appx/table/column') {

    return <TableColumn />

  } else if (input._type === 'mui/style') {

    return <Style />

  } else if (input._type === 'mui/theme') {

    return <Theme />

  } else if (input._type === 'route/path') {

    return <Route />

  } else if (input._type === 'route/context') {

    return <Router />

  } else if (input._type === 'appx/api') {

    return <API />

  } else if (input._type === 'appx/route') {

    return <Route />

  } else if (input._type === 'pointer') {

    return <Pointer />

  } else if (input._type === '/') {

    return <HomeOutlined />

  } else {

    return <QuestionOutlined />
  }
}

// lookup title for node
function lookup_title_for_node(node) {
  return lookup_title_for_input(node.data?._ref, node.data, node.data?._array)
}

// lookup title for input (input._type / input.name / input.data ...)
function lookup_title_for_input(ref, input, array=false) {

  const prefix = (array || !!input?._array) ? '' : (ref ? ref + ': ' : '')

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

  if (! ('_type' in input)) {
    return ref ? ref : ''
  }

  // '_type' is presented in the json object
  if (input._type === 'js/string') {

    return _primitive_title(String(input.data))

  } else if (input._type === 'js/number') {

    return _primitive_title(isNaN(Number(input.data)) ? 0 : Number(input.data))

  } else if (input._type === 'js/boolean') {

    return _primitive_title(Boolean(input.data))

  } else if (input._type === 'js/null') {

    return _primitive_title(null)

  } else if (input._type === 'js/array') {

    return ref ? ref : ''

  } else if (input._type === 'js/object') {

    return ref ? ref : ''

  } else if (input._type === 'js/import') {

    const parsed = parse_var_full_path(input.name)
    return prefix + parsed.full_paths.pop()

  } else if (input._type === 'js/expression') {

    return prefix + (input.data.length > 32 ? input.data.substring(0, 30) + '...' : input.data)

  } else if (input._type === 'js/statement') {

    if (!!input.code) {
      return prefix + (input.code?.length > 32 ? input.code.substring(0, 30) + '...' : input.code)
    } else {
      return ref
    }

  } else if (input._type === 'js/function') {

    const name = ' (' +
      (
        input.params
          ? input.params
            .map(param => isPrimitive(param) ? String(param) : String(param.value))
            .join(', ')
          : ''
      )
      +  ')'
    return prefix + (name.length > 32 ? name.substring(0, 30) + '...' : name)

  } else if (input._type === 'js/call') {

    const name = input.name || 'call'
    return prefix + (name.length > 32 ? name.substring(0, 30) + '...' : name) + ' (...)'

  } else if (input._type === 'js/condition') {

    return prefix + 'Switch'

  } else if (input._type === 'js/map') {

    return prefix + 'Map'

  } else if (input._type === 'js/reduce') {

    return prefix + 'Reduce'

  } else if (input._type === 'js/filter') {

    return prefix + 'Filter'

  } else if (input._type === 'react/element') {

    const parsed = parse_var_full_path(input.name)
    let pop = parsed.full_paths.pop()
    return prefix + (pop === 'default' ? parsed.full_paths.pop() : pop)

  } else if (input._type === 'react/html') {

    const parsed = parse_var_full_path(input.name)
    return prefix + parsed.full_paths.pop()

  } else if (input._type === 'react/state') {

    if (!!ref && ref.startsWith('...')) {
      return ref
    } else {
      return prefix + input.name
    }

  } else if (input._type === 'react/context') {

    return ref ? ref : ''

  } else if (input._type === 'react/effect') {

    const name = '[' +
      (
        input.states
          ? input.states
            .map(state => isPrimitive(state) ? String(state) : String(state.value))
            .join(', ')
          : ''
      )
      +  ']'
    return prefix + (name.length > 32 ? name.substring(0, 30) + '...' : name)

  } else if (input._type === 'appx/form') {

    const parsed = parse_var_full_path(input.name)
    return prefix + parsed.full_paths.pop()

  } else if (input._type === 'appx/dialog') {

    const parsed = parse_var_full_path(input.name)
    return prefix + parsed.full_paths.pop()

  } else if (input._type === 'appx/input/text') {

    const parsed = parse_var_full_path(input.name)
    return prefix + `${parsed.full_paths.pop()} [${input.id}]`

  } else if (input._type === 'appx/input/textarray') {

    const parsed = parse_var_full_path(input.name)
    return prefix + `${parsed.full_paths.pop()} [${input.id}]`

  } else if (input._type === 'appx/input/switch') {

    const parsed = parse_var_full_path(input.name)
    return prefix + `${parsed.full_paths.pop()} [${input.id}]`

  } else if (input._type === 'appx/input/select') {

    const parsed = parse_var_full_path(input.name)
    return prefix + `${parsed.full_paths.pop()} [${input.id}]`

  } else if (input._type === 'appx/input/tabular') {

    const parsed = parse_var_full_path(input.name)
    return prefix + `${parsed.full_paths.pop()} [${input.id}]`

  } else if (input._type === 'appx/input/collection') {

    const parsed = parse_var_full_path(input.name)
    return prefix + `${parsed.full_paths.pop()}`

  } else if (input._type === 'appx/input/submit') {

    const parsed = parse_var_full_path(input.name)
    return prefix + `${parsed.full_paths.pop()}`

  } else if (input._type === 'appx/input/reset') {

    const parsed = parse_var_full_path(input.name)
    return prefix + `${parsed.full_paths.pop()}`

  } else if (input._type === 'appx/input/rule') {

    return ref ? ref : ''

  } else if (input._type === 'appx/table') {

    const parsed = parse_var_full_path(input.name)
    return prefix + parsed.full_paths.pop()

  } else if (input._type === 'appx/table/column') {

    return input.id || ''

  } else if (input._type === 'mui/style') {

    return ref ? ref : ''

  } else if (input._type === 'mui/theme') {

    return ref ? ref : ''

  } else if (input._type === 'route/path') {

    return `${input.path}`

  } else if (input._type === 'route/context') {

    return ref ? ref : ''

  } else if (input._type === 'appx/api') {

    return prefix + 'API'

  } else if (input._type === 'appx/route') {

    return ref ? ref : ''

  } else {

    return ref ? ref : ''
  }
}

// reorder children
const reorder_children = (parentNode) => {

  if (parentNode.key === '/') {
    return // ignore root node
  }
  // console.log(`reorder_children - enter`, parentNode.children)

  const spec = globalThis.appx.SPEC.types[parentNode.data._type]
  if (!spec) {
    throw new Error(`ERROR: unable to find spec for [${parentNode.data._type}]`)
  }
  // console.log(`spec`, spec)

  const children = []
  spec.children.forEach(childSpec => {
    // ignore childSpec without _childNode
    if (!childSpec._childNode) {
      return
    }
    // if childSpec name is '*'
    if (childSpec.name === '*') {
      parentNode.children
        .filter(child => !!child.data._ref)
        .sort((a, b) => {
          return a.data._ref.localeCompare(b.data._ref)
        })
        .map(child => {
          children.push(child)
        })
    } else {
      parentNode.children
        .filter(child => child.data._ref === childSpec.name)
        .map(child => {
          children.push(child)
        })
    }
  })

  // update children
  parentNode.children = children
  // console.log(`reorder_children - exit`, parentNode.children)
}

////////////////////////////////////////////////////////////////////////////////
// create new node
function new_tree_node(title, icon, data, isLeaf, parentKey) {
  return {
    key: uuidv4(),
    title: title ? title : (data ? (data._ref ? data._ref : '') : ''),
    icon: icon ? icon : <QuestionOutlined />,
    data: data ? data : null,
    isLeaf: isLeaf ? true : false,
    parentKey: parentKey,
    children: isLeaf ? [] : [],
  }
}

// create new root node
function new_root_node() {
  return {
    key: '/',
    title: '/',
    icon: lookup_icon_for_type('/'),
    data: {
      _ref: null,
      _type: '/',
      _array: false,
    },
    isLeaf: true,
    parentKey: null,
    children: [],
  }
}

////////////////////////////////////////////////////////////////////////////////
// process input data and return tree data
// function parse_js(js_context, { ref, parentKey }, input) {
function generate_tree_node(js_context, conf, input) {

  // add expandedKeys if not exist
  if (! ('expandedKeys' in js_context)) {
    js_context.expandedKeys = []
  }

  if (isPrimitive(input)) {
    switch (typeof input) {
      case 'string':
        return generate_tree_node(js_context, conf, {_type: 'js/string', data: input})
      case 'number':
        return generate_tree_node(js_context, conf, {_type: 'js/number', data: input})
      case 'boolean':
        return generate_tree_node(js_context, conf, {_type: 'js/boolean', data: input})
      case 'undefined':                         // treat undefined as null
        return generate_tree_node(js_context, conf, {_type: 'js/null'})
      case 'object':
        if (input === null) {
          return generate_tree_node(js_context, conf, {_type: 'js/null'})
        } else {
          throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
        }
      default:
        throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
    }
  }

  // we are here if not primitive

  // if array
  if (Array.isArray(input)) {
    return generate_tree_node(
      js_context,
      {
        ...conf,
        array: true,
      },
      {
        _type: 'js/array',
        children: input
      }
    )
  }

  // js/object
  if (!input._type) {
    return generate_tree_node(
      js_context,
      {
        ...conf,
        array: false,
      },
      {
        _type: 'js/object',
        ...input,
      }
    )
  }

  // handle topLevel
  if (!!js_context.topLevel) {
    // return children only
    const results = []
    Object.keys(input).map(key => {
      // skip keys starts with '__'
      if (key.startsWith('_')) {
        return
      }
      // add children to node
      const treeNode =
        generate_tree_node(
          {
            ...js_context,
            topLevel: false,
          },
          {
            ref: key,
            array: false,
            parentKey: null,
          },
          input[key]
        )
      // annotate order
      treeNode._order = input[key]._order
      // add to results
      results.push(treeNode)
    })
    // sort by order
    results.sort((a, b) => {
      if (!!a._order && !!b._order) {
        return a._order - b._order
      } else {
        return 0
      }
    })

    // add root element to the top level
    results.unshift(new_root_node())

    return results
  }

  // input type
  if (! (input._type in globalThis.appx?.SPEC?.types)) {
    throw new Error(`ERROR: unrecognized input type [${input._type}] [${JSON.stringify(input)}]`)
  }

  // get spec
  const classes = globalThis.appx.SPEC.classes
  const spec = globalThis.appx.SPEC.types[input._type]

  // setup evaluation variables
  // thisData
  const thisData = input
  // create thisNode
  const thisNode = new_tree_node(
    lookup_title_for_input(conf?.ref || null, input, conf?.array),
    lookup_icon_for_input(input),
    {
      _ref: conf?.ref || null,
      _type: input._type,
      _array: !!conf?.array,
      // empty data
    },
    !spec.children?.find(item => !!item._childNode),  // isLeaf
    conf?.parentKey || null,
  )

  // setup default expand
  if (!!spec._expand) {
    js_context.expandedKeys.push(thisNode.key)
  }

  // process children (not including '*')
  spec.children.map((childSpec) => {

    // function to process _thisNode spec
    function _process_this(_ref, data) {
      // look for thisNodeSpec that matches data
      if (!childSpec?._thisNode) {
        return undefined
      }
      // thisNodeSpec
      const thisNodeSpec = childSpec._thisNode
      // check if data matches type spec
      const data_type = lookup_type_for_data(data)
      const thisTypeSpec = childSpec._thisNode.types === 'inherit' ? childSpec.types : childSpec._thisNode.types
      if (!type_matches_spec(data_type, thisTypeSpec)) {
        // console.log(`thisNodeSpec NO MATCH : [${JSON.stringify(data)}] [${data_type}] not matching [${JSON.stringify(thisTypeSpec)}]`)
        return undefined
      } else {
        // console.log(`thisNodeSpec MATCHES : [${JSON.stringify(data)}] [${data_type}] matching [${JSON.stringify(thisTypeSpec)}]`)
      }
      // add to current node
      if (!!thisNodeSpec.generate) {
        const result = eval(thisNodeSpec.generate)
        // console.log(`genrate`, data, result)
        return result
      } else if (data_type === 'js/string') {
        return isPrimitive(data) ? String(data) : String(data.data)
      } else if (data_type === 'js/number') {
        return isPrimitive(data) ? Number(data) : Number(data.data)
      } else if (data_type === 'js/boolean') {
        return isPrimitive(data) ? Boolean(data) : Boolean(data.data)
      } else if (data_type === 'js/null') {
        return null
      } else {
        // throw new Error(`ERROR: non-primitive type [${data_type}] missing generate method [${JSON.stringify(thisNodeSpec)}]`)
        // console.log(`generate`, data)
        return data
      }
    }

    // function to process _childNode spec
    function _process_child(_ref, data) {
      // look for checkNodeSpec that matches data
      if (!childSpec?._childNode) {
        return undefined
      }
      // get class spec
      const childNodeSpec = childSpec._childNode
      // check if data matches spec
      const data_type = lookup_type_for_data(data)
      const thisTypeSpec = childSpec._thisNode?.types === 'inherit' ? childSpec.types : childSpec._thisNode?.types
      const childTypeSpec = childSpec._childNode.types === 'inherit' ? childSpec.types : childSpec._childNode.types
      if (!!thisTypeSpec && type_matches_spec(data_type, thisTypeSpec)) {
        // console.log(`thisNodeSpec already MATCH : [${JSON.stringify(data)}] [${data_type}] matching [${JSON.stringify(thisTypeSpec)}]`)
        return undefined
      } else if (!type_matches_spec(data_type, childTypeSpec)) {
        // console.log(`childNodeSpec NO MATCH : [${JSON.stringify(data)}] [${data_type}] not matching [${JSON.stringify(childTypeSpec)}]`)
        return undefined
      } else {
        // console.log(`childNodeSpec MATCHES : [${JSON.stringify(data)}] [${data_type}] matching [${JSON.stringify(childTypeSpec)}]`)
      }
      // generate function
      const generate = (data) => {
        return generate_tree_node(
          js_context,
          {
            ref: _ref,
            array: !!childSpec.array,
            parentKey: thisNode.key,
          },
          data
        )
      }
      // check generate definition
      let resultNode = undefined
      if (!!childNodeSpec.generate) {
        // generate child node
        resultNode = eval(childNodeSpec.generate)
        // console.log(`resultNode [eval]`, resultNode)
      } else {
        resultNode = generate_tree_node(
          js_context,
          {
            ref: _ref,
            array: !!childSpec.array,
            parentKey: thisNode.key,
          },
          data
        )
      }
      // set _array flag
      resultNode.data._array = !!childSpec.array
      // return
      return resultNode
    }

    try {
      // process children
      if (childSpec.name === '*') {

        Object.keys(input).map(key => {
          // ignore _type
          if (key === '_type' || key === '_order') {
            return
          }

          const _ref = key
          const data = input[_ref]

          // const childData = enrich_primitive_data(data[key])
          const childNode = _process_child(key, data)
          if (!!childNode) {
            // childNode.data._ref = key
            // childNode.data._array = false
            thisNode.children.push(childNode)
            // console.log(`childNode [*]`, childNode)
          } else {
            throw new Error(`ERROR: unable to process child data [*] [${key}] [${JSON.stringify(data)}]`)
          }
        })

      } else {

        const _ref = childSpec.name
        const data = input[_ref]

        // check if exist
        if (! (_ref in input)) {
          if (!childSpec.required) {
            return // continue
          } else {
            throw new Error(`ERROR: [${input._type}] missing [${childSpec.name}] [${JSON.stringify(input)}]`)
          }
        }

        // check undefined
        if (data === undefined) {
          if (!!childSpec.required) {
            throw new Error(`ERROR: input data missing for required child [${childSpec.name}] [${JSON.stringify(input)}]`)
          }
        }

        // we are here for an _ref that exists
        if (!!childSpec._thisNode) {
          // process _thisNode
          if (!!childSpec.array) {
            if (!Array.isArray(data)) {
              throw new Error(`ERROR: childSpec [array] has non-array data [${JSON.stringify(data)}]`)
            }
            // we have verified data is array
            thisNode.data[_ref] = []
            data.map(d => {
              const resultNodeData = _process_this(_ref, d)
              if (resultNodeData !== undefined) {
                if (isPrimitive(resultNodeData)) {
                  thisNode.data[_ref].push({value: resultNodeData})
                } else {
                  thisNode.data[_ref].push(resultNodeData)
                }
              }
            })
          } else {
            const resultNodeData = _process_this(_ref, data)
            if (resultNodeData !== undefined) {
              thisNode.data[_ref] = resultNodeData
            }
          }
        }

        if (!!childSpec._childNode) {
          // process _childNode
          if (!!childSpec.array) {
            if (!Array.isArray(data)) {
              throw new Error(`ERROR: childSpec [array] has non-array data [${JSON.stringify(data)}]`)
            }
            // we have verified data is array
            data.map(d => {
              // const childData = enrich_primitive_data(d)
              const childNode = _process_child(_ref, d, true)
              if (!!childNode) {
                thisNode.children.push(childNode)
                // console.log(`childNode [array]`, childNode)
              } else if (!!childSpec.required) {
                throw new Error(`ERROR: unable to process child data [array] [${_ref}] [${JSON.stringify(d)}]`)
              }
            })
          } else {
            const childNode = _process_child(_ref, data)
            if (!!childNode) {
                thisNode.children.push(childNode)
                // console.log(`childNode`, childNode)
            } else if (!!childSpec.required) {
              if (thisNode.data[_ref] === undefined) {
                // throw exception only if _ref is not already defined by _thisNode
                throw new Error(`ERROR: unable to process child data [${_ref}] [${JSON.stringify(data)}]`)
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  })

  // console.log(`generate_tree_node [${JSON.stringify(thisNode.data)}]`)
  return thisNode
}

// function new_tree_node(title, icon, data, parentKey, isLeaf)


export {
  generate_tree_node,
  new_tree_node,
  lookup_icon_for_type,
  lookup_icon_for_node,
  lookup_icon_for_input,
  lookup_title_for_node,
  lookup_title_for_input,
  reorder_children,
}
