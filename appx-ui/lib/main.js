import * as react from 'react'
import * as reactDom from 'react-dom'
import * as reactRedux from 'react-redux'
import * as redux from 'redux'
import * as hookrouter from 'hookrouter'
import * as reactRouter from 'react-router'
import * as reactRouterDom from 'react-router-dom'
import * as MaterialUI from '@material-ui/core'
import * as MaterialIcons from '@material-ui/icons'
import * as MaterialStyles from '@material-ui/styles'
import pkg from '../package.json'
import * as axios from 'axios'

module.exports = {
    react: react,
		"react-dom": reactDom,
		"react-redux": reactRedux,
		redux: redux,
		"react-router": reactRouter,
		"react-router-dom": reactRouterDom,
		hookrouter: hookrouter,
    "@material-ui/core": MaterialUI,
		"@material-ui/icons": MaterialIcons,
		"@material-ui/styles": MaterialStyles,
    pkg: pkg,
		axios: axios
}
