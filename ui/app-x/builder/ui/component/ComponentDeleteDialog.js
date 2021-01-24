import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  makeStyles
} from '@material-ui/core'
import {
  DeleteOutlineOutlined,
} from '@material-ui/icons'
import {
  notification,
} from 'antd'
import {
  DeleteOutlined,
} from '@ant-design/icons'

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import NavProvider from 'app-x/builder/ui/NavProvider'
import ComponentProvider from 'app-x/builder/ui/component/ComponentProvider'
import {
  tree_traverse,
  tree_lookup,
  lookup_icon_for_type,
  lookup_desc_for_type,
  reorder_array,
  PATH_SEPARATOR,
} from 'app-x/builder/ui/component/util'

// delete dialog
const ComponentDeleteDialog = (props) => {

  const styles = makeStyles((theme) => ({
    dialog: {
      minWidth: 460,
      [theme.breakpoints.up('md')]: {
        minWidth: 600,
      },
    },
    dialogContent: {
      padding: theme.spacing(0, 5, 3),
    },
    formControl: {
      width: '100%',
      // margin: theme.spacing(1),
      padding: theme.spacing(2, 0),
    },
  }))()

  // nav context
  const {
    navDeployment,
    navComponent,
    navRoute,
    navSelected,
  } = useContext(NavProvider.Context)

  // component context
  const {
    // basic data
    treeData,
    setTreeData,
    expandedKeys,
    setExpandedKeys,
    loadTimer,
    setLoadTimer,
    // delete dialog
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteDialogContext,
    setDeleteDialogContext,
    deleteDialogCallback,
    setDeleteDialogCallback,
  } = useContext(ComponentProvider.Context)

  // delete component
  const deleteComponent = (componentPath) => {

    // deleteComponent
    const resultTree = _.cloneDeep(treeData)
    const lookupNode = tree_lookup(resultTree, componentPath)
    const lookupParent = tree_lookup(resultTree, lookupNode?.parentKey)
    // api request
    const deleteUrl = `/namespace/${navDeployment.namespace}/ui/${navDeployment.ui_name}/${navDeployment.ui_ver}/ui_component/base64:${btoa(componentPath)}`
    api.del(
      'sys',
      'appx',
      deleteUrl,
      data => {
        // console.log(data)
        if (!!data.status && data.status === 'ok') {
          notification['success']({
            message: `SUCCESS`,
            description: `Successfully deleted ${lookup_desc_for_type(lookupNode?.type)} [ ${componentPath} ]`,
            placement: 'bottomLeft',
          })
          // check that lookupNode and lookupParent exists
          if (!!lookupNode && !!lookupParent && lookupParent.key !== PATH_SEPARATOR) {
            // delete node from result tree
            const children = []
            lookupParent.children
              .filter(child => child.key !== componentPath)
              .map(child => {
                children.push(child)
              })
            lookupParent.children = reorder_array(children)
            // update tree data
            // console.log(resultTree)
            setTreeData(resultTree)
          } else {
            // refresh tree
            setLoadTimer(new Date())
          }
        } else {
          setLoadTimer(new Date())
          notification['error']({
            message: `FAILURE`,
            description: `Failed to delete ${lookup_desc_for_type(lookupNode?.type)} [ ${componentPath} ] - ${data.message}`,
            placement: 'bottomLeft',
          })
        }
      },
      error => {
        console.error(error)
        notification['error']({
          message: `FAILURE`,
          description: `Failed to delete ${lookup_desc_for_type(lookupNode?.type)} [ ${componentPath} ] - ${error.toString()}`,
          placement: 'bottomLeft',
        })
        setLoadTimer(new Date())
      }
    )
  }

  // potentially recurssivelly delete
  const onDelete = (node) => {
    if (!!node.isLeaf) {
      deleteComponent(node.key)
      return
    } else if (!!node.children.length) {
      // do not delete non empty folder
      notification['error']({
        message: `FAILURE`,
        description: `Cannot delete non empty folder [ ${node.key} ]`,
        placement: 'bottomLeft',
      })
    } else {
      // we are hder if empty folder
      const resultTree = _.cloneDeep(treeData)
      const lookupNode = tree_lookup(resultTree, node.key)
      const lookupParent = tree_lookup(resultTree, lookupNode?.parentKey)
      if (!!lookupNode && !!lookupParent && lookupParent.key !== PATH_SEPARATOR) {
        const children = []
        lookupParent.children
          .filter(child => child.key !== node.key)
          .map(child => {
            children.push(child)
          })
        lookupParent.children = reorder_array(children)
        // update tree data
        // console.log(resultTree)
        setTreeData(resultTree)
      } else {
        // refresh if unexpected
        setLoadTimer(new Date())
      }
    }
  }

  return (
    <Dialog
      className={styles.dialog}
      open={deleteDialogOpen}
      onClose={ e => setDeleteDialogOpen(false) }
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      >
      <DialogTitle
        className={styles.dialog}
        disableTypography={true}
        >
        <ListItem style={{padding:0}}>
          <IconButton>
            <DeleteOutlineOutlined />
          </IconButton>
          <Typography id="alert-dialog-title" variant="h6">
            Confirm Deletion
          </Typography>
        </ListItem>
      </DialogTitle>
      <DialogContent
        className={styles.dialogContent}
        >
        <Box>
          <DialogContentText id="alert-dialog-description">
            Are you sure to delete [ {deleteDialogContext?.selectedNode?.icon} {deleteDialogContext?.selectedNode?.title} ] ?
          </DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={
            e => setDeleteDialogOpen(false)
          }
          color="primary"
          >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={
            e => {
              setDeleteDialogOpen(false)
              onDelete(deleteDialogContext.selectedNode)
              if (!!deleteDialogCallback) {
                deleteDialogCallback(deleteDialogContext.selectedNode)
              }
            }
          }
          color="primary"
          autoFocus
          >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ComponentDeleteDialog
