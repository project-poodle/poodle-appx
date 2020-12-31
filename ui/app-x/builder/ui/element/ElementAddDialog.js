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
import NavProvider from 'app-x/builder/ui/NavProvider'
import ElementProvider from 'app-x/builder/ui/element/ElementProvider'
import {
  tree_traverse,
  tree_lookup,
  lookup_icon_for_type,
  lookup_desc_for_type,
  new_folder_node,
  new_component_node,
  default_spec_for_type,
  reorder_array,
  PATH_SEPARATOR,
} from 'app-x/builder/ui/element/util'

// Add dialog
const ElementAddDialog = (props) => {

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
  } = useContext(ElementProvider.Context)

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

  // create element
  const createElement = (parentNode, name, type) => {

    // createElement
    const spec = default_spec_for_type(type)
    const newNode = new_component_node(addDialogContext.parentNode.key, name, type, spec)
    // api request
    const postUrl = `/namespace/${navDeployment.namespace}/ui/${navDeployment.ui_name}/${navDeployment.ui_ver}/ui_element/base64:${btoa(newNode.key)}`
    api.post(
      'sys',
      'appx',
      postUrl,
      {
        ui_element_type: type,
        ui_element_spec: spec,
      },
      data => {
        // console.log(data)
        if (!!data.status && data.status === 'ok') {
          notification['success']({
            message: `SUCCESS`,
            description: `Successfully created ${lookup_desc_for_type(type)} [ ${newNode.key} ]`,
            placement: 'bottomLeft',
          })
          // result tree
          const resultTree = _.cloneDeep(treeData)
          const lookupParent = tree_lookup(resultTree, addDialogContext.parentNode.key)
          if (!!lookupParent && lookupParent.key !== '/') {
            // create new folder node and add it
            lookupParent.children.push(newNode)
            lookupParent.children = reorder_array(lookupParent.children)
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
            description: `Failed to create ${lookup_desc_for_type(type)} [ ${newNode.key} ] - ${data.message}`,
            placement: 'bottomLeft',
          })
        }
      },
      error => {
        console.error(error)
        notification['error']({
          message: `FAILURE`,
          description: `Failed to create ${lookup_desc_for_type(type)} [ ${newNode.key} ] - ${error}`,
          placement: 'bottomLeft',
        })
        setLoadTimer(new Date())
      }
    )
  }

  // onSubmit
  const onSubmit = data => {

    if (data.type === 'folder') {

      const resultTree = _.cloneDeep(treeData)
      const lookupParent = tree_lookup(resultTree, addDialogContext.parentNode.key)
      if (!!lookupParent && lookupParent.key !== '/') {
        // create new folder node and add it
        const newNode = new_folder_node(addDialogContext.parentNode.key, data.name)
        lookupParent.children.push(newNode)
        lookupParent.children = reorder_array(lookupParent.children)
        // update tree data
        // console.log(resultTree)
        setTreeData(resultTree)

      } else {
        // add to top level
        const newNode = new_folder_node('/', data.name)
        resultTree.push(newNode)
        const reorderedTree = reorder_array(resultTree)
        console.log(reorderedTree)
        setTreeData(reorderedTree)
      }

    } else if (data.type === 'react/component') {

      createElement(addDialogContext.parentNode, data.name, data.type)

    } else if (data.type === 'react/provider') {

      createElement(addDialogContext.parentNode, data.name, data.type)

    } else if (data.type === 'react/html') {

      createElement(addDialogContext.parentNode, data.name, data.type)

    } else {
      notification['error']({
        message: 'Failed to Add Element',
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
                lookup_icon_for_type(addDialogContext?.nodeType)
              }
              </IconButton>
              <Typography id="alert-dialog-title" variant="h6">
                Add { lookup_desc_for_type(addDialogContext?.nodeType) }
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
                      {
                        [
                          'folder',
                          'react/component',
                          'react/provider',
                          'html',
                        ].map(type => (
                          <MenuItem
                            key={type}
                            value={type}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type(type) }
                            </ListItemIcon>
                            <Typography variant="inherit" noWrap={true}>
                              { lookup_desc_for_type(type) }
                            </Typography>
                          </MenuItem>
                        ))
                      }
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
                required: "Element name is required",
                pattern: {
                  value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                  message: 'Element name must be a valid variable name',
                },
                validate: {
                  checkDuplicate: value =>
                    addDialogContext.parentNode.children
                      .filter(child => child.subName.toUpperCase() === value.toUpperCase())
                      .length === 0
                    || 'Element name is duplicate with an existing child',
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
                      return 'Element name is duplicate with an existing child'
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
                        : 'Element Name'
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

export default ElementAddDialog
