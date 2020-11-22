//import PropTypes from 'prop-types';
//const PropTypes = require('prop-types');
const {PropTypes} = require('../util/reflectivePropTypes')

//console.log(PropTypes)

const propTypes = {
  // You can declare that a prop is a specific JS primitive. By default, these
  // are all optional.
  optionalArray: PropTypes.array,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalNumber: PropTypes.number,
  optionalObject: PropTypes.object,
  optionalString: PropTypes.string,
  optionalSymbol: PropTypes.symbol,

  // Anything that can be rendered: numbers, strings, elements or an array
  // (or fragment) containing these types.
  // see https://reactjs.org/docs/rendering-elements.html for more info
  optionalNode: PropTypes.node,

  // A React element (ie. <MyComponent />).
  optionalElement: PropTypes.element,

  // A React element type (ie. MyComponent).
  optionalElementType: PropTypes.elementType,

  // You can also declare that a prop is an instance of a class. This uses
  // JS's instanceof operator.
  //optionalMessage: PropTypes.instanceOf(Message),

  // You can ensure that your prop is limited to specific values by treating
  // it as an enum.
  optionalEnum: PropTypes.oneOf(['News', 'Photos']),

  // An object that could be one of many types
  optionalUnion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    //PropTypes.instanceOf(Message)
  ]),

  // An array of a certain type
  optionalArrayOf: PropTypes.arrayOf(PropTypes.number),

  // An object with property values of a certain type
  optionalObjectOf: PropTypes.objectOf(PropTypes.number),

  // You can chain any of the above with `isRequired` to make sure a warning
  // is shown if the prop isn't provided.

  // An object taking on a particular shape
  optionalObjectWithShape: PropTypes.shape({
    optionalProperty: PropTypes.string,
    requiredProperty: PropTypes.number.isRequired
  }),

  // An object with warnings on extra properties
  optionalObjectWithStrictShape: PropTypes.exact({
    optionalProperty: PropTypes.string,
    requiredProperty: PropTypes.number.isRequired
  }),

  requiredFunc: PropTypes.func.isRequired,
}

//console.log(propTypes)
//console.log(propTypes.optionalNumber)
//console.log(typeof propTypes.optionalNumber)
//console.log(PropTypes.checkPropTypes)
for (const variable in propTypes) {
  const inspect = propTypes[variable]
  console.log(`========================================`)
  console.log(`${variable}`)
  //console.log(`--------------------`)
  for (const propType in inspect) {
    console.log(`----------`)
    console.log(`${propType}`)
    console.log(inspect[propType])
    //if (typeof inspect[propType] == 'function') {
    //  console.log(inspect[propType]())
    //}
  }
}
//console.log(reflectiveGetter(propTypes.optionalNumber)())
//console.log(reflectiveGetter(propTypes.optionalNumber)().type)
console.log(`========================================`)

//for (const propType in reflectiveGetter(propTypes.optionalNumber)) {
//  console.log(`------------------------------`)
//  console.log(`${propType}`)
//  console.log(propTypes[propType])
//}
