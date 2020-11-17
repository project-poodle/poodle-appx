import Comp from './Comp.js'

var count = 0

const Layout = () => {

  count += 1

  return (
    <div>
      <p>Hello, Layout #{count}</p>
      <Comp />
    </div>
  )
};

export default Layout;
