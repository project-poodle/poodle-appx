import React, { useState, useEffect, useContext } from 'react'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Box,
  Button,
  IconButton,
  Fab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Typography,
  makeStyles
} from '@material-ui/core'
import {
  DeleteOutlineOutlined,
} from '@material-ui/icons'
import {
  Layout,
  Tree,
  Tabs,
  Radio,
  // Tooltip,
  notification,
  Button as AntButton,
} from 'antd'
const { Header, Footer, Sider, Content } = Layout
const {
  TreeNode,
  DirectoryTree,
} = Tree
const { TabPane } = Tabs;
import {
  DeleteOutlined,
  QuestionOutlined,
  Icon,
} from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useForm, Controller } from "react-hook-form";
import { parse, parseExpression } from "@babel/parser"

import spec from 'app-x/spec'
console.log(spec)
import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import Asterisk from 'app-x/icon/Asterisk'
import Save from 'app-x/icon/Save'
import Reset from 'app-x/icon/Reset'
import Undo from 'app-x/icon/Undo'
import Redo from 'app-x/icon/Redo'
import {
  parse_js,
  lookup_icon_for_type,
  lookup_title_for_input,
  lookup_valid_child_types,
  lookup_classname_by_type,
  lookup_type_by_classname,
  reorder_children,
} from 'app-x/builder/ui/syntax/util_parse'
import {
  gen_js,
  tree_traverse,
  tree_lookup,
  lookup_child_by_ref
} from 'app-x/builder/ui/syntax/util_tree'
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import SyntaxAddDialog from 'app-x/builder/ui/syntax/SyntaxAddDialog'
import SyntaxDeleteDialog from 'app-x/builder/ui/syntax/SyntaxDeleteDialog'
import SyntaxMoveDialog from 'app-x/builder/ui/syntax/SyntaxMoveDialog'
import SyntaxMenu from 'app-x/builder/ui/syntax/SyntaxMenu'
import TestEditor from 'app-x/builder/ui/syntax/TestEditor'

