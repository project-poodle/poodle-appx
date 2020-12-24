import React, { useState, useContext } from 'react'
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
import {
  Responsive,
  WidthProvider,
  default as GridLayout
} from 'react-grid-layout';

import ReactIcon from 'app-x/icon/React'
import Live from 'app-x/icon/Live'
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import PreviewProvider from 'app-x/builder/ui/PreviewProvider'
import PreviewSource from 'app-x/builder/ui/PreviewSource'
import PreviewYaml from 'app-x/builder/ui/PreviewYaml'
import PreviewJson from 'app-x/builder/ui/PreviewJson'

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

  // editor context
  const {
    treeData,
    expandedKeys,
    selectedKey,
    treeDirty,
    liveUpdate,
    setLiveUpdate,
  } = useContext(EditorProvider.Context)

  // preview context
  const {
    previewLoading,
    setPreviewLoading,
  } = useContext(PreviewProvider.Context)

  // iframe url
  const iframeUrl =
    globalThis.appx.UI_ROOT
    + '/' + props.namespace
    + '/' + props.ui_name
    + '/' + props.ui_deployment
    + '/_elem' + props.ui_element_name + '.html'

  return (
      <Tabs
        defaultActiveKey="widget"
        tabPosition="top"
        size="small"
        className={styles.root}
        tabBarExtraContent={{
          left:
            <Box key="toolTop" display="inline" className={styles.toolTop}>
              <Tooltip
                key="live"
                title={ liveUpdate ? "Live" : "Backend" }
                placement="bottom"
                >
                <AntButton
                  size="small"
                  color="secondary"
                  type={ liveUpdate ? "primary" : "default" }
                  className={styles.fab}
                  key="live"
                  icon={<Live />}
                  shape="circle"
                  onClick={e => { setLiveUpdate(!liveUpdate) }}
                  loading={previewLoading}
                  >
                </AntButton>
              </Tooltip>
            </Box>
        }}
        >
        <TabPane tab="Widget" key="iframe" className={styles.root}>
          <Box className={styles.iframeWrapper}>
            <iframe src={iframeUrl} className={styles.iframe}>
            </iframe>
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
  )
}

PreviewTabs.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default PreviewTabs
