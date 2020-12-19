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
            Are you sure to delete [{props.node?.title}]?
          </DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={
            e => props.setOpen(false)
          }
          color="primary"
          >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={
            e => {
              props.setOpen(false)
              if (props.callback) {
                props.callback(props.node)
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

export default SyntaxDeleteDialog
