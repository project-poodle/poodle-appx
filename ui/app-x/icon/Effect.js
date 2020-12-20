// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const EffectSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M0 311.936l469.632 222.272V1024L0 800.96V311.936z m85.44 431.68l298.752 141.888V591.68L85.44 450.24v293.376zM512.832 0l509.632 223.04L513.28 461.696 0 222.016 512.832 0z m-0.128 96.576L215.68 225.088l297.472 138.88 294.784-138.112L512.64 96.576zM1024 311.936V800.96l-468.8 221.76V534.208L1024 311.936z m-383.36 279.68v292.8l297.92-140.928v-293.12L640.64 591.552z" fill="#595959" p-id="49383"></path>
    </svg>
  )
}

const Effect = (props) => {
  return (
    <Icon component={EffectSvg} {...props} />
  )
}

export default Effect
