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
  Divider,
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
import * as api from 'app-x/api'
import Asterisk from 'app-x/icon/Asterisk'
import TextFieldArray from 'app-x/component/TextFieldArray'
import InputProperties from 'app-x/component/InputProperties'
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import YamlEditor from 'app-x/builder/ui/syntax/YamlEditor'
import ReactIcon from 'app-x/icon/React'
import AutoSuggest from 'app-x/component/AutoSuggest'
import InputField from 'app-x/component/InputField'
import InputFieldArray from 'app-x/component/InputFieldArray'
import ControlledEditor from 'app-x/component/ControlledEditor'
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
      padding: theme.spacing(2, 0),
    },
    basicTab: {
      width: '100%',
      height: '100%',
      overflow: 'scroll',
    },
    editor: {
      width: '100%',
      height: '100%',
    },
    base: {
      width: '100%',
      // height: '100%',
      padding: theme.spacing(0, 2),
    },
    tabs: {
      margin: theme.spacing(1, 1),
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

  //////////////////////////////////////////////////////////////////////////////
  // states
  const [ parentNode,     setParentNode     ] = useState(null)
  const [ parentSpec,     setParentSpec     ] = useState(null)
  const [ thisNode,       setThisNode       ] = useState(null)
  const [ nodeSpec,       setNodeSpec       ] = useState(null)
  const [ nodeType,       setNodeType       ] = useState(null)
  const [ nodeRef,        setNodeRef        ] = useState(null)

  // disabled and hidden states
  const [ disabled,       setDisabled       ] = useState({})
  const [ hidden,         setHidden         ] = useState({})

  //////////////////////////////////////////////////////////////////////////////
  // context variables
  const form = hookForm
  const states = {
    getDisabled: (name) => {
      return !!disabled[name]
    },
    setDisabled: (name, target) => {
      if (disabled[name] !== target) {
        const result = _.clone(disabled)
        result[name] = !!target
        setDisabled(result)
      }
    },
    getHidden: (name) => {
      return !!hidden[name]
    },
    setHidden: (name, target) => {
      if (hidden[name] !== target) {
        const result = _.clone(hidden)
        result[name] = !!target
        setHidden(result)
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
      const childSpec = parentSpec.children.find(childSpec => childSpec.name === '*' || childSpec.name == nodeRef)
      if (!!childSpec && !!childSpec._childNode && !!childSpec._childNode.effects) {
        childSpec._childNode.effects.map(effect => eval(effect))
        // console.log(`watch here`, watchData, new Date())
      }
    }
    // nodeSpec effects
    if (!!nodeSpec && !!nodeSpec._effects) {
      nodeSpec._effects.map(effect => eval(effect))
    }
  }, [watchData])


  //////////////////////////////////////////////////////////////////////////////
  // parentSpec
  useEffect(() => {
    // reset disabled and hidden flags
    setDisabled({})
    setHidden({})
    // set parent spec
    if (!parentNode?.data?._type) {
      setParentSpec(null)
    } else {
      const spec = globalThis.appx.SPEC.types[parentNode.data._type]
      // console.log(`parentSpec`, spec)
      if (!spec) {
        setParentSpec(null)
      } else {
        setParentSpec(spec)
      }
    }
  }, [parentNode])

  // nodeType
  useEffect(() => {
    setNodeType(thisNode?.data?._type)
    setNodeRef(thisNode?.data?._ref)
  }, [thisNode])

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
      setThisNode(_.cloneDeep(lookupNode))
      setParentNode(_.cloneDeep(lookupParent))
      // console.log(lookupNode)
      // console.log(parentNode)
      if (lookupNode) {
        setNodeType(lookupNode.data._type)
      }
      // console.log(`lookupNode`, lookupNode)
    }
    else
    {
      setThisNode(null)
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

  // setValue when thisNode change
  useEffect(() => {
    if (!!thisNode) {
      setNodeType(thisNode.data._type)
      Object.keys(thisNode.data).map(k => {
        if (!!k) {
          // console.log(`setValue`, k, thisNode.data[k])
          setValue(k, thisNode.data[k])
        }
      })
      if (thisNode.data._type === 'react/state') {
        // console.log(`_customRef`, thisNode, !!thisNode.data._ref && !thisNode.data._ref.startsWith('...'))
        setValue('_customRef',
          !!thisNode.data._ref
          && !thisNode.data._ref.startsWith('...'))
      }
      // set properties
      if
      (
        thisNode.data._type === 'js/object'
        || thisNode.data._type === 'react/element'
        || thisNode.data._type === 'react/html'
        || thisNode.data._type === 'react/form'
        || thisNode.data._type === 'input/text'
      )
      {
        _set_form_props(thisNode, 'props')
      }
      // set form properties
      if
      (
        thisNode.data._type === 'react/form'
      )
      {
        _set_form_props(thisNode, 'formProps')
      }
      // just loaded, set dirty to false
      setPropBaseDirty(false)
    }
  },
  [
    thisNode,
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
  function _set_form_props(thisNode, refKey) {
    // get proper children
    const children =
      thisNode.data._type === 'js/object'
      ? thisNode.children
      : lookup_child_for_ref(thisNode, refKey)?.children
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

  // process props
  function _process_props(lookupNode, refKey) {
    // add props child if exist
    if (lookupNode.data._type !== 'js/object')
    {
      const propChild = lookup_child_for_ref(lookupNode, refKey)
      if (!propChild) {
        // add props if not exist
        lookupNode.children.push(
          generate_tree_node(
            {},
            {
              ref: refKey,
              parentKey: lookupNode.key,
              array: !!parentSpec?.children.find(childSpec => childSpec.name === '*' || childSpec.name === nodeRef)?.array,
            },
            {}
          )
        )
      }
    }
    // lookup childParent node
    const childParent =
      lookupNode.data._type === 'js/object'
      ? lookupNode
      : lookup_child_for_ref(lookupNode, refKey)
    // add child properties as proper childNode (replace existing or add new)
    const properties = _.get(getValues(), `__${refKey}`) || []
    // process childParent props
    // _process_childParent_props(childParent, properties)
    ////////////////////////////////////////
    // if lookupNode is react/element or react/html, remove empty props
    if (lookupNode.data._type !== 'js/object')
    {
      if (!childParent.children.length) {
        remove_child_for_ref(lookupNode, refKey)
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
        (!thisNode)
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
        (thisNode)
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
              <Box className={styles.base}>
              {
                !!parentSpec?.children.find(childSpec => childSpec.name === '*' || childSpec.name === nodeRef)
                && !!parentSpec.children.find(childSpec => childSpec.name === '*' || childSpec.name === nodeRef)?._childNode?.customs
                &&
                (
                  // add custom fields from parentSpec if mandated by parent
                  parentSpec.children.find(childSpec => childSpec.name === '*' || childSpec.name === nodeRef)._childNode.customs.map(customField => {
                    // console.log(`parentSpec - customField`, customField)
                    if (!!hidden[customField.name]) {
                      return undefined
                    } else {
                      return (
                        <InputField
                          key={customField.name}
                          name={customField.name}
                          disabled={!!disabled[customField.name]}
                          childSpec={customField}
                          thisNodeSpec={customField}
                          defaultValue={thisNode?.data[customField.name]}
                          callback={d => {
                            setBaseSubmitTimer(new Date())
                          }}
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
                  nodeSpec._customs.map(customField => {
                    // console.log(`nodeSpec - customField`, customField)
                    if (!!hidden[customField.name]) {
                      return undefined
                    } else {
                      return (
                        <InputField
                          key={customField.name}
                          name={customField.name}
                          disabled={!!disabled[customField.name]}
                          childSpec={customField}
                          thisNodeSpec={customField}
                          defaultValue={thisNode?.data[customField.name]}
                          callback={d => {
                            setBaseSubmitTimer(new Date())
                          }}
                        />
                      )
                    }
                  })
                  .filter(child => !!child)
                  .flat(2)
                )
              }
              <Controller
                name="_ref"
                control={control}
                defaultValue={thisNode?.data._ref}
                rules={{
                  required: "Reference name is required",
                  validate: {
                    checkDuplicate: value =>
                      !!(parentSpec.children?.find(child => child.name === value)?.array) // no check needed for array
                      || lookup_child_for_ref(parentNode, value) === null
                      || lookup_child_for_ref(parentNode, value).key === thisNode?.key
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
                  <FormControl
                    className={styles.formControl}
                    disabled={
                      !parentSpec?.children.find(childSpec => childSpec.name === '*')
                      || !!disabled["_ref"]
                    }
                    >
                    <AutoSuggest
                      label="Reference"
                      name="_ref"
                      disabled={
                        !parentSpec?.children.find(childSpec => childSpec.name === '*')
                        || !!disabled["_ref"]
                      }
                      required={true}
                      onChange={value => {
                        innerProps.onChange(value)
                        setNodeRef(value)
                        trigger('_ref')
                        trigger('_type')
                        setBaseSubmitTimer(new Date())
                      }}
                      value={innerProps.value}
                      options={parentSpec?.children?.filter(spec => !!spec._childNode?.class).map(child => child.name).filter(name => name !== '*')}
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
                            setBaseSubmitTimer(new Date())
                          }
                        }
                        error={!!errors._type}
                        helperText={errors._type?.message}
                        >
                        {
                          (() => {
                            // const supported_types = lookup_accepted_types_for_node(parentNode)
                            const supported_types = lookup_changeable_types(nodeType) // use changeable types
                            return supported_types
                              .map(type => {
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
                              })
                              .filter(item => !!item)
                              .flat(2)
                              // remove last divider item
                              // .filter((item, index, array) => !((index === array.length - 1) && (typeof item === 'string') && (item.startsWith('divider'))))
                              // .map(item => {
                              //   // console.log(`item`, item)
                              //   return (typeof item === 'string' && item.startsWith('divider')) ? <Divider key={item} /> : item
                              // })
                          })()
                        }
                      </TextField>
                    </FormControl>
                  )
                }
              />
              {
                nodeSpec?.children?.map(childSpec => {
                  if (!childSpec._thisNode?.class) {
                    return undefined
                  }
                  if (!!hidden[childSpec.name]) {
                    return undefined
                  }
                  // const childThisSpec = childSpec._thisNode
                  if (!!childSpec.array) {
                    return (
                      <InputFieldArray
                        key={childSpec.name}
                        name={childSpec.name}
                        disabled={!!disabled[childSpec.name]}
                        defaultValue={thisNode?.data[childSpec.name]}
                        childSpec={childSpec}
                        thisNodeSpec={childSpec._thisNode}
                        callback={d => {
                          setBaseSubmitTimer(new Date())
                        }}
                      />
                    )
                  } else {
                    return (
                      <InputField
                        key={childSpec.name}
                        name={childSpec.name}
                        disabled={!!disabled[childSpec.name]}
                        defaultValue={thisNode?.data[childSpec.name]}
                        childSpec={childSpec}
                        thisNodeSpec={childSpec._thisNode}
                        callback={d => {
                          setBaseSubmitTimer(new Date())
                        }}
                      />
                    )
                  }
                })
                .filter(child => !!child)
                .flat(2)
              }
              {
                (
                  !!thisNode
                  && !!thisNode.data
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
                    <InputProperties
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
                  !!thisNode
                  && !!thisNode.data
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
                    <InputProperties
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
