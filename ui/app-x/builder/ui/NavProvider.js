import React, { useState } from 'react'

const NavContext = React.createContext()

const NavProvider = (() => {

  const f = (props) => {

    // deployment
    const [ navDeployment,    setNavDeployment   ] = useState({
      namespace: 'sys',
      ui_name: 'ui',
      ui_ver: 'internal',
      ui_deployment: 'base',
    })

    // ui_element
    const [ navElement,       setNavElement      ] = useState({
      ui_element_name: null,
      ui_element_type: null,
      ui_element_spec: null,
    })

    // ui_element
    const [ navRoute,         setNavRoute       ] = useState({
      ui_route_name: null,
      ui_route_spec: null,
    })

    // selected object
    const [ navSelected,      setNavSelected    ] = useState({
      type: null,         // ui_element or ui_route
    })

    return (
      <NavContext.Provider
        value={{
          navDeployment,
          setNavDeployment,
          navElement,
          setNavElement,
          navRoute,
          setNavRoute,
          navSelected,
          setNavSelected,
        }}
      >
        {props.children}
      </NavContext.Provider>
    )
  }

  // update Context variable
  f.Context = NavContext

  return f
}) ()

export { NavContext as Context }

export default NavProvider
