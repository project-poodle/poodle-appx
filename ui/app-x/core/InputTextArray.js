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

const InputTextArray = (props) => {
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
    rules.required = `${props.label || props.name} is required`
  }

  // useFieldArray
  const {
    fields,
    append,
    prepend,
    insert,
    swap,
    move,
    remove,
  } = useFieldArray({
    control,
    name: propsId,
  })

  return (
    <Box
      {...(props.BoxProps || {})}
      style={props.style || {}}
      >
      {
        !!props.label
        &&
        (
          <InputLabel
            key="label"
            shrink={true}
            required={!!props.required}
          >
            { props.label }
          </InputLabel>
        )
      }
      {
        fields.map((item, index) => {
          return (
            <Box
              key={item.id}
              display="flex"
              style={{width:'100%'}}
              >
              <Controller
                key={item.id}
                name={`${propsId}[${index}].value`}
                control={control}
                required={!!props.required}
                defaultValue={item.value || ''}
                rules={rules}
                render={innerProps => (
                  <FormControl
                    name={`${propsId}[${index}].value`}
                    style={{width:'100%'}}
                    error={!!_.get(errors, name)}
                    disabled={!!props.TextProps?.disabled}
                    >
                    <AutoComplete
                      options={_searchOptions}
                      name={`${propsId}[${index}].value`}
                      disabled={!!props.TextProps?.disabled}
                      options={_searchOptions}
                      value={innerProps.value}
                      onChange={data => {
                        innerProps.onChange(data)
                        if (!!props.callback) {
                          props.callback(data)
                        }
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
                        name={`${propsId}[${index}].value`}
                        required={!!props.required}
                        style={{width:'100%'}}
                        value={innerProps.value}
                        onChange={e => {
                          innerProps.onChange(e.target.value)
                          if (!!props.callback) {
                            props.callback(e.target.value)
                          }
                        }}
                        error={!!_.get(errors, `${propsId}[${index}].value`)}
                        helperText={_.get(errors, `${propsId}[${index}].value`)?.message || ''}
                        >
                      </TextField>
                    </AutoComplete>
                  </FormControl>
                )}
                >
              </Controller>
              {
                !props.readOnly
                &&
                (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    >
                    <IconButton
                      key="remove"
                      aria-label="Remove"
                      size="small"
                      onClick={e => {
                        remove(index)
                        if (!!props.callback) {
                          props.callback(index, `${propsId}[${index}]`)
                        }
                      }}
                      >
                      <RemoveCircleOutline />
                    </IconButton>
                  </Box>
                )
              }
            </Box>
          )
        })
      }
      {
        !props.readOnly
        &&
        (
          <IconButton
            key="add"
            aria-label="Add"
            size="small"
            onClick={e => {
              append({
                value: '',
              })
              // if (!!props.callback) {
              //   props.callback('', name, 'add')
              // }
            }}
            >
            <AddCircleOutline />
          </IconButton>
        )
      }
    </Box>
  )
}

InputTextArray.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ),
  defaultValue: PropTypes.array,
  callback: PropTypes.func,
  BoxProps: PropTypes.object,
  TextProps: PropTypes.object,
  style: PropTypes.object,
  rules: PropTypes.object,
}

InputTextArray.appxType = 'appx/input/textarray'

InputTextArray.defaultValue = []

export default InputTextArray
