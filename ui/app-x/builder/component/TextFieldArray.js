import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  FormControl,
  TextField,
  IconButton,
  InputAdornment,
  FormHelperText,
  Typography,
  makeStyles,
} from '@material-ui/core'
import {
  AddCircleOutline,
  RemoveCircleOutline,
} from '@material-ui/icons'
import {
  useFormContext,
  useFieldArray,
  Controller,
} from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

import AutoSuggest from 'app-x/builder/component/AutoSuggest'

// array text field
const TextFieldArray = props => {
  // make styles
  const styles = makeStyles((theme) => ({
    formControl: {
      width: '100%',
    },
  }))()

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

  const {
    fields,
    append,
    prepend,
    remove,
    swap,
    move,
    insert,
  } = useFieldArray(
    {
      control,
      name: props.name,
    }
  )

  /*
  useEffect(() => {
    console.log(`props.name`, props.name)
    console.log(`props.defaultValue`, props.defaultValue)
  }, [props.defaultValue])
  */

  return (
    <Box className={props.className}>
      {
        (!!props.label)
        &&
        (
          <FormHelperText key="label">{props.label}</FormHelperText>
        )
      }
      {
        fields.map((item, index) => {
          return (
            <Box key={item.id} display="flex" className={styles.formControl}>
              <Controller
                key="controller"
                name={`${props.name}[${index}].value`}
                type={!!props.type ? props.type : 'text'}
                control={control}
                defaultValue={item?.value}
                rules={props.rules}
                render={innerProps =>
                  <FormControl className={styles.formControl}>
                    <AutoSuggest
                      className={styles.formControl}
                      key="value"
                      name={`${props.name}[${index}].value`}
                      type={innerProps.type}
                      size={props.size}
                      value={innerProps.value}
                      onChange={innerProps.onChange}
                      options={!!props.options ? props.options : []}
                      callback={props.callback}
                      >
                    </AutoSuggest>
                  </FormControl>
                }
                >
              </Controller>
              <IconButton
                key="remove"
                aria-label="Remove"
                size={props.size}
                onClick={e => {
                  remove(index)
                  if (!!props.callback) {
                    props.callback()
                  }
                }}
                >
                <RemoveCircleOutline />
              </IconButton>
            </Box>
          )
        })
      }
      <IconButton
        key="add"
        aria-label="Add"
        size={props.size}
        onClick={e => {
          append({
            value: '',
          })
        }}
        >
        <AddCircleOutline />
      </IconButton>
    </Box>
  )
}

TextFieldArray.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,             // text, number, etc.
  label: PropTypes.string,
  rules: PropTypes.object,
  defaultValue: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
  })),
  options: PropTypes.array,           // for autocomplete type
  callback: PropTypes.func,
  className: PropTypes.string,        // display className for element
}

export default TextFieldArray
