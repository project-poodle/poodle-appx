// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const RouteSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M170.666667 298.666667a128 128 0 1 1 0-256 128 128 0 0 1 0 256z m0-85.333334a42.666667 42.666667 0 1 0 0-85.333333 42.666667 42.666667 0 0 0 0 85.333333z m682.666666 768a128 128 0 1 1 0-256 128 128 0 0 1 0 256z m0-85.333333a42.666667 42.666667 0 1 0 0-85.333333 42.666667 42.666667 0 0 0 0 85.333333zM426.666667 213.333333a42.666667 42.666667 0 1 1 0-85.333333h341.333333a213.333333 213.333333 0 0 1 0 426.666667H256a128 128 0 0 0 0 256h341.333333a42.666667 42.666667 0 0 1 0 85.333333H256a213.333333 213.333333 0 0 1 0-426.666667h512a128 128 0 0 0 0-256h-341.333333z" p-id="6731"></path>
    </svg>
  )
}

const Route = (props) => {
  return (
    <Icon component={RouteSvg} {...props} />
  )
}

// export SVG
Route.SVG = RouteSvg

export { RouteSvg as SVG }

export default Route
