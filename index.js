const compiler = require('./compiler')
const input = '(add 2 (sub 4 3))' //Lisp语言
const output = compiler(input) //JS字符串
// console.log(JSON.stringify(output, null, 2))
console.log(output)
