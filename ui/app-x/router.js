import {
  useRoutes as _useRoutes,
  navigate as _navigate,
  A as _A
} from 'hookrouter'

// check base path exist, or log error
function check_base_path() {
  if (!globalThis.appx.BASE_PATH) {
    console.error(`ERROR: appx.BASE_PATH not set`)
  }
}

// compute new url based on input
function compute_url(inputUrl) {
  const newUrl = (globalThis.appx.BASE_PATH + inputUrl).replace(/\/+/g, '/')
  return newUrl
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

export {
  useRoutes,
  navigate,
  A,
}
