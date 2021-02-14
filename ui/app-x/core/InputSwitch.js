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
import InputProvider from 'app-x/core/InputProvider'

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

  // basename and propsId
  const context = useContext(InputProvider.Context)
  const propsId = !!context?.basename ? `${context.basename}.${props.id}` : props.id
  // console.log(`InputSwitch propsId [${propsId}]`)

  // rules
  const rules = props.rules || {}
  if (!!props.required) {
    rules.required = `${props.label || props.id} is required`
  }

  // not array
  return (
    <Box
      {...(props.BoxProps || {})}
      style={props.style || {}}
      >
      <Controller
        key={propsId}
        name={propsId}
        required={!!props.required}
        constrol={control}
        defaultValue={!!_.get(getValues(), propsId)}
        rules={rules}
        render={innerProps => (
          <FormControl
            name={propsId}
            style={{width:'100%'}}
            error={!!_.get(errors, propsId)}
            disabled={!!props.SwitchProps?.disabled}
            >
            {
              !!props.label
              &&
              (
                <Box
                  style={{width: '100%', paddingBottom: theme.spacing(2)}}
                  >
                  <InputLabel
                    key="label"
                    shrink={true}
                    required={!!props.required}
                  >
                    { props.label }
                  </InputLabel>
                </Box>
              )
            }
            <Switch
              {...(props.SwitchProps || {})}
              name={propsId}
              required={!!props.required}
              checked={innerProps.value}
              value={innerProps.value}
              onChange={e => {
                innerProps.onChange(e.target.checked)
                if (!!props.callback) {
                  props.callback(e.target.checked)
                }
              }}
              >
            </Switch>
            {
              !!_.get(errors, propsId)
              &&
              <FormHelperText>{_.get(errors, propsId)?.message || ''}</FormHelperText>
            }
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

InputSwitch.defaultValue = false

export default InputSwitch
