// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const InputTextSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M554.016 810.016q0 18.016 12.992 31.008t31.008 12.992h84v84H576q-20 0-42.016-12.992t-22.016-28.992q0 16-22.016 28.992t-42.016 12.992h-106.016v-84h84q18.016 0 31.008-12.992t12.992-31.008V214.016q0-18.016-12.992-31.008t-31.008-12.992h-84V86.016h106.016q20 0 42.016 12.992t22.016 28.992q0-16 22.016-28.992T576 86.016h106.016v84h-84q-18.016 0-31.008 12.992t-12.992 31.008v596z" p-id="26388"></path>
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

/*
<path d="M341.333333 896v-85.333333h128V213.333333H341.333333V128h341.333334v85.333333h-128v597.333334h128v85.333333H341.333333zM770.133333 300.8L981.333333 512l-211.2 211.2-60.330666-60.330667L860.672 512l-150.869333-150.869333L770.133333 300.8z m-516.266666 0l60.330666 60.330667L163.328 512l150.869333 150.869333L253.866667 723.2 42.666667 512l211.2-211.2z" p-id="80218"></path>
*/
