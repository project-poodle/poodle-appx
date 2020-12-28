import React, { useState } from 'react'

const ElementProvider = (() => {

  const ElementContext = React.createContext()

  const f = (props) => {

    const [ treeData,               setTreeData               ] = useState(null)
    const [ expandedKeys,           setExpandedKeys           ] = useState([])
    const [ selectedKey,            setSelectedKey            ] = useState(null)
    const [ selectedTool,           setSelectedTool           ] = useState(null)
    const [ addDialogOpen,          setAddDialogOpen          ] = useState(false)
    const [ addDialogCallback,      setAddDialogCallback      ] = useState(null)
    const [ deleteDialogOpen,       setDeleteDialogOpen       ] = useState(false)
    const [ deleteDialogCallback,   setDeleteDialogCallback   ] = useState(null)

    return (
      <ElementContext.Provider
        value={{
          treeData,
          setTreeData,
          expandedKeys,
          setExpandedKeys,
          selectedKey,
          setSelectedKey,
          selectedTool,
          setSelectedTool,
          addDialogOpen,
          setAddDialogOpen,
          addDialogCallback,
          setAddDialogCallback,
          deleteDialogOpen,
          setDeleteDialogOpen,
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

export default ElementProvider
