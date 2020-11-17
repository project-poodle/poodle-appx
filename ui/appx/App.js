//import 'react-perfect-scrollbar/dist/css/styles.css';
//import React from 'https://unpkg.com/react@^17?min';
//import htm from 'https://unpkg.com/react@^3?min';
//import htm from 'https://unpkg.com/htm?module'
//const html = htm.bind(React.createElement)

import Comp from './Comp.js'

var count = 0
//console.log(`Hello, App [${count}]!`);

const App = () => {

  count += 1

  //const routeResult = useRoutes(routes)
  return (
    <div>
      <p>Hello, App #{count}</p>
      <Comp />
    </div>
  )
};

export default App;
