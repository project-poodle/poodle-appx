import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core'
import { Tree } from 'antd'
const { DirectoryTree } = Tree

/*
const treeData = [
  {
    title: 'parent 0',
    key: '0-0',
    children: [
      {
        title: 'leaf 0-0',
        key: '0-0-0',
        isLeaf: true,
      },
      {
        title: 'leaf 0-1',
        key: '0-0-1',
        isLeaf: true,
      },
    ],
  },
]
*/

const initData = [];
const x = 3;
const y = 2;
const z = 1;
const generateData = (_level, _preKey, _tns) => {
  const preKey = _preKey || '0';
  const tns = _tns || initData;

  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key: key, isLeaf: _level<0 });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);


const ElementTree = (props) => {

  const styles = makeStyles((theme) => ({
    tree: {
      width: '100%'
    },
  }))()

  const [ tData, setTData ] = useState(initData)
  const [ expandedKeys, setExpandedKeys ] = useState(['0-0', '0-0-0', '0-0-1', '0-1'])
  //console.log(tData)

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

  // select
  const onSelect = key => {
    //console.log(key)
    traverse(tData, key[0], (item, index, arr) => {
      if (!item.isLeaf) {
        console.log(item)
        const idx = expandedKeys.indexOf(item.key)
        if (idx < 0) {
          // expand non-leaf node if not already
          // console.log(`expand ${item.key}`, [...expandedKeys, item.key])
          setExpandedKeys(
            [...expandedKeys, item.key]
          )
        } else {
          // collapse leaf node if already expanded
          const newKeys = [...expandedKeys]
          newKeys.splice(idx, 1)
          //console.log(`remove ${item.key}`, newKeys)
          setExpandedKeys(newKeys)
        }
      }
    })
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

    // check if drop key is leaf
    let isLeaf = false
    if (!info.dropToGap) {
      // Drop on the content
      traverse(tData, dropKey, item => {
        if (item.isLeaf) {
          isLeaf = true
        }
      })
    }

    // if leaf, do not process
    if (isLeaf) {
      return
    }

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
        item.children = item.children || [];
        // where to insert
        item.children.unshift(dragObj)
        // in previous version, we use item.children.push(dragObj) to insert the
        // item to the tail of the children
      });
    } else {
      let ar;
      let i;
      traverse(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    setTData(data)
  }

  return (
    <DirectoryTree
      className={styles.tree}
      expandedKeys={expandedKeys}
      // defaultExpandAll
      draggable
      blockNode
      onSelect={onSelect}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      treeData={tData}
    />
  )
}

export default ElementTree
