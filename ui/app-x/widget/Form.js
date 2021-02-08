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

  const onSubmit = handleSubmit(
    props.onSubmit,
    props.onError
  )

  // return
  return (
    <FormProvider
      {...useFormProps}
      >
      <form
        onSubmit={onSubmit}
        >
        <InputProvider basename="" onSubmit={onSubmit}>
          { props.children }
        </InputProvider>
      </form>
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
