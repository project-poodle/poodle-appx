import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import json from '@rollup/plugin-json';
import pkg from './package.json';

export default [
  /*
  // browser-friendly UMD build
  {
    input: 'lib/main.js',
    output: {
      name: 'module',
      file: pkg.umd,
      format: 'umd'
    },
    plugins: [
      commonjs(), // so Rollup can convert `ms` to an ES module
      nodeResolve(), // so Rollup can find `ms`
      terser(),
      json()
    ]
  },
  */

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'lib/main.js',
    //input: [
    //  'lib/util.js',
    //  'lib/react.js',
    //  'lib/material-ui.js'
    //],
    output: [
      {
        file: pkg.cjs,
        format: 'cjs'
      },
      {
        file: pkg.esm,
        format: 'es'
      }
    ],
    plugins: [
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
      terser(),
      json()
    ]
  }
];
