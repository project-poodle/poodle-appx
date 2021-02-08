import React from 'react'
import {default as Icon} from '@ant-design/icons'

const InputTabularSvg = (props) => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path id="tabular-line1" d="M62 168 L462 168 L462 248 L62 248 Z"></path>
      <path id="tabular-line2" d="M562 168 L962 168 L962 248 L562 248 Z"></path>
      <path id="tabular-line3" d="M62 472 L462 472 L462 552 L62 552 Z"></path>
      <path id="tabular-line4" d="M562 472 L962 472 L962 552 L562 552 Z"></path>
      <path id="tabular-line5" d="M62 776 L462 776 L462 856 L62 856 Z"></path>
      <path id="tabular-line6" d="M562 776 L962 776 L962 856 L562 856 Z"></path>
    </svg>
  )
}

const InputTabular = (props) => {
  return (
    <Icon component={InputTabularSvg} {...props} />
  )
}

// export SVG
InputTabular.SVG = InputTabularSvg

export { InputTabularSvg as SVG }

export default InputTabular

/*
<line id="tabular-line1" stroke="currentColor" stroke-width="80" x1="42" x2="302" y1="300" y2="300"></line>
<line id="tabular-line2" stroke="currentColor" stroke-width="80" x1="382" x2="642" y1="300" y2="300"></line>
<line id="tabular-line3" stroke="currentColor" stroke-width="80" x1="772" x2="982" y1="300" y2="300"></line>
<line id="tabular-line4" stroke="currentColor" stroke-width="80" x1="42" x2="302" y1="600" y2="600"></line>
<line id="tabular-line5" stroke="currentColor" stroke-width="80" x1="382" x2="642" y1="600" y2="600"></line>
<line id="tabular-line6" stroke="currentColor" stroke-width="80" x1="772" x2="982" y1="600" y2="600"></line>
*/
