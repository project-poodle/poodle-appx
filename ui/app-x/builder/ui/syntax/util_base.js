import React from 'react'
import _ from 'lodash'
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
  MenuOutlined,
  MoreOutlined,
  BranchesOutlined,
  CompressOutlined,
  // AppstoreAddOutlined,
  MinusOutlined,
  StopOutlined,
  DashOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { all as CssProperties } from 'known-css-properties'

import ReactIcon from 'app-x/icon/React'
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

const PATH_SEPARATOR = '/'
const VARIABLE_SEPARATOR = '.'
const REGEX_VAR = /^[_a-zA-Z][_a-zA-Z0-9]*$/

const MODULES_EXCLUDE_SECONDARY = [
  '@material-ui/icons',
  '@ant-design/icons',
]

import {
  notification,
} from 'antd'
import * as api from 'app-x/api'

////////////////////////////////////////////////////////////////////////////////
/*
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
*/

////////////////////////////////////////////////////////////////////////////////
// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
}

// unique test
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
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

// deepCompareMemorize
function deepCompareMemorize(value) {

  const ref = React.useRef()
  // it can be done by using useMemo as well
  // but useRef is rather cleaner and easier

  if (!_.isEqual(value, ref.current)) {
    ref.current = value
    // console.log('not equal', value, ref.current)
  } else {
    // console.log('equal', value, ref.current)
  }

  return ref.current
}

////////////////////////////////////////////////////////////////////////////////

const lookup_icon_for_class = (cls) => {
  if (cls === 'string') {
    return <Text />
  } else if (cls === 'number') {
    return <NumberOutlined />
  } else if (cls === 'boolean') {
    return <PoweroffOutlined />
  } else if (cls === 'null') {
    return <MinusCircleOutlined />
  } else if (cls === 'primitive') {
    return <MoreOutlined />
  } else if (cls === 'array') {
    return <Bracket />
  } else if (cls === 'object') {
    return <CurlyBracket />
  } else if (cls === 'expression') {
    return <PercentageOutlined />
  } else if (cls === 'statement') {
    return <Code />
  } else if (cls === 'jsx') {
    return <ReactIcon />
  } else if (cls === 'any') {
    return <MenuOutlined />
  } else {
    return <QuestionOutlined />
  }
  /*
  const spec = globalThis.appx?.SPEC?.classes[cls]
  if (!spec || !spec.icon) {
    return <QuestionOutlined />
  }
  const path = parse_var_full_path(spec.icon)
  */
}

const groups = {
  // js basic
  js_basic: [
    'js/string',
    'js/number',
    'js/boolean',
    'js/null',
  ],
  // js structure
  js_structure: [
    'js/object',
    'js/array',
  ],
  // js advanced
  js_advanced: [
    'js/import',
    'js/expression',
    'js/statement',
    'js/function',
    'js/call',
  ],
  // js controls
  js_control: [
    'js/condition',
    'js/map',
    'js/reduce',
    'js/filter',
  ],
  // react
  react: [
    'react/element',
    'react/html',
    'react/state',
    'react/context',
    'react/effect',
  ],
  // form / inputs
  appx_form: [
    'appx/form',
    'appx/dialog',
    'appx/input/text',
    'appx/input/textarray',
    'appx/input/switch',
    'appx/input/select',
    'appx/input/tabular',
    'appx/input/collection',
    'appx/input/submit',
    'appx/input/reset',
    'appx/input/rule',
  ],
  // table / columns
  appx_table: [
    'appx/table',
    'appx/table/column',
  ],
  // mui
  mui: [
    'mui/theme',
    'mui/style',
  ],
  // appx
  appx: [
    'route/context',
    'route/path',
    'appx/api',
  ],
}

// return all classes
function lookup_classes() {
  return Object.keys(globalThis.appx.SPEC.classes)
}

// return all groups
function lookup_groups() {
  return Object.keys(groups)
}

// return all types
function lookup_types() {
  return Object.keys(globalThis.appx.SPEC.types)
}

