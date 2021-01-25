// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const PointerSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M288 83.008v817.984l52.992-44 128.992-108 65.024 129.024 13.984 28.992 29.024-15.008 98.976-51.008 28-13.984-13.984-29.024-59.008-116 162.016-20 64.96-8L813.024 608 343.04 136.992z m64 155.008l370.016 368.96-144 17.024-45.024 6.016 21.024 40.96 65.984 128-42.016 22.016-68.992-137.984-19.008-36-30.976 25.984L352 763.008z" p-id="61480"></path>
    </svg>
  )
}

const Pointer = (props) => {
  return (
    <Icon component={PointerSvg} {...props} />
  )
}

// export SVG
Pointer.SVG = PointerSvg

export { PointerSvg as SVG }

export default Pointer
