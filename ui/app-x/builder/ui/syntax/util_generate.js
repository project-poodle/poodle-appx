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
import Form from 'app-x/icon/Form'
import Context from 'app-x/icon/Context'
import InputText from 'app-x/icon/InputText'
import Filter from 'app-x/icon/Filter'
import API from 'app-x/icon/API'
import Style from 'app-x/icon/Style'
import Pointer from 'app-x/icon/Pointer'

import {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  isPrimitive,
  parse_var_full_path,
  lookup_data_type,
  // enrich_primitive_data,
  type_matches_spec,
  data_matches_spec,
} from 'app-x/builder/ui/syntax/util_base'


////////////////////////////////////////////////////////////////////////////////

// lookup interchange types
function lookup_type_groups(type) {
  if
  (
    type === 'js/string'
    || type === 'js/number'
    || type === 'js/boolean'
    || type === 'js/null'
    || type === 'js/expression'
    || type === 'js/import'
  )
  {
    return [
      'js/string',
      'js/number',
      'js/boolean',
      'js/null',
      'js/expression',
      'js/import',
    ]
  }
  else if
  (
    type === 'react/element'
    || type === 'react/html'
    || type === 'react/form'
  )
  {
    return [
      'react/element',
      'react/html',
      'react/form',
    ]
  }
  else if
  (
    type === 'input/text'
    || type === 'input/select'
    || type === 'input/switch'
  )
  {
    return [
      'input/text',
      'input/select',
      'input/switch',
    ]
  }
  else
  {
    return [
      type
    ]
  }
}

// lookup icon by type
function lookup_icon_for_type(type) {
  return lookup_icon_for_input({_type: type, data: ''})
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

  } else if (input._type === 'js/switch') {

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

  } else if (input._type === 'react/form') {

    return <Form />

  } else if (input._type === 'input/text') {

    return <InputText />

  } else if (input._type === 'mui/style') {

    return <Style />

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

    const name = 'func (' +
      (
        input.params
          ? input.params
            .map(param => isPrimitive(param) ? String(param) : String(param.value))
            .join(', ')
          : ''
      )
      +  ')'
    return prefix + (name.length > 32 ? name.substring(0, 30) + '...' : name)

  } else if (input._type === 'js/switch') {

    return prefix + 'Switch'

  } else if (input._type === 'js/map') {

    return prefix + 'Map'

  } else if (input._type === 'js/reduce') {

    return prefix + 'Reduce'

  } else if (input._type === 'js/filter') {

    return prefix + 'Filter'

  } else if (input._type === 'react/element') {

    const parsed = parse_var_full_path(input.name)
    return prefix + parsed.full_paths.pop()

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

    const name = 'effect [' +
      (
        input.states
          ? input.states
            .map(state => isPrimitive(state) ? String(state) : String(state.value))
            .join(', ')
          : ''
      )
      +  ']'
    return prefix + (name.length > 32 ? name.substring(0, 30) + '...' : name)

  } else if (input._type === 'react/form') {

    return prefix + input.name

  } else if (input._type === 'input/text') {

    return prefix + `Input [${input.name}]`

  } else if (input._type === 'mui/style') {

    return ref ? ref : ''

  } else if (input._type === 'appx/api') {

    return prefix + 'API'

  } else if (input._type === 'appx/route') {

    return ref ? ref : ''

  } else {

    return ref ? ref : ''
  }
}

