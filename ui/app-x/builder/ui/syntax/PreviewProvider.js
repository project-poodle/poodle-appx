import React, { useState } from 'react'

const PreviewContext = React.createContext()

const PreviewProvider = (() => {

  const f = (props) => {

    // preview loading
    const [ widgetLoading,        setWidgetLoading        ] = useState(false)
    const [ liveWidgetUpdating,   setLiveWidgetUpdating   ] = useState(false)
    const [ sourceLoading,        setSourceLoading        ] = useState(false)
    const [ yamlLoading,          setYamltLoading         ] = useState(false)
    const [ jsonLoading,          setJsonLoading          ] = useState(false)

    return (
      <PreviewContext.Provider
        value={{
          widgetLoading,
          setWidgetLoading,
          liveWidgetUpdating,
          setLiveWidgetUpdating,
          sourceLoading,
          setSourceLoading,
          yamlLoading,
          setYamltLoading,
          jsonLoading,
          setJsonLoading,
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

export { PreviewContext as Context }

export default PreviewProvider
