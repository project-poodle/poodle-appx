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
  Input,
  InputLabel,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  TextField,
  Switch,
  makeStyles,
  useTheme,
} from '@material-ui/core'
import {
  AddCircleOutline,
  RemoveCircleOutline,
  DeleteOutlineOutlined,
} from '@material-ui/icons'
import {
  PlusOutlined,
} from '@ant-design/icons'
import {
  notification,
} from 'antd'
import { v4 as uuidv4 } from 'uuid'
import {
  useForm,
  useFormContext,
  useFieldArray,
  FormProvider,
  Controller,
} from "react-hook-form";
import { parse, parseExpression } from "@babel/parser"

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import AutoSuggest from 'app-x/builder/component/AutoSuggest'
import InputField from 'app-x/builder/component/InputField'
import InputFieldArray from 'app-x/builder/component/InputFieldArray'
import ControlledEditor from 'app-x/builder/component/ControlledEditor'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import {
  generate_tree_node,
  new_tree_node,
  lookup_icon_for_type,
  lookup_icon_for_node,
  lookup_icon_for_input,
  lookup_title_for_node,
  lookup_title_for_input,
  reorder_children,
} from 'app-x/builder/ui/syntax/util_generate'
import {
  tree_traverse,
  tree_lookup,
  lookup_child_for_ref
} from 'app-x/builder/ui/syntax/util_parse'
import {
  REGEX_VAR,
  lookup_classes,
  lookup_groups,
  lookup_types,
  lookup_types_for_class,
  lookup_classes_for_type,
  lookup_types_for_group,
  lookup_group_for_type,
  lookup_changeable_types,
  lookup_type_for_data,
  lookup_type_for_classname,
  lookup_classname_for_type,
  lookup_accepted_types_for_node,
  lookup_accepted_classnames_for_node,
  lookup_first_accepted_childSpec,
  lookup_icon_for_class,
  type_matches_spec,
  valid_api_methods,
  valid_import_names,
  valid_html_tags,
} from 'app-x/builder/ui/syntax/util_base'

