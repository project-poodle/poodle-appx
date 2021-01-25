// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const ResetSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M985.6 614.4c-6.4-6.4-12.8-12.8-19.2-12.8h-12.8-294.4c-19.2 0-32 12.8-32 32s12.8 32 32 32h256c-64 166.4-217.6 281.6-403.2 281.6-217.6 0-396.8-160-428.8-377.6 0-19.2-19.2-32-38.4-25.6-12.8-6.4-25.6 12.8-25.6 32 32 243.2 243.2 428.8 492.8 428.8 179.2 0 345.6-102.4 428.8-256v192c0 19.2 12.8 32 32 32s32-12.8 32-32v-288c0-12.8-6.4-32-19.2-38.4zM38.4 409.6c6.4 6.4 12.8 12.8 19.2 12.8h307.2c19.2 0 32-12.8 32-32s-12.8-25.6-32-25.6h-256c64-166.4 217.6-281.6 403.2-281.6 217.6 0 396.8 160 428.8 377.6 0 19.2 12.8 25.6 32 25.6h6.4c19.2 0 32-19.2 25.6-38.4C972.8 204.8 761.6 19.2 512 19.2c-179.2 0-345.6 102.4-428.8 256v-192C83.2 64 70.4 51.2 51.2 51.2s-32 12.8-32 25.6v288c0 19.2 6.4 38.4 19.2 44.8z" p-id="2567"></path>
    </svg>
  )
}

const Reset = (props) => {
  return (
    <Icon component={ResetSvg} {...props} />
  )
}

// export SVG
Reset.SVG = ResetSvg

export { ResetSvg as SVG }

export default Reset
