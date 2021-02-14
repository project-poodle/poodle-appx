import React, { useState, useContext, useEffect } from "react"
import PropTypes from 'prop-types'
import {
  FormProvider,
  useForm,
} from 'react-hook-form'
import _ from 'lodash'
import InputProvider from 'app-x/core/InputProvider'

// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
}

const Form = (props) => {
  // useForm hook
  const useFormProps = useForm(
    props.FormProps || {}
  )
  // console.log('useFormProps', useFormProps)
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
  } = useFormProps

  // onSubmit
  const onSubmit = () => {
    // console.log(`getValues`, getValues(), _.get(getValues(), 'tabular[0]'))
    handleSubmit(
      props.onSubmit,
      (error) => {
        console.log(error)
      }
    )()
  }

  // onReset
  const onReset = () => {
    if (!!props.defaultValue) {
      // set form default value
      reset(props.defaultValue)
    } else {
      // reset
      reset()
    }
    if (!!props.onReset) {
      props.onReset()
    }
    // console.log(`Form getValues`, getValues())
  }

  useEffect(() => {
    if (!!props.defaultValue) {
      // set form default value
      reset(props.defaultValue)
    } else {
      // reset
      reset()
    }
  }, [props.defaultValue])

  // return
  return (
    <FormProvider
      {...useFormProps}
      >
      <InputProvider basename="" onSubmit={onSubmit} onReset={onReset}>
        <form
          onSubmit={onSubmit}
          >
          { props.children }
        </form>
      </InputProvider>
    </FormProvider>
  )
}

Form.propTypes = {
  defaultValue: PropTypes.object,
  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
  FormProps: PropTypes.object,
}

Form.appxType = 'appx/form'

export default Form
