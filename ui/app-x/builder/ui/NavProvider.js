import React, { useState, useEffect } from 'react'
import * as api from 'app-x/api'

const NavContext = React.createContext()

const NavProvider = (() => {

  const f = (props) => {

    // deployment
    const [ navDeployment,    setNavDeployment    ] = useState({
      namespace: null,
      ui_name: null,
      ui_ver: null,
      ui_deployment: null,
    })

    // ui_component
    const [ navComponent,     setNavComponent     ] = useState({
      ui_component_name: null,
      ui_component_type: null,
      ui_component_spec: null,
    })

    // ui_component
    const [ navRoute,         setNavRoute         ] = useState({
      ui_route_name: null,
      ui_route_spec: null,
    })

    // selected object
    const [ navSelected,      setNavSelected      ] = useState({
      type: null,         // ui_component or ui_route
    })

    // self import names
    const [ selfImportNames,  setSelfImportNames  ] = useState([])
    // load self import data
    useEffect(() => {
      /*
      if (!globalThis.appx?.SELF) {
        throw new Error(`ERROR: appx.SELF not set`)
      }
      */
      if (
        !!navDeployment
        && navDeployment.namespace
        && navDeployment.ui_name
        && navDeployment.ui_deployment
      ) {
        const { namespace, ui_name, ui_deployment } = navDeployment
        api.get(
          'sys',
          'appx',
          `/namespace/${namespace}/ui_deployment/ui/${ui_name}/deployment/${ui_deployment}/ui_component`,
          result => {
            const processed = result
                .filter(data => data.ui_component_type === 'react/component' || data.ui_component_type === 'react/provider')
                .map(data => `self/${data.ui_component_name}`.replace(/\/+/g, '/'))
            console.log(`selfImportNames`, processed)
            setSelfImportNames(processed)
          },
          error => {
            setSelfImportNames([])
            notification.error({
              message: `Failed to load SELF component list`,
              description: typeof error === 'object' ? JSON.stringify(error) : String(error),
              placement: 'bottomLeft',
            })
          }
        )
      } else {
        setSelfImportNames([])
      }
    }, [navDeployment])

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
          selfImportNames,
          setSelfImportNames,
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
