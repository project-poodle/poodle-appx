import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core'
import { WebOutlined, InsertDriveFileOutlined } from '@material-ui/icons'
import { Tree } from 'antd'
const { DirectoryTree } = Tree
import { Icon, FileOutlined, FileTextOutlined, ContainerOutlined, CodepenOutlined, SwitcherOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
// import ReactSvg from 'app-x/icon/react.svg'

const PATH_SEPARATOR = '/'
const VARIABLE_SEPARATOR = '.'

// traverse method
const traverse = (data, key, callback) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].key === key) {
      return callback(data[i], i, data)
    }
    if (data[i].children) {
      traverse(data[i].children, key, callback)
    }
  }
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

// generate tree data
const transformTreeData = (data) => {

  const treeData = []
  const expandKeys = []

  if (Array.isArray(data)) {
    data = data[0]
  }

  if (!('ui_element_spec' in data) || !('element' in data.ui_element_spec)) {
    return { tree_data: [], expanded_keys: [] }
  }

  const element = data.ui_element_spec.element
  if (!('type' in element) || element.type != 'react/element') {
    return { tree_data: [], expanded_keys: [] }
  }

  function traverseElement(element, parentNode, func) {
    const node = func(element, parentNode)
    if (element.children) {
      element.children.map(child => {
        traverseElement(child, node, func)
      })
    }
  }

  traverseElement(element, null, (elem, parentNode) => {

    const node = {
      key: uuidv4(),
      title: 'title',
      icon: <FileOutlined />,
      children: [],
    }

    if (typeof elem === 'string') {
      node.title = elem.length > 32 ? elem.substring(0, 32) + '...' : elem
      node.icon = <FileTextOutlined />
    } else if (elem.type == 'react/element') {
      const parsed = parse_var_full_path(elem.name)
      node.title = parsed.full_paths.pop()
      node.icon = <ReactIcon />
      node.elemName = elem.name
      node.elemProps = elem.props
    } else if (elem.type == 'js/switch') {
      node.title = 'Switch'
      node.icon = <SwitcherOutlined />
    } else {
      return
    }

    expandKeys.push(node.key)

    if (parentNode == null) {
      treeData.push(node)
    } else {
      parentNode.children.push(node)
    }
    return node
  })

  return { tree_data: treeData, expanded_keys: expandKeys }
}

const loaded = {
  namespace: null,
  ui_name: null,
  ui_deployment: null,
  ui_element_name: null,
  api_data: [],
  tree_data: [],
  expanded_keys: [],
}


const ReactElementTree = (props) => {

  console.log(props)

  const [ tData, setTData ] = useState(loaded.tree_data)
  const [ expandedKeys, setExpandedKeys ] = useState(loaded.expanded_keys)
  //console.log(tData)

  if (loaded.tree_data == null
      || loaded.namespace != props.namespace
      || loaded.ui_name != props.ui_name
      || loaded.ui_deployment != props.ui_deployment
      || loaded.ui_element_name != props.ui_element_name) {

    const url = `/namespace/${props.namespace}/ui_deployment/ui/${props.ui_name}/deployment/${props.ui_deployment}/ui_element/base64:${btoa(props.ui_element_name)}`
    // console.log(url)
    api.get(
      'sys',
      'appx',
      url,
      data => {
        // console.log(data)
        const transformed = transformTreeData(data)
        loaded.api_data = data
        loaded.tree_data = transformed.tree_data
        loaded.expanded_keys = transformed.expanded_keys
        loaded.namespace = props.namespace
        loaded.ui_name = props.ui_name
        loaded.ui_deployment = props.ui_deployment
        loaded.ui_element_name = props.ui_element_name
        console.log(loaded)
        setTData(loaded.tree_data)
        setExpandedKeys(loaded.expanded_keys)
      },
      error => {
        console.error(error)
      }
    )
  }

  const styles = makeStyles((theme) => ({
    tree: {
      width: '100%'
    },
  }))()

  // expand/collapse
  const onExpand = keys => {
    setExpandedKeys(keys)
  }

  // select
  const onSelect = key => {
    console.log(`select ${key}`)
  }

  // drag enter
  const onDragEnter = info => {
    // expandedKeys
    if (!info.node.isLeaf && !info.expandedKeys.includes(info.node.key)) {
      // console.log([...info.expandedKeys, info.node.key])
      setExpandedKeys(
        [...info.expandedKeys, info.node.key]
      )
    }
  }

  // drop
  const onDrop = info => {
    console.log(info)
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    // const dropPos = info.node.props.pos.split('-')
    // const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
    const dropPosition = info.dropPosition

    // replicate data
    const data = [...tData]

    // Find dragObject
    let dragObj
    traverse(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!info.dropToGap) {
      // Drop on the content
      traverse(data, dropKey, item => {
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
      traverse(data, dropKey, item => {
        item.children = item.children || []
        // where to insert
        item.children.unshift(dragObj)
        // in previous version, we use item.children.push(dragObj) to insert the
        // item to the tail of the children
      })
    } else {
      let ar
      let i
      traverse(data, dropKey, (item, index, arr) => {
        ar = arr
        i = index
      })
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }
    }

    setTData(data)
  }

  return (
    <Tree
      className={styles.tree}
      expandedKeys={expandedKeys}
      // autoExpandParent={true}
      // defaultExpandAll
      draggable
      blockNode
      showIcon
      onExpand={onExpand}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      treeData={tData}
    />
  )
}

ReactElementTree.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default ReactElementTree
