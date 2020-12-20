import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  MenuItem,
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
  DeleteOutlineOutlined,
} from '@material-ui/icons'
import {
  Autocomplete,
} from '@material-ui/lab'
import {
  default as NestedMenuItem
} from 'material-ui-nested-menu-item'
import {
  Tree,
} from 'antd'
import {
  DeleteOutlined,
} from '@ant-design/icons'
const { DirectoryTree } = Tree
import {
  Icon,
} from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useForm, Controller } from "react-hook-form";
import { parse, parseExpression } from "@babel/parser"

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import {
  parse_js,
  lookup_icon_for_type,
  valid_import_names,
  valid_html_tags,
} from 'app-x/builder/ui/util_parse'
import {
  tree_traverse,
  tree_lookup,
  lookup_child_by_ref
} from 'app-x/builder/ui/util_tree'

// add dialog
const SyntaxAddDialog = (props) => {

  // states and effects
  const [ nodeType,       setNodeType   ] = useState(props.addNodeType)

  useEffect(() => {
    setNodeType(props.addNodeType)
  }, [props.addNodeType])

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

  // onSubmit
  const onSubmit = data => {
    console.log('data', data)
    props.setOpen(false)
    if (props.callback) {
      props.callback(props.addNodeRef, props.nodeParent, data)
    }
  }

  // react hook form
  const { register, control, reset, errors, trigger, handleSubmit, getValues, setValue } = useForm({
    //criteriaMode: 'all'
  })

  // console.log(nodeType)

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
      <form onSubmit={() => {return false}}>
      <DialogTitle
        className={styles.dialog}
        disableTypography={true}
        >
        <ListItem style={{padding:0}}>
          <IconButton>
            { lookup_icon_for_type(nodeType) }
          </IconButton>
          <Typography id="alert-dialog-title" variant="h6">
            {!!props.addNodeRef ? '[ ' + props.addNodeRef + ' ] - ' + nodeType : nodeType}
          </Typography>
        </ListItem>
      </DialogTitle>
      <DialogContent
        className={styles.dialogContent}
        >
        {
          !!props.addNodeRefRequired
          && !props.addNodeRef
          &&
          (
            <Controller
              name="__ref"
              control={control}
              defaultValue=""
              rules={{
                required: "Reference name is required",
                pattern: {
                  value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                  message: 'Reference name must be a valid variable name',
                },
                validate: {
                  checkDuplicate: value =>
                    lookup_child_by_ref(props.nodeParent, value) === null
                    || 'Reference name is duplicate with an existing child'
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
          (
            !!nodeType
            &&
            (
              nodeType == 'js/string'
                || nodeType == 'js/number'
                || nodeType == 'js/boolean'
                || nodeType == 'js/null'
                || nodeType == 'js/expression'
            )
          )
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="js/string">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/string') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/string
                          </Typography>
                        </MenuItem>
                        <MenuItem value="js/number">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/number') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/number
                          </Typography>
                        </MenuItem>
                        <MenuItem value="js/boolean">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/boolean') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/boolean
                          </Typography>
                        </MenuItem>
                        <MenuItem value="js/null">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/null') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/null
                          </Typography>
                        </MenuItem>
                        <MenuItem value="js/expression">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/expression') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/expression
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
              {
                (nodeType === 'js/string')
                &&
                (
                  <Controller
                    name="data"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "String value is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="String"
                            multiline={false}
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.data}
                            helperText={errors.data?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                )
              }
              {
                (nodeType === 'js/number')
                &&
                (
                  <Controller
                    name="data"
                    type="number"
                    control={control}
                    defaultValue={0}
                    rules={{
                      required: "Number is required",
                      validate: {
                        checkNumber: value => !isNaN(Number(value)) || "Must be a number",
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Number"
                            multiline={false}
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.data}
                            helperText={errors.data?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                )
              }
              {
                (nodeType === 'js/boolean')
                &&
                (
                  <Controller
                    name="data"
                    type="boolean"
                    control={control}
                    defaultValue={true}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <FormHelperText>Boolean</FormHelperText>
                          <FormControlLabel
                            control={
                              <Switch
                                name={props.name}
                                checked={props.value}
                                onChange={e => props.onChange(e.target.checked)}
                              />
                            }
                            label=""
                            />
                        </FormControl>
                      )
                    }
                  />
                )
              }
              {
                (nodeType === 'js/expression')
                &&
                (
                  <Controller
                    name="data"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Expression is required",
                      validate: {
                        expressionSyntax: value => {
                          try {
                            parseExpression(value)
                            return true
                          } catch (err) {
                            return String(err)
                          }
                        }
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                            <TextField
                              label="Expression"
                              multiline={true}
                              onChange={props.onChange}
                              value={props.value}
                              error={!!errors.data}
                              helperText={errors.data?.message}
                              />
                        </FormControl>
                      )
                    }
                  />
                )
              }
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'js/array')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="js/array">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/array') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/array
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'js/object')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="js/object">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/object') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/object
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'js/import')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="js/import">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/import') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/import
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
                  required: "Import name is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Name"
                        multiline={false}
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        />
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'js/block')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="js/block">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/block') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/block
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
              <Controller
                name="data"
                control={control}
                defaultValue=''
                rules={{
                  required: "Code block is required",
                  validate: {
                    validSyntax: value => {
                      try {
                        parse(value)
                        return true
                      } catch (err) {
                        return String(err)
                      }
                    }
                  }
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Code Block"
                        multiline={true}
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.data}
                        helperText={errors.data?.message}
                        />
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'js/function')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="js/function">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/function') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/function
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
              <Controller
                name="params"
                type="custom"
                control={control}
                defaultValue={[]}
                rules={{
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Parameters"
                        multiline={true}
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.params}
                        helperText={errors.params?.message}
                        />
                    </FormControl>
                  )
                }
              />
              <Controller
                name="body"
                control={control}
                defaultValue=''
                rules={{
                  required: "Function body is required",
                  validate: {
                    validSyntax: value => {
                      try {
                        parse(value)
                        return true
                      } catch (err) {
                        return String(err)
                      }
                    }
                  }
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Body"
                        multiline={true}
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.body}
                        helperText={errors.body?.message}
                        />
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'js/switch')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="js/switch">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/switch') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/switch
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'js/map')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="js/map">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/map') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/map
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'js/reduce')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="js/reduce">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/reduce') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/reduce
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
              <Controller
                name="reducer"
                control={control}
                defaultValue=''
                rules={{
                  required: "Reducer is required",
                  validate: {
                    validSyntax: value => {
                      try {
                        parseExpression(value)
                        return true
                      } catch (err) {
                        return String(err)
                      }
                    }
                  }
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Reducer"
                        multiline={true}
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.reducer}
                        helperText={errors.reducer?.message}
                        />
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'js/filter')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="js/filter">
                          <ListItemIcon>
                            { lookup_icon_for_type('js/filter') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            js/filter
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
              <Controller
                name="filter"
                control={control}
                defaultValue=''
                rules={{
                  required: "Filter is required",
                  validate: {
                    validSyntax: value => {
                      try {
                        parseExpression(value)
                        return true
                      } catch (err) {
                        return String(err)
                      }
                    }
                  }
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Filter"
                        multiline={true}
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.filter}
                        helperText={errors.filter?.message}
                        />
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (
            !!nodeType
            &&
            (
              nodeType == 'react/element'
              || nodeType == 'react/html'
            )
          )
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="react/element">
                          <ListItemIcon>
                            { lookup_icon_for_type('react/element') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            react/element
                          </Typography>
                        </MenuItem>
                        <MenuItem value="react/html">
                          <ListItemIcon>
                            { lookup_icon_for_type('react/html') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            react/html
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
              {
                nodeType === 'react/element'
                &&
                <Controller
                  name="name"
                  control={control}
                  defaultValue=''
                  rules={{
                    required: "Element name is required",
                  }}
                  render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <Autocomplete
                        options={valid_import_names()}
                        getOptionLabel={option => option}
                        freeSolo={true}
                        onChange={(e, v) => props.onChange(v)}
                        renderInput={
                          params =>
                          <TextField
                            {...params}
                            label="Element Name"
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                          />
                        }
                      />
                    </FormControl>
                  )
                }
                />
              }
              {
                nodeType === 'react/html'
                &&
                <Controller
                  name="name"
                  control={control}
                  defaultValue=''
                  rules={{
                    required: "HTML tag is required",
                  }}
                  render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <Autocomplete
                        options={valid_html_tags()}
                        getOptionLabel={option => option}
                        freeSolo={true}
                        onChange={(e, v) => props.onChange(v)}
                        renderInput={
                          params =>
                          <TextField
                            {...params}
                            label="HTML Tag"
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                          />
                        }
                      />
                    </FormControl>
                  )
                }
                />
              }
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'react/state')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="react/state">
                          <ListItemIcon>
                            { lookup_icon_for_type('react/state') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            react/state
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
                  required: "Name is required",
                  pattern: {
                    value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                    message: "Name must be valid variable name"
                  }
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Name"
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        />
                    </FormControl>
                  )
                }
              />
              <Controller
                name="setter"
                control={control}
                defaultValue=''
                rules={{
                  required: "Setter is required",
                  pattern: {
                    value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                    message: "Setter must be valid variable name"
                  }
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Setter"
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.setter}
                        helperText={errors.setter?.message}
                        />
                    </FormControl>
                  )
                }
              />
              <Controller
                name="init"
                control={control}
                defaultValue=''
                rules={{
                  validate: {
                    validSyntax: value => {
                      if (value) {
                        try {
                          JSON.parse(value)
                          return true
                        } catch (err) {
                          return String(err)
                        }
                      }
                    }
                  }
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Initial Value"
                        multiline={true}
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.init}
                        helperText={errors.init?.message}
                        />
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'react/effect')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="react/effect">
                          <ListItemIcon>
                            { lookup_icon_for_type('react/effect') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            react/effect
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
              <Controller
                name="data"
                control={control}
                defaultValue=''
                rules={{
                  validate: {
                    validSyntax: value => {
                      if (value) {
                        try {
                          parse(value)
                          return true
                        } catch (err) {
                          return String(err)
                        }
                      }
                    }
                  }
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Code Block"
                        multiline={true}
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.data}
                        helperText={errors.data?.message}
                        />
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'mui/style')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="mui/style">
                          <ListItemIcon>
                            { lookup_icon_for_type('mui/style') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            mui/style
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
            </Box>
          )
        }
        {
          (!!nodeType && nodeType == 'appx/route')
          &&
          (
            <Box>
              <Controller
                name="type"
                control={control}
                defaultValue={nodeType}
                rules={{
                  required: "Type is required",
                }}
                render={props =>
                  (
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Type"
                        select={true}
                        onChange={
                          e => {
                            setNodeType(e.target.value)
                            props.onChange(e)
                          }
                        }
                        value={props.value}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        >
                        <MenuItem value="appx/route">
                          <ListItemIcon>
                            { lookup_icon_for_type('appx/route') }
                          </ListItemIcon>
                          <Typography variant="inherit" noWrap={true}>
                            appx/route
                          </Typography>
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  )
                }
              />
            </Box>
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
          Add
        </Button>
      </DialogActions>
      </form>
    </Dialog>
  )
}

export default SyntaxAddDialog
