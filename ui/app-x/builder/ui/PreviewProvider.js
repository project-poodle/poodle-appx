import React, { useState } from 'react'
import _ from 'lodash'

const MAX_HISTORY = 20

const PreviewProvider = (() => {

  const PreviewContext = React.createContext()

  const f = (props) => {

    // preview loading
    const [ previewLoading,     setPreviewLoading   ] = useState(false)

    return (
      <PreviewContext.Provider
        value={{
          previewLoading: previewLoading,
          setPreviewLoading: setPreviewLoading,
        }}
      >
        {props.children}
      </PreviewContext.Provider>
    )
  }

  // update Context variable
  f.Context = PreviewContext

  return f
}) ()

export default PreviewProvider
