import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Container,
  Grid,
  Tooltip,
  Typography,
  CircularProgress,
  LinearProgress,
  makeStyles,
} from '@material-ui/core'
import { WebOutlined, InsertDriveFileOutlined } from '@material-ui/icons'
import {
  Layout,
  Tree,
  Tabs,
  Button as AntButton,
  notification,
} from 'antd'
const { Header, Footer, Sider, Content } = Layout
const { DirectoryTree } = Tree
const { TabPane } = Tabs;
import {
  Icon,
  FileOutlined,
  ContainerOutlined,
  CodepenOutlined
} from '@ant-design/icons'

import ReactIcon from 'app-x/icon/React'
// import Live from 'app-x/icon/Live'
import Preview from 'app-x/icon/Preview'
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import PreviewProvider from 'app-x/builder/ui/syntax/PreviewProvider'
import PreviewSource from 'app-x/builder/ui/syntax/PreviewSource'
import PreviewYaml from 'app-x/builder/ui/syntax/PreviewYaml'
import PreviewJson from 'app-x/builder/ui/syntax/PreviewJson'
import {
  deepCompareMemorize,
} from 'app-x/builder/ui/syntax/util_base'
import {
  parse_tree_node,
} from 'app-x/builder/ui/syntax/util_parse'

const PreviewTabs = (props) => {

  const styles = makeStyles((theme) => ({
    root: {
      height: "100%",
      width: "100%",
      padding: theme.spacing(0),
      margin: theme.spacing(0),
    },
    toolTop: {
      margin: theme.spacing(1, 2),
      // cursor: 'move',
    },
    fab: {
      margin: theme.spacing(1),
      // cursor: 'move',
    },
    iframeWrapper: {
      height: '100%',
      width: '100%',
      padding: theme.spacing(0, 2)
    },
    iframe: {
      height: '100%',
      width: '100%',
      //width: 'calc(100% - 1em)',
      padding: 0,
      margin: 0,
      border: 2,
      borderColor: theme.palette.divider,
      borderStyle: 'dashed',
    },
  }))()

  // nav context
  const {
    navDeployment,
    navComponent,
    navRoute,
    navSelected,
    syntaxTreeInitialized,
  } = useContext(NavProvider.Context)

  // editor context
  const {
    // tree data
    treeData,
    expandedKeys,
    selectedKey,
    // test data
    testData,
    // global
    loadTimer,
    livePreview,
    setLivePreview,
    previewInitialized,
    setPreviewInitialized,
  } = useContext(SyntaxProvider.Context)

  // preview context
  const {
    widgetLoading,
    setWidgetLoading,
    liveWidgetUpdating,
    setLiveWidgetUpdating,
    sourceLoading,
    yamlLoading,
    jsonLoading,
  } = useContext(PreviewProvider.Context)

  // code content
  const [ iframeHtml,         setIframeHtml         ] = useState('')

  // form ref and iframe ref
  const formRef = React.useRef(null)
  const iframeRef = React.useRef(null)

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
      && !!treeData && treeData.length
      && !!formRef.current
      && !!iframeRef.current
    )
    {
      // check selected type
      if (
        navSelected.type === 'ui_component'
        && !!navComponent
        && !!navComponent.ui_component_name
      ) {
        // setPreviewLoading(true)
        // widget loading
        setWidgetLoading(true)
        // loading url
        // iframe url
        const iframeUrl =
          (globalThis.appx.UI_ROOT
          + '/' + navDeployment.namespace
          + '/' + navDeployment.ui_name
          + '/' + navDeployment.ui_deployment
          + '/_elem' + navComponent.ui_component_name + '.html').replace(/\+/g, '/')
        // console.log(iframeUrl)
        iframeRef.current.src=iframeUrl
        setWidgetLoading(false)
      }
    }
  },
  [
    navDeployment.namespace,
    navDeployment.ui_name,
    navDeployment.ui_ver,
    navDeployment.ui_deployment,
    navComponent.ui_component_name,
    navRoute.ui_route_name,
    navSelected.type,
    loadTimer,
    livePreview,
    syntaxTreeInitialized,
    iframeRef.current,
    formRef.current,
  ])

  // load content from UI context treeData
  useEffect(() => {

    // load from UI context if livePreview
    // console.log(`submit`, iframeRef.current, formRef.current, livePreview, syntaxTreeInitialized, previewInitialized)

    if
    (
      !!syntaxTreeInitialized
      && !previewInitialized
      && !!livePreview
      && !!navDeployment
      && !!navDeployment.namespace
      && !!navDeployment.ui_name
      && !!navDeployment.ui_ver
      && !!navDeployment.ui_deployment
      && !!navSelected
      && !!treeData && treeData.length
      && !!formRef.current
      && !!iframeRef.current
    )
    {
      // console.log(treeData)
      const tree_context = { topLevel: true }
      const { ref, data: genData } = parse_tree_node(tree_context, treeData)
      // console.log(genData)
      const spec = !!testData
        ? { ...genData, _test: testData }
        : genData

      // check selected type
      if (
        navSelected.type === 'ui_component'
        && !!navComponent
        && !!navComponent.ui_component_name
      ) {
        try {
          // widget loading
          setWidgetLoading(true)
          // preview loading
          // setPreviewLoading(true)
          // preview data
          const submitData = {
            type: 'ui_component',
            output: 'html',
            data: {
              namespace: navDeployment.namespace,
              ui_name: navDeployment.ui_name,
              ui_ver: navDeployment.ui_ver,
              ui_deployment: navDeployment.ui_deployment,
              ui_component_name: navComponent.ui_component_name,
              ui_component_type: navComponent.ui_component_type,
              ui_component_spec: spec
            },
          }
          // console.log(submitData)
          // console.log(`formRef.submit`, formRef.current, submitData)
          // build form for submission
          formRef.current.innerHTML = '' // clear children
          const input = document.createElement('input')
          input.name = `{"_trash": "`
          input.value = `", "urlencoded": ${JSON.stringify(submitData)}}`
          formRef.current.appendChild(input)
          formRef.current.submit() // submit form
          // set initialized flag
          setLiveWidgetUpdating(true)
          setPreviewInitialized(true)
          setWidgetLoading(false)
        } catch (err) {
          setWidgetLoading(false)
          notification.error({
            message: `Failed to load`,
            description: String(err),
            placement: 'bottomLeft',
          })
        }
      }
    }
  },
  [
    navDeployment.namespace,
    navDeployment.ui_name,
    navDeployment.ui_ver,
    navDeployment.ui_deployment,
    navComponent.ui_component_name,
    navComponent.ui_component_type,
    navSelected.type,
    livePreview,
    treeData,
    loadTimer,
    previewInitialized,
    syntaxTreeInitialized,
    iframeRef.current,
    formRef.current,
  ])

  // load content from UI context treeData
  useEffect(() => {

    // load from UI context if livePreview
    if
    (
      !!syntaxTreeInitialized
      && !!previewInitialized
      && !!livePreview
      && !!navDeployment
      && !!navDeployment.namespace
      && !!navDeployment.ui_name
      && !!navDeployment.ui_ver
      && !!navDeployment.ui_deployment
      && !!navSelected
      && !!treeData && treeData.length
      && !!formRef.current
      && !!iframeRef.current
    )
    {
      try {
        // generate data
        const tree_context = { topLevel: true }
        const { ref, data } = parse_tree_node(tree_context, treeData)
        // preview loading
        const spec = !!testData
          ? { ...data, _test: testData }
          : data
        // check selected type
        if (
          navSelected.type === 'ui_component'
          && !!navComponent
          && !!navComponent.ui_component_name
        ) {
          // live widget update
          setLiveWidgetUpdating(true)
          // setPreviewLoading(true)
          // preview data
          const message = {
            path: globalThis.appx.UI_ROOT
              + '/' + navDeployment?.namespace
              + '/' + navDeployment?.ui_name
              + '/' + navDeployment?.ui_deployment
              + '/',
            data: {
              type: 'ui_component',
              output: 'code',
              data: {
                namespace: navDeployment.namespace,
                ui_name: navDeployment.ui_name,
                ui_ver: navDeployment.ui_ver,
                ui_spec: navDeployment.ui_spec,
                ui_deployment: navDeployment.ui_deployment,
                ui_deployment_spec: navDeployment.ui_deployment_spec,
                ui_component_name: navComponent.ui_component_name,
                ui_component_type: navComponent.ui_component_type,
                ui_component_spec: spec
              }
            }
          }
          // build form for submission
          // console.log(submitData)
          iframeRef.current.contentWindow.postMessage(
            message,
            window.location.origin,
          )
        }
      } catch (error) {
        notification['error']({
          message: 'Live Update Failed',
          description: error.toString(),
          placement: 'bottomLeft',
        })
      } finally {
        // set setLiveWidgetUpdating to false
        setLiveWidgetUpdating(false)
      }
    }
  },
  [
    navDeployment.namespace,
    navDeployment.ui_name,
    navDeployment.ui_ver,
    navDeployment.ui_deployment,
    navComponent.ui_component_name,
    navComponent.ui_component_type,
    navRoute.ui_route_name,
    navSelected.type,
    livePreview,
    treeData,
    previewInitialized,
    syntaxTreeInitialized,
    iframeRef.current,
    formRef.current,
  ])

  const MemorizedPreviewSource = React.useMemo(() => () => {
    return (
      <PreviewSource />
    )
  }, [syntaxTreeInitialized, livePreview, treeData, testData].map(deepCompareMemorize))

  const MemorizedPreviewYaml = React.useMemo(() => () => {
    return (
      <PreviewYaml />
    )
  }, [syntaxTreeInitialized, livePreview, treeData, testData].map(deepCompareMemorize))

  return (
    <Box className={styles.root}>
    {
      !(
        !!navDeployment.namespace
        && !!navDeployment.ui_name
        && !!navDeployment.ui_ver
        && !!navDeployment.ui_deployment
        && !!navSelected.type
        && !!navComponent.ui_component_name
      )
      &&
      (
        <Box
          className={styles.root}
          display="flex"
          justifyContent="center"
          alignItems="center"
          >
          <Typography variant="body2">
            Select a UI component or route
          </Typography>
        </Box>
      )
    }
    {
      (
        !syntaxTreeInitialized
        && !!navDeployment.namespace
        && !!navDeployment.ui_name
        && !!navDeployment.ui_ver
        && !!navDeployment.ui_deployment
        && !!navSelected.type
        && !!navComponent.ui_component_name
      )
      &&
      (
        <Box
          className={styles.root}
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
          >
          <Box>
            <LinearProgress
              color='secondary'
            />
            <Typography variant="body2">
              Loading...
            </Typography>
          </Box>
        </Box>
      )
    }
    {
      (
        !!syntaxTreeInitialized
        && !!navDeployment.namespace
        && !!navDeployment.ui_name
        && !!navDeployment.ui_ver
        && !!navDeployment.ui_deployment
        && !!navSelected.type
        && !!navComponent.ui_component_name
      )
      &&
      (
        <Box className={styles.root}>
          <form
            // encType="application/json"
            encType="text/plain"
            style={{width:0,height:0,display:'none'}}
            ref={formRef}
            action={
                globalThis.appx.UI_ROOT
                + '/' + navDeployment?.namespace
                + '/' + navDeployment?.ui_name
                + '/' + navDeployment?.ui_deployment
                + '/'
            }
            method="POST"
            target="live_preview"
            >
            <input name="type" value="ui_component" readOnly/>
            <input name="output" value="html" readOnly/>
            <input name="data[]" value="3" readOnly/>
          </form>
          <Tabs
            defaultActiveKey="widget"
            tabPosition="top"
            size="small"
            className={styles.root}
            tabBarExtraContent={{
              left:
                <Box key="toolTop" display="inline" className={styles.toolTop}>
                  <Tooltip
                    key="preview"
                    title={ livePreview ? "Preview" : "Backend" }
                    placement="bottom"
                    >
                    <AntButton
                      size="small"
                      color="secondary"
                      type={ livePreview ? "primary" : "default" }
                      className={styles.fab}
                      key="preview"
                      icon={<Preview />}
                      shape="circle"
                      onClick={e => {
                        setLivePreview(!livePreview);
                        setPreviewInitialized(false);
                      }}
                      loading={
                        (
                          livePreview
                          && !previewInitialized
                        )
                        || widgetLoading
                        || liveWidgetUpdating
                        || sourceLoading
                        || yamlLoading
                        || jsonLoading
                      }
                      >
                    </AntButton>
                  </Tooltip>
                </Box>
            }}
            >
            {
              (
                (
                  navSelected.type === 'ui_component'
                  && !!navComponent.ui_component_name
                  &&
                  (
                    navComponent?.ui_component_type === 'react/component'
                  )
                )
              )
              &&
              (
                <TabPane tab="Widget" key="iframe" className={styles.root}>
                  <Box className={styles.root}>
                    <Box className={styles.iframeWrapper}>
                      <iframe ref={iframeRef} name="live_preview" className={styles.iframe}>
                      </iframe>
                    </Box>
                  </Box>
                </TabPane>
              )
            }
            {
              (
                (
                  navSelected.type === 'ui_component'
                  && !!navComponent.ui_component_name
                )
              )
              &&
              (
                <TabPane tab="Code" key="code" className={styles.root}>
                  <MemorizedPreviewSource />
                </TabPane>
              )
            }
            {
              (
                (
                  navSelected.type === 'ui_component'
                  && !!navComponent.ui_component_name
                )
              )
              &&
              (
                <TabPane tab="YAML" key="yaml" className={styles.root}>
                  <MemorizedPreviewYaml />
                </TabPane>
              )
            }
            {
              /*
              (
                (
                  navSelected.type === 'ui_component'
                  && !!navComponent.ui_component_name
                )
              )
              &&
              (
                <TabPane tab="JSON" key="json" className={styles.root}>
                  <MemorizedPreviewJson />
                </TabPane>
              )
              */
            }
          </Tabs>
        </Box>
      )
    }
    </Box>
  )
}

export default PreviewTabs
