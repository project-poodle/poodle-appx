import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
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
import { Responsive as ResponsiveGridLayout, default as GridLayout } from 'react-grid-layout';

import ReactIcon from 'app-x/icon/React'
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import SyntaxTree from 'app-x/builder/ui/syntax/SyntaxTree'
import PropEditor from 'app-x/builder/ui/syntax/PropEditor'
import PreviewProvider from 'app-x/builder/ui/syntax/PreviewProvider'
import PreviewTabs from 'app-x/builder/ui/syntax/PreviewTabs'


const UI_Builder = (props) => {

  // styles
  const styles = makeStyles((theme) => ({
    root: {
      height: "100%",
      width: "100%",
      padding: theme.spacing(0),
      margin: theme.spacing(0),
      backgroundColor: theme.palette.background.paper,
    },
    box: {
      // minHeight: 350,
      // height: 350,
      // height: '100%',
      // minWidth: 300,
      padding: theme.spacing(2, 0, 2),
      backgroundColor: theme.palette.background.default,
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

  const [ rowHeight,  setRowHeight  ] = useState(80)
  const [ width,      setWidth      ] = useState(960)
  const [ layouts,    setLayouts    ] = useState({
    md: [
      {
        i: 'iframe',
        x: 0,
        y: 0,
        w: 12,
        h: 24,
      },
      {
        i: 'navTree',
        x: 17,
        y: 0,
        w: 7,
        h: 24,
      },
      {
        i: 'propEditor',
        x: 12,
        y: 0,
        w: 5,
        h: 24,
      },
    ],
    sm: [
      {
        i: 'iframe',
        x: 0,
        y: 0,
        w: 12,
        h: 12,
      },
      {
        i: 'navTree',
        x: 0,
        y: 12,
        w: 12,
        h: 6,
      },
      {
        i: 'propEditor',
        x: 0,
        y: 18,
        w: 12,
        h: 6,
      },
    ],
  })

  const gridRef = React.createRef()

  // resize listener
  useEffect(() => {
    if (!!gridRef.current) {
      // closure on ref
      const ref = gridRef.current
      function resizeGridLayout() {
        const node = ReactDOM.findDOMNode(ref)
        // console.log(node, node.offsetWidth, node.offsetHeight)
        setRowHeight((node.offsetHeight - 2) / 24)
        setWidth(node.offsetWidth - 2)
      }
      // resize now
      setTimeout(() => {
        resizeGridLayout()
      }, 500)
      // event listener
      window.addEventListener("resize", event => {
        // console.log(event)
        // console.log(ref)
        resizeGridLayout()
      })
    }
  }, [gridRef.current])

  // listen to layout change event
  const onLayoutChange = (currLayout, allLayouts) => {
    // console.log(currLayout)
    if (!!allLayouts && !!allLayouts.sm && !!allLayouts.md) {
      // console.log(`Layout saved`, allLayouts)
      globalThis.localStorage.setItem(
        `/app-x/ui/builder/grid-layout`,
        JSON.stringify(allLayouts)
      )
    }
  }

  // load layout when loading first time
  useEffect(() => {
    try {
      const stored_layouts = JSON.parse(globalThis.localStorage.getItem(`/app-x/ui/builder/grid-layout`))
      if (!!stored_layouts && !!stored_layouts.md && !!stored_layouts.sm) {
        // console.log(`Layout loaded`, stored_layouts)
        setLayouts(stored_layouts)
      } else {
        // console.log(`Layout not loaded`, stored_layouts)
      }
    } catch (err) {
      console.log(`Layout not loaded`, String(err))
    }
  }, [])

  return (
    <SyntaxProvider>
      <Box ref={gridRef} className={styles.root}>
        <ResponsiveGridLayout
          className={styles.root}
          layouts={layouts}
          margin={[0, 0]}
          rowHeight={rowHeight}
          width={width}
          breakpoints={{md: 960, sm: 768}}
          cols={{md: 24, sm: 12}}
          onLayoutChange={onLayoutChange}
          onResize={onLayoutChange}
        >
          <Box key="iframe" className={styles.box}>
            <Box
              className={styles.tabContent}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              onMouseUp={e => e.stopPropagation()}
              onDrag={e => e.stopPropagation()}
              >
              <PreviewProvider>
                <PreviewTabs
                  namespace={props.namespace}
                  ui_name={props.ui_name}
                  ui_deployment={props.ui_deployment}
                  >
                </PreviewTabs>
              </PreviewProvider>
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
                >
              </PropEditor>
            </Box>
          </Box>
        </ResponsiveGridLayout>
      </Box>
    </SyntaxProvider>
  )
}

UI_Builder.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
}

export default UI_Builder
