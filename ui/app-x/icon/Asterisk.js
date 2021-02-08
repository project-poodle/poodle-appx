import React from 'react'
import {default as Icon} from '@ant-design/icons'

const AsteriskSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M426.666667 546.133333l-213.333333-59.733333 38.4-119.466667 209.066667 85.333333L448 213.333333l132.266667 0-12.8 238.933333 204.8-81.066667 38.4 123.733333L597.333333 554.666667l140.8 179.2L631.466667 810.666667l-123.733333-196.266667-119.466667 187.733333-106.666667-72.533333L426.666667 546.133333z" p-id="9784"></path>
    </svg>
  )
}

const Asterisk = (props) => {
  return (
    <Icon component={AsteriskSvg} {...props} />
  )
}

// export SVG
Asterisk.SVG = AsteriskSvg

export { AsteriskSvg as SVG }

export default Asterisk
