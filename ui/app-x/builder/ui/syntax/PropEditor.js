import React, { useState, useContext, useEffect } from "react"
import ReactDOM from "react-dom"
import YAML from 'yaml'
import _ from 'lodash'
// material ui
import {
  Box,
  Container,
  Grid,
  ListItem,
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
  makeStyles,
  useTheme,
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
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import YamlEditor from 'app-x/builder/ui/syntax/YamlEditor'
import ReactIcon from 'app-x/icon/React'
import AutoSuggest from 'app-x/builder/component/AutoSuggest'
import InputField from 'app-x/builder/component/InputField'
import InputFieldArray from 'app-x/builder/component/InputFieldArray'
import InputProperties from 'app-x/builder/component/InputProperties'
import InputFieldTabular from 'app-x/builder/component/InputFieldTabular'
import ControlledEditor from 'app-x/builder/component/ControlledEditor'
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
  REGEX_VAR,
  deepCompareMemorize,
  lookup_classes,
  lookup_groups,
  lookup_types,
  lookup_spec_for_type,
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
  valid_propTypes_for,
  valid_api_methods,
  valid_import_names,
  valid_html_tags,
  validation,
} from 'app-x/builder/ui/syntax/util_base'

const THIS_NODE_PROPERTIES = "_"
let pendingTimer = new Date()