// valid child _types
function lookup_valid_child_types(type) {
  if (!type || type === '/') {
    return {
      'ref': {
        names: null,
        _types: [
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
          'react/context',
          'react/effect',
          null,
          'react/form',
          'input/text',
          null,
          'js/import',
          'js/expression',
          'js/function',
          'js/statement',
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          null,
          'mui/style',
          'appx/api',
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
        _types: [
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
          'react/context',
          // 'react/effect',  // effect code not allowed
          // null,
          // 'react/form',    // react/form not allowed
          // 'input/text',    // input/text not allowed
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/statement',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui/style not allowed
          // 'appx/api'       // appx/api not allowed
          // 'appx/route',    // appx/route not allowed
        ]
      }
    }
  } else if (type === 'js/array') {
    return {
      '_': {
        _types: [
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
          'react/context',
          // 'react/effect',  // effect code not allowed
          // null,
          // 'react/form',    // react/form not allowed
          // 'input/text',    // input/text not allowed
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/statement',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/api'       // appx/api not allowed
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
  } else if (type === 'js/statement') {
    return null         // leaf
  } else if (type === 'js/switch') {
    return {
      ref: {
        names: [
          'default'
        ],
        _types: [
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
          // 'react/context', // context code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'react/form',
          'input/text',
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/statement',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/api'       // appx/api not allowed
          // 'appx/route',    // appx/route not allowed
        ]
      },
      '_': {
        attrs: [
          'condition'
        ],
        _types: [
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
          // 'react/context', // context code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'react/form',
          'input/text',
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/statement',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/api'       // appx/api not allowed
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
        _types: [
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
          // 'react/context', // context code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'react/form',
          'input/text',
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/statement',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/api'       // appx/api not allowed
          // 'appx/route',    // appx/route not allowed
        ]
      }
    }
  } else if (type === 'js/reduce') {
    return {
      ref: {
        names: [
          'data',
        ],
        _types: [
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
          // 'react/context', // context code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'react/form',
          'input/text',
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/statement',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/api'       // appx/api not allowed
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
        _types: [
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
          // 'react/context', // context code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'react/form',
          'input/text',
          null,
          'js/import',
          'js/expression',
          'js/function',
          // 'js/statement',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // null,
          // 'mui/style',     // mui style not allowed
          // 'appx/api'       // appx/api not allowed
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
        _types: [
          'js/object',
        ]
      },
      '_': {
        _types: [
          'react/element',
          'react/html',
          // 'react/state',   // state code not allowed
          // 'react/context', // context code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'react/form',
          'input/text',
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
          // 'js/statement',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // 'mui/style',
          // 'appx/api'       // appx/api not allowed
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
        _types: [
          'js/object',
        ]
      },
      '_': {
        _types: [
          'react/element',
          'react/html',
          // 'react/state',   // state code not allowed
          // 'react/context', // context code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          'react/form',
          'input/text',
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
          // 'js/statement',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // 'mui/style',
          // 'appx/api'       // appx/api not allowed
          // 'appx/route',
        ]
      }
    }
  } else if (type === 'react/form') {
    return {
      ref: {
        names: [
          'props',
          'formProps',
        ],
        _types: [
          'js/object',
        ]
      },
      '_': {
        _types: [
          'react/element',
          'react/html',
          // 'react/state',   // state code not allowed
          // 'react/context', // context code not allowed
          // 'react/effect',  // effect code not allowed
          null,
          // 'react/form',    // nested form not allowed
          'input/text',
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
          // 'js/statement',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // 'mui/style',
          // 'appx/api'       // appx/api not allowed
          // 'appx/route',
        ]
      }
    }
  } else if (type === 'react/state') {
    return null         // leaf
  } else if (type === 'react/context') {
    return null         // leaf
  } else if (type === 'react/effect') {
    return null         // leaf
  } else if (type === 'input/text') {
    return {
      ref: {
        names: [
          'props',
          'rules',
        ],
        _types: [
          'js/object',
        ]
      }
    }
  } else if (type === 'mui/style') {
    return {
      ref: {
        names: null,
        _types: [
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
          // 'js/statement',  // code block not allowed
          null,
          'js/switch',
          'js/map',
          'js/reduce',
          'js/filter',
          // 'react/element',
          // 'react/html',
          // 'react/state',
          // 'react/context',
          // 'react/effect',
          // null,
          // 'react/form',
          // 'input/text',
          // 'mui/style',
          // 'appx/api',
          // 'appx/route',
        ]
      }
    }
  } else if (type === 'appx/api') {
    return null         // leaf
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
  lookup_valid_child_types('/').ref._types.forEach(type => {
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

// reorder children
const reorder_children = (parentNode) => {

  if (parentNode.data._type === 'js/object'
      || parentNode.data._type === 'mui/style') {

    const children = []
    // add _ref !== null
    parentNode.children
      .filter(child => !!child.data._ref)
      .sort((a, b) => {
        return a.data._ref.localeCompare(b.data._ref)
      })
      .map(child => {
        children.push(child)
      })
    // update children
    parentNode.children = children

  } else if (parentNode.data._type === 'react/element'
            || parentNode.data._type === 'react/html'
            || parentNode.data._type === 'react/form') {

    const children = []
    // add _ref === 'props'
    parentNode.children
      .filter(child => child.data._ref === 'props')
      .map(child => {
        children.push(child)
      })
    // add _ref === 'props'
    parentNode.children
      .filter(child => child.data._ref === 'formProps')
      .map(child => {
        children.push(child)
      })
    // add _ref === null
    parentNode.children
      .filter(child => child.data._ref === null)
      .map(child => {
        children.push(child)
      })
    // update children
    parentNode.children = children

  } else if (parentNode.data._type === 'js/switch') {

    const children = []
    // add _ref === null
    parentNode.children
      .filter(child => child.data._ref === null)
      .map(child => {
        children.push(child)
      })
    // add _ref === 'default'
    parentNode.children
      .filter(child => child.data._ref === 'default')
      .map(child => {
        children.push(child)
      })
    // update children
    parentNode.children = children

  } else if (parentNode.data._type === 'js/map') {

    const children = []
    // add _ref === 'data'
    parentNode.children
      .filter(child => child.data._ref === 'data')
      .map(child => {
        children.push(child)
      })
    // add _ref === 'result'
    parentNode.children
      .filter(child => child.data._ref === 'result')
      .map(child => {
        children.push(child)
      })
    // update children
    parentNode.children = children

  } else if (parentNode.data._type === 'js/reduce') {

    const children = []
    // add _ref === 'data'
    parentNode.children
      .filter(child => child.data._ref === 'data')
      .map(child => {
        children.push(child)
      })
    // update children
    parentNode.children = children

  } else if (parentNode.data._type === 'js/filter') {

    const children = []
    // add _ref === 'data'
    parentNode.children
      .filter(child => child.data._ref === 'data')
      .map(child => {
        children.push(child)
      })
    // update children
    parentNode.children = children

  }
}

////////////////////////////////////////////////////////////////////////////////
// create new node
function new_tree_node(title, icon, data, isLeaf, parentKey, parentChildSpec) {
  return {
    key: uuidv4(),
    title: title ? title : (data ? (data._ref ? data._ref : '') : ''),
    icon: icon ? icon : <QuestionOutlined />,
    data: data ? data : null,
    isLeaf: isLeaf ? true : false,
    parentKey: parentKey,
    parentChildSpec: parentChildSpec,
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
      _type: '/'
    },
    isLeaf: true,
    parentKey: null,
    parentChildSpec: null,
    children: null,
  }
}

////////////////////////////////////////////////////////////////////////////////
// process input data and return tree data
// function parse_js(js_context, { ref, parentKey, parentChildSpec }, input) {
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
      results.push(
        generate_tree_node(
          {
            ...js_context,
            topLevel: false,
          },
          {
            ref: key,
            array: false,
            parentKey: null,
            parentChildSpec: null
          },
          input[key]
        )
      )
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
      // empty data
    },
    !spec.children?.find(item => !!item._childNode),  // isLeaf
    conf?.parentKey || null,
    conf?.parentChildSpec || null,
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
      let found = false
      let resultNode = undefined
      childSpec._thisNode.map(thisNodeSpec => {
        // return if found
        if (found) {
          return
        }
        // get class spec
        const classSpec = globalThis.appx.SPEC.classes[thisNodeSpec.class]
        if (!classSpec) {
          throw new Error(`ERROR: classSpec not found [${thisNodeSpec.class}]`)
        }
        // check if data matches spec
        const data_type = lookup_data_type(data)
        if (!type_matches_spec(data_type, thisNodeSpec)) {
          // console.log(`thisNodeSpec NO MATCH : [${JSON.stringify(data)}] [${data_type}] not matching [${JSON.stringify(thisNodeSpec)}]`)
          return
        } else {
          // console.log(`thisNodeSpec MATCHES : [${JSON.stringify(data)}] [${data_type}] matching [${JSON.stringify(thisNodeSpec)}]`)
          found = true
        }
        // add to current node
        if (!!thisNodeSpec.generate) {
          resultNode = eval(thisNodeSpec.generate)
        } else if (!!childSpec.array) {
          throw new Error(`ERROR: thisNodeSpec [childSpec.array] missing generate method [${JSON.stringify(childSpec._thisNode)}]`)
        } else if (thisNodeSpec.class === 'string') {
          if (isPrimitive(data)) {
            resultNode = data
          } else if (data._type === 'js/expression') {
            resultNode = data.data
          } else if (data._type === 'js/import') {
            resultNode = data.name
          } else if (data._type === 'js/statement') {
            if (isPrimitive(data.body)) {
              resultNode = data.body
            } else {
              resultNode = undefined
            }
          } else {
            throw new Error(`ERROR: thisNodeSpec [${thisNodeSpec.class}] missing generate method [${JSON.stringify(thisNodeSpec)}]`)
          }
        } else if (thisNodeSpec.class === 'number') {
          resultNode = isPrimitive(data) ? data : data.data
        } else if (thisNodeSpec.class === 'boolean') {
          resultNode = isPrimitive(data) ? data : data.data
        } else if (thisNodeSpec.class === 'null') {
          // found = true
        } else {
          throw new Error(`ERROR: thisNodeSpec [${thisNodeSpec.class}] missing generate method [${JSON.stringify(thisNodeSpec)}]`)
        }
      })
      // return
      return resultNode
    }

    // function to process _childNode spec
    function _process_child(_ref, data, array) {
      // look for checkNodeSpec that matches data
      let found = false
      let resultNode = undefined
      childSpec._childNode.map(childNodeSpec => {
        // return if found
        if (found) {
          return
        }
        // get class spec
        const classSpec = globalThis.appx.SPEC.classes[childNodeSpec.class]
        if (!classSpec) {
          throw new Error(`ERROR: classSpec not found [childNodeSpec.class]`)
        }
        // check if data matches spec
        const data_type = lookup_data_type(data)
        if (!type_matches_spec(data_type, childNodeSpec)) {
          // console.log(`generate.childNodeSpec NO MATCH : [${JSON.stringify(data)}] [${data_type}] not matching [${JSON.stringify(childNodeSpec)}]`)
          return
        } else {
          // console.log(`generate.childNodeSpec MATCHES : [${JSON.stringify(data)}] [${data_type}] matching [${JSON.stringify(childNodeSpec)}]`)
          found = true
        }
        /*
        // create child node
        if (!!childSpec.array) {
          // generate function
          const generate = (data) => {
            return generate_tree_node(
              js_context,
              {
                ref: null,
                parentKey: thisNode.key,
                parentChildSpec: childNodeSpec,
              },
              data
            )
          }
          // check generate definition
          if (!!childNodeSpec.generate) {
            // console.log(childSpec._childNode.generate)
            const children = eval(childNodeSpec.generate)
            console.log(`children`, children)
            if (!Array.isArray(children)) {
              throw new Error(`ERROR: childNodeSpec [array] generate method return non-array type [${JSON.stringify(childNodeSpec)}]`)
            }
            // children.map(childNode => thisNode.children.push(childNode))
            resultNode = children
          } else {
            throw new Error(`ERROR: childNodeSpec [array] missing generate method [${JSON.stringify(childNodeSpec)}]`)
          }

        } else {
        */
          // generate function
          const generate = (data) => {
            return generate_tree_node(
              js_context,
              {
                ref: _ref,
                array: !!childSpec.array,
                parentKey: thisNode.key,
                parentChildSpec: childNodeSpec,
              },
              data
            )
          }
          // check generate definition
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
                parentChildSpec: childNodeSpec,
              },
              data
            )
          }
          // set _array flag
          resultNode.data._array = !!childSpec.array
        // }
      })
      // return
      return resultNode
    }

    try {
      // process children
      if (childSpec.name === '*') {

        Object.keys(input).map(key => {
          // ignore _type
          if (key === '_type') {
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
          if (!!childSpec.optional) {
            return // continue
          } else {
            throw new Error(`ERROR: [${input._type}] missing [${childSpec.name}] [${JSON.stringify(input)}]`)
          }
        }

        // we are here for an _ref that exists
        if (!!childSpec._thisNode) {
          // process _thisNode
          const resultNodeData = _process_this(_ref, data)
          if (resultNodeData !== undefined) {
            thisNode.data[_ref] = resultNodeData
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
              } else {
                throw new Error(`ERROR: unable to process child data [array] [${_ref}] [${JSON.stringify(d)}]`)
              }
            })
          } else {
            const childNode = _process_child(_ref, data)
            if (!!childNode) {
                thisNode.children.push(childNode)
                // console.log(`childNode`, childNode)
            } else if (!childSpec.optional) {
              throw new Error(`ERROR: unable to process child data [${_ref}] [${JSON.stringify(data)}]`)
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
  lookup_type_groups,
  lookup_icon_for_type,
  lookup_icon_for_input,
  lookup_title_for_input,
  lookup_valid_child_types,
  lookup_classname_by_type,
  lookup_type_by_classname,
  reorder_children,
  isPrimitive,
}
