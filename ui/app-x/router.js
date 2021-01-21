import React from 'react'
import {
  useRoutes as _useRoutes,
  usePath as _usePath,
  navigate as _navigate,
  A as _A,
} from 'hookrouter'

// check base path exist, or log error
function check_base_path() {
  if (!globalThis.appx.BASE_PATH) {
    console.error(`ERROR: appx.BASE_PATH not set`)
  }
}

// check root path exist, or log error
function check_root_path() {
  if (!globalThis.appx.AUTH_ROOT) {
    console.error(`ERROR: appx.AUTH_ROOT not set`)
  }
  if (!globalThis.appx.API_ROOT) {
    console.error(`ERROR: appx.API_ROOT not set`)
  }
  if (!globalThis.appx.UI_ROOT) {
    console.error(`ERROR: appx.UI_ROOT not set`)
  }
}

// compute new url based on input
function compute_url(inputUrl) {
  const newUrl = (globalThis.appx.BASE_PATH + inputUrl).replace(/\/+/g, '/')
  return newUrl
}

// compute new url based on input
function reverse_url(inputUrl) {
  if (inputUrl.startsWith(globalThis.appx.BASE_PATH)) {
    const newUrl = ('/' + inputUrl.substring(globalThis.appx.BASE_PATH.length))
    return newUrl.replace(/\/+/g, '/')
  } else {
    return inputUrl
  }
}

// map hookrouter|useRoutes to new route keys
const useRoutes = (routeMap => {
  check_base_path()
  const newMap = {}
  Object.keys(routeMap).map(routeKey => {
    const routeVal = routeMap[routeKey]
    const newRouteKey = compute_url(routeKey)
    newMap[newRouteKey] = routeVal
  })
  //console.log(newMap)
  const result = _useRoutes(newMap)
  //console.log(result)
  return result
})

// map hookrouter|useRoutes to new route keys
const usePath = (() => {
  check_base_path()
  const result = _usePath()
  const newResult = reverse_url(result)
  //console.log(newResult)
  return newResult
})

// map hookrouter|navigate to new url
const navigate = (url => {
  check_base_path()
  if (url.startsWith('/')) {
    //console.log(url)
    const newUrl = compute_url(url)
    //console.log(newUrl)
    return _navigate(newUrl)
  } else {
    return _navigate(url)
  }
})

// hard navigate to new url
const hnavigate = (namespace, ui_name, ui_deployment, url) => {
  check_root_path()
  // compute new url
  const new_url = (globalThis.appx.UI_ROOT + '/' + namespace + '/' + ui_name + '/' + ui_deployment + '/' + url).replace(/\/+/g, '/')
  window.location.href = new_url
}

// map hookrouter|A to new url
const A = (props) => {
  check_base_path()
  //console.log(props.href)
  const newProps = {
    ...props,
    href: props.href ? compute_url(props.href) : props.href
  }
  //console.log(newProps.href)
  return _A(newProps)
}

// hard link to other ui deployments
const HLink = (props) => {
  check_root_path()

  const { namespace, ui_name, ui_deployment, href, ...rest } = props

  const new_href = (globalThis.appx.UI_ROOT + '/' + namespace + '/' + ui_name + '/' + ui_deployment + '/' + href).replace(/\/+/g, '/')

  return (
    <a href={new_href} {...rest}>
      { props.children}
    </a>
  )
}

export {
  useRoutes,
  usePath,
  navigate,
  hnavigate,
  A,
  HLink,
}

export default {
  useRoutes,
  usePath,
  navigate,
  hnavigate,
  A,
  HLink,
}
