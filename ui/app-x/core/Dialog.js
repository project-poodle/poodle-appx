import React, { useState, useContext, useEffect } from "react"
import PropTypes from 'prop-types'
import {
  Dialog as MuiDialog,
  DialogTitle,
} from '@material-ui/core'
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

const Dialog = (props) => {
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
      (data) => {
        props.onSubmit && props.onSubmit(data)
        props.setOpen && props.setOpen(false)
      },
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
    // close the dialog
    props.setOpen && props.setOpen(false)
  }

  useEffect(() => {
    if (!!props.defaultValue) {
      // set form default value
      reset(props.defaultValue)
    } else {
      // reset
      reset()
    }
  }, [props.defaultValue, props.open])

  // return
  return (
    <MuiDialog
      {...(props.DialogProps || {})}
      style={props.style || {}}
      open={!!props.open}
      onClose={e => props.setOpen && props.setOpen(false)}
      aria-labelledby={`dialog-title-${props.title.replace(/[^a-zA-Z0-9]/g, '-')}`}
      >
      <FormProvider
        { ...useFormProps }
        >
        <InputProvider basename="" onSubmit={onSubmit} onReset={onReset}>
          <form
            onSubmit={onSubmit}
            >
            <DialogTitle id={`dialog-title-${props.title.replace(/[^a-zA-Z0-9]/g, '-')}`}>
              { props.icon }
              { props.title }
            </DialogTitle>
            {
              props.children
            }
          </form>
        </InputProvider>
      </FormProvider>
    </MuiDialog>
  )
}

Dialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.element,
  defaultValue: PropTypes.object,
  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
  FormProps: PropTypes.object,
  DialogProps: PropTypes.object,
  style: PropTypes.object,
}

Dialog.appxType = 'appx/dialog'

export default Dialog
