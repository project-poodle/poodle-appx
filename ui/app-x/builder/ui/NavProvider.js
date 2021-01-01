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

    // ui_component
    const [ navComponent,       setNavComponent      ] = useState({
      ui_component_name: null,
      ui_component_type: null,
      ui_component_spec: null,
    })

    // ui_component
    const [ navRoute,         setNavRoute       ] = useState({
      ui_route_name: null,
      ui_route_spec: null,
    })

    // selected object
    const [ navSelected,      setNavSelected    ] = useState({
      type: null,         // ui_component or ui_route
    })

    return (
      <NavContext.Provider
        value={{
          navDeployment,
          setNavDeployment,
          navComponent,
          setNavComponent,
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
