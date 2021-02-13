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
    props.formProps || {}
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
      props.onError
    )()
  }

  // onReset
  const onReset = () => {
    /*
    // recursive function to set form data
    function setFormData(key, value) {
      if (isPrimitive(value)) {
        setValue(key, value)
      } else if (Array.isArray(value)) {
        setValue(key, value)
        value.map((row, index) => {
          setFormData(`${key}[${index}]`, row)
        })
      } else if (typeof value === 'object') {
        setValue(key, value)
        Object.keys(value).map(childKey => {
          const childData = value[childKey]
          setFormData(`${key}.${childKey}`, childData)
        })
      } else {
        throw new Error(`ERROR: unexpected data type [${JSON.stringify(value)}]`)
      }
    }
    */
    // set form default value
    if (!!props.defaultValue) {
      // Object.keys(props.defaultValue).map(key => {
      //   setFormData(key, _.get(props.defaultValue, key))
      // })
      reset(props.defaultValue)
    } else {
      // reset
      reset()
    }
    // console.log(`Form getValues`, getValues())
  }

  useEffect(() => {
    onReset()
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
  formProps: PropTypes.object,
  defaultValue: PropTypes.object,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
}

Form.appxType = 'appx/form'

export default Form
