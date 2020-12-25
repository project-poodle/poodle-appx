// babel
import * as babelStandalone from '@babel/standalone'
// import * as babelTraverse from '@babel/traverse'
import * as babelTypes from '@babel/types'
import * as babelParser from '@babel/parser'
import * as babelGenerator from '@babel/generator'

// export module as library
export default {
  "@babel/standalone": babelStandalone,
  // "@babel/traverse": babelTraverse,
  "@babel/types": babelTypes,
  "@babel/parser": babelParser,
  "@babel/generator": babelGenerator,
}
