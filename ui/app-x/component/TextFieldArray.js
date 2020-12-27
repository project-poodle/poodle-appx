import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  FormControl,
  TextField,
  IconButton,
  InputAdornment,
  FormHelperText,
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

// array text field
const TextFieldArray = props => {
  // make styles
  const styles = makeStyles((theme) => ({
    formControl: {
      width: '100%',
      // margin: theme.spacing(0),
      // padding: theme.spacing(0),
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
    getValuess,
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

  return (
    <Box className={props.className}>
      <FormHelperText key="label">{props.label}</FormHelperText>
      {
        fields.map((item, index) => {
          return (
            <Controller
              key={item.id}
              name={`${props.name}[${index}].value`}
              type={props.type}
              control={control}
              defaultValue={item.value}
              rules={props.rules}
              render={innerProps =>
                <Box display="flex" className={styles.formControl}>
                  <FormControl className={styles.formControl}>
                    <TextField
                      name={innerProps.name}
                      value={innerProps.value}
                      onChange={innerProps.onChange}
                      error={
                        !!errors[props.name]
                        && !!errors[props.name][index]
                      }
                      helperText={
                        !!errors[props.name]
                        && errors[props.name][index]?.value?.message
                      }
                    />
                  </FormControl>
                  <IconButton
                    key="remove"
                    aria-label="Remove"
                    onClick={e => {
                      remove(index)
                    }}
                    >
                    <RemoveCircleOutline />
                  </IconButton>
                </Box>
              }
            />
          )
        })
      }
      <IconButton
        key="add"
        aria-label="Add"
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
  label: PropTypes.string,
  type: PropTypes.string,
  rules: PropTypes.object,
  defaultValues: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  className: PropTypes.string,
}

export default TextFieldArray
