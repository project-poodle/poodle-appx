import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import YAML from 'yaml'
import {
  Box,
  Container,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core'
import { default as Editor } from '@monaco-editor/react'

import * as api from 'app-x/api'

const JsonViewer = (props) => {

  const [ json, setJson ] = useState('')

  useEffect(() => {

    const ui_root = globalThis.appx.UI_ROOT

    const url = `/namespace/${props.namespace}/ui_deployment/ui/${props.ui_name}/deployment/${props.ui_deployment}/ui_element/base64:${btoa(props.ui_element_name)}`

    api.get(
      'sys',
      'appx',
      url,
      data => {
        console.log(data)
        if (Array.isArray(data)) {
          data = data[0]
        }

        if (!('ui_element_spec' in data) || !('element' in data.ui_element_spec)) {
          setYaml('')
        }

        setJson(JSON.stringify(data.ui_element_spec, null, 2))
      },
      error => {
        console.error(error)
      })

  }, [])

  const styles = makeStyles((theme) => ({
    editor: {
      width: '100%',
      height: '100%',
    },
  }))()

  //console.log(aceBuilds)
  console.log(Editor)

  return (
    <Box
      className={styles.editor}
      onScroll={e => e.stopPropagation()}
      >
      <Editor
        language="json"
        options={{
          readOnly: true,
          wordWrap: 'on',
          wrappingIndent: 'deepIndent',
          scrollBeyondLastLine: false,
          //tabIndex: 2,
        }}
        // height="60vh"
        // mode="javascript"
        // width="100%"
        // height="100%"
        // theme="github"
        // mode='javascript'
        // readOnly={true}
        value={json}
        >
      </Editor>
    </Box>
  )
}

JsonViewer.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default JsonViewer
