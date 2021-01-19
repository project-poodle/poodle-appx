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
  validation,
} from 'app-x/builder/ui/syntax/util_base'

// input field array
const InputFieldArray = ((props) => {
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
    expressionSingleLine: {
      width: '100%',
      height: theme.spacing(3),
      padding: theme.spacing(0, 0),
    },
    expressionMultiLine: {
      width: '100%',
      height: theme.spacing(7),
      padding: theme.spacing(0, 0),
    },
    expressionBlock: {
      width: '100%',
      height: theme.spacing(12),
      padding: theme.spacing(0, 0),
    },
    dummyTextField: {
      width: '100%',
      padding: theme.spacing(0, 0),
    },
  }))()

  // destruct props
  const { name, childSpec, inputSpec } = props

  const options = (() => {
    if (inputSpec?.options) {
      return eval(inputSpec?.options)
    } else {
      return []
    }
  })()

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

  // monaco focused state
  const [ monacoFocused,  setMonacoFocused  ] = useState({})

  // set default values
  useEffect(() => {
    console.log(`setValue [${name}]`, props.defaultValue)
    setValue(name, props.defaultValue)
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
                            <ControlledEditor
                              className={
                                (getValues(itemName)?.split(/\r\n|\r|\n/).length > 3)
                                ? styles.expressionBlock
                                : (getValues(itemName)?.split(/\r\n|\r|\n/).length > 1)
                                  ? styles.expressionMultiLine
                                  : styles.expressionSingleLine
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
                            <Input
                              // className={`${styles.dummyTextField} Mui-focused`}
                              className={`${styles.dummyTextField}`}
                              readOnly={true}
                              // size="small"
                              inputProps={{style:{height:0}}}
                              style={{height:0}}
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
                    } else {
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
