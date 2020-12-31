import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  makeStyles
} from '@material-ui/core'
import {
  ContainerOutlined,
  FileOutlined,
} from '@ant-design/icons'
import {
  Tree,
  notification,
} from 'antd'
const {
  TreeNode,
  DirectoryTree,
} = Tree

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import Html from 'app-x/icon/Html'
import Text from 'app-x/icon/Text'
import Css from 'app-x/icon/Css'
import Code from 'app-x/icon/Code'
import Effect from 'app-x/icon/Effect'
import Pointer from 'app-x/icon/Pointer'

import NavProvider from 'app-x/builder/ui/NavProvider'
import ElementProvider from 'app-x/builder/ui/element/ElementProvider'
import ElementAddDialog from 'app-x/builder/ui/element/ElementAddDialog'
import ElementDeleteDialog from 'app-x/builder/ui/element/ElementDeleteDialog'
import ElementMenu from 'app-x/builder/ui/element/ElementMenu'
import {
  tree_traverse,
  tree_lookup,
  lookup_icon_for_type,
  lookup_desc_for_type,
  new_folder_node,
  new_component_node,
  PATH_SEPARATOR,
} from 'app-x/builder/ui/element/util'



// generate tree data
const transformTree = (data) => {

  const resultData = []
  resultData.push(new_folder_node(PATH_SEPARATOR, PATH_SEPARATOR))

  data.map(ui_element => {

    let currKey = PATH_SEPARATOR

    const name = ui_element.ui_element_name
    const subPaths = name.split(PATH_SEPARATOR)

    let subName = subPaths.shift()
    if (subName !== '') {
      // if name does not start with '/', ignore
      return
    }

    // find location
    while (subPaths.length) {

      subName = subPaths.shift()
      if (subName === '') {
        // ignore empty subname
        continue
      }

      // update currKey
      let parentKey = currKey
      currKey = (currKey + PATH_SEPARATOR + subName).replace(/\/+/g, PATH_SEPARATOR)

      let found = resultData.find(treeNode => treeNode.key === currKey)
      if (!found) {
        if (subPaths.length == 0) {
          found = new_component_node(parentKey, subName, ui_element.ui_element_type, ui_element)
        } else {
          found = new_folder_node(parentKey, subName)
        }
        resultData.push(found)
        currKey = found.key
      }
    }
  })

  const resultTree = []
  // add root nodes
  resultData
    .filter(node => node.parentKey === PATH_SEPARATOR)
    .sort((a, b) => {
      if (!a.isLeaf && !!b.isLeaf) {
        return -1
      } else if (!!a.isLeaf && !b.isLeaf) {
        return 1
      } else {
        return a.key.localeCompare(b.key)
      }
    })
    .map(node => {
      resultTree.push(node)
    })
  // child decedant nodes
  resultData
    .filter(node => node.parentKey !== PATH_SEPARATOR)
    .sort((a, b) => {
      if (!a.isLeaf && !!b.isLeaf) {
        return -1
      } else if (!!a.isLeaf && !b.isLeaf) {
        return 1
      } else {
        return a.key.localeCompare(b.key)
      }
    })
    .map(node => {
    // handle each child
    tree_traverse(resultTree, node.parentKey, (found, index, arr) => {
      found.children.push(node)
    })
  })

  return resultTree
}

