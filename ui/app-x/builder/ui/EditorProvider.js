import React, { useState } from 'react';

const EditorProvider = (() => {

  const EditorContext = React.createContext()

  const f = (props) => {
    // tree data and selected key
    const [ treeData, setTreeData ] = useState([])
    const [ expandedKeys, setExpandedKeys ] = useState([])
    const [ selectedKey, setSelectedKey ] = useState(null)
    // selected pallette tool
    const [ selectedTool, setSelectedTool ] = useState(null)
    // syntax tree cursor
    const [ syntaxTreeCursor, setSyntaxTreeCursor ] = useState('progress')

    return (
      <EditorContext.Provider
        value={{
          treeData: treeData,
          setTreeData: setTreeData,
          expandedKeys: expandedKeys,
          setExpandedKeys: setExpandedKeys,
          selectedKey: selectedKey,
          setSelectedKey: setSelectedKey,
          selectedTool: selectedTool,
          setSelectedTool: setSelectedTool,
          syntaxTreeCursor: syntaxTreeCursor,
          setSyntaxTreeCursor: setSyntaxTreeCursor,
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
