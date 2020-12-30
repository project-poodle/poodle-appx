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
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import PreviewProvider from 'app-x/builder/ui/syntax/PreviewProvider'
import {
  gen_js,
} from 'app-x/builder/ui/syntax/util_tree'

const PreviewYaml = (props) => {

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
  } = useContext(SyntaxProvider.Context)

  // preview context
  const {
    yamlLoading,
    setYamltLoading,
  } = useContext(PreviewProvider.Context)

  // yaml content
  const [ yaml, setYaml ] = useState('')

  // load content from api
  useEffect(() => {

    // load from backend if not livePreview
    if (!livePreview) {
      setYamltLoading(true)
      // loading url
      const ui_root = globalThis.appx.UI_ROOT
      const url = `/namespace/${navDeployment.namespace}/ui_deployment/ui/${navDeployment.ui_name}/deployment/${navDeployment.ui_deployment}/ui_element/base64:${btoa(navElement.ui_element_name)}`

      api.get(
        'sys',
        'appx',
        url,
        data => {
          // console.log(data)
          setYamltLoading(false)
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
          setYamltLoading(false)
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
    if (!!livePreview) {
      const tree_context = { topLevel: true }
      const { ref, data } = gen_js(tree_context, treeData)
      // yaml data
      const yamlDoc = new YAML.Document()
      yamlDoc.contents = data
      // set editor value
      setYaml(yamlDoc.toString())
    }

  },
  [
    livePreview,
    loadTimer,
    treeData,
  ])

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
