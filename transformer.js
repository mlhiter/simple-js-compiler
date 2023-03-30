const traverse = require('./traverse')

module.exports = function transformer(originalAST) {
  const jsAST = {
    type: 'Program',
    body: [],
  }

  let position = jsAST.body

  traverse(originalAST, {
    NumberLiteral(node) {
      position.push({
        type: 'NumericLiteral',
        value: node.value,
      })
    },
    CallExpression(node, parent) {
      let expression = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: node.name, //函数的名字
        },
        arguments: [], //参数列表
      }
      const prevPosition = position
      position = expression.arguments
      if (parent.type !== 'CallExpression') {
        expression = {
          type: 'ExpressionStatement',
          expression,
        }
      }
      prevPosition.push(expression)
    },
  })
  return jsAST
}
