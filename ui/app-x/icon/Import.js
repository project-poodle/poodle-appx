// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const ImportSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M512.32 245.92v266.48h266.48V429.12H653.76l287.52-287.52-58.88-58.8L595.6 369.6V245.92H512.32z" p-id="76424"></path>
      <path d="M860.72 512v348.4H163.52V163.36h348.88V80H163.28A83.44 83.44 0 0 0 80 163.28v697.44A83.44 83.44 0 0 0 163.28 944h697.44A83.36 83.36 0 0 0 944 860.72V512z" p-id="76425"></path>
    </svg>
  )
}

const Import = (props) => {
  return (
    <Icon component={ImportSvg} {...props} />
  )
}

// export SVG
Import.SVG = ImportSvg

export { ImportSvg as SVG }

export default Import
