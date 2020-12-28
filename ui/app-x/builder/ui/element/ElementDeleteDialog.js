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
  DeleteOutlined,
} from '@ant-design/icons'

import ReactIcon from 'app-x/icon/React'
import ElementProvider from 'app-x/builder/ui/element/ElementProvider'
import { tree_traverse, tree_lookup } from 'app-x/builder/ui/element/util'

// delete dialog
const ElementDeleteDialog = (props) => {

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

  // element context
  const {
    // basic data
    treeData,
    setTreeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
    // delete dialog
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteDialogContext,
    setDeleteDialogContext,
    deleteDialogCallback,
    setDeleteDialogCallback,
  } = useContext(ElementProvider.Context)

  // delete element
  const deleteElement = (elementPath) => {

    // deleteElement
    // api request
    const deleteUrl = `/namespace/${navDeployment.namespace}/ui/${navDeployment.ui_name}/${navDeployment.ui_ver}/ui_element/base64:${btoa(elementPath)}`
    api.delete(
      'sys',
      'appx',
      deleteUrl,
      data => {
        // console.log(data)
        if (!!data.status && data.status === 'ok') {
          notification['success']({
            message: `SUCCESS`,
            description: `Successfully deleted ${lookup_desc_for_type(type)} [ ${name} ]`,
            placement: 'bottomLeft',
          })
          // result tree
          const resultTree = _.cloneDeep(treeData)
          const lookupParent = tree_lookup(resultTree, addDialogContext.parentNode.key)
          if (!!lookupParent) {
            // create new folder node and add it
            lookupParent.children.push(newNode)
            reorder_children(lookupParent)
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
            description: `Failed to create ${lookup_desc_for_type(type)} [ ${name} ] - ${data.message}`,
            placement: 'bottomLeft',
          })
        }
      },
      error => {
        console.error(error)
        setLoadTimer(new Date())
      }
    )
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

export default ElementDeleteDialog
