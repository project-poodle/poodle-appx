import React, { useState, useContext, useEffect } from "react"
import YAML from 'yaml'
import _ from 'lodash'
// material ui
import {
  Box,
  Container,
  Grid,
  ListItemIcon,
  Typography,
  FormControl,
  InputLabel,
  FormHelperText,
  FormControlLabel,
  Switch,
  Select,
  Input,
  TextField,
  MenuItem,
  makeStyles
} from '@material-ui/core'
// ant design
import {
  Tabs,
} from 'antd'
const { TabPane } = Tabs;
import { useForm, FormProvider, Controller } from "react-hook-form"
import { parse, parseExpression } from "@babel/parser"
// context provider
import Asterisk from 'app-x/icon/Asterisk'
import AutoComplete from 'app-x/component/AutoComplete'
import TextFieldArray from 'app-x/component/TextFieldArray'
import PropFieldArray from 'app-x/component/PropFieldArray'
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import YamlEditor from 'app-x/builder/ui/syntax/YamlEditor'
// utilities
import {
  generate_tree_node,
  lookup_icon_for_type,
  lookup_icon_for_input,
  lookup_title_for_input,
  valid_api_methods,
  valid_import_names,
  valid_html_tags,
  reorder_children,
} from 'app-x/builder/ui/syntax/util_generate'
import {
  tree_traverse,
  tree_lookup,
  lookup_child_by_ref,
  remove_child_by_ref,
  gen_js,
} from 'app-x/builder/ui/syntax/util_parse'

let pendingTimer = new Date()

