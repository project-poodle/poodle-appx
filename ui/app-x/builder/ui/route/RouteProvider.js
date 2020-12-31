import React, { useState } from 'react'

const RouteContext = React.createContext()

const RouteProvider = (() => {

  const f = (props) => {

    // basic data
    const [ treeData,               setTreeData               ] = useState(null)
    const [ expandedKeys,           setExpandedKeys           ] = useState([])
    const [ selectedKey,            setSelectedKey            ] = useState(null)
    const [ loadTimer,              setLoadTimer              ] = useState(null)
    // add dialog
    const [ addDialogOpen,          setAddDialogOpen          ] = useState(false)
    const [ addDialogContext,       setAddDialogContext       ] = useState({})
    const [ addDialogCallback,      setAddDialogCallback      ] = useState(null)
    // delete dialog
    const [ deleteDialogOpen,       setDeleteDialogOpen       ] = useState(false)
    const [ deleteDialogContext,    setDeleteDialogContext    ] = useState({})
    const [ deleteDialogCallback,   setDeleteDialogCallback   ] = useState(null)

    return (
      <RouteContext.Provider
        value={{
          // basic data
          treeData,
          setTreeData,
          expandedKeys,
          setExpandedKeys,
          selectedKey,
          setSelectedKey,
          loadTimer,
          setLoadTimer,
          // add dialog
          addDialogOpen,
          setAddDialogOpen,
          addDialogContext,
          setAddDialogContext,
          addDialogCallback,
          setAddDialogCallback,
          // delete dialog
          deleteDialogOpen,
          setDeleteDialogOpen,
          deleteDialogContext,
          setDeleteDialogContext,
          deleteDialogCallback,
          setDeleteDialogCallback,
        }}
      >
        {props.children}
      </RouteContext.Provider>
    )
  }

  // update Context variable
  f.Context = RouteContext

  return f
}) ()

export { RouteContext as Context }

export default RouteProvider
