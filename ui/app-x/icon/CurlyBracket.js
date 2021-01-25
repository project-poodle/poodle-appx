// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const CurlyBracketSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M266.24 245.76a81.92 81.92 0 0 1 81.92-81.92 40.96 40.96 0 1 0 0-81.92 163.84 163.84 0 0 0-163.84 163.84v122.88a81.92 81.92 0 0 1-81.92 81.92 40.96 40.96 0 1 0 0 81.92 81.92 81.92 0 0 1 81.92 81.92v122.88a163.84 163.84 0 0 0 163.84 163.84 40.96 40.96 0 1 0 0-81.92 81.92 81.92 0 0 1-81.92-81.92v-122.88a163.84 163.84 0 0 0-56.5248-122.88A163.84 163.84 0 0 0 266.24 368.64V245.76z m655.36 204.8a81.92 81.92 0 0 1-81.92-81.92V245.76a163.84 163.84 0 0 0-163.84-163.84 40.96 40.96 0 0 0 0 81.92 81.92 81.92 0 0 1 81.92 81.92v122.88a163.84 163.84 0 0 0 56.5248 122.88A163.84 163.84 0 0 0 757.76 614.4v122.88a81.92 81.92 0 0 1-81.92 81.92 40.96 40.96 0 0 0 0 81.92 163.84 163.84 0 0 0 163.84-163.84v-122.88a81.92 81.92 0 0 1 81.92-81.92 40.96 40.96 0 1 0 0-81.92z" p-id="1262"></path>
    </svg>
  )
}

const CurlyBracket = (props) => {
  return (
    <Icon component={CurlyBracketSvg} {...props} />
  )
}

// export SVG
CurlyBracket.SVG = CurlyBracketSvg

export { CurlyBracketSvg as SVG }

export default CurlyBracket
