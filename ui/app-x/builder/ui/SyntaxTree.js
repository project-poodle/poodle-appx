import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
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
  DeleteOutlineOutlined,
} from '@material-ui/icons'
import { default as NestedMenuItem } from 'material-ui-nested-menu-item'
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
import { parse_js, lookup_icon_for_type } from 'app-x/builder/ui/util_parse'
import { tree_traverse, tree_lookup, lookup_child_by_ref } from 'app-x/builder/ui/util_tree'
import EditorProvider from 'app-x/builder/ui/EditorProvider'


const SyntaxTree = (props) => {

  // context
  const {
    treeData,
    setTreeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey
  } = useContext(EditorProvider.Context)

  // styles
  const styles = makeStyles((theme) => ({
    tree: {
      width: '100%',
    },
    menuItem: {
      minWidth: 200,
    },
    nestedMenuItem: {
      padding: 0,
    },
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

  // load data via api
  useEffect(() => {
    const url = `/namespace/${props.namespace}/ui_deployment/ui/${props.ui_name}/deployment/${props.ui_deployment}/ui_element/base64:${btoa(props.ui_element_name)}`
    // console.log(url)
    api.get(
      'sys',
      'appx',
      url,
      data => {
        // console.log(data)
        if (Array.isArray(data)) {
          data = data[0]
        }

        if (!('ui_element_spec' in data) || !('element' in data.ui_element_spec)) {
          setTreeData([])
          setExpandedKeys([])
        }

        const js_context = { topLevel: true }
        const parsedTree = parse_js(js_context, null, null, data.ui_element_spec)

        console.log(parsedTree)

        setTreeData(parsedTree)
        setExpandedKeys(js_context.expandedKeys)
      },
      error => {
        console.error(error)
      }
    )
  }, [])

  // selected node
  const selectedNode = tree_lookup(treeData, selectedKey)
  const [ contextAnchorEl, setContextAnchorEl ] = useState(null)

  // add dialog state
  const [ addDialogOpen,      setAddDialogOpen      ] = useState(false)
  const [ addNodeRefRequired, setAddNodeRefRequired ] = useState(null)
  const [ addNodeRef,         setAddNodeRef         ] = useState(null)
  const [ addNodeType,        setAddNodeType        ] = useState('')

  // callback
  const addDialogCallback = (nodeRef, nodeType, nodeData) => {
    console.log(nodeRef, nodeType, nodeData)
  }

  // add menu clicked
  const addMenuClicked = (info => {

    console.log('add', info)
    setContextAnchorEl(null)
    // find node
    const parentNode = tree_lookup(treeData, info.nodeKey)
    if (!!parentNode) {
      // confirm dialog
      // console.log(addDialogCallback)
      setAddNodeRefRequired(info.nodeRefRequired)
      setAddNodeRef(info.nodeRef)
      setAddNodeType(info.nodeType)
      setAddDialogOpen(true)
    }
  })

  // add dialog
  const AddDialog = (props) => {

    const [ nodeType,       setNodeType   ] = useState(props.addNodeType)

    const onSubmit = e => {
      console.log(e)
      alert(e)
      e.stopPropagation()
      e.preventDefault()
    }

    const formRef = React.createRef()

    // react hook form
    const { register, control, reset, errors, trigger, handleSubmit, getValues, setValue } = useForm({
      //criteriaMode: 'all'
    })

    console.log(errors)

    return (
      <Dialog
        className={styles.dialog}
        open={addDialogOpen}
        onClose={
          e => setAddDialogOpen(false)
        }
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        >
        <form onSubmit={() => {return false}} ref={formRef}>
        <DialogTitle
          className={styles.dialog}
          disableTypography={true}
          >
          <ListItem style={{padding:0}}>
            <IconButton>
              { lookup_icon_for_type(nodeType) }
            </IconButton>
            <Typography id="alert-dialog-title" variant="h6">
              {!!addNodeRef ? '[ ' + addNodeRef + ' ] - ' + nodeType : nodeType}
            </Typography>
          </ListItem>
        </DialogTitle>
        <DialogContent
          className={styles.dialogContent}
          >
          {
            !!addNodeRefRequired
            && !addNodeRef
            &&
            (
              <Controller
                name="ref"
                control={control}
                defaultValue=""
                rules={{
                  required: "Reference name is required",
                  pattern: {
                    value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                    message: 'Reference name must be a valid variable name',
                  },
                  validate: {
                    checkDuplicate:
                      value =>
                        lookup_child_by_ref(selectedNode, value) === null
                        || 'Reference name is duplicate with an existing child'
                  },
                }}
                render={props =>
                  <FormControl className={styles.formControl}>
                    <TextField
                      label="Reference"
                      onChange={props.onChange}
                      value={props.value}
                      error={!!errors.ref}
                      helperText={errors.ref?.message}
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
                  defaultValue={addNodeType}
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
                              props.onChange(e)
                              setNodeType(e.target.value)
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
                      type="string"
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
                        validate: value => !isNaN(Number(value)) || "Must be a number",
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
                      type="string"
                      control={control}
                      defaultValue=''
                      rules={{
                        required: "Expression is required",
                        validate: {
                          expressionSyntax:
                            value => {
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
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'js/object')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'js/import')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
                <FormControl className={styles.formControl}>
                  <TextField
                    name="name"
                    label="Name"
                    inputRef={() => register({name: 'name', type: 'string'}, {required: true})}
                    value={!!nodeData.name ? nodeData.name : ''}
                    onChange={e => setNodeData({...nodeData, name: e.target.value})}
                    />
                </FormControl>
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'js/block')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
                <FormControl className={styles.formControl}>
                  <TextField
                    name="data"
                    label="Code Block"
                    multiline={true}
                    inputRef={() => register({name: 'data', type: 'string'}, {required: true})}
                    value={nodeData.data}
                    onChange={e => setnodeType(e.target.value)}
                    />
                </FormControl>
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'js/function')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
                <FormControl className={styles.formControl}>
                  <TextField
                    name="params"
                    label="Parameters"
                    inputRef={() => register({name: 'params', type: 'string'}, {required: true})}
                    value={!!nodeData.params ? nodeData.params : ''}
                    onChange={e => setNodeData({...nodeData, params: e.target.value})}
                    />
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="body"
                    label="Body"
                    multiline={true}
                    inputRef={() => register({name: 'body', type: 'string'}, {required: true})}
                    value={!!nodeData.body ? nodeData.body : ''}
                    onChange={e => setNodeData({...nodeData, body: e.target.value})}
                    />
                </FormControl>
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'js/switch')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'js/map')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'js/reduce')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
                <FormControl className={styles.formControl}>
                  <TextField
                    name="reducer"
                    label="Reducer"
                    multiline={true}
                    inputRef={() => register({name: 'reducer', type: 'string'}, {required: true})}
                    value={!!nodeData.reducer ? nodeData.reducer : ''}
                    onChange={e => setNodeData({...nodeData, reducer: e.target.value})}
                    />
                </FormControl>
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'js/filter')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
                <FormControl className={styles.formControl}>
                  <TextField
                    name="filter"
                    label="Filter"
                    multiline={true}
                    inputRef={() => register({name: 'filter', type: 'string'}, {required: true})}
                    value={!!nodeData.filter ? nodeData.filter : ''}
                    onChange={e => setNodeData({...nodeData, filter: e.target.value})}
                    />
                </FormControl>
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
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
                <FormControl className={styles.formControl}>
                  <TextField
                    name="name"
                    label="Name"
                    inputRef={() => register({name: 'name', type: 'string'}, {required: true})}
                    value={!!nodeData.name ? nodeData.name : ''}
                    onChange={e => setNodeData({...nodeData, name: e.target.value})}
                    />
                </FormControl>
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'react/state')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
                <FormControl className={styles.formControl}>
                  <TextField
                    name="name"
                    label="Name"
                    inputRef={() => register({name: 'name', type: 'string'}, {required: true})}
                    value={nodeData.name}
                    onChange={e => setnodeType(e.target.value)}
                    />
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="setter"
                    label="Setter"
                    inputRef={() => register({name: 'setter', type: 'string'}, {required: true})}
                    value={!!nodeData.setter ? nodeData.setter : ''}
                    onChange={e => setNodeData({...nodeData, setter: e.target.value})}
                    />
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="init"
                    label="Initial Value"
                    multiline={true}
                    inputRef={() => register({name: 'init', type: 'string'}, {required: true})}
                    value={!!nodeData.init ? nodeData.init : ''}
                    onChange={e => setNodeData({...nodeData, init: e.target.value})}
                    />
                </FormControl>
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'react/effect')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
                <FormControl className={styles.formControl}>
                  <TextField
                    name="data"
                    label="Effect"
                    multiline={true}
                    inputRef={() => register({name: 'data', type: 'string'}, {required: true})}
                    value={!!nodeData.data ? nodeData.data : ''}
                    onChange={e => setNodeData({...nodeData, data: e.target.value})}
                    />
                </FormControl>
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'mui/style')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
              </Box>
            )
          }
          {
            (!!nodeType && nodeType == 'appx/route')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    inputRef={() => register({name: 'type', type: 'string'}, {required: true})}
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value)}
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
              </Box>
            )
          }
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
                console.log(errors)
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

  const [ deleteDialog, setDeleteDialog ] = useState({
    open: false,
    title: '',
    onConfirm: ()=>{}
  })

  // delete menu clicked
  const deleteMenuClicked = (info => {
    // console.log('delete', info)
    setContextAnchorEl(null)
    // find node
    const lookupNode = tree_lookup(treeData, info.nodeKey)
    if (!!lookupNode) {
      // confirm dialog
      setDeleteDialog(
        {
          open: true,
          title: lookupNode.title,
          onConfirm: () => {
            // actual delete only if confirmed
            const resultTree = _.cloneDeep(treeData)
            const lookupParent = tree_lookup(resultTree, lookupNode.parentKey)
            if (!!lookupParent) {
              lookupParent.children = lookupParent.children.filter(child => {
                return child.key !== info.nodeKey
              })
              setTreeData(resultTree)
            } else {
              // this is one of the root node
              setTreeData(
                resultTree.filter(child => {
                  return child.key !== info.nodeKey
                })
              )
            }
          }
        }
      )
    }
  })

  const DeleteDialog = (props) => {
    return (
      <Dialog
        className={styles.dialog}
        open={deleteDialog.open}
        onClose={
          e => setDeleteDialog({
            ...deleteDialog,
            open: false
          })
        }
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
              Are you sure to delete [{deleteDialog.title}]?
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={
              e => setDeleteDialog({
                ...deleteDialog,
                open: false
              })
            }
            color="primary"
            >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={
              e => {
                setDeleteDialog({...deleteDialog, open: false})
                if (deleteDialog.onConfirm) {
                  deleteDialog.onConfirm()
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

  const ContextMenuItemList = (props) => {
    return (
      <Box>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/string',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/string') }
          </ListItemIcon>
          <ListItemText primary="Add js/string" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/number',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/number') }
          </ListItemIcon>
          <ListItemText primary="Add js/number" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/boolean',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/boolean') }
          </ListItemIcon>
          <ListItemText primary="Add js/boolean" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/null',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/null') }
          </ListItemIcon>
          <ListItemText primary="Add js/null" />
        </MenuItem>
        <Divider />
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/expression',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/expression') }
          </ListItemIcon>
          <ListItemText primary="Add js/expression" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/function',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/function') }
          </ListItemIcon>
          <ListItemText primary="Add js/function" />
        </MenuItem>
        <Divider />
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'react/element',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('react/element') }
          </ListItemIcon>
          <ListItemText primary="Add react/element" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'react/html',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('react/html') }
          </ListItemIcon>
          <ListItemText primary="Add react/html" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'react/state',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('react/state') }
          </ListItemIcon>
          <ListItemText primary="Add react/state" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'react/effect',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('react/effect') }
          </ListItemIcon>
          <ListItemText primary="Add react/effect" />
        </MenuItem>
        <Divider />
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/switch',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/switch') }
          </ListItemIcon>
          <ListItemText primary="Add js/switch" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/map',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/map') }
          </ListItemIcon>
          <ListItemText primary="Add js/map" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/reduce',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/reduce') }
          </ListItemIcon>
          <ListItemText primary="Add js/reduce" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/filter',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/filter') }
          </ListItemIcon>
          <ListItemText primary="Add js/filter" />
        </MenuItem>
        <Divider />
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/object',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/object') }
          </ListItemIcon>
          <ListItemText primary="Add js/object" />
        </MenuItem>
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => addMenuClicked({
              nodeRef: props.nodeRef,
              nodeRefRequired: props.nodeRefRequired,
              nodeKey: selectedKey,
              nodeType: 'js/array',
            })
          }
          >
          <ListItemIcon>
            { lookup_icon_for_type('js/array') }
          </ListItemIcon>
          <ListItemText primary="Add js/array" />
        </MenuItem>
      </Box>
    )
  }

  // make context menu
  const ContextMenu = (props) => {

    const [ menuPosition, setMenuPosition ] = useState(null)

    // check selectedNode
    if (!selectedNode) {
      return null
    }

    return (
      <Menu
        keepMounted={true}
        getContentAnchorEl={null}
        anchorEl={contextAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(contextAnchorEl)}
        onClose={ e => setContextAnchorEl(null) }
        >
        {
          (
            !!selectedNode
            && !!selectedNode.data
            &&
            (
              selectedNode.data.type === 'js/object'
              || selectedNode.data.type === 'js/array'
            )
          )
          &&
          (
            <Box>
              <ContextMenuItemList
                nodeRef={null}
                nodeRefRequired={selectedNode.data.type === 'js/object'}
                >
              </ContextMenuItemList>
              <Divider />
            </Box>
          )
        }
        {
          (
            !!selectedNode
            && !!selectedNode.data
            &&
            (
              selectedNode.data.type === 'react/element'
              || selectedNode.data.type === 'react/html'
            )
          )
          &&
          (
            <Box>
              {
                !lookup_child_by_ref(selectedNode, 'props')
                &&
                (
                  <Box>
                    <NestedMenuItem
                      className={styles.nestedMenuItem}
                      label={(
                        <List className={styles.nestedMenuItem}>
                          <ListItem
                            dense={true}
                            className={styles.menuItem}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type('js/object') }
                            </ListItemIcon>
                            <ListItemText primary="[ props ]" />
                          </ListItem>
                        </List>
                      )}
                      parentMenuOpen={!!contextAnchorEl}
                      >
                      <MenuItem
                        dense={true}
                        className={styles.menuItem}
                        onClick={
                          () => addMenuClicked({
                            nodeRef: 'props',
                            nodeRefRequired: true,
                            nodeKey: selectedKey,
                            nodeType: 'js/object',
                          })
                        }
                        >
                        <ListItemIcon>
                          { lookup_icon_for_type('js/object') }
                        </ListItemIcon>
                        <ListItemText primary="Add js/object" />
                      </MenuItem>
                    </NestedMenuItem>
                    <Divider />
                  </Box>
                )
              }
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'react/element',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('react/element') }
                </ListItemIcon>
                <ListItemText primary="Add react/element" />
              </MenuItem>
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'react/html',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('react/html') }
                </ListItemIcon>
                <ListItemText primary="Add react/html" />
              </MenuItem>
              <Divider />
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'js/switch',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('js/switch') }
                </ListItemIcon>
                <ListItemText primary="Add js/switch" />
              </MenuItem>
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'js/map',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('js/map') }
                </ListItemIcon>
                <ListItemText primary="Add js/map" />
              </MenuItem>
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'js/reduce',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('js/reduce') }
                </ListItemIcon>
                <ListItemText primary="Add js/reduce" />
              </MenuItem>
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: false,
                    nodeKey: selectedKey,
                    nodeType: 'js/filter',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('js/filter') }
                </ListItemIcon>
                <ListItemText primary="Add js/filter" />
              </MenuItem>
              <Divider />
            </Box>
          )
        }
        {
          (
            !!selectedNode
            && !!selectedNode.data
            && selectedNode.data.type === 'js/switch'
          )
          &&
          (
            <Box>
              {
                !lookup_child_by_ref(selectedNode, 'default')
                &&
                (
                  <Box>
                    <NestedMenuItem
                      className={styles.nestedMenuItem}
                      label={(
                        <List className={styles.nestedMenuItem}>
                          <ListItem
                            dense={true}
                            className={styles.menuItem}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type('js/object') }
                            </ListItemIcon>
                            <ListItemText primary="[ default ]" />
                          </ListItem>
                        </List>
                      )}
                      parentMenuOpen={!!contextAnchorEl}
                      >
                      <ContextMenuItemList
                        nodeRef='default'
                        nodeRefRequired={true}
                        >
                      </ContextMenuItemList>
                    </NestedMenuItem>
                    <Divider />
                  </Box>
                )
              }
              <ContextMenuItemList
                nodeRef={null}
                nodeRefRequired={false}
                >
              </ContextMenuItemList>
              <Divider />
            </Box>
          )
        }
        {
          (
            !!selectedNode
            && !!selectedNode.data
            &&
            (
              selectedNode.data.type === 'js/map'
              || selectedNode.data.type === 'js/reduce'
              || selectedNode.data.type === 'js/filter'
            )
          )
          &&
          (
            <Box>
              {
                !lookup_child_by_ref(selectedNode, 'data')
                &&
                (
                  <Box>
                    <NestedMenuItem
                      className={styles.nestedMenuItem}
                      label={(
                        <List className={styles.nestedMenuItem}>
                          <ListItem
                            dense={true}
                            className={styles.menuItem}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type('js/object') }
                            </ListItemIcon>
                            <ListItemText primary="[ data ]" />
                          </ListItem>
                        </List>
                      )}
                      parentMenuOpen={!!contextAnchorEl}
                      >
                      <ContextMenuItemList
                        nodeRef='data'
                        nodeRefRequired={true}
                        >
                      </ContextMenuItemList>
                    </NestedMenuItem>
                    <Divider />
                  </Box>
                )
              }
              {
                selectedNode.data.type === 'js/map'
                && !lookup_child_by_ref(selectedNode, 'result')
                &&
                (
                  <Box>
                    <NestedMenuItem
                      className={styles.nestedMenuItem}
                      label={(
                        <List className={styles.nestedMenuItem}>
                          <ListItem
                            dense={true}
                            className={styles.menuItem}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type('js/object') }
                            </ListItemIcon>
                            <ListItemText primary="[ result ]" />
                          </ListItem>
                        </List>
                      )}
                      parentMenuOpen={!!contextAnchorEl}
                      >
                      <ContextMenuItemList
                        nodeRef='result'
                        nodeRefRequired={true}
                        >
                      </ContextMenuItemList>
                    </NestedMenuItem>
                    <Divider />
                  </Box>
                )
              }
              {
                selectedNode.data.type === 'js/reduce'
                && !lookup_child_by_ref(selectedNode, 'init')
                &&
                (
                  <Box>
                    <NestedMenuItem
                      className={styles.nestedMenuItem}
                      label={(
                        <List className={styles.nestedMenuItem}>
                          <ListItem
                            dense={true}
                            className={styles.menuItem}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type('js/object') }
                            </ListItemIcon>
                            <ListItemText primary="[ init ]" />
                          </ListItem>
                        </List>
                      )}
                      parentMenuOpen={!!contextAnchorEl}
                      >
                      <ContextMenuItemList
                        nodeRef='init'
                        nodeRefRequired={true}
                        >
                      </ContextMenuItemList>
                    </NestedMenuItem>
                    <Divider />
                  </Box>
                )
              }
            </Box>
          )
        }
        {
          (
            !!selectedNode
            && !!selectedNode.data
            && selectedNode.data.type === 'mui/style'
          )
          &&
          (
            <Box>
              <MenuItem
                dense={true}
                className={styles.menuItem}
                onClick={
                  () => addMenuClicked({
                    nodeRef: null,
                    nodeRefRequired: true,
                    nodeKey: selectedKey,
                    nodeType: 'js/object',
                  })
                }
                >
                <ListItemIcon>
                  { lookup_icon_for_type('js/object') }
                </ListItemIcon>
                <ListItemText primary="Add js/object" />
              </MenuItem>
              <Divider />
            </Box>
          )
        }
        <MenuItem
          dense={true}
          className={styles.menuItem}
          onClick={
            () => deleteMenuClicked({
              nodeKey: selectedKey,
            })
          }
          >
          <ListItemIcon>
            <DeleteOutlined />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    )
  }

  // expand/collapse
  const onExpand = keys => {
    setExpandedKeys(keys)
  }

  // select
  const onSelect = key => {
    // console.log(`selected ${key}`)
    if (key.length) {
      setSelectedKey(key[0])
    } else {
      setSelectedKey(null)
    }
  }

  // drag start
  const onDragStart = info => {
    //console.trace()
    //console.log(info.node.key)
    info.event.dataTransfer.setData("nodeKey", info.node.key)
    // console.log(info.event)
  }

  // drag enter
  const onDragEnter = info => {
    console.trace()
    console.log(info)
    // expandedKeys
    if (!info.node.isLeaf && !info.expandedKeys.includes(info.node.key)) {
      // console.log([...info.expandedKeys, info.node.key])
      setExpandedKeys(
        [...info.expandedKeys, info.node.key]
      )
    }
  }

  // drag enter
  const onDragOver = info => {
    //console.log(info)
  }

  // drop
  const onDrop = info => {
    console.log(info)
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    const dropPosition = info.dropPosition

    // replicate data
    const data = [...treeData]

    // Find dragObject
    let dragObj
    tree_traverse(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!info.dropToGap) {
      // Drop on the content
      tree_traverse(data, dropKey, item => {
        // console.log(item)
        item.children = item.children || []
        // where to insert
        // console.log(expandedKeys)
        item.children.unshift(dragObj)
        if (!expandedKeys.includes(item.key)) {
          console.log([...expandedKeys, item.key])
          setExpandedKeys(
            [...expandedKeys, item.key]
          )
        }
      })
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      tree_traverse(data, dropKey, item => {
        item.children = item.children || []
        // where to insert
        item.children.unshift(dragObj)
        // in previous version, we use item.children.push(dragObj) to insert the
        // item to the tail of the children
      })
    } else {
      let ar
      let i
      tree_traverse(data, dropKey, (item, index, arr) => {
        ar = arr
        i = index
      })
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }
    }

    setTreeData(data)
  }

  const onRightClick = info => {
    // console.log(info)
    // set selected key
    setSelectedKey(info.node.key)
    // find draggable target, open context menu
    let target = info.event.target
    while (target.parentNode && !target.draggable) {
      target = target.parentNode
    }
    setContextAnchorEl(target)
    info.event.stopPropagation()
    info.event.preventDefault()
  }

  const handleContextMenu = e => {
    // console.log(e)
    // console.log('Right click')
    if (contextAnchorEl) {
      setContextAnchorEl(null)
    }
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <Box
      onContextMenu={handleContextMenu}
      >
      <Tree
        className={styles.tree}
        expandedKeys={expandedKeys}
        selectedKeys={[selectedKey]}
        draggable
        blockNode
        showIcon
        onSelect={onSelect}
        onExpand={onExpand}
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onRightClick={onRightClick}
        treeData={treeData}
      />
      <AddDialog
        addNodeRef={addNodeRef}
        addNodeType={addNodeType}
        />
      <DeleteDialog />
      <ContextMenu />
    </Box>
  )
}

SyntaxTree.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default SyntaxTree
