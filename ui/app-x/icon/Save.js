// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const SaveSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M808.998 65.335H213.909c-81.534 0-147.879 67.03-147.879 149.437V806.81c0 82.408 66.345 149.387 147.879 149.387h595.072c81.561 0 147.873-66.98 147.873-149.387V214.784c0-82.419-66.34-149.427-147.856-149.449z m-520.259 55.694h445.417v334.063H288.739V121.029zM899.2 806.81c0 50.249-40.461 91.155-90.197 91.155H213.915c-49.736 0-92.207-58.556-92.207-108.81V232.383c0-50.276 42.471-108.71 92.207-108.71v-0.028l19.147-2.617v389.74l563.575 1.42-6.804-1.42v-389.74l19.181 2.611c49.742 0 90.197 40.856 90.197 91.132V806.81h-0.011zM622.802 232.383h55.677v167.031h-55.677V232.383z" p-id="5405"></path>
    </svg>
  )
}

const Save = (props) => {
  return (
    <Icon component={SaveSvg} {...props} />
  )
}

// export SVG
Save.SVG = SaveSvg

export { SaveSvg as SVG }

export default Save
