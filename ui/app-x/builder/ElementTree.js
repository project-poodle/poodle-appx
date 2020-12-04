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
  {
    title: 'parent 1',
    key: '0-1',
    children: [
      {
        title: 'leaf 1-0',
        key: '0-1-0',
        isLeaf: true,
      },
      {
        title: 'leaf 1-1',
        key: '0-1-1',
        isLeaf: true,
      },
    ],
  },
]


const ElementTree = (props) => {

  const useStyles = makeStyles((theme) => ({
    root: {},
    toolbar: {
      height: 64
    },
  }))

  const onSelect = (keys, event) => {
    console.log('Trigger Select', keys, event)
  }

  const onExpand = () => {
    console.log('Trigger Expand')
  }

  return (
    <DirectoryTree
      // multiple
      draggable
      defaultExpandAll
      onSelect={onSelect}
      onExpand={onExpand}
      treeData={treeData}
    />
  );
}
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
    tns.push({ title: key, key });
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

  const [ gData, setGData ] = useState(initData)
  const [ expandedKeys, setExpandedKeys ] = useState(['0-0', '0-0-0', '0-0-0-0'])
  //console.log(gData)

  const onDragEnter = info => {
    console.log(info)
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  }

  const onDrop = info => {
    console.log(info)
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    const dropPos = info.node.props.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    const loop = (data, key, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children, key, callback);
        }
      }
    }
    const data = [...gData]

    // Find dragObject
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    })

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, item => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
      });
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, item => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
        // in previous version, we use item.children.push(dragObj) to insert the
        // item to the tail of the children
      });
    } else {
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    setGData(data)
  }

  return (
    <Tree
      //className="draggable-tree"
      //style={{width: '100%'}}
      className={styles.tree}
      defaultExpandedKeys={expandedKeys}
      // defaultExpandAll
      draggable
      blockNode
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      treeData={gData}
    />
  )
}

export default ElementTree
