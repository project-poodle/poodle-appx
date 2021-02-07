import React, { useState, useContext, useEffect } from "react"
import PropTypes from 'prop-types'
import {
  FormProvider,
  useForm,
} from 'react-hook-form'
import _ from 'lodash'

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

  // return
  return (
    <FormProvider
      {...useFormProps}
      >
      <form
        onSubmit={handleSubmit(
          props.onSubmit,
          props.onError
        )}
        >
        { props.children }
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
