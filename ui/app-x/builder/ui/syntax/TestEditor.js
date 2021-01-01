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
import AutoComplete from 'app-x/component/AutoComplete'
import TextFieldArray from 'app-x/component/TextFieldArray'
import PropFieldArray from 'app-x/component/PropFieldArray'
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
// utilities
import {
  valid_import_names,
  isPrimitive,
} from 'app-x/builder/ui/syntax/util_parse'
import {
  tree_lookup,
} from 'app-x/builder/ui/syntax/util_tree'

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
      paddingLeft: theme.spacing(5)
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
    treeData,
    expandedKeys,
    selectedKey,
    // test data
    testData,
    // common
    loadTimer,
    // update action
    updateAction,
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
  const [ testSubmitTimer, setTestSubmitTimer ] = useState(0)
  useEffect(() => {
    if (testSubmitTimer > 0) {
      setTimeout(() => {
        console.log(`errors`, errors)
        handleSubmit(onTestSubmit)()
      }, 500)
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
      .filter(provider => provider?.type === 'react/element')
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
                provider.props[key]?.type === 'js/string'
                || provider.props[key]?.type === 'js/number'
                || provider.props[key]?.type === 'js/boolean'
                || provider.props[key]?.type === 'js/null'
                || provider.props[key]?.type === 'js/impression'
                || provider.props[key]?.type === 'js/import'
              ))
              .map((key, childIndex) => {
                return {
                  // id: `providers[${index}].props[${childIndex}]`,
                  type: provider.props[key].type,
                  name: key,
                  value: provider.props[key].type === 'js/import'
                        ? provider.props[key].name
                        : provider.props[key].data,
                }
              })
          : []

        defaultValues.push({
          // id: `providers[${index}]`,
          name: provider.name,
          props: props,
        })
      }
    )
    // set default value
    setValue('providers', defaultValues)
  },
  [
    navDeployment,
    navComponent,
    navRoute,
    navSelected,
    loadTimer,
    !!testData,
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
        if (child.type === 'js/string') {
          providerElem.props[child.name] = {
            type: child.type,
            data: String(child.value)
          }
        } else if (child.type === 'js/number') {
          providerElem.props[child.name] = {
            type: child.type,
            data: Number(child.value)
          }
        } else if (child.type === 'js/boolean') {
          providerElem.props[child.name] = {
            type: child.type,
            data: Boolean(child.value)
          }
        } else if (child.type === 'js/null') {
          providerElem.props[child.name] = {
            type: child.type,
            data: null
          }
        } else if (child.type === 'js/expression') {
          providerElem.props[child.name] = {
            type: child.type,
            data: child.value
          }
        } else if (child.type === 'js/import') {
          providerElem.props[child.name] = {
            type: child.type,
            name: child.value
          }
        }
      })
      // console.log(`providerElem`, providerElem)
      resultTestData.providers.push(providerElem)
    })
    // console.log(lookupNode)
    // console.log(`resultTestData`, resultTestData)
    updateAction(
      `Update [test]`,
      treeData,
      resultTestData,
      expandedKeys,
      selectedKey,
      '__test',
    )
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
                    <FormHelperText>Context Provider</FormHelperText>
                    <Box key='element' display="flex" className={styles.formControl}>
                      <AutoComplete
                        className={styles.formControl}
                        key="name"
                        name={`providers[${index}].name`}
                        type="text"
                        defaultValue={item.name}
                        options={valid_import_names()}
                        rules={{
                          required: 'Context provider name is required'
                        }}
                        callback={d => {
                          console.log(`submit providers[${index}].name`)
                          setTestSubmitTimer(new Date())
                        }}
                        >
                      </AutoComplete>
                      <IconButton
                        key="remove"
                        aria-label="Remove"
                        onClick={e => {
                          removeProvider(index)
                          console.log(`remove providers[${index}].name`)
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
                        className={styles.formControl}
                        callback={d => {
                          console.log(`callback providers[${index}].props`)
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
