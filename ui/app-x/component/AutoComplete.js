import React, { useState, useContext, useEffect } from "react"
import PropTypes from 'prop-types'
import {
  Box,
  FormControl,
  TextField,
  makeStyles,
} from '@material-ui/core'
import {
  AutoComplete as AntAutoComplete
} from 'antd'
import {
  useFormContext,
  Controller,
} from 'react-hook-form'
import _ from 'lodash'

const AutoComplete = (props) => {
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
    setOptions(props.options.map(n => ({value: n})))
    // console.log(props.options)
  }, [props.options])

  return (
      <Controller
        key={props.name}
        name={props.name}
        type={!!props.type ? props.type : 'text'}
        control={control}
        defaultValue={props.defaultValue}
        rules={props.rules}
        render={innerProps =>
          <FormControl className={props.className}>
            <AntAutoComplete
              key="autocomplete"
              options={options}
              value={innerProps.value}
              onChange={data => {
                innerProps.onChange(data)
                if (props.callback) {
                  props.callback(data)
                }
              }}
              onSearch={s => {
                const valid_names = props.options
                const s_list = s.toUpperCase().split(' ').filter(s => !!s)
                const found_options = valid_names.filter(name => {
                  const name_upper = name.toUpperCase()
                  return s_list.reduce(
                    (result, obj) => !!result && name_upper.includes(obj),
                    true)
                }).map(n => ({value: n}))
                setOptions(found_options)
              }}
              >
              <TextField
                key="textfield"
                className={styles.formControl}
                label={props.label}
                name={innerProps.name}
                value={innerProps.value}
                onChange={e => {
                  innerProps.onChange(e.target.value)
                  if (props.callback) {
                    props.callback(e.target.value)
                  }
                }}
                error={!!_.get(errors, props.name)}
                helperText={_.get(errors, props.name)?.message}
              />
            </AntAutoComplete>
          </FormControl>
        }
      />
  )
}

AutoComplete.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  rules: PropTypes.object,
  options: PropTypes.array,
  defaultValues: PropTypes.string,
  callback: PropTypes.func,
  className: PropTypes.string,
}

export default AutoComplete
