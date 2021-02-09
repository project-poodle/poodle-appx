import React, { useState, useContext, useEffect } from "react"
import PropTypes from 'prop-types'
import {
  FormProvider,
  useForm,
} from 'react-hook-form'
import _ from 'lodash'
import InputProvider from 'app-x/widget/InputProvider'

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

  const onSubmit = () => {
    // console.log(`getValues`, getValues(), _.get(getValues(), 'tabular[0]'))
    handleSubmit(
      props.onSubmit,
      props.onError
    )()
  }

  // return
  return (
    <FormProvider
      {...useFormProps}
      >
      <InputProvider basename="" onSubmit={onSubmit}>
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
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
}

Form.appxType = 'appx/form'

export default Form
