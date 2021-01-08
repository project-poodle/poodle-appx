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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  TextField,
  Switch,
  makeStyles
} from '@material-ui/core'
import {
  DeleteOutlined,
  PlusOutlined,
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
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import {
  parse_js,
  lookup_icon_for_type,
  lookup_title_for_input,
  valid_import_names,
  valid_html_tags,
} from 'app-x/builder/ui/syntax/util_parse'
import {
  tree_traverse,
  tree_lookup,
  lookup_child_by_ref
} from 'app-x/builder/ui/syntax/util_tree'

// add dialog
const SyntaxMoveDialog = (props) => {

  // styles
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

  const {
    treeData,
    selectedKey,
  } = useContext(SyntaxProvider.Context)

  // whether switch default
  const [ isSwitchDefault,    setSwitchDefault    ] = useState(false)

  // onSubmit
  const onSubmit = data => {
    // console.log('onSubmit')
    // console.log(props.moveCallback)
    if (props.moveCallback) {
      // console.log(data)
      props.moveCallback(data)
      props.setOpen(false)
    }
  }

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

  return (
    <Dialog
      className={styles.dialog}
      open={props.open}
      onClose={
        e => {
          props.setOpen(false)
        }
      }
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
                { lookup_icon_for_type(props.moveDragNode?.data?._type) }
              </IconButton>
              <Typography id="alert-dialog-title" variant="h6">
                { lookup_title_for_input(props.moveDragNode?.data?.__ref, props.moveDragNode?.data) }
              </Typography>
            </ListItem>
          </DialogTitle>
          <DialogContent
            className={styles.dialogContent}
            >
            {
              (
                props.moveDropParent?.data?._type !== 'js/switch'
              )
              &&
              (
                <Controller
                  name="__ref"
                  control={control}
                  defaultValue={props.moveDragNode?.data?.__ref}
                  rules={{
                    required: "Reference name is required",
                    pattern: {
                      value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                      message: 'Reference name must be a valid variable name',
                    },
                    validate: {
                      checkDuplicate: value =>
                        lookup_child_by_ref(props.moveDropParent, value) === null
                        || 'Reference name is duplicate with an existing child',
                      checkSwitchChild: value =>
                        props.moveDropParent?.data?._type !== 'js/switch'
                        || value === 'default'
                        || 'Reference name for js/switch must be [default]',
                      checkMapChild: value =>
                        props.moveDropParent?.data?._type !== 'js/map'
                        || value === 'data'
                        || value === 'result'
                        || 'Reference name for js/map must be [data] or [result]',
                      checkReduceChild: value =>
                        props.moveDropParent?.data?._type !== 'js/reduce'
                        || value === 'data'
                        || 'Reference name for js/reduce must be [data]',
                      checkFilterChild: value =>
                        props.moveDropParent?.data?._type !== 'js/filter'
                        || value === 'data'
                        || 'Reference name for js/filter must be [data]',
                      checkReactElementChild: value =>
                        props.moveDropParent?.data?._type !== 'react/element'
                        || value === 'props'
                        || 'Reference name for react/element must be [props]',
                      checkReactHtmlChild: value =>
                        props.moveDropParent?.data?._type !== 'react/html'
                        || value === 'props'
                        || 'Reference name for react/html must b3 [props]',
                    },
                  }}
                  render={props =>
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Reference"
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.__ref}
                        helperText={errors.__ref?.message}
                        />
                    </FormControl>
                  }
                />
              )
            }
            {
              props.moveDropParent?.data?._type === 'js/switch'
              &&
              (
                <Controller
                  name="default"
                  type="boolean"
                  control={control}
                  defaultValue={isSwitchDefault}
                  rules={{
                    validate: {
                      checkDuplicate: value =>
                        !value
                        || lookup_child_by_ref(props.moveDropParent, 'default') === null
                        || 'Default condition already exists'
                    },
                  }}
                  render={props =>
                    (
                      <FormControl
                        className={styles.formControl}
                        error={!!errors.default}
                        >
                        <FormHelperText>Is Default</FormHelperText>
                        <FormControlLabel
                          control={
                            <Switch
                              name={props.name}
                              checked={props.value}
                              onChange={e => {
                                props.onChange(e.target.checked)
                                setSwitchDefault(e.target.checked)
                              }}
                            />
                          }
                          />
                          {
                            !!errors.default
                            &&
                            <FormHelperText>{errors.default?.message}</FormHelperText>
                          }
                      </FormControl>
                    )
                  }
                />
              )
            }
            {
              (
                props.moveDropParent?.data?._type === 'js/switch'
                && !isSwitchDefault
              )
              &&
              (
                <Controller
                  name="condition"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "Condition is required",
                    validate: {
                      conditionSyntax: value => {
                        try {
                          parseExpression(String(value))
                          return true
                        } catch (err) {
                          return String(err)
                        }
                      }
                    },
                  }}
                  render={props =>
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Condition"
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.condition}
                        helperText={errors.condition?.message}
                        />
                    </FormControl>
                  }
                />
              )
            }
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={
                e => {
                  props.setOpen(false)
                }
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
              Move
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  )
}

export default SyntaxMoveDialog
