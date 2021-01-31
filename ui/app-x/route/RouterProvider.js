import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'


const RouterContext = React.createContext()

const RouterProvider = (props) => {

  // return
  return (
    <RouterContext.Provider
      value={{
      }}
    >
        {props.children}
    </RouterContext.Provider>
  )
}

// propTypes
RouterProvider.propTypes = {
  router: PropTypes.element.isRequired,
}

// update Context variable
RouterProvider.Context = RouterContext

export { RouterContext as Context }

export default RouterProvider
