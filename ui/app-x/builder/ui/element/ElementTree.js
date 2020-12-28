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
  DirectoryTree
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
import NavProvider from 'app-x/builder/ui/NavProvider'
import ElementProvider from 'app-x/builder/ui/element/ElementProvider'
import {
  tree_traverse,
} from 'app-x/builder/ui/element/util'


const PATH_SEPARATOR = '/'

// generate tree data
const translateTree = (data) => {

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
    },
    header: {
      // width: 122,
      margin: 0,
      padding: 0,
      backgroundColor: theme.palette.background.paper,
      overflow: 'scroll',
      // border
      border: 1,
      borderTop: 0,
      borderRight: 0,
      borderLeft: 0,
      borderStyle: 'dotted',
      borderColor: theme.palette.divider,
    },
    fab: {
      margin: theme.spacing(1),
    },
    treeBox: {
      height: '100%',
      width: '100%',
      overflow: 'scroll',
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
  } = NavProvider.Context

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
  } = ElementProvider.Context

  // tree ref
  const elementTreeRef = React.createRef()

  // nav deployment change
  useEffect(() => {
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
          console.log(data)
          const translated = translateTree(data)
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
    //console.log(key)
    tree_traverse(tData, key[0], (item, index, arr) => {
      if (item.isLeaf) {
        // console.log(item)
        props.handlers.handleElementSelected(item.data)
      } else {
        // console.log(item)
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
      tree_traverse(tData, dropKey, item => {
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
      </DirectoryTree>
    )
  }

  const Toolbar = (props) => {
    return (
      <Box
        key="toolbar"
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        alignItems="center"
        >
        {
          [
            'pointer',
            'folder',
            'element',
            'provider',
            'html',
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
                  icon={<FileOutlined />}
                  shape="circle"
                  // draggable={true}
                  onClick={e => {
                    setSelectedKey(null)
                    if (!type || type === 'pointer') {
                      setSelectedTool(null)
                    } else {
                      setSelectedTool(type)
                    }
                  }}
                  >
                </AntButton>
              </Tooltip>
            )
          })
        }
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
