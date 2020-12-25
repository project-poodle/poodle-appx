import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Container,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core'
import { default as Editor } from '@monaco-editor/react'

import * as api from 'app-x/api'
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import PreviewProvider from 'app-x/builder/ui/PreviewProvider'
import {
  gen_js,
} from 'app-x/builder/ui/util_tree'

const PreviewSource = (props) => {

  // styles
  const styles = makeStyles((theme) => ({
    editor: {
      width: '100%',
      height: '100%',
    },
  }))()

  // editor context
  const {
    apiData,
    treeData,
    expandedKeys,
    selectedKey,
    treeDirty,
    livePreview,
    setLiveUpdate,
  } = useContext(EditorProvider.Context)

  // preview context
  const {
    previewLoading,
    setPreviewLoading,
  } = useContext(PreviewProvider.Context)

  // code content
  const [ code, setCode ] = useState('')

  // load content from backend api
  useEffect(() => {

    // load from backend if not livePreview
    if (!livePreview) {
      setPreviewLoading(true)
      // loading url
      const ui_root = globalThis.appx.UI_ROOT
      const url = `/${ui_root}/${props.namespace}/${props.ui_name}/${props.ui_deployment}/_elem/${props.ui_element_name}.source`.replace(/\/+/g, '/')
      // console.log(url)
      fetch(url)
        .then(response => response.text())
        .then(data => {
          // console.log(data)
          setPreviewLoading(false)
          setCode(data)
        })
        .catch(error => {
          setPreviewLoading(false)
          console.error(error)
        })
    }

  }, [livePreview])

  // load content from UI context treeData
  useEffect(() => {

    // load from UI context if livePreview
    if (livePreview) {
      const tree_context = { topLevel: true }
      const { ref, data } = gen_js(tree_context, treeData)
      // preview source code
      setPreviewLoading(true)
      // preview url
      const ui_root = globalThis.appx.UI_ROOT
      const url = `/${ui_root}/${props.namespace}/${props.ui_name}/${props.ui_deployment}/`.replace(/\/+/g, '/')
      // console.log(url)
      fetch(
        url,
        {
          method: 'POST',
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin', // include, *same-origin, omit
          headers: {
            'Content-Type': 'application/json'
          },
          redirect: 'follow', // manual, *follow, error
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify({
            type: 'ui_element',
            output: 'code',
            data: {
              ...apiData,
              ui_element_spec: data
            },
          }) // body data type must match "Content-Type" header
        }
      ).then(response => response.text())
        .then(data => {
          // console.log(data)
          setPreviewLoading(false)
          setCode(data)
        })
        .catch(error => {
          setPreviewLoading(false)
          console.error(error)
        })
    }

  }, [livePreview, apiData, treeData])

  // render
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
        }}
        value={code}
        >
      </Editor>
    </Box>
  )
}

PreviewSource.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default PreviewSource
