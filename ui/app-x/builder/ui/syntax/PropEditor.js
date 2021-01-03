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
  parse_js,
  parse_js_object,
  parse_js_primitive,
  parse_js_expression,
  parse_js_import,
  lookup_icon_for_type,
  lookup_icon_for_input,
  lookup_title_for_input,
  valid_import_names,
  valid_html_tags,
  reorder_children,
} from 'app-x/builder/ui/syntax/util_parse'
import {
  tree_traverse,
  tree_lookup,
  lookup_child_by_ref,
  remove_child_by_ref,
  gen_js,
} from 'app-x/builder/ui/syntax/util_tree'

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
  // properties and otherNames for js/object, react/element, and react/html
  const [ otherNames,           setOtherNames           ] = useState([])

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

  // watch __customRef
  const watch__customRef = watch('__customRef')
  useEffect(() => {
    if (treeNode?.data?.type === 'react/state') {
      if (!!watch__customRef) {
        if (!getValues(`__ref`)) {
          setValue(`__ref`, `${getValues('name')}`)
        }
      } else if (!watch__customRef) {
        setValue(`__ref`, `...${getValues('name')}`)
      }
    }
  }, [watch__customRef])

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
        setNodeType(lookupNode.data.type)
      }
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
      setNodeType(treeNode.data.type)
      Object.keys(treeNode.data).map(k => {
        if (!!k) {
          // console.log(`setValue`, k, treeNode.data[k])
          setValue(k, treeNode.data[k])
        }
      })
      if (treeNode.data.type === 'react/state') {
        // console.log(`__customRef`, treeNode, !!treeNode.data.__ref && !treeNode.data.__ref.startsWith('...'))
        setValue('__customRef',
          !!treeNode.data.__ref
          && !treeNode.data.__ref.startsWith('...'))
      }
      // set properties
      if
      (
        treeNode.data.type === 'js/object'
        || treeNode.data.type === 'react/element'
        || treeNode.data.type === 'react/html'
      )
      {
        const children =
          treeNode.data.type === 'js/object'
          ? treeNode.children
          : lookup_child_by_ref(treeNode, 'props')?.children
        // keep a list of properties and other names
        const props = []
        const others = []
        children?.map(child => {
          if (child.data.type === 'js/null')
          {
            props.push({
              type: child.data.type,
              name: child.data.__ref,
              value: null,
            })
          }
          else if
          (
            child.data.type === 'js/string'
            || child.data.type === 'js/number'
            || child.data.type === 'js/boolean'
            || child.data.type === 'js/expression'
          ) {
            props.push({
              type: child.data.type,
              name: child.data.__ref,
              value: child.data.data,
            })
          }
          else if (child.data.type === 'js/import')
          {
            props.push({
              type: child.data.type,
              name: child.data.__ref,
              value: child.data.name,
            })
          }
          else
          {
            others.push(child.data.__ref)
          }
        })
        // console.log(`setProperties`, props, others)
        setValue(`__props`, props)
        setOtherNames(others)
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
  const [ baseSubmitTimer, setBaseSubmitTimer ] = useState(new Date())
  useEffect(() => {
    setPropBaseDirty(true)
    setTimeout(() => {
      handleSubmit(onBaseSubmit)()
    }, 300)
  }, [baseSubmitTimer])

  // submit base tab
  function onBaseSubmit(data) {
    const resultTree = _.cloneDeep(treeData)
    const lookupNode = tree_lookup(resultTree, selectedKey)
    if (!lookupNode) {
      setPropBaseDirty(false)
    }

    // console.log(data)
    const preservedRef = lookupNode.data.__ref
    lookupNode.data = data
    if (!!data.__ref) {
      lookupNode.data.__ref = data.__ref
    } else if (!!preservedRef) { // preserve lookupNode.data.__ref is exist
      lookupNode.data.__ref = preservedRef
    } else {
      lookupNode.data.__ref = null
    }
    // check if lookupNode is react/state, and __customRef is false
    if (lookupNode.data.type === 'react/state') {
      if (!data.__customRef) {
        lookupNode.data.__ref = `...${lookupNode.data.name}`
      }
    }
    // check if parent is js/switch
    const lookupParent = tree_lookup(resultTree, lookupNode.parentKey)
    if (lookupParent?.data?.type === 'js/switch') {
      if (!!data.default) {
        lookupNode.data.__ref = 'default'
      } else {
        lookupNode.data.__ref = null
        lookupNode.data.condition = data.condition
      }
    }
    // update lookup node title and icon
    lookupNode.title = lookup_title_for_input(lookupNode.data.__ref, data)
    lookupNode.icon = lookup_icon_for_input(data)
    // console.log(lookupNode)
    //////////////////////////////////////////////////////////////////////
    // handle properties
    if (lookupNode.data.type === 'js/object'
        || lookupNode.data.type === 'react/element'
        || lookupNode.data.type === 'react/html')
    {
      // add props child if exist
      if (lookupNode.data.type === 'react/element'
          || lookupNode.data.type === 'react/html')
      {
        const propChild = lookup_child_by_ref(lookupNode, 'props')
        if (!propChild) {
          // add props if not exist
          lookupNode.children.push(parse_js_object({}, lookupNode.key, 'props', {}))
        }
      }
      // lookup childParent node
      const childParent =
        lookupNode.data.type === 'js/object'
        ? lookupNode
        : lookup_child_by_ref(lookupNode, 'props')
      // add child properties as proper childNode (replace existing or add new)
      const properties = _.get(getValues(), '__props') || []
      // console.log(`properties`, properties)
      properties.map(child => {
        const childNode = lookup_child_by_ref(childParent, child.name)
        if (!!childNode)
        {
          // found child node, reuse existing key
          if (child.type === 'js/null')
          {
            childNode.data.__ref = child.name
            childNode.data.type = child.type
            childNode.data.data = null
            childNode.title = lookup_title_for_input(child.name, childNode.data)
            childNode.icon = lookup_icon_for_input(childNode.data)
          }
          else if (child.type === 'js/string'
                  || child.type === 'js/number'
                  || child.type === 'js/boolean'
                  || child.type === 'js/expression')
          {
            childNode.data.__ref = child.name
            childNode.data.type = child.type
            childNode.data.data = child.value
            childNode.title = lookup_title_for_input(child.name, childNode.data)
            childNode.icon = lookup_icon_for_input(childNode.data)
          }
          else if (child.type === 'js/import')
          {
            childNode.data.__ref = child.name
            childNode.data.type = child.type
            childNode.data.name = child.value
            childNode.title = lookup_title_for_input(child.name, childNode.data)
            childNode.icon = lookup_icon_for_input(childNode.data)
          }
          else
          {
            throw new Error(`ERROR: unrecognized child type [${child.type}]`)
          }
        }
        else
        {
          // no child node, create new child node
          if (child.type === 'js/null'
              || child.type === 'js/string'
              || child.type === 'js/number'
              || child.type === 'js/boolean')
          {
            const newChildNode = parse_js_primitive({}, childParent.key, child.name, child.value)
            childParent.children.push(newChildNode)
            // update child title and icon
            newChildNode.title = lookup_title_for_input(child.name, newChildNode.data)
            newChildNode.icon = lookup_icon_for_input(newChildNode.data)
          }
          else if (child.type === 'js/expression')
          {
            const newChildNode = parse_js_expression({}, childParent.key, child.name, {type: 'js/expression', data: child.value})
            childParent.children.push(newChildNode)
            // update child title and icon
            newChildNode.title = lookup_title_for_input(child.name, newChildNode.data)
            newChildNode.icon = lookup_icon_for_input(newChildNode.data)
          }
          else if (child.type === 'js/import')
          {
            const newChildNode = parse_js_import({}, childParent.key, child.name, {type: 'js/import', name: child.value})
            childParent.children.push(newChildNode)
            // update child title and icon
            newChildNode.title = lookup_title_for_input(child.name, newChildNode.data)
            newChildNode.icon = lookup_icon_for_input(newChildNode.data)
          }
          else
          {
            throw new Error(`ERROR: unrecognized child type [${child.type}]`)
          }
        }
      })
      ////////////////////////////////////////
      // remove any primitive child
      childParent.children = childParent.children.filter(child => {
        if (child.data.type === 'js/null'
            || child.data.type === 'js/string'
            || child.data.type === 'js/number'
            || child.data.type === 'js/boolean'
            || child.data.type === 'js/expression'
            || child.data.type === 'js/import')
        {
          const found = properties.find(prop => prop.name === child.data.__ref)
          return found
        }
        else
        {
          return true
        }
      })
      ////////////////////////////////////////
      // if lookupNode is react/element or react/html, remove empty props
      if (lookupNode.data.type === 'react/element'
          || lookupNode.data.type === 'react/html')
      {
        if (!childParent.children.length) {
          remove_child_by_ref(lookupNode, 'props')
        }
      }
      // reorder children
      reorder_children(childParent)
      reorder_children(lookupNode)
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
                  treeNode?.data?.type === 'react/state'
                )
                &&
                (
                  <Controller
                    control={control}
                    key='__customRef'
                    name='__customRef'
                    type="boolean"
                    defaultValue={!treeNode?.data?.__ref?.startsWith('...')}
                    render={props =>
                      (
                        <FormControl
                          className={styles.formControl}
                          error={!!errors.__customRef}
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
                            !!errors.__customRef
                            &&
                            <FormHelperText>{errors.__customRef?.message}</FormHelperText>
                          }
                        </FormControl>
                      )
                    }
                  />
                )
              }
              {
                (
                  treeNode?.data?.__ref !== null
                  && parentNode?.data?.type !== 'js/switch'
                  && parentNode?.data?.type !== 'js/map'
                  && parentNode?.data?.type !== 'js/reduce'
                  && parentNode?.data?.type !== 'js/filter'
                  && parentNode?.data?.type !== 'react/element'
                  && parentNode?.data?.type !== 'react/html'
                  && !
                  (
                    (treeNode?.data?.type === 'react/state')
                    && !getValues('__customRef')
                  )
                )
                &&
                (
                  <Controller
                    name="__ref"
                    control={control}
                    defaultValue={treeNode?.data?.__ref}
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
                                return result || item.data.__ref === treeNode?.data?.__ref
                              },
                              false
                            )
                          // not found, or error
                          return !found
                            || `Duplicate reference name [${treeNode?.data?.__ref}]`
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
                            error={!!errors.__ref}
                            helperText={errors.__ref?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                )
              }
              {
                parentNode?.data?.type === 'js/switch'
                &&
                (
                  <Controller
                    name="default"
                    type="boolean"
                    control={control}
                    defaultValue={treeNode?.data?.__ref === 'default'}
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
                parentNode?.data?.type === 'js/switch'
                && !isSwitchDefault
                &&
                (
                  <Controller
                    name="condition"
                    control={control}
                    defaultValue={treeNode?.data?.condition}
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
                          error={!!errors.condition}
                          helperText={errors.condition?.message}
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
                      name="type"
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
                      name="type"
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
                      name="type"
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
                      name="type"
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
                    <AutoComplete
                      className={styles.formControl}
                      name="name"
                      label="Import Name"
                      options={valid_import_names()}
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
                      callback={data => {
                        setBaseSubmitTimer(new Date())
                      }}
                    />
                  </Box>
                )
              }
              {
                (treeNode && treeNode.data && nodeType === 'js/block')
                &&
                (
                  <Box>
                    <Controller
                      name="type"
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
                                label="Code"
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
                      name="type"
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
                      name="type"
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
                      name="type"
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
                      name="type"
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
                      name="type"
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
                      name="type"
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
                      <AutoComplete
                        className={styles.formControl}
                        name="name"
                        label="Element Name"
                        size="small"
                        options={valid_import_names()}
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
                        callback={data => {
                          setBaseSubmitTimer(new Date())
                        }}
                      />
                    }
                    {
                      nodeType === 'react/html'
                      &&
                      <AutoComplete
                        className={styles.formControl}
                        name="name"
                        label="Import Name"
                        options={valid_html_tags()}
                        defaultValue={treeNode?.data?.name}
                        rules={{
                          required: "HTML tag is required",
                        }}
                        callback={data => {
                          setBaseSubmitTimer(new Date())
                        }}
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
                      name="type"
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
                (treeNode && treeNode.data && nodeType === 'react/effect')
                &&
                (
                  <Box>
                    <Controller
                      name="type"
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
                (treeNode && treeNode.data && nodeType === 'mui/style')
                &&
                (
                  <Box>
                    <Controller
                      name="type"
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
                (treeNode && treeNode.data && nodeType === 'appx/route')
                &&
                (
                  <Box>
                    <Controller
                      name="type"
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
                      otherNames={otherNames}
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
