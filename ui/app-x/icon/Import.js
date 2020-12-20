// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const ImportSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M797.12 901.12H249.6a110.08 110.08 0 0 1-110.08-110.08V243.52A110.4 110.4 0 0 1 249.6 133.12h273.92a32 32 0 0 1 0 64H249.6a46.08 46.08 0 0 0-46.08 46.4v547.52a46.08 46.08 0 0 0 46.08 46.08h547.52a46.4 46.4 0 0 0 46.4-46.08v-273.92a32 32 0 1 1 64 0v273.92a110.4 110.4 0 0 1-110.4 110.08z" p-id="40739"></path><path d="M712 546.24h-166.08a51.84 51.84 0 0 1-51.84-51.52V314.56a32 32 0 0 1 64 0v167.68h153.92a32 32 0 0 1 0 64z" p-id="40740"></path><path d="M537.28 535.36a32 32 0 0 1-22.72-9.6 32 32 0 0 1 0-45.12L852.8 142.4a32 32 0 0 1 45.12 0 32 32 0 0 1 0 45.44L560 525.76a32 32 0 0 1-22.72 9.6z" p-id="40741"></path>
    </svg>
  )
}

const Import = (props) => {
  return (
    <Icon component={ImportSvg} {...props} />
  )
}

export default Import
