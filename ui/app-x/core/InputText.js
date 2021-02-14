import React, { useState, useContext, useEffect } from "react"
import PropTypes from 'prop-types'
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  TextField,
  IconButton,
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
import {
  AutoComplete,
} from 'antd'
import _ from 'lodash'
import InputProvider from 'app-x/core/InputProvider'

const InputText = (props) => {
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

  // options
  const [ _searchOptions, _setSearchOptions ] = useState([])
  useEffect(() => {
    if (!!props.options) {
      _setSearchOptions(props.options.map(n => ({value: n})))
      // console.log(`props.options`, props.options)
    } else {
      _setSearchOptions([])
    }
  }, [props.options])

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
        defaultValue={props.defaultValue || ''}
        rules={rules}
        render={innerProps => (
          <FormControl
            name={propsId}
            style={{width:'100%'}}
            error={!!_.get(errors, propsId)}
            disabled={!!props.TextProps?.disabled}
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
            <AutoComplete
              name={propsId}
              style={{width:'100%'}}
              disabled={!!props.TextProps?.disabled}
              options={_searchOptions}
              value={innerProps.value}
              onChange={data => {
                innerProps.onChange(data)
                // if (!!props.callback) {
                //   props.callback(data)
                // }
              }}
              onSearch={s => {
                const s_list = s.toUpperCase().split(' ').filter(s => !!s)
                const matches = (props.options || [])
                  .filter(option => {
                    const upper = option.toUpperCase()
                    return s_list.reduce((accumulator, item) => {
                      return !!accumulator && upper.includes(item)
                    }, true)
                  })
                  .map(n => ({value: n}))
                _setSearchOptions(matches)
              }}
              >
              <TextField
                {...(props.TextProps || {})}
                name={propsId}
                required={!!props.required}
                style={{width:'100%'}}
                value={innerProps.value}
                onChange={e => {
                  innerProps.onChange(e.target.value)
                  if (!!props.callback) {
                    props.callback(e.target.value)
                  }
                }}
                error={!!_.get(errors, propsId)}
                helperText={_.get(errors, propsId)?.message || ''}
                >
              </TextField>
            </AutoComplete>
          </FormControl>
        )}
        >
      </Controller>
    </Box>
  )
}

InputText.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ),
  defaultValue: PropTypes.string,
  callback: PropTypes.func,
  BoxProps: PropTypes.object,
  TextProps: PropTypes.object,
  style: PropTypes.object,
  rules: PropTypes.object,
}

InputText.appxType = 'appx/input/text'

InputText.defaultValue = ''

export default InputText
