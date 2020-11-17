import Comp from './Comp.js'
import App from './App.js'

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

const Appx = () => {
    return (
      <div>
        <h1>No script tags, no build step....</h1>
        <Counter count={3} />
        <Comp />
        <App />
      </div>
    )
}

export default Appx;
