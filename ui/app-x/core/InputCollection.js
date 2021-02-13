import React, { useState, useContext, useEffect, useCallback, useMemo } from "react"
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
import InputProvider from 'app-x/core/InputProvider'

// input array
const InputCollection = (props) => {
  // useFormContext
  const formProps = useFormContext()
  // props
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
  } = formProps

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

  // render
  const Render = props.render || (() => null)

  // return
  return (
    <React.Fragment>
      <Render
        itemPanels={
          fields.map((item, index) => {
            // console.log(`fieldArrayProps.fields [item]`, item)
            const ItemPanel = props.itemPanel || (() => null)
            return (
              <InputProvider
                key={item.id}
                basename={`${propsId}[${index}]`}
                >
                <ItemPanel
                  item={item}
                  index={index}
                  formProps={formProps}
                  fieldArrayProps={fieldArrayProps}
                />
              </InputProvider>
            )
          })
        }
        formProps={formProps}
        fieldArrayProps={fieldArrayProps}
        >
      </Render>
    </React.Fragment>
  )
}

InputCollection.propTypes = {
  id: PropTypes.string.isRequired,
  itemPanel: PropTypes.func,
  render: PropTypes.func,
}

InputCollection.appxType = 'appx/input/array'

export default InputCollection
