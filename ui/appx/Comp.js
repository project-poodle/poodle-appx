//import 'react-perfect-scrollbar/dist/css/styles.css';
//import React from 'https://unpkg.com/react@^17?min';
//import htm from 'https://unpkg.com/react@^3?min';
//import htm from 'https://unpkg.com/htm?module'
//const html = htm.bind(React.createElement)

var count = 0
//console.log(`Hello, Comp [${count}]!`);

const Comp = () => {

  count += 1

  //const routeResult = useRoutes(routes)
  return (
    <p>Hello, Comp #{count}</p>
  )
};

export default Comp;
