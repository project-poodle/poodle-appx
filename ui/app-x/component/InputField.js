import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  FormControl,
  Input,
  InputLabel,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  TextField,
  Switch,
  makeStyles,
} from '@material-ui/core'
import {
  AddCircleOutline,
  RemoveCircleOutline,
  DeleteOutlineOutlined,
} from '@material-ui/icons'
import {
  useForm,
  useFormContext,
  useFieldArray,
  FormProvider,
  Controller,
} from "react-hook-form";
import { parse, parseExpression } from "@babel/parser"

import AutoSuggest from 'app-x/component/AutoSuggest'
import ControlledEditor from 'app-x/component/ControlledEditor'
import {
  validation
} from 'app-x/builder/ui/syntax/util_base'

// input field array
const InputField = ((props) => {
  // styles
  const styles = makeStyles((theme) => ({
    formControl: {
      width: '100%',
      padding: theme.spacing(0, 0),
    },
    // labelControl: {
    //  width: '100%',
    //  padding: theme.spacing(2, 0, 0),
    //},
    // textLabel: {
    //   width: '100%',
    //   padding: theme.spacing(0, 0, 2),
    // },
    label: {
      width: '100%',
      padding: theme.spacing(0, 0, 2),
    },
    expressionEditor: {
      width: '100%',
      height: theme.spacing(5),
      padding: theme.spacing(0, 0, 0),
    },
    statementEditor: {
      width: '100%',
      height: theme.spacing(7),
      padding: theme.spacing(0),
    },
    dummyTextField: {
      width: '100%',
      padding: theme.spacing(0, 0),
    },
  }))()

  // console.log(`useFormContext`, useFormContext())
  // useFormContext
  const form = useFormContext() // this variable is used for field validation
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
  } = form

  // destruct props
  const { name, childSpec, inputSpec, defaultValue } = props

  // options
  const options = (() => {
    if (inputSpec?.options) {
      return eval(inputSpec?.options)
    } else {
      return []
    }
  })()

  // monaco focused state
  const [ monacoFocused,  setMonacoFocused  ] = useState(false)

  // return
  return (
    <Controller
      name={name}
      control={control}
      key={name}
      defaultValue={defaultValue}
      rules={(() => {
        let count = 0
        const result = { validate: {} }
        // check required flag
        if (!!childSpec.required && inputSpec?.kind !== 'input/switch') {
          result['required'] = `${childSpec.desc || childSpec.title || childSpec.name} is required`
        }
        // check rules
        if (!!childSpec.rules) {
          childSpec.rules.map(rule => {
            if (rule.kind === 'required') {
              result['required'] = rule.message
            } else if (rule.kind === 'pattern') {
              result['pattern'] = {
                value: rule.data,
                message: rule.message,
              }
            } else if (rule.kind === 'validate') {
              result.validate[`validate_${count++}`] = (value) => {
                try {
                  return !!eval(rule.data) || rule.message
                } catch (e) {
                  return String(e)
                }
              }
            }
          })
        }
        // check _thisNode.rules
        if (!!inputSpec?.rules) {
          inputSpec.rules.map(rule => {
            if (rule.kind === 'required') {
              result['required'] = rule.message
            } else if (rule.kind === 'pattern') {
              result['pattern'] = {
                value: rule.data,
                message: rule.message,
              }
            } else if (rule.kind === 'validate') {
              result.validate[`validate_${count++}`] = (value) => {
                try {
                  return !!eval(rule.data) || rule.message
                } catch (e) {
                  return String(e)
                }
              }
            }
          })
        }
        // auto options rule
        if (!!inputSpec.optionsOnly) {
          result.validate[`validate_${count++}`] = (value) => (
            !!options.find(option => typeof option === 'string' ? option === value : option.value === value)
            || `${childSpec.desc || childSpec.title || childSpec.name} must be a valid value`
          )
        }
        // additional rules by input type
        // console.log(`inputSpec.kind`, inputSpec.kind)
        if (inputSpec.variant === 'number') {
          result.validate[`validate_${count++}`] = (value) => {
            return !isNaN(Number(value)) || "Must be a number"
          }
        }
        // expression and statement
        if (inputSpec.kind === 'input/expression') {
          result.validate[`validate_${count++}`] = (value) => {
            try {
              parseExpression(String(value))
              return true
            } catch (err) {
              return String(err)
            }
          }
        } else if (inputSpec.kind === 'input/statement') {
          result.validate[`validate_${count++}`] = (value) => {
            try {
              parse(value, {
                allowReturnOutsideFunction: true, // allow return in the block statement
              })
              return true
            } catch (err) {
              return String(err)
            }
          }
        }
        // return all rules
        return result
      })()}
      render={innerProps =>
        {
          if (inputSpec.kind === 'input/switch') {
            return (
              <Box
                className={props.className}
                >
                <FormControl
                  name={name}
                  size={props.size}
                  margin={props.margin}
                  className={styles.formControl}
                  error={!!_.get(errors, name)}
                  disabled={!!props.disabled}
                  >
                  {
                    !!childSpec.desc
                    &&
                    (
                      <Box className={styles.label}>
                        <InputLabel
                          shrink={true}
                          required={!!childSpec.required}
                          >
                          {childSpec.desc}
                        </InputLabel>
                      </Box>
                    )
                  }
                  <Switch
                    name={name}
                    size={props.size}
                    disabled={!!props.disabled}
                    checked={innerProps.value}
                    onChange={e => {
                      innerProps.onChange(e.target.checked)
                      if (!!props.callback) {
                        props.callback(e.target.checked)
                      }
                    }}
                  />
                  {
                    !!_.get(errors, name)
                    &&
                    <FormHelperText>{_.get(errors, name)?.message}</FormHelperText>
                  }
                </FormControl>
              </Box>
            )
          } else if
          (
            inputSpec.kind === 'input/expression'
            || inputSpec.kind === 'input/statement'
          ) {
            return (
              <Box
                className={props.className}
                >
                <FormControl
                  name={name}
                  size={props.size}
                  margin={props.margin}
                  className={styles.formControl}
                  error={!!_.get(errors, name)}
                  disabled={!!props.disabled}
                  focused={monacoFocused}
                  >
                  {
                    !!childSpec.desc
                    &&
                    (
                      <Box className={styles.label}>
                        <InputLabel
                          shrink={true}
                          required={!!childSpec.required}
                          >
                          {childSpec.desc}
                        </InputLabel>
                      </Box>
                    )
                  }
                  <ControlledEditor
                    className={
                      inputSpec.kind === 'input/expression'
                      ? styles.expressionEditor
                      : styles.statementEditor
                    }
                    language="javascript"
                    options={{
                      readOnly: !!props.disabled,
                      // lineNumbers: 'off',
                      lineNumbersMinChars: 0,
                      wordWrap: 'on',
                      wrappingIndent: 'deepIndent',
                      scrollBeyondLastLine: false,
                      wrappingStrategy: 'advanced',
                      glyphMargin: false,
                      folding: false,
                      // lineDecorationsWidth: 0,
                      renderLineHighlight: 'none',
                      // snippetSuggestions: 'none',
                      minimap: {
                        enabled: false
                      },
                      quickSuggestions: {
                        "other": false,
                        "comments": false,
                        "strings": false
                      },
                    }}
                    onFocus={() => { setMonacoFocused(true) }}
                    onBlur={() => { setMonacoFocused(false) }}
                    value={innerProps.value}
                    onChange={(ev, value) => {
                      innerProps.onChange(value)
                      if (!!props.callback) {
                        props.callback(value)
                      }
                    }}
                    >
                  </ControlledEditor>
                  <Input
                    // className={`${styles.dummyTextField} Mui-focused`}
                    className={`${styles.dummyTextField}`}
                    readOnly={true}
                    // size="small"
                    inputProps={{style:{height:0}}}
                    style={{height:0}}
                    error={!!_.get(errors, name)}
                    >
                  </Input>
                  {
                    !!_.get(errors, name)
                    &&
                    <FormHelperText>{_.get(errors, name)?.message}</FormHelperText>
                  }
                </FormControl>
              </Box>
            )
          } else if
          (
            inputSpec.kind === 'input/select'
          ) {
            console.log('input/select', inputSpec)
            return (
              <Box
                className={props.className}
                >
                <FormControl
                  name={name}
                  size={props.size}
                  margin={props.margin}
                  className={styles.formControl}
                  error={!!_.get(errors, name)}
                  disabled={!!props.disabled}
                  focused={monacoFocused}
                  >
                  {
                    !!childSpec.desc
                    &&
                    (
                      <Box className={styles.label}>
                        <InputLabel
                          shrink={true}
                          required={!!childSpec.required}
                          >
                          {childSpec.desc}
                        </InputLabel>
                      </Box>
                    )
                  }
                  <TextField
                    name={name}
                    label={null}
                    select={true}
                    value={innerProps.value}
                    disabled={!!props.disabled}
                    required={!!childSpec.required}
                    size={props.size}
                    onChange={e => {
                      innerProps.onChange(e.target.value)
                      if (!!props.callback) {
                        props.callback(e.target.value)
                      }
                    }}
                    >
                    {
                      !!options
                      && !!options.length
                      &&
                      (
                        options.map(option => {
                          return (
                            <MenuItem
                              key={option.value}
                              value={option.value}
                              >
                              { option.value }
                            </MenuItem>
                          )
                        })
                      )
                    }
                  </TextField>
                  {
                    !!_.get(errors, name)
                    &&
                    <FormHelperText>{_.get(errors, name)?.message}</FormHelperText>
                  }
                </FormControl>
              </Box>
            )
          } else {
            return (
              <Box
                className={props.className}
                >
                <FormControl
                  name={name}
                  size={props.size}
                  margin={props.margin}
                  className={styles.formControl}
                  error={!!_.get(errors, name)}
                  disabled={!!props.disabled}
                  className={styles.formControl}
                  >
                  {
                    !!childSpec.desc
                    &&
                    (
                      <Box className={styles.label}>
                        <InputLabel
                          shrink={true}
                          required={!!childSpec.required}
                          >
                          {childSpec.desc}
                        </InputLabel>
                      </Box>
                    )
                  }
                  <AutoSuggest
                    label={null}
                    name={name}
                    value={innerProps.value}
                    disabled={!!props.disabled}
                    required={!!childSpec.required}
                    options={options}
                    size={props.size}
                    margin={props.margin}
                    onChange={innerProps.onChange}
                    // error={!!_.get(errors, name)}
                    // helperText={_.get(errors, name)?.message}
                    callback={props.callback}
                  />
                </FormControl>
              </Box>
            )
          }
        }
      }
    />
  )
})

InputField.propTypes = {
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  childSpec: PropTypes.object.isRequired,
  inputSpec: PropTypes.object.isRequired,
  className: PropTypes.string,
  callback: PropTypes.func,
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ])
}

export default InputField
