import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  BrowserRouter,
  NativeRouter,
  HashRouter,
  MemoryRouter,
  Routes,
  Route,
  Link as _Link,
  useParams,
  useLocation,
  useNavigate,
} from 'react-router-dom'

// check base path exist, or log error
function check_base_path() {
  if (!globalThis.appx.BASE_PATH) {
    console.error(`ERROR: appx.BASE_PATH not set`)
  }
}

// check root path exist, or log error
function check_root_path() {
  // if (!globalThis.appx.AUTH_ROOT) {
  //   console.error(`ERROR: appx.AUTH_ROOT not set`)
  // }
  // if (!globalThis.appx.API_ROOT) {
  //   console.error(`ERROR: appx.API_ROOT not set`)
  // }
  if (!globalThis.appx.UI_ROOT) {
    console.error(`ERROR: appx.UI_ROOT not set`)
  }
}

// hard navigate to new url
const hnavigate = (namespace, ui_name, ui_deployment, url) => {
  check_root_path()
  // compute new url
  const new_url = (
    globalThis.appx.UI_ROOT
    + '/' + namespace
    + '/' + ui_name
    + '/' + ui_deployment
    + '/' + url
  ).replace(/\/+/g, '/')
  window.location.href = new_url
}

// map Link to new url
const Link = (props) => {
  check_base_path()
  //console.log(props.href)
  const { children, ...restProps } = props
  const newProps = {
    ...restProps,
    to: props.to ? (globalThis.appx.BASE_PATH + props.to).replace(/\/+/g, '/') : props.to
  }
  //console.log(newProps.href)
  return <_Link {...newProps}>{props.children}</_Link>
}

// hard link to other ui deployments
const HLink = (props) => {
  check_root_path()

  const { namespace, ui_name, ui_deployment, href, ...rest } = props

  const new_href = (
    globalThis.appx.UI_ROOT
    + '/' + namespace
    + '/' + ui_name
    + '/' + ui_deployment
    + '/' + href
  ).replace(/\/+/g, '/')

  return (
    <a href={new_href} {...rest}>
      { props.children}
    </a>
  )
}

// router context
const RouterContext = React.createContext({basename: ''})

const RouterProvider = (props) => {

  const { router, basename, children, ...restProps } = props

  check_base_path()
  const computed_basename =
    !!basename
    ? ((globalThis.appx?.BASE_PATH || '') + basename).replace(/\/+/g, '/') // .replace(/\/$/, '')
    : (globalThis.appx?.BASE_PATH || '') // .replace(/\/$/, '')
  // console.log(`computed_basename`, computed_basename)

  const navigate = () => {
    const _navigate = useNavigate()
    return (path) => {
      const new_path = (computed_basename + '/' + path).replace(/\/+/g, '/')
      _navigate(new_path)
    }
  }

  // return
  if (router === 'HashRouter') {
    return (
      <HashRouter>
        <RouterContext.Provider
          value={{
            ...(useParams() || {}),
            // location: useLocation(),
            // navigate: useNavigate(),
            basename: computed_basename,
            hnavigate: hnavigate,
            ...restProps,
          }}
          >
          <Routes basename={computed_basename}>
            <Route path="/*" element={props.children}>
            </Route>
          </Routes>
        </RouterContext.Provider>
      </HashRouter>
    )
  } else if (router === 'NativeRouter') {
    return (
      <NativeRouter>
        <RouterContext.Provider
          value={{
            ...(useParams() || {}),
            // location: useLocation(),
            // navigate: useNavigate(),
            basename: computed_basename,
            hnavigate: hnavigate,
            ...restProps,
          }}
          >
          <Routes basename={computed_basename}>
            <Route path="/*" element={props.children}>
            </Route>
          </Routes>
        </RouterContext.Provider>
      </NativeRouter>
    )
  } else if (router === 'MemoryRouter') {
    return (
      <MemoryRouter>
        <RouterContext.Provider
          value={{
            ...(useParams() || {}),
            // location: useLocation(),
            // navigate: useNavigate(),
            basename: computed_basename,
            hnavigate: hnavigate,
            ...restProps,
          }}
          >
          <Routes basename={computed_basename}>
            <Route path="/*" element={props.children}>
            </Route>
          </Routes>
        </RouterContext.Provider>
      </MemoryRouter>
    )
  } else {
    return (
      <BrowserRouter>
        <RouterContext.Provider
          value={{
            ...(useParams() || {}),
            // location: useLocation(),
            // navigate: useNavigate(),
            basename: computed_basename,
            hnavigate: hnavigate,
            ...restProps,
          }}
        >
        <Routes basename={computed_basename}>
          <Route path="/*" element={props.children}>
          </Route>
        </Routes>
        </RouterContext.Provider>
      </BrowserRouter>
    )
  }
}

// propTypes
RouterProvider.propTypes = {
  // default is BrowserRouter
  router: PropTypes.oneOf([
    'BrowserRouter',
    'NativeRouter',
    'HashRouter',
    'MemoryRouter',
  ]),
  basename: PropTypes.string,
}

// update Context variable
RouterProvider.Context = RouterContext
RouterProvider.Link = Link
RouterProvider.HLink = HLink
RouterProvider.hnavigate = hnavigate

export {
  RouterContext as Context,
  Link as Link,
  HLink as HLink,
  hnavigate as hnavigate,
}

export default RouterProvider
