import React, { useState } from 'react'
import _ from 'lodash'

const MAX_HISTORY = 20

const SyntaxContext = React.createContext()

const SyntaxProvider = (() => {

  const f = (props) => {
    // tree data and selected key
    const [ treeData,           setTreeData           ] = useState([])
    const [ expandedKeys,       setExpandedKeys       ] = useState([])
    const [ selectedKey,        setSelectedKey        ] = useState(null)
    // test data
    const [ testData,           setTestData           ] = useState([])
    // dirty flags
    const [ syntaxDirty,        setSyntaxDirty        ] = useState(false)
    // const [ designDirty,        setDesignDirty        ] = useState(false)
    const [ testDirty,          setTestDirty          ] = useState(false)
    const [ propBaseDirty,      setPropBaseDirty      ] = useState(false)
    const [ propYamlDirty,      setPropYamlDirty      ] = useState(false)
    // common data
    const [ loadTimer,          setLoadTimer          ] = useState(0)
    const [ livePreview,        setLivePreview        ] = useState(true)
    const [ previewInitialized, setPreviewInitialized ] = useState(false)
    // history
    const [ updateKey, setUpdateKey ] = useState(null)
    const [ history, setHistory ] = useState({
      undo: [],
      current: null,
      redo: [],
    })

    // update design action
    const updateDesignAction = (action, newTreeData, newExpandedKeys, newSelectedKey, lookupKey) => {

      // console.log('updateAction', action, newTreeData, newExpandedKeys, newSelectedKey, nodeKey)

      if (!lookupKey || (lookupKey !== updateKey)) {
        // setUpdateKey(lookupKey)
        // console.log(`make ${lookupKey} ${updateKey}`)
        makeDesignAction(action, newTreeData, newExpandedKeys, newSelectedKey, lookupKey)
        return
      }

      // console.log(`update ${lookupKey}`)

      // if node key is same as updateKey
      const newHistory = {
        undo: _.cloneDeep(history.undo),
        current: {
          action: action,
          treeData: newTreeData,
          testData: testData,
          expandedKeys: newExpandedKeys,
          selectedKey: newSelectedKey,
          updateKey: lookupKey,
          syntaxDirty: true,
        },
        redo: _.cloneDeep(history.redo),
      }

      // update state from record
      setTreeData(newTreeData)
      setExpandedKeys(newExpandedKeys)
      setSelectedKey(newSelectedKey)
      setUpdateKey(lookupKey)
      setSyntaxDirty(true)

      // set history
      setHistory(newHistory)
    }

    // update test action
    const updateTestAction = (action, newTestData) => {

      // console.log('updateAction', action, newTreeData, newExpandedKeys, newSelectedKey, nodeKey)

      if (updateKey !== '__test') {
        setUpdateKey('__test')
        makeTestAction(action, newTestData)
        return
      }

      const newHistory = {
        undo: _.cloneDeep(history.undo),
        current: {
          action: action,
          treeData: treeData,
          testData: newTestData,
          expandedKeys: expandedKeys,
          selectedKey: selectedKey,
          updateKey: '__test',
          syntaxDirty: true,
        },
        redo: _.cloneDeep(history.redo),
      }

      // update state from record
      setTestData(newTestData)
      setUpdateKey('__test')
      setSyntaxDirty(true)

      // set history
      setHistory(newHistory)
    }

    // make action
    const makeFreshAction = (action, newTreeData, newTestData, newExpandedKeys, newSelectedKey) => {

      // if fresh, clear history, and mark record as fresh
      // set current
      const newHistory = {
        undo: [],
        current: {
          action: action,
          treeData: newTreeData,
          testData: newTestData,
          expandedKeys: newExpandedKeys,
          selectedKey: newSelectedKey,
          updateKey: null,
          syntaxDirty: false,
        },
        redo: [],
      }

      // update state from record
      setTreeData(newTreeData)
      setTestData(newTestData)
      setExpandedKeys(newExpandedKeys)
      setSelectedKey(newSelectedKey)
      setUpdateKey(null)
      setSyntaxDirty(false)

      // set history
      setHistory(newHistory)
      return
    }

    // make design action
    const makeDesignAction = (action, newTreeData, newExpandedKeys, newSelectedKey, lookupKey) => {

      // console.log(`makeDesignAction`)

      // keep the record
      const record = {
        action: action,
        treeData: newTreeData,
        testData: testData,
        expandedKeys: !!newExpandedKeys ? newExpandedKeys : expandedKeys,
        selectedKey: !!newSelectedKey ? newSelectedKey : selectedKey,
        updateKey: lookupKey,
        syntaxDirty: true,
      }

      // keep history record, clear redo buffer
      const newHistory = {
        undo: _.cloneDeep(history.undo),
        current: record,
        redo: [],
      }
      // push undo history
      newHistory.undo.push(_.cloneDeep(history.current))

      // keep up to max # of histories
      if (newHistory.undo.length > MAX_HISTORY) {
        newHistory.undo.splice(0, newHistory.undo.length - MAX_HISTORY)
      }

      // update state from action
      setTreeData(record.treeData)
      setExpandedKeys(record.expandedKeys)
      setSelectedKey(record.selectedKey)
      setUpdateKey(lookupKey)
      setSyntaxDirty(true)

      // console.log(newHistory)
      // set history
      setHistory(newHistory)
    }

    // make test action
    const makeTestAction = (action, newTestData) => {

      // keep the record
      const record = {
        action: action,
        treeData: treeData,
        testData: newTestData,
        expandedKeys: expandedKeys,
        selectedKey: selectedKey,
        updateKey: '__test',
        syntaxDirty: true,
      }

      // keep history record, clear redo buffer
      const newHistory = {
        undo: _.cloneDeep(history.undo),
        current: record,
        redo: [],
      }
      // push undo history
      newHistory.undo.push(_.cloneDeep(history.current))

      // keep up to max # of histories
      if (newHistory.undo.length > MAX_HISTORY) {
        newHistory.undo.splice(0, newHistory.undo.length - MAX_HISTORY)
      }

      // update state from action
      setTestData(record.testData)
      setUpdateKey('__test')
      setSyntaxDirty(true)

      // console.log(newHistory)
      // set history
      setHistory(newHistory)
    }

    // undo
    const undo = () => {
      // console.log('undo')
      if (history.undo.length) {
        // get record for redo
        const newHistory = _.clone(history)
        const record = newHistory.undo.pop()

        // add record to redo history
        newHistory.redo.push(newHistory.current)
        // keep up to max # of histories
        if (newHistory.redo.length > MAX_HISTORY) {
          newHistory.redo.splice(0, newHistory.redo.length - MAX_HISTORY)
        }

        // update current
        newHistory.current = record

        // update state from record
        setTreeData(record.treeData)
        setTestData(record.testData)
        setExpandedKeys(record.expandedKeys)
        setSelectedKey(record.selectedKey)
        setUpdateKey(record.updateKey)
        setSyntaxDirty(record.syntaxDirty)

        // set history
        setHistory(newHistory)
      }
    }

    // redo
    const redo = () => {
      // console.log('redo')
      if (history.redo.length) {
        // get record for redo
        const newHistory = _.clone(history)
        const record = newHistory.redo.pop()

        // add record to undo history
        newHistory.undo.push(newHistory.current)
        // keep up to max # of histories
        if (newHistory.undo.length > MAX_HISTORY) {
          newHistory.undo.splice(0, newHistory.undo.length - MAX_HISTORY)
        }

        // update current
        newHistory.current = record

        // update state from record
        setTreeData(record.treeData)
        setTestData(record.testData)
        setExpandedKeys(record.expandedKeys)
        setSelectedKey(record.selectedKey)
        setUpdateKey(record.updateKey)
        setSyntaxDirty(record.syntaxDirty)

        // set history
        setHistory(newHistory)
      }
    }

    return (
      <SyntaxContext.Provider
        value={{
          // syntax tree data
          treeData,
          expandedKeys,
          setExpandedKeys,
          selectedKey,
          setSelectedKey,
          // test data
          testData,
          // dirty flags
          syntaxDirty,
          setSyntaxDirty,
          testDirty,
          setTestDirty,
          propBaseDirty,
          setPropBaseDirty,
          propYamlDirty,
          setPropYamlDirty,
          // common data
          loadTimer,
          setLoadTimer,
          livePreview,
          setLivePreview,
          previewInitialized,
          setPreviewInitialized,
          // history and actions
          makeFreshAction,
          makeDesignAction,
          makeTestAction,
          updateDesignAction,
          updateTestAction,
          history,
          undo,
          redo,
        }}
      >
        {props.children}
      </SyntaxContext.Provider>
    )
  }

  // update Context variable
  f.Context = SyntaxContext

  return f
}) ()

export { SyntaxContext as Context }

export default SyntaxProvider
