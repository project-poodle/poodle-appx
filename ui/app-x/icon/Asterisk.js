// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const AsteriskSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M469.333333 256v182.101333L311.637333 347.050667l-42.666666 73.898666L426.666667 512l-157.653334 91.050667 42.666667 73.898666L469.333333 585.898667V768h85.333334v-182.101333l157.653333 91.050666 42.666667-73.898666L597.333333 512l157.696-91.050667-42.666666-73.898666L554.666667 438.101333V256z" p-id="4451"></path>
    </svg>
  )
}

const Asterisk = (props) => {
  return (
    <Icon component={AsteriskSvg} {...props} />
  )
}

export default Asterisk
