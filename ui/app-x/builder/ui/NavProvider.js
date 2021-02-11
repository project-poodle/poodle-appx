import React, { useState, useEffect } from 'react'
import {
  notification
} from 'antd'
import * as api from 'app-x/api'

const PATH_SEPARATOR = '/'
const VARIABLE_SEPARATOR = '.'

const NavContext = React.createContext()

let serviceWorkerInitiated = false
const listeners = {}

// register import maps, returns promise
function registerImportMaps(basePath, importMaps) {
  if (!navigator.serviceWorker.controller) {
    throw new Error(`ERROR: controller not found`)
  }
  // add serviceWorker event listener
  if (!serviceWorkerInitiated) {
    // handle importMaps message
    navigator.serviceWorker.addEventListener('message', function(event) {
      if (event.data.type !== 'importMaps') {
        return
      }
      // console.log(`INFO: Received importMaps message [${JSON.stringify(event.data)}]`)
      // check all listeners
      for (let listener of Object.keys(listeners)) {
        if (event.data.basePath === listener) {
          listeners[listener](event)
        }
      }
    })
    // listener initialized
    serviceWorkerInitiated = true
  }
  // return promise for async/await
  return new Promise((resolve, reject) => {
    listeners[basePath] = function(event) {
      if (event.data.status === 'ok') {
        // console.log(`INFO: registered [${basePath}] [${JSON.stringify(importMaps)}]`)
        resolve(event)
      } else {
        reject(event)
      }
    }
    // register import maps
    // console.log(`INFO: registering [${basePath}] [${JSON.stringify(importMaps)}]`)
    navigator.serviceWorker.controller.postMessage({
      type: 'importMaps',
      basePath: basePath,
      importMaps: importMaps
    })
  })
}

