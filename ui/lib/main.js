// package.json config
// import pkg from '../package.json'
// react core
import * as react from 'react'
import * as reactDom from 'react-dom'
import * as propTypes from 'prop-types'
// redux
import * as reactRedux from 'react-redux'
import * as redux from 'redux'
// routers
import * as hookrouter from 'hookrouter'
import * as reactRouter from 'react-router'
import * as reactRouterDom from 'react-router-dom'
// react utilities
import * as reactHelmet from 'react-helmet'
import * as reactFeather from 'react-feather'
// material ui
//import * as materialUI from '@material-ui/core'
//import * as materialIcons from '@material-ui/icons'
//import * as materialStyles from '@material-ui/styles'
// ant design
//import * as antd from 'antd'
// utilities
import * as clsx from 'clsx'
import * as lodash from 'lodash'
import * as axios from 'axios'
import * as uuid from 'uuid'
// reflective prop types
import reflectPropTypes from './reflectPropTypes'

// export module as library
export default {
  "react": react,
  "react-dom": reactDom,
  "prop-types": propTypes,     // override original propTypes?
  "reflectPropTypes": reflectPropTypes,
  "react-redux": reactRedux,
  "redux": redux,
  "hookrouter": hookrouter,
  "react-router": reactRouter,
  "react-router-dom": reactRouterDom,
  "react-helmet": reactHelmet,
  "react-feather": reactFeather,
  //"@material-ui/core": materialUI,
  //"@material-ui/icons": materialIcons,
  //"@material-ui/styles": materialStyles,
  //"antd": antd,
  "clsx": clsx,
  "lodash": lodash,
  "axios": axios,
  "uuid": uuid,
}
