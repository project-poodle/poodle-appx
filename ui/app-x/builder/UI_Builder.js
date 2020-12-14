import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Container,
  Grid,
  // Tabs,
  Tab,
  // TabPanel,
  Typography,
  makeStyles,
} from '@material-ui/core'
import {
  TabContext,
  TabList,
  TabPanel,
} from '@material-ui/lab'
import { WebOutlined, InsertDriveFileOutlined } from '@material-ui/icons'
import { Layout, Tree } from 'antd'
const { DirectoryTree } = Tree
const { Header, Footer, Sider, Content } = Layout
import { Icon, FileOutlined, ContainerOutlined, CodepenOutlined } from '@ant-design/icons'
// import { default as GridLayout } from 'react-grid-layout'
import { Responsive, WidthProvider, default as GridLayout } from 'react-grid-layout';

import ReactIcon from 'app-x/icon/React'
import SyntaxTree from 'app-x/builder/SyntaxTree'
import SourceViewer from 'app-x/builder/SourceViewer'
import YamlViewer from 'app-x/builder/YamlViewer'
import JsonViewer from 'app-x/builder/JsonViewer'
import PropEditor from 'app-x/builder/PropEditor'

/*
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};
*/

const UI_Builder = (props) => {

  // console.log(props)

  const styles = makeStyles((theme) => ({
    root: {
      height: "100%",
      width: "100%",
      padding: theme.spacing(0),
      margin: theme.spacing(0),
    },
    box: {
      // minHeight: 350,
      // height: 350,
      // height: '100%',
      // minWidth: 300,
      padding: theme.spacing(2, 2),
      backgroundColor: theme.palette.background.dark,
      // border
      border: 1,
      borderStyle: 'dotted',
      borderColor: theme.palette.divider,
    },
    content: {
      height: '100%',
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      overflow: 'scroll',
      // border
      border: 0,
      borderStyle: 'dotted',
      borderColor: theme.palette.divider,
    },
    tabPanel: {
      width: '100%',
      height: 'calc(100% - 64px)',
      margin: theme.spacing(2, 0)
    },
    iframeContent: {
      height: '100%',
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      // overflow: 'scroll',
      // border
      border: 0,
      borderStyle: 'dotted',
      borderColor: theme.palette.divider,
    },
    iframe: {
      height: '100%',
      width: '100%',
      padding: 0,
      margin: 0,
      border: 2,
      // borderColor: theme.palette.divider,
      borderStyle: 'dashed',
    }
  }))()

  const iframeUrl =
    globalThis.appx.UI_ROOT
    + '/' + props.namespace
    + '/' + props.ui_name
    + '/' + props.ui_deployment
    + '/_elem' + props.ui_element_name + '.html'

  const layouts = {
    lg: [
      {
        i: 'iframe',
        x: 0,
        y: 0,
        w: 8,
        h: 9,
      },
      {
        i: 'navTree',
        x: 8,
        y: 0,
        w: 4,
        h: 7,
      },
      {
        i: 'propEditor',
        x: 8,
        y: 7,
        w: 4,
        h: 2,
      },
    ],
    md: [
      {
        i: 'iframe',
        x: 0,
        y: 0,
        w: 7,
        h: 9,
      },
      {
        i: 'navTree',
        x: 7,
        y: 0,
        w: 5,
        h: 7,
      },
      {
        i: 'propEditor',
        x: 7,
        y: 7,
        w: 5,
        h: 2,
      },
    ],
    sm: [
      {
        i: 'iframe',
        x: 0,
        y: 0,
        w: 6,
        h: 5,
      },
      {
        i: 'navTree',
        x: 0,
        y: 4,
        w: 6,
        h: 2,
      },
      {
        i: 'propEditor',
        x: 0,
        y: 8,
        w: 6,
        h: 1,
      },
    ],
    xs: [
      {
        i: 'iframe',
        x: 0,
        y: 0,
        w: 6,
        h: 5,
      },
      {
        i: 'navTree',
        x: 0,
        y: 4,
        w: 6,
        h: 2,
      },
      {
        i: 'propEditor',
        x: 0,
        y: 8,
        w: 6,
        h: 1,
      },
    ],
  }
  // console.log(GridLayout)
  const ResponsiveGridLayout = WidthProvider(Responsive);
  // console.log(ResponsiveGridLayout)

  const [ tabValue, setTabValue ] = useState('iframe')

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  }

  return (
    <ResponsiveGridLayout
      className={styles.root}
      layouts={layouts}
      margin={[0, 0]}
      rowHeight={100}
      breakpoints={{lg: 1200, md: 960, sm: 768, xs: 480}}
      cols={{lg: 12, md: 12, sm: 6, xs: 6}}
    >
      <Box key="iframe" className={styles.box}>
        <Box
          className={styles.iframeContent}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
          onDrag={e => e.stopPropagation()}
          >
          <TabContext value={tabValue}>
            <Box>
              <TabList
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="on"
                >
                <Tab label="Widget" value="iframe"/>
                <Tab label="Code" value="code"/ >
                <Tab label="YAML" value="yaml"/ >
                <Tab label="JSON" value="json"/ >
              </TabList>
            </Box>
            <Box className={styles.tabPanel}>
              <TabPanel value="iframe" className={styles.root}>
                <iframe src={iframeUrl} className={styles.iframe}>
                </iframe>
              </TabPanel>
              <TabPanel value="code" className={styles.root}>
                <SourceViewer
                  namespace={props.namespace}
                  ui_name={props.ui_name}
                  ui_deployment={props.ui_deployment}
                  ui_element_name={props.ui_element_name}
                />
              </TabPanel>
              <TabPanel value="yaml" className={styles.root}>
                <YamlViewer
                  namespace={props.namespace}
                  ui_name={props.ui_name}
                  ui_deployment={props.ui_deployment}
                  ui_element_name={props.ui_element_name}
                />
              </TabPanel>
              <TabPanel value="json" className={styles.root}>
                <JsonViewer
                  namespace={props.namespace}
                  ui_name={props.ui_name}
                  ui_deployment={props.ui_deployment}
                  ui_element_name={props.ui_element_name}
                />
              </TabPanel>
            </Box>
          </TabContext>
        </Box>
      </Box>
      <Box key="navTree" className={styles.box}>
        <Box
          className={styles.content}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
          onDrag={e => e.stopPropagation()}
          >
          <SyntaxTree
            namespace={props.namespace}
            ui_name={props.ui_name}
            ui_deployment={props.ui_deployment}
            ui_element_name={props.ui_element_name}
          />
        </Box>
      </Box>
      <Box key="propEditor" className={styles.box}>
        <Box
          className={styles.content}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
          onDrag={e => e.stopPropagation()}
          >
          propEditor
        </Box>
      </Box>
    </ResponsiveGridLayout>
  )
}

UI_Builder.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_builder_type: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
  ui_route_name: PropTypes.string.isRequired,
}

export default UI_Builder
