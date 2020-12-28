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
import SyntaxProvider from 'app-x/builder/ui/SyntaxProvider'
import SyntaxTree from 'app-x/builder/ui/SyntaxTree'
import PropEditor from 'app-x/builder/ui/PropEditor'
import PreviewProvider from 'app-x/builder/ui/PreviewProvider'
import PreviewTabs from 'app-x/builder/ui/PreviewTabs'


const UI_Builder = (props) => {

  // styles
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

  const [ rowHeight,  setRowHeight  ] = useState(80)
  const [ width,      setWidth      ] = useState(960)
  const [ layouts,    setLayouts    ] = useState({
    md: [
      {
        i: 'iframe',
        x: 0,
        y: 0,
        w: 6,
        h: 12,
      },
      {
        i: 'navTree',
        x: 6,
        y: 0,
        w: 6,
        h: 7,
      },
      {
        i: 'propEditor',
        x: 7,
        y: 6,
        w: 6,
        h: 5,
      },
    ],
    sm: [
      {
        i: 'iframe',
        x: 0,
        y: 0,
        w: 6,
        h: 6,
      },
      {
        i: 'navTree',
        x: 0,
        y: 6,
        w: 6,
        h: 3,
      },
      {
        i: 'propEditor',
        x: 0,
        y: 9,
        w: 6,
        h: 3,
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
        setRowHeight((node.offsetHeight - 2) / 12)
        setWidth(node.offsetWidth)
      }
      // resize now
      resizeGridLayout()
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
    // console.log(allLayouts)
    if (!!allLayouts) {
      globalThis.localStorage.setItem(
        `/app-x/ui/builder/grid-layout`,
        JSON.stringify(allLayouts)
      )
    }
  }

  // load layout when loading first time
  useEffect(() => {
    const stored_layouts = globalThis.localStorage.getItem(`/app-x/ui/builder/grid-layout`)
    if (!!stored_layouts) {
      // console.log(JSON.parse(stored_layouts))
      setLayouts(JSON.parse(stored_layouts))
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
          cols={{md: 12, sm: 6}}
          onLayoutChange={onLayoutChange}
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
                  ui_element_name={props.ui_element_name}
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
      </Box>
    </SyntaxProvider>
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
