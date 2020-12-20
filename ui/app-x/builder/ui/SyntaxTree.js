import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Box,
  Button,
  IconButton,
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
  Tree,
} from 'antd'
import {
  DeleteOutlined,
} from '@ant-design/icons'
const { DirectoryTree } = Tree
import {
  Icon,
} from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useForm, Controller } from "react-hook-form";
import { parse, parseExpression } from "@babel/parser"

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import { parse_js, lookup_icon_for_type } from 'app-x/builder/ui/util_parse'
import { tree_traverse, tree_lookup, lookup_child_by_ref } from 'app-x/builder/ui/util_tree'
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import SyntaxAddDialog from 'app-x/builder/ui/SyntaxAddDialog'
import SyntaxDeleteDialog from 'app-x/builder/ui/SyntaxDeleteDialog'


const SyntaxTree = (props) => {

  // context
  const {
    treeData,
    setTreeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey
  } = useContext(EditorProvider.Context)

  // styles
  const styles = makeStyles((theme) => ({
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
    console.log('add', info)
    setContextAnchorEl(null)
    // find node
    const parentNode = tree_lookup(treeData, info.nodeKey)
    if (!!parentNode) {
      // add dialog
      setNodeParent(parentNode)
      setAddNodeRefRequired(info.nodeRefRequired)
      setAddNodeRef(info.nodeRef)
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
    // parse nodeData
    const parsed = parse_js({}, parentKey, ref, nodeData)
    // console.log(nodeRef, nodeParent, parsed)
    // insert to proper location
    if (lookupParent) {
      if (!!ref) {
        lookupParent.children.unshift(parsed)
      } else {
        lookupParent.children.push(parsed)
      }
      setTreeData(resultTree)
    } else {
      // add to the root
      resultTree.push(parsed)
      setTreeData(resultTree)
    }
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


  // context menu list
  const ContextMenuItemList = (props) => {
    return (
      <Box>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/string',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/string') }
          </ListItemIcon>
          <ListItemText primary="Add js/string" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/number',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/number') }
          </ListItemIcon>
          <ListItemText primary="Add js/number" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/boolean',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/boolean') }
          </ListItemIcon>
          <ListItemText primary="Add js/boolean" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/null',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/null') }
          </ListItemIcon>
          <ListItemText primary="Add js/null" />
        </MenuItem>
        <Divider />
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/expression',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/expression') }
          </ListItemIcon>
          <ListItemText primary="Add js/expression" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/function',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/function') }
          </ListItemIcon>
          <ListItemText primary="Add js/function" />
        </MenuItem>
        <Divider />
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'react/element',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('react/element') }
          </ListItemIcon>
          <ListItemText primary="Add react/element" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'react/html',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('react/html') }
          </ListItemIcon>
          <ListItemText primary="Add react/html" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'react/state',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('react/state') }
          </ListItemIcon>
          <ListItemText primary="Add react/state" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'react/effect',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('react/effect') }
          </ListItemIcon>
          <ListItemText primary="Add react/effect" />
        </MenuItem>
        <Divider />
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/switch',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/switch') }
          </ListItemIcon>
          <ListItemText primary="Add js/switch" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/map',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/map') }
          </ListItemIcon>
          <ListItemText primary="Add js/map" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/reduce',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/reduce') }
          </ListItemIcon>
          <ListItemText primary="Add js/reduce" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/filter',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/filter') }
          </ListItemIcon>
          <ListItemText primary="Add js/filter" />
        </MenuItem>
        <Divider />
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/object',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/object') }
          </ListItemIcon>
          <ListItemText primary="Add js/object" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/array',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/array') }
          </ListItemIcon>
          <ListItemText primary="Add js/array" />
        </MenuItem>
      </Box>
    )
  }

  // make context menu
  const ContextMenu = (props) => {

    const [ menuPosition, setMenuPosition ] = useState(null)

    // check selectedNode
    if (!selectedNode) {
      return null
    }

    return (
      <Menu
        keepMounted={true}
        getContentAnchorEl={null}
        anchorEl={contextAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(contextAnchorEl)}
        onClose={ e => setContextAnchorEl(null) }
        >
        {
          (
            !!selectedNode
            && !!selectedNode.data
            &&
            (
              selectedNode.data.type === 'js/object'
              || selectedNode.data.type === 'js/array'
            )
          )
          &&
          (
            <Box>
              <ContextMenuItemList
                nodeRef={null}
                nodeRefRequired={selectedNode.data.type === 'js/object'}
                >
              </ContextMenuItemList>
              <Divider />
            </Box>
          )
        }
        {
          (
            !!selectedNode
            && !!selectedNode.data
            &&
            (
              selectedNode.data.type === 'react/element'
              || selectedNode.data.type === 'react/html'
            )
          )
          &&
          (
            <Box>
              {
                !lookup_child_by_ref(selectedNode, 'props')
                &&
                (
                  <Box>
                    <NestedMenuItem
                      className={styles.nestedMenuItem}
                      label={(
                        <List className={styles.nestedMenuItem}>
                          <ListItem
                            dense={true}
                            className={styles.menuItem}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type('js/object') }
                            </ListItemIcon>
                            <ListItemText primary="[ props ]" />
                          </ListItem>
                        </List>
                      )}
                      parentMenuOpen={!!contextAnchorEl}
                      >
                      <MenuItem
                        dense={true}
                        className={styles.menuItem}
                        onClick={
                          () => addMenuClicked({
                            nodeRef: 'props',
                            nodeRefRequired: true,
                            nodeKey: selectedKey,
                            nodeType: 'js/object',
                          })
                        }
                        >
                        <ListItemIcon>
                          { lookup_icon_for_type('js/object') }
                        </ListItemIcon>
                        <ListItemText primary="Add js/object" />
                      </MenuItem>
                    </NestedMenuItem>
                    <Divider />
                  </Box>
                )
              }
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'react/element',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('react/element') }
                </ListItemIcon>
                <ListItemText primary="Add react/element" />
              </MenuItem>
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'react/html',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('react/html') }
                </ListItemIcon>
                <ListItemText primary="Add react/html" />
              </MenuItem>
              <Divider />
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'js/switch',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('js/switch') }
                </ListItemIcon>
                <ListItemText primary="Add js/switch" />
              </MenuItem>
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'js/map',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('js/map') }
                </ListItemIcon>
                <ListItemText primary="Add js/map" />
              </MenuItem>
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'js/reduce',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('js/reduce') }
                </ListItemIcon>
                <ListItemText primary="Add js/reduce" />
              </MenuItem>
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'js/filter',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('js/filter') }
                </ListItemIcon>
                <ListItemText primary="Add js/filter" />
              </MenuItem>
              <Divider />
            </Box>
          )
        }
        {
          (
            !!selectedNode
            && !!selectedNode.data
            && selectedNode.data.type === 'js/switch'
          )
          &&
          (
            <Box>
              {
                !lookup_child_by_ref(selectedNode, 'default')
                &&
                (
                  <Box>
                    <NestedMenuItem
                      className={styles.nestedMenuItem}
                      label={(
                        <List className={styles.nestedMenuItem}>
                          <ListItem
                            dense={true}
                            className={styles.menuItem}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type('js/object') }
                            </ListItemIcon>
                            <ListItemText primary="[ default ]" />
                          </ListItem>
                        </List>
                      )}
                      parentMenuOpen={!!contextAnchorEl}
                      >
                      <ContextMenuItemList
                        nodeRef='default'
                        nodeRefRequired={true}
                        >
                      </ContextMenuItemList>
                    </NestedMenuItem>
                    <Divider />
                  </Box>
                )
              }
              <ContextMenuItemList
                nodeRef={null}
                nodeRefRequired={false}
                >
              </ContextMenuItemList>
              <Divider />
            </Box>
          )
        }
        {
          (
            !!selectedNode
            && !!selectedNode.data
            &&
            (
              selectedNode.data.type === 'js/map'
              || selectedNode.data.type === 'js/reduce'
              || selectedNode.data.type === 'js/filter'
            )
          )
          &&
          (
            <Box>
              {
                !lookup_child_by_ref(selectedNode, 'data')
                &&
                (
                  <Box>
                    <NestedMenuItem
                      className={styles.nestedMenuItem}
                      label={(
                        <List className={styles.nestedMenuItem}>
                          <ListItem
                            dense={true}
                            className={styles.menuItem}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type('js/object') }
                            </ListItemIcon>
                            <ListItemText primary="[ data ]" />
                          </ListItem>
                        </List>
                      )}
                      parentMenuOpen={!!contextAnchorEl}
                      >
                      <ContextMenuItemList
                        nodeRef='data'
                        nodeRefRequired={true}
                        >
                      </ContextMenuItemList>
                    </NestedMenuItem>
                    <Divider />
                  </Box>
                )
              }
              {
                selectedNode.data.type === 'js/map'
                && !lookup_child_by_ref(selectedNode, 'result')
                &&
                (
                  <Box>
                    <NestedMenuItem
                      className={styles.nestedMenuItem}
                      label={(
                        <List className={styles.nestedMenuItem}>
                          <ListItem
                            dense={true}
                            className={styles.menuItem}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type('js/object') }
                            </ListItemIcon>
                            <ListItemText primary="[ result ]" />
                          </ListItem>
                        </List>
                      )}
                      parentMenuOpen={!!contextAnchorEl}
                      >
                      <ContextMenuItemList
                        nodeRef='result'
                        nodeRefRequired={true}
                        >
                      </ContextMenuItemList>
                    </NestedMenuItem>
                    <Divider />
                  </Box>
                )
              }
              {
                selectedNode.data.type === 'js/reduce'
                && !lookup_child_by_ref(selectedNode, 'init')
                &&
                (
                  <Box>
                    <NestedMenuItem
                      className={styles.nestedMenuItem}
                      label={(
                        <List className={styles.nestedMenuItem}>
                          <ListItem
                            dense={true}
                            className={styles.menuItem}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type('js/object') }
                            </ListItemIcon>
                            <ListItemText primary="[ init ]" />
                          </ListItem>
                        </List>
                      )}
                      parentMenuOpen={!!contextAnchorEl}
                      >
                      <ContextMenuItemList
                        nodeRef='init'
                        nodeRefRequired={true}
                        >
                      </ContextMenuItemList>
                    </NestedMenuItem>
                    <Divider />
                  </Box>
                )
              }
            </Box>
          )
        }
        {
          (
            !!selectedNode
            && !!selectedNode.data
            && selectedNode.data.type === 'mui/style'
          )
          &&
          (
            <Box>
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: true,
                    nodeKey: selectedKey,
                    nodeType: 'js/object',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('js/object') }
                </ListItemIcon>
                <ListItemText primary="Add js/object" />
              </MenuItem>
              <Divider />
            </Box>
          )
        }
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => deleteMenuClicked({
              nodeKey: selectedKey,
            })
          }
          >
          <ListItemIcon>
            <DeleteOutlined />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    )
  }

  // expand/collapse
  const onExpand = keys => {
    setExpandedKeys(keys)
  }

  // select
  const onSelect = key => {
    // console.log(`selected ${key}`)
    if (key.length) {
      setSelectedKey(key[0])
    } else {
      setSelectedKey(null)
    }
  }

  // drag start
  const onDragStart = info => {
    //console.trace()
    //console.log(info.node.key)
    info.event.dataTransfer.setData("nodeKey", info.node.key)
    // console.log(info.event)
  }

  // drag enter
  const onDragEnter = info => {
    console.trace()
    console.log(info)
    // expandedKeys
    if (!info.node.isLeaf && !info.expandedKeys.includes(info.node.key)) {
      // console.log([...info.expandedKeys, info.node.key])
      setExpandedKeys(
        [...info.expandedKeys, info.node.key]
      )
    }
  }

  // drag enter
  const onDragOver = info => {
    //console.log(info)
  }

  // drop
  const onDrop = info => {
    console.log(info)
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    const dropPosition = info.dropPosition

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
          console.log([...expandedKeys, item.key])
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
    // find draggable target, open context menu
    let target = info.event.target
    while (target.parentNode && !target.draggable) {
      target = target.parentNode
    }
    setContextAnchorEl(target)
    info.event.stopPropagation()
    info.event.preventDefault()
  }

  const handleContextMenu = e => {
    // console.log(e)
    // console.log('Right click')
    if (contextAnchorEl) {
      setContextAnchorEl(null)
    }
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <Box
      onContextMenu={handleContextMenu}
      >
      <Tree
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
        onDrop={onDrop}
        onRightClick={onRightClick}
        treeData={treeData}
      />
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
      <ContextMenu />
    </Box>
  )
}

SyntaxTree.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default SyntaxTree
