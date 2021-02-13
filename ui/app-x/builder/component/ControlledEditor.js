import React, { useRef, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types';
// monaco editor
import { default as Editor } from '@monaco-editor/react'

function ControlledEditor({ value: providedValue, onChange, editorDidMount, ...props }) {
  const editor = useRef(null)
  const listener = useRef(null)
  const value = useRef(providedValue)

  // to avoid unnecessary updates in `handleEditorModelChange`
  // (that depends on the `current value` and will trigger to update `attachChangeEventListener`,
  // thus, the listener will be disposed and attached again for every value change)
  // the current value is stored in ref (useRef) instead of being a dependency of `handleEditorModelChange`
  value.current = providedValue

  const handleEditorModelChange = useCallback(event => {
    const editorValue = editor.current.getValue()

    if (value.current !== editorValue) {
      const directChange = onChange(event, editorValue)

      if (typeof directChange === 'string' && editorValue !== directChange) {
        editor.current.setValue(directChange)
        updateRowCount()
      //   const totalRow = directChange?.split(/\r\n|\r|\n/).length || 1
      //   // console.log(`directChange totalRow`, totalRow)
      //   setRows(totalRow)
      }
    }
  }, [onChange])

  const attachChangeEventListener = useCallback(() => {
    listener.current = editor.current?.onDidChangeModelContent(handleEditorModelChange)
  }, [handleEditorModelChange])

  useEffect(() => {
    attachChangeEventListener()
    return () => listener.current?.dispose()
  }, [attachChangeEventListener])

  const handleEditorDidMount = useCallback((getValue, _editor) => {
    editor.current = _editor
    attachChangeEventListener()
    // listen to focus and blur events
    editorDidMount(getValue, _editor)
    _editor.onDidBlurEditorText(() => {
      if (!!props.onBlur) props.onBlur(_editor)
    })
    _editor.onDidFocusEditorText(() => {
      if (!!props.onFocus) props.onFocus(_editor)
    })
    // set tab size, and use spaces
    _editor.getModel().updateOptions({ tabSize: 2, insertSpaces: true })
    // model line count
    updateRowCount()
  }, [attachChangeEventListener, editorDidMount])

  const [ rows, setRows ] = useState(1)
  useEffect(() => {
    // line count from provided value
    // const rowCount = providedValue?.split(/\r\n|\r|\n/).length || 1
    updateRowCount()
  }, [providedValue, editor.current])

  function updateRowCount() {
    const rowCount = 1
    try {
      // set tab size, and use spaces
      editor.current?.getModel().updateOptions({ tabSize: 2, insertSpaces: true })
      // model line count
      const lineCount = editor.current?.getModel().getLineCount() || rowCount
      const viewLineCount = editor.current?._getViewModel()?._lines?.getViewLineCount() || lineCount
      // console.log(`lineCount`, lineCount, `viewLineCount`, viewLineCount)
      setRows(Math.min(viewLineCount, Math.round(lineCount*5.0/3)))
    } catch (err) {
      console.error(err)
      const lineCount = editor.current?.getModel().getLineCount() || rowCount
      setRows(lineCount)
    }
  }

  return (
    <Editor
      value={providedValue}
      editorDidMount={handleEditorDidMount}
      _isControlledMode={true}
      {...props}
      width='100%'
      height={!!props.height ? props.height : !!props.maxRows ? Math.min(props.maxRows, rows) * 18 + 4 : rows * 18 + 4 }
    />
  )
}

ControlledEditor.propTypes = {
  value: PropTypes.string,
  editorDidMount: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  height: PropTypes.any,
  maxRows: PropTypes.number,
}

ControlledEditor.defaultProps = {
  editorDidMount: () => {},
  onChange: () => {},
}

export default ControlledEditor
