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
  InputLabel,
  ListItemIcon,
  Switch,
  makeStyles,
  useTheme,
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
import {
  Row,
  Col
} from 'antd'
import { parse, parseExpression } from "@babel/parser"
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'

import AutoSuggest from 'app-x/builder/component/AutoSuggest'
import InputField from 'app-x/builder/component/InputField'
import {
  new_tree_node,
  lookup_title_for_input,
  lookup_icon_for_input,
  lookup_icon_for_type,
  reorder_children,
} from 'app-x/builder/ui/syntax/util_generate'
import {
  tree_traverse,
  tree_lookup,
  lookup_child_for_ref
} from 'app-x/builder/ui/syntax/util_parse'
import {
  valid_api_methods,
  valid_import_names,
  valid_html_tags,
} from 'app-x/builder/ui/syntax/util_base'


// array text field
const InputFieldTabular = props => {
  // theme
  const theme = useTheme()
  // make styles
  const styles = makeStyles((theme) => ({
    formControl: {
      width: '100%',
    },
    title: {
      width: '100%',
      padding: theme.spacing(1, 0, 0),
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

  // name and spec
  const { name, label, spec } = props

  // console.log(`props`, name, label, spec, spec.kind, Array.isArray(spec.columns),
  //   (spec.kind === 'input/tabular') && (Array.isArray(spec.columns))
  // )

  //////////////////////////////////////////////////////////////////////////////
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
        <Row key="title" className={styles.title} justify="center" align="middle" gutter={8}>
          {
            (spec.kind === 'input/tabular')
            && (Array.isArray(spec.columns))
            && (!!fields && !!fields.length)
            &&
            (
              spec.columns.map(column => {
                // console.log(`column`, column)
                return (
                  <Col span={column.span || 4} key={column.name}>
                    <Box display="flex" justifyContent="center">
                      <InputLabel
                        shrink={true}
                        required={!!column.required}
                        >
                        { column.title || column.name || '' }
                      </InputLabel>
                    </Box>
                  </Col>
                )
              })
              .concat(
                <Col span={2} key='_action'>
                </Col>
              )
            )
          }
        </Row>
      }
      {
        fields.map((item, index) => {
          // console.log(`InputFieldTabular fields.item`, item, getValues())
          return (
            <Row key={item.id} className={styles.formControl} justify="center" align="middle" gutter={8}>
              {
                spec.kind === 'input/tabular'
                && Array.isArray(spec.columns)
                &&
                (
                  spec.columns.map(column => {
                    const fieldName = `${name}[${index}].${column.name}`
                    return (
                      <Col span={column.span || 4} key={column.name}>
                        <InputField
                          key={fieldName}
                          name={fieldName}
                          className={styles.formControl}
                          size="small"
                          margin="none"
                          // disabled={!!disabled[custom.name]}
                          childSpec={column}
                          inputSpec={column.input}
                          defaultValue={_.get(item, column.name)}
                          callback={props.callback}
                        />
                      </Col>
                    )
                  })
                )
              }
              <Col span={2}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <IconButton
                    key="remove"
                    aria-label="Remove"
                    size="small"
                    onClick={e => {
                      remove(index)
                      if (!!props.callback) {
                        props.callback(e)
                      }
                    }}
                    >
                    <RemoveCircleOutline />
                  </IconButton>
                </Box>
              </Col>
            </Row>
          )
        })
      }
      <IconButton
        key="add"
        aria-label="Add"
        size="small"
        onClick={e => {
          // console.log(`getValues`, getValues(), getValues(props.name))
          const new_row = {}
          if (spec.kind === 'input/tabular' && Array.isArray(spec.columns)) {
            spec.columns.map(column => {
              if (!!spec.default) {
                new_row[column.name] = eval(spec.default)
              } else {
                new_row[column.name] = ''
              }
            })
          }
          // console.log(`append`, new_row)
          append(new_row)
        }}
        >
        <AddCircleOutline />
      </IconButton>
    </Box>
  )
}

// propTypes
InputFieldTabular.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  spec: PropTypes.object.isRequired,
  callback: PropTypes.func,                 // callback function
  className: PropTypes.string,              // display className for element
}

export default InputFieldTabular