// return spec for type
function lookup_spec_for_type(type) {
  return globalThis.appx.SPEC.types[type]
}

// return types by class
function lookup_types_for_class(cls) {
  return globalThis.appx?.SPEC?.classes[cls]?.types || []
  // const result = globalThis.appx?.SPEC?.classes[cls]?.types || []
  // console.log(`lookup_types_for_class`, lookup_classes(), cls, result)
  // return result
}

// return classes by type
function lookup_classes_for_type(type) {
  return Object.keys(globalThis.appx?.SPEC?.classes)
    .filter(cls => globalThis.appx?.SPEC?.classes[cls]?.types.includes(type))
    || []
}

// return types by group
function lookup_types_for_group(group) {
  return groups[group] || []
}

// return group by type
function lookup_group_for_type(type) {
  return groups.find(group => group.includes(type)) || null
}

// lookup changeable types
function lookup_changeable_types(type) {
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
  )
  {
    return [
      'react/element',
      'react/html',
    ]
  }
  else if
  (
    type === 'appx/input/text'
    || type === 'appx/input/textarray'
    || type === 'appx/input/select'
    || type === 'appx/input/switch'
  )
  {
    return [
      'appx/input/text',
      'appx/input/textarray',
      'appx/input/select',
      'appx/input/switch',
    ]
  }
  else
  {
    return [
      type
    ]
  }
}

// lookup data type
const lookup_type_for_data = (data) => {
  // get data type
  let dataType = ''
  if (isPrimitive(data)) {
    switch(typeof data) {
      case 'string':
        return 'js/string'
      case 'number':
        return 'js/number'
      case 'boolean':
        return 'js/boolean'
      case 'undefined':
        return 'js/null'
      case 'object':
        if (data === null)
          return 'js/null'
        else
          throw new Error(`ERROR: unexpected primitive data type [${data}]`)
    }
  }

  if (Array.isArray(data)) {
    return 'js/array'
  }

  if (!data._type) {
    return 'js/object'
  }

  return data._type
}

// lookup classname by type
function lookup_classname_for_type(type) {
  const classname =
    (!type || type === '/')
    ? 'appx-type-root'
    : 'appx-type-' + type.replace(/[^a-zA-Z0-9]/g, '-')
  // console.log(classname)
  return classname
}

// lookup type by classname
function lookup_type_for_classname(className) {
  // handle root
  if (className.includes('appx-type-root')) {
    return '/'
  }
  // search others
  let found = null
  Object.keys(globalThis.appx.SPEC.types).map(type => {
    if (!!found) {
      return
    }
    if (className === lookup_classname_for_type(type)) {
      found = type
    }
  })
  // return found type
  return found
}

// check if a tree accepts child
const lookup_accepted_types_for_node = (node) => {
  // check node type
  // console.log(node)
  if (!node || !node.key || node.key === '/') {
    return Object.keys(globalThis.appx.SPEC.types)
  } else if (!node?.data?._type) {
    return []
  }
  // lookup spec
  const spec = globalThis.appx.SPEC.types[node.data._type]
  if (!spec) {
    return []
  }
  // compute accepted types
  let accepted_types = []
  spec.children.map(childSpec => {
    if (!childSpec._childNode) {
      return
    }
    const typeSpec = childSpec._childNode.types === 'inherit' ? childSpec.types : childSpec._childNode.types
    const types = lookup_types_for_spec(typeSpec)
    accepted_types = accepted_types.concat(types).sort().filter(onlyUnique)
  })
  return accepted_types
}

// check if a tree accepts child
const lookup_accepted_classnames_for_node = (node) => {
  const accepted_types =
    node.key === '/'
    ? Object.keys(globalThis.appx.SPEC.types)
    : lookup_accepted_types_for_node(node)
  return accepted_types.map(type => lookup_classname_for_type(type))
}

