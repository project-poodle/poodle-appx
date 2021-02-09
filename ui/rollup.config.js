import json from '@rollup/plugin-json'
import html from '@rollup/plugin-html'
// import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeGlobals from 'rollup-plugin-node-globals'
// import nodeBuiltins from 'rollup-plugin-node-builtins'
// import css from 'rollup-plugin-import-css'
import postcss from 'rollup-plugin-postcss'
//import { terser } from "rollup-plugin-terser"
const pkg = require('./package.json')

const plugins = [
  json(),
  commonjs({
    include: 'node_modules/**',  // Default: undefined
    // extensions: [ '.js', '.coffee' ],  // Default: [ '.js' ]
    // ignoreGlobal: false,  // Default: false
    // sourceMap: false,  // Default: true
    // namedExports: { 'react': ['createElement', 'Component' ] },  // Default: undefined
    // ignore: [ 'conditional-runtime-dependency' ]
  }),
  // replace({
  //   include: 'node_modules/**',  // Default: undefined
  //   exclude: 'node_modules/reflect-prop-types/**',  // Default: undefined
  //   'prop-types': 'reflect-prop-types',
  // }),
  nodeResolve({
    // mainFields: ['module', 'main'], // Default: ['module', 'main']
    browser: true,  // Default: false
    // extensions: [ '.mjs', '.js', '.jsx', '.json' ],  // Default: [ '.mjs', '.js', '.json', '.node' ]
    preferBuiltins: false,  // Default: true
    //jail: '/my/jail/path', // Default: '/'
    // only: [ 'some_module', /^@some_scope\/.*$/ ], // Default: null
    modulesOnly: false, // Default: false
    // dedupe: [ 'react', 'react-dom' ], // Default: []
    //  moduleDirectory: 'js_modules'
  }),
  nodeGlobals(),
  // nodeBuiltins(),
  // replace({
  //  //exclude: 'package.json',
  //  include: 'node_modules/**',  // Default: undefined
  //  'reflectPropTypes': 'PropTypes',
  // }),
  //css(),
  postcss({
    plugins: []
  }),
  //terser(),
  html()
]

export default [
  {
    input: 'lib/transpile.js',
    output: [
      {
        dir: pkg.dist,
        format: 'umd',
        name: 'Transpile'
      }
    ],
    plugins: plugins
  },

  {
    input: [
      'lib/main.js',
      'lib/mui.js',
      'lib/antd.js',
      'lib/babel.js',
    ],
    output: [
      {
        dir: pkg.dist,
        format: 'es'
      }
    ],
    plugins: plugins
  },

]
