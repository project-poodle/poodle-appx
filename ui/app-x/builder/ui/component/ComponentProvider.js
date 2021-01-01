import React, { useState } from 'react'

const ComponentContext = React.createContext()

const ComponentProvider = (() => {

  const f = (props) => {

    // basic data
    const [ treeData,               setTreeData               ] = useState(null)
    const [ expandedKeys,           setExpandedKeys           ] = useState([])
    const [ selectedKey,            setSelectedKey            ] = useState(null)
    const [ contextKey,             setContextKey             ] = useState(null)
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
      <ComponentContext.Provider
        value={{
          // basic data
          treeData,
          setTreeData,
          expandedKeys,
          setExpandedKeys,
          selectedKey,
          setSelectedKey,
          contextKey,
          setContextKey,
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
      </ComponentContext.Provider>
    )
  }

  // update Context variable
  f.Context = ComponentContext

  return f
}) ()

export { ComponentContext as Context }

export default ComponentProvider
