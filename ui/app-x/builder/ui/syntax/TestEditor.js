import React, { useState, useContext, useEffect } from "react"
import YAML from 'yaml'
import _ from 'lodash'
// material ui
import {
  Box,
  Container,
  Grid,
  Button,
  Typography,
  FormControl,
  InputLabel,
  FormHelperText,
  FormControlLabel,
  Switch,
  Select,
  Input,
  TextField,
  IconButton,
  MenuItem,
  makeStyles
} from '@material-ui/core'
import {
  AddCircleOutline,
  RemoveCircleOutline,
} from '@material-ui/icons'
// ant design
import {
  Tabs,
} from 'antd'
const { TabPane } = Tabs;
import {
  useForm,
  useFieldArray,
  FormProvider,
  Controller
} from "react-hook-form";
// context provider
import AutoSuggest from 'app-x/component/AutoSuggest'
import TextFieldArray from 'app-x/component/TextFieldArray'
import PropFieldArray from 'app-x/component/PropFieldArray'
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
// utilities
import {
  isPrimitive,
  valid_api_methods,
  valid_import_names,
  valid_html_tags,
} from 'app-x/builder/ui/syntax/util_base'
import {
  tree_lookup,
} from 'app-x/builder/ui/syntax/util_parse'

let pendingTimer = new Date()

