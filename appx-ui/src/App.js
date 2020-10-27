import React, { Component } from 'react'
//import ReactDOM from 'react-dom'
import MaterialTable from 'material-table'

class App extends Component {
  render() {
    return (
      <div style={{ maxWidth: '100%' }}>
        <MaterialTable
            title="Demo Title"
            /*
          columns={[
            { title: 'Adı', field: 'name' },
            { title: 'Soyadı', field: 'surname' },
            { title: 'Doğum Yılı', field: 'birthYear', type: 'numeric' },
            { title: 'Doğum Yeri', field: 'birthCity', lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' } }
          ]}
          data={[
              { name: 'Aehmet', surname: 'Daran', birthYear: 1986, birthCity: 63 },
              { name: 'Cehmet', surname: 'Paran', birthYear: 1983, birthCity: 63 },
              { name: 'Dehmet', surname: 'Uaran', birthYear: 1972, birthCity: 63 },
              { name: 'Eehmet', surname: 'Maran', birthYear: 1961, birthCity: 63 },
              { name: 'Dehmet', surname: 'Taran', birthYear: 1972, birthCity: 63 },
              { name: 'Eehmet', surname: 'Jaran', birthYear: 1961, birthCity: 63 },
              { name: 'Dehmet', surname: 'Karan', birthYear: 1972, birthCity: 63 },
              { name: 'Eehmet', surname: 'Raran', birthYear: 1961, birthCity: 63 },
              { name: 'Dehmet', surname: 'Yaran', birthYear: 1972, birthCity: 63 },
              { name: 'Kehmet', surname: 'Zaran', birthYear: 1961, birthCity: 63 },
              { name: 'Tehmet', surname: 'Oaran', birthYear: 1972, birthCity: 63 },
              { name: 'Eehmet', surname: 'Caran', birthYear: 1991, birthCity: 63 },
              { name: 'Fehmet', surname: 'Haran', birthYear: 1989, birthCity: 63 }
          ]}
          */
            columns={[
                { title: 'Object Name', field: 'obj_name', width: 180 },
                { title: 'Namespace', field: 'namespace', width: 100 },
                { title: 'App Name', field: 'app_name', width: 100 },
                { title: 'App Version', field: 'app_ver', width: 100 },
                { title: 'Object Spec', field: 'obj_spec', width: 600, render: raw => { return JSON.stringify(raw)} },
            ]}
            data={query =>
                new Promise((resolve, reject) => {
                    let url = '/sys/base/appx/namespace/sys/app/appx/internal/obj?_sort=namespace,obj_spec.comment(desc)'
                    // let url = '/sys/base/appx/namespace'
                    fetch(url)
                    .then(response => response.json())
                    .then(result => {
                        // console.log(result)
                        resolve({
                            data: result,
                            page: 0,
                            totalCount: result.length,
                        })
                    })
                })
            }
            options={{
                fixedColumns: {
                  left: 1,
                }
            }}
        />
      </div>
    )
  }
}

/*
import React from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';

function App() {
  return (
    <Button variant="contained" color="primary">
      Hello World
    </Button>
  );
}

// ReactDOM.render(<App />, document.querySelector('#root'));
*/

/*
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
*/

export default App;
