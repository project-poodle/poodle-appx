import React, { useState, useContext, createContext } from "react"
import PropTypes from "prop-types"

const InputProvider_Context = createContext()

const Provider = InputProvider_Context.Provider

const InputProvider = (props) => {

  // get parent context
  const parentContext = useContext(InputProvider.Context)

  const basename = props.basename || parentContext?.basename || ''

  const onSubmit = props.onSubmit || parentContext?.onSubmit || (() => {})

  const onReset = props.onReset || parentContext?.onReset || (() => {})

  return (
    <Provider
      value={{
        basename: basename,
        onSubmit: onSubmit,
        onReset: onReset,
      }}
    >
      {props.children}
    </Provider>
  )
}

InputProvider.propTypes = {
  basename: PropTypes.string.isRequired
}

InputProvider.Context = InputProvider_Context

export { InputProvider_Context as Context }

export default InputProvider
