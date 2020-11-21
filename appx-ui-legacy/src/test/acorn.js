const acorn = require("acorn");
const jsx = require("acorn-jsx");
const escodegen = require("escodegen");

const parsed = acorn.Parser.extend(jsx()).parse("my(<jsx/>, 'code');");
console.log(parsed)

const program = escodegen.generate(parsed)
console.log(program)
