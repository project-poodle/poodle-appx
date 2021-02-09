import React, { useState, useContext, useEffect, useCallback, useMemo, createContext } from "react"
import PropTypes from 'prop-types'
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  IconButton,
  TextField,
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
  useFieldArray,
} from 'react-hook-form'
import _ from 'lodash'
import InputProvider from 'app-x/widget/InputProvider'

// input array provider
const InputArrayProvider_Context = createContext()

// input array
const InputArrayProvider = (props) => {
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
  const propsId = !!context?.basename ? `${context.basename}.${props.id}` : props.id

  // useFieldArray
  const fieldArrayProps = useFieldArray({
    control,
    name: propsId,
  })
  // props
  const {
    fields,
    append,
    prepend,
    insert,
    swap,
    move,
    remove,
  } = fieldArrayProps

  const arrayItems =  fields.map((item, index) => {
    return (
      <InputProvider basename={`${propsId}[${index}]`}>
        {  props.item }
      </InputProvider>
    )
  })


  // return
  return (
    <InputArrayProvider_Context.Provider
      value={{...fieldArrayProps, items: arrayItems}}
      >
      { props.children }
    </InputArrayProvider_Context.Provider>
  )
}

InputArrayProvider.propTypes = {
  id: PropTypes.string.isRequired,
  item: PropTypes.element,
}

InputArrayProvider.appxType = 'appx/input/array'

InputArrayProvider.Context = InputArrayProvider_Context

export { InputArrayProvider_Context  as Context }

export default InputArrayProvider
