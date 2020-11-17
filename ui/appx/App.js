import Comp from './Comp.js'
import Layout from './Layout.js'

const Counter = props => {
    const [count, setCount] = React.useState(parseInt(props.count))
    return (
      <div>
          <h1>{count}</h1>
          <button onClick={e => setCount(count - 1)}>Decrement</button>
          <button onClick={e => setCount(count + 1)}>Increment</button>
      </div>
    )
}

const App = () => {
    return (
      <div>
        <h1>No script tags, no build steps...</h1>
        <Counter count={3} />
        <Comp />
        <Layout />
      </div>
    )
}

export default App;
