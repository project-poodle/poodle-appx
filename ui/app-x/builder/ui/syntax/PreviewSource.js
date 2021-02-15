import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
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

const PreviewSource = (props) => {
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
    // tree data
    treeData,
    expandedKeys,
    selectedKey,
    // test data
    testData,
    // common
    loadTimer,
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
        && !!navComponent.ui_component_type
      ) {
        setSourceLoading(true)
        // loading url
        const ui_root = globalThis.appx.UI_ROOT
        const url = `/${ui_root}/${navDeployment.namespace}/${navDeployment.ui_name}/${navDeployment.ui_deployment}/_elem/${navComponent.ui_component_name}.source`.replace(/\/+/g, '/')
        // console.log(url)
        fetch(url)
          .then(response => response.text())
          .then(data => {
            // console.log(data)
            setSourceLoading(false)
            setCode(data)
          })
          .catch(error => {
            console.error(error)
            setSourceLoading(false)
            setCode(error.toString())
          })
      }
      else if
      (
        navSelected.type === 'ui_route'
        && !!navRoute
        && !!navRoute.ui_route_name
      )
      {
        setSourceLoading(true)
        // loading url
        const replace_route = navRoute.ui_route_name.replace(/\*/g, '/')
        const source_route = replace_route.endsWith('/')
          ? replace_route + '/index.source'
          : replace_route + '.source'
        const ui_root = globalThis.appx.UI_ROOT
        const url = `/${ui_root}/${navDeployment.namespace}/${navDeployment.ui_name}/${navDeployment.ui_deployment}/_route/${source_route}`.replace(/\/+/g, '/')
        // console.log(url)
        fetch(url)
          .then(response => response.text())
          .then(data => {
            // console.log(data)
            setSourceLoading(false)
            setCode(data)
          })
          .catch(error => {
            console.error(error)
            setSourceLoading(false)
            setCode(error.toString())
          })
      }
    }
  },
  [
    livePreview,
    loadTimer,
    navDeployment.namespace,
    navDeployment.ui_name,
    navDeployment.ui_ver,
    navDeployment.ui_deployment,
    navSelected.type,
    navComponent.ui_component_name,
    navComponent.ui_component_type,
    navRoute.ui_route_name,
  ])

  // load content from UI context treeData
  useEffect(() => {

    // load from UI context if livePreview
    if
    (
      !!livePreview
      && !!navDeployment
      && !!navDeployment.namespace
      && !!navDeployment.ui_name
      && !!navDeployment.ui_ver
      && !!navDeployment.ui_deployment
      && !!navSelected
    )
    {
      // generate spec data
      const tree_context = { topLevel: true }
      const { ref, data: genData } = parse_tree_node(tree_context, treeData)
      const spec = !!testData
        ? { ...genData, _test: testData }
        : genData
      // preview url
      const ui_root = globalThis.appx.UI_ROOT
      const url = `/${ui_root}/${navDeployment.namespace}/${navDeployment.ui_name}/${navDeployment.ui_deployment}/`.replace(/\/+/g, '/')
      // check object type
      if (
        navSelected.type === 'ui_component'
        && !!navComponent
        && !!navComponent.ui_component_name
        && !!navComponent.ui_component_type
      ) {
        // preview source code
        setSourceLoading(true)
        // console.log(url)
        const postData = {
          namespace: navDeployment.namespace,
          ui_name: navDeployment.ui_name,
          ui_ver: navDeployment.ui_ver,
          ui_deployment: navDeployment.ui_deployment,
          ui_component_name: navComponent.ui_component_name,
          ui_component_type: navComponent.ui_component_type,
          ui_component_spec: spec
        }
        // console.log(postData)
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
              type: navSelected.type,
              output: 'code',
              data: postData,
            }) // body data type must match "Content-Type" header
          }
        )
        .then(response => response.text())
        .then(data => {
          // console.log(data)
          setSourceLoading(false)
          setCode(data)
        })
        .catch(error => {
          setSourceLoading(false)
          setCode(error.toString())
          console.error(error)
        })
      }
      else if
      (
        navSelected.type === 'ui_route'
        && !!navRoute
        && !!navRoute.ui_route_name
      )
      {
        // preview source code
        setSourceLoading(true)
        // console.log(url)
        const postData = {
          namespace: navDeployment.namespace,
          ui_name: navDeployment.ui_name,
          ui_ver: navDeployment.ui_ver,
          ui_deployment: navDeployment.ui_deployment,
          ui_route_name: navRoute.ui_route_name,
          ui_route_spec: spec
        }
        // console.log(postData)
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
              type: navSelected.type,
              output: 'code',
              data: postData,
            }) // body data type must match "Content-Type" header
          }
        )
        .then(response => response.text())
        .then(data => {
          // console.log(data)
          setSourceLoading(false)
          setCode(data)
        })
        .catch(error => {
          setSourceLoading(false)
          setCode(error.toString())
          console.error(error)
        })
      }
    }
  },
  [
    livePreview,
    loadTimer,
    navDeployment.namespace,
    navDeployment.ui_name,
    navDeployment.ui_ver,
    navDeployment.ui_deployment,
    navSelected.type,
    navComponent.ui_component_name,
    navComponent.ui_component_type,
    navRoute.ui_route_name,
    treeData,
    testData,
  ])

  // memorized editor
  const MemorizedEditor = React.useMemo(() => (props) => {
    // theme
    const theme = useTheme()

    return (
      <Editor
        language="javascript"
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
        value={code}
        >
      </Editor>
    )
  }, [code].map(deepCompareMemorize))

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

export default PreviewSource
