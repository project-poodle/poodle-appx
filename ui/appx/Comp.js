var count = 0

const Comp = () => {

  count += 1

  //const routeResult = useRoutes(routes)
  return (
    <p>Hello, Comp #{count}</p>
  )
};

export default Comp;
