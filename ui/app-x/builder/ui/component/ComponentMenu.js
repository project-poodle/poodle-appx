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
  ContainerOutlined,
  FileOutlined,
  DeleteOutlined,
  ProfileOutlined,
  Icon,
} from '@ant-design/icons'
import { useForm, Controller } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid'

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import ComponentProvider from 'app-x/builder/ui/component/ComponentProvider'
import {
  tree_traverse,
  tree_lookup,
  lookup_icon_for_type,
  lookup_desc_for_type,
} from 'app-x/builder/ui/component/util'

// make context menu
const ComponentMenu = (props) => {

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
    contextKey,
    setContextKey,
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
  } = useContext(ComponentProvider.Context)

  const [ selectedNode,     setSelectedNode   ] = useState(null)

  // lookup
  useEffect(() => {
    // lookup selected node
    const lookupNode = tree_lookup(treeData, contextKey)
    if (!!lookupNode) {
      setSelectedNode(lookupNode)
    } else {
      setSelectedNode(null)
    }
  }, [treeData, contextKey])

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
            {
              [
                'folder',
                null,
                'react/component',
                'react/provider',
              ].map(type => {
                if (!!type) {
                  return (
                    <MenuItem
                      dense={true}
                      className={styles.menuItem}
                      key={type}
                      onClick={() => {
                        props.setContextAnchorEl(null)
                        setAddDialogContext({
                          parentNode: selectedNode,
                          nodeType: type,
                        })
                        setAddDialogOpen(true)
                      }}
                      >
                      <ListItemIcon>
                        { lookup_icon_for_type(type) }
                      </ListItemIcon>
                      <ListItemText primary={`Add ${lookup_desc_for_type(type)}`} />
                    </MenuItem>
                  )
                } else {
                  return <Divider key={uuidv4()}/>
                }
              })
            }
            {
              selectedNode?.key !== '/'
              &&
              (
                <Divider />
              )
            }
          </Box>
        )
      }
      {
        selectedNode?.key !== '/'
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

export default ComponentMenu
