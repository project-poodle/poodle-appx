// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const InputCollectionSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M676.288 259.392H143.008c-41.952 0-76.192 28.128-76.192 62.272v561.12c0 34.272 34.272 62.336 76.128 62.336h533.472c41.824 0 76.128-28.128 76.128-62.336V321.664c0-34.208-34.272-62.272-76.128-62.272z m-7.456 602.752H147.68V340.992h521.152v521.152z m212.832-808.256H348.32c-41.952 0-76.128 28.128-76.128 62.336v76.256h83.584V135.552H872.32v520.736h-51.776v83.328h61.088c41.952 0 76.192-28.128 76.192-62.336V116.224c0.128-34.272-34.208-62.4-76.128-62.4z" p-id="6056"></path>
    </svg>
  )
}

const InputCollection = (props) => {
  return (
    <Icon component={InputCollectionSvg} {...props} />
  )
}

// export SVG
InputCollection.SVG = InputCollectionSvg

export { InputCollectionSvg as SVG }

export default InputCollection
