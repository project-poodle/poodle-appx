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
  AutoComplete,
} from 'antd'
const { TabPane } = Tabs;
import { useForm, Controller } from "react-hook-form";
import { parse, parseExpression } from "@babel/parser"
// context provider
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import YamlEditor from 'app-x/builder/ui/YamlEditor'
import AutoCompleteHtmlTag from 'app-x/builder/ui/AutoCompleteHtmlTag'
import AutoCompleteImportName from 'app-x/builder/ui/AutoCompleteImportName'
// utilities
import {
  lookup_icon_for_type,
  lookup_icon_for_input,
  lookup_title_for_input,
  valid_import_names,
  valid_html_tags,
} from 'app-x/builder/ui/util_parse'
import {
  tree_traverse,
  tree_lookup,
  lookup_child_by_ref,
  gen_js,
} from 'app-x/builder/ui/util_tree'

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
      padding: theme.spacing(2, 0, 2, 2),
    },
    editor: {
      width: '100%',
      height: '100%',
    },
    basicTab: {
      width: '100%',
      height: '100%',
      overflow: 'scroll',
    },
  }))()

  // context
  const {
    treeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
    history,
    makeAction,
    updateAction,
    undo,
    redo,
  } = useContext(EditorProvider.Context)

  const [ nodeType,             setNodeType             ] = useState('')
  const [ treeNode,             setTreeNode             ] = useState(null)
  const [ parentNode,           setParentNode           ] = useState(null)
  const [ isSwitchDefault,      setSwitchDefault        ] = useState(props.isSwitchDefault)

  // react hook form
  const { register, control, reset, errors, trigger, handleSubmit, getValues, setValue } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    // defaultValues: {},
    // resolver: undefined,
    // context: undefined,
    // criteriaMode: "firstError",
    // shouldFocusError: true,
    // shouldUnregister: true,
  })

  useEffect(() => {
    // lookup node
    const lookupNode = tree_lookup(treeData, selectedKey)
    const lookupParent = !!lookupNode ? tree_lookup(treeData, lookupNode.parentKey) : null
    setTreeNode(lookupNode)
    setParentNode(lookupParent)
    // console.log(treeNode)
    // console.log(parentNode)
    if (lookupNode) {
      setNodeType(lookupNode.data.type)
      Object.keys(lookupNode.data).map(k => {
        if (!!k && k !== 'type') {
          setValue(k, lookupNode.data[k])
        }
      })
    }
  }, [selectedKey])

  // base submit timer
  const [ baseSubmitTimer, setBaseSubmitTimer ] = useState(new Date())
  useEffect(() => {
    setTimeout(() => {
      handleSubmit(onBaseSubmit)()
    }, 300)
  }, [baseSubmitTimer])

  // submit base tab
  function onBaseSubmit(data) {
    const resultTree = _.cloneDeep(treeData)
    const lookupNode = tree_lookup(resultTree, selectedKey)
    if (lookupNode) {
      // console.log(data)
      lookupNode.data = data
      if (!!data.__ref) {
        lookupNode.data.__ref = data.__ref
      } else {
        lookupNode.data.__ref = null
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
      lookupNode.title = lookup_title_for_input(lookupNode.data.__ref, data)
      lookupNode.icon = lookup_icon_for_input(data)
      // console.log(lookupNode)
      // setTreeData(resultTree)
      updateAction(
        `Update [${lookupNode.title}]`,
        resultTree,
        expandedKeys,
        selectedKey,
        lookupNode.key,
      )
    }
  }

  // render
  return (
    <Box className={styles.root}>
      <form onSubmit={() => {return false}} className={styles.root}>
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
              Select an element to edit
            </Typography>
          </Box>
        )
      }
      {
        (treeNode)
        &&
        (
          <Tabs defaultActiveKey="basic" className={styles.editor} tabPosition="right" size="small">
            <TabPane tab="Base" key="basic" className={styles.basicTab}>
              <Box className={styles.editor}>
              {
                (
                  treeNode?.data?.__ref !== null
                  && parentNode?.data?.type !== 'js/switch'
                  && parentNode?.data?.type !== 'js/map'
                  && parentNode?.data?.type !== 'js/reduce'
                  && parentNode?.data?.type !== 'js/filter'
                  && parentNode?.data?.type !== 'react/element'
                  && parentNode?.data?.type !== 'react/html'
                )
                &&
                (
                  <Controller
                    name="__ref"
                    control={control}
                    defaultValue={treeNode?.data?.__ref}
                    rules={{
                      required: 'Reference name is required',
                      validate: {
                        //checkDuplicate: value =>
                        //  !value
                        //  || !parentNode
                        //  || lookup_child_by_ref(parentNode, value)?.key === treeNode.key
                        //  || 'Reference name already exists'
                      },
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Reference"
                            name={props.name}
                            value={props.value}
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
                          <FormControlLabel
                            control={
                              <Switch
                                name={props.name}
                                checked={props.value}
                                onChange={e => {
                                  props.onChange(e.target.checked)
                                  setSwitchDefault(e.target.checked)
                                  setBaseSubmitTimer(new Date())
                                }}
                              />
                            }
                            label=""
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
                            parseExpression(value)
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
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
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
                                <FormControlLabel
                                  control={
                                    <Switch
                                      name={props.name}
                                      checked={props.value}
                                      onChange={ e => {
                                        props.onChange(e.target.checked)
                                        setBaseSubmitTimer(new Date())
                                      }}
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
                          defaultValue={treeNode?.data?.data}
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
                                    name={props.name}
                                    value={props.value}
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
                (treeNode && treeNode.data && nodeType == 'js/array')
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
                (treeNode && treeNode.data && nodeType == 'js/object')
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
                (treeNode && treeNode.data && nodeType == 'A')
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
                      }}
                      render={props =>
                      (
                        <Box className={styles.formControl}>
                          <AutoCompleteImportName
                            name={props.name}
                            value={props.value}
                            onChange={props.onChange}
                            errors={errors}
                            selectedKey={selectedKey}
                            title="Import Name"
                            callback={data => {
                              setBaseSubmitTimer(new Date())
                            }}
                          />
                        </Box>
                      )
                    }
                    />
                  </Box>
                )
              }
              {
                (treeNode && treeNode.data && nodeType == 'js/block')
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
                                label="Code"
                                multiline={true}
                                name={props.name}
                                value={props.value}
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
                (treeNode && treeNode.data && nodeType == 'js/function')
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
                    <Controller
                      name="data"
                      control={control}
                      defaultValue={treeNode?.data?.params}
                      rules={{
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                              <TextField
                                label="Parameters"
                                multiline={true}
                                name={props.name}
                                value={props.value}
                                onChange={ e => {
                                  props.onChange(e.target.value)
                                  setBaseSubmitTimer(new Date())
                                }}
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
                      defaultValue={treeNode?.body?.body}
                      rules={{
                        required: "Body is required",
                        validate: {
                          expressionSyntax: value => {
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
                                name={props.name}
                                value={props.value}
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
                (treeNode && treeNode.data && nodeType == 'js/switch')
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
                (treeNode && treeNode.data && nodeType == 'js/map')
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
                (treeNode && treeNode.data && nodeType == 'js/reduce')
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
                                name={props.name}
                                value={props.value}
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
                  </Box>
                )
              }
              {
                (treeNode && treeNode.data && nodeType == 'js/filter')
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
                                name={props.name}
                                value={props.value}
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
                        required: 'Type is required',
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                            <TextField
                              label="Type"
                              select={true}
                              value={props.value}
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
                        }}
                        render={props =>
                          (
                            <Box className={styles.formControl}>
                              <AutoCompleteImportName
                                name={props.name}
                                value={props.value}
                                onChange={props.onChange}
                                errors={errors}
                                selectedKey={selectedKey}
                                title="Element Name"
                                callback={data => {
                                  setBaseSubmitTimer(new Date())
                                }}
                              />
                            </Box>
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
                          <Box className={styles.formControl}>
                            <AutoCompleteImportName
                              name={props.name}
                              value={props.value}
                              onChange={props.onChange}
                              errors={errors}
                              selectedKey={selectedKey}
                              title="HTML Tag"
                              callback={data => {
                                setBaseSubmitTimer(new Date())
                              }}
                            />
                          </Box>
                        )
                      }
                      />
                    }
                  </Box>
                )
              }
              {
                (treeNode && treeNode.data && nodeType == 'react/state')
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
                        required: "Initial value is required",
                      }}
                      render={props =>
                        (
                          <FormControl className={styles.formControl}>
                              <TextField
                                label="Init"
                                name={props.name}
                                value={props.value}
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
                (treeNode && treeNode.data && nodeType == 'react/effect')
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
                                label="Expression"
                                multiline={true}
                                name={props.name}
                                value={props.value}
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
                (treeNode && treeNode.data && nodeType == 'mui/style')
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
                (treeNode && treeNode.data && nodeType == 'appx/route')
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
              </Box>
            </TabPane>
            <TabPane tab="YAML" key="advanced" className={styles.editor}>
              <YamlEditor />
            </TabPane>
          </Tabs>
        )
      }
      </form>
    </Box>
  )
}

export default PropEditor
