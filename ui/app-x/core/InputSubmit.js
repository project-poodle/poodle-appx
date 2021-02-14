import React, { useState, useContext, useEffect } from "react"
import PropTypes from 'prop-types'
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  IconButton,
  Submit,
  makeStyles,
  useTheme,
} from '@material-ui/core'
import {
  AddCircleOutline,
  RemoveCircleOutline,
} from '@material-ui/icons'
import {
  Controller,
  useFormContext,
} from 'react-hook-form'
import {
  AutoComplete,
} from 'antd'
import _ from 'lodash'
import InputProvider from 'app-x/core/InputProvider'

const InputSubmit = (props) => {
  // theme
  const theme = useTheme()
  // useFormContext
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
  } = useFormContext()

  // basename and propsId
  const context = useContext(InputProvider.Context)

  // return
  return (
    <Box
      {...(props.BoxProps || {})}
      style={props.style || {}}
      flexShrink={0}
      onClick={context?.onSubmit || (() => {})}
      >
      {
        props.children
      }
    </Box>
  )
}

InputSubmit.propTypes = {
  BoxProps: PropTypes.object,
  style: PropTypes.object,
}

InputSubmit.appxType = 'appx/input/submit'

export default InputSubmit
