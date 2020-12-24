import React, { useState } from 'react'
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
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import SyntaxTree from 'app-x/builder/ui/SyntaxTree'
import SourceViewer from 'app-x/builder/ui/SourceViewer'
import YamlViewer from 'app-x/builder/ui/YamlViewer'
import JsonViewer from 'app-x/builder/ui/JsonViewer'
import PropEditor from 'app-x/builder/ui/PropEditor'

const WidgetViewer = (props) => {

  const styles = makeStyles((theme) => ({
    root: {
      height: "100%",
      width: "100%",
      padding: theme.spacing(0),
      margin: theme.spacing(0),
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
        tabBarStyle={{marginLeft: 16}}
        >
        <TabPane tab="Widget" key="iframe" className={styles.root}>
          <Box className={styles.iframeWrapper}>
            <iframe src={iframeUrl} className={styles.iframe}>
            </iframe>
          </Box>
        </TabPane>
        <TabPane tab="Code" key="code" className={styles.root}>
          <SourceViewer
            namespace={props.namespace}
            ui_name={props.ui_name}
            ui_deployment={props.ui_deployment}
            ui_element_name={props.ui_element_name}
          />
        </TabPane>
        <TabPane tab="YAML" key="yaml" className={styles.root}>
          <YamlViewer
            namespace={props.namespace}
            ui_name={props.ui_name}
            ui_deployment={props.ui_deployment}
            ui_element_name={props.ui_element_name}
          />
        </TabPane>
        <TabPane tab="JSON" key="json" className={styles.root}>
          <JsonViewer
            namespace={props.namespace}
            ui_name={props.ui_name}
            ui_deployment={props.ui_deployment}
            ui_element_name={props.ui_element_name}
          />
        </TabPane>
      </Tabs>
  )
}

WidgetViewer.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default WidgetViewer
