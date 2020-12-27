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
  Tooltip,
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

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import Save from 'app-x/icon/Save'
import Reset from 'app-x/icon/Reset'
import Undo from 'app-x/icon/Undo'
import Redo from 'app-x/icon/Redo'
import {
  parse_js,
  lookup_icon_for_type,
  lookup_valid_child_types,
  lookup_classname_by_type,
  lookup_type_by_classname,
} from 'app-x/builder/ui/util_parse'
import {
  gen_js,
  tree_traverse,
  tree_lookup,
  lookup_child_by_ref
} from 'app-x/builder/ui/util_tree'
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import SyntaxAddDialog from 'app-x/builder/ui/SyntaxAddDialog'
import SyntaxDeleteDialog from 'app-x/builder/ui/SyntaxDeleteDialog'
import SyntaxMenu from 'app-x/builder/ui/SyntaxMenu'

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

  // context
  const {
    apiData,
    setApiData,
    treeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
    treeDirty,
    setTreeDirty,
    previewInitialized,
    setPreviewInitialized,
    history,
    makeAction,
    updateAction,
    undo,
    redo,
  } = useContext(EditorProvider.Context)

  const designTreeRef = React.createRef()

  // selectedKey will reset selectedTool
  useEffect(() => {
    if (!!selectedKey) {
      setSelectedTool(null)
    }
  }, [selectedKey])

  // selected pallette tool
  const [ selectedTool, setSelectedTool ] = useState(null)
  // syntax tree cursor
  const [ syntaxTreeCursor, setSyntaxTreeCursor ] = useState('progress')
  // loading and saving
  const [ loading,          setLoading          ] = useState(false)
  const [ loadTimer,        setLoadTimer        ] = useState(null)
  const [ saving,           setSaving           ] = useState(false)
  const [ saveTimer,        setSaveTimer        ] = useState(null)

  // process api data
  function process_api_data(data) {
    // check array
    if (Array.isArray(data)) {
      data = data[0]
    }

    // set api data
    setApiData(data)

    // data check
    if (!('ui_element_spec' in data) || !('element' in data.ui_element_spec)) {
      // fresh action
      makeAction(`init`, [], [], null, true)
      return
    }

    const js_context = { topLevel: true }
    const parsedTree = parse_js(js_context, null, null, data.ui_element_spec)

    // console.log(parsedTree)

    // fresh action
    makeAction(`init`, parsedTree, js_context.expandedKeys, null, true)
  }

  // load data via api
  useEffect(() => {
    setLoading(true)
    const loadUrl = `/namespace/${props.namespace}/ui_deployment/ui/${props.ui_name}/deployment/${props.ui_deployment}/ui_element/base64:${btoa(props.ui_element_name)}`
    // console.log(url)
    api.get(
      'sys',
      'appx',
      loadUrl,
      data => {
        // console.log(data)
        setLoading(false)
        setPreviewInitialized(false)
        process_api_data(data)
      },
      error => {
        setLoading(false)
        setPreviewInitialized(false)
        console.error(error)
      }
    )
  }, [loadTimer])

  // save data via api
  useEffect(() => {
    // do not save initially
    if (!saveTimer) {
      return
    }
    setSaving(true)
    const tree_context = { topLevel: true }
    const { ref, data: genData } = gen_js(tree_context, treeData)
    const saveUrl = `/namespace/${apiData.namespace}/ui/${apiData.ui_name}/${apiData.ui_ver}/ui_element/base64:${btoa(apiData.ui_element_name)}`
    // console.log(url)
    api.put(
      'sys',
      'appx',
      saveUrl,
      {
        ui_element_spec: genData,
      },
      data => {
        // console.log(data)
        const loadUrl = `/namespace/${apiData.namespace}/ui_deployment/ui/${apiData.ui_name}/deployment/${apiData.ui_deployment}/ui_element/base64:${btoa(apiData.ui_element_name)}`
        api.get(
          'sys',
          'appx',
          loadUrl,
          data => {
            // console.log(data)
            setSaving(false)
            setPreviewInitialized(false)
            process_api_data(data)
          },
          error => {
            setSaving(false)
            setPreviewInitialized(false)
            console.error(error)
          }
        )
      },
      error => {
        console.error(error)
        setSaving(false)
      }
    )
  }, [saveTimer])


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
    const treeNodeList = node.querySelectorAll('.appx-tree-node')
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
        } else if (valid_child_types?.ref?.types.includes(selectedTool)
            || valid_child_types?._?.types.includes(selectedTool)) {
          // if selected tool is one of the valid child types
          draggableList.forEach(draggable => {
            // console.log('canDrop', draggable)
            draggable.style.cursor = syntaxTreeCursor
          })
        } else {
          // if selected tool is not one of the valid child types
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
        ? nodeData.__ref
        : `...${nodeData.name}`
      : !!nodeRef ? nodeRef : (nodeData.__ref ? nodeData.__ref : null)
    // console.log(parentKey, ref, nodeData)
    const parse_context = {}
    var parsed = null
    // handle js/switch specially
    if (lookupParent?.data?.type === 'js/switch') {
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
            if (!child.data.__ref) {
              count = count+1
            }
            // check if we'd insert before first element with no __ref
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
    } else {
      // add to the root as first element
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
    makeAction(
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
    makeAction(
      `Delete [${lookupNode?.title}]`,
      resultTree,
      expandedKeys,
      null,
    )
  }

  // expand/collapse
  const onExpand = keys => {
    setExpandedKeys(keys)
    //updateCursor()
    // setNewExpandedKeys(keys)
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
          if (valid_child_types?._?.types.includes(selectedTool)) {
            setAddNodeRef(null)
            setAddNodeRefRequired(false)
            setAddNodeType(selectedTool)
            setSwitchDefault(false)
            setAddDialogOpen(true)
          } else if (valid_child_types?.ref?.types.includes(selectedTool)) {
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

  const onDragEnd = info => {
    // console.log('changeBack')
    setSyntaxTreeCursor('default')
  }

  // drag enter
  const onDragEnter = info => {
    // expandedKeys
    // info.event.dataTransfer.dropEffect = 'move'
    // console.log(info.event.dataTransfer.getData("application"))
    info.event.preventDefault()
    // DO NOT EXPAND NODE ON ENTER
    // user must stay on the element for a while before expand node
    //if (!info.node.isLeaf && !info.expandedKeys.includes(info.node.key)) {
    //  // console.log([...info.expandedKeys, info.node.key])
    //  setExpandedKeys(
    //    [...info.expandedKeys, info.node.key]
    //  )
    //}
  }

  // drag enter
  const onDragOver = info => {
    // console.log(info)
    info.event.preventDefault()
    // console.log(info.event.dataTransfer.getData("application"))
    // info.event.dataTransfer.dropEffect = 'move'
    // console.log(info.event.dataTransfer.dropEffect)
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

    // Find dragObject
    let dragObj
    tree_traverse(resultData, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!info.dropToGap) {
      // Drop on the content
      tree_traverse(resultData, dropKey, item => {
        // console.log(item)
        item.children = item.children || []
        // where to insert
        // console.log(expandedKeys)
        dragObj.parentKey = item.key
        item.children.unshift(dragObj)
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
        dragObj.parentKey = item.key
        item.children.unshift(dragObj)
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
        dragObj.parentKey = t.parentKey
        ar.splice(i, 0, dragObj)
      } else {
        dragObj.parentKey = t.parentKey
        ar.splice(i + 1, 0, dragObj)
      }
    }

    // take action
    makeAction(
      `Drag & Drop [${dragObj.title}]`,
      resultData,
      expandedKeys,
      dragObj.key
    )
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
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
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
            'react/effect',
            'js/import',
            'js/expression',
            'js/function',
            'js/block',
            'js/switch',
            'js/map',
            'js/reduce',
            'js/filter',
            'mui/style',
            'appx/route',
          ].map(type => {
            return (
              <Tooltip
                key={type}
                title={type}
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
                    onClick={e => { setSaveTimer(new Date()) }}
                    danger={treeDirty}
                    loading={saving}
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
                    onClick={e => { setLoadTimer(new Date()) }}
                    loading={loading}
                    >
                  </AntButton>
                </Tooltip>
                <Tooltip
                  key="undo"
                  title="Undo"
                  placement="bottom"
                  >
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
                </Tooltip>
                <Tooltip
                  key="redo"
                  title="Redo"
                  placement="bottom"
                  >
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
                </Tooltip>
              </Box>
          }}
          >
          <TabPane
            tab="Design"
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
          <TabPane
            tab="Test"
            key="test"
            className={styles.pane}
            onContextMenu={handleSyntaxMenu}
            >
            <Layout className={styles.pane}>
              <Content key="content">
                <Box display="flex" justifyContent="center" alignItems="center" className={styles.root}>
                  <Typography variant="body2">
                    TODO: test data goes here
                  </Typography>
                </Box>
              </Content>
              <Sider key="sider" width={122} className={styles.sider}>
                <Toolbar />
              </Sider>
            </Layout>
          </TabPane>
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

SyntaxTree.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default SyntaxTree
