import React, { useState } from 'react'

const ElementContext = React.createContext()

const ElementProvider = (() => {

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
      <ElementContext.Provider
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
      </ElementContext.Provider>
    )
  }

  // update Context variable
  f.Context = ElementContext

  return f
}) ()

export { ElementContext as Context }

export default ElementProvider