const PropEditor = (props) => {
  // make styles
  const styles = makeStyles((theme) => ({
    root: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    formControl: {
      width: '100%',
      // margin: theme.spacing(1),
      padding: theme.spacing(2, 2, 2, 2),
    },
    editor: {
      width: '100%',
      height: '100%',
    },
    tabs: {
      margin: theme.spacing(1, 1),
    },
    basicTab: {
      width: '100%',
      height: '100%',
      overflow: 'scroll',
    },
    asterisk: {
      color: theme.palette.error.light,
    },
    properties: {
      width: '100%',
      margin: theme.spacing(2, 0),
      padding: theme.spacing(0, 0),
      // border
      border: 1,
      borderLeft: 0,
      borderRight: 0,
      borderBottom: 0,
      borderStyle: 'dotted',
      borderColor: theme.palette.divider,
    },
  }))()

  // nav context
  const {
    navDeployment,
    navComponent,
    navRoute,
    navSelected,
  } = useContext(NavProvider.Context)

  // context
  const {
    // tree data
    treeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
    // test data
    testData,
    // dirt flags
    propBaseDirty,
    setPropBaseDirty,
    propYamlDirty,
    setPropYamlDirty,
    // update action
    updateDesignAction,
  } = useContext(SyntaxProvider.Context)

  const [ nodeType,             setNodeType             ] = useState('')
  const [ treeNode,             setTreeNode             ] = useState(null)
  const [ parentNode,           setParentNode           ] = useState(null)
  const [ isSwitchDefault,      setSwitchDefault        ] = useState(props.isSwitchDefault)

  // react hook form
  const hookForm = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
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

  // watch _customRef
  const watch_customRef = watch('_customRef')
  useEffect(() => {
    if (treeNode?.data?._type === 'react/state') {
      if (!!watch_customRef) {
        if (!getValues(`_ref`)) {
          setValue(`_ref`, `${getValues('name')}`)
        }
      } else if (!watch_customRef) {
        setValue(`_ref`, `...${getValues('name')}`)
      }
    }
  }, [watch_customRef])

  useEffect(() => {
    // check validity
    if
    (
      !!navDeployment.namespace
      && !!navDeployment.ui_name
      && !!navDeployment.ui_ver
      && !! navDeployment.ui_deployment
      && !! navSelected.type
      &&
      (
        (
          navSelected.type === 'ui_component'
          && !!navComponent.ui_component_name
          && !!navComponent.ui_component_type
        )
        ||
        (
          navSelected.type === 'ui_route'
          && !!navRoute.ui_route_name
        )
      )
    )
    {
      // lookup node
      const lookupNode = tree_lookup(treeData, selectedKey)
      const lookupParent = !!lookupNode ? tree_lookup(treeData, lookupNode.parentKey) : null
      setTreeNode(_.cloneDeep(lookupNode))
      setParentNode(_.cloneDeep(lookupParent))
      // console.log(lookupNode)
      // console.log(parentNode)
      if (lookupNode) {
        setNodeType(lookupNode.data._type)
      }
      console.log(`lookupNode`, lookupNode)
    }
    else
    {
      setTreeNode(null)
      setParentNode(null)
    }
  },
  [
    navDeployment.namespace,
    navDeployment.ui_name,
    navDeployment.ui_ver,
    navDeployment.ui_deployment,
    navSelected.type,
    navComponent.ui_component_name,
    navComponent.ui_component_type,
    navRoute.ui_route_name,
    selectedKey
  ])

  // setValue when treeNode change
  useEffect(() => {
    if (!!treeNode) {
      setNodeType(treeNode.data._type)
      Object.keys(treeNode.data).map(k => {
        if (!!k) {
          // console.log(`setValue`, k, treeNode.data[k])
          setValue(k, treeNode.data[k])
        }
      })
      if (treeNode.data._type === 'react/state') {
        // console.log(`_customRef`, treeNode, !!treeNode.data._ref && !treeNode.data._ref.startsWith('...'))
        setValue('_customRef',
          !!treeNode.data._ref
          && !treeNode.data._ref.startsWith('...'))
      }
      // set properties
      if
      (
        treeNode.data._type === 'js/object'
        || treeNode.data._type === 'react/element'
        || treeNode.data._type === 'react/html'
        || treeNode.data._type === 'react/form'
        || treeNode.data._type === 'input/text'
      )
      {
        _set_form_props(treeNode, 'props')
      }
      // set form properties
      if
      (
        treeNode.data._type === 'react/form'
      )
      {
        _set_form_props(treeNode, 'formProps')
      }
      // just loaded, set dirty to false
      setPropBaseDirty(false)
    }
  },
  [
    treeNode,
    parentNode,
  ])

  // base submit timer
  const [ baseSubmitTimer,  setBaseSubmitTimer  ] = useState(new Date())
  useEffect(() => {
    setPropBaseDirty(true)
    pendingTimer = baseSubmitTimer
    setTimeout(() => {
      const timeDiff = (new Date()).getTime() - pendingTimer.getTime()
      if (timeDiff < 500) {
        return  // do not process, just return
      } else {
        handleSubmit(onBaseSubmit)()
      }
    }, 550)
  }, [baseSubmitTimer])

  // submit base tab
  function onBaseSubmit(data) {
    const resultTree = _.cloneDeep(treeData)
    const lookupNode = tree_lookup(resultTree, selectedKey)
    if (!lookupNode) {
      setPropBaseDirty(false)
      return
    }

    // console.log(data)
    const preservedRef = lookupNode.data._ref
    lookupNode.data = data
    if (!!data._ref) {
      lookupNode.data._ref = data._ref
    } else if (!!preservedRef) { // preserve lookupNode.data._ref is exist
      lookupNode.data._ref = preservedRef
    } else {
      lookupNode.data._ref = null
    }
    // check if lookupNode is react/state, and _customRef is false
    if (lookupNode.data._type === 'react/state') {
      if (!data._customRef) {
        lookupNode.data._ref = `...${lookupNode.data.name}`
      }
    }
    // check if parent is js/switch
    const lookupParent = tree_lookup(resultTree, lookupNode.parentKey)
    if (lookupParent?.data?._type === 'js/switch') {
      if (!!data.default) {
        lookupNode.data._ref = 'default'
      } else {
        lookupNode.data._ref = null
        lookupNode.data._condition = data._condition
      }
    }
    // update lookup node title and icon
    lookupNode.title = lookup_title_for_input(lookupNode.data._ref, data)
    lookupNode.icon = lookup_icon_for_input(data)
    // console.log(lookupNode)
    //////////////////////////////////////////////////////////////////////
    // handle 'props'
    if (lookupNode.data._type === 'js/object'
        || lookupNode.data._type === 'react/element'
        || lookupNode.data._type === 'react/html'
        || lookupNode.data._type === 'react/form'
        || lookupNode.data._type === 'input/text')
    {
      _process_props(lookupNode, 'props')
    }
    // handle 'formProps'
    if (lookupNode.data._type === 'react/form')
    {
      _process_props(lookupNode, 'formProps')
    }
    // setTreeData(resultTree)
    updateDesignAction(
      `Update [${lookupNode.title}]`,
      resultTree,
      expandedKeys,
      selectedKey,
      lookupNode.key,
    )
    // set base dirty falg to false
    setPropBaseDirty(false)
  }

  ////////////////////////////////////////////////////////////////////////////////
  // private utilities
  // set form props for refKey
  function _set_form_props(treeNode, refKey) {
    // get proper children
    const children =
      treeNode.data._type === 'js/object'
      ? treeNode.children
      : lookup_child_by_ref(treeNode, refKey)?.children
    // keep a list of props and other names
    const props = []
    const others = []
    children?.map(child => {
      if (child.data._type === 'js/null')
      {
        props.push({
          _type: child.data._type,
          name: child.data._ref,
          value: null,
        })
      }
      else if
      (
        child.data._type === 'js/string'
        || child.data._type === 'js/number'
        || child.data._type === 'js/boolean'
        || child.data._type === 'js/expression'
      ) {
        props.push({
          _type: child.data._type,
          name: child.data._ref,
          value: child.data.data,
        })
      }
      else if (child.data._type === 'js/import')
      {
        props.push({
          _type: child.data._type,
          name: child.data._ref,
          value: child.data.name,
        })
      }
      else
      {
        others.push(child.data._ref)
      }
    })
    // console.log(`setProperties`, props, others)
    setValue(`__${refKey}`, props)
    setValue(`__${refKey}_otherNames`, others)
  }

  // process props for childParent
  function _process_childParent_props(childParent, properties) {
    // console.log(`properties`, properties)
    properties.map(child => {
      const childNode = lookup_child_by_ref(childParent, child.name)
      if (!!childNode)
      {
        // found child node, reuse existing key
        if (child._type === 'js/null')
        {
          childNode.data._ref = child.name
          childNode.data._type = child._type
          childNode.data.data = null
          childNode.title = lookup_title_for_input(child.name, childNode.data)
          childNode.icon = lookup_icon_for_input(childNode.data)
        }
        else if (child._type === 'js/string'
                || child._type === 'js/number'
                || child._type === 'js/boolean'
                || child._type === 'js/expression')
        {
          childNode.data._ref = child.name
          childNode.data._type = child._type
          childNode.data.data = child.value
          childNode.title = lookup_title_for_input(child.name, childNode.data)
          childNode.icon = lookup_icon_for_input(childNode.data)
        }
        else if (child._type === 'js/import')
        {
          childNode.data._ref = child.name
          childNode.data._type = child._type
          childNode.data.name = child.value
          childNode.title = lookup_title_for_input(child.name, childNode.data)
          childNode.icon = lookup_icon_for_input(childNode.data)
        }
        else
        {
          throw new Error(`ERROR: unrecognized child type [${child._type}]`)
        }
      }
      else
      {
        // no child node, create new child node
        if (child._type === 'js/null'
            || child._type === 'js/string'
            || child._type === 'js/number'
            || child._type === 'js/boolean')
        {
          const newChildNode = generate_tree_node({}, childParent.key, child.name, {_type: child._type, data: child.value})
          childParent.children.push(newChildNode)
          // update child title and icon
          newChildNode.title = lookup_title_for_input(child.name, newChildNode.data)
          newChildNode.icon = lookup_icon_for_input(newChildNode.data)
        }
        else if (child._type === 'js/expression')
        {
          const newChildNode = generate_tree_node({}, childParent.key, child.name, {_type: 'js/expression', data: child.value})
          childParent.children.push(newChildNode)
          // update child title and icon
          newChildNode.title = lookup_title_for_input(child.name, newChildNode.data)
          newChildNode.icon = lookup_icon_for_input(newChildNode.data)
        }
        else if (child._type === 'js/import')
        {
          const newChildNode = generate_tree_node({}, childParent.key, child.name, {_type: 'js/import', name: child.value})
          childParent.children.push(newChildNode)
          // update child title and icon
          newChildNode.title = lookup_title_for_input(child.name, newChildNode.data)
          newChildNode.icon = lookup_icon_for_input(newChildNode.data)
        }
        else
        {
          throw new Error(`ERROR: unrecognized child type [${child._type}]`)
        }
      }
    })
    ////////////////////////////////////////
    // remove any primitive child
    childParent.children = childParent.children.filter(child => {
      if (child.data._type === 'js/null'
          || child.data._type === 'js/string'
          || child.data._type === 'js/number'
          || child.data._type === 'js/boolean'
          || child.data._type === 'js/expression'
          || child.data._type === 'js/import')
      {
        const found = properties.find(prop => prop.name === child.data._ref)
        return found
      }
      else
      {
        return true
      }
    })
  }

  // process props
  function _process_props(lookupNode, refKey) {
    // add props child if exist
    if (lookupNode.data._type !== 'js/object')
    {
      const propChild = lookup_child_by_ref(lookupNode, refKey)
      if (!propChild) {
        // add props if not exist
        lookupNode.children.push(generate_tree_node({}, lookupNode.key, refKey, {}))
      }
    }
    // lookup childParent node
    const childParent =
      lookupNode.data._type === 'js/object'
      ? lookupNode
      : lookup_child_by_ref(lookupNode, refKey)
    // add child properties as proper childNode (replace existing or add new)
    const properties = _.get(getValues(), `__${refKey}`) || []
    // process childParent props
    _process_childParent_props(childParent, properties)
    ////////////////////////////////////////
    // if lookupNode is react/element or react/html, remove empty props
    if (lookupNode.data._type !== 'js/object')
    {
      if (!childParent.children.length) {
        remove_child_by_ref(lookupNode, refKey)
      }
    }
    // reorder children
    reorder_children(childParent)
    reorder_children(lookupNode)
  }
  ////////////////////////////////////////////////////////////////////////////////

  // render
  return (
    <FormProvider {...hookForm}>
      <form onSubmit={() => {handleSubmit(onBaseSubmit)}} className={styles.root}>
      {
        (!treeNode)
        &&
        (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            className={styles.root}
            >
            <Typography variant="body2">
                 Select a syntax element
            </Typography>
          </Box>
        )
      }
      {
        (treeNode)
        &&
        (
          <Tabs
            defaultActiveKey="basic"
            className={styles.editor}
            tabPosition="bottom"
            size="small"
            tabBarExtraContent={{
              left:
                <Box className={styles.tabs}>
                </Box>
            }}
            >
            <TabPane
              tab={
                <span>
                  Base
                  {
                    !!propBaseDirty
                    &&
                    (
                      <Asterisk className={styles.asterisk}>
                      </Asterisk>
                    )
                  }
                </span>
              }
              key="basic"
              className={styles.basicTab}
              >
              <Box className={styles.editor}>
              {
                (
                  treeNode?.data?._type === 'react/state'
                )
                &&
                (
                  <Controller
                    control={control}
                    key='_customRef'
                    name='_customRef'
                    type="boolean"
                    defaultValue={!treeNode?.data?._ref?.startsWith('...')}
                    render={props =>
                      (
                        <FormControl
                          className={styles.formControl}
                          error={!!errors._customRef}
                          >
                          <FormHelperText>Custom Reference</FormHelperText>
                          <Switch
                            name={props.name}
                            checked={props.value}
                            onChange={e => {
                              props.onChange(e.target.checked)
                              setBaseSubmitTimer(new Date())
                            }}
                          />
                          {
                            !!errors._customRef
                            &&
                            <FormHelperText>{errors._customRef?.message}</FormHelperText>
                          }
                        </FormControl>
                      )
                    }
                  />
                )
              }
              {
                (
                  treeNode?.data?._ref !== null
                  && parentNode?.data?._type !== 'js/switch'
                  && parentNode?.data?._type !== 'js/map'
                  && parentNode?.data?._type !== 'js/reduce'
                  && parentNode?.data?._type !== 'js/filter'
                  && parentNode?.data?._type !== 'react/element'
                  && parentNode?.data?._type !== 'react/html'
                  && !
                  (
                    (treeNode?.data?._type === 'react/state')
                    && !getValues('_customRef')
                  )
                )
                &&
                (
                  <Controller
                    name="_ref"
                    control={control}
                    defaultValue={treeNode?.data?._ref}
                    rules={{
                      required: 'Reference name is required',
                      pattern: {
                        value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                        message: 'Reference name must be a valid variable name',
                      },
                      validate: {
                        checkDuplicate: value => {
                          if (!value) {
                            return true
                          } else if (!parentNode) {
                            return true
                          } else if (!parentNode.children) {
                            return true
                          }
                          // check if any children matches current key
                          const found = parentNode.children
                            // filter out current node
                            .filter(child => child.key !== treeNode.key)
                            // check if child node matches current key
                            .reduce(
                              (result, item) => {
                                return result || item.data._ref === treeNode?.data?._ref
                              },
                              false
                            )
                          // not found, or error
                          return !found
                            || `Duplicate reference name [${treeNode?.data?._ref}]`
                        }
                      },
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Reference"
                            name={props.name}
                            value={props.value}
                            size="small"
                            onChange={ e => {
                              props.onChange(e.target.value)
                              setBaseSubmitTimer(new Date())
                            }}
                            error={!!errors._ref}
                            helperText={errors._ref?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                )
              }
              {
                parentNode?.data?._type === 'js/switch'
                &&
                (
                  <Controller
                    name="default"
                    type="boolean"
                    control={control}
                    defaultValue={treeNode?.data?._ref === 'default'}
                    rules={{
                      validate: {
                      },
                    }}
                    render={props =>
                      (
                        <FormControl
                          className={styles.formControl}
                          error={!!errors.default}
                          >
                          <FormHelperText>Is Default</FormHelperText>
                          <Switch
                            name={props.name}
                            checked={props.value}
                            onChange={e => {
                              props.onChange(e.target.checked)
                              setSwitchDefault(e.target.checked)
                              setBaseSubmitTimer(new Date())
                            }}
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
                parentNode?.data?._type === 'js/switch'
                && !isSwitchDefault
                &&
                (
                  <Controller
                    name="_condition"
                    control={control}
                    defaultValue={treeNode?.data?._condition}
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
                          name={props.name}
                          value={props.value}
                          size="small"
                          onChange={e => {
                            props.onChange(e.target.value)
                            setBaseSubmitTimer(new Date())
                          }}
                          error={!!errors._condition}
                          helperText={errors._condition?.message}
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
                    nodeType === 'js/string'
                    || nodeType === 'js/number'
                    || nodeType === 'js/boolean'
                    || nodeType === 'js/null'
                    || nodeType === 'js/expression'
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
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                          defaultValue={treeNode?.data?.data}
                          rules={{
                            required: "String value is required",
                          }}
                          render={props =>
                            (
                              <FormControl className={styles.formControl}>
                                <TextField
                                  label="String"
                                  multiline={false}
                                  name={props.name}
                                  value={props.value}
                                  size="small"
                                  onChange={ e => {
                                    props.onChange(e.target.value)
                                    setBaseSubmitTimer(new Date())
                                  }}
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
                          defaultValue={treeNode?.data?.data}
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
                                  onChange={ e => {
                                    props.onChange(e.target.value)
                                    setBaseSubmitTimer(new Date())
                                  }}
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
                          defaultValue={!!treeNode?.data?.data}
                          render={props =>
                            (
                              <FormControl className={styles.formControl}>
                                <FormHelperText>Boolean</FormHelperText>
                                <Switch
                                  name={props.name}
                                  checked={props.value}
                                  onChange={ e => {
                                    props.onChange(e.target.checked)
                                    setBaseSubmitTimer(new Date())
                                  }}
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
                          defaultValue={treeNode?.data?.data}
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
                                    onChange={ e => {
                                      props.onChange(e.target.value)
                                      setBaseSubmitTimer(new Date())
                                    }}
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
                (treeNode && treeNode.data && nodeType === 'js/array')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                (treeNode && treeNode.data && nodeType === 'js/object')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                (treeNode && treeNode.data && nodeType === 'A')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.name}
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
                              callback={data => {
                                setBaseSubmitTimer(new Date())
                              }}
                            />
                          </FormControl>
                        )
                      }
                    />
                  </Box>
                )
              }
              {
                (treeNode && treeNode.data && nodeType === 'js/statement')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.data}
                      rules={{
                        required: "Code is required",
                        validate: {
                          expressionSyntax: value => {
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
                                name={props.name}
                                value={props.value}
                                size="small"
                                onChange={ e => {
                                  props.onChange(e.target.value)
                                  setBaseSubmitTimer(new Date())
                                }}
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
                (treeNode && treeNode.data && nodeType === 'js/function')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.params}
                      className={styles.formControl}
                      rules={{
                        required: "Parameter is required",
                        pattern: {
                          value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                          message: "Parameter name must be valid variable name",
                        }
                      }}
                      callback={() => {
                        setBaseSubmitTimer(new Date())
                      }}
                    />
                    <Controller
                      name="body"
                      control={control}
                      defaultValue={treeNode?.data?.body}
                      rules={{
                        required: "Body is required",
                        validate: {
                          expressionSyntax: value => {
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
                                name={props.name}
                                value={props.value}
                                size="small"
                                onChange={ e => {
                                  props.onChange(e.target.value)
                                  setBaseSubmitTimer(new Date())
                                }}
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
                (treeNode && treeNode.data && nodeType === 'js/switch')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                (treeNode && treeNode.data && nodeType === 'js/map')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                (treeNode && treeNode.data && nodeType === 'js/reduce')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.reducer}
                      rules={{
                        required: "Reducer is required",
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
                                label="Reducer"
                                multiline={true}
                                name={props.name}
                                value={props.value}
                                size="small"
                                onChange={ e => {
                                  props.onChange(e.target.value)
                                  setBaseSubmitTimer(new Date())
                                }}
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
                      defaultValue={treeNode?.data?.init}
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
              }
              {
                (treeNode && treeNode.data && nodeType === 'js/filter')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.filter}
                      rules={{
                        required: "Filter is required",
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
                                label="Filter"
                                multiline={true}
                                name={props.name}
                                value={props.value}
                                size="small"
                                onChange={ e => {
                                  props.onChange(e.target.value)
                                  setBaseSubmitTimer(new Date())
                                }}
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
                (treeNode && treeNode.data
                  &&
                  (
                    nodeType === 'react/element'
                    || nodeType === 'react/html'
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
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                        defaultValue={treeNode?.data?.name}
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
                                callback={data => {
                                  setBaseSubmitTimer(new Date())
                                }}
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
                        defaultValue={treeNode?.data?.name}
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
                                callback={data => {
                                  setBaseSubmitTimer(new Date())
                                }}
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
                (treeNode && treeNode.data && nodeType === 'react/state')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.name}
                      rules={{
                        required: "Name is required",
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                              <TextField
                                label="Name"
                                name={props.name}
                                value={props.value}
                                size="small"
                                onChange={ e => {
                                  props.onChange(e.target.value)
                                  setBaseSubmitTimer(new Date())
                                }}
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
                      defaultValue={treeNode?.data?.setter}
                      rules={{
                        required: "Setter is required",
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                              <TextField
                                label="Setter"
                                name={props.name}
                                value={props.value}
                                size="small"
                                onChange={ e => {
                                  props.onChange(e.target.value)
                                  setBaseSubmitTimer(new Date())
                                }}
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
                      defaultValue={treeNode?.data?.init}
                      rules={{
                        validate: {
                          validSyntax: value => {
                            if (!value) {
                              return true
                            }
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
                              label="Initial Value"
                              multiline={true}
                              name={props.name}
                              value={props.value}
                              size="small"
                              onChange={ e => {
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                (treeNode && treeNode.data && nodeType === 'react/context')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.name}
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
                              callback={data => {
                                setBaseSubmitTimer(new Date())
                              }}
                            />
                          </FormControl>
                        )
                      }
                    />
                  </Box>
                )
              }
              {
                (treeNode && treeNode.data && nodeType === 'react/effect')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.data}
                      rules={{
                        required: "Effect code is required",
                        validate: {
                          expressionSyntax: value => {
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
                                label="Expression"
                                multiline={true}
                                name={props.name}
                                value={props.value}
                                size="small"
                                onChange={ e => {
                                  props.onChange(e.target.value)
                                  setBaseSubmitTimer(new Date())
                                }}
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
                      defaultValue={treeNode?.data?.states}
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
                      callback={() => {
                        setBaseSubmitTimer(new Date())
                      }}
                      />
                  </Box>
                )
              }
              {
                (treeNode && treeNode.data && nodeType === 'react/form')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.name}
                      rules={{
                        required: "Form name is required",
                        pattern: {
                          value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                          message: 'Form name must be a valid variable name',
                        },
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Form Name"
                              name={props.name}
                              value={props.value}
                              size="small"
                              onChange={ e => {
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.onSubmit}
                      rules={{
                        validate: {
                          validSyntax: value => {
                            if (!value) {
                              return true
                            }
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
                              label="onSubmit"
                              multiline={true}
                              name={props.name}
                              value={props.value}
                              size="small"
                              onChange={ e => {
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.onError}
                      rules={{
                        validate: {
                          validSyntax: value => {
                            if (!value) {
                              return true
                            }
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
                              label="onError"
                              multiline={true}
                              name={props.name}
                              value={props.value}
                              size="small"
                              onChange={ e => {
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
                              error={!!errors.onError}
                              helperText={errors.onError?.message}
                            />
                          </FormControl>
                        )
                      }
                    />
                  </Box>
                )
              }
              {
                (treeNode && treeNode.data && nodeType === 'input/text')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      key="name"
                      name="name"
                      control={control}
                      defaultValue={treeNode?.data?.name}
                      rules={{
                        required: "Input name is required",
                        pattern: {
                          value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                          message: 'Input name must be a valid variable name',
                        },
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Input Name"
                              multiline={true}
                              name={props.name}
                              value={props.value}
                              size="small"
                              onChange={ e => {
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
                              error={!!errors.name}
                              helperText={errors.name?.message}
                            />
                          </FormControl>
                        )
                      }
                    />
                    <Controller
                      control={control}
                      key='array'
                      name='array'
                      type="boolean"
                      defaultValue={!treeNode?.data?._ref?.startsWith('...')}
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
                                setBaseSubmitTimer(new Date())
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
              }
              {
                (treeNode && treeNode.data && nodeType === 'mui/style')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                (treeNode && treeNode.data && nodeType === 'appx/api')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      key="namespace"
                      name="namespace"
                      control={control}
                      defaultValue={treeNode?.data?.name}
                      rules={{
                        required: "Namespace is required",
                        pattern: {
                          value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                          message: 'Namespace must be a valid variable name',
                        },
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Namespace"
                              multiline={true}
                              name={props.name}
                              value={props.value}
                              size="small"
                              onChange={ e => {
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
                              error={!!errors.namespace}
                              helperText={errors.namespace?.message}
                            />
                          </FormControl>
                        )
                      }
                    />
                    <Controller
                      key="app_name"
                      name="app_name"
                      control={control}
                      defaultValue={treeNode?.data?.name}
                      rules={{
                        required: "App name is required",
                        pattern: {
                          value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                          message: 'App name must be a valid variable name',
                        },
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="App Name"
                              multiline={true}
                              name={props.name}
                              value={props.value}
                              size="small"
                              onChange={ e => {
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
                              error={!!errors.app_name}
                              helperText={errors.app_name?.message}
                            />
                          </FormControl>
                        )
                      }
                    />
                    <Controller
                      key="method"
                      name="method"
                      control={control}
                      defaultValue={treeNode?.data?.name}
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
                              name={props.name}
                              value={props.value}
                              size="small"
                              onChange={ e => {
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      key="endpoint"
                      name="endpoint"
                      control={control}
                      defaultValue={treeNode?.data?.name}
                      rules={{
                        required: "Endpoint is required",
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Endpoint"
                              name={props.name}
                              value={props.value}
                              size="small"
                              onChange={ e => {
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
                      defaultValue={treeNode?.data?.prep}
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
                              multiline={true}
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
                      defaultValue={treeNode?.data?.data}
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
                      defaultValue={treeNode?.data?.result}
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
                      defaultValue={treeNode?.data?.error}
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
              }
              {
                (treeNode && treeNode.data && nodeType === 'appx/route')
                &&
                (
                  <Box>
                    <Controller
                      name="_type"
                      control={control}
                      defaultValue={nodeType}
                      rules={{
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
                              size="small"
                              onChange={e => {
                                setNodeType(e.target.value)
                                props.onChange(e.target.value)
                                setBaseSubmitTimer(new Date())
                              }}
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
              {
                (
                  !!treeNode
                  && !!treeNode.data
                  &&
                  (
                    nodeType === 'js/object'
                    || nodeType === 'react/element'
                    || nodeType === 'react/html'
                    || nodeType === 'react/form'
                    || nodeType === 'input/text'
                  )
                )
                &&
                (
                  <Box
                    className={styles.properties}
                    >
                    <PropFieldArray
                      name={`__props`}
                      label="Properties"
                      defaultValue={[]}
                      otherNames={watch(`__props_otherNames`)}
                      className={styles.formControl}
                      callback={d => {
                        // console.log(`callback`)
                        setBaseSubmitTimer(new Date())
                      }}
                    />
                  </Box>
                )
              }
              {
                (
                  !!treeNode
                  && !!treeNode.data
                  &&
                  (
                    nodeType === 'react/form'
                  )
                )
                &&
                (
                  <Box
                    className={styles.properties}
                    >
                    <PropFieldArray
                      name={`__formProps`}
                      label="Form Properties"
                      defaultValue={[]}
                      otherNames={watch(`__formProps_otherNames`)}
                      className={styles.formControl}
                      callback={d => {
                        // console.log(`callback`)
                        setBaseSubmitTimer(new Date())
                      }}
                    />
                  </Box>
                )
              }
              </Box>
            </TabPane>
            <TabPane
            tab={
              <span>
                YAML
                {
                  !!propYamlDirty
                  &&
                  (
                    <Asterisk className={styles.asterisk}>
                    </Asterisk>
                  )
                }
              </span>
            }
              key="yaml"
              className={styles.editor}
              >
              <YamlEditor />
            </TabPane>
          </Tabs>
        )
      }
      </form>
    </FormProvider>
  )
}

export default PropEditor