const NavProvider = (props) => {

  // deployment
  const [ navDeployment,    setNavDeployment    ] = useState({
    namespace: null,
    ui_name: null,
    ui_ver: null,
    ui_spec: null,
    ui_deployment: null,
    ui_deployment_spec: null,
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

  // syntax tree initialized
  const [ syntaxTreeInitialized, setSyntaxTreeInitialized ] = useState(false)

  //////////////////////////////////////////////////////////////////////
  // select deployment
  const selectDeployment = (ui_deployment) => {
    if
    (
      !ui_deployment
      || !ui_deployment.namespace
      || !ui_deployment.ui_name
      || !ui_deployment.ui_ver
      || !ui_deployment.ui_spec
      || !ui_deployment.ui_deployment
      || !ui_deployment.ui_deployment_spec
    )
    {
      throw new Error(`ERROR: ui_deployment is missing data [${JSON.stringify(ui_deployment)}]`)
    }
    // navDeployment
    setNavDeployment({
      namespace: ui_deployment.namespace,
      ui_name: ui_deployment.ui_name,
      ui_ver: ui_deployment.ui_ver,
      ui_spec: ui_deployment.ui_spec,
      ui_deployment: ui_deployment.ui_deployment,
      ui_deployment_spec: navDeployment.ui_deployment_spec,
    })
    // navComponent
    setNavComponent({
      ui_component_name: null,
      ui_component_type: null,
      ui_component_spec: null,
    })
    // navRoute
    setNavRoute({
      ui_route_name: null,
      ui_route_spec: null,
    })
    // navSelected
    setNavSelected({
      type: null
    })
    // syntax tree
    setSyntaxTreeInitialized(false)
  }

  // select ui component
  const selectComponent = (ui_component) => {
    if
    (
      !ui_component
      || !ui_component.ui_component_name
      || !ui_component.ui_component_type
      || !ui_component.ui_component_spec
    )
    {
      throw new Error(`ERROR: ui_component is missing data [${JSON.stringify(ui_component)}]`)
    }
    // navComponent
    setNavComponent({
      ui_component_name: ui_component.ui_component_name,
      ui_component_type: ui_component.ui_component_type,
      ui_component_spec: ui_component.ui_component_spec,
    })
    // navRoute
    setNavRoute({
      ui_route_name: null,
      ui_route_spec: null,
    })
    // navSelected
    setNavSelected({
      type: 'ui_component'
    })
    // syntax tree
    setSyntaxTreeInitialized(false)
  }

  // unselect ui component
  const unselectNav = () => {
    // navComponent
    setNavComponent({
      ui_component_name: null,
      ui_component_type: null,
      ui_component_spec: null,
    })
    // navRoute
    setNavRoute({
      ui_route_name: null,
      ui_route_spec: null,
    })
    // navSelected
    setNavSelected({
      type: null
    })
    // syntax tree
    setSyntaxTreeInitialized(false)
  }

  // select ui route
  const selectRoute = (ui_route) => {
    if
    (
      !ui_route
      || !ui_route.ui_route_name
      || !ui_route.ui_route_spec
    )
    {
      throw new Error(`ERROR: ui_route is missing data [${JSON.stringify(ui_route)}]`)
    }
    // navComponent
    setNavComponent({
      ui_component_name: null,
      ui_component_type: null,
      ui_component_spec: null,
    })
    // navRoute
    setNavRoute({
      ui_route_name: ui_route.ui_route_name,
      ui_route_spec: ui_route.ui_route_spec,
    })
    // navSelected
    setNavSelected({
      type: 'ui_route'
    })
    // syntax tree
    setSyntaxTreeInitialized(false)
  }

  //////////////////////////////////////////////////////////////////////
  // self import names
  const [ selfImportNames,  setSelfImportNames  ] = useState([])
  // load self import data
  useEffect(async () => {
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
      try {
        const { namespace, ui_name, ui_deployment, ui_ver } = navDeployment
        const ui_app = await api.get_async(
          'sys',
          'appx',
          `/namespace/${namespace}/ui/${ui_name}/${ui_ver}`
        )
        if (!ui_app || !ui_app.length || !ui_app[0].ui_spec || !ui_app[0].ui_spec.importMaps) {
          throw new Error(`Unable to retrieve ui_spec`)
        }
        // import maps
        const IMPORT_MAPS = ui_app[0].ui_spec.importMaps
        // base path
        const basePath = `${globalThis.appx.UI_ROOT}/${namespace}/${ui_name}/${ui_deployment}/`
        const baseElemPath = basePath + '_elem/'
        // update import maps
        IMPORT_MAPS.imports.push({ prefix: 'self/', path: baseElemPath })
        IMPORT_MAPS.origin = window.location.origin
        // update import maps
        for (const lib_key of Object.keys(IMPORT_MAPS.libs)) {
          const lib_path = IMPORT_MAPS.libs[lib_key].path
          const lib_module = await import(lib_path)
          // console.log(`lib_module.default`, lib_module.default)
          IMPORT_MAPS.libs[lib_key].modules = Object.keys(lib_module.default)
        }
        // register import maps
        await registerImportMaps(basePath, IMPORT_MAPS)
        // now get list of ui_component
        const result = await api.get_async(
          'sys',
          'appx',
          `/namespace/${namespace}/ui_deployment/ui/${ui_name}/deployment/${ui_deployment}/ui_component`
        )
        const processed = []
        for (const row of result.filter(data => data.ui_component_type === 'react/component' || data.ui_component_type === 'react/provider'))
        {
          try {
            const path_module = await import((`${globalThis.appx.UI_ROOT}/${namespace}/${ui_name}/${ui_deployment}/_elem/${row.ui_component_name}`).replace(/\/+/g, '/'))
            if (!!path_module.default) {
              const module_name = `self/${row.ui_component_name}`.replace(/\/+/g, '/')
              processed.push(module_name)
              Object.keys(path_module.default)
                .filter(variable_name => !variable_name.startsWith('$'))
                .filter(variable_name => variable_name !== 'Test')
                .map(variable_name => {
                  processed.push(module_name + VARIABLE_SEPARATOR + variable_name)
                })
            } else {
              Object.keys(path_module)
                .filter(variable_name => !variable_name.startsWith('$'))
                .filter(variable_name => variable_name !== 'Test')
                .map(variable_name => {
                  processed.push(module_name + VARIABLE_SEPARATOR + variable_name)
                })
            }
          } catch (error) {
            console.error(error)
            notification.error({
              message: `Failed to load SELF component [${row.ui_component_name}]`,
              description: typeof error === 'object' ? JSON.stringify(error) : String(error),
              placement: 'bottomLeft',
            })
          }
        }
        // update selfImportNames
        // console.log(`selfImportNames`, processed)
        setSelfImportNames(processed)
      } catch (error) {
        console.error(error)
        setSelfImportNames([])
        notification.error({
          message: `Failed to load SELF component list`,
          description: typeof error === 'object' ? JSON.stringify(error) : String(error),
          placement: 'bottomLeft',
        })
      }
    } else {
      setSelfImportNames([])
    }
  }, [navDeployment, navComponent, navRoute, navSelected])

  return (
    <NavContext.Provider
      value={{
        navDeployment,
        navComponent,
        navRoute,
        navSelected,
        selectDeployment,
        selectComponent,
        selectRoute,
        unselectNav,
        syntaxTreeInitialized,
        setSyntaxTreeInitialized,
        selfImportNames,
      }}
    >
      {props.children}
    </NavContext.Provider>
  )
}

// update Context variable
NavProvider.Context = NavContext

export { NavContext as Context }

export default NavProvider
