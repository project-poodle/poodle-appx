// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const InputTextSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M341.333333 896v-85.333333h128V213.333333H341.333333V128h341.333334v85.333333h-128v597.333334h128v85.333333H341.333333zM770.133333 300.8L981.333333 512l-211.2 211.2-60.330666-60.330667L860.672 512l-150.869333-150.869333L770.133333 300.8z m-516.266666 0l60.330666 60.330667L163.328 512l150.869333 150.869333L253.866667 723.2 42.666667 512l211.2-211.2z" p-id="80218"></path>
    </svg>
  )
}

const InputText = (props) => {
  return (
    <Icon component={InputTextSvg} {...props} />
  )
}

// export SVG
InputText.SVG = InputTextSvg

export { InputTextSvg as SVG }

export default InputText
