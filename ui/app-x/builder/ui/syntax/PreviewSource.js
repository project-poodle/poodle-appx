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
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import PreviewProvider from 'app-x/builder/ui/syntax/PreviewProvider'
import {
  gen_js,
} from 'app-x/builder/ui/syntax/util_tree'

const PreviewSource = (props) => {

  // styles
  const styles = makeStyles((theme) => ({
    editor: {
      width: '100%',
      height: '100%',
    },
  }))()

  // nav context
  const {
    navDeployment,
    navElement,
    navRoute,
    navSelected,
  } = useContext(NavProvider.Context)

  // editor context
  const {
    treeData,
    expandedKeys,
    selectedKey,
    loadTimer,
    treeDirty,
    livePreview,
    setLiveUpdate,
  } = useContext(SyntaxProvider.Context)

  // preview context
  const {
    sourceLoading,
    setSourceLoading,
  } = useContext(PreviewProvider.Context)

  // code content
  const [ code, setCode ] = useState('')

  // load content from backend api
  useEffect(() => {

    // load from backend if not livePreview
    if (!livePreview) {
      setSourceLoading(true)
      // loading url
      const ui_root = globalThis.appx.UI_ROOT
      const url = `/${ui_root}/${navDeployment.namespace}/${navDeployment.ui_name}/${navDeployment.ui_deployment}/_elem/${navElement.ui_element_name}.source`.replace(/\/+/g, '/')
      // console.log(url)
      fetch(url)
        .then(response => response.text())
        .then(data => {
          // console.log(data)
          setSourceLoading(false)
          setCode(data)
        })
        .catch(error => {
          setSourceLoading(false)
          console.error(error)
        })
    }

  },
  [
    livePreview,
    loadTimer,
  ])

  // load content from UI context treeData
  useEffect(() => {

    // load from UI context if livePreview
    if (livePreview) {
      const tree_context = { topLevel: true }
      const { ref, data } = gen_js(tree_context, treeData)
      // preview source code
      setSourceLoading(true)
      // preview url
      const ui_root = globalThis.appx.UI_ROOT
      const url = `/${ui_root}/${navDeployment.namespace}/${navDeployment.ui_name}/${navDeployment.ui_deployment}/`.replace(/\/+/g, '/')
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
              namespace: navDeployment.namespace,
              ui_name: navDeployment.ui_name,
              ui_ver: navDeployment.ui_ver,
              ui_deployment: navDeployment.ui_deployment,
              ui_element_name: navElement.ui_element_name,
              ui_element_type: navElement.ui_element_type,
              ui_element_spec: data
            },
          }) // body data type must match "Content-Type" header
        }
      ).then(response => response.text())
        .then(data => {
          // console.log(data)
          setSourceLoading(false)
          setCode(data)
        })
        .catch(error => {
          setSourceLoading(false)
          console.error(error)
        })
    }

  },
  [
    livePreview,
    loadTimer,
    navDeployment.namespace,
    navDeployment.ui_name,
    navDeployment.ui_ver,
    navDeployment.ui_deployment,
    navElement.ui_element_name,
    navElement.ui_element_type,
    treeData,
  ])

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
