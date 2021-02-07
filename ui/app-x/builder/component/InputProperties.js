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
import { parse, parseExpression } from "@babel/parser"
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'

import AutoSuggest from 'app-x/builder/component/AutoSuggest'
import NavProvider from 'app-x/builder/ui/NavProvider'
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
  validation
} from 'app-x/builder/ui/syntax/util_base'

// array text field
const InputProperties = props => {
  // theme
  const theme = useTheme()
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

  // name and thisNode
  const { name, otherNames, inputSpec } = props
  const { selfImportNames } = React.useContext(NavProvider.Context)
  // console.log(`NavProvider.Context [selfImportNames]`, selfImportNames)
  // states and effects
  const [ nameOptions, setNameOptions ] = useState([])
  const [ importNames, setImportNames ] = useState([])

  // name options
  useEffect(() => {
    if (!!inputSpec.options) {
      const name_options = eval(inputSpec.options)
      // console.log(`inputSpec.options`, name_options)
      setNameOptions(name_options)
    } else if (!!props.options) {
      setNameOptions(props.options)
    } else {
      setNameOptions([])
    }
  }, [props.options, inputSpec])

  // importNames
  useEffect(() => {
    const result = valid_import_names()
    if (!!selfImportNames) {
      setImportNames(result.concat(selfImportNames))
    } else {
      setImportNames(result)
    }
  }, [])

  ////////////////////////////////////////////////////////////////////////////////
  // set properties
  // useEffect(() => {
  //  // if thisNode is empty, set empty state
  //  // other names
  // }, [name, thisNode])

  ////////////////////////////////////////////////////////////////////////////////
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
        fields.map((item, index) => {
          const propType = watch(`${props.name}[${index}]._type`)
          return (
            <Box key={item.id} display="flex" className={styles.formControl}>
              <Controller
                key='type'
                name={`${props.name}[${index}]._type`}
                control={control}
                defaultValue={item?._type || 'js/string'}
                rules={{
                  required: "Property type is required",
                }}
                callback={props.callback}
                render={innerProps =>
                  <FormControl className={styles.typeControl}>
                    <TextField
                      select={true}
                      name={innerProps.name}
                      value={innerProps.value}
                      color='secondary'
                      size="small"
                      onChange={e => {
                        innerProps.onChange(e.target.value)
                        if (props.callback) {
                          props.callback(e.target.value, innerProps.name)
                        }
                      }}
                      error={
                        !!_.get(errors, props.name)
                        && !!_.get(errors, props.name)[index]?._type
                      }
                      helperText={
                        !!_.get(errors, props.name)
                        && _.get(errors, props.name)[index]?._type?.message
                      }
                      >
                      {
                        [
                          'js/string',
                          'js/number',
                          'js/boolean',
                          'js/null',
                          'js/expression',
                          'js/import'
                        ].map(type => (
                          <MenuItem key={type} value={type}>
                            { lookup_icon_for_type(type) }
                          </MenuItem>
                        ))
                      }
                    </TextField>
                  </FormControl>
                }
              />
              <Controller
                key='name'
                name={`${props.name}[${index}].name`}
                type={'text'}
                control={control}
                defaultValue={item?.name}
                rules={{
                  required: "Property name is required",
                  pattern: {
                    value: /^[_a-zA-Z][_a-zA-Z0-9\-]*$/,
                    message: "Property name must be valid variable name",
                  },
                  validate: {
                    noDuplicateWithOthers: value => {
                      return
                        !otherNames
                        || !otherNames.includes(value)
                        || "Property name duplicate with one of existing properties"
                    },
                    noDuplicateWithSelf: value => {
                      let found = false
                      _.get(getValues(), props.name)?.map((child, i) => {
                        // console.log(`child`, child, i)
                        if (child.name === value && index !== i) {
                          found = true
                        }
                      })
                      return !found
                        || "Another property has same name"
                    }
                  }
                }}
                render={innerProps =>
                  <FormControl className={styles.nameControl}>
                    <AutoSuggest
                      key='name'
                      name={`${props.name}[${index}].name`}
                      // className={styles.nameControl}
                      color='secondary'
                      size="small"
                      value={innerProps.value}
                      onChange={innerProps.onChange}
                      options={nameOptions}
                      callback={props.callback}
                      >
                    </AutoSuggest>
                  </FormControl>
                }
              />
              <Box className={styles.formControl}>
                {
                  (propType === 'js/boolean')
                  &&
                  (
                    <Controller
                      key='value'
                      name={`${props.name}[${index}].value`}
                      control={control}
                      defaultValue={item?.value}
                      render={innerProps =>
                        (
                          <FormControl key="boolean" className={styles.valueControl}>
                            <Switch
                              name={innerProps.name}
                              color='secondary'
                              size="small"
                              checked={innerProps.value}
                              onChange={e => {
                                innerProps.onChange(e.target.checked)
                                if (props.callback) {
                                  props.callback(e.target.checked, innerProps.name)
                                }
                              }}
                            />
                          </FormControl>
                        )
                      }
                    />
                  )
                }
                {
                  (propType === 'js/string')
                  &&
                  (
                    <Controller
                      key='value'
                      name={`${props.name}[${index}].value`}
                      control={control}
                      defaultValue={item?.value}
                      rules={{
                        required: "Property value is required"
                      }}
                      render={innerProps =>
                        (
                          <FormControl key="data" className={styles.valueControl}>
                            <TextField
                              className={styles.formControl}
                              name={innerProps.name}
                              value={innerProps.value}
                              color='secondary'
                              size="small"
                              onChange={e => {
                                innerProps.onChange(e.target.value)
                                if (props.callback) {
                                  props.callback(e.target.value, innerProps.name)
                                }
                              }}
                              error={
                                !!_.get(errors, props.name)
                                && !!_.get(errors, props.name)[index]?.value
                              }
                              helperText={
                                !!_.get(errors, props.name)
                                && _.get(errors, props.name)[index]?.value?.message
                              }
                            />
                          </FormControl>
                        )
                      }
                    />
                  )
                }
                {
                  (propType === 'js/number')
                  &&
                  (
                    <Controller
                      key='value'
                      name={`${props.name}[${index}].value`}
                      control={control}
                      defaultValue={item?.value}
                      rules={{
                        required: "Number is required",
                        validate: {
                          checkNumber: value => !isNaN(Number(value)) || "Must be a number",
                        }
                      }}
                      render={innerProps =>
                        (
                          <FormControl key="data" className={styles.valueControl}>
                            <TextField
                              className={styles.formControl}
                              name={innerProps.name}
                              value={innerProps.value}
                              color='secondary'
                              size="small"
                              onChange={e => {
                                innerProps.onChange(e.target.value)
                                if (props.callback) {
                                  props.callback(e.target.value, innerProps.name)
                                }
                              }}
                              error={
                                !!_.get(errors, props.name)
                                && !!_.get(errors, props.name)[index]?.value
                              }
                              helperText={
                                !!_.get(errors, props.name)
                                && _.get(errors, props.name)[index]?.value?.message
                              }
                            />
                          </FormControl>
                        )
                      }
                    />
                  )
                }
                {
                  (propType === 'js/expression')
                  &&
                  (
                    <Controller
                      key='value'
                      name={`${props.name}[${index}].value`}
                      control={control}
                      defaultValue={item?.value}
                      rules={{
                        required: "Expression is required",
                        validate: {
                          expressionSyntax: value => {
                            try {
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
                        }
                      }}
                      render={innerProps =>
                        (
                          <FormControl key="data" className={styles.valueControl}>
                            <TextField
                              className={styles.formControl}
                              name={innerProps.name}
                              value={innerProps.value}
                              color='secondary'
                              size="small"
                              onChange={e => {
                                innerProps.onChange(e.target.value)
                                if (props.callback) {
                                  props.callback(e.target.value, innerProps.name)
                                }
                              }}
                              error={
                                !!_.get(errors, props.name)
                                && !!_.get(errors, props.name)[index]?.value
                              }
                              helperText={
                                !!_.get(errors, props.name)
                                && _.get(errors, props.name)[index]?.value?.message
                              }
                            />
                          </FormControl>
                        )
                      }
                    />
                  )
                }
                {
                  (propType === 'js/import')
                  &&
                  (
                    <Controller
                      key='value'
                      name={`${props.name}[${index}].value`}
                      control={control}
                      defaultValue={item?.value}
                      rules={{
                        required: "Import name is required",
                        validate: {
                          valid_name: value => (
                            importNames.includes(value)
                            || "Must use a valid name"
                          )
                        }
                      }}
                      render={innerProps =>
                        (
                          <FormControl key="data" className={styles.valueControl}>
                            <AutoSuggest
                              key='value'
                              name={`${props.name}[${index}].value`}
                              className={styles.valueControl}
                              color='secondary'
                              size="small"
                              value={innerProps.value}
                              onChange={innerProps.onChange}
                              options={importNames}
                              callback={props.callback}
                              >
                            </AutoSuggest>
                          </FormControl>
                        )
                      }
                    />
                  )
                }
              </Box>
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
          )
        })
      }
      {
        (
          !!props.otherNames?.length
        )
        &&
        (
          <FormHelperText className={styles.hiddenPrompt} key="otherNames">
            Hidden composite properties: [ {`${props.otherNames.toString()}`} ]
          </FormHelperText>
        )
      }
      <IconButton
        key="add"
        aria-label="Add"
        size="small"
        onClick={e => {
          append({
            type: 'js/string',
            name: '',
            value: '',
          })
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
      properties: [],
      otherNames: [],
    }
    return
  }
  // get proper children
  const children = thisNode.children
  // keep a list of props and other names
  const properties = []
  const others = []
  children?.map(child => {
    if (child.data._type === 'js/null')
    {
      properties.push({
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
      properties.push({
        _type: child.data._type,
        name: child.data._ref,
        value: child.data.data,
      })
    }
    else if (child.data._type === 'js/import')
    {
      properties.push({
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
  // console.log(`parseProperties`, properties, others)
  // console.trace()
  // setValue(name, properties)
  // setOtherNames(others)
  return {
    properties: properties,
    otherNames: others,
  }
  // other names
}

// process properties
function process_properties(thisNode, properties) {
  // console.log(`properties`, properties)
  properties.map(child => {
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
      const found = properties.find(prop => prop.name === childNode.data._ref)
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
InputProperties.parse = parse_node
InputProperties.process = process_properties

// propTypes
InputProperties.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  inputSpec: PropTypes.object.isRequired,
  otherNames: PropTypes.arrayOf(
    PropTypes.string.isRequired,
  ).isRequired,
  options: PropTypes.array,                 // for prop name autocomplete
  callback: PropTypes.func,                 // callback function
  className: PropTypes.string,              // display className for element
}

export default InputProperties
