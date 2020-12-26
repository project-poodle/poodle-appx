import React, { useState, useContext, useEffect } from "react"
import {
  FormControl,
  TextField,
  makeStyles,
} from '@material-ui/core'
import {
  AutoComplete,
} from 'antd'
import {
  valid_import_names,
} from 'app-x/builder/ui/util_parse'

const AutoCompleteImportName = (props) => {

  const styles = makeStyles((theme) => ({
    formControl: {
      width: '100%',
      // margin: theme.spacing(1),
      // padding: theme.spacing(2, 0, 2, 2),
    },
  }))()

  const [ options,    setOptions    ] = useState([])

  useEffect(() => {
    setOptions(valid_import_names().map(n => ({value: n})))
  }, [props.selectedKey])

  return (
    <FormControl className={styles.formControl}>
      <AutoComplete
        options={options}
        value={props.value}
        onChange={data => {
          props.onChange(data)
          if (props.callback) {
            props.callback(data)
          }
        }}
        onSearch={s => {
          const valid_names = valid_import_names()
          const s_list = s.toUpperCase().split(' ').filter(s => !!s)
          const found_options = valid_names.filter(name => {
            const name_upper = name.toUpperCase()
            return s_list.reduce(
              (result, obj) => !!result && name_upper.includes(obj),
              true)
          }).map(n => ({value: n}))
          setOptions(found_options)
        }}
        >
        <TextField
          label={props.title}
          name={props.name}
          value={props.value}
          onChange={e => {
            props.onChange(e.target.value)
            if (props.callback) {
              props.callback(e.target.value)
            }
          }}
          error={!!props.errors?.name}
          helperText={props.errors?.name?.message}
        />
      </AutoComplete>
    </FormControl>
  )
}

export default AutoCompleteImportName