const TestEditor = (props) => {
  // make styles
  const styles = makeStyles((theme) => ({
    root: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    basicTab: {
      width: '100%',
      height: '100%',
      padding: theme.spacing(2, 2),
      overflow: 'scroll',
    },
    contextProvider: {
      width: '100%',
      padding: theme.spacing(2, 0, 2),
      // border
      border: 1,
      borderLeft: 0,
      borderRight: 0,
      borderBottom: 0,
      borderStyle: 'dotted',
      borderColor: theme.palette.divider,
    },
    formControl: {
      width: '100%',
      padding: theme.spacing(0, 0),
    },
    props: {
      width: '100%',
      padding: theme.spacing(2, 0, 2, 5),
    },
    addProvider: {
      margin: theme.spacing(2, 0),
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
    // test data
    testData,
    // dirty flags
    testDirty,
    setTestDirty,
    // common
    loadTimer,
    setLoadTimer,
    previewInitialized,
    setPreviewInitialized,
    // history and actions
    // makeFreshAction,
    // makeDesignAction,
    // makeTestAction,
    // updateDesignAction,
    updateTestAction,
    // history,
    // undo,
    // redo,
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

  const {
    fields: fieldsProvider,
    append: appendProvider,
    prepend: prependProvider,
    remove: removeProvider,
    swap: swapProvider,
    move: moveProvider,
    insert: insertProvider,
  } = useFieldArray(
    {
      control,
      name: 'providers',
    }
  )

  // test submit timer
  const [ testSubmitTimer,    setTestSubmitTimer  ] = useState(0)
  useEffect(() => {
    if (testSubmitTimer > 0) {
      setTestDirty(true)
      pendingTimer = testSubmitTimer
      setTimeout(() => {
        const timeDiff = (new Date()).getTime() - pendingTimer.getTime()
        if (timeDiff < 500) {
          return  // do not process, just return
        } else {
          // console.log(`errors`, errors)
          // console.log(`onTestSubmit [${pendingTimer.getTime()}]`)
          handleSubmit(onTestSubmit)()
        }
      }, 550)
    }
  }, [testSubmitTimer])

  // load test data
  useEffect(() => {
    // check if provider exists
    if (!testData?.providers?.length) {
      setValue('providers', [])
      return
    }
    // we are here if provider exists
    const defaultValues = []
    testData.providers
      .filter(provider => provider?._type === 'react/element')
      .map((provider, index) => {
        // console.log(`provider`, provider)
        // iterate props
        const props =
          (
            !!provider?.props
            && !!(Object.keys(provider.props).length)
          )
          ? Object.keys(provider.props)
              .filter(key => (
                provider.props[key]?._type === 'js/string'
                || provider.props[key]?._type === 'js/number'
                || provider.props[key]?._type === 'js/boolean'
                || provider.props[key]?._type === 'js/null'
                || provider.props[key]?._type === 'js/impression'
                || provider.props[key]?._type === 'js/import'
              ))
              .map((key, childIndex) => {
                return {
                  // id: `providers[${index}].props[${childIndex}]`,
                  type: provider.props[key]._type,
                  name: key,
                  value: provider.props[key]._type === 'js/import'
                        ? provider.props[key].name
                        : provider.props[key].data,
                }
              })
          : []
        // iterate other names
        const otherNames =
        (
          !!provider?.props
          && !!(Object.keys(provider.props).length)
        )
        ? Object.keys(provider.props)
            .filter(key => (
              provider.props[key]?._type !== 'js/string'
              && provider.props[key]?._type !== 'js/number'
              && provider.props[key]?._type !== 'js/boolean'
              && provider.props[key]?._type !== 'js/null'
              && provider.props[key]?._type !== 'js/impression'
              && provider.props[key]?._type !== 'js/import'
            ))
            .map(key => key)
        : []
        defaultValues.push({
          // id: `providers[${index}]`,
          name: provider.name,
          props: props,
          otherNames: otherNames,
        })
      }
    )
    // set default value
    setValue('providers', defaultValues)
    // clear testDirty
    setTestDirty(false)
  },
  [
    navDeployment,
    navComponent,
    navRoute,
    navSelected,
    loadTimer,
    testData,
  ])

  // submit test data
  function onTestSubmit(data) {

    // console.log(`data`, data)
    // return

    // convert form data to result test data
    const resultTestData = {}
    if (!data?.providers?.length) {
      return
    }
    // we are here if data.providers has data
    resultTestData.providers = []
    data.providers.map(provider => {
      // console.log(`gen provider`, provider)
      const providerElem = {
        type: 'react/element',
        name: provider.name,
      }
      // if no properties, add provider and return
      if (!provider?.props?.length) {
        resultTestData.providers.push(providerElem)
        return
      }
      // we are here if provider.props has data
      providerElem.props = {}
      provider.props.map(child => {
        if (child._type === 'js/string') {
          providerElem.props[child.name] = {
            type: child._type,
            data: String(child.value)
          }
        } else if (child._type === 'js/number') {
          providerElem.props[child.name] = {
            type: child._type,
            data: Number(child.value)
          }
        } else if (child._type === 'js/boolean') {
          providerElem.props[child.name] = {
            type: child._type,
            data: Boolean(child.value)
          }
        } else if (child._type === 'js/null') {
          providerElem.props[child.name] = {
            type: child._type,
            data: null
          }
        } else if (child._type === 'js/expression') {
          providerElem.props[child.name] = {
            type: child._type,
            data: child.value
          }
        } else if (child._type === 'js/import') {
          providerElem.props[child.name] = {
            type: child._type,
            name: child.value
          }
        }
      })
      // console.log(`providerElem`, providerElem)
      resultTestData.providers.push(providerElem)
    })
    // console.log(lookupNode)
    // console.log(`resultTestData`, resultTestData)
    updateTestAction(
      `Update [test]`,
      resultTestData,
    )
    // clear test dirty flag
    setTestDirty(false)
  }

  return (
    <Box className={styles.root}>
      <FormProvider {...hookForm}>
        <form onSubmit={() => {return false}} className={styles.root}>
          <Box className={styles.basicTab}>
            {
              fieldsProvider.map((item, index) => {
                return (
                  <Box key={item.id} className={styles.contextProvider}>
                    <FormHelperText key="title">Context Provider</FormHelperText>
                    <Box key='element' display="flex" className={styles.formControl}>
                      <Controller
                        key="controller"
                        name={`providers[${index}].name`}
                        control={control}
                        defaultValue={item.name}
                        rules={{
                          required: 'Context provider name is required',
                          validate: {
                            valid_name: value => (
                              valid_import_names().includes(value)
                              || "Must use a valid name"
                            )
                          }
                        }}
                        render={innerProps =>
                          (
                            <FormControl key="formcontrol" className={styles.formControl}>
                              <AutoSuggest
                                key={item.id}
                                name={`providers[${index}].name`}
                                className={styles.formControl}
                                value={innerProps.value}
                                onChange={innerProps.onChange}
                                options={valid_import_names()}
                                callback={d => {
                                  // console.log(`submit providers[${index}].name`)
                                  setTestSubmitTimer(new Date())
                                }}
                                >
                              </AutoSuggest>
                            </FormControl>
                          )
                        }
                      />
                      <IconButton
                        key="remove"
                        aria-label="Remove"
                        size="small"
                        onClick={e => {
                          removeProvider(index)
                          // console.log(`remove providers[${index}].name`)
                          setTestSubmitTimer(new Date())
                        }}
                        >
                        <RemoveCircleOutline />
                      </IconButton>
                    </Box>
                    <Box key='props' className={styles.props}>
                      <PropFieldArray
                        name={`providers[${index}].props`}
                        label="Properties"
                        defaultValue={item.props}
                        otherNames={item.otherNames}
                        className={styles.formControl}
                        callback={d => {
                          setTestSubmitTimer(new Date())
                        }}
                      />
                    </Box>
                  </Box>
                )
              })
            }
            <Button
              variant="outlined"
              color="secondary"
              aria-label="Add Context Provider"
              startIcon={<AddCircleOutline />}
              className={styles.addProvider}
              onClick={e => {
                appendProvider({
                  //id: `providers[${fields.length}]`,
                  name: '',
                  props: [],
                })
                // setTestSubmitTimer(new Date())
              }}
            >
              Add Context Provider
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Box>
  )
}

export default TestEditor
