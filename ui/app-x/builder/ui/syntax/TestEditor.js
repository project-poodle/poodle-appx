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
import { useForm, FormProvider, Controller } from "react-hook-form";
// context provider
import TextFieldArray from 'app-x/component/TextFieldArray'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import AutoCompleteHtmlTag from 'app-x/builder/ui/syntax/AutoCompleteHtmlTag'
import AutoCompleteImportName from 'app-x/builder/ui/syntax/AutoCompleteImportName'
// utilities
import {
  valid_import_names,
  valid_html_tags,
} from 'app-x/builder/ui/syntax/util_parse'

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
      overflow: 'scroll',
    },
    formControl: {
      width: '100%',
      // margin: theme.spacing(1),
      padding: theme.spacing(2, 0, 2, 2),
    },
  }))()

  // context
  const {
    // test data
    testData,
    setTestData,
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

  return (
    <Box
      className={styles.root}
      >
      <FormProvider {...hookForm}>
        <form onSubmit={() => {return false}} className={styles.root}>
          <Box className={styles.basicTab}>
            <TextFieldArray
              key="providers"
              name="providers"
              label="Context Providers"
              type="text"
              defaultValues={testData?.providers}
              className={styles.formControl}
              rules={{
                required: "Context provider is required",
              }}
              callback={data => {
                console.log(data)
              }}
            />
          </Box>
        </form>
      </FormProvider>
    </Box>
  )
}

export default TestEditor
