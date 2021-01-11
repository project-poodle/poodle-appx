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
import AutoComplete from 'app-x/component/AutoComplete'
import TextFieldArray from 'app-x/component/TextFieldArray'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import {
  lookup_icon_for_type,
  lookup_title_for_input,
  generate_tree_node,
  reorder_children,
} from 'app-x/builder/ui/syntax/util_generate'
import {
  tree_traverse,
  tree_lookup,
  lookup_child_for_ref
} from 'app-x/builder/ui/syntax/util_parse'
import {
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
const SyntaxAddDialog = (props) => {

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
  const [ nodeType,     setNodeType     ] = useState(props.addNodeType)
  const [ nodeRef,      setNodeRef      ] = useState(props.addNodeRef)

  // parentSpec
  useEffect(() => {
    if (!props.addNodeParent?.data?._type) {
      setParentSpec(null)
    } else {
      const spec = globalThis.appx.SPEC.types[props.addNodeParent.data._type]
      console.log(`parentSpec`, spec)
      if (!spec) {
        setParentSpec(null)
      } else {
        setParentSpec(spec)
      }
    }
  }, [props.addNodeParent])

  // nodeType
  useEffect(() => {
    setNodeType(props.addNodeType)
  }, [props.addNodeType])

  // nodeRef
  useEffect(() => {
    setNodeRef(props.addNodeRef)
  }, [props.addNodeRef])

  // nodeSpec
  useEffect(() => {
    if (!nodeType) {
      setNodeSpec(null)
    } else {
      const spec = globalThis.appx.SPEC.types[nodeType]
      console.log(`nodeSpec`, spec)
      if (!spec) {
        setNodeSpec(null)
      } else {
        setNodeSpec(spec)
      }
    }
  }, [nodeType])

  // onSubmit
  const onSubmit = data => {
    try {
      console.log('data', data)
      addCallback(props.addNodeParent, data)
      props.setOpen(false)
    } catch (err) {
      console.log(err)
      notification.error({
        message: `Failed to Add [ ${nodeType.replace('/', ' / ')} ]`,
        description: String(err),
        placement: 'bottomLeft',
      })
    }
  }

  // console.log(nodeType)
  // console.log(props)

  // add callback
  const addCallback = (nodeParent, nodeData) => {
    // console.log(nodeParent, nodeData)

    // ready to add node
    const resultTree = _.cloneDeep(treeData)
    const tmpParent = tree_lookup(resultTree, nodeParent.key)
    const lookupParent = (tmpParent.data.type === '/') ? null : tmpParent
    // parent key
    let parentKey = null
    if (!!lookupParent) {
      parentKey = lookupParent.key
    }
    // ref
    const ref =
      (nodeData.type === 'react/state')
      ? !!nodeData._customRef        // special handle of 'react/state'
        ? nodeData._ref
        : `...${nodeData.name}`
      : (nodeData._ref ? nodeData._ref : null)
    // console.log(parentKey, ref, nodeData)
    const parse_context = {}
    var parsed = null
    // handle js/switch specially
    if (lookupParent?.data?._type === 'js/switch') {
      if (nodeData.default) {
        parsed = generate_tree_node(
          parse_context,
          {
            ref: 'default',
            parentKey: parentKey,
            parentChildSpec: null,
          },
          nodeData
        )
      } else {
        parsed = generate_tree_node(
          parse_context,
          {
            ref: null,
            parentKey: parentKey,
            parentChildSpec: null,
          },
          nodeData
        )
        parsed.data.condition = nodeData.condition
      }
    } else {
      // parse nodeData
      parsed = generate_tree_node(
        parse_context,
        {
          ref: ref,
          parentKey: parentKey,
          parentChildSpec: null,
        },
        nodeData
      )
    }
    // console.log(nodeRef, nodeParent, parsed)
    // insert to proper location
    if (lookupParent) {
      if (!!ref) {
        lookupParent.children.unshift(parsed)
      } else {
        if ('_pos' in nodeData) {
          let count = 0
          let found = false
          lookupParent.children.map((child, index) => {
            if (found) {
              return
            }
            if (!child.data._ref) {
              count = count+1
            }
            // check if we'd insert before first component with no _ref
            if (nodeData._pos === 0 && count !== 0) {
              found = true
              lookupParent.children.splice(index, 0, parsed)
              return
            }
            if (count >= nodeData._pos) {
              found = true
              lookupParent.children.splice(index+1, 0, parsed)
              return
            }
          })
        } else {
          // no _pos, simply add to the end
          lookupParent.children.push(parsed)
        }
      }
      reorder_children(lookupParent)
    } else {
      // add to the root as first component
      resultTree.splice(1, 0, parsed)
    }
    // console.log(parse_tree_node({topLevel: true}, resultTree))
    // process expanded keys
    const newExpandedKeys = _.cloneDeep(expandedKeys)
    parse_context.expandedKeys.map(key => {
      if (!newExpandedKeys.includes(key)) {
        newExpandedKeys.push(key)
      }
    })
    if (!!lookupParent && !newExpandedKeys.includes(lookupParent.key)) {
      newExpandedKeys.push(lookupParent.key)
    }
    // take action
    makeDesignAction(
      `Add [${parsed?.title}]`,
      resultTree,
      newExpandedKeys,
      selectedKey,
    )
  }

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
                  ? `${nodeRef} - [ ${nodeType.replace('/', ' / ')} ]`
                  : `[ ${nodeType.replace('/', ' / ')} ]`
                }
              </Typography>
            </ListItem>
          </DialogTitle>
          <DialogContent
            className={styles.dialogContent}
            >
            <Controller
              name="_ref"
              control={control}
              defaultValue={props?.addNodeRef === '*' ? '' : props?.addNodeRef}
              rules={{
                required: "Reference name is required",
                validate: {
                  checkDuplicate: value =>
                    !!(parentSpec.children?.find(child => child.name === value)?.array) // no check needed for array
                    || lookup_child_for_ref(props.addNodeParent, value) === null
                    || `Reference name [ ${value} ] is duplicate with an existing child`,
                  checkValidName: value => {
                    const found = parentSpec.children?.find(childSpec => {
                      if (!childSpec._childNode) {
                        return false
                      } else if (childSpec.name === '*') {
                        return true
                      } else if (childSpec.name === value) {
                        return true
                      }
                    })
                    const valid_names = parentSpec.children?.map(childSpec => {
                      if (!!childSpec._childNode && childSpec.name !== '*') {
                        return childSpec.name
                      }
                    })
                    .filter(name => !!name)
                    return !!found || `Reference name must be a valid name [ ${valid_names.join(', ')} ]`
                  },
                  checkTypeCompatibility: value => {
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
                      return type_matches_spec(getValues('_type'), found._childNode)
                        || `Reference name [ ${value} ] does not allow type [ ${getValues('_type')?.replace('/', ' / ')} ]`
                    }
                  }
                },
              }}
              render={innerProps =>
                <FormControl className={styles.formControl}>
                  <AutoComplete
                    label="Reference"
                    name="_ref"
                    required={true}
                    onChange={value => {
                      innerProps.onChange(value)
                      setNodeRef(value)
                      trigger('_ref')
                      trigger('_type')
                    }}
                    value={innerProps.value}
                    options={parentSpec.children?.filter(spec => !!spec._childNode?.class).map(child => child.name).filter(name => name !== '*')}
                    size="small"
                    error={!!errors._ref}
                    size="small"
                    helperText={errors._ref?.message}
                    />
                </FormControl>
              }
            />
            <Controller
              name="_type"
              control={control}
              defaultValue={nodeType}
              rules={{
                required: "Type is required",
                validate: {
                  checkTypeCompatibility: value => {
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
                      return type_matches_spec(value, found._childNode)
                        || `Reference name [ ${getValues('_ref')} ] does not allow type [ ${value?.replace('/', ' / ')} ]`
                    }
                  }
                }
              }}
              render={innerProps =>
                (
                  <FormControl className={styles.formControl}>
                    <TextField
                      label="Type"
                      select={true}
                      name="_type"
                      value={innerProps.value}
                      required={true}
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
                          const supported_types = lookup_accepted_types_for_node(props.addNodeParent)
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
                                      {type.replace('/', ' / ')}
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
                if (!childSpec._thisNode?.class) {
                  return
                }
                const childThisSpec = childSpec._thisNode
                return (
                  <Controller
                    name={childSpec.name}
                    control={control}
                    key={childSpec.name}
                    defaultValue=''
                    rules={(() => {
                      let count = 0
                      const result = { validate: {} }
                      // check optional flag
                      if (!childSpec.optional && childSpec._thisNode?.input !== 'input/switch') {
                        result['required'] = `${childSpec.desc} is required`
                      }
                      // check rules
                      if (!!childSpec.rules) {
                        childSpec.rules.map(rule => {
                          if (rule.kind === 'required') {
                            result['required'] = rule.message
                          } else if (rule.kind === 'pattern') {
                            result['pattern'] = {
                              value: rule.pattern,
                              message: rule.message,
                            }
                          } else if (rule.kind === 'validate') {
                            result.validate[`validate_${count++}`] = (value) => (
                              !!eval(rule.validate) || rule.message
                            )
                          }
                        })
                      }
                      // check _thisNode.rules
                      if (!!childSpec._thisNode?.rules) {
                        childSpec._thisNode.rules.map(rule => {
                          if (rule.kind === 'required') {
                            result['required'] = rule.message
                          } else if (rule.kind === 'pattern') {
                            result['pattern'] = {
                              value: rule.pattern,
                              message: rule.message,
                            }
                          } else if (rule.kind === 'validate') {
                            result.validate[`validate_${count++}`] = (value) => (
                              !!eval(rule.validate) || rule.message
                            )
                          }
                        })
                      }
                      // additional rules by input type
                      console.log(`childSpec._thisNode.input`, childSpec._thisNode.input)
                      if (childSpec._thisNode.input === 'input/number') {
                        result.validate[`validate_${count++}`] = (value) => {
                          return !isNaN(Number(value)) || "Must be a number"
                        }
                      } else if (childSpec._thisNode.input === 'input/expression') {
                        result.validate[`validate_${count++}`] = (value) => {
                          try {
                            parseExpression(String(value))
                            return true
                          } catch (err) {
                            return String(err)
                          }
                        }
                      } else if (childSpec._thisNode.input === 'input/statement') {
                        result.validate[`validate_${count++}`] = (value) => {
                          try {
                            parse(value, {
                              allowReturnOutsideFunction: true, // allow return in the block statement
                            })
                            return true
                          } catch (err) {
                            return String(err)
                          }
                        }
                      }
                      // return all rules
                      return result
                    })()}
                    render={innerProps =>
                      {
                        if (childSpec._thisNode.input === 'input/switch') {
                          return (
                            <FormControl
                              className={styles.formControl}
                              error={!!_.get(errors, childSpec.name)}
                              >
                              <FormHelperText>{childSpec.desc}</FormHelperText>
                              <Switch
                                name={childSpec.name}
                                checked={innerProps.value}
                                onChange={e => innerProps.onChange(e.target.checked)}
                              />
                              {
                                !!_.get(errors, childSpec.name)
                                &&
                                <FormHelperText>{_.get(errors, childSpec.name)?.message}</FormHelperText>
                              }
                            </FormControl>
                          )
                        } else {
                          return (
                            <FormControl className={styles.formControl}>
                              <TextField
                                label={childSpec.desc}
                                name={childSpec.name}
                                value={innerProps.value}
                                required={!childSpec.optional}
                                multiline={
                                  childSpec._thisNode.input === 'input/expression'
                                  || childSpec._thisNode.input === 'input/statement'
                                }
                                size="small"
                                onChange={innerProps.onChange}
                                error={!!_.get(errors, childSpec.name)}
                                helperText={_.get(errors, childSpec.name)?.message}
                                />
                            </FormControl>
                          )
                        }
                      }
                    }
                  />
                )
              })
              .flat(2)
            }

                  {
                    /*
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
                                name={props.name}
                                value={props.value}
                                size="small"
                                onChange={props.onChange}
                                error={!!errors.data}
                                helperText={errors.data?.message}
                                />
                            </FormControl>
                          )
                        }
                      />
                    )
                    */
                  }
                  {
                    /*
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
                              <Switch
                                name={props.name}
                                checked={props.value}
                                onChange={e => props.onChange(e.target.checked)}
                              />
                            </FormControl>
                          )
                        }
                      />
                    )
                    */
                  }
                  {
                    /*
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
                                parseExpression(String(value))
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
                                  name={props.name}
                                  value={props.value}
                                  size="small"
                                  onChange={props.onChange}
                                  error={!!errors.data}
                                  helperText={errors.data?.message}
                                  />
                            </FormControl>
                          )
                        }
                      />
                    )
                    */
                  }
            {
              /*
              (!!nodeType && nodeType == 'js/array')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'js/object')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'js/import')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
                      validate: {
                        valid_name: value => (
                          valid_import_names().includes(value)
                          || "Must use a valid name"
                        )
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <AutoComplete
                            label="Import Name"
                            name="name"
                            value={props.value}
                            onChange={props.onChange}
                            size="small"
                            options={valid_import_names()}
                          />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'js/statement')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
                            >
                            <MenuItem value="js/statement">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/statement') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/statement
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="body"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Code body is required",
                      validate: {
                        validSyntax: value => {
                          try {
                            parse(value, {
                              allowReturnOutsideFunction: true, // allow return in the block statement
                            })
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
                            label="Code Body"
                            multiline={true}
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.data}
                            helperText={errors.data?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'js/function')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            error={!!errors._type}
                            size="small"
                            helperText={errors._type?.message}
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
                  <TextFieldArray
                    key="params"
                    name="params"
                    label="Parameters"
                    type="text"
                    defaultValues={[]}
                    className={styles.formControl}
                    rules={{
                      required: "Parameter is required",
                      pattern: {
                        value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                        message: "Parameter name must be valid variable name",
                      }
                    }}
                    />
                  <Controller
                    key="body"
                    name="body"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Function body is required",
                      validate: {
                        validSyntax: value => {
                          try {
                            parse(value, {
                              allowReturnOutsideFunction: true, // allow return in the block statement
                            })
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
                            size="small"
                            error={!!errors.body}
                            helperText={errors.body?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'js/switch')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'js/map')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'js/reduce')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
                            parseExpression(String(value))
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
                            size="small"
                            error={!!errors.reducer}
                            helperText={errors.reducer?.message}
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
                      required: 'Initial value required',
                      validate: {
                        validSyntax: value => {
                          if (value) {
                            try {
                              parseExpression(String(value))
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
                            size="small"
                            error={!!errors.init}
                            helperText={errors.init?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'js/filter')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
                            parseExpression(String(value))
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
                            size="small"
                            error={!!errors.filter}
                            helperText={errors.filter?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
              */
            }
            {
              /*
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
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
                        validate: {
                          valid_name: value => (
                            valid_import_names().includes(value)
                            || "Must use a valid name"
                          )
                        }
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <AutoComplete
                              label="Element Name"
                              name="name"
                              value={props.value}
                              onChange={props.onChange}
                              size="small"
                              options={valid_import_names()}
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
                            <AutoComplete
                              label="HTML Tag"
                              name="name"
                              value={props.value}
                              onChange={props.onChange}
                              size="small"
                              options={valid_html_tags()}
                            />
                          </FormControl>
                        )
                      }
                    />
                  }
                </Box>
              )
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'react/state')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
                            size="small"
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
                            size="small"
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
                              parseExpression(String(value))
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
                            size="small"
                            error={!!errors.init}
                            helperText={errors.init?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'react/context')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
                            >
                            <MenuItem value="react/context">
                              <ListItemIcon>
                                { lookup_icon_for_type('react/context') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                react/context
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
                      required: "Context name is required",
                      validate: {
                        valid_name: value => (
                          valid_import_names().includes(value)
                          || "Must use a valid name"
                        )
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <AutoComplete
                            label="Context Name"
                            name="name"
                            value={props.value}
                            onChange={props.onChange}
                            size="small"
                            options={valid_import_names()}
                          />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'react/effect')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
                      required: "Effect code is required",
                      validate: {
                        validSyntax: value => {
                          if (value) {
                            try {
                              parse(value, {
                                allowReturnOutsideFunction: true, // allow return in the block statement
                              })
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
                            size="small"
                            error={!!errors.data}
                            helperText={errors.data?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <TextFieldArray
                    key="states"
                    name="states"
                    label="States"
                    type="text"
                    defaultValues={[]}
                    className={styles.formControl}
                    rules={{
                      required: "State expression is required",
                      validate: {
                        validSyntax: value => {
                          try {
                            parseExpression(String(value))
                            return true
                          } catch (err) {
                            return String(err)
                          }
                        }
                      }
                    }}
                    />
                </Box>
              )
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'react/form')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
                            >
                            <MenuItem value="react/form">
                              <ListItemIcon>
                                { lookup_icon_for_type('react/form') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                react/form
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
                      required: "Form name is required",
                      pattern: {
                        value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                        message: "Form name must be valid variable name"
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Form Name"
                            onChange={props.onChange}
                            size="small"
                            value={props.value}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="onSubmit"
                    control={control}
                    defaultValue=''
                    rules={{
                      validate: {
                        validSyntax: value => {
                          if (value) {
                            try {
                              parseExpression(String(value))
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
                            label="onSubmit"
                            multiline={true}
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.onSubmit}
                            helperText={errors.onSubmit?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="onError"
                    control={control}
                    defaultValue=''
                    rules={{
                      validate: {
                        validSyntax: value => {
                          if (value) {
                            try {
                              parseExpression(String(value))
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
                            label="onError"
                            multiline={true}
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.onError}
                            helperText={errors.onError?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'input/text')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
                            >
                            <MenuItem value="input/text">
                              <ListItemIcon>
                                { lookup_icon_for_type('input/text') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                input/text
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
                      required: "Input name is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Input Name"
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="array"
                    control={control}
                    defaultValue={false}
                    render={props =>
                      (
                        <FormControl
                          className={styles.formControl}
                          error={!!errors.array}
                          >
                          <FormHelperText>Is Array</FormHelperText>
                          <Switch
                            name={props.name}
                            checked={props.value}
                            onChange={e => {
                              props.onChange(e.target.checked)
                            }}
                          />
                          {
                            !!errors.array
                            &&
                            <FormHelperText>{errors.array?.message}</FormHelperText>
                          }
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'mui/style')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'appx/api')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
                            >
                            <MenuItem value="appx/api">
                              <ListItemIcon>
                                { lookup_icon_for_type('appx/api') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                appx/api
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="namespace"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Namespace is required",
                      pattern: {
                        value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                        message: "Namespace must be valid variable name"
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Namespace"
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.namespace}
                            helperText={errors.namespace?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="app_name"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "App name is required",
                      pattern: {
                        value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                        message: "App name must be valid variable name"
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="App Name"
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.app_name}
                            helperText={errors.app_name?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="method"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Method is required",
                      validate: {
                        validMethod: value =>
                          valid_api_methods().includes(value)
                          || "Must be a valid method"
                      },
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Method"
                            select={true}
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.method}
                            helperText={errors.method?.message}
                            >
                            {
                              valid_api_methods().map(method => (
                                <MenuItem key={method} value={method}>
                                  { method.toUpperCase() }
                                </MenuItem>
                              ))
                            }
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="endpoint"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Endpoint is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Endpoint"
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.endpoint}
                            helperText={errors.endpoint?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="prep"
                    control={control}
                    defaultValue=''
                    rules={{
                      validate: {
                        syntax: value => {
                          try {
                            parse(String(value))
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
                            label="Init Code"
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.prep}
                            helperText={errors.prep?.message}
                            />
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
                        syntax: value => {
                          try {
                            parseExpression(String(value))
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
                            label="Data"
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.data}
                            helperText={errors.data?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="result"
                    control={control}
                    defaultValue=''
                    rules={{
                      validate: {
                        syntax: value => {
                          try {
                            parse(String(value))
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
                            label="Result Handler"
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.result}
                            helperText={errors.result?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="error"
                    control={control}
                    defaultValue=''
                    rules={{
                      validate: {
                        syntax: value => {
                          try {
                            parse(String(value))
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
                            label="Error Handler"
                            onChange={props.onChange}
                            value={props.value}
                            size="small"
                            error={!!errors.error}
                            helperText={errors.error?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
              */
            }
            {
              /*
              (!!nodeType && nodeType == 'appx/route')
              &&
              (
                <Box>
                  <Controller
                    name="_type"
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
                            size="small"
                            error={!!errors._type}
                            helperText={errors._type?.message}
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
              */
            }
            {
              /*
              (
                !!props.addNodeParent?.children
                && props.addNodeParent?.children.filter(child => child.data._ref === null).length > 0
              )
              &&
              (
                <Controller
                  name="_pos"
                  control={control}
                  defaultValue={0}
                  render={props =>
                    (
                      <FormControl className={styles.formControl}>
                        <TextField
                          label="Position"
                          select={true}
                          name={props.name}
                          value={props.value}
                          size="small"
                          onChange={props.onChange}
                          error={!!errors._pos}
                          helperText={errors._pos?.message}
                          >
                          <MenuItem
                            key={0}
                            value={0}
                            >
                            <ListItemIcon>
                              <PlusOutlined />
                            </ListItemIcon>
                            <Typography variant="inherit" noWrap={true}>
                              Add at Beginning
                            </Typography>
                          </MenuItem>
                          {
                            props.addNodeParent.children.filter(child => child.data?._ref === null).map((child, index) => (
                              <MenuItem
                                key={`${index+1}`}
                                value={index+1}
                                >
                                <ListItemIcon>
                                  { lookup_icon_for_type(child.data?._type) }
                                </ListItemIcon>
                                <Typography variant="inherit" noWrap={true}>
                                  Add after [{ lookup_title_for_input(null, child.data) }]
                                </Typography>
                              </MenuItem>
                            ))
                          }
                        </TextField>
                      </FormControl>
                    )
                  }
                />
              )
              */
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
      </FormProvider>
    </Dialog>
  )
}

export default SyntaxAddDialog
