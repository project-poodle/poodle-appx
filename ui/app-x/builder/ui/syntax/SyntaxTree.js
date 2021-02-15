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
  CircularProgress,
  LinearProgress,
  makeStyles,
  useTheme,
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

// import spec from 'app-x/spec'
// console.log(spec)
import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import Asterisk from 'app-x/icon/Asterisk'
import Save from 'app-x/icon/Save'
import Reset from 'app-x/icon/Reset'
import Undo from 'app-x/icon/Undo'
import Redo from 'app-x/icon/Redo'
import {
  generate_tree_node,
  lookup_icon_for_type,
  lookup_title_for_input,
  reorder_children,
} from 'app-x/builder/ui/syntax/util_generate'
import {
  parse_tree_node,
  tree_traverse,
  tree_lookup,
  lookup_child_for_ref
} from 'app-x/builder/ui/syntax/util_parse'
import {
  deepCompareMemorize,
  // lookup_type_for_classname,
  lookup_types,
  lookup_groups,
  lookup_types_for_group,
  lookup_classname_for_type,
  lookup_accepted_types_for_node,
  lookup_accepted_classnames_for_node,
  lookup_first_accepted_childSpec,
} from 'app-x/builder/ui/syntax/util_base'
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
  // theme
  const theme = useTheme()
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
    syntaxTreeInitialized,
    setSyntaxTreeInitialized,
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
  const [ loadInProgress,   setLoadInProgress   ] = useState(false)   // loading in progress
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

    try {
      // remove _test if exist
      const filtered = Object.keys(spec_data)
        .filter(key => key !== '_test')
        .reduce((obj, key) => {
          obj[key] = spec_data[key]
          return obj
        }, {})
      // console.log(`filtered`, filtered)

      const js_context = { topLevel: true }
      const loadedTree = generate_tree_node(
        js_context,
        {
          ref: null,
          parentKey: null,
        },
        filtered
      )
      console.log(`INFO: Loaded Syntax Tree`, loadedTree, new Date())

      const parsedTest = !!spec_data._test
        ? spec_data._test
        : null

      // console.log(`parsed`, loadedTree, parsedTest)
      // fresh action
      makeFreshAction(`init`, loadedTree, parsedTest, js_context.expandedKeys, null, true)
    } catch (err) {
      console.error(err)
      throw err
    }
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
      // && !!loadTrigger
    )
    {
      if (
        navSelected.type === 'ui_component'
        && !!navComponent
        && !!navComponent.ui_component_name
      ) {
        setLoadInProgress(true)
        // load url
        const loadUrl = `/namespace/${navDeployment.namespace}/ui_deployment/ui/${navDeployment.ui_name}/deployment/${navDeployment.ui_deployment}/ui_component/base64:${btoa(navComponent.ui_component_name)}`
        // console.log(url)
        api.get(
          'sys',
          'appx',
          loadUrl,
          data => {
            // console.log(data)
            ReactDOM.unstable_batchedUpdates(() => {
              process_api_data(data)
              // setLoadTrigger(0)
              setLoadInProgress(false)
              setLoadTimer(new Date())
              if (navComponent.ui_component_type === 'react/component') {
                setPreviewInitialized(false)
              }
            })
          },
          error => {
            console.error(error)
            notification['error']({
              message: `Failed to load UI component [${navComponent.ui_component_name}]`,
              description: error.toString(),
              placement: 'bottomLeft',
            })
            // setLoadTrigger(0)
            setLoadInProgress(false)
            setLoadTimer(new Date())
            if (navComponent.ui_component_type === 'react/component') {
              setPreviewInitialized(false)
            }
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
      const { ref, data: genData } = parse_tree_node(tree_context, treeData)
      const spec = !!testData
        ? { ...genData, _test: testData }
        : genData
      // console.log(spec)
      if (
        navSelected.type === 'ui_component'
        && !!navComponent
        && !!navComponent.ui_component_name
      ) {
        // save url
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
                ReactDOM.unstable_batchedUpdates(() => {
                  process_api_data(data)
                  setSaveTrigger(0)
                  setLoadTimer(new Date())
                  if (navComponent.ui_component_type === 'react/component') {
                    setPreviewInitialized(false)
                  }
                })
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
    }
  }, [saveTrigger])


  // selectedTool
  useEffect(() => {
    if (!selectedTool || selectedTool === 'pointer') {
      setSyntaxTreeCursor(`pointer`)
    } else {
      const iconString = ReactDOMServer.renderToStaticMarkup(lookup_icon_for_type(selectedTool))
      // console.log(`iconString`, iconString)
      const iconElement = new DOMParser().parseFromString(iconString, 'text/html')
      // console.log(`iconElement`, iconElement)
      const svgElement = iconElement.getElementsByTagName('svg')
      // console.log(`svgElement`, svgElement)
      if (svgElement.length) {
        svgElement[0].setAttribute("xmlns", "http://www.w3.org/2000/svg")
        svgElement[0].setAttribute("fill", theme.palette.text.primary)
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
    // console.log('updateCursor', syntaxTreeCursor, designTreeRef)
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
      // lookup classname by type
      const tool_classname = lookup_classname_for_type(selectedTool)
      const draggableList = treeNode.querySelectorAll('[draggable]')
      if (!selectedTool) {
        draggableList.forEach(draggable => {
          // console.log('canDrop', draggable)
          draggable.style.cursor = 'pointer'
        })
      } else if (treeNode.className.includes(tool_classname)) {
        // if selected tool is one of the valid accepted _types
        draggableList.forEach(draggable => {
          // console.log('canDrop', draggable)
          draggable.style.cursor = syntaxTreeCursor
        })
      } else {
        // if selected tool is not one of the valid accepted _types
        draggableList.forEach(draggable => {
          // console.log('noDrop', draggable)
          draggable.style.cursor = 'not-allowed'
        })
      }
    })
  }, [syntaxTreeCursor, expandTimer])

  // selected node
  const selectedNode = tree_lookup(treeData, selectedKey)

  // context menu
  const [ contextAnchorEl, setContextAnchorEl ] = useState(null)

  // add dialog state
  const [ addNodeParent,      setAddNodeParent      ] = useState(null)
  const [ addNodeRef,         setAddNodeRef         ] = useState(null)
  const [ addNodeType,        setAddNodeType        ] = useState('')
  const [ addDialogOpen,      setAddDialogOpen      ] = useState(false)

  // add menu clicked
  const addMenuClicked = (info => {
    // console.log('add', info)
    setContextAnchorEl(null)
    // find node
    const parentNode = tree_lookup(treeData, info.nodeKey)
    if (!!parentNode) {
      // add dialog
      // console.log(info)
      setAddNodeParent(parentNode)
      setAddNodeRef(info.nodeRef)
      setAddNodeType(info.nodeType)
      setAddDialogOpen(true)
    }
  })

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
          // console.log(`onSelect`, parentNode)
          if (parentNode.key === '/') {
            // open add dialog
            setAddNodeParent(parentNode)
            setAddNodeRef('')
            setAddNodeType(selectedTool)
            setAddDialogOpen(true)
          } else {
            // console.log('here2', selectedTool, parentNode)
            const childSpec = lookup_first_accepted_childSpec(parentNode, selectedTool)
            if (!!childSpec) {
              // open add dialog
              setAddNodeParent(parentNode)
              setAddNodeRef(childSpec.name)
              setAddNodeType(selectedTool)
              setAddDialogOpen(true)
            }
          }
          // if not found, just ignore
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
    // const dropKey = info.node.props.eventKey
    const dropKey = info.node.key
    // const dragKey = info.dragNode.props.eventKey
    const dragKey = info.dragNode.key
    // const dropPosition = info.dropPosition
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    // console.log(`onDrop`, info.dragNode.key, info.dragNode.parentKey, dropKey, info.dropPosition, dropPosition, info.node.pos)

    // check for root
    if (dragKey === '/') {
      notification.info({
        message: `Move not Allowed`,
        description: `Cannot move root node [ / ]`,
        placement: 'bottomLeft',
      })
      return
    }

    // drop before root node is not allowed
    if (dropKey === '/' && dropPosition === -1) {
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
    // return if drag object not found
    if (!dragObj) {
      return
    }

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
          if (!expandedKeys.includes(item.key)) {
            // console.log([...expandedKeys, item.key])
            setExpandedKeys(
              [...expandedKeys, item.key]
            )
          }
        }
      })
      /*
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
      */
    } else {
      // set dropParentKey variable
      tree_traverse(resultData, dropKey, (item, index, arr) => {
        dropParentKey = item.parentKey
      })
      // dropFunc
      dropFunc = () => {
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
          dragObj.parentKey = t.parentKey
          ar.splice(i, 0, dragObj)
        } else {
          dropParentKey = t.parentKey
          dragObj.parentKey = t.parentKey
          ar.splice(i + 1, 0, dragObj)
          // ar.splice(i, 0, dragObj)
        }
      }
    }

    // compute dropParent
    let dropParent
    tree_traverse(resultData, dropParentKey, (item, index, arr) => {
      dropParent = item
    })

    // return if drop parent node not found
    if (!dropParent) {
      // use root if dropParent not found
      dropParent = resultData[0]
    } else if (!!dropParent.isLeaf) {
      notification.info({
        message: `Move not Allowed`,
        description: `Child not allowed for [ ${dropParent?.data._type.replaceAll('/', ' / ')} ]`,
        placement: 'bottomLeft',
      })
      return
    }

    // check accepted types
    const accepted_types = lookup_accepted_types_for_node(dropParent)
    if (!accepted_types.includes(dragObj.data._type)) {
      notification.info({
        message: `Move not Allowed`,
        description: `Move [ ${dragObj?.data._type.replaceAll('/', ' / ')} ] to [ ${dropParent?.data._type.replaceAll('/', ' / ')} ] is not allowed`,
        placement: 'bottomLeft',
      })
      return
    }

    // callback with move confirmation
    const thisMoveCallback = (data) => {

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
    if (
      dropParent.key === dragObj.parentKey
      || (dropParent.key === '/' && dragObj.parentKey === null)
    ) {
      thisMoveCallback({
         _ref: dragObj.data._ref     // keep _ref
      })

    } else {

      setMoveDragNode(dragObj)
      setMoveDropParent(dropParent)
      setMoveCallback(() => { return thisMoveCallback})
      setMoveDialogOpen(true)

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
        // treeData={treeData}
      >
      {
        treeData.map(treeNodeData => {
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
              className={`appx-tree-node ${lookup_accepted_classnames_for_node(data).join(' ')}`}
              children={data.children?.map(child => {
                 return ConvertTreeNode(child)
              })}
            >
            </TreeNode>
          }
          return ConvertTreeNode(treeNodeData)
        })
      }
      </Tree>
    )
  }

  const MemorizedToolbar = React.useMemo(() => (props) => {
    // console.log(`render MemorizedToolbar`)
    // styles
    const styles = makeStyles((theme) => ({
      fab: {
        margin: theme.spacing(1),
        // cursor: 'move',
      },
    }))()

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
          ]
          .concat(lookup_groups().map(group => lookup_types_for_group(group)))
          .flat()
          .map(type => {
            // console.log(`type`, type)
            return (
              <Tooltip
                key={type}
                title={type.replaceAll('/', ' / ')}
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
  // }
  }, [selectedTool])

  // memorized test editor
  const MemorizedTestEditor = React.useMemo(() => (props) => {
    // console.log(`render MemorizedTestEditor`)
    return (
      <TestEditor />
    )
  }, [navDeployment, navComponent, navSelected, testData].map(deepCompareMemorize))

  // add dialog
  const MemorizedAddDialog = React.useMemo(() => (props) => {
    // console.log(`render MemorizedAddDialog`)
    return (
      <SyntaxAddDialog
        key="addDialog"
        open={addDialogOpen}
        setOpen={setAddDialogOpen}
        addNodeParent={addNodeParent}
        addNodeRef={addNodeRef}
        addNodeType={addNodeType}
      />
    )
  }, [addDialogOpen, setAddDialogOpen, addNodeParent, addNodeRef, addNodeType].map(deepCompareMemorize))

  // delete dialog
  const MemorizedDeleteDialog = React.useMemo(() => (props) => {
    // console.log(`render MemorizedDeleteDialog`)
    return (
      <SyntaxDeleteDialog
        key="deleteDialog"
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        node={deleteNode}
      />
    )
  }, [deleteDialogOpen, setDeleteDialogOpen, deleteNode].map(deepCompareMemorize))

  // move dialog
  const MemorizedMoveDialog = React.useMemo(() => (props) => {
    // console.log(`render MemorizedMoveDialog`)
    return (
      <SyntaxMoveDialog
        key="moveDialog"
        open={moveDialogOpen}
        setOpen={setMoveDialogOpen}
        moveDragNode={moveDragNode}
        moveDropParent={moveDropParent}
        moveCallback={moveCallback}
      />
    )
  }, [moveDialogOpen, setMoveDialogOpen, moveDragNode, moveDropParent, moveCallback].map(deepCompareMemorize))

  // syntax menu
  const MemorizedSyntaxMenu = React.useMemo(() => (props) => {
    // console.log(`render MemorizedSyntaxMenu`)
    return (
      <SyntaxMenu
        key="syntaxMenu"
        contextAnchorEl={contextAnchorEl}
        setContextAnchorEl={setContextAnchorEl}
        addMenuClicked={addMenuClicked}
        deleteMenuClicked={deleteMenuClicked}
        >
      </SyntaxMenu>
    )
  }, [contextAnchorEl, setContextAnchorEl, addMenuClicked, deleteMenuClicked].map(deepCompareMemorize))

  // save button
  const MemorizedTools = React.useMemo(() => (props) => {
    // console.log(`render MemorizedTools`)
    // styles
    const styles = makeStyles((theme) => ({
      toolTop: {
        margin: theme.spacing(1, 2),
        // cursor: 'move',
      },
      fab: {
        margin: theme.spacing(1),
        // cursor: 'move',
      },
    }))()

    return (
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
            loading={!!loadInProgress}
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
    )
  },
  [
    syntaxDirty,
    saveTrigger,
    loadInProgress,
    history.undo?.length,
    history.redo?.length,
  ].map(deepCompareMemorize))

  // test tab
  const MemorizedTestTab = React.useMemo(() => (props) => {
    // styles
    const styles = makeStyles((theme) => ({
      asterisk: {
        // paddingLeft: theme.spacing(1),
        color: theme.palette.error.light,
      },
    }))()

    return (
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
    )
  }, [testDirty].map(deepCompareMemorize))

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
      !syntaxTreeInitialized
      && !!navDeployment.namespace
      && !!navDeployment.ui_name
      && !!navDeployment.ui_ver
      && !!navDeployment.ui_deployment
      && !!navSelected.type
      &&
      (
        <Box
          className={styles.root}
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
          >
          <Box>
            <LinearProgress
              color='secondary'
            />
            <Typography variant="body2">
              Loading...
            </Typography>
          </Box>
        </Box>
      )
    }
    {
      (
        !!syntaxTreeInitialized
        && !!navDeployment.namespace
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
              <MemorizedTools />
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
                <MemorizedToolbar />
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
                  <MemorizedTestTab />
                }
                key="test"
                className={styles.pane}
                onContextMenu={handleSyntaxMenu}
                >
                <MemorizedTestEditor />
              </TabPane>
            )
          }
        </Tabs>
      )
    }
      <MemorizedAddDialog />
      <MemorizedDeleteDialog />
      <MemorizedMoveDialog />
      <MemorizedSyntaxMenu />
    </Box>
  )
}

export default SyntaxTree