const PropEditor = (props) => {
  // theme
  const theme = useTheme()
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
      // margin: theme.spacing(2, 0),
      padding: theme.spacing(0, 0),
      // border
      // border: 1,
      // borderLeft: 0,
      // borderRight: 0,
      // borderBottom: 0,
      // borderStyle: 'dotted',
      // borderColor: theme.palette.divider,
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
  const [ parentNode,       setParentNode       ] = useState(null)
  const [ parentSpec,       setParentSpec       ] = useState(null)
  const [ thisNode,         setThisNode         ] = useState(null)
  const [ nodeSpec,         setNodeSpec         ] = useState(null)
  const [ nodeType,         setNodeType         ] = useState(null)
  const [ nodeRef,          setNodeRef          ] = useState(null)
  // const [ nodeChildren,   setNodeChildren   ] = useState([])

  // disabled and hidden states
  const [ disabled,         setDisabled         ] = useState({})
  const [ hidden,           setHidden           ] = useState({})

  // other names
  const [ propNameOptions,  setPropNameOptions  ] = useState({})
  const [ nodeOtherNames,   setNodeOtherNames   ] = useState({})

  //////////////////////////////////////////////////////////////////////////////
  // context variables
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
          .filter(effect => !!effect.context && effect.context.includes('editor') && Array.isArray(effect.data))
          .map(effect => {
            effect.data.map(data => eval(data))
          })
      }
    }
    // nodeSpec effects
    if (!!nodeSpec?._effects && Array.isArray(nodeSpec._effects)) {
      nodeSpec._effects
        .filter(effect => !!effect.context && effect.context.includes('editor') && Array.isArray(effect.data))
        .map(effect => {
          effect.data.map(data => eval(data))
        })
    }
  }, [watchData])

  // watch for react/element and update props name based on propTypes
  useEffect(() => {
    if (nodeType === 'react/element') {
      // console.log(`here`)
      setPropNameOptions([])
      const options = valid_propTypes_for(thisNode?.data.name)
      // console.log(`callback`, options)
      const newPropNameOptions = _.cloneDeep(propNameOptions)
      newPropNameOptions.props = options // .map(value => {value: value})
      setPropNameOptions(newPropNameOptions)
    }
  }, [nodeType, thisNode])

  // watch for react/element and update props name based on propTypes
  useEffect(() => {
    if (nodeType === 'js/object') {
      setPropNameOptions([])
      if
      (
        parentNode?.data._type === 'react/element'
        || parentNode?.data._type === 'react/html'
        || parentNode?.data._type === 'react/form'
        || parentNode?.data._type.startsWith('input/')
      )
      {
        if (nodeRef === 'props') {
          // console.log(`here`)
          const options = valid_propTypes_for(parentNode?.data.name)
          // console.log(`callback`, options)
          const newPropNameOptions = _.cloneDeep(propNameOptions)
          newPropNameOptions[THIS_NODE_PROPERTIES] = options // .map(value => {value: value})
          setPropNameOptions(newPropNameOptions)
        } else if (nodeRef === 'style') {
          const newPropNameOptions = _.cloneDeep(propNameOptions)
          newPropNameOptions[THIS_NODE_PROPERTIES] = validation.valid_css_properties() // .map(value => {value: value})
          setPropNameOptions(newPropNameOptions)
        } else {
          setPropNameOptions([])
        }
      }
      else if
      (
        parentNode?.data._type === 'mui/style'
      )
      {
        const newPropNameOptions = _.cloneDeep(propNameOptions)
        newPropNameOptions[THIS_NODE_PROPERTIES] = validation.valid_css_properties() // .map(value => {value: value})
        setPropNameOptions(newPropNameOptions)
      }
    }
  }, [nodeRef, nodeType, parentNode])

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
      setNodeType(lookupNode?.data._type || null)
      setNodeRef(lookupNode?.data._ref || null)
      // console.log(`lookupNode`, lookupNode)
      // nodeSpec
      if (!lookupNode?.data._type) {
        setNodeSpec(null)
      } else {
        const spec = globalThis.appx.SPEC.types[lookupNode?.data._type]
        // console.log(`nodeSpec`, spec)
        if (!spec) {
          setNodeSpec(null)
        } else {
          setNodeSpec(spec)
        }
      }
      // parentSpec
      if (!lookupParent?.data._type) {
        setParentSpec(null)
      } else {
        const spec = globalThis.appx.SPEC.types[lookupParent.data._type]
        // console.log(`parentSpec`, spec)
        if (!spec) {
          setParentSpec(null)
        } else {
          setParentSpec(spec)
        }
      }
      // reset disabled and hidden flags
      setDisabled({})
      setHidden({})
      setNodeOtherNames({})
    }
    else
    {
      setThisNode(null)
      setNodeSpec(null)
      setNodeType(null)
      setNodeRef(null)
      setParentNode(null)
      setParentSpec(null)
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
      trigger('_ref')
      trigger('_type')
      // process _thisNode
      nodeSpec.children
        .filter(childSpec => !!childSpec._thisNode)
        .map(childSpec => {
          if (childSpec.name === '*') {
            Object.keys(thisNode.data).map(k => {
              // console.log(`setValue`, k, thisNode.data[k])
              setValue(k, thisNode.data[k])
            })
          } else {
            if (!!childSpec.array) {
              setValue(childSpec.name, thisNode.data[childSpec.name] === undefined ? [] : thisNode.data[childSpec.name])
            } else {
              // console.log(`setValue(${childSpec.name})`, thisNode.data[childSpec.name])
              setValue(childSpec.name, thisNode.data[childSpec.name] === undefined ? '' : thisNode.data[childSpec.name])
              // console.log(`getValues(${childSpec.name})`, getValues(childSpec.name))
            }
          }
          // process childSpec._thisNode.input.kind : input/tabular
          if (childSpec._thisNode.input?.kind === 'input/tabular') {
            if (childSpec.name === '*') {
              throw new Error(`ERROR: cannot process [input/tabular] for [*]`)
            } else {
              setValue(childSpec.name, thisNode.data[childSpec.name] || [])
            }
          }
        })
      // process _childNode
      nodeSpec.children
        .filter(childSpec => !!childSpec._childNode?.input)
        .map(childSpec => {
          // process input/properties
          if (childSpec._childNode.input.kind === 'input/properties') {
            // TODO_childNode
            if (childSpec.name === '*') {
              return thisNode?.children
                .map(childNode => {
                  const { properties, otherNames } = InputProperties.parse(childNode)
                  setValue(childNode.data._ref, properties)
                  const newNodeOtherNames = _.cloneDeep(nodeOtherNames)
                  newNodeOtherNames[childNode.data._ref] = otherNames
                  setNodeOtherNames(newNodeOtherNames)
                })
            } else {
              const childNode = lookup_child_for_ref(thisNode, childSpec.name)
              const { properties, otherNames } = InputProperties.parse(childNode)
              setValue(childSpec.name, properties || [])
              const newNodeOtherNames = _.cloneDeep(nodeOtherNames)
              newNodeOtherNames[childSpec.name] = otherNames
              setNodeOtherNames(newNodeOtherNames)
            }
          }
          // process childSpec._childNode.input.kind : input/tabular
          if (childSpec._childNode.input.kind === 'input/tabular') {
            if (childSpec.name === '*') {
              throw new Error(`ERROR: cannot process [input/tabular] for [*]`)
            } else {
              const childNode = lookup_child_for_ref(thisNode, childSpec.name)
              if (!!childNode) {
                const childTypeSpec = lookup_spec_for_type(childNode.data._type)
                const fieldName = childSpec._childNode.input.field
                if (!fieldName) {
                  throw new Error(`ERROR: child node [input/tabular] missing [field] [${JSON.stringify(childSpec._childNode.input)}]`)
                }
                const listData = childNode.data[fieldName] || []
                setValue(childSpec.name, listData)
              } else {
                setValue(childSpec.name, [])
              }
            }
          }
        })
      // process nodeSpec._input?.kind === 'input/properties'
      if (
        nodeSpec?._input?.kind === 'input/properties'
        && !!nodeSpec.children?.find(childSpec => childSpec.name === '*')
      ) {
        const { properties, otherNames } = InputProperties.parse(thisNode)
        setValue(THIS_NODE_PROPERTIES, properties)
        const newNodeOtherNames = _.cloneDeep(nodeOtherNames)
        newNodeOtherNames[THIS_NODE_PROPERTIES] = otherNames
        setNodeOtherNames(newNodeOtherNames)
      }
      // process nodeSpec._input?.kind === 'input/rules'
      if (
         nodeSpec?._input?.kind === 'input/tabular'
      ) {
        const fieldName = nodeSpec.children.find(childSpec => !!childSpec.array)?.name
        const rules = thisNode.data[fieldName] || []
        // console.log(`input/tabular`, THIS_NODE_PROPERTIES, rules)
        setValue(THIS_NODE_PROPERTIES, rules)
      }
      // process customization by nodeSpec
      if (!!nodeSpec._customs) {
        nodeSpec._customs
          .filter(custom => custom.context?.includes('editor'))
          .map(custom => {
            setValue(custom.name, thisNode.data[custom.name] || '')
          })
      }
      // process customization by parentSpec
      if (!!parentSpec) {
        parentSpec.children
          .filter(childSpec => !!childSpec._childNode?.customs)
          .map(childSpec => {
            if (childSpec.name === thisNode.data._ref) {
              childSpec._childNode.customs
                .filter(custom => custom.context?.includes('editor'))
                .map(custom => {
                  setValue(custom.name, thisNode.data[custom.name] || '')
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
    }, 500)
  }, [baseSubmitTimer])

  //////////////////////////////////////////////////////////////////////////////
  // onSubmit
  const onBaseSubmit = data => {
    ReactDOM.unstable_batchedUpdates(() => {
      try {
        // console.log('Editor data', data)
          propEditorCallback(data)
      } catch (err) {
        console.log(`Editor`, data, err)
        notification.error({
          message: `Failed to Edit [ ${nodeType?.replaceAll('/', ' / ')} ]`,
          description: String(err),
          placement: 'bottomLeft',
        })
      }
    })
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
      .filter(childSpec => childSpec._childNode?.input?.kind === 'input/properties')
      .map(childSpec => {
        if (childSpec.name === '*') {
          lookupNode.children.map(childNode => {
            _process_child_props(lookupNode, childNode.data._ref, !!childSpec.array, true)
          })
        } else {
          _process_child_props(lookupNode, childSpec.name, !!childSpec.array, false)
        }
      })
    //////////////////////////////////////////////////////////////////////
    // handle nodeSpec._input : 'input/properties'
    if (nodeSpec._input?.kind === 'input/properties') {
      const parentNode = tree_lookup(resultTree, lookupNode.parentKey)
      _process_this_props(lookupNode, parentNode)
    }
    //////////////////////////////////////////////////////////////////////
    // handle nodeSpec.children._thisNode.input : 'input/tabular'
    nodeSpec.children
      .filter(childSpec => childSpec._thisNode?.input?.kind === 'input/tabular')
      .map(childSpec => {
        if (childSpec.name === '*') {
          throw new Error(`ERROR: [input/tabular] do not support [*]`)
        } else {
          lookupNode.data[childSpec.name] = _.get(getValues(), childSpec.name) || []
          // console.log(
          //   `lookupNode.data[childSpec.name] = _.get(getValues(), childSpec.name)`,
          //   childSpec.name,
          //   _.get(getValues(), childSpec.name)
          // )
        }
      })
    //////////////////////////////////////////////////////////////////////
    // handle nodeSpec.children._childNode.input : 'input/tabular'
    nodeSpec.children
      .filter(childSpec => childSpec._childNode?.input?.kind === 'input/tabular')
      .map(childSpec => {
        if (childSpec.name === '*') {
          throw new Error(`ERROR: [input/tabular] do not support [*]`)
        } else if (!childSpec._childNode?.input?.type) {
          throw new Error(`ERROR: child node [input/tabular] missing [type] [${JSON.stringify(childSpec._childNode.input)}]`)
        } else if (!childSpec._childNode?.input?.field) {
          throw new Error(`ERROR: child node [input/tabular] missing [field] [${JSON.stringify(childSpec._childNode.input)}]`)
        } else {
          const childData = _.get(getValues(), childSpec.name) || []
          if (childData.length === 0) {
            // what is it
            remove_child_for_ref(lookupNode, childSpec.name)
            reorder_children(lookupNode)
          } else {
            // add props child if exist
            let childNode = lookup_child_for_ref(lookupNode, childSpec.name)
            // console.log(`_process_child_props`, refKey, childNode)
            if (!childNode) {
              const childTypeSpec = lookup_spec_for_type(childSpec._childNode.input.type)
              if (!childTypeSpec) {
                throw new Error(`ERROR: cannot find child type [${childSpec._childNode.input.type}] [${JSON.stringify(childSpec._childNode.input)}]`)
              }
              // add child node if not exist
              childNode = new_tree_node(
                '',
                null,
                {
                  _ref: childSpec.name,
                  _type: childSpec._childNode.input.type,
                  _array: !!childSpec.array,
                },
                !childTypeSpec.children?.find(childSpec => !!childSpec._childNode),
                lookupNode.key,
              )
              childNode.title = lookup_title_for_node(childNode)
              childNode.icon = lookup_icon_for_node(childNode)
              lookupNode.children.push(childNode)
            }
            childNode.data[childSpec._childNode.input.field] = childData
            reorder_children(lookupNode)
          }
        }
      })
    //////////////////////////////////////////////////////////////////////
    // handle nodeSpec._input : 'input/tabular'
    if (nodeSpec._input?.kind === 'input/tabular') {
      const fieldName = nodeSpec.children.find(childSpec => !!childSpec.array)?.name
      lookupNode.data[fieldName] = _.get(getValues(), THIS_NODE_PROPERTIES) || []
    }
    //////////////////////////////////////////////////////////////////////
    // setTreeData(resultTree)
    // console.log(`lookupNode`, lookupNode)
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
  function _process_child_props(lookupNode, refKey, isArray, isWildcard) {
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
    if (!isWildcard && !childNode.children.length) {
      remove_child_for_ref(lookupNode, refKey)
    }
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
    // console.log(`getValues`, getValues())
    const properties = _.get(getValues(), THIS_NODE_PROPERTIES) || []
    // console.log(`properties`, properties)
    // process childParent props
    InputProperties.process(lookupNode, properties)
    ////////////////////////////////////////
    // console.log(`lookupNode`, lookupNode)
    // reorder_children(childParent)
    if (!!parentNode) {
      reorder_children(parentNode)
    }
  }
  ////////////////////////////////////////////////////////////////////////////////

  const MemorizedBaseTab = React.useMemo(() => () => {
    return (
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
    )
  }, [propBaseDirty].map(deepCompareMemorize))

  const MemorizedYamlTab = React.useMemo(() => () => {
    return (
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
    )
  }, [propYamlDirty].map(deepCompareMemorize))

  const MemorizedYamlEditor = React.useMemo(() => () => {
    return (
      <YamlEditor />
    )
  }, [treeData, selectedKey].map(deepCompareMemorize))

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
        (!!thisNode)
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
                <MemorizedBaseTab />
              }
              key="basic"
              className={styles.basicTab}
              >
              {
                (thisNode?.key === '/')
                &&
                (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    className={styles.root}
                    >
                    <Typography variant="body2">
                      Root has no attribute, use YAML for advanced editing
                    </Typography>
                  </Box>
                )
              }
              <Box className={styles.base}>
              {
                (thisNode?.key !== '/')
                && !!parentSpec?.children.find(childSpec => childSpec.name === '*' || childSpec.name === nodeRef)
                && !!parentSpec.children.find(childSpec => childSpec.name === '*' || childSpec.name === nodeRef)?._childNode?.customs
                &&
                (
                  // add custom fields from parentSpec if mandated by parent
                  parentSpec.children.find(childSpec => childSpec.name === '*' || childSpec.name === nodeRef)._childNode.customs
                    .filter(custom => custom.context?.includes('editor'))
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
                            defaultValue={thisNode?.data[custom.name]}
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
                (thisNode?.key !== '/')
                && (!!nodeSpec?._customs)
                &&
                (
                  // add custom fields from parentSpec if mandated by parent
                  nodeSpec._customs
                    .filter(custom => custom.context?.includes('editor'))
                    .map(custom => {
                      // console.log(`nodeSpec - custom`, custom)
                      if (!!hidden[customField.name]) {
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
                            defaultValue={thisNode?.data[custom.name]}
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
                (thisNode?.key !== '/')
                &&
                (
                  <Controller
                    key="_ref"
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
                            const typeSpec = found._childNode.types === 'inherit' ? found.types : found._childNode.types
                            return type_matches_spec(getValues('_type'), typeSpec)
                              || `Reference name [ ${value} ] does not allow type [ ${getValues('_type')?.replaceAll('/', ' / ')} ]`
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
                          color='secondary'
                          size="small"
                          // className={styles.formControl}
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
                          options={parentSpec?.children?.filter(spec => !!spec._childNode).map(child => child.name).filter(name => name !== '*')}
                          error={!!errors._ref}
                          helperText={errors._ref?.message}
                          />
                      </FormControl>
                    }
                  />
                )
              }
              {
                (thisNode?.key !== '/')
                &&
                (
                  <Controller
                    name="_type"
                    key="_type"
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
                            const typeSpec = found._childNode.types === 'inherit' ? found.types : found._childNode.types
                            return type_matches_spec(value, typeSpec)
                              || `Reference name [ ${getValues('_ref')} ] does not allow type [ ${value?.replaceAll('/', ' / ')} ]`
                          }
                        }
                      }
                    }}
                    render={innerProps =>
                      (
                        <FormControl
                          className={styles.formControl}
                          >
                          <TextField
                            label="Type"
                            select={true}
                            // className={styles.formControl}
                            name="_type"
                            value={innerProps.value}
                            required={true}
                            color='secondary'
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
                                const all_types = lookup_types()
                                return all_types
                                  .map(type => {
                                    const display = supported_types.includes(type) ? "block" : "none"
                                    return (
                                      <MenuItem value={type} key={type} style={{display:display}}>
                                        <ListItemIcon>
                                          { lookup_icon_for_type(type) }
                                        </ListItemIcon>
                                        <Typography variant="inherit" noWrap={true}>
                                          { type?.replaceAll('/', ' / ') }
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
                )
              }
              {
                (thisNode?.key !== '/')
                && nodeSpec?.children?.map(childSpec => {
                  if (!childSpec._thisNode?.input) {
                    return undefined
                  }
                  if (!!hidden[childSpec.name]) {
                    return undefined
                  }
                  if (childSpec._thisNode.input.kind === 'input/tabular') {
                    return undefined
                  }
                  // check if this is configured by child node
                  const childNode = lookup_child_for_ref(thisNode, childSpec.name)
                  if (!!childNode) {
                    return (
                      <Box
                        key={childSpec.name}
                        className={styles.formControl}
                        >
                        <FormHelperText style={{color: theme.palette.info.main}}>
                          { `${childSpec.desc || childSpec.name} is overriden by [${childSpec.name}] defined by child` }
                        </FormHelperText>
                      </Box>
                    )
                  }
                  // const childThisSpec = childSpec._thisNode
                  if (!!childSpec.array) {
                    return (
                      <InputFieldArray
                        key={childSpec.name}
                        name={childSpec.name}
                        size="small"
                        className={styles.formControl}
                        disabled={!!disabled[childSpec.name]}
                        defaultValue={_.get(thisNode?.data, childSpec.name)}
                        childSpec={childSpec}
                        inputSpec={childSpec._thisNode?.input}
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
                        size="small"
                        className={styles.formControl}
                        disabled={!!disabled[childSpec.name]}
                        defaultValue={_.get(thisNode?.data, childSpec.name)}
                        childSpec={childSpec}
                        inputSpec={childSpec._thisNode?.input}
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
                (thisNode?.key !== '/')
                && (() => {
                  if
                  (
                    nodeSpec?._input?.kind === 'input/properties'
                    && !!nodeSpec.children?.find(childSpec => childSpec.name === '*')
                  )
                  {
                    return <Box
                      className={styles.properties}
                      key={THIS_NODE_PROPERTIES}
                      >
                      <InputProperties
                        name={THIS_NODE_PROPERTIES}
                        key={THIS_NODE_PROPERTIES}
                        label={nodeSpec.desc}
                        inputSpec={nodeSpec._input}
                        options={propNameOptions[THIS_NODE_PROPERTIES] || []}
                        otherNames={nodeOtherNames[THIS_NODE_PROPERTIES] || []}
                        className={styles.formControl}
                        callback={d => {
                          // console.log(`callback`)
                          setBaseSubmitTimer(new Date())
                        }}
                      />
                    </Box>
                  }
                })()
              }
              {
                (thisNode?.key !== '/')
                && (() => {
                  if
                  (
                    nodeSpec?._input?.kind === 'input/tabular'
                  )
                  {
                    return <Box
                      className={styles.properties}
                      key={THIS_NODE_PROPERTIES}
                      >
                      <InputFieldTabular
                        name={THIS_NODE_PROPERTIES}
                        key={THIS_NODE_PROPERTIES}
                        label={nodeSpec.desc}
                        spec={nodeSpec._input}
                        className={styles.formControl}
                        callback={d => {
                          // console.log(`callback`)
                          setBaseSubmitTimer(new Date())
                        }}
                      />
                    </Box>
                  }
                })()
              }
              {
                (thisNode?.key !== '/')
                && nodeSpec?.children
                  .filter(childSpec => childSpec._childNode?.input?.kind === 'input/properties')
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
                                inputSpec={childSpec._childNode.input}
                                options={propNameOptions[childNode.data._ref] || []}
                                otherNames={nodeOtherNames[childNode.data._ref] || []}
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
                      return (
                        <Box
                          className={styles.properties}
                          key={childSpec.name}
                          >
                          <InputProperties
                            name={childSpec.name}
                            key={childSpec.name}
                            label={childSpec.desc}
                            inputSpec={childSpec._childNode.input}
                            options={propNameOptions[childSpec.name] || []}
                            otherNames={nodeOtherNames[childSpec.name] || []}
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
              {
                (thisNode?.key !== '/')
                && nodeSpec?.children
                  .filter(childSpec => childSpec._thisNode?.input?.kind === 'input/tabular')
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
                      throw new Error(`ERROR: [input/tabular] do not support [*]`)
                    } else {
                      // for specified property
                      return (
                        <Box
                          className={styles.properties}
                          key={childSpec.name}
                          >
                          <InputFieldTabular
                            name={childSpec.name}
                            key={childSpec.name}
                            label={childSpec.desc}
                            spec={childSpec._thisNode.input}
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
              {
                (thisNode?.key !== '/')
                && nodeSpec?.children
                  .filter(childSpec => childSpec._childNode?.input?.kind === 'input/tabular')
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
                      throw new Error(`ERROR: [input/tabular] do not support [*]`)
                    } else {
                      // for specified property
                      return (
                        <Box
                          className={styles.properties}
                          key={childSpec.name}
                          >
                          <InputFieldTabular
                            name={childSpec.name}
                            key={childSpec.name}
                            label={childSpec.desc}
                            spec={childSpec._childNode.input}
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
                <MemorizedYamlTab />
              }
              key="yaml"
              className={styles.editor}
              >
                <MemorizedYamlEditor />
            </TabPane>
          </Tabs>
        )
      }
      </form>
    </FormProvider>
  )
}

export default PropEditor
