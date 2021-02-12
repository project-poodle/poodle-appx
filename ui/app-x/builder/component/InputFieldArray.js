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
  validation,
} from 'app-x/builder/ui/syntax/util_base'

// input field array
const InputFieldArray = ((props) => {
  // theme
  const theme = useTheme()
  // styles
  const styles = makeStyles((theme) => ({
    formControl: {
      width: '100%',
      // margin: theme.spacing(1),
      padding: theme.spacing(2, 0),
    },
    itemControl: {
      width: '100%',
      // margin: theme.spacing(1),
      padding: theme.spacing(0, 0, 0),
    },
    editor: {
      width: '100%'
    },
    label: {
      padding: theme.spacing(0, 0, 0),
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

  // destruct props
  const { name, childSpec, inputSpec } = props

  // console.log(`useFormContext`, useFormContext())
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

  // useFieldArray
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
      name: name,
    }
  )

  // options
  const [ options, setOptions ] = useState([])
  // monaco focused state
  const [ monacoFocused,  setMonacoFocused  ] = useState({})

  // self import names
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

  // set default values
  useEffect(() => {
    // console.log(`setValue [${name}]`, props.defaultValue)
    setValue(name, (props.defaultValue || []).map(row => ({value: row})))
  }, [props.defaultValue])

  // return
  return (
    <Box className={props.className} key={name}>
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
      {
        fields.map((item, index) => {
          const itemName = `${name}[${index}].value`
          //
          return (
            <Box key={item.id} display="flex" className={styles.itemControl}>
              <Controller
                name={itemName}
                control={control}
                key={item.id}
                defaultValue={item.value}
                rules={(() => {
                  let count = 0
                  const result = { validate: {} }
                  // check required flag
                  if (!!childSpec.required && inputSpec?.kind !== 'input/switch') {
                    result['required'] = `${childSpec.desc} is required`
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
                      options.includes(value)
                      || `${childSpec.desc} must be a valid value`
                    )
                  }
                  // additional rules by input type
                  // console.log(`inputSpec.kind`, inputSpec.kind)
                  if (inputSpec.variant === 'input/number') {
                    result.validate[`validate_${count++}`] = (value) => {
                      return !isNaN(Number(value)) || "Must be a number"
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
                    if (inputSpec.kind === 'input/switch')
                    {
                      return (
                        <FormControl
                          name={itemName}
                          size={props.size}
                          margin={props.margin}
                          className={styles.itemControl}
                          error={!!_.get(errors, name)}
                          >
                          <Switch
                            name={itemName}
                            color='secondary'
                            size={props.size}
                            checked={innerProps.value}
                            onChange={e => {
                              innerProps.onChange(e.target.checked)
                              if (!!props.callback) {
                                props.callback(e.target.checked)
                              }
                            }}
                          />
                          {
                            !!_.get(errors, itemName)
                            &&
                            <FormHelperText>
                              {_.get(errors, itemName)?.message}
                            </FormHelperText>
                          }
                        </FormControl>
                      )
                    }
                    else if
                    (
                      inputSpec.kind === 'input/expression'
                      || inputSpec.kind === 'input/statement'
                    )
                    {
                      return (
                        <Box className={styles.editor}>
                          <FormControl
                            name={itemName}
                            size={props.size}
                            margin={props.margin}
                            focused={!!monacoFocused[itemName]}
                            className={styles.itemControl}
                            error={!!_.get(errors, itemName)}
                            >
                            <Box
                              className={styles.expressionBox}
                              >
                              <ControlledEditor
                                /*
                                className={
                                  (getValues(itemName)?.split(/\r\n|\r|\n/).length > 3)
                                  ? styles.expressionBlock
                                  : (getValues(itemName)?.split(/\r\n|\r|\n/).length > 1)
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
                                value={innerProps.value}
                                onFocus={() => {
                                  const newMonacoFocused = _.cloneDeep(monacoFocused)
                                  newMonacoFocused[itemName] = true
                                  setMonacoFocused(newMonacoFocused)
                                }}
                                onBlur={() => {
                                  const newMonacoFocused = _.cloneDeep(monacoFocused)
                                  newMonacoFocused[itemName] = false
                                  setMonacoFocused(newMonacoFocused)
                                }}
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
                              error={!!_.get(errors, itemName)}
                              >
                            </Input>
                            {
                              !!_.get(errors, itemName)
                              &&
                              <FormHelperText>
                                {_.get(errors, itemName)?.message}
                              </FormHelperText>
                            }
                          </FormControl>
                        </Box>
                      )
                    }
                    else if
                    (
                      inputSpec.variant === 'number'
                    )
                    {
                      return (
                        <FormControl
                          name={itemName}
                          size={props.size}
                          margin={props.margin}
                          className={styles.itemControl}
                          error={!!_.get(errors, name)}
                          >
                          <TextField
                            label={null}
                            name={itemName}
                            value={innerProps.value}
                            disabled={!!props.disabled}
                            required={!!childSpec.required}
                            color='secondary'
                            size={props.size}
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
                            error={!!_.get(errors, itemName)}
                            helperText={_.get(errors, itemName)?.message}
                          />
                        </FormControl>
                      )
                    }
                    else
                    {
                      return (
                        <FormControl
                          name={itemName}
                          size={props.size}
                          margin={props.margin}
                          className={styles.itemControl}
                          error={!!_.get(errors, name)}
                          >
                          <AutoSuggest
                            name={itemName}
                            value={innerProps.value}
                            required={!!childSpec.required}
                            options={options}
                            color='secondary'
                            size={props.size}
                            onChange={innerProps.onChange}
                            error={!!_.get(errors, itemName)}
                            helperText={_.get(errors, itemName)?.message}
                            callback={props.callback}
                            />
                        </FormControl>
                      )
                    }
                  }
                }
                >
              </Controller>
              <Box display="flex" alignItems="center" justifyContent="center">
                <IconButton
                  key="remove"
                  aria-label="Remove"
                  size="small"
                  onClick={e => {
                    remove(index)
                    if (!!props.callback) {
                      props.callback(null, index)
                    }
                  }}
                  >
                  <RemoveCircleOutline />
                </IconButton>
              </Box>
            </Box>
          )
        })
      }
      <IconButton
        key="add"
        aria-label="Add"
        size="small"
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
})

InputFieldArray.propTypes = {
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  childSpec: PropTypes.object.isRequired,
  inputSpec: PropTypes.object.isRequired,
  className: PropTypes.string,
  callback: PropTypes.func,
  defaultValue: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]))
}

export default InputFieldArray
