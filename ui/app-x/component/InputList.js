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

import AutoSuggest from 'app-x/component/AutoSuggest'
import InputField from 'app-x/component/InputField'
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
const InputList = props => {
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
    hiddenPrompt: {
      width: '100%',
      paddingLeft: theme.spacing(1),
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
  //   (spec.kind === 'input/list') && (Array.isArray(spec.columns))
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
        <Row key="title" className={styles.formControl} justify="center" align="middle" gutter={8}>
          {
            (spec.kind === 'input/list')
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
          const propType = watch(`${props.name}[${index}]._type`)
          return (
            <Row key={item.id} className={styles.formControl} justify="center" align="middle" gutter={8}>
              {
                spec.kind === 'input/list'
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
                          defaultValue={item[column.name]}
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
          if (spec.kind === 'input/list' && Array.isArray(spec.columns)) {
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

// parse
function parse_node(thisNode) {
  // if thisNode is empty, set empty state
  if (!thisNode) {
    // setValue(name, [])
    // setOtherNames([])
    return {
      list: [],
      otherNames: [],
    }
    return
  }
  // get proper children
  const children = thisNode.children
  // keep a list of props and other names
  const list = []
  const others = []
  children?.map(child => {
    if (child.data._type === 'js/null')
    {
      list.push({
        _type: child.data._type,
        name: child.data._ref,
        value: null,
      })
    }
    else if
    (
      child.data._type === 'js/string'
      || child.data._type === 'js/number'
      || child.data._type === 'js/boolean'
      || child.data._type === 'js/expression'
    )
    {
      list.push({
        _type: child.data._type,
        name: child.data._ref,
        value: child.data.data,
      })
    }
    else if (child.data._type === 'js/import')
    {
      list.push({
        _type: child.data._type,
        name: child.data._ref,
        value: child.data.name,
      })
    }
    else
    {
      others.push(child.data._ref)
    }
  })
  console.log(`parseProperties`, list, others)
  // console.trace()
  // setValue(name, list)
  // setOtherNames(others)
  return {
    list: list,
    otherNames: others,
  }
  // other names
}

// process list
function process_list(thisNode, list) {
  // console.log(`list`, list)
  list.map(child => {
    const childNode = lookup_child_for_ref(thisNode, child.name)
    if (!!childNode)
    {
      // found child node, reuse existing key
      if (child._type === 'js/null')
      {
        childNode.data._ref = child.name
        childNode.data._type = child._type
        childNode.data.data = null
      }
      else if (child._type === 'js/string'
              || child._type === 'js/expression')
      {
        childNode.data._ref = child.name
        childNode.data._type = child._type
        childNode.data.data = child.value
      }
      else if (child._type === 'js/number')
      {
        childNode.data._ref = child.name
        childNode.data._type = child._type
        childNode.data.data = Number(child.value)
      }
      else if (child._type === 'js/boolean')
      {
        childNode.data._ref = child.name
        childNode.data._type = child._type
        childNode.data.data = Boolean(child.value)
      }
      else if (child._type === 'js/import')
      {
        childNode.data._ref = child.name
        childNode.data._type = child._type
        childNode.data.name = child.value
      }
      else
      {
        throw new Error(`ERROR: unrecognized child type [${child._type}]`)
      }
      // update title and icon
      childNode.title = lookup_title_for_input(child.name, childNode.data)
      childNode.icon = lookup_icon_for_input(childNode.data)
    }
    else
    {
      // console.log(`new_tree_node`)
      // no child node, create new child node
      if
      (
        child._type === 'js/null'
      )
      {
        const newChildNode = new_tree_node(
          '',
          null,
          {
            _ref: child.name,
            _type: child._type,
            data: null
          },
          true,
          thisNode.key
        )
        // update child title and icon
        newChildNode.title = lookup_title_for_input(child.name, newChildNode.data)
        newChildNode.icon = lookup_icon_for_input(newChildNode.data)
        // add to this node
        thisNode.children.push(newChildNode)
      }
      else if (child._type === 'js/string'
              || child._type === 'js/expression')
      {
        const newChildNode = new_tree_node(
          '',
          null,
          {
            _ref: child.name,
            _type: child._type,
            data: String(child.value)
          },
          true,
          thisNode.key
        )
        // update child title and icon
        newChildNode.title = lookup_title_for_input(child.name, newChildNode.data)
        newChildNode.icon = lookup_icon_for_input(newChildNode.data)
        // add to this node
        thisNode.children.push(newChildNode)
      }
      else if (child._type === 'js/number')
      {
        const newChildNode = new_tree_node(
          '',
          null,
          {
            _ref: child.name,
            _type: child._type,
            data: Number(child.value)
          },
          true,
          thisNode.key
        )
        // update child title and icon
        newChildNode.title = lookup_title_for_input(child.name, newChildNode.data)
        newChildNode.icon = lookup_icon_for_input(newChildNode.data)
        // add to this node
        thisNode.children.push(newChildNode)
      }
      else if (child._type === 'js/boolean')
      {
        const newChildNode = new_tree_node(
          '',
          null,
          {
            _ref: child.name,
            _type: child._type,
            data: Boolean(child.value)
          },
          true,
          thisNode.key
        )
        // update child title and icon
        newChildNode.title = lookup_title_for_input(child.name, newChildNode.data)
        newChildNode.icon = lookup_icon_for_input(newChildNode.data)
        // add to this node
        thisNode.children.push(newChildNode)
      }
      else if (child._type === 'js/import')
      {
        const newChildNode = new_tree_node(
          '',
          null,
          {
            _ref: child.name,
            _type: child._type,
            name: child._type !== 'js/null' ? child.value : null
          },
          true,
          thisNode.key
        )
        // update child title and icon
        newChildNode.title = lookup_title_for_input(child.name, newChildNode.data)
        newChildNode.icon = lookup_icon_for_input(newChildNode.data)
        // add to this node
        thisNode.children.push(newChildNode)
      }
    }
  })
  // console.log(`thisNode.children`, thisNode.children)
  ////////////////////////////////////////
  // remove any primitive child
  thisNode.children = thisNode.children.filter(childNode => {
    if (childNode.data._type === 'js/null'
        || childNode.data._type === 'js/string'
        || childNode.data._type === 'js/number'
        || childNode.data._type === 'js/boolean'
        || childNode.data._type === 'js/expression'
        || childNode.data._type === 'js/import')
    {
      const found = list.find(prop => prop.name === childNode.data._ref)
      return found
    }
    else
    {
      return true
    }
  })
  // console.log(`thisNode.children #2`, thisNode.children)
  ////////////////////////////////////////
  // reorder children
  reorder_children(thisNode)
}

// expose parse and process method
InputList.parse = parse_node
InputList.process = process_list

// propTypes
InputList.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  spec: PropTypes.object.isRequired,
  callback: PropTypes.func,                 // callback function
  className: PropTypes.string,              // display className for element
}

export default InputList
