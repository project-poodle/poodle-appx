// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const TableSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M855.552 0H168.448A168.96 168.96 0 0 0 0 168.448v687.104A168.96 168.96 0 0 0 168.448 1024h687.104A168.96 168.96 0 0 0 1024 855.552V168.448A168.96 168.96 0 0 0 855.552 0zM318.464 970.752H176.128a123.221333 123.221333 0 0 1-122.88-122.88v-70.656h265.216v193.536z m0-248.32H53.248V539.136h265.216v183.296z m0-237.568H53.248V301.568h265.216v183.296z m54.272 485.888v-193.536h279.552v193.536H372.736z m279.04-431.616v183.296H372.736V539.136h279.04z m-279.04-54.272V301.568h279.552v183.296H372.736z m598.016 362.496c0 68.096-42.496 122.88-110.592 122.88h-154.112v-193.536h264.192v70.656h0.512z m0-124.928H706.56V539.136h264.192v183.296z m0-237.568H706.56V301.568h264.192v183.296z m0-237.568H53.248V176.128c0-67.584 55.296-122.88 122.88-122.88h671.232c67.584 0 122.88 55.296 122.88 122.88v71.168h0.512z" p-id="14173"></path>
    </svg>
  )
}

const Table = (props) => {
  return (
    <Icon component={TableSvg} {...props} />
  )
}

// export SVG
Table.SVG = TableSvg

export { TableSvg as SVG }

export default Table
