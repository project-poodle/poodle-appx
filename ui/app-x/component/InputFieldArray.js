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
  auto_suggestions
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
      padding: theme.spacing(0, 0),
    },
    labelControl: {
      width: '100%',
      // margin: theme.spacing(1),
      padding: theme.spacing(2, 0, 0),
    },
    editor: {
      width: '100%',
      height: theme.spacing(8),
      padding: theme.spacing(0),
    },
    dummyTextField: {
      width: '100%',
      padding: theme.spacing(0, 0),
    },
  }))()

  // destruct props
  const { name, childSpec } = props

  const suggestions = (() => {
    if (childSpec._thisNode?.suggestions) {
      return eval(childSpec._thisNode?.suggestions)
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

  // return
  return (
    <Box className={styles.formControl} key={name}>
      <InputLabel
        shrink={true}
        required={!childSpec.optional}
        className={styles.label}
        >
        {childSpec.desc}
      </InputLabel>
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
                  // check optional flag
                  if (!childSpec.optional && childSpec._thisNode?.input !== 'input/switch') {
                    result['required'] = `${childSpec.desc} is required`
                  }
                  // check rules
                  if (!!childSpec.rules) {
                    childSpec.rules.map(rule => {
                      if (rule.kind === 'required') {
                        result['required'] = rule.message
                      } else if (rule.kind === 'pattern') {
                        result['pattern'] = {
                          value: rule.pattern,
                          message: rule.message,
                        }
                      } else if (rule.kind === 'validate') {
                        result.validate[`validate_${count++}`] = (value) => (
                          !!eval(rule.validate) || rule.message
                        )
                      }
                    })
                  }
                  // check _thisNode.rules
                  if (!!childSpec._thisNode?.rules) {
                    childSpec._thisNode.rules.map(rule => {
                      if (rule.kind === 'required') {
                        result['required'] = rule.message
                      } else if (rule.kind === 'pattern') {
                        result['pattern'] = {
                          value: rule.pattern,
                          message: rule.message,
                        }
                      } else if (rule.kind === 'validate') {
                        result.validate[`validate_${count++}`] = (value) => (
                          !!eval(rule.validate) || rule.message
                        )
                      }
                    })
                  }
                  // auto suggestions rule
                  if (!!childSpec._thisNode.suggestionsOnly) {
                    result.validate[`validate_${count++}`] = (value) => (
                      suggestions.includes(value)
                      || `${childSpec.desc} must be a valid value`
                    )
                  }
                  // additional rules by input type
                  // console.log(`childSpec._thisNode.input`, childSpec._thisNode.input)
                  if (childSpec._thisNode.input === 'input/number') {
                    result.validate[`validate_${count++}`] = (value) => {
                      return !isNaN(Number(value)) || "Must be a number"
                    }
                  } else if (childSpec._thisNode.input === 'input/expression') {
                    result.validate[`validate_${count++}`] = (value) => {
                      try {
                        parseExpression(String(value))
                        return true
                      } catch (err) {
                        return String(err)
                      }
                    }
                  } else if (childSpec._thisNode.input === 'input/statement') {
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
                    if (childSpec._thisNode.input === 'input/switch')
                    {
                      return (
                        <FormControl
                          className={styles.itemControl}
                          error={!!_.get(errors, name)}
                          >
                          <Switch
                            name={itemName}
                            checked={innerProps.value}
                            onChange={e => innerProps.onChange(e.target.checked)}
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
                      childSpec._thisNode.input === 'input/expression'
                      || childSpec._thisNode.input === 'input/statement'
                    ) {
                      return (
                        <Box
                          className={styles.labelControl}
                          >
                        <FormControl
                          className={styles.itemControl}
                          error={!!_.get(errors, itemName)}
                          >
                          <Box className={styles.editor}>
                            <ControlledEditor
                              className={styles.editor}
                              language="javascript"
                              options={{
                                readOnly: false,
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
                              onFocus={e => {console.log(`focus`, e)}}
                              value={innerProps.value}
                              onChange={(ev, value) => {
                                innerProps.onChange(value)
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
                        <FormControl className={styles.itemControl}>
                          <AutoSuggest
                            name={itemName}
                            value={innerProps.value}
                            required={!childSpec.optional}
                            options={suggestions}
                            size="small"
                            onChange={innerProps.onChange}
                            error={!!_.get(errors, itemName)}
                            helperText={_.get(errors, itemName)?.message}
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

export default InputFieldArray
