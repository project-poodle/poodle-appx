import React, { useState, useEffect, useContext } from 'react'
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
import { parse_js } from 'app-x/builder/ui/util_parse'
import { tree_traverse, tree_lookup } from 'app-x/builder/ui/util_tree'
import EditorProvider from 'app-x/builder/ui/EditorProvider'


// generate tree data
const transformTreeData = (data) => {

  try {
    // process data
    const js_context = { topLevel: true }
    const processed = parse_js(js_context, null, null, data)

    console.log(processed)

    // return processed result
    return {
      treeData: processed,
      expandedKeys: js_context.expandedKeys,
    }

  } catch (err) {

    console.log(err.stack)
    throw err
  }
}

const SyntaxTree = (props) => {

    const {
      treeData,
      setTreeData,
      expandedKeys,
      setExpandedKeys,
      selectedKey,
      setSelectedKey
    } = useContext(EditorProvider.Context)
  // console.log(EditorProvider)

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

        const transformed = transformTreeData(data.ui_element_spec)

        setTreeData(transformed.treeData)
        setExpandedKeys(transformed.expandedKeys)
      },
      error => {
        console.error(error)
      }
    )
  }, [])


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
    // console.log(`selected ${key}`)
    if (key.length) {
      setSelectedKey(key[0])
    } else {
      setSelectedKey(null)
    }
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

  return (
    <Tree
      className={styles.tree}
      expandedKeys={expandedKeys}
      draggable
      blockNode
      showIcon
      onSelect={onSelect}
      onExpand={onExpand}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      treeData={treeData}
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
