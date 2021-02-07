import React, { useState, useContext, useEffect } from "react"
import PropTypes from 'prop-types'
import {
  Box,
  FormControl,
  TextField,
  makeStyles,
} from '@material-ui/core'
import {
  AutoComplete
} from 'antd'
import {
  useFormContext,
  Controller,
} from 'react-hook-form'
import _ from 'lodash'

const AutoSuggest = (props) => {
  // make styles
  const styles = makeStyles((theme) => ({
    formControl: {
      width: '100%',
    },
  }))()

  const [ options,    setOptions    ] = useState([])

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

  useEffect(() => {
    if (!!props.options) {
      setOptions(props.options.map(n => ({value: n})))
      // console.log(`props.options`, props.options)
    } else {
      setOptions([])
    }
  }, [props.options])

  return (
    <AutoComplete
      key="autoSuggest"
      options={options}
      value={props.value}
      disabled={!!props.disabled}
      onChange={data => {
        props.onChange(data)
        if (!!props.callback) {
          props.callback(data)
        }
      }}
      onSearch={s => {
        const valid_names = props.options
        const s_list = s.toUpperCase().split(' ').filter(s => !!s)
        const found_options = valid_names.filter(name => {
          if (!!name) {
            const name_upper = name.toUpperCase()
            return s_list.reduce(
              (result, obj) => !!result && name_upper.includes(obj),
              true)
          } else {
            return false
          }
        })
        .map(n => ({value: n}))
        setOptions(found_options)
      }}
      >
      <TextField
        key="textfield"
        className={styles.formControl}
        label={props.label}
        name={props.name}
        value={props.value}
        disabled={!!props.disabled}
        required={props.required}
        color={props.color || 'primary'}
        size={props.size}
        margin={props.margin}
        onChange={e => {
          props.onChange(e.target.value)
          if (!!props.callback) {
            props.callback(e.target.value)
          }
        }}
        error={!!_.get(errors, props.name)}
        helperText={_.get(errors, props.name)?.message}
      />
    </AutoComplete>
  )
}

AutoSuggest.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  rules: PropTypes.object,
  options: PropTypes.array,
  defaultValues: PropTypes.string,
  callback: PropTypes.func,
  className: PropTypes.string,
}

export default AutoSuggest
