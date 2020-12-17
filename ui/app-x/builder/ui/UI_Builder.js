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
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import SyntaxTree from 'app-x/builder/ui/SyntaxTree'
import WidgetViewer from 'app-x/builder/ui/WidgetViewer'
import PropEditor from 'app-x/builder/ui/PropEditor'


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
      padding: theme.spacing(2, 0, 2),
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
    tabContent: {
      height: '100%',
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      // overflow: 'scroll',
      // border
      border: 0,
      borderStyle: 'dotted',
      borderColor: theme.palette.divider,
    },
  }))()

  const layouts = {
    md: [
      {
        i: 'iframe',
        x: 0,
        y: 0,
        w: 6,
        h: 9,
      },
      {
        i: 'navTree',
        x: 6,
        y: 0,
        w: 6,
        h: 6,
      },
      {
        i: 'propEditor',
        x: 6,
        y: 7,
        w: 6,
        h: 3,
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
        h: 2,
      },
    ],
  }
  // console.log(GridLayout)
  const ResponsiveGridLayout = WidthProvider(Responsive);
  // console.log(ResponsiveGridLayout)

  return (
    <EditorProvider>
      <ResponsiveGridLayout
        className={styles.root}
        layouts={layouts}
        margin={[0, 0]}
        rowHeight={100}
        breakpoints={{md: 960, sm: 768}}
        cols={{lg: 12, md: 12, sm: 6, xs: 6}}
      >
        <Box key="iframe" className={styles.box}>
          <Box
            className={styles.tabContent}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
            onDrag={e => e.stopPropagation()}
            >
            <WidgetViewer
              namespace={props.namespace}
              ui_name={props.ui_name}
              ui_deployment={props.ui_deployment}
              ui_element_name={props.ui_element_name}
              >
            </WidgetViewer>
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
            <PropEditor
              namespace={props.namespace}
              ui_name={props.ui_name}
              ui_deployment={props.ui_deployment}
              ui_element_name={props.ui_element_name}
              >
            </PropEditor>
          </Box>
        </Box>
      </ResponsiveGridLayout>
    </EditorProvider>
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
