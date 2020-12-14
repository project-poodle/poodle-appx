import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Container,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core'

//import { default as AceEditor } from "react-ace"
//import aceBuilds from "ace-builds"
//import "ace-builds-src-noconflict/mode-java"
//import "ace-builds-src-noconflict/theme-github"
//import "ace-builds-src-noconflict/ext-language_tools"
import { default as Editor } from '@monaco-editor/react'

const SourceViewer = (props) => {

  const [ code, setCode ] = useState('')

  useEffect(() => {

    const ui_root = globalThis.appx.UI_ROOT

    const url = `/${ui_root}/${props.namespace}/${props.ui_name}/${props.ui_deployment}/_elem/${props.ui_element_name}.source`.replace(/\/+/g, '/')

    console.log(url)
    fetch(url)
      .then(response => response.text())
      .then(data => {
        // console.log(data)
        setCode(data)
      })
      .catch(error => {
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
        language="javascript"
        options={{
          readOnly: true,
          wordWrap: 'on',
          wrappingIndent: 'deepIndent',
          scrollBeyondLastLine: false,
          wrappingStrategy: 'advanced',
          minimap: {
            enabled: true
          }
          //overviewRulerLanes: 0,
          //tabIndex: 2,
        }}
        // height="60vh"
        // mode="javascript"
        // width="100%"
        // height="100%"
        // theme="github"
        // mode='javascript'
        // readOnly={true}
        value={code}
        >
      </Editor>
    </Box>
  )
}

SourceViewer.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default SourceViewer
