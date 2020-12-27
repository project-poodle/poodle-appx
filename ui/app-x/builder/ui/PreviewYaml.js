import React, { useState, useContext, useEffect } from 'react'
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
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import PreviewProvider from 'app-x/builder/ui/PreviewProvider'
import {
  gen_js,
} from 'app-x/builder/ui/util_tree'

const PreviewYaml = (props) => {

  // styles
  const styles = makeStyles((theme) => ({
    editor: {
      width: '100%',
      height: '100%',
    },
  }))()

  // editor context
  const {
    treeData,
    expandedKeys,
    selectedKey,
    treeDirty,
    livePreview,
  } = useContext(EditorProvider.Context)

  // preview context
  const {
    previewLoading,
    setPreviewLoading,
  } = useContext(PreviewProvider.Context)

  // yaml content
  const [ yaml, setYaml ] = useState('')

  // load content from api
  useEffect(() => {

    // load from backend if not livePreview
    if (!livePreview) {
      setPreviewLoading(true)
      // loading url
      const ui_root = globalThis.appx.UI_ROOT
      const url = `/namespace/${props.namespace}/ui_deployment/ui/${props.ui_name}/deployment/${props.ui_deployment}/ui_element/base64:${btoa(props.ui_element_name)}`

      api.get(
        'sys',
        'appx',
        url,
        data => {
          // console.log(data)
          setPreviewLoading(false)
          if (Array.isArray(data)) {
            data = data[0]
          }

          if (!('ui_element_spec' in data) || !('element' in data.ui_element_spec)) {
            setYaml('')
          }

          const doc = new YAML.Document()
          doc.contents = data.ui_element_spec
          // console.log(doc.toString())
          setYaml(doc.toString())
        },
        error => {
          setPreviewLoading(false)
          console.error(error)
        })
    }

  }, [livePreview])

  // load content from UI context treeData
  useEffect(() => {

    // load from UI context if livePreview
    if (!!livePreview) {
      const tree_context = { topLevel: true }
      const { ref, data } = gen_js(tree_context, treeData)
      // yaml data
      const yamlDoc = new YAML.Document()
      yamlDoc.contents = data
      // set editor value
      setYaml(yamlDoc.toString())
    }

  }, [livePreview, treeData])

  // render
  return (
    <Box
      className={styles.editor}
      onScroll={e => e.stopPropagation()}
      >
      <Editor
        language="yaml"
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
        value={yaml}
        >
      </Editor>
    </Box>
  )
}

PreviewYaml.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default PreviewYaml
