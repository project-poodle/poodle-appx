// package.json config
// import pkg from '../package.json'
// react core
import * as react from 'react'
import * as reactDom from 'react-dom'
import * as reactDomServer from 'react-dom/server'
import * as propTypes from 'prop-types'
import * as reflectivePropTypes from 'reflect-prop-types'
// redux
import * as reactRedux from 'react-redux'
import * as redux from 'redux'
// routers
// import * as hookrouter from 'hookrouter'
import * as reactRouter from 'react-router'
import * as reactRouterDom from 'react-router-dom'
// form
import * as reactHookForm from 'react-hook-form'
// table
import * as reactTable from 'react-table'
// layout
import * as reactGridLayout from 'react-grid-layout'
import react_grid_layout_css from 'react-grid-layout/css/styles.css'
import react_resizable_css from 'react-resizable/css/styles.css'
// react utilities
import * as reactHelmet from 'react-helmet'
import * as reactCsv from 'react-csv'
// editor
// import * as monacoEditor from 'monaco-editor'
import * as monacoEditorReact from '@monaco-editor/react'
// utilities
import * as yaml from 'yaml'
import * as jsYaml from 'js-yaml'
import * as lodash from 'lodash'
import * as axios from 'axios'
import * as uuid from 'uuid'
import * as flatted from 'flatted'
import * as queryString from 'query-string'
import * as timeAgo from 'javascript-time-ago'
import * as timeAgoLocaleEn from 'javascript-time-ago/locale/en'
import * as knownCssProperties from 'known-css-properties'
import * as cssPropsValues from 'css-properties-values'
// reflective prop types
//import reflectPropTypes from './reflectPropTypes'

// export module as library
export default {
  // react core
  "react": react,
  "react-dom": reactDom,
  "react-dom/server": reactDomServer,
  // propTypes
  "prop-types": propTypes,     // override original propTypes?
  // "original-prop-types": reflectivePropTypes._original,     // override original propTypes?
  "reflect-prop-types": reflectivePropTypes,
  // redux
  "react-redux": reactRedux,
  "redux": redux,
  // routers
  // "hookrouter": hookrouter,
  "react-router": reactRouter,
  "react-router-dom": reactRouterDom,
  // form
  "react-hook-form": reactHookForm,
  // table
  "react-table": reactTable,
  // grid layout
  "react-grid-layout": reactGridLayout,
  // "react_grid_layout_css": react_grid_layout_css,
  // "react_resizable_css": react_resizable_css,
  // react utilities
  "react-helmet": reactHelmet,
  "react-csv": reactCsv,
  // "react-feather": reactFeather,
  // "monaco-editor": monacoEditor,
  "@monaco-editor/react": monacoEditorReact,
  // utilities
  "yaml": yaml,
  "js-yaml": jsYaml,
  "lodash": lodash,
  "axios": axios,
  "uuid": uuid,
  "flatted": flatted,
  "query-string": queryString,
  "javascript-time-ago": timeAgo,
  "javascript-time-ago/locale/en": timeAgoLocaleEn,
  "known-css-properties": knownCssProperties,
  "css-properties-values": cssPropsValues,
}
