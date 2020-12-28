import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  makeStyles
} from '@material-ui/core'
import {
  WebOutlined,
  InsertDriveFileOutlined
} from '@material-ui/icons'
import {
  Tree,
  Layout,
  Tooltip,
  Button as AntButton,
} from 'antd'
const {
  TreeNode,
  DirectoryTree,
} = Tree
const {
  Header,
  Footer,
  Sider,
  Content
} = Layout
import {
  Icon,
  FileOutlined,
  ContainerOutlined,
  CodepenOutlined
} from '@ant-design/icons'

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
import {
  tree_traverse,
} from 'app-x/builder/ui/element/util'


const PATH_SEPARATOR = '/'

// generate tree data
const transformTree = (data) => {

  const resultData = []

  data.map(ui_element => {

    let currParent = resultData
    let currKey = PATH_SEPARATOR

    const name = ui_element.ui_element_name
    const subPaths = name.split(PATH_SEPARATOR)

    let subName = subPaths.shift()
    if (subName != '') {
      // if name does not start with '/', ignore
      return
    }

    let icon = <FileOutlined />
    switch (ui_element.ui_element_type) {
      case 'react/element':
        // icon = <CodepenOutlined />
        icon = <ReactIcon />
        break
      case 'html':
        icon = <ContainerOutlined />
        break
    }

    while (subPaths.length) {

      subName = subPaths.shift()
      if (subName == '') {
        // ignore empty subname
        continue
      }

      let found = currParent.find(treeNode => treeNode.title == subName)
      if (!found) {
        if (subPaths.length == 0) {
          found = {
            title: subName,
            key: (currKey + PATH_SEPARATOR + subName).replace(/\/+/g, '/'),
            isLeaf: true,
            icon: icon,
            data: ui_element,
          }
        } else {
          found = {
            title: subName,
            key: (currKey + PATH_SEPARATOR + subName).replace(/\/+/g, '/'),
            children: [],
          }
        }
        currParent.push(found)
        currKey = found.key
      }

      currParent = found.children
    }
  })

  return resultData
}

const ElementTree = (props) => {

  // styles
  const styles = makeStyles((theme) => ({
    root: {
      height: '100%',
      width: '100%',
      margin: theme.spacing(1, 0),
      border: 1,
      borderStyle: 'dotted',
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.background.paper,
    },
    header: {
      // width: 122,
      // margin: 0,
      // padding: 0,
      padding: theme.spacing(1, 1, 1),
      height: theme.spacing(6),
      backgroundColor: theme.palette.background.paper,
      // border
      // border: 1,
      // borderTop: 0,
      // borderRight: 0,
      // borderLeft: 0,
      // borderStyle: 'dotted',
      // borderColor: theme.palette.divider,
    },
    fab: {
      margin: theme.spacing(1),
    },
    treeBox: {
      height: '100%',
      width: '100%',
      padding: theme.spacing(1),
      // backgroundColor: theme.palette.background.paper,
      maxHeight: theme.spacing(100),
      overflow: 'scroll',
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
    treeData,
    setTreeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
    selectedTool,
    setSelectedTool,
    addDialogOpen,
    setAddDialogOpen,
    addDialogCallback,
    setAddDialogCallback,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteDialogCallback,
    setDeleteDialogCallback,
  } = useContext(ElementProvider.Context)

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
          console.log(translated)
          setTreeData(translated)
        },
        error => {
          // error notification
          notification['error']({
            message: `Load UI Element Tree Failed`,
            description: String(error),
            placement: 'bottomLeft',
          })
        }
      )
    }
  }, [navDeployment])

  // right click
  const onRightClick = () => {

  }

  // expand/collapse
  const onExpand = keys => {
    setExpandedKeys(keys)
  }

  // select
  const onSelect = key => {
    // console.log(key)
    setSelectedTool(null)
    tree_traverse(treeData, key[0], (item, index, arr) => {
      if (item.isLeaf) {
        // console.log(item)
        setSelectedKey(item.key)
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
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }
    }

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

  const Toolbar = (props) => {
    return (
      <Box
        key="toolbar"
        display="flex"
        flexWrap="wrap"
        justifyContent="left"
        alignItems="center"
        >
        <Tooltip
          key='pointer'
          title='pointer'
          placement="bottom"
          >
          <AntButton
            size="small"
            color="secondary"
            type={!selectedTool ? 'primary' : 'default'}
            className={styles.fab}
            value='pointer'
            icon={<Pointer />}
            shape="circle"
            onClick={e => {
              setSelectedKey(null)
              setSelectedTool(null)
            }}
            >
          </AntButton>
        </Tooltip>
        <Tooltip
          key='react'
          title='react'
          placement="bottom"
          >
          <AntButton
            size="small"
            color="secondary"
            type={selectedTool === 'react' ? 'primary' : 'default'}
            className={styles.fab}
            value='pointer'
            icon={<ReactIcon />}
            shape="circle"
            onClick={e => {
              setSelectedKey(null)
              setSelectedTool('react')
            }}
            >
          </AntButton>
        </Tooltip>
      </Box>
    )
  }

  return (
    <Layout className={styles.root}>
      <Header key="header" className={styles.header}>
        <Toolbar />
      </Header>
      <Content key="content">
        <Box className={styles.treeBox}>
          {
            constructTree()
          }
        </Box>
      </Content>
    </Layout>
  )
}

export default ElementTree