// lookup accepted childSpec for node
const lookup_first_accepted_childSpec = (node, type) => {
  // check node type
  if (!node?.data?._type) {
    return null
  }
  // lookup spec
  const spec = globalThis.appx.SPEC.types[node.data._type]
  if (!spec) {
    return null
  }
  // compute accepted types
  let accepted_childSpec = null
  spec.children.map(childSpec => {
    if (!!accepted_childSpec) {
      return // if already found
    }
    if (!childSpec._childNode) {
      return
    }
    const typeSpec = childSpec._childNode.types === 'inherit' ? childSpec.types : childSpec._childNode.types
    const types = lookup_types_for_spec(typeSpec)
    // check if matches
    if (types.includes(type)) {
      accepted_childSpec = childSpec
    }
  })
  // return
  return accepted_childSpec
}

// enrich_primitive_data
const enrich_primitive_data = (data) => {
  if (isPrimitive(data)) {
    return {
      _type: lookup_type_for_data(data),
      data: data
    }
  } else {
    return data
  }
}

// lookup types for spec
const lookup_types_for_spec = (typeSpec) => {
  return Object.keys(globalThis.appx.SPEC.types).filter(type => type_matches_spec(type, typeSpec))
}

// check if data matches the match spec
const type_matches_spec = (data_type, typeSpec) => {
  // type spec must be an array
  if (!Array.isArray(typeSpec)) {
    throw new Error(`ERROR: type spec is not an array`)
  }
  // iterate type spec
  return !!typeSpec.find(spec => {
    // if no class in matchSpec
    if (!spec.kind) {
      throw new Error(`ERROR: type spec missing [kind]`)
    }
    if (!spec.data) {
      throw new Error(`ERROR: type spec missing [data]`)
    }
    // check kind
    switch (spec.kind) {
      case 'class':
        // check classSpec
        if (!globalThis.appx?.SPEC?.classes[spec.data]) {
          return false
        }
        // get classSpec
        const classSpec = globalThis.appx.SPEC.classes[spec.data]
        // check that classSpec includes data_type
        return classSpec.types.includes(data_type)
      case 'type':
        // check data_type matches
        return data_type === spec.data
      case 'shape':
        // check data_type is 'js/object'
        return data_type === 'js/object'
      default:
        throw new Error(`ERROR: unrecognized type spec [kind] [${spec.kind}]`)
    }
  })
}

// check if node matches the match spec
const data_matches_spec = (data, typeSpec) => {
  const data_type = lookup_type_for_data(data)
  return type_matches_spec(data_type, typeSpec)
}

////////////////////////////////////////////////////////////////////////////////
// api methods
const api_methods = [
  'get',
  'post',
  'put',
  'delete',
  'head',
  'patch',
]

// return a list of valid html tags
function valid_api_methods() {
  return api_methods
}

////////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////
// stores a list of valid import_names
const _valid_import_data = {}
const _valid_import_names = []

