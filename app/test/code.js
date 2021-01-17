const jsx =
  <$JSX $NAME='@material-ui/core.TextField'
    {...$params.restProps}
    name={`${$params.name}[index].value`}
    type={$params.type}
    multiline={$params.multiline}
    value={innerProps.value}
    onChange={e => {
      innerProps.onChange(e.target.value)
      if (!!props.callback) {
        props.callback(e.target.value)
      }
    }}
    error={!!$r(lodash.default).get($params.qualifedName, `${$params.name}[index].value`)}
    helperText={$r(lodash.default).get($params.qualifedName, `${$params.name}[index].value`)?.message}
    >
  </$JSX>

const member1 = b[1]
const member2 = d?.e

const tl = `hello${member1}.${member2}3`

import * as React from 'react'
const [ state, setSatte ]  = useState()

const a = {
  a: 1,
  b: 2,
  c: {
    d: 3
  }
}

const b = { ...a }


const AppX = (props, children) => {

  //console.log(React)
  //console.log(React.default)

  const routeResult = useRoutes(routes)

  return (
    <Provider$1 store={store}>
    </Provider$1>
  )
}

export default AppX;

/*
<ThemeProvider theme={theme}>
  <GlobalStyles />
   {routeResult || <HeaderLayout><NotFoundView/></HeaderLayout>}
</ThemeProvider>
*/