// add dialog
const SyntaxMoveDialog = (props) => {
  // theme
  const theme = useTheme()
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
      padding: theme.spacing(2, 0),
    },
  }))()

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

  // states and effects
  const [ parentSpec,   setParentSpec   ] = useState(null)
  const [ nodeSpec,     setNodeSpec     ] = useState(null)
  const [ nodeType,     setNodeType     ] = useState(null)
  const [ nodeRef,      setNodeRef      ] = useState(null)

  //////////////////////////////////////////////////////////////////////////////
  // disabled and hidden states
  const [ disabled,     setDisabled     ] = useState({})
  const [ hidden,       setHidden       ] = useState({})

  const form = hookForm
  const states = {
    getDisabled: (name) => {
      return !!disabled[name]
    },
    setDisabled: (name, target) => {
      if (!!disabled[name] !== !!target) {
        const result = _.clone(disabled)
        result[name] = !!target
        setDisabled(result)
      }
    },
    getHidden: (name) => {
      return !!hidden[name]
    },
    setHidden: (name, target) => {
      if (!!hidden[name] !== !!target) {
        const result = _.clone(hidden)
        result[name] = !!target
        setHidden(result)
      }
    },
    getValue: (name) => {
      return getValues(name)
    },
    setValue: (name, target) => {
      if (getValues(name) !== undefined && getValues(name) !== target) {
        setValue(name, target)
      }
    },
    getRef: () => {
      return getValues('_ref')
    },
    setRef: (refTarget) => {
      if (getValues("_ref") !== undefined && getValues("_ref") !== refTarget) {
        // console.log("getValues(_ref)", getValues("_ref"), refTarget)
        form.setValue("_ref", refTarget)
      }
      if (nodeRef !== refTarget) {
        setNodeRef(refTarget)
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // run effects when data changes
  const watchData = watch()
  useEffect(() => {
    if (!!parentSpec) {
      // parentSpec effects
      const childSpec = parentSpec?.children.find(childSpec => childSpec.name === '*' || childSpec.name == nodeRef)
      if (!!childSpec?._childNode?.effects && Array.isArray(childSpec._childNode.effects)) {
        childSpec._childNode.effects
          .filter(effect => !!effect.context && effect.context.includes('move') && Array.isArray(effect.data))
          .map(effect => {
            effect.data.map(data => eval(data))
          })
      }
    }
    // nodeSpec effects
    if (!!nodeSpec?._effects && Array.isArray(nodeSpec._effects)) {
      nodeSpec._effects
        .filter(effect => !!effect.context && effect.context.includes('move') && Array.isArray(effect.data))
        .map(effect => {
          effect.data.map(data => eval(data))
        })
    }
  }, [watchData])

  //////////////////////////////////////////////////////////////////////////////
  // parentSpec
  useEffect(() => {
    // reset disabled and hidden flags
    setDisabled({})
    setHidden({})
    // set parent spec
    if (!props.moveDropParent?.data?._type) {
      setParentSpec(null)
    } else {
      const spec = globalThis.appx.SPEC.types[props.moveDropParent.data._type]
      // console.log(`parentSpec`, spec)
      if (!spec) {
        setParentSpec(null)
      } else {
        setParentSpec(spec)
      }
    }
  }, [props.moveDropParent])

  // nodeType
  useEffect(() => {
    setNodeType(props.moveDragNode?.data?._type || '')
    setNodeRef(props.moveDragNode?.data?._ref || '')
    setValue("_type", props.moveDragNode?.data?._type || '')
    setValue("_ref", props.moveDragNode?.data?._ref || '')
  }, [props.moveDragNode])

  // nodeSpec
  useEffect(() => {
    // reset disabled and hidden flags
    setDisabled({})
    setHidden({})
    // set node spec
    if (!nodeType) {
      setNodeSpec(null)
    } else {
      const spec = globalThis.appx.SPEC.types[nodeType]
      // console.log(`nodeSpec`, spec)
      if (!spec) {
        setNodeSpec(null)
      } else {
        setNodeSpec(spec)
      }
    }
  }, [nodeType])

  //////////////////////////////////////////////////////////////////////////////
  // onSubmit
  const onSubmit = data => {
    ReactDOM.unstable_batchedUpdates(() => {
      try {
        // console.log('Move submit data', data)
        moveCallback(data)
        props.setOpen(false)
      } catch (err) {
        console.log(`Move`, data, err)
        notification.error({
          message: `Failed to Move [ ${nodeType?.replaceAll('/', ' / ')} ]`,
          description: String(err),
          placement: 'bottomLeft',
        })
      }
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  // move callback
  const moveCallback = (nodeData) => {
    // console.log(`nodeData`, nodeData)
    // update array flag
    const is_array = !!parentSpec?.children?.find(item => item.name === '*' || item.name === nodeData._ref)?.array
    props.moveDragNode.data._array = is_array
    // update node attributes
    Object.keys(nodeData).map(key => {
      props.moveDragNode.data[key] = nodeData[key]
    })
    // update title
    props.moveDragNode.title = lookup_title_for_node(props.moveDragNode)
    // process expanded keys
    if (!!props.moveCallback) {
      props.moveCallback(nodeData)
    }
  }

  //////////////////////////////////////////////////////////////////////////////
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
        <form onSubmit={() => {handleSubmit(onSubmit)}}>
          <DialogTitle
            className={styles.dialog}
            disableTypography={true}
            >
            <ListItem style={{padding:0}}>
              <IconButton>
                { lookup_icon_for_type(nodeType) }
              </IconButton>
              <Typography id="alert-dialog-title" variant="h6">
                {
                  !!nodeRef
                  ? `${nodeRef} - [ ${nodeType?.replaceAll('/', ' / ')} ]`
                  : `[ ${nodeType?.replaceAll('/', ' / ')} ]`
                }
              </Typography>
            </ListItem>
          </DialogTitle>
          <DialogContent
            className={styles.dialogContent}
            >
            {
              !!parentSpec?.children.find(childSpec => childSpec.name === '*' || childSpec.name === nodeRef)
              && !!parentSpec.children.find(childSpec => childSpec.name === '*' || childSpec.name === nodeRef)?._childNode?.customs
              &&
              (
                // add custom fields from parentSpec if mandated by parent
                parentSpec.children.find(childSpec => childSpec.name === '*' || childSpec.name === nodeRef)._childNode.customs
                  .filter(custom => custom.context?.includes('move'))
                  .map(custom => {
                    // console.log(`parentSpec - customField`, customField)
                    if (!!hidden[custom.name]) {
                      return undefined
                    } else {
                      return (
                        <InputField
                          key={custom.name}
                          name={custom.name}
                          size="small"
                          className={styles.formControl}
                          disabled={!!disabled[custom.name]}
                          childSpec={custom}
                          inputSpec={custom.input}
                          defaultValue={props.moveDragNode?.data[custom.name]}
                        />
                      )
                    }
                  })
                  .filter(child => !!child)
                  .flat(2)
              )
            }
            {
              !!nodeSpec?._customs
              &&
              (
                // add custom fields from parentSpec if mandated by parent
                nodeSpec._customs
                  .filter(custom => custom.context?.includes('move'))
                  .map(custom => {
                    // console.log(`nodeSpec - customField`, customField)
                    if (!!hidden[custom.name]) {
                      return undefined
                    } else {
                      return (
                        <InputField
                          key={custom.name}
                          name={custom.name}
                          size="small"
                          className={styles.formControl}
                          disabled={!!disabled[custom.name]}
                          childSpec={custom}
                          inputSpec={custom.input}
                          defaultValue={props.moveDragNode?.data[custom.name]}
                        />
                      )
                    }
                  })
                  .filter(child => !!child)
                  .flat(2)
              )
            }
            <Controller
              key="_ref"
              name="_ref"
              control={control}
              defaultValue={props.moveDragNode?.data._ref || ''}
              rules={{
                required: "Reference name is required",
                validate: {
                  checkDuplicate: value =>
                    props.moveDropParent?.key === '/'
                    || !!(parentSpec.children?.find(child => child.name === value)?.array) // no check needed for array
                    || lookup_child_for_ref(props.moveDropParent, value) === null
                    || `Reference name [ ${value} ] is duplicate with an existing child`,
                  checkRootDuplicate: value =>
                    props.moveDropParent?.key !== '/'
                    || !treeData.find(child => child.data._ref === value)
                    || `Reference name [ ${value} ] is duplicate with an existing child`,
                  checkRootProps: value =>
                    props.moveDropParent?.key !== '/'
                    || value !== 'props'
                    || `Reference name cannot be [ props ] at root level`,
                  checkValidName: value => {
                    if (props.moveDropParent?.key === '/') {
                      return value.startsWith('...')
                        || value.match(REGEX_VAR)
                        || `Reference name must be a valid variable name`
                    }
                    const found = !parentSpec || parentSpec?.children?.find(childSpec => {
                      if (!childSpec._childNode) {
                        return false
                      } else if (childSpec.name === '*') {
                        return true
                      } else if (childSpec.name === value) {
                        return true
                      }
                    })
                    const valid_names = parentSpec?.children?.map(childSpec => {
                      if (!!childSpec._childNode && childSpec.name !== '*') {
                        return childSpec.name
                      }
                    })
                    .filter(name => !!name)
                    return !!found || `Reference name must be a valid name [ ${valid_names.join(', ')} ]`
                  },
                  checkTypeCompatibility: value => {
                    if (props.moveDropParent?.key === '/') {
                      return true
                    }
                    const found = parentSpec.children?.find(childSpec => {
                      if (!childSpec._childNode) {
                        return false
                      } else if (childSpec.name === '*') {
                        return true
                      } else if (childSpec.name === value) {
                        return true
                      }
                    })
                    if (!!found) {
                      const typeSpec = found._childNode.types === 'inherit' ? found.types : found._childNode.types
                      return type_matches_spec(getValues('_type'), typeSpec)
                        || `Reference name [ ${value} ] does not allow type [ ${getValues('_type')?.replaceAll('/', ' / ')} ]`
                    }
                  }
                },
              }}
              render={innerProps =>
                <Box
                  key="_ref"
                  className={styles.formControl}
                  >
                  <FormControl
                    disabled={!!disabled["_ref"]}
                    style={{width:'100%'}}
                    key="main"
                    >
                    <AutoSuggest
                      label="Reference"
                      name="_ref"
                      color='secondary'
                      size="small"
                      disabled={!!disabled["_ref"]}
                      required={true}
                      onChange={value => {
                        innerProps.onChange(value)
                        setNodeRef(value)
                        trigger('_ref')
                        trigger('_type')
                      }}
                      value={innerProps.value}
                      options={parentSpec?.children?.filter(spec => !!spec._childNode).map(child => child.name).filter(name => name !== '*') || []}
                      error={!!errors._ref}
                      helperText={errors._ref?.message}
                      />
                  </FormControl>
                  {
                    !!nodeRef
                    && !!props.moveDropParent?.data[nodeRef]
                    &&
                    (
                      <FormHelperText key="help" style={{color: theme.palette.info.main}}>
                        { `This will override existing [ ${nodeRef} ] defined by parent` }
                      </FormHelperText>
                    )
                  }
                </Box>
              }
            />
            <Controller
              key="_type"
              name="_type"
              control={control}
              defaultValue={nodeType}
              rules={{
                required: "Type is required",
                validate: {
                  checkTypeCompatibility: value => {
                    if (props.moveDropParent?.key === '/') {
                      return true
                    }
                    const found = parentSpec.children?.find(childSpec => {
                      if (!childSpec._childNode) {
                        return false
                      } else if (childSpec.name === '*') {
                        return true
                      } else if (childSpec.name === getValues('_ref')) {
                        return true
                      }
                    })
                    if (!!found) {
                      const typeSpec = found._childNode.types === 'inherit' ? found.types : found._childNode.types
                      return type_matches_spec(value, typeSpec)
                        || `Reference name [ ${getValues('_ref')} ] does not allow type [ ${value?.replaceAll('/', ' / ')} ]`
                    }
                  }
                }
              }}
              render={innerProps =>
                (
                  <FormControl key="_type" className={styles.formControl}>
                    <TextField
                      label="Type"
                      select={true}
                      key="_type"
                      name="_type"
                      value={innerProps.value}
                      required={true}
                      disabled={true}
                      color='secondary'
                      size="small"
                      onChange={
                        e => {
                          setNodeType(e.target.value)
                          innerProps.onChange(e)
                          trigger('_ref')
                          trigger('_type')
                        }
                      }
                      error={!!errors._type}
                      helperText={errors._type?.message}
                      >
                      {
                        lookup_groups().map(group => {
                          // const supported_types = lookup_accepted_types_for_node(props.moveDropParent)
                          const supported_types = lookup_types() // use all types
                          return lookup_types_for_group(group)
                            .map(type => {
                              if (!supported_types.includes(type)) {
                                return
                              } else {
                                return (
                                  <MenuItem value={type} key={type}>
                                    <ListItemIcon>
                                      { lookup_icon_for_type(type) }
                                    </ListItemIcon>
                                    <Typography variant="inherit" noWrap={true}>
                                      {type.replaceAll('/', ' / ')}
                                    </Typography>
                                  </MenuItem>
                                )
                              }
                            })
                            .filter(item => !!item)
                            .concat(`divider/${group}`)
                        })
                        .flat(2)
                        // remove last divider item
                        .filter((item, index, array) => !((index === array.length - 1) && (typeof item === 'string') && (item.startsWith('divider'))))
                        .map(item => {
                          // console.log(`item`, item)
                          return (typeof item === 'string' && item.startsWith('divider')) ? <Divider key={item} /> : item
                        })
                      }
                    </TextField>
                  </FormControl>
                )
              }
            />
            {
              nodeSpec?.children?.map(childSpec => {
                if (!childSpec._thisNode?.input) {
                  return undefined
                }
                if (!!hidden[childSpec.name]) {
                  return undefined
                }
                // const childThisSpec = childSpec._thisNode
                if (!!childSpec.array) {
                  return (
                    <div key={childSpec.name} style={{ display: 'none' }}>
                      <InputFieldArray
                        key={childSpec.name}
                        name={childSpec.name}
                        size="small"
                        className={styles.formControl}
                        disabled={!!disabled[childSpec.name]}
                        defaultValue={props.moveDragNode?.data[childSpec.name]}
                        childSpec={childSpec}
                        inputSpec={childSpec._thisNode.input}
                      />
                    </div>
                  )
                } else {
                  return (
                    <div key={childSpec.name} style={{ display: 'none' }}>
                      <InputField
                        key={childSpec.name}
                        name={childSpec.name}
                        size="small"
                        className={styles.formControl}
                        disabled={!!disabled[childSpec.name]}
                        defaultValue={props.moveDragNode?.data[childSpec.name]}
                        childSpec={childSpec}
                        inputSpec={childSpec._thisNode.input}
                      />
                    </div>
                  )
                }
              })
              .filter(child => !!child)
              .flat(2)
            }
          </DialogContent>
          <DialogActions>
            <Button
              key="cancel"
              variant="outlined"
              onClick={
                e => {
                  props.setOpen(false)
                }
              }
              color="secondary"
              >
              Cancel
            </Button>
            <Button
              key="move"
              variant="contained"
              onClick={
                e => {
                  if (!_.isEmpty(errors)) {
                    console.log('errors', errors)
                  }
                  handleSubmit(onSubmit)()
                }
              }
              color="secondary"
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
