// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const BracketSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M384 128v85.333333H256v597.333334h128v85.333333H170.666667V128h213.333333z m256 0h213.333333v768h-213.333333v-85.333333h128V213.333333h-128V128z" p-id="9377"></path>
    </svg>
  )
}

const Bracket = (props) => {
  return (
    <Icon component={BracketSvg} {...props} />
  )
}

// export SVG
Bracket.SVG = BracketSvg

export { BracketSvg as SVG }

export default Bracket
