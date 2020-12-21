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
  Menu,
  MenuItem,
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
import { default as NestedMenuItem } from 'material-ui-nested-menu-item'
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
  Icon,
} from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useForm, Controller } from "react-hook-form";
import { parse, parseExpression } from "@babel/parser"

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
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


const SyntaxTree = (props) => {

  // context
  const {
    treeData,
    setTreeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
    selectedTool,
    setSelectedTool,
    syntaxTreeCursor,
    setSyntaxTreeCursor,
  } = useContext(EditorProvider.Context)

  // styles
  const styles = makeStyles((theme) => ({
    root: {
      height: '100%',
      width: '100%',
    },
    pane: {
      height: '100%',
      width: '100%',
      overflow: 'scroll',
    },
    fab: {
      margin: theme.spacing(1),
      // cursor: 'move',
    },
    tree: {
      width: '100%',
    },
    menuItem: {
      minWidth: 200,
    },
    nestedMenuItem: {
      padding: 0,
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
    formControl: {
      width: '100%',
      // margin: theme.spacing(1),
      padding: theme.spacing(2, 0),
    },
  }))()

  const designTreeRef = React.createRef()

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
  const [ expansionTimer, setExpansionTimer ] = useState(new Date())
  useEffect(() => {
    setTimeout(() => {
      setExpansionTimer(new Date())
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
        if (valid_child_types?.ref?.types.includes(selectedTool)
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
  }, [syntaxTreeCursor, expansionTimer])

  // load data via api
  useEffect(() => {
    const url = `/namespace/${props.namespace}/ui_deployment/ui/${props.ui_name}/deployment/${props.ui_deployment}/ui_element/base64:${btoa(props.ui_element_name)}`
    // console.log(url)
    api.get(
      'sys',
      'appx',
      url,
      data => {
        // console.log(data)
        if (Array.isArray(data)) {
          data = data[0]
        }

        if (!('ui_element_spec' in data) || !('element' in data.ui_element_spec)) {
          setTreeData([])
          setExpandedKeys([])
        }

        const js_context = { topLevel: true }
        const parsedTree = parse_js(js_context, null, null, data.ui_element_spec)

        console.log(parsedTree)

        setTreeData(parsedTree)
        setExpandedKeys(js_context.expandedKeys)
      },
      error => {
        console.error(error)
      }
    )
  }, [])

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
      setAddDialogOpen(true)
    }
  })

  // add callback
  const addCallback = (nodeRef, nodeParent, nodeData) => {
    // console.log(nodeRef, nodeParent, nodeData)
    // ready to add node
    const resultTree = _.cloneDeep(treeData)
    const lookupParent = tree_lookup(resultTree, nodeParent.key)
    // parent key
    let parentKey = null
    if (!!lookupParent) {
      parentKey = lookupParent.key
    }
    // ref
    const ref = !!nodeRef ? nodeRef : (nodeData.__ref ? nodeData.__ref : null)
    // console.log(parentKey, ref, nodeData)
    // parse nodeData
    const parse_context = {}
    const parsed = parse_js(parse_context, parentKey, ref, nodeData)
    // console.log(nodeRef, nodeParent, parsed)
    // insert to proper location
    if (lookupParent) {
      if (!!ref) {
        lookupParent.children.unshift(parsed)
      } else {
        lookupParent.children.push(parsed)
      }
      setTreeData(resultTree)
      console.log(gen_js({topLevel: true}, resultTree))
    } else {
      // add to the root
      resultTree.push(parsed)
      setTreeData(resultTree)
    }
    // process expanded keys
    parse_context.expandedKeys.map(key => {
      if (!expandedKeys.includes(key)) {
        expandedKeys.push(key)
      }
    })
    setExpandedKeys(expandedKeys)
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
    const resultTree = _.cloneDeep(treeData)
    const lookupParent = tree_lookup(resultTree, lookupNode.parentKey)
    if (!!lookupParent) {
      lookupParent.children = lookupParent.children.filter(child => {
        return child.key !== lookupNode.key
      })
      setTreeData(resultTree)
    } else {
      // this is one of the root node
      setTreeData(
        resultTree.filter(child => {
          return child.key !== lookupNode.key
        })
      )
    }
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
      setSelectedTool(null)
    } else {
      setSelectedKey(null)
    }
  }

  // drag start
  const onDragStart = info => {
    //console.trace()
    //console.log(info.node.key)
    info.event.dataTransfer.setData("application", info.node.key)
    info.event.dataTransfer.effectAllowed = 'move'
    info.event.dataTransfer.dropEffect = 'move'
    console.log(info.event.dataTransfer.effectAllowed)
    console.log(info.event.dataTransfer.dropEffect)
    // console.log(info.event)
    if (info.node.key === '/') {
      let target = info.event.target
      while (target.parentNode && !target.draggable) {
        target = target.parentNode
      }
      console.log('changeCursor')
      //console.log(target)
      target.style.cursor = '-webkit-grab -moz-grab grab move'
      //console.log(target)
      setSyntaxTreeCursor('not-allowed')
    }
  }

  const onDragEnd = info => {
    console.log('changeBack')
    setSyntaxTreeCursor('default')
  }

  // drag enter
  const onDragEnter = info => {
    // expandedKeys
    info.event.dataTransfer.dropEffect = 'move'
    console.log(info.event.dataTransfer.getData("application"))
    if (!info.node.isLeaf && !info.expandedKeys.includes(info.node.key)) {
      // console.log([...info.expandedKeys, info.node.key])
      setExpandedKeys(
        [...info.expandedKeys, info.node.key]
      )
    }
  }

  // drag enter
  const onDragOver = info => {
    // console.log(info)
    info.event.preventDefault()
    // console.log(info.event.dataTransfer.getData("application"))
    info.event.dataTransfer.dropEffect = 'move'
    console.log(info.event.dataTransfer.dropEffect)
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

    // replicate data
    const data = [...treeData]

    // Find dragObject
    let dragObj
    tree_traverse(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!info.dropToGap) {
      // Drop on the content
      tree_traverse(data, dropKey, item => {
        // console.log(item)
        item.children = item.children || []
        // where to insert
        // console.log(expandedKeys)
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
      tree_traverse(data, dropKey, item => {
        item.children = item.children || []
        // where to insert
        item.children.unshift(dragObj)
        // in previous version, we use item.children.push(dragObj) to insert the
        // item to the tail of the children
      })
    } else {
      let ar
      let i
      tree_traverse(data, dropKey, (item, index, arr) => {
        ar = arr
        i = index
      })
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }
    }

    setTreeData(data)
  }

  const onRightClick = info => {
    // console.log(info)
    // set selected key
    setSelectedKey(info.node.key)
    setSelectedTool(null)
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
            /*
            // update syntaxTreeCursor
            useEffect(() => {
              // console.log('updateCursor', syntaxTreeCursor)
              // console.log(designTreeRef)
              // html node
              const valid_child_types = lookup_valid_child_types(data.data.type)
              // const node = ReactDOM.findDOMNode(designTreeRef.current)
              const node = document.getElementById(data.key)
              const draggableList = node.querySelectorAll('[draggable]')
              // console.log(typeof draggableList, Array.isArray(draggableList), draggableList)
              if (selectedTool
                  &&
                  (
                    valid_child_types?.ref?.types.includes(selectedTool)
                    || valid_child_types?._?.types.includes(selectedTool)
                  )
                ) {
                draggableList.forEach(draggable => {
                  // console.log(draggable)
                  draggable.style.cursor = syntaxTreeCursor
                })
              } else {
                draggableList.forEach(draggable => {
                  // console.log(draggable)
                  draggable.style.cursor = 'pointer'
                })
              }
            }, [syntaxTreeCursor])
            */
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

  return (
    <Tabs
      defaultActiveKey="design"
      className={styles.root}
      tabPosition="right"
      size="small"
      tabBarExtraContent={
        <Box
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
                      setSelectedTool(type)
                    }}
                    >
                  </AntButton>
                </Tooltip>
              )
            })
          }
        </Box>
      }
      >
      <TabPane
        tab="Design"
        key="design"
        className={styles.pane}
        onContextMenu={handleSyntaxMenu}
        >
        {
          constructTree()
        }
        <SyntaxAddDialog
          open={addDialogOpen}
          setOpen={setAddDialogOpen}
          callback={addCallback}
          nodeParent={nodeParent}
          addNodeRef={addNodeRef}
          addNodeRefRequired={addNodeRefRequired}
          addNodeType={addNodeType}
          />
        <SyntaxDeleteDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          callback={deleteCallback}
          node={deleteNode}
          />
        <SyntaxMenu
          selectedNode={selectedNode}
          contextAnchorEl={contextAnchorEl}
          setContextAnchorEl={setContextAnchorEl}
          addMenuClicked={addMenuClicked}
          deleteMenuClicked={deleteMenuClicked}
          >
        </SyntaxMenu>
      </TabPane>
      <TabPane
        tab="Test"
        key="test"
        className={styles.pane}
        onContextMenu={handleSyntaxMenu}
        >
        <Box display="flex" justifyContent="center" alignItems="center" className={styles.root}>
          <Typography variant="body2">
            TODO: test data goes here
          </Typography>
        </Box>
      </TabPane>
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
