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
  MenuItem,
  ListItemIcon,
  Switch,
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
import { parse, parseExpression } from "@babel/parser"
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'

import AutoComplete from 'app-x/component/AutoComplete'
import {
  lookup_icon_for_type,
  valid_import_names,
} from 'app-x/builder/ui/syntax/util_parse'

// array text field
const PropFieldArray = props => {
  // make styles
  const styles = makeStyles((theme) => ({
    formControl: {
      width: '100%',
    },
    typeControl: {
      width: theme.spacing(12),
      padding: theme.spacing(0, 1),
    },
    nameControl: {
      width: '60%',
      padding: theme.spacing(0, 1),
    },
    valueControl: {
      width: '100%',
      padding: theme.spacing(0, 1),
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
          const propType = watch(`${props.name}[${index}].type`)
          return (
            <Box key={item.id} display="flex" className={styles.formControl}>
              <Controller
                key='type'
                name={`${props.name}[${index}].type`}
                control={control}
                defaultValue={item?.type}
                rules={{
                  required: "Property type is required",
                }}
                callback={props.callback}
                render={innerProps =>
                  <FormControl className={styles.typeControl}>
                    <TextField
                      select={true}
                      name={innerProps.name}
                      value={innerProps.value}
                      onChange={e => {
                        innerProps.onChange(e.target.value)
                        if (props.callback) {
                          props.callback(e.target.value, innerProps.name)
                        }
                      }}
                      error={
                        !!_.get(errors, props.name)
                        && !!_.get(errors, props.name)[index]?.type
                      }
                      helperText={
                        !!_.get(errors, props.name)
                        && _.get(errors, props.name)[index]?.type?.message
                      }
                      >
                      {
                        [
                          'js/string',
                          'js/number',
                          'js/boolean',
                          'js/null',
                          'js/expression',
                          'js/import'
                        ].map(type => (
                          <MenuItem key={type} value={type}>
                            { lookup_icon_for_type(type) }
                          </MenuItem>
                        ))
                      }
                    </TextField>
                  </FormControl>
                }
              />
              <Controller
                key='name'
                name={`${props.name}[${index}].name`}
                type={'text'}
                control={control}
                defaultValue={item?.name}
                rules={{
                  required: "Property name is required",
                  pattern: {
                    value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                    message: "Property name must be valid variable name",
                  },
                  validate: {
                    noDuplicateWithOthers: value => {
                      return
                        !props.otherNames
                        || !props.otherNames.includes(value)
                        || "Property name duplicate with one of existing properties"
                    },
                    noDuplicateWithSelf: value => {
                      let found = false
                      _.get(getValues(), props.name)?.map((child, i) => {
                        // console.log(`child`, child, i)
                        if (child.name === value && index !== i) {
                          found = true
                        }
                      })
                      return !found
                        || "Another property has same name"
                    }
                  }
                }}
                render={innerProps =>
                  <FormControl className={styles.nameControl}>
                    <TextField
                      name={innerProps.name}
                      value={innerProps.value}
                      onChange={e => {
                        innerProps.onChange(e.target.value)
                        if (props.callback) {
                          // console.log(`callback`, e.target.value, innerProps.name)
                          props.callback(e.target.value, innerProps.name)
                        }
                      }}
                      error={
                        !!_.get(errors, props.name)
                        && !!_.get(errors, props.name)[index]?.name
                      }
                      helperText={
                        !!_.get(errors, props.name)
                        && _.get(errors, props.name)[index]?.name?.message
                      }
                    />
                  </FormControl>
                }
              />
              <Box className={styles.formControl}>
                {
                  (propType === 'js/boolean')
                  &&
                  (
                    <Controller
                      key='value'
                      name={`${props.name}[${index}].value`}
                      control={control}
                      defaultValue={item?.value}
                      render={innerProps =>
                        (
                          <FormControl key="boolean" className={styles.valueControl}>
                            <Switch
                              name={innerProps.name}
                              checked={innerProps.value}
                              onChange={e => {
                                innerProps.onChange(e.target.checked)
                                if (props.callback) {
                                  props.callback(e.target.checked, innerProps.name)
                                }
                              }}
                            />
                          </FormControl>
                        )
                      }
                    />
                  )
                }
                {
                  (propType === 'js/string')
                  &&
                  (
                    <Controller
                      key='value'
                      name={`${props.name}[${index}].value`}
                      control={control}
                      defaultValue={item?.value}
                      rules={{
                        required: "Property value is required"
                      }}
                      render={innerProps =>
                        (
                          <FormControl key="data" className={styles.valueControl}>
                            <TextField
                              className={styles.formControl}
                              name={innerProps.name}
                              value={innerProps.value}
                              onChange={e => {
                                innerProps.onChange(e.target.value)
                                if (props.callback) {
                                  props.callback(e.target.value, innerProps.name)
                                }
                              }}
                              error={
                                !!_.get(errors, props.name)
                                && !!_.get(errors, props.name)[index]?.value
                              }
                              helperText={
                                !!_.get(errors, props.name)
                                && _.get(errors, props.name)[index]?.value?.message
                              }
                            />
                          </FormControl>
                        )
                      }
                    />
                  )
                }
                {
                  (propType === 'js/number')
                  &&
                  (
                    <Controller
                      key='value'
                      name={`${props.name}[${index}].value`}
                      control={control}
                      defaultValue={item?.value}
                      rules={{
                        required: "Number is required",
                        validate: {
                          checkNumber: value => !isNaN(Number(value)) || "Must be a number",
                        }
                      }}
                      render={innerProps =>
                        (
                          <FormControl key="data" className={styles.valueControl}>
                            <TextField
                              className={styles.formControl}
                              name={innerProps.name}
                              value={innerProps.value}
                              onChange={e => {
                                innerProps.onChange(e.target.value)
                                if (props.callback) {
                                  props.callback(e.target.value, innerProps.name)
                                }
                              }}
                              error={
                                !!_.get(errors, props.name)
                                && !!_.get(errors, props.name)[index]?.value
                              }
                              helperText={
                                !!_.get(errors, props.name)
                                && _.get(errors, props.name)[index]?.value?.message
                              }
                            />
                          </FormControl>
                        )
                      }
                    />
                  )
                }
                {
                  (propType === 'js/expression')
                  &&
                  (
                    <Controller
                      key='value'
                      name={`${props.name}[${index}].value`}
                      control={control}
                      defaultValue={item?.value}
                      rules={{
                        required: "Expression is required",
                        validate: {
                          expressionSyntax: value => {
                            try {
                              parseExpression(String(value))
                              return true
                            } catch (err) {
                              return String(err)
                            }
                          }
                        }
                      }}
                      render={innerProps =>
                        (
                          <FormControl key="data" className={styles.valueControl}>
                            <TextField
                              className={styles.formControl}
                              name={innerProps.name}
                              value={innerProps.value}
                              onChange={e => {
                                innerProps.onChange(e.target.value)
                                if (props.callback) {
                                  props.callback(e.target.value, innerProps.name)
                                }
                              }}
                              error={
                                !!_.get(errors, props.name)
                                && !!_.get(errors, props.name)[index]?.value
                              }
                              helperText={
                                !!_.get(errors, props.name)
                                && _.get(errors, props.name)[index]?.value?.message
                              }
                            />
                          </FormControl>
                        )
                      }
                    />
                  )
                }
                {
                  (propType === 'js/import')
                  &&
                  (
                    <AutoComplete
                      key='value'
                      className={styles.valueControl}
                      name={`${props.name}[${index}].value`}
                      defaultValue={item?.value}
                      options={
                        valid_import_names()
                      }
                      rules={{
                        required: "Import name is required",
                        validate: {
                          valid_name: value => (
                            valid_import_names().includes(value)
                            || "Must use a valid name"
                          )
                        }
                      }}
                      callback={data => {
                        if (props.callback) {
                          props.callback(data, `${props.name}[${index}].value`)
                        }
                      }}
                      >
                    </AutoComplete>
                  )
                }
              </Box>
              <IconButton
                key="remove"
                aria-label="Remove"
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
        onClick={e => {
          append({
            type: 'js/string',
            name: '',
            value: '',
          })
        }}
        >
        <AddCircleOutline />
      </IconButton>
    </Box>
  )
}

PropFieldArray.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  defaultValue: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
  })),
  options: PropTypes.array,                 // for prop name autocomplete
  otherNames: PropTypes.array,              // other prop names for validation
  callback: PropTypes.func,
  className: PropTypes.string,              // display className for element
}

export default PropFieldArray
