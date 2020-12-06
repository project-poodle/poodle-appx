import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Box, makeStyles } from '@material-ui/core'
import { WebOutlined, InsertDriveFileOutlined } from '@material-ui/icons'
import { Layout, Tree } from 'antd'
const { DirectoryTree } = Tree
const { Header, Footer, Sider, Content } = Layout
import { Icon, FileOutlined, ContainerOutlined, CodepenOutlined } from '@ant-design/icons'

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import ReactElementTree from 'app-x/builder/ReactElementTree'


const PATH_SEPARATOR = '/'

const UI_Builder = (props) => {

  console.log(props)

  const styles = makeStyles((theme) => ({
    builder: {
      height: "100%",
      width: "100%",
    },
    footer: {
      width: '100%',
      padding: 0,
    },
    footerBox: {
      minHeight: 200,
      // maxHeight: 300
      backgroundColor: theme.palette.background.paper,
    }
  }))()

  return (
    <Layout className={styles.builder}>
      <Content>Content</Content>
      <Footer className={styles.footer}>
        <Box className={styles.footerBox}>
          <ReactElementTree
            namespace={props.namespace}
            ui_name={props.ui_name}
            ui_deployment={props.ui_deployment}
            ui_element_name={props.ui_element_name}
          />
        </Box>
      </Footer>
    </Layout>
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
