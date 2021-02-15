import React, { useState, useEffect, useContext } from 'react'
import ReactDOM from 'react-dom'
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
import {
  notification
} from 'antd'

import ReactIcon from 'app-x/icon/React'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import {
  parse_tree_node,
  tree_traverse,
  tree_lookup,
} from 'app-x/builder/ui/syntax/util_parse'

const SyntaxDeleteDialog = (props) => {

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

  // context
  const {
    // tree data
    treeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
    // test data
    // testData,
    // dirty flags
    syntaxDirty,
    setSyntaxDirty,
    // testDirty,
    // setTestDirty,
    // history and actions
    // makeFreshAction,
    makeDesignAction,
    // makeTestAction,
    updateDesignAction,
    // updateTestAction,
  } = useContext(SyntaxProvider.Context)

  // on submit
  const onSubmit = node => {
    ReactDOM.unstable_batchedUpdates(() => {
      try {
        // console.log('Add submit data', data)
        deleteCallback(node)
        props.setOpen(false)
      } catch (err) {
        console.log(`Delete`, node, err)
        notification.error({
          message: `Failed to Delete [ ${node?.data._type.replaceAll('/', ' / ')} ]`,
          description: String(err),
          placement: 'bottomLeft',
        })
      }
    })
  }

  // delete callback
  const deleteCallback = (lookupNode) => {
    // actual delete only if confirmed
    let resultTree = _.cloneDeep(treeData)
    const lookupParent = tree_lookup(resultTree, lookupNode.parentKey)
    if (!!lookupParent && lookupParent.key !== '/') {
      // console.log(lookupParent)
      lookupParent.children = lookupParent.children.filter(child => {
        return child.key !== lookupNode.key
      })
    } else {
      // this is one of the root node
      resultTree =
        resultTree.filter(child => {
          return child.key !== lookupNode.key
        })
    }
    // expandedKeys
    let newExpandedKeys = _.cloneDeep(expandedKeys)
    if (newExpandedKeys.includes(lookupNode.key)) {
      newExpandedKeys.splice(newExpandedKeys.indexOf(lookupNode.key), 1)
    }
    // selected key
    let newSelectedKey = selectedKey
    if (selectedKey === lookupNode.key) {
      setSelectedKey(null)
      newSelectedKey = null
    }
    // take action
    makeDesignAction(
      `Delete [${lookupNode?.title}]`,
      resultTree,
      newExpandedKeys,
      newSelectedKey,
    )
  }

  return (
    <Dialog
      className={styles.dialog}
      open={props.open}
      onClose={ e => props.setOpen(false) }
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
            Are you sure to delete [ {props.node?.title} ] ?
          </DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={
            e => props.setOpen(false)
          }
          color="secondary"
          >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={
            e => {
              try {
                onSubmit(props.node)
                props.setOpen(false)
              } catch (err) {
                console.log(err)
                notification.error({
                  message: `Failed to Delete [ ${props.node?.type} ]`,
                  description: String(err),
                  placement: 'bottomLeft',
                })
              }
            }
          }
          color="secondary"
          autoFocus
          >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SyntaxDeleteDialog
