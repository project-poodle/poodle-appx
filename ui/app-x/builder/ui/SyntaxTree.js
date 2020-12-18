import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Menu,
  MenuItem,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles
} from '@material-ui/core'
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

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import { parse_js, lookup_icon_for_type } from 'app-x/builder/ui/util_parse'
import { tree_traverse, tree_lookup } from 'app-x/builder/ui/util_tree'
import EditorProvider from 'app-x/builder/ui/EditorProvider'


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
  const [ contextMenuOpen, setContextMenuOpen ] = useState(false)
  const [ contextAnchorEl, setContextAnchorEl ] = useState(null)

  // make context menu
  const ContextMenu = (props) => {
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
          (selectedNode.data.type === 'js/primitive')
          &&
          (
            <MenuItem
              dense={true}
              className={styles.menuItem}
              >
              <ListItemIcon>
                { lookup_icon_for_type('js/primitive') }
              </ListItemIcon>
              <ListItemText primary="Add js/primitive" />
            </MenuItem>
          )
        }
        {
          (selectedNode.data.type === 'js/array')
          &&
          (
            <MenuItem
              dense={true}
              className={styles.menuItem}
              >
              <ListItemIcon>
                { lookup_icon_for_type('js/array') }
              </ListItemIcon>
              <ListItemText primary="Add js/array" />
            </MenuItem>
          )
        }
        <MenuItem
          dense={true}
          className={styles.menuItem}
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
