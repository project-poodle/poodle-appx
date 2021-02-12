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
  useTheme,
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

import AutoSuggest from 'app-x/builder/component/AutoSuggest'
import ControlledEditor from 'app-x/builder/component/ControlledEditor'
import NavProvider from 'app-x/builder/ui/NavProvider'
import {
  validation
} from 'app-x/builder/ui/syntax/util_base'

// input field array
const InputField = ((props) => {
  // theme
  const theme = useTheme()
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
    expressionBox: {
      width: '100%',
      padding: theme.spacing(0.625, 0, 0),
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
  const [ options, setOptions ] = useState([])
  // selfImportNames
  const { selfImportNames } = React.useContext(NavProvider.Context)
  // console.log(`NavProvider.Context [selfImportNames]`, selfImportNames)

  // update options
  useEffect(() => {
    if (props.inputSpec?.options) {
      const result = eval(props.inputSpec?.options)
      // console.log(`props.inputSpec?.options`, result)
      if (!!inputSpec.optionSelfImportNames) {
        setOptions(result.concat(selfImportNames))
      } else {
        setOptions(result)
      }
    } else {
      setOptions([])
    }
  }, [props.inputSpec])

  // monaco focused state
  const [ monacoFocused,  setMonacoFocused  ] = useState(false)

  // return
  return (
    <Controller
      name={name}
      control={control}
      key={name}
      defaultValue={defaultValue || ''}
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
                  return e.message || String(e)
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
                  return e.message || String(e)
                }
              }
            }
          })
        }
        // auto options rule
        if (!!inputSpec.optionsOnly) {
          result.validate[`validate_${count++}`] = (value) => (
            !!options.find(option => typeof option === 'string' ? option === value : option?.value === value)
            || `${childSpec.desc || childSpec.title || childSpec.name} must be a valid value`
          )
        }
        // additional rules by input type
        // console.log(`inputSpec.kind`, inputSpec.kind)
        if (inputSpec.variant === 'number') {
          result.validate[`validate_${count++}`] = (value) => {
            return value === undefined || !isNaN(Number(value)) || "Must be a number"
          }
        }
        // expression and statement
        if (inputSpec.kind === 'input/expression') {
          result.validate[`validate_${count++}`] = (value) => {
            try {
              if (!childSpec.required && !value.trim()) {
                return true
              }
              parseExpression(String(value), {
                plugins: [
                  'jsx', // support jsx
                ]
              })
              return true
            } catch (err) {
              return String(err)
            }
          }
        } else if (inputSpec.kind === 'input/statement') {
          result.validate[`validate_${count++}`] = (value) => {
            try {
              if (!childSpec.required && !value.trim()) {
                return true
              }
              parse(value, {
                allowReturnOutsideFunction: true, // allow return in the block statement
                plugins: [
                  'jsx', // support jsx
                ]
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
                          color='secondary'
                          >
                          {childSpec.desc}
                        </InputLabel>
                      </Box>
                    )
                  }
                  <Switch
                    name={name}
                    color='secondary'
                    size={props.size}
                    disabled={!!props.disabled}
                    checked={!!innerProps.value}
                    value={!!innerProps.value}
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
                          color='secondary'
                          >
                          {childSpec.desc}
                        </InputLabel>
                      </Box>
                    )
                  }
                  <Box
                    className={styles.expressionBox}
                    >
                    <ControlledEditor
                      /*
                      className={
                        (getValues(name)?.split(/\r\n|\r|\n/).length > 3)
                        ? styles.expressionBlock
                        : (getValues(name)?.split(/\r\n|\r|\n/).length > 1)
                          ? styles.expressionMultiLine
                          : styles.expressionSingleLine
                      }
                      */
                      maxRows={15}
                      language="javascript"
                      theme={theme?.palette.type === 'dark' ? 'vs-dark' : 'vs'}
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
                  </Box>
                  <Input
                    // className={`${styles.dummyTextField} Mui-focused`}
                    className={`${styles.dummyTextField}`}
                    readOnly={true}
                    // size="small"
                    inputProps={{style:{height:0}}}
                    style={{height:0}}
                    color='secondary'
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
            // console.log('input/select', inputSpec)
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
                          color='secondary'
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
                    color='secondary'
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
                          // console.log(`option`, option)
                          return (
                            <MenuItem
                              key={option}
                              value={option}
                              >
                              { option }
                            </MenuItem>
                          )
                        })
                      )
                    }
                    <MenuItem style={{display: 'none'}}
                      key={innerProps.value}
                      value={innerProps.value}
                      >
                      {innerProps.value}
                    </MenuItem>
                  </TextField>
                  {
                    !!_.get(errors, name)
                    &&
                    <FormHelperText>{_.get(errors, name)?.message}</FormHelperText>
                  }
                </FormControl>
              </Box>
            )
          } else if (inputSpec.variant === 'number') {
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
                          color='secondary'
                          >
                          {childSpec.desc}
                        </InputLabel>
                      </Box>
                    )
                  }
                  <TextField
                    label={null}
                    name={name}
                    value={innerProps.value}
                    disabled={!!props.disabled}
                    required={!!childSpec.required}
                    color='secondary'
                    size={props.size}
                    margin={props.margin}
                    onChange={e => {
                      let value = parseInt(e.target.value)
                      if (e.target.value === '') {
                        value = ''
                      } else if (isNaN(value)) {
                        value = NaN
                      }
                      innerProps.onChange(value)
                      if (!!props.callback) {
                        props.callback(value)
                      }
                    }}
                    error={!!_.get(errors, name)}
                    helperText={_.get(errors, name)?.message}
                  />
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
                          color='secondary'
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
                    color='secondary'
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
