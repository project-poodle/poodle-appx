import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core'
import { Tree } from 'antd'
const { DirectoryTree } = Tree
import {
  Icon,
} from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import { js_process } from 'app-x/builder/util'


////////////////////////////////////////////////////////////////////////////////
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

// generate tree data
const transformTreeData = (data) => {

  try {
    // process data
    const js_context = {}
    const processed = js_process(js_context, null, data)

    console.log(processed)

    // return processed result
    if (processed.children) {
      return {
        tree_data: processed.children,
        expanded_keys: js_context.expandKeys,
      }
    } else {
      return {
        tree_data: [],
        expanded_keys: [],
      }
    }
  } catch (err) {

    console.log(err.stack)
    throw err
  }

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


const SyntaxTree = (props) => {

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
        if (Array.isArray(data)) {
          data = data[0]
        }

        if (!('ui_element_spec' in data) || !('element' in data.ui_element_spec)) {
          setTData([])
          setExpandedKeys([])
        }

        const transformed = transformTreeData(data.ui_element_spec)
        loaded.api_data = data
        loaded.tree_data = transformed.tree_data
        loaded.expanded_keys = transformed.expanded_keys
        loaded.namespace = props.namespace
        loaded.ui_name = props.ui_name
        loaded.ui_deployment = props.ui_deployment
        loaded.ui_element_name = props.ui_element_name
        // console.log(loaded)
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

SyntaxTree.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default SyntaxTree
