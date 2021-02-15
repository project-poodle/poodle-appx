import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import YAML from 'yaml'
import {
  Box,
  Container,
  Grid,
  Typography,
  makeStyles,
  useTheme,
} from '@material-ui/core'
import { default as Editor } from '@monaco-editor/react'

import * as api from 'app-x/api'
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import PreviewProvider from 'app-x/builder/ui/syntax/PreviewProvider'
import {
  deepCompareMemorize,
} from 'app-x/builder/ui/syntax/util_base'
import {
  parse_tree_node,
} from 'app-x/builder/ui/syntax/util_parse'

const PreviewJson = (props) => {
  // theme
  const theme = useTheme()
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
    navComponent,
    navRoute,
    navSelected,
  } = useContext(NavProvider.Context)

  // editor context
  const {
    treeData,
    expandedKeys,
    selectedKey,
    testData,
    loadTimer,
    livePreview,
  } = useContext(SyntaxProvider.Context)

  // preview context
  const {
    jsonLoading,
    setJsonLoading,
  } = useContext(PreviewProvider.Context)

  // json content
  const [ json, setJson ] = useState('')

  // load content from api
  useEffect(() => {

    if
    (
      !livePreview
      && !!navDeployment
      && !!navDeployment.namespace
      && !!navDeployment.ui_name
      && !!navDeployment.ui_ver
      && !!navDeployment.ui_deployment
      && !!navSelected
    )
    {
      if (
        navSelected.type === 'ui_component'
        && !!navComponent
        && !!navComponent.ui_component_name
      ) {
        // set loading status
        setJsonLoading(true)
        // loading url
        const ui_root = globalThis.appx.UI_ROOT
        const url = `/namespace/${navDeployment.namespace}/ui_deployment/ui/${navDeployment.ui_name}/deployment/${navDeployment.ui_deployment}/ui_component/base64:${btoa(navComponent.ui_component_name)}`

        api.get(
          'sys',
          'appx',
          url,
          data => {
            // console.log(data)
            setJsonLoading(false)
            if (Array.isArray(data)) {
              data = data[0]
            }

            if (!('ui_component_spec' in data)) {
              setJson('')
            }

            setJson(JSON.stringify(data.ui_component_spec, null, 2))
          },
          error => {
            console.error(error)
            setJsonLoading(false)
            setJson(error.toString())
          }
        )
      }
      else if
      (
        navSelected.type === 'ui_route'
        && !!navRoute
        && !!navRoute.ui_route_name
      )
      {
        // set loading status
        setJsonLoading(true)
        // loading url
        const ui_root = globalThis.appx.UI_ROOT
        const url = `/namespace/${navDeployment.namespace}/ui_deployment/ui/${navDeployment.ui_name}/deployment/${navDeployment.ui_deployment}/ui_route/base64:${btoa(navRoute.ui_route_name)}`

        api.get(
          'sys',
          'appx',
          url,
          data => {
            // console.log(data)
            setJsonLoading(false)
            if (Array.isArray(data)) {
              data = data[0]
            }

            if (!('ui_route_spec' in data)) {
              setJson('')
            }

            setJson(JSON.stringify(data.ui_route_spec, null, 2))
          },
          error => {
            console.error(error)
            setJsonLoading(false)
            setJson(error.toString())
          }
        )
      }
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
      const { ref, data: genData } = parse_tree_node(tree_context, treeData)
      const spec = !!testData
        ? { ...genData, _test: testData }
        : genData
      // set editor value
      setJson(JSON.stringify(spec, null, 2))
    }

  },
  [
    livePreview,
    loadTimer,
    treeData,
    testData,
  ])

  // memorized editor
  const MemorizedEditor = React.useMemo(() => (props) => {
    // theme
    const theme = useTheme()

    return (
      <Editor
        language="json"
        theme={theme?.palette.type === 'dark' ? 'vs-dark' : 'vs'}
        options={{
          readOnly: true,
          wordWrap: 'on',
          wrappingIndent: 'deepIndent',
          scrollBeyondLastLine: false,
          wrappingStrategy: 'advanced',
          lineNumbersMinChars: 0,
          glyphMargin: true,
          // lineDecorationsWidth: 4,
          minimap: {
            enabled: true
          }
        }}
        value={json}
        >
      </Editor>
    )
  }, [json].map(deepCompareMemorize))

  // render
  return (
    <Box
      className={styles.editor}
      onScroll={e => e.stopPropagation()}
      >
      <MemorizedEditor />
    </Box>
  )
}

export default PreviewJson
