// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const TextSvg = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M853.333333 170.666667H170.666667a42.666667 42.666667 0 0 0-42.666667 42.666666v128a42.666667 42.666667 0 0 0 85.333333 0V256h256v554.666667H384a42.666667 42.666667 0 0 0 0 85.333333h256a42.666667 42.666667 0 0 0 0-85.333333h-85.333333V256h256v85.333333a42.666667 42.666667 0 0 0 85.333333 0V213.333333a42.666667 42.666667 0 0 0-42.666667-42.666666z" p-id="4041"></path>
    </svg>
  )
}

const Text = (props) => {
  return (
    <Icon component={TextSvg} {...props} />
  )
}

// export SVG
Text.SVG = TextSvg

export { TextSvg as SVG }

export default Text
