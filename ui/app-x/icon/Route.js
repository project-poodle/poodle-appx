// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const RouteSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M820.8384 328.0896c1.2288-0.8192 2.048-1.6384 2.8672-2.4576h149.0944c16.7936 0 30.72-13.9264 30.72-30.72V139.264c0-16.7936-13.9264-30.72-30.72-30.72h-212.992c-16.7936 0-30.72 13.9264-30.72 30.72v47.104H294.912V139.264c0-16.7936-13.9264-30.72-30.72-30.72h-212.992C34.4064 108.544 20.48 122.4704 20.48 139.264v155.648c0 16.7936 13.9264 30.72 30.72 30.72h144.9984c0.8192 0.8192 2.048 1.6384 2.8672 2.4576l258.4576 185.9584-256 184.32H51.2c-16.7936 0-30.72 13.9264-30.72 30.72v155.648c0 16.7936 13.9264 30.72 30.72 30.72h212.992c16.7936 0 30.72-13.9264 30.72-30.72v-47.104h434.176V884.736c0 16.7936 13.9264 30.72 30.72 30.72h212.992c16.7936 0 30.72-13.9264 30.72-30.72v-155.648c0-16.7936-13.9264-30.72-30.72-30.72h-154.4192l-256-184.32 258.4576-185.9584zM790.528 169.984h151.552v94.208h-151.552v-94.208z m-708.608 0h151.552v94.208H81.92v-94.208zM286.72 315.392c4.9152-5.3248 8.192-12.6976 8.192-20.48V247.808h434.176V294.912c0 6.9632 2.4576 13.5168 6.5536 18.8416l-225.6896 162.6112L286.72 315.392zM233.472 854.016H81.92v-94.208h151.552v94.208z m708.608 0h-151.552v-94.208h151.552v94.208z m-208.4864-140.9024c-2.8672 4.5056-4.5056 10.24-4.5056 15.9744v47.104H294.912V729.088c0-6.5536-2.048-13.1072-5.7344-18.0224l220.7744-159.3344 223.6416 161.3824z" p-id="37237"></path>
    </svg>
  )
}

const Route = (props) => {
  return (
    <Icon component={RouteSvg} {...props} />
  )
}

export default Route