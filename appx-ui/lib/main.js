import pkg from '../package.json'
import * as react from 'react'
import * as reactDom from 'react-dom'
import * as reactRedux from 'react-redux'
import * as propTypes from 'prop-types'
import * as redux from 'redux'
import * as hookrouter from 'hookrouter'
import * as reactRouter from 'react-router'
import * as reactRouterDom from 'react-router-dom'
import * as reactHelmet from 'react-helmet'
import * as reactFeather from 'react-feather'
import * as materialUI from '@material-ui/core'
import * as materialIcons from '@material-ui/icons'
import * as materialStyles from '@material-ui/styles'

import * as clsx from 'clsx'
import * as lodash from 'lodash'
import * as axios from 'axios'

export default {
  "pkg": pkg,
  "react": react,
  "react-dom": reactDom,
  "prop-types": propTypes,
  "react-redux": reactRedux,
  "redux": redux,
  "hookrouter": hookrouter,
  "react-router": reactRouter,
  "react-router-dom": reactRouterDom,
  "react-helmet": reactHelmet,
  "react-feather": reactFeather,
  "@material-ui/core": materialUI,
  "@material-ui/icons": materialIcons,
  "@material-ui/styles": materialStyles,
  "clsx": clsx,
  "lodash": lodash,
  "axios": axios
}
