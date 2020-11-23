import json from '@rollup/plugin-json'
import html from '@rollup/plugin-html'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
//import { terser } from "rollup-plugin-terser";
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
  replace({
    //exclude: 'package.json',
    include: 'node_modules/**',  // Default: undefined
    'process.env.NODE_ENV': JSON.stringify('development')
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
    input: 'lib/main.js',
    output: [
      {
        dir: pkg.dist,
        format: 'es'
      }
    ],
    plugins: plugins
  },

]
