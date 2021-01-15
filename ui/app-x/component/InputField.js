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
const InputField = ((props) => {
  // styles
  const styles = makeStyles((theme) => ({
    formControl: {
      width: '100%',
      padding: theme.spacing(2, 0),
    },
    labelControl: {
      width: '100%',
      padding: theme.spacing(2, 0, 0),
    },
    label: {
      padding: theme.spacing(0, 0, 1),
    },
    expressionEditor: {
      width: '100%',
      height: theme.spacing(5),
      padding: theme.spacing(0),
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

  // destruct props
  const { name, childSpec, inputSpec, defaultValue } = props

  const suggestions = (() => {
    if (inputSpec?.suggestions) {
      return eval(inputSpec?.suggestions)
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
              result.validate[`validate_${count++}`] = (value) => (
                !!eval(rule.data) || rule.message
              )
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
              result.validate[`validate_${count++}`] = (value) => (
                !!eval(rule.data) || rule.message
              )
            }
          })
        }
        // auto suggestions rule
        if (!!inputSpec.suggestionsOnly) {
          result.validate[`validate_${count++}`] = (value) => (
            suggestions.includes(value)
            || `${childSpec.desc} must be a valid value`
          )
        }
        // additional rules by input type
        // console.log(`inputSpec.kind`, inputSpec.kind)
        if (inputSpec.kind === 'input/number') {
          result.validate[`validate_${count++}`] = (value) => {
            return !isNaN(Number(value)) || "Must be a number"
          }
        } else if (inputSpec.kind === 'input/expression') {
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
              <FormControl
                name={name}
                className={styles.formControl}
                error={!!_.get(errors, name)}
                disabled={!!props.disabled}
                >
                <FormHelperText
                  required={!!childSpec.required}>
                  {childSpec.desc}
                </FormHelperText>
                <Switch
                  name={name}
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
            )
          } else if
          (
            inputSpec.kind === 'input/expression'
            || inputSpec.kind === 'input/statement'
          ) {
            return (
              <Box
                className={styles.labelControl}
                >
              <FormControl
                name={name}
                className={styles.formControl}
                error={!!_.get(errors, name)}
                disabled={!!props.disabled}
                focused={monacoFocused}
                >
                <InputLabel
                  shrink={true}
                  required={!!childSpec.required}
                  className={styles.label}
                  >
                  {childSpec.desc}
                </InputLabel>
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
          } else {
            return (
              <FormControl
                name={name}
                disabled={!!props.disabled}
                className={styles.formControl}
                >
                <AutoSuggest
                  label={childSpec.desc}
                  name={name}
                  value={innerProps.value}
                  disabled={!!props.disabled}
                  required={!!childSpec.required}
                  options={suggestions}
                  size="small"
                  onChange={innerProps.onChange}
                  error={!!_.get(errors, name)}
                  helperText={_.get(errors, name)?.message}
                  callback={props.callback}
                  />
              </FormControl>
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
  callback: PropTypes.func,
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ])
}

export default InputField
