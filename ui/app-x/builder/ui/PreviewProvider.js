import React, { useState } from 'react'

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
