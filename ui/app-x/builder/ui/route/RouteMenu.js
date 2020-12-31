import React, { useState, useEffect, useContext } from 'react'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Box,
  Button,
  IconButton,
  Fab,
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
import {
  Button as AntButton,
} from 'antd'
import {
  FolderOutlined,
  FileOutlined,
  DeleteOutlined,
  Icon,
} from '@ant-design/icons'
import { useForm, Controller } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid'

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import Route from 'app-x/icon/Route'
import RouteProvider from 'app-x/builder/ui/route/RouteProvider'
import {
  tree_traverse,
  tree_lookup,
  PATH_SEPARATOR,
  ROOT_KEY,
} from 'app-x/builder/ui/route/util'

// make context menu
const RouteMenu = (props) => {

  // styles
  const styles = makeStyles((theme) => ({
    menuItem: {
      minWidth: 200,
    },
  }))()

  // context
  const {
    // basic data
    treeData,
    setTreeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
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
  } = useContext(RouteProvider.Context)

  const [ selectedNode,     setSelectedNode   ] = useState(null)

  // lookup
  useEffect(() => {
    // lookup selected node
    const lookupNode = tree_lookup(treeData, selectedKey)
    if (!!lookupNode) {
      setSelectedNode(lookupNode)
    } else {
      setSelectedNode(null)
    }
  }, [treeData, selectedKey])

  // render
  return (
    <Menu
      keepMounted={true}
      getContentAnchorEl={null}
      anchorEl={props.contextAnchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      open={Boolean(props.contextAnchorEl)}
      onClose={ e => props.setContextAnchorEl(null) }
      >
      {
        !selectedNode?.isLeaf
        &&
        (
          <Box>
            <MenuItem
              dense={true}
              className={styles.menuItem}
              key='folder'
              onClick={() => {
                props.setContextAnchorEl(null)
                setAddDialogContext({
                  parentNode: selectedNode,
                  nodeType: 'folder',
                })
                setAddDialogOpen(true)
              }}
              >
              <ListItemIcon>
                <FolderOutlined />
              </ListItemIcon>
              <ListItemText primary={`Add Folder`} />
            </MenuItem>
            <Divider />
            <MenuItem
              dense={true}
              className={styles.menuItem}
              key='route'
              onClick={() => {
                props.setContextAnchorEl(null)
                setAddDialogContext({
                  parentNode: selectedNode,
                  nodeType: 'route',
                })
                setAddDialogOpen(true)
              }}
              >
              <ListItemIcon>
                <Route />
              </ListItemIcon>
              <ListItemText primary={`Add Route`} />
            </MenuItem>
            {
              selectedKey !== ROOT_KEY
              &&
              (
                <Divider />
              )
            }
          </Box>
        )
      }
      {
        selectedNode?.key !== ROOT_KEY
        &&
        (
          <MenuItem
            dense={true}
            className={styles.menuItem}
            key='delete'
            onClick={() => {
              props.setContextAnchorEl(null)
              setDeleteDialogContext({
                selectedNode: selectedNode,
              })
              setDeleteDialogOpen(true)
            }}
            >
            <ListItemIcon>
              <DeleteOutlined />
            </ListItemIcon>
            <ListItemText primary={`Delete`} />
          </MenuItem>
        )
      }
    </Menu>
  )
}

export default RouteMenu
