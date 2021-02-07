import React, { useState, useContext, useEffect } from "react"
import PropTypes from 'prop-types'
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  IconButton,
  Switch,
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

const InputSwitch = (props) => {
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

  // not array
  return (
    <Box
      {...(props.BoxProps || {})}
      style={props.style}
      >
      <Controller
        key={props.id}
        name={props.id}
        required={props.required}
        constrol={control}
        defaultValue={props.defaultValue || false}
        rules={props.rules}
        render={innerProps => (
          <FormControl
            style={{width:'100%'}}
            error={_.get(errors, props.id)}
            >
            {
              !!props?.label
              &&
              (
                <Box
                  style={{width: '100%', paddingBottom: theme.spacing(2)}}
                  >
                  <InputLabel
                    key="label"
                    shrink={true}
                    required={props.required}
                  >
                    { props.label }
                  </InputLabel>
                </Box>
              )
            }
            <Switch
              {...(props.SwitchProps || {})}
              name={props.id}
              required={!!props.required}
              checked={innerProps.value}
              value={innerProps.value}
              onChange={e => {
                innerProps.onChange(e.target.value)
                if (!!props.callback) {
                  props.callback(e.target.value)
                }
              }}
              error={!!_.get(errors, props.id)}
              helperText={_.get(errors, props.id)?.message}
              >
            </Switch>
          </FormControl>
        )}
        >
      </Controller>
    </Box>
  )
}

InputSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
  defaultValue: PropTypes.bool,
  callback: PropTypes.func,
  BoxProps: PropTypes.object,
  SwitchProps: PropTypes.object,
  style: PropTypes.object,
  rules: PropTypes.object,
}

InputSwitch.appxType = 'appx/input/switch'

export default InputSwitch
