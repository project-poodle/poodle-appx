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
  notification,
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
  lookup_child_for_ref,
  remove_child_for_ref,
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

const THIS_NODE_PROPERTIES = "_"
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
    //
    history,
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
  // const [ nodeChildren,   setNodeChildren   ] = useState([])

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
      const childSpec = parentSpec?.children.find(childSpec => childSpec.name === '*' || childSpec.name == nodeRef)
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
    if (!!thisNode && !!nodeSpec) {
      setValue('_ref', thisNode.data._ref)
      setValue('_type', thisNode.data._type)
      nodeSpec.children
        .filter(childSpec => !!childSpec._thisNode)
        .map(childSpec => {
          if (childSpec.name === '*') {
            Object.keys(thisNode.data).map(k => {
              // console.log(`setValue`, k, thisNode.data[k])
              setValue(k, thisNode.data[k])
            })
          } else {
            setValue(childSpec.name, thisNode.data[childSpec.name])
          }
        })
      // customization by nodeSpec
      if (!!nodeSpec._customs) {
        nodeSpec._customs.map(custom => {
          setValue(custom.name, thisNode.data[custom.name])
        })
      }
      // customization by parentSpec
      if (!!parentSpec) {
        parentSpec.children
          .filter(childSpec => !!childSpec._childNode?.customs)
          .map(childSpec => {
            if (childSpec.name === thisNode.data._ref) {
              childSpec._childNode.customs.map(custom => {
                setValue(custom.name, thisNode.data[custom.name])
              })
            }
          })
      }
      // node children
      // setNodeChildren(thisNode.children)
      // just loaded, set dirty to false
      setPropBaseDirty(false)
    }
  },
  [
    history,
    thisNode,
    parentNode,
    nodeSpec,
    parentSpec,
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

  //////////////////////////////////////////////////////////////////////////////
  // onSubmit
  const onBaseSubmit = data => {
    try {
      console.log('Editor data', data)
      propEditorCallback(data)
    } catch (err) {
      console.log(`Editor`, data, err)
      notification.error({
        message: `Failed to Edit [ ${nodeType?.replace('/', ' / ')} ]`,
        description: String(err),
        placement: 'bottomLeft',
      })
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // move callback
  function propEditorCallback(data) {
    const resultTree = _.cloneDeep(treeData)
    const lookupNode = tree_lookup(resultTree, selectedKey)
    if (!lookupNode) {
      setPropBaseDirty(false)
      return
    }

    // console.log(data)
    lookupNode.data = data
    lookupNode.data._array = !!parentSpec?.children.find(childSpec => childSpec.name === '*' || childSpec.name === lookupNode.data._ref)?.array
    lookupNode.title = lookup_title_for_node(lookupNode)
    lookupNode.icon = lookup_icon_for_node(lookupNode)
    // console.log(lookupNode)
    //////////////////////////////////////////////////////////////////////
    // handle nodeSpec.children._childNode.input : 'input/properties'
    nodeSpec.children
      .filter(childSpec => childSpec._childNode?.input === 'input/properties')
      .map(childSpec => {
        if (childSpec.name === '*') {
          lookupNode.children.map(childNode => {
            _process_child_props(lookupNode, childNode.data._ref, !!childSpec.array)
          })
        } else {
          _process_child_props(lookupNode, childSpec.name, !!childSpec.array)
        }
      })
    //////////////////////////////////////////////////////////////////////
    // handle nodeSpec._input : 'input/properties'
    if (nodeSpec._input === 'input/properties') {
      const parentNode = tree_lookup(resultTree, lookupNode.parentKey)
      _process_this_props(lookupNode, parentNode)
    }
    //////////////////////////////////////////////////////////////////////
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
  // process child props
  function _process_child_props(lookupNode, refKey, isArray) {
    // add props child if exist
    let childNode = lookup_child_for_ref(lookupNode, refKey)
    // console.log(`_process_child_props`, refKey, childNode)
    if (!childNode) {
      // add props if not exist
      // console.log(`new_tree_node`)
      childNode = new_tree_node(
        '',
        null,
        {
          _ref: refKey,
          _type: 'js/object',
          _array: isArray,
        },
        false,
        lookupNode.key,
      )
      childNode.title = lookup_title_for_node(childNode)
      childNode.icon = lookup_icon_for_node(childNode)
      lookupNode.children.push(childNode)
    }
    // add child properties as proper childNode (replace existing or add new)
    const properties = _.get(getValues(), refKey) || []
    // console.log(`properties`, properties)
    // process childParent props
    // console.log(`childNode.children`, childNode.children)
    InputProperties.process(childNode, properties)
    // console.log(`childNode.children #2`, childNode.children)
    ////////////////////////////////////////
    // if lookupNode is react/element or react/html, remove empty props
    // if (!childNode.children.length) {
    //  remove_child_for_ref(lookupNode, refKey)
    // }
    // console.log(`childNode`, childNode)
    // reorder children
    // reorder_children(childParent)
    reorder_children(lookupNode)
  }
  ////////////////////////////////////////////////////////////////////////////////
  // process this props
  function _process_this_props(lookupNode, parentNode) {
    // add props child if exist
    // add child properties as proper childNode (replace existing or add new)
    console.log(`getValues`, getValues())
    const properties = _.get(getValues(), THIS_NODE_PROPERTIES) || []
    console.log(`properties`, properties)
    // process childParent props
    InputProperties.process(lookupNode, properties)
    ////////////////////////////////////////
    console.log(`lookupNode`, lookupNode)
    // reorder_children(childParent)
    if (!!parentNode) {
      reorder_children(parentNode)
    }
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
                      !!(parentSpec?.children?.find(child => child.name === value)?.array) // no check needed for array
                      || lookup_child_for_ref(parentNode, value) === null
                      || lookup_child_for_ref(parentNode, value).key === thisNode?.key
                      || `Reference name [ ${value} ] is duplicate with an existing child`,
                    checkValidName: value => {
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
                      const found = parentSpec?.children?.find(childSpec => {
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
                      const found = parentSpec?.children?.find(childSpec => {
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
                  nodeSpec?._input === 'input/properties'
                  && !!nodeSpec.children?.find(childSpec => childSpec.name === '*')
                )
                &&
                (
                  <Box
                    className={styles.properties}
                    key={THIS_NODE_PROPERTIES}
                    >
                    <InputProperties
                      name={THIS_NODE_PROPERTIES}
                      key={THIS_NODE_PROPERTIES}
                      label={nodeSpec.desc}
                      thisNode={thisNode}
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
                nodeSpec?.children
                  .filter(childSpec => childSpec._childNode?.input === 'input/properties')
                  .map(childSpec => {
                    // console.log(`input/properties`, childSpec)
                    if (!!hidden[childSpec.name]) {
                      return undefined
                    }
                    if (!thisNode) {
                      return undefined
                    }
                    // for wildecard property
                    if (childSpec.name === '*') {
                      // return thisNode.children
                      return thisNode?.children
                        .map(childNode => {
                          // const childThisSpec = childSpec._thisNode
                          // console.log(`input/properties #2`, childSpec)
                          return (
                            <Box
                              className={styles.properties}
                              key={childNode.data._ref}
                              >
                              <InputProperties
                                name={childNode.data._ref}
                                key={childNode.data._ref}
                                label={`[ ${childNode.data._ref} ]`}
                                thisNode={childNode}
                                className={styles.formControl}
                                callback={d => {
                                  // console.log(`callback`)
                                  setBaseSubmitTimer(new Date())
                                }}
                              />
                            </Box>
                          )
                        })
                    } else {
                      // for specified property
                      const childNode = lookup_child_for_ref(thisNode, childSpec.name)
                      return (
                        <Box
                          className={styles.properties}
                          key={childSpec.name}
                          >
                          <InputProperties
                            name={childSpec.name}
                            key={childSpec.name}
                            label={childSpec.desc}
                            thisNode={childNode}
                            className={styles.formControl}
                            callback={d => {
                              // console.log(`callback`)
                              setBaseSubmitTimer(new Date())
                            }}
                          />
                        </Box>
                      )
                    }
                  })
                  .filter(child => !!child)
                  .flat(2)
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
