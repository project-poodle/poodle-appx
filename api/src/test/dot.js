const dotProp = require('dot-prop')
const objPath = require("object-path");


let data = { "a": 1, "b": 2, "c.d": 3 }

console.log(dotProp.get(data, 'a', 77));
console.log(dotProp.get(data, 'b', 78));
console.log(dotProp.get(data, 'c', 79));
console.log(dotProp.get(data, 'c.d', 80));
console.log(dotProp.get(data, ['c.d'], 80));
console.log(dotProp.get(data, ['c', 'd'], 80));

console.log(objPath.get(data, 'a', 77));
console.log(objPath.get(data, 'b', 78));
console.log(objPath.get(data, 'c', 79));
console.log(objPath.get(data, 'c.d', 80));
console.log(objPath.get(data, ['c.d'], 80));
console.log(objPath.get(data, ['c', 'd'], 80));