const ElementTree = (props) => {

  // styles
  const styles = makeStyles((theme) => ({
    root: {
      height: '100%',
      width: '100%',
    },
    treeBox: {
      height: '100%',
      width: '100%',
      margin: theme.spacing(1, 1),
      padding: theme.spacing(1, 1),
      // maxHeight: theme.spacing(100),
      // overflow: 'scroll',
      // border
      border: 1,
      borderLeft: 0,
      borderRight: 0,
      borderStyle: 'dotted',
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.background.paper,
    },
    tree: {
      width: '100%',
    },
  }))()

  // nav context
  const {
    navDeployment,
    setNavDeployment,
    navElement,
    setNavElement,
    navRoute,
    setNavRoute,
    navSelected,
    setNavSelected,
  } = useContext(NavProvider.Context)

  // element context
  const {
    // basic data
    treeData,
    setTreeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
    loadTimer,
    setLoadTimer,
    // add dialog
    addDialogOpen,
    setAddDialogOpen,
    addDialogContext,
    setAddDialogContext,
    addDialogCallback,
    setAddDialogCallback,
    // delete dialog
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteDialogContext,
    setDeleteDialogContext,
    deleteDialogCallback,
    setDeleteDialogCallback,
  } = useContext(ElementProvider.Context)

  // context menu
  const [ contextAnchorEl, setContextAnchorEl ] = useState(null)

  // tree ref
  const elementTreeRef = React.createRef()

  // nav deployment change
  useEffect(() => {
    // console.log(navDeployment)
    // load tree from api
    if (!!navDeployment?.namespace
        && !!navDeployment?.ui_name
        && !!navDeployment?.ui_ver
        && !!navDeployment?.ui_deployment
    ) {
      api.get(
        'sys',
        'appx',
        `/namespace/${navDeployment.namespace}/ui_deployment/ui/${navDeployment.ui_name}/deployment/${navDeployment.ui_deployment}/ui_element`,
        data => {
          // console.log(data)
          const translated = transformTree(data)
          // console.log(translated)
          setTreeData(translated)
        },
        error => {
          console.log(error)
          // error notification
          notification['error']({
            message: `Load UI Element Tree Failed`,
            description: String(error),
            placement: 'bottomRight',
          })
        }
      )
    }
  }, [navDeployment, loadTimer])

  // unselect if user chose other nav types
  useEffect(() => {
    if (navSelected?.type !== 'ui_element') {
      setSelectedKey(null)
    }
  }, [ navSelected.type ])


  // right click
  const onRightClick = info => {
    // console.log(info)
    // set selected key
    setSelectedKey(info.node.key)
    // find draggable target, open context menu
    let target = info.event.target
    while (target.parentNode && !target.draggable) {
      target = target.parentNode
    }
    // console.log(target)
    setContextAnchorEl(target)
    info.event.stopPropagation()
    info.event.preventDefault()
  }

  // syntax menu
  const handleSyntaxMenu = e => {
    // console.log('Right click')
    if (contextAnchorEl) {
      setContextAnchorEl(null)
    }
    e.stopPropagation()
    e.preventDefault()
  }

  // expand/collapse
  const onExpand = keys => {
    setExpandedKeys(keys)
  }

  // select
  const onSelect = key => {
    // console.log(key)
    tree_traverse(treeData, key[0], (item, index, arr) => {
      setSelectedKey(item.key)
      if (item.isLeaf) {
        // console.log(item)
        setNavSelected({
          type: 'ui_element'
        })
        setNavElement({
          ui_element_name: item.key,
          ui_element_type: item.data.ui_element_type,
          ui_element_spec: item.data.ui_element_spec,
        })
      } else {
        // expand folder & key
        const idx = expandedKeys.indexOf(item.key)
        if (idx < 0) {
          setExpandedKeys(
            [...expandedKeys, item.key]
          )
        } else {
          const newKeys = [...expandedKeys]
          newKeys.splice(idx, 1)
          setExpandedKeys(newKeys)
        }
      }
    })
  }

  // drop
  const onDrop = info => {
    // console.log(info)
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    // const dropPos = info.node.props.pos.split('-')
    // const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
    const dropPosition = info.dropPosition

    // check for root
    if (dragKey === '/') {
      notification['info']({
        message: 'INFO',
        description: 'Moving root component not allowed',
        placement: 'bottomLeft',
      })
      return
    }

    // check if drop key is leaf
    let isLeaf = false
    if (!info.dropToGap) {
      // Drop on the content
      tree_traverse(treeData, dropKey, item => {
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
    const data = [...treeData]

    let dragFunc = () => {}
    let dropFunc = () => {}

    // Find dragObject
    let dragObj
    tree_traverse(data, dragKey, (item, index, arr) => {
      dragFunc = () => {
        arr.splice(index, 1)
      }
      dragObj = item
    })

    if (dragObj.type === 'folder' && !!dragObj.children.length) {
      notification['info']({
        message: 'INFO',
        description: 'Moving non-empty folder not allowed',
        placement: 'bottomLeft',
      })
      return
    }

    // not implemented
    notification['info']({
      message: 'INFO',
      description: 'Move not yet implemented',
      placement: 'bottomLeft',
    })
    return

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
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }
    }

    dragFunc()

    setTData(data)
  }

  function constructTree() {
    return (
      <DirectoryTree
        ref={elementTreeRef}
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
        treeData={treeData}
      >
      {
        treeData?.map(treeNode => {
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
              className={`appx-tree-node`}
              children={data.children?.map(child => {
                  return ConvertTreeNode(child)
              })}
            >
            </TreeNode>
          }
          return ConvertTreeNode(treeNode)
        })
      }
      </DirectoryTree>
    )
  }

  return (
    <Box
      className={styles.root}
      >
      <Box
        className={styles.treeBox}
        >
        {
          constructTree()
        }
      </Box>
      <ElementAddDialog
        key="addDialog"
        />
      <ElementDeleteDialog
        key="deleteDialog"
        />
      <ElementMenu
        key="menu"
        contextAnchorEl={contextAnchorEl}
        setContextAnchorEl={setContextAnchorEl}
        >
      </ElementMenu>
    </Box>
  )
}

export default ElementTree