// capitalize string
function capitalize(s) {
    if (typeof s !== 'string') {
        throw new Error(`ERROR: capitalize input is not string [${typeof s}]`)
    }
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const SyntaxTree = (props) => {

  // styles
  const styles = makeStyles((theme) => ({
    root: {
      height: '100%',
      width: '100%',
    },
    pane: {
      height: '100%',
      width: '100%',
      // overflow: 'scroll',
    },
    toolTop: {
      margin: theme.spacing(1, 2),
      // cursor: 'move',
    },
    fab: {
      margin: theme.spacing(1),
      // cursor: 'move',
    },
    treeBox: {
      height: '100%',
      width: '100%',
      overflow: 'scroll',
      backgroundColor: theme.palette.background.paper,
    },
    tree: {
      width: '100%',
    },
    dialog: {
      minWidth: 460,
      [theme.breakpoints.up('md')]: {
        minWidth: 600,
      },
    },
    asterisk: {
      // paddingLeft: theme.spacing(1),
      color: theme.palette.error.light,
    },
    dialogContent: {
      padding: theme.spacing(0, 5, 3),
    },
    sider: {
      // width: 122,
      margin: 0,
      padding: 0,
      backgroundColor: theme.palette.background.paper,
      overflow: 'scroll',
      // border
      border: 1,
      borderTop: 0,
      borderRight: 0,
      borderBottom: 0,
      borderStyle: 'dotted',
      borderColor: theme.palette.divider,
    },
  }))()

  // nav context
  const {
    navDeployment,
    navComponent,
    navRoute,
    navSelected,
  } = useContext(NavProvider.Context)

  // context
  const {
    // tree data
    treeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
    // test data
    testData,
    // dirty flags
    syntaxDirty,
    setSyntaxDirty,
    testDirty,
    setTestDirty,
    // common
    loadTimer,
    setLoadTimer,
    previewInitialized,
    setPreviewInitialized,
    // history and actions
    makeFreshAction,
    makeDesignAction,
    // makeTestAction,
    updateDesignAction,
    // updateTestAction,
    history,
    undo,
    redo,
  } = useContext(SyntaxProvider.Context)

  const designTreeRef = React.createRef()

  // selectedKey will reset selectedTool
  useEffect(() => {
    if (!!selectedKey) {
      setSelectedTool(null)
    }
  }, [selectedKey])

  // selected pallette tool
  const [ selectedTool,     setSelectedTool     ] = useState(null)
  // syntax tree cursor
  const [ syntaxTreeCursor, setSyntaxTreeCursor ] = useState('progress')
  // loading and saving
  const [ loadTrigger,      setLoadTrigger      ] = useState(new Date())  // trigger a load by default
  const [ saveTrigger,      setSaveTrigger      ] = useState(0)

  // process api data
  function process_api_data(data) {
    // check array
    if (Array.isArray(data)) {
      data = data[0]
    }

    // set api data
    // setApiData(data)
    // console.log(data)

    // data check
    let spec_data = {}
    if (navSelected?.type === 'ui_component') {
      // check data sanity
      if (!('ui_component_spec' in data)) {
        // fresh action
        makeFreshAction(`init`, [], null, [], null, true)
        return
      } else {
        spec_data = data.ui_component_spec
      }
    } else if (navSelected?.type === 'ui_route') {
      // check data sanity
      if (!('ui_route_spec' in data)) {
        // fresh action
        makeFreshAction(`init`, [], null, [], null, true)
        return
      } else {
        spec_data = data.ui_route_spec
      }
    }
    // console.log(`spec_data`, spec_data)

    // remove _test if exist
    const filtered = Object.keys(spec_data)
      .filter(key => key !== '_test')
      .reduce((obj, key) => {
        obj[key] = spec_data[key]
        return obj
      }, {})
    // console.log(`filtered`, filtered)

    const js_context = { topLevel: true }
    const parsedTree = parse_js(js_context, null, null, filtered)
    // console.log(parsedTree)

    const parsedTest = !!spec_data._test
      ? spec_data._test
      : null

    // console.log(`parsed`, parsedTree, parsedTest)
    // fresh action
    makeFreshAction(`init`, parsedTree, parsedTest, js_context.expandedKeys, null, true)
  }

  // load data via api
  useEffect(() => {

    // console.log(navDeployment)
    // console.log(navSelected)
    // console.log(navComponent)

    if
    (
      !!navDeployment
      && !!navDeployment.namespace
      && !!navDeployment.ui_name
      && !!navDeployment.ui_ver
      && !!navDeployment.ui_deployment
      && !!navSelected
    )
    {
      if (
        navSelected.type === 'ui_component'
        && !!navComponent
        && !!navComponent.ui_component_name
      ) {
        const loadUrl = `/namespace/${navDeployment.namespace}/ui_deployment/ui/${navDeployment.ui_name}/deployment/${navDeployment.ui_deployment}/ui_component/base64:${btoa(navComponent.ui_component_name)}`
        // console.log(url)
        api.get(
          'sys',
          'appx',
          loadUrl,
          data => {
            // console.log(data)
            process_api_data(data)
            setLoadTrigger(0)
            setLoadTimer(new Date())
            if (navComponent.ui_component_type === 'react/component') {
              setPreviewInitialized(false)
            }
          },
          error => {
            console.error(error)
            notification['error']({
              message: `Failed to load UI component [${navComponent.ui_component_name}]`,
              description: error.toString(),
              placement: 'bottomLeft',
            })
            setLoadTrigger(0)
            setLoadTimer(new Date())
            if (navComponent.ui_component_type === 'react/component') {
              setPreviewInitialized(false)
            }
          }
        )
      }
      else if
      (
        navSelected.type === 'ui_route'
        && !!navRoute
        && !!navRoute.ui_route_name
      )
      {
        const loadUrl = `/namespace/${navDeployment.namespace}/ui_deployment/ui/${navDeployment.ui_name}/deployment/${navDeployment.ui_deployment}/ui_route/base64:${btoa(navRoute.ui_route_name)}`
        // console.log(url)
        api.get(
          'sys',
          'appx',
          loadUrl,
          data => {
            // console.log(data)
            process_api_data(data)
            setLoadTrigger(0)
            setLoadTimer(new Date())
            setPreviewInitialized(false)
          },
          error => {
            console.error(error)
            notification['error']({
              message: `Failed to load UI route [${navRoute.ui_route_name}]`,
              description: error.toString(),
              placement: 'bottomLeft',
            })
            setLoadTrigger(0)
            setLoadTimer(new Date())
            setPreviewInitialized(false)
          }
        )
      }
    }
  },
  [
    navDeployment.namespace,
    navDeployment.ui_name,
    navDeployment.ui_ver,
    navDeployment.ui_deployment,
    navComponent.ui_component_name,
    navRoute.ui_route_name,
    navSelected.type,
    loadTrigger,
  ])

  // save data via api
  useEffect(() => {
    // do not save initially
    if (!saveTrigger) {
      return
    }

    if
    (
      !!navDeployment
      && !!navDeployment.namespace
      && !!navDeployment.ui_name
      && !!navDeployment.ui_ver
      && !!navDeployment.ui_deployment
      && !!navSelected
    )
    {
      // generate spec
      const tree_context = { topLevel: true }
      const { ref, data: genData } = gen_js(tree_context, treeData)
      const spec = !!testData
        ? { ...genData, _test: testData }
        : genData
      // console.log(spec)
      if (
        navSelected.type === 'ui_component'
        && !!navComponent
        && !!navComponent.ui_component_name
      ) {
        // url
        const saveUrl = `/namespace/${navDeployment.namespace}/ui/${navDeployment.ui_name}/${navDeployment.ui_ver}/ui_component/base64:${btoa(navComponent.ui_component_name)}`
        // console.log(url)
        api.put(
          'sys',
          'appx',
          saveUrl,
          {
            ui_component_spec: spec,
          },
          data => {
            // console.log(data)
            const loadUrl = `/namespace/${navDeployment.namespace}/ui_deployment/ui/${navDeployment.ui_name}/deployment/${navDeployment.ui_deployment}/ui_component/base64:${btoa(navComponent.ui_component_name)}`
            api.get(
              'sys',
              'appx',
              loadUrl,
              data => {
                // console.log(data)
                process_api_data(data)
                setSaveTrigger(0)
                setLoadTimer(new Date())
                if (navComponent.ui_component_type === 'react/component') {
                  setPreviewInitialized(false)
                }
              },
              error => {
                console.error(error)
                notification['error']({
                  message: `Failed to load UI component [${navComponent.ui_component_name}]`,
                  description: error.toString(),
                  placement: 'bottomLeft',
                })
                setSaveTrigger(0)
                setLoadTimer(new Date())
                if (navComponent.ui_component_type === 'react/component') {
                  setPreviewInitialized(false)
                }
              }
            )
          },
          error => {
            console.error(error)
            notification['error']({
              message: `Failed to save UI component [${navComponent.ui_component_name}]`,
              description: error.toString(),
              placement: 'bottomLeft',
            })
            setSaveTrigger(0)
            setLoadTimer(new Date())
            if (navComponent.ui_component_type === 'react/component') {
              setPreviewInitialized(false)
            }
          }
        )
      }
      else if
      (
        navSelected.type === 'ui_route'
        && !!navRoute
        && !!navRoute.ui_route_name
      )
      {
        // url
        const saveUrl = `/namespace/${navDeployment.namespace}/ui/${navDeployment.ui_name}/${navDeployment.ui_ver}/ui_route/base64:${btoa(navRoute.ui_route_name)}`
        // console.log(url)
        api.put(
          'sys',
          'appx',
          saveUrl,
          {
            ui_route_spec: spec,
          },
          data => {
            // console.log(data)
            const loadUrl = `/namespace/${navDeployment.namespace}/ui_deployment/ui/${navDeployment.ui_name}/deployment/${navDeployment.ui_deployment}/ui_route/base64:${btoa(navRoute.ui_route_name)}`
            api.get(
              'sys',
              'appx',
              loadUrl,
              data => {
                // console.log(data)
                process_api_data(data)
                setSaveTrigger(0)
                setLoadTimer(new Date())
                setPreviewInitialized(false)
              },
              error => {
                console.error(error)
                notification['error']({
                  message: `Failed to load UI route [${navRoute.ui_route_name}]`,
                  description: error.toString(),
                  placement: 'bottomLeft',
                })
                setSaveTrigger(0)
                setLoadTimer(new Date())
                setPreviewInitialized(false)
              }
            )
          },
          error => {
            console.error(error)
            notification['error']({
              message: `Failed to save UI route [${navRoute.ui_route_name}]`,
              description: error.toString(),
              placement: 'bottomLeft',
            })
            setSaveTrigger(0)
            setLoadTimer(new Date())
            setPreviewInitialized(false)
          }
        )
      }
    }
  }, [saveTrigger])


  // selectedTool
  useEffect(() => {
    if (!selectedTool || selectedTool === 'pointer') {
      setSyntaxTreeCursor(`pointer`)
    } else {
      const iconString = ReactDOMServer.renderToStaticMarkup(lookup_icon_for_type(selectedTool))
      const iconElement = new DOMParser().parseFromString(iconString, 'text/html')
      const svgElement = iconElement.getElementsByTagName('svg')
      if (svgElement.length) {
        svgElement[0].setAttribute("xmlns", "http://www.w3.org/2000/svg")
        // console.log('svgElement.outerHTML', svgElement[0].outerHTML)
        const cursor = `url('data:image/svg+xml;base64,${btoa(svgElement[0].outerHTML)}'), copy`
        setSyntaxTreeCursor(cursor)
      } else {
        setSyntaxTreeCursor(`copy`)
      }
    }
  }, [selectedTool])

  // expansion timeout
  const [ expandTimer, setExpandTimer ] = useState(new Date())
  useEffect(() => {
    setTimeout(() => {
      setExpandTimer(new Date())
    }, 500)
  }, [expandedKeys])

  // update syntaxTreeCursor
  useEffect(() => {
    // console.log('updateCursor', syntaxTreeCursor)
    // console.log(designTreeRef)
    // html node
    const node = ReactDOM.findDOMNode(designTreeRef.current)
    if (!node) {
      return
    }
    // find all tree node
    const treeNodeList = node.querySelectorAll('.appx-tree-node')
    if (!treeNodeList) {
      return
    }
    // iterate tree node list
    treeNodeList.forEach(treeNode => {
      const parentType = lookup_type_by_classname(treeNode.className)
      // console.log(treeNode)
      // console.log(parentType)
      if (parentType) {
        const valid_child_types = lookup_valid_child_types(parentType)
        // console.log(valid_child_types)
        const draggableList = treeNode.querySelectorAll('[draggable]')
        if (!selectedTool) {
          draggableList.forEach(draggable => {
            // console.log('canDrop', draggable)
            draggable.style.cursor = 'pointer'
          })
        } else if (valid_child_types?.ref?._types.includes(selectedTool)
            || valid_child_types?._?._types.includes(selectedTool)) {
          // if selected tool is one of the valid child _types
          draggableList.forEach(draggable => {
            // console.log('canDrop', draggable)
            draggable.style.cursor = syntaxTreeCursor
          })
        } else {
          // if selected tool is not one of the valid child _types
          draggableList.forEach(draggable => {
            // console.log('noDrop', draggable)
            draggable.style.cursor = 'not-allowed'
          })
        }
      }
    })
  }, [syntaxTreeCursor, expandTimer])

  // selected node
  const selectedNode = tree_lookup(treeData, selectedKey)

  // context menu
  const [ contextAnchorEl, setContextAnchorEl ] = useState(null)

  // add dialog state
  const [ nodeParent,         setNodeParent         ] = useState(null)
  const [ addNodeRef,         setAddNodeRef         ] = useState(null)
  const [ addNodeRefRequired, setAddNodeRefRequired ] = useState(false)
  const [ addNodeType,        setAddNodeType        ] = useState('')
  const [ addDialogOpen,      setAddDialogOpen      ] = useState(false)
  const [ isSwitchDefault,    setSwitchDefault      ] = useState(false)

  // add menu clicked
  const addMenuClicked = (info => {
    // console.log('add', info)
    setContextAnchorEl(null)
    // find node
    const parentNode = tree_lookup(treeData, info.nodeKey)
    if (!!parentNode) {
      // add dialog
      // console.log(info)
      setNodeParent(parentNode)
      setAddNodeRef(info.nodeRef)
      setAddNodeRefRequired(info.nodeRefRequired)
      setAddNodeType(info.nodeType)
      setSwitchDefault(!!info.isSwitchDefault)
      setAddDialogOpen(true)
    }
  })

  // add callback
  const addCallback = (nodeRef, nodeParent, nodeData) => {
    // console.log(nodeRef, nodeParent, nodeData)
    // ready to add node
    const resultTree = _.cloneDeep(treeData)
    const tmpParent = tree_lookup(resultTree, nodeParent.key)
    const lookupParent = (tmpParent.data.type === '/') ? null : tmpParent
    // parent key
    let parentKey = null
    if (!!lookupParent) {
      parentKey = lookupParent.key
    }
    // ref
    const ref =
      (nodeData.type === 'react/state')
      ? !!nodeData.__customRef        // special handle of 'react/state'
        ? nodeData._ref
        : `...${nodeData.name}`
      : !!nodeRef ? nodeRef : (nodeData._ref ? nodeData._ref : null)
    // console.log(parentKey, ref, nodeData)
    const parse_context = {}
    var parsed = null
    // handle js/switch specially
    if (lookupParent?.data?._type === 'js/switch') {
      if (nodeData.default) {
        parsed = parse_js(parse_context, parentKey, 'default', nodeData)
      } else {
        parsed = parse_js(parse_context, parentKey, null, nodeData)
        parsed.data.condition = nodeData.condition
      }
    } else {
      // parse nodeData
      parsed = parse_js(parse_context, parentKey, ref, nodeData)
    }
    // console.log(nodeRef, nodeParent, parsed)
    // insert to proper location
    if (lookupParent) {
      if (!!ref) {
        lookupParent.children.unshift(parsed)
      } else {
        if ('__pos' in nodeData) {
          let count = 0
          let found = false
          lookupParent.children.map((child, index) => {
            if (found) {
              return
            }
            if (!child.data._ref) {
              count = count+1
            }
            // check if we'd insert before first component with no _ref
            if (nodeData.__pos === 0 && count !== 0) {
              found = true
              lookupParent.children.splice(index, 0, parsed)
              return
            }
            if (count >= nodeData.__pos) {
              found = true
              lookupParent.children.splice(index+1, 0, parsed)
              return
            }
          })
        } else {
          // no __pos, simply add to the end
          lookupParent.children.push(parsed)
        }
      }
      reorder_children(lookupParent)
    } else {
      // add to the root as first component
      resultTree.splice(1, 0, parsed)
    }
    // console.log(gen_js({topLevel: true}, resultTree))
    // process expanded keys
    const newExpandedKeys = _.cloneDeep(expandedKeys)
    parse_context.expandedKeys.map(key => {
      if (!newExpandedKeys.includes(key)) {
        newExpandedKeys.push(key)
      }
    })
    if (!!lookupParent && !newExpandedKeys.includes(lookupParent.key)) {
      newExpandedKeys.push(lookupParent.key)
    }
    // take action
    makeDesignAction(
      `Add [${parsed?.title}]`,
      resultTree,
      newExpandedKeys,
      selectedKey,
    )
  }

  // delete dialog state
  const [ deleteNode,             setDeleteNode           ] = useState(null)
  const [ deleteDialogOpen,       setDeleteDialogOpen     ] = useState(false)

  // delete menu clicked
  const deleteMenuClicked = (info => {
    // console.log('delete', info)
    setContextAnchorEl(null)
    // find node
    const lookupNode = tree_lookup(treeData, info.nodeKey)
    if (!!lookupNode) {
      // confirm deletion dialog
      setDeleteNode(lookupNode)
      setDeleteDialogOpen(true)
    }
  })

  // delete callback
  const deleteCallback = (lookupNode) => {
    // actual delete only if confirmed
    let resultTree = _.cloneDeep(treeData)
    const lookupParent = tree_lookup(resultTree, lookupNode.parentKey)
    if (!!lookupParent && lookupParent.key !== '/') {
      // console.log(lookupParent)
      lookupParent.children = lookupParent.children.filter(child => {
        return child.key !== lookupNode.key
      })
    } else {
      // console.log('here')
      // this is one of the root node
      resultTree =
        resultTree.filter(child => {
          return child.key !== lookupNode.key
        })
    }
    if (selectedKey === lookupNode?.key) {
      setSelectedKey(null)
    }
    // take action
    makeDesignAction(
      `Delete [${lookupNode?.title}]`,
      resultTree,
      expandedKeys,
      null,
    )
  }

  // move
  const [ moveDialogOpen,       setMoveDialogOpen     ] = useState(false)
  const [ moveCallback,         setMoveCallback       ] = useState(null)
  const [ moveDragNode,         setMoveDragNode       ] = useState(null)
  const [ moveDropParent,       setMoveDropParent     ] = useState(null)

  // expand/collapse
  const onExpand = keys => {
    setExpandedKeys(keys)
  }

  // select
  const onSelect = key => {
    // console.log(`selected ${key}`)
    if (key.length) {
      setSelectedKey(key[0])
      // drop a selected tool here
      if (selectedTool) {
        // console.log('here', selectedTool, key[0])
        // console.log('add', info)
        setContextAnchorEl(null)
        // find node
        const parentNode = tree_lookup(treeData, key[0])
        if (!!parentNode) {
          // add dialog
          // console.log('here2', selectedTool, parentNode)
          setNodeParent(parentNode)
          const valid_child_types = lookup_valid_child_types(parentNode.data.type)
          if (valid_child_types?._?._types.includes(selectedTool)) {
            setAddNodeRef(null)
            setAddNodeRefRequired(false)
            setAddNodeType(selectedTool)
            setSwitchDefault(false)
            setAddDialogOpen(true)
          } else if (valid_child_types?.ref?._types.includes(selectedTool)) {
            setAddNodeRef(null)
            setAddNodeRefRequired(true)
            setAddNodeType(selectedTool)
            setSwitchDefault(false)
            setAddDialogOpen(true)
          }
          // not found, just ignore
        }
        // setSelectedTool(null) // handled by effect
      }
    } else {
      setSelectedKey(null)
    }
  }

  // drag start
  const onDragStart = info => {
    //console.trace()
    //console.log(info.node.key)
    info.event.dataTransfer.setData("application", info.node.key)
    // info.event.dataTransfer.effectAllowed = 'move'
    // console.log(info.event)
    if (info.node.key === '/') {
      let target = info.event.target
      while (target.parentNode && !target.draggable) {
        target = target.parentNode
      }
      //console.log(target)
      // setSyntaxTreeCursor('not-allowed')
    }
  }

  // drop
  const onDrop = info => {
    // console.log(info)
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    const dropPosition = info.dropPosition

    // check for root
    if (dragKey === '/') {
      return
    }

    // replicate treeData
    const resultData = _.cloneDeep(treeData)

    let dragFunc = () => {}
    let dropFunc = () => {}

    // Find dragObject
    let dragObj
    tree_traverse(resultData, dragKey, (item, index, arr) => {
      dragFunc = () => {
        arr.splice(index, 1)
      }
      dragObj = item
    })

    let dropParentKey
    if (!info.dropToGap) {
      // Drop on the content
      tree_traverse(resultData, dropKey, item => {
        // console.log(item)
        item.children = item.children || []
        // where to insert
        // console.log(expandedKeys)
        dropParentKey = item.key
        dropFunc = () => {
          dragObj.parentKey = item.key
          item.children.unshift(dragObj)
        }
        if (!expandedKeys.includes(item.key)) {
          // console.log([...expandedKeys, item.key])
          setExpandedKeys(
            [...expandedKeys, item.key]
          )
        }
      })
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      tree_traverse(resultData, dropKey, item => {
        item.children = item.children || []
        // where to insert
        dropParentKey = item.key
        dropFunc = () => {
          dragObj.parentKey = item.key
          item.children.unshift(dragObj)
        }
        // in previous version, we use item.children.push(dragObj) to insert the
        // item to the tail of the children
      })
    } else {
      let ar
      let i
      let t
      tree_traverse(resultData, dropKey, (item, index, arr) => {
        ar = arr
        i = index
        t = item
      })
      if (dropPosition === -1) {
        dropParentKey = t.parentKey
        dropFunc = () => {
          dragObj.parentKey = t.parentKey
          ar.splice(i, 0, dragObj)
        }
      } else {
        dropParentKey = t.parentKey
        dropFunc = () => {
          dragObj.parentKey = t.parentKey
          ar.splice(i + 1, 0, dragObj)
        }
      }
    }

    // compute dropParent
    let dropParent
    tree_traverse(resultData, dropParentKey, (item, index, arr) => {
      dropParent = item
    })
    // set to root if not found
    if (!dropParent) {
      dropParent = {
        key: null,
        data: {
          type: '/'
        }
      }
    }

    // callback with move confirmation
    const thisMoveCallback = (data) => {

      // console.log(dragObj, data)
      if (dropParent.data.type === 'js/switch') {
        if (!!data.default) {
          dragObj.data._ref = 'default'
          dragObj.title = lookup_title_for_input(dragObj.data._ref, dragObj.data)
        } else {
          dragObj.data._ref = null
          dragObj.title = lookup_title_for_input(dragObj.data._ref, dragObj.data)
          dragObj.data.condition = data.condition
        }
      } else {
        // set ref
        dragObj.data._ref = data._ref
        dragObj.title = lookup_title_for_input(dragObj.data._ref, dragObj.data)
      }

      // drag & drop
      dragFunc()
      dropFunc()

      reorder_children(dropParent)

      const newExpandedKeys = _.cloneDeep(expandedKeys)
      if (!newExpandedKeys.includes(dropParent.key)) {
        newExpandedKeys.push(dropParent.key)
      }

      // take action
      makeDesignAction(
        `Drag & Drop [${dragObj.title}]`,
        resultData,
        newExpandedKeys,
        dragObj.key
      )
    }

    // check if drop parent is same as current parent
    // console.log(dragObj.parentKey)
    if (dropParent.key === dragObj.parentKey) {
      thisMoveCallback({
         _ref: dragObj.data._ref     // keep _ref
      })

    } else if (
      // check drop parent type
      dropParent.data.type === '/'
      || dropParent.data.type === 'js/object'
      || dropParent.data.type === 'mui/style'
      || dropParent.data.type === 'js/switch'
      || dropParent.data.type === 'js/map'
      || dropParent.data.type === 'js/reduce'
      || dropParent.data.type === 'js/filter'
      ||
      (
        (
          dropParent.data.type === 'react/element'
          || dropParent.data.type === 'react/html'
        )
        &&
        (
          dragObj.data.type === 'js/object'
        )
      )
    ) {

      setMoveDragNode(dragObj)
      setMoveDropParent(dropParent)
      setMoveCallback(() => { return thisMoveCallback})
      setMoveDialogOpen(true)

    } else {
      // invoke callback directly if no ref needed
      thisMoveCallback({
         _ref: null      // clear _ref
      })
    }
  }

  const onRightClick = info => {
    // console.log(info)
    // set selected key
    setSelectedKey(info.node.key)
    // setSelectedTool(null) // handled by effect
    // find draggable target, open context menu
    let target = info.event.target
    while (target.parentNode && !target.draggable) {
      target = target.parentNode
    }
    setContextAnchorEl(target)
    info.event.stopPropagation()
    info.event.preventDefault()
  }

  const handleSyntaxMenu = e => {
    // console.log(e)
    // console.log('Right click')
    if (contextAnchorEl) {
      setContextAnchorEl(null)
    }
    e.stopPropagation()
    e.preventDefault()
  }

  function constructTree() {
    return (
      <Tree
        ref={designTreeRef}
        className={styles.tree}
        expandedKeys={expandedKeys}
        selectedKeys={[selectedKey]}
        draggable
        blockNode
        showIcon
        onSelect={onSelect}
        onExpand={onExpand}
        onDrop={onDrop}
        onRightClick={onRightClick}
        treeData={treeData}
      >
      {
        treeData.map(treeNode => {
          // get result
          function ConvertTreeNode(data) {
            // console.log(data.key)
            return <TreeNode
              id={data.key}
              key={data.key}
              parentKey={data.parentKey}
              title={data.title}
              icon={data.icon}
              isLeaf={data.isLeaf}
              data={data.data}
              className={`appx-tree-node ${lookup_classname_by_type(data.data.type)}`}
              children={data.children?.map(child => {
                  return ConvertTreeNode(child)
              })}
            >
            </TreeNode>
          }
          return ConvertTreeNode(treeNode)
        })
      }
      </Tree>
    )
  }

  const Toolbar = (props) => {
    return (
      <Box
        key="toolbar"
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        alignItems="center"
        maxWidth={120}
        >
        {
          [
            'pointer',
            'js/string',
            'js/number',
            'js/boolean',
            'js/null',
            'js/object',
            'js/array',
            'react/element',
            'react/html',
            'react/state',
            'react/context',
            'react/effect',
            'react/form',
            'input/text',
            'js/import',
            'js/expression',
            'js/function',
            'js/block',
            'js/switch',
            'js/map',
            'js/reduce',
            'js/filter',
            'mui/style',
            'appx/api',
            'appx/route',
          ].map(type => {
            return (
              <Tooltip
                key={type}
                title={type.replace('/', ' / ')}
                placement="left"
                >
                <AntButton
                  size="small"
                  color="secondary"
                  type={
                    selectedTool === type
                    ? 'primary'
                    :
                    (
                      !selectedTool && type === 'pointer'
                      ? 'primary'
                      : 'default'
                    )
                  }
                  className={styles.fab}
                  key={type}
                  value={type}
                  icon={lookup_icon_for_type(type)}
                  shape="circle"
                  // draggable={true}
                  onClick={e => {
                    setSelectedKey(null)
                    if (!type || type === 'pointer') {
                      setSelectedTool(null)
                    } else {
                      setSelectedTool(type)
                    }
                  }}
                  >
                </AntButton>
              </Tooltip>
            )
          })
        }
      </Box>
    )
  }

  return (
    <Box className={styles.root}>
    {
      !(
        !!navDeployment.namespace
        && !!navDeployment.ui_name
        && !!navDeployment.ui_ver
        && !!navDeployment.ui_deployment
        && !!navSelected.type
        &&
        (
          (
            navSelected.type === 'ui_component'
            && !!navComponent.ui_component_name
            &&
            (
              navComponent.ui_component_type === 'react/component'
              || navComponent.ui_component_type === 'react/provider'
            )
          )
          ||
          (
            navSelected.type === 'ui_route'
            && !!navRoute.ui_route_name
          )
        )
      )
      &&
      (
        <Box
          className={styles.root}
          display="flex"
          justifyContent="center"
          alignItems="center"
          >
          <Typography variant="body2">
            Select a UI component or route
          </Typography>
        </Box>
      )
    }
    {
      (
        !!navDeployment.namespace
        && !!navDeployment.ui_name
        && !!navDeployment.ui_ver
        && !!navDeployment.ui_deployment
        && !!navSelected.type
        &&
        (
          (
            navSelected.type === 'ui_component'
            && !!navComponent.ui_component_name
            &&
            (
              navComponent.ui_component_type === 'react/component'
              || navComponent.ui_component_type === 'react/provider'
            )
          )
          ||
          (
            navSelected.type === 'ui_route'
            && !!navRoute.ui_route_name
          )
        )
      )
      &&
      (
        <Tabs
          defaultActiveKey="design"
          className={styles.root}
          tabPosition="top"
          size="small"
          // tabBarStyle={{marginLeft: 16}}
          tabBarExtraContent={{
            left:
              <Box key="toolTop" display="inline" className={styles.toolTop}>
                <Tooltip
                  key="save"
                  title="Save"
                  placement="bottom"
                  >
                  <AntButton
                    size="small"
                    color="secondary"
                    type="default"
                    className={styles.fab}
                    key="save"
                    icon={<Save />}
                    shape="circle"
                    onClick={e => { setSaveTrigger(new Date()) }}
                    danger={syntaxDirty}
                    loading={!!saveTrigger}
                    >
                  </AntButton>
                </Tooltip>
                <Tooltip
                  key="reset"
                  title="Reset"
                  placement="bottom"
                  >
                  <AntButton
                    size="small"
                    color="secondary"
                    type="default"
                    className={styles.fab}
                    key="reset"
                    icon={<Reset />}
                    shape="circle"
                    onClick={e => { setLoadTrigger(new Date()) }}
                    loading={!!loadTrigger}
                    >
                  </AntButton>
                </Tooltip>
                <Tooltip
                  key="undo"
                  title="Undo"
                  placement="bottom"
                  >
                  <span>
                  <AntButton
                    size="small"
                    color="secondary"
                    type="default"
                    className={styles.fab}
                    key="undo"
                    icon={<Undo />}
                    shape="circle"
                    onClick={e => { undo() }}
                    disabled={!history.undo?.length}
                    >
                  </AntButton>
                  </span>
                </Tooltip>
                <Tooltip
                  key="redo"
                  title="Redo"
                  placement="bottom"
                  >
                  <span>
                  <AntButton
                    size="small"
                    color="secondary"
                    type="default"
                    className={styles.fab}
                    key="redo"
                    icon={<Redo />}
                    shape="circle"
                    onClick={e => { redo() }}
                    disabled={!history.redo?.length}
                    >
                  </AntButton>
                  </span>
                </Tooltip>
              </Box>
          }}
          >
          <TabPane
            tab={
              <span>
                Design
              </span>
            }
            key="design"
            className={styles.pane}
            onContextMenu={handleSyntaxMenu}
            >
            <Layout className={styles.pane}>
              <Content key="content">
                <Box className={styles.treeBox}>
                  {
                    constructTree()
                  }
                </Box>
              </Content>
              <Sider key="sider" width={122} className={styles.sider}>
                <Toolbar />
              </Sider>
            </Layout>
          </TabPane>
          {
            (
              (
                navSelected.type === 'ui_component'
                && !!navComponent.ui_component_name
                && navComponent.ui_component_type === 'react/component'
              )
              ||
              (
                navSelected.type === 'ui_route'
                && !!navRoute.ui_route_name
              )
            )
            &&
            (
              <TabPane
                tab={
                  <span>
                    Test
                    {
                      !!testDirty
                      &&
                      (
                        <Asterisk className={styles.asterisk}>
                        </Asterisk>
                      )
                    }
                  </span>
                }
                key="test"
                className={styles.pane}
                onContextMenu={handleSyntaxMenu}
                >
                <TestEditor>
                </TestEditor>
              </TabPane>
            )
          }
          <SyntaxAddDialog
            key="addDialog"
            open={addDialogOpen}
            setOpen={setAddDialogOpen}
            callback={addCallback}
            nodeParent={nodeParent}
            addNodeRef={addNodeRef}
            addNodeRefRequired={addNodeRefRequired}
            addNodeType={addNodeType}
            isSwitchDefault={isSwitchDefault}
            />
          <SyntaxDeleteDialog
            key="deleteDialog"
            open={deleteDialogOpen}
            setOpen={setDeleteDialogOpen}
            callback={deleteCallback}
            node={deleteNode}
            />
          <SyntaxMoveDialog
            key="moveDialog"
            open={moveDialogOpen}
            setOpen={setMoveDialogOpen}
            moveDragNode={moveDragNode}
            moveDropParent={moveDropParent}
            moveCallback={moveCallback}
            node={deleteNode}
            />
          <SyntaxMenu
            key="syntaxMenu"
            selectedNode={selectedNode}
            contextAnchorEl={contextAnchorEl}
            setContextAnchorEl={setContextAnchorEl}
            addMenuClicked={addMenuClicked}
            deleteMenuClicked={deleteMenuClicked}
            >
          </SyntaxMenu>
        </Tabs>
      )
    }
    </Box>
  )
}

SyntaxTree.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_component_name: PropTypes.string.isRequired,
}

export default SyntaxTree
