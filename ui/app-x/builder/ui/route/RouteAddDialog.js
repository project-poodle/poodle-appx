import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Box,
  Button,
  IconButton,
  MenuItem,
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
  FormControl,
  TextField,
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
  FolderOutlined,
  QuestionOutlined,
} from '@ant-design/icons'
import {
  useForm,
  useFormContext,
  useFieldArray,
  FormProvider,
  Controller,
} from "react-hook-form";

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import Route from 'app-x/icon/Route'
import NavProvider from 'app-x/builder/ui/NavProvider'
import RouteProvider from 'app-x/builder/ui/route/RouteProvider'
import {
  tree_traverse,
  tree_lookup,
  new_folder_node,
  new_route_node,
  default_route_spec,
  reorder_array,
  PATH_SEPARATOR,
  ROOT_KEY,
} from 'app-x/builder/ui/route/util'

// Add dialog
const RouteAddDialog = (props) => {

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
    navRoute,
    navSelected,
    selectRoute,
  } = useContext(NavProvider.Context)

  // Route context
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
  } = useContext(RouteProvider.Context)

  // react hook form
  const hookForm = useForm()
  const {
    register,
    unregister,
    errors,
    watch,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    getValues,
    trigger,
    control,
    formState,
  } = hookForm

  // create Route
  const createRoute = (parentNode, name, type) => {

    // createRoute
    const spec = default_route_spec()
    const newNode = type === 'folder'
      ? new_folder_node(addDialogContext.parentNode.key, name, spec)
      : new_route_node(addDialogContext.parentNode.key, name, spec)
    console.log(newNode)
    // api request
    const postUrl = `/namespace/${navDeployment.namespace}/ui/${navDeployment.ui_name}/${navDeployment.ui_ver}/ui_route/base64:${btoa(newNode.apiKey)}`
    api.post(
      'sys',
      'appx',
      postUrl,
      {
        ui_route_spec: spec,
      },
      data => {
        // console.log(data)
        if (!!data.status && data.status === 'ok') {
          notification['success']({
            message: `SUCCESS`,
            description: `Successfully created route [ ${newNode.key} ]`,
            placement: 'bottomLeft',
          })
          // refresh tree
          setLoadTimer(new Date())
        } else {
          setLoadTimer(new Date())
          notification['error']({
            message: `FAILURE`,
            description: `Failed to create route [ ${newNode.key} ] - ${data.message}`,
            placement: 'bottomLeft',
          })
        }
      },
      error => {
        console.error(error)
        notification['error']({
          message: `FAILURE`,
          description: `Failed to create route [ ${newNode.key} ] - ${error}`,
          placement: 'bottomLeft',
        })
        setLoadTimer(new Date())
      }
    )
  }

  // onSubmit
  const onSubmit = data => {

    if (data.type === 'folder') {

      createRoute(addDialogContext.parentNode, data.name, data.type)

    } else if (data.type === 'route') {

      createRoute(addDialogContext.parentNode, data.name, data.type)

    } else {
      notification['error']({
        message: 'Failed to Add Route',
        description: `Unknown type [ ${data.type} ]`,
        placement: 'bottomLeft',
      })
    }
    // callback if exists
    if (addDialogCallback) {
      addDialogCallback(data)
    }

    // close add dialog after all steps completed
    setAddDialogOpen(false)
  }

  return (
    <Dialog
      className={styles.dialog}
      open={addDialogOpen}
      onClose={ e => setAddDialogOpen(false) }
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      >
      <FormProvider {...hookForm}>
        <form onSubmit={() => {return false}}>
          <DialogTitle
            className={styles.dialog}
            disableTypography={true}
            >
            <ListItem style={{padding:0}}>
              <IconButton>
                {
                  addDialogContext.nodeType === 'folder'
                  ? <FolderOutlined />
                  : addDialogContext.nodeType === 'route'
                    ? <Route />
                    : <QuestionOutlined />
                }
              </IconButton>
              <Typography id="alert-dialog-title" variant="h6">
                {
                  addDialogContext.nodeType === 'folder'
                  ? 'Add Folder'
                  : addDialogContext.nodeType === 'route'
                    ? ' Add Route'
                    : `Unknown [${addDialogContext.nodeType}]`
                }
              </Typography>
            </ListItem>
          </DialogTitle>
          <DialogContent
            className={styles.dialogContent}
            >
            <Controller
              name="type"
              control={control}
              defaultValue={addDialogContext?.nodeType}
              rules={{
                required: "Type is required",
              }}
              render={props =>
                (
                  <FormControl className={styles.formControl}>
                    <TextField
                      label="Type"
                      select={true}
                      name={props.name}
                      value={props.value}
                      onChange={
                        e => {
                          setAddDialogContext({
                            ...addDialogContext,
                            nodeType: e.target.value,
                          })
                          props.onChange(e)
                        }
                      }
                      error={!!errors.type}
                      helperText={errors.type?.message}
                      >
                      <MenuItem
                        key='folder'
                        value='folder'
                        >
                        <ListItemIcon>
                          <FolderOutlined />
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap={true}>
                          Folder
                        </Typography>
                      </MenuItem>
                      <MenuItem
                        key='route'
                        value='route'
                        >
                        <ListItemIcon>
                          <Route />
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap={true}>
                          Route
                        </Typography>
                      </MenuItem>
                    </TextField>
                  </FormControl>
                )
              }
            />
            <Controller
              name="name"
              control={control}
              defaultValue=''
              rules={{
                required: "Route name is required",
                pattern: {
                  value: /^\/([_a-zA-Z0-9\/\:]*[_a-zA-Z0-9])*$/,
                  message: 'Route name must start with [/] and consists of alphanumeric, [/], or [:]',
                },
                validate: {
                  checkDuplicate: value =>
                    addDialogContext.parentNode.children
                      .filter(child => child.subName.toUpperCase() === value.toUpperCase())
                      .length === 0
                    || 'Route name is duplicate with an existing child',
                  checkRootFolder: value => {
                    if (addDialogContext.parentNode.key !== '/') {
                      return true
                    } else if (treeData
                      .filter(child => child.subName.toUpperCase() === value.toUpperCase())
                      .length === 0)
                    {
                      return true
                    }
                    else
                    {
                      return 'Route name is duplicate with an existing child'
                    }
                  }
                }
              }}
              render={props =>
                (
                  <FormControl className={styles.formControl}>
                    <TextField
                      label={
                        addDialogContext?.nodeType === 'folder'
                        ? 'Folder Name'
                        : 'Route Name'
                      }
                      multiline={false}
                      name={props.name}
                      value={props.value}
                      onChange={props.onChange}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      />
                  </FormControl>
                )
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={
                e => setAddDialogOpen(false)
              }
              color="primary"
              >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={
                e => {
                  if (!_.isEmpty(errors)) {
                    console.log('errors', errors)
                  }
                  handleSubmit(onSubmit)()
                }
              }
              color="primary"
              autoFocus
              >
              Add
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  )
}

export default RouteAddDialog
