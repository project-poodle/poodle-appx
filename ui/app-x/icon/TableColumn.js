// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const TableColumnSvg = () => {
  return (
      <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
        <path d="M896 128v768h-85.333333V128h85.333333zM213.333333 128v768H128V128h85.333333z m426.666667 0a42.666667 42.666667 0 0 1 42.666667 42.666667v682.666666a42.666667 42.666667 0 0 1-42.666667 42.666667H384a42.666667 42.666667 0 0 1-42.666667-42.666667V170.666667a42.666667 42.666667 0 0 1 42.666667-42.666667z m-42.666667 85.333333h-170.666666v597.333334h170.666666V213.333333z" p-id="7975"></path>
    </svg>
  )
}

const TableColumn = (props) => {
  return (
    <Icon component={TableColumnSvg} {...props} />
  )
}

// export SVG
TableColumn.SVG = TableColumnSvg

export { TableColumnSvg as SVG }

export default TableColumn

/*
<path d="M64 0v1024H0V0zM448 960H192V64h256v896z m-192-64h128V128H256v768zM832 960H576V64h256v896z m-192-64h128V128h-128v768zM1024 0v1024h-64V0z" p-id="37734"></path>
<path d="M832 128H576v768h256V128z m-64 704h-128V192h128v640zM448 128H192v768h256V128zM384 832H256V192h128v640z m576-832h64v1024h-64V0zM0 0h64v1024H0V0z" p-id="46547"></path>
<path d="M768 128h64v768H768V128z m-192 64v640h-128v-640h128z m0-64h-128A64 64 0 0 0 384 192v640a64 64 0 0 0 64 64h128a64 64 0 0 0 64-64v-640A64 64 0 0 0 576 128z m-384 0H256v768H192V128z" p-id="2382"></path>
*/