function lookup_prop_types(name, callback) {
  if (!globalThis.appx?.IMPORT_MAPS) {
    throw new Error(`ERROR: appx.IMPORT_MAPS not set`)
  }
  if (!name) {
    return []
  }
  // lookup prop types
  // console.log(`lookup_prop_types: ${name}`)
  const parsed = parse_var_full_path(name)
  const full_paths = [...parsed.full_paths]

  let found = null
  let lib_path = null
  const libs = globalThis.appx?.IMPORT_MAPS.libs
  if (!!libs) {
    Object.keys(libs).map(lib_key => {
      if (!!found) {
        return
      }
      found = libs[lib_key].modules.find(module_name => name.startsWith(module_name))
      lib_path = libs[lib_key].path
    })
  }

  if (!!found) {
    import(lib_path).then(path_module => {
      const module_content = path_module['default'][found]
      const found_paths = found.split(PATH_SEPARATOR)
      while (found_paths.length) {
        found_paths.shift()
        full_paths.shift()
      }
      let react_element = module_content
      while (full_paths.length) {
        react_element = react_element[full_paths[0]]
        full_paths.shift()
      }
      // callback
      if (!!react_element && !!react_element.propTypes) {
        // special handling for @material-ui/ styled components
        if (found.startsWith('@material-ui/') && !!react_element.Naked?.propTypes) {
          // console.log('@material-ui/', `propTypes`, found, react_element, react_element.propTypes)
          if (!!callback) {
            callback(Object.keys(react_element.Naked.propTypes))
          }
        } else {
          // console.log(`propTypes`, react_element, react_element.propTypes)
          if (!!callback) {
            callback(Object.keys(react_element.propTypes))
          }
        }
      } else {
        if (!!callback) {
          callback([])
        }
      }
    })
  } else {
    if (!!callback) {
      callback([])
    }
  }
}

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
          modules.filter(module_name => !module_name.startsWith('@babel')).map(module_name => {
            // console.log(module_name)
            const module_content = path_module['default'][module_name]
            if (typeof module_content === 'object' && !!module_content) {
              // console.log(module_content)
              Object.keys(module_content).map(variable_name => {
                /*
                if (variable_name === 'default') {
                  // add default
                  _valid_import_data[module_name] = {
                    title: module_name,
                    module: module_name,
                    variable: variable_name,
                  }
                }
                */
                const title = module_name + VARIABLE_SEPARATOR + variable_name
                const react_element = module_content[variable_name]
                _valid_import_data[title] = {
                  title: title,
                  module: module_name,
                  variable: variable_name,
                  propTypes: [],
                }
                // handle propTypes
                if (!!react_element && !!react_element.propTypes) {
                  // special handling for @material-ui/ styled components
                  if (module_name.startsWith('@material-ui/') && !!react_element.Naked?.propTypes) {
                    // console.log('@material-ui/', `propTypes`, found, react_element, react_element.propTypes)
                    _valid_import_data[title].propTypes = Object.keys(react_element.Naked.propTypes)
                  } else {
                    // console.log(`propTypes`, react_element, react_element.propTypes)
                    _valid_import_data[title].propTypes = Object.keys(react_element.propTypes)
                  }
                }
                // add children if not in exluded list
                if (!MODULES_EXCLUDE_SECONDARY.includes(module_name)) {
                  if (!!react_element) {
                    Object.keys(react_element)
                      .filter(subVar => !subVar.startsWith('$'))
                      .map(subVar => {
                        const subvar_title = module_name + VARIABLE_SEPARATOR + variable_name + VARIABLE_SEPARATOR + subVar
                        _valid_import_data[subvar_title] = {
                          title: subvar_title,
                          module: module_name,
                          variable: variable_name,
                          subVar: subVar,
                        }
                      })
                  }
                }
              })
            }
          })
        }
      })
      .catch(error => {
        console.log(error)
      })
    })
  }

  // load appx
  if (!!globalThis.appx?.APPX_PATHS?.paths) {
    globalThis.appx.APPX_PATHS.paths.map(path => {
      // import lib path
      // console.log(path)
      import(PATH_SEPARATOR + path)
      .then(path_module => {
        // console.log(path_module)
        const module_name = path
        if (!!path_module.default) {
          const react_element = path_module.default
          _valid_import_data[module_name] = {
            title: module_name,
            module: module_name,
            variable: 'default',
            propTypes: [],
          }
          // handle propTypes
          if (!!react_element && !!react_element.propTypes) {
            // special handling for @material-ui/ styled components
            if (path.startsWith('@material-ui/') && !!react_element.Naked?.propTypes) {
              // console.log('@material-ui/', `propTypes`, found, react_element, react_element.propTypes)
              _valid_import_data[module_name].propTypes = Object.keys(react_element.Naked.propTypes)
            } else {
              // console.log(`propTypes`, react_element, react_element.propTypes)
              _valid_import_data[module_name].propTypes = Object.keys(react_element.propTypes)
            }
          }
          Object.keys(path_module.default)
            .filter(variable_name => !variable_name.startsWith('$'))
            .map(variable_name => {
              const title = module_name + VARIABLE_SEPARATOR + variable_name
              _valid_import_data[title] = {
                title: title,
                module: module_name,
                variable: variable_name,
              }
            })
        } else {
          Object.keys(path_module)
            .filter(variable_name => !variable_name.startsWith('$'))
            .map(variable_name => {
              const title = module_name + VARIABLE_SEPARATOR + variable_name
              _valid_import_data[title] = {
                title: title,
                module: module_name,
                variable: variable_name,
              }
            })
        }
      })
      .catch(error => {
        console.log(error)
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

function valid_namespaces() {
  return globalThis.appx.API_MAPS.api.map(api => api.namespace).sort().filter(onlyUnique)
}

function valid_app_names() {
  return globalThis.appx.API_MAPS.api.map(api => api.app_name).sort().filter(onlyUnique)
}

function valid_app_deployments() {
  const app_deployments = []
  globalThis.appx.API_MAPS.api.map(api => {
    if (!!api.deployment?.app_deployment) {
      app_deployments.push(api.deployment.app_deployment)
    }
  })
  return app_deployments.sort().filter(onlyUnique)
}

let apiEndpoints = []
function load_api_endpoints() {
  globalThis.appx.API_MAPS.api
    .filter(row => !!row.app_deployment)
    .map(row => {
      api.get(
        'sys',
        'appx',
        `/namespace/${row.namespace}/app_deployment/app/${row.app_name}/deployment/${row.app_deployment}/api`,
        result => {
          const endpoints = result.map(row => row.api_endpoint)
          apiEndpoints = endpoints.sort().filter(onlyUnique)
          // console.log(`apiEndpoints : ${apiEndpoints.length}`)
        },
        error => {
          console.error(error)
          notification.error({
            message: 'Failed to retrieve list of APIs',
            description: error.message || String(error),
            placement: 'bottomLeft',
          })
        }
      )
    })
}
load_api_endpoints()

function valid_api_endpoints() {
  return apiEndpoints
}

// css property names
function cssNameToJsName(name)
{
    var split = name.split("-");
    var output = "";
    for(var i = 0; i < split.length; i++)
    {
        if (i > 0 && split[i].length > 0 && !(i == 1 && (split[i] == "ms" || split[i] == "webkit")))
        {
            split[i] = split[i].substr(0, 1).toUpperCase() + split[i].substr(1);
        }
        output += split[i];
    }
    return output;
}

function jsNameToCssName(name)
{
    return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}

let _valid_css_properties = []
function valid_css_properties() {
  // console.log(`CssProperties`, CssProperties)
  if (_valid_css_properties.length === 0) {
    const result = []
    CssProperties.map(prop => {
      result.push(cssNameToJsName(prop))
    })
    _valid_css_properties = result.sort()
  }
  return _valid_css_properties
}

function valid_propTypes_for(name) {
  return _valid_import_data[name]?.propTypes || []
}

// all validation methods
const validation = {
  valid_namespaces: valid_namespaces,
  valid_app_names: valid_app_names,
  valid_app_deployments: valid_app_deployments,
  valid_api_methods: valid_api_methods,
  valid_api_endpoints: valid_api_endpoints,
  valid_html_tags: valid_html_tags,
  valid_import_names: valid_import_names,
  valid_css_properties: valid_css_properties,
  valid_propTypes_for: valid_propTypes_for,
}

////////////////////////////////////////////////////////////////////////////////
// export
export {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  REGEX_VAR,
  isPrimitive,
  parse_var_full_path,
  deepCompareMemorize,
  // lookup
  lookup_classes,
  lookup_groups,
  lookup_types,
  lookup_spec_for_type,
  lookup_types_for_class,
  lookup_classes_for_type,
  lookup_types_for_group,
  lookup_group_for_type,
  lookup_changeable_types,
  lookup_type_for_data,
  lookup_type_for_classname,
  lookup_classname_for_type,
  lookup_accepted_types_for_node,
  lookup_accepted_classnames_for_node,
  lookup_first_accepted_childSpec,
  lookup_icon_for_class,
  // enrich_primitive_data,
  type_matches_spec,
  data_matches_spec,
  lookup_types_for_spec,
  // valid auto complete
  validation,
  valid_api_methods,
  valid_import_names,
  valid_html_tags,
  valid_propTypes_for,
}
