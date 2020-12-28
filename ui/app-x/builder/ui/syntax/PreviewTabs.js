import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Container,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core'
import { WebOutlined, InsertDriveFileOutlined } from '@material-ui/icons'
import {
  Layout,
  Tree,
  Tabs,
  Tooltip,
  Button as AntButton,
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
  gen_js,
} from 'app-x/builder/ui/syntax/util_tree'

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
    navElement,
    navRoute,
    navSelected,
  } = useContext(NavProvider.Context)

  // editor context
  const {
    treeData,
    expandedKeys,
    selectedKey,
    treeDirty,
    livePreview,
    setLivePreview,
    previewInitialized,
    setPreviewInitialized,
  } = useContext(SyntaxProvider.Context)

  // preview context
  const {
    previewLoading,
    setPreviewLoading,
  } = useContext(PreviewProvider.Context)

  // code content
  const [ iframeHtml,         setIframeHtml         ] = useState('')

  // form ref and iframe ref
  const formRef = React.createRef()
  const iframeRef = React.createRef()

  // load content from backend api
  useEffect(() => {

    // load from backend if not livePreview
    if (!livePreview
        && !!navDeployment.namespace
        && !!navDeployment.ui_name
        && !!navDeployment.ui_ver
        && !!navDeployment.ui_deployment
        && !!navSelected
        && !!navSelected.type
        && navSelected.type === 'ui_element'
        && !!navElement
        && !!navElement.ui_element_name
        && !!formRef.current
        && !!iframeRef.current) {
      // setPreviewLoading(true)
      // loading url
      // iframe url
      const iframeUrl =
        globalThis.appx.UI_ROOT
        + '/' + navDeployment.namespace
        + '/' + navDeployment.ui_name
        + '/' + navDeployment.ui_deployment
        + '/_elem' + navElement.ui_element_name + '.html'
      // console.log(iframeUrl)
      iframeRef.current.src=iframeUrl
      setPreviewInitialized(false)
    }

  },
  [
    navDeployment.namespace,
    navDeployment.ui_name,
    navDeployment.ui_ver,
    navDeployment.ui_deployment,
    navElement.ui_element_name,
    navRoute.ui_route_name,
    navSelected.type,
    livePreview,
  ])

  // load content from UI context treeData
  useEffect(() => {

    console.log(navDeployment)
    console.log(navSelected)
    console.log(navElement)

    // load from UI context if livePreview
    if (!previewInitialized
        && !!livePreview
        && !!navDeployment.namespace
        && !!navDeployment.ui_name
        && !!navDeployment.ui_ver
        && !!navDeployment.ui_deployment
        && !!navSelected
        && !!navSelected.type
        && navSelected.type === 'ui_element'
        && !!navElement
        && !!navElement.ui_element_name
        && !!treeData && treeData.length
        && !!formRef.current
        && !!iframeRef.current) {

      // console.log(treeData)
      const tree_context = { topLevel: true }
      const { ref, data: genData } = gen_js(tree_context, treeData)
      // console.log(genData)
      // preview loading
      // setPreviewLoading(true)
      // preview data
      const submitData = {
        type: 'ui_element',
        output: 'html',
        data: {
          namespace: navDeployment.namespace,
          ui_name: navDeployment.ui_name,
          ui_ver: navDeployment.ui_ver,
          ui_spec: navDeployment.ui_spec,
          ui_deployment: navDeployment.ui_deployment,
          ui_deployment_spec: navDeployment.ui_deployment_spec,
          ui_element_name: navElement.ui_element_name,
          ui_element_type: navElement.ui_element_type,
          ui_element_spec: genData
        },
      }
      // console.log(submitData)
      // build form for submission
      formRef.current.innerHTML = '' // clear children
      const input = document.createElement('input')
      input.name = "urlencoded"
      input.value = JSON.stringify(submitData)
      formRef.current.appendChild(input)
      formRef.current.submit() // submit form
      // set initialized flag
      setPreviewInitialized(true)
    }
  },
  [
    navDeployment.namespace,
    navDeployment.ui_name,
    navDeployment.ui_ver,
    navDeployment.ui_deployment,
    navElement.ui_element_name,
    navRoute.ui_route_name,
    navSelected.type,
    livePreview,
    treeData,
    previewInitialized,
  ])

  // load content from UI context treeData
  useEffect(() => {

    // load from UI context if livePreview
    if (!!previewInitialized
        && !!livePreview
        && !!treeData && treeData.length
        && !!formRef.current
        && !!iframeRef.current) {
      const tree_context = { topLevel: true }
      const { ref, data } = gen_js(tree_context, treeData)
      // preview loading
      // setPreviewLoading(true)
      // preview data
      const message = {
        path: globalThis.appx.UI_ROOT
          + '/' + navDeployment?.namespace
          + '/' + navDeployment?.ui_name
          + '/' + navDeployment?.ui_deployment
          + '/',
        data: {
          type: 'ui_element',
          output: 'code',
          data: {
            namespace: navDeployment.namespace,
            ui_name: navDeployment.ui_name,
            ui_ver: navDeployment.ui_ver,
            ui_spec: navDeployment.ui_spec,
            ui_deployment: navDeployment.ui_deployment,
            ui_deployment_spec: navDeployment.ui_deployment_spec,
            ui_element_name: navElement.ui_element_name,
            ui_element_type: navElement.ui_element_type,
            ui_element_spec: data
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
  },
  [
    navDeployment.namespace,
    navDeployment.ui_name,
    navDeployment.ui_ver,
    navDeployment.ui_deployment,
    livePreview,
    treeData,
    previewInitialized,
  ])

  return (
    <Box className={styles.root}>
      <form
        // encType="application/json"
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
        <input name="type" value="ui_element" readOnly/>
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
                  loading={previewLoading}
                  >
                </AntButton>
              </Tooltip>
            </Box>
        }}
        >
        <TabPane tab="Widget" key="iframe" className={styles.root}>
          <Box className={styles.root}>
            <Box className={styles.iframeWrapper}>
              <iframe ref={iframeRef} name="live_preview" className={styles.iframe}>
              </iframe>
            </Box>
          </Box>
        </TabPane>
        <TabPane tab="Code" key="code" className={styles.root}>
          <PreviewSource
            namespace={props.namespace}
            ui_name={props.ui_name}
            ui_deployment={props.ui_deployment}
            ui_element_name={props.ui_element_name}
          />
        </TabPane>
        <TabPane tab="YAML" key="yaml" className={styles.root}>
          <PreviewYaml
            namespace={props.namespace}
            ui_name={props.ui_name}
            ui_deployment={props.ui_deployment}
            ui_element_name={props.ui_element_name}
          />
        </TabPane>
        <TabPane tab="JSON" key="json" className={styles.root}>
          <PreviewJson
            namespace={props.namespace}
            ui_name={props.ui_name}
            ui_deployment={props.ui_deployment}
            ui_element_name={props.ui_element_name}
          />
        </TabPane>
      </Tabs>
    </Box>
  )
}

PreviewTabs.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default PreviewTabs
