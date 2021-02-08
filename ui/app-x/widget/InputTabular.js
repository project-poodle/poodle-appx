import React, { useState, useContext, useEffect, useCallback } from "react"
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
import InputScopeProvider from 'app-x/widget/InputScopeProvider'
import InputText from 'app-x/widget/InputText'

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
  const { basename } = useContext(InputScopeProvider.Context)
  const propsId = !!basename ? `${basename}.${props.id}` : props.id

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

  // withRow
  const withRowContext = (BaseComponent, {key, defaultValue, callback, props}) => () => {
    return (
      <BaseComponent
        {...props}
        label=''
        key={key}
        defaultValue={defaultValue}
        callback={callback}
        />
    )
  }

  // rowPanel widget need to convert to react hooks
  const renderColumn = useCallback((column, {key, defaultValue, callback, props}) => {
    console.log(`column`, column)
    const Column = withRowContext(column, {key, defaultValue, callback, props})
    // console.log(`Column`, Column)
    return (
      <Column />
    )
  }, [])

  // not array
  return (
    <Box
      {...(props.BoxProps || {})}
      style={props.style}
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
            (Array.isArray(props.columns))
            && (!!fields && !!fields.length)
            &&
            (
              React.Children.map(props.columns, (column) => {
                // console.log(`column`, column)
                return (
                  <Col span={column.props.span || 6} key={column.props.id}>
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
              <InputScopeProvider basename={`${propsId}[${index}]`}>
                {
                  Array.isArray(props.columns)
                  &&
                  (
                    React.Children.map(props.columns, (column) => {
                      const fieldName = `${propsId}[${index}].${column.props.id}`
                      return (
                        <Col span={column.props.span || 6} key={column.props.id}>
                          {
                            renderColumn(
                              column.type,
                              {
                                props: column.props,
                                key: column.props.id,
                                defaultValue: _.get(item, column.props.id) || column.props.defaultValue || '',
                                callback: props.callback || null,
                              }
                            )
                          }
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
              </InputScopeProvider>
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
          if (Array.isArray(props.columns)) {
            React.Children.map(props.columns, (column) => {
              if (!!column.props.defaultValue) {
                new_row[column.props.id] = eval(column.props.defaultValue)
              } else {
                new_row[column.props.id] = ''
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

InputTabular.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  callback: PropTypes.func,                 // callback function
  BoxProps: PropTypes.object,
  style: PropTypes.object,
}

InputTabular.appxType = 'appx/input/tabular'

export default InputTabular
