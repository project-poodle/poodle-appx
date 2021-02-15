import React, { useState, useContext, useEffect, useCallback, useMemo } from "react"
import PropTypes from 'prop-types'
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  IconButton,
  TextField,
  makeStyles,
  useTheme,
} from '@material-ui/core'
import {
  AddCircleOutline,
  RemoveCircleOutline,
} from '@material-ui/icons'
import {
  Controller,
  useFormContext,
  useFieldArray,
} from 'react-hook-form'
import {
  Row,
  Col,
  AutoComplete,
} from 'antd'
import _ from 'lodash'
import InputProvider from 'app-x/core/InputProvider'

const InputTabular = (props) => {
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

  // basename and propsId
  const context = useContext(InputProvider.Context)
  const propsId = !!context?.basename ? `${context.basename}.${props.id}` : props.id

  // useFieldArray
  const {
    fields,
    append,
    prepend,
    insert,
    swap,
    move,
    remove,
  } = useFieldArray({
    control,
    name: propsId,
  })

  // console.log(`InputTabular propsId [${propsId}]`, getValues(), _.get(getValues(), propsId))

  // getColumnDefaultValue
  function getColumnDefaultValue(column) {
    if (column?.props?.defaultValue !== undefined) {
      return column.props.defaultValue
    } else if (column?.type?.defaultValue !== undefined) {
      return column.type.defaultValue
    } else {
      return ''
    }
  }

  // propsColumns
  const propsColumns = useMemo(
    () => {
      // console.log(`useMemo`, props.columns.map(column => column.type))
      return props.columns || []
    },
    props.columns?.map(column => column.type)
  )

  // rowPanel widget need to convert to react hooks
  const renderColumn = useCallback((column, props) => {
    // console.log(`column`, column)
    // const Column = withRowContext(column, props)
    const Column = column
    // console.log(`Column`, Column)
    return (
      <Column  {...props} />
    )
  }, [])

  // return
  return (
    <Box
      {...(props.BoxProps || {})}
      style={props.style || {}}
      >
      {
        !!props.label
        &&
        (
          <InputLabel
            key="label"
            shrink={true}
            required={!!props.required}
            >
            { props.label }
          </InputLabel>
        )
      }
      {
        <Row key="title" className={styles.title} justify="center" align="middle" gutter={theme.spacing(1)}>
          {
            (Array.isArray(propsColumns))
            && (!!fields && !!fields.length)
            &&
            (
              React.Children.map(propsColumns, (column) => {
                // console.log(`column`, column)
                return (
                  <Col span={column.props._span || 6} key={column.props.id}>
                    <Box display="flex" justifyContent="center">
                      <InputLabel
                        shrink={true}
                        required={!!column.props.required}
                        >
                        { column.props.label || column.props.id || '' }
                      </InputLabel>
                    </Box>
                  </Col>
                )
              })
              .concat(
                <Col span={props.actionSpan || 2} key='_action'>
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
              <InputProvider basename={`${propsId}[${index}]`}>
                {
                  Array.isArray(propsColumns)
                  &&
                  (
                    // React.Children.map(propsColumns, (column) => {
                    propsColumns.map((column) => {
                      const fieldName = `${propsId}[${index}].${column.props.id}`
                      const defaultValue = _.get(item, column.props.id) || getColumnDefaultValue(column)
                      // const defaultValue = getColumnDefaultValue(column)
                      // console.log(`[${column.props.id}] defaultValue [${defaultValue}]`)
                      return (
                        <Col span={column.props._span || 6} key={column.props.id}>
                          {
                            renderColumn(
                              column.type,
                              {
                                ...column.props,
                                key: column.props.id,
                                label: '',
                                defaultValue: defaultValue,
                                callback: props.callback || null,
                              }
                            )
                          }
                        </Col>
                      )
                    })
                  )
                }
                <Col span={props.actionSpan || 2}>
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <IconButton
                      key="remove"
                      aria-label="Remove"
                      size="small"
                      disabled={!!props.disabled}
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
              </InputProvider>
            </Row>
          )
        })
      }
      <IconButton
        key="add"
        aria-label="Add"
        size="small"
        disabled={!!props.disabled}
        onClick={e => {
          // console.log(`getValues`, getValues(), getValues(propsId))
          const new_row = {}
          if (Array.isArray(propsColumns)) {
            // React.Children.map(propsColumns, (column) => {
            propsColumns.map((column) => {
              new_row[column.props.id] = getColumnDefaultValue(column)
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

InputTabular.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  callback: PropTypes.func,                 // callback function
  actionSpan: PropTypes.number,
  BoxProps: PropTypes.object,
  style: PropTypes.object,
  columns: PropTypes.arrayOf(
    PropTypes.element.isRequired,
  )
}

InputTabular.appxType = 'appx/input/tabular'

export default InputTabular
