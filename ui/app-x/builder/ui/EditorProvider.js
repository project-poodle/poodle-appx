import React, { useState } from 'react';

const EditorProvider = (() => {

  const EditorContext = React.createContext()

  const f = (props) => {
    const [ treeData, setTreeData ] = useState([])
    const [ expandedKeys, setExpandedKeys ] = useState([])
    const [ selectedKey, setSelectedKey ] = useState(null)

    return (
      <EditorContext.Provider
        value={{
          treeData: treeData,
          setTreeData: setTreeData,
          expandedKeys: expandedKeys,
          setExpandedKeys: setExpandedKeys,
          selectedKey: selectedKey,
          setSelectedKey: setSelectedKey,
        }}
      >
        {props.children}
      </EditorContext.Provider>
    )
  }

  // update Context variable
  f.Context = EditorContext
  // console.log(f)
  // console.log(Object.entries(f))

  return f
}) ()

export default EditorProvider;
