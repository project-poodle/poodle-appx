// package.json config
// import pkg from '../package.json'
// react core
import * as react from 'react'
import * as reactDom from 'react-dom'
import * as reactDomServer from 'react-dom/server'
import * as propTypes from 'prop-types'
// redux
import * as reactRedux from 'react-redux'
import * as redux from 'redux'
// routers
import * as hookrouter from 'hookrouter'
import * as reactRouter from 'react-router'
import * as reactRouterDom from 'react-router-dom'
// form
import * as reactHookForm from 'react-hook-form'
// layout
import * as reactGridLayout from 'react-grid-layout'
import react_grid_layout_css from 'react-grid-layout/css/styles.css'
import react_resizable_css from 'react-resizable/css/styles.css'
// react utilities
import * as reactHelmet from 'react-helmet'
import * as reactFeather from 'react-feather'
import * as reactCursor from 'react-cursor'
// editor
import * as monacoEditor from '@monaco-editor/react'
//import * as aceEditor from 'react-ace'
//import * as aceBuilds from 'ace-builds'
// material ui
//import * as materialUI from '@material-ui/core'
//import * as materialIcons from '@material-ui/icons'
//import * as materialStyles from '@material-ui/styles'
// ant design
//import * as antd from 'antd'
// utilities
import * as clsx from 'clsx'
import * as yaml from 'yaml'
import * as buffer from 'buffer'
import * as lodash from 'lodash'
import * as axios from 'axios'
import * as uuid from 'uuid'
// reflective prop types
import reflectPropTypes from './reflectPropTypes'

// export module as library
export default {
  // react core
  "react": react,
  "react-dom": reactDom,
  "react-dom/server": reactDomServer,
  "prop-types": propTypes,     // override original propTypes?
  "reflectPropTypes": reflectPropTypes,
  // redux
  "react-redux": reactRedux,
  "redux": redux,
  // routers
  "hookrouter": hookrouter,
  "react-router": reactRouter,
  "react-router-dom": reactRouterDom,
  // form
  "react-hook-form": reactHookForm,
  // grid layout
  "react-grid-layout": reactGridLayout,
  "react_grid_layout_css": react_grid_layout_css,
  "react_resizable_css": react_resizable_css,
  // react utilities
  "react-helmet": reactHelmet,
  "react-feather": reactFeather,
  "react-cursor": reactCursor,
  // editors
  // "nomaco-editor": monacoEditor,
  "@monaco-editor/react": monacoEditor,
  //"react-ace": aceEditor,
  //"ace-builds": aceBuilds,
  //"@material-ui/core": materialUI,
  //"@material-ui/icons": materialIcons,
  //"@material-ui/styles": materialStyles,
  //"antd": antd,
  "clsx": clsx,
  "yaml": yaml,
  "buffer": buffer,
  "lodash": lodash,
  "axios": axios,
  "uuid": uuid,
}
