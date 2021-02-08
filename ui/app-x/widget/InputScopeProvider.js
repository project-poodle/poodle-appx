import React, { useState, createContext } from "react"
import PropTypes from "prop-types"

const InputScopeProvider_Context = createContext()

const Provider = InputScopeProvider_Context.Provider

const InputScopeProvider = (props) => {

  const basename = props.basename || ''

  return (
    <Provider
      value={{
        basename: basename,
      }}
    >
      {props.children}
    </Provider>
  )
}

InputScopeProvider.propTypes = {
  basename: PropTypes.string.isRequired
}

InputScopeProvider.Context = InputScopeProvider_Context

export { InputScopeProvider_Context as Context }

export default InputScopeProvider
