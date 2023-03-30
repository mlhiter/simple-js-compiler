module.exports = function parser(tokens) {
  let current = 0
  function walk() {
    let token = tokens[current]
    //条件判断部分
    // 数字
    if (token.type === 'number') {
      current++
      return {
        type: 'NumberLiteral',
        value: token.value,
      }
    }
    //括号区分
    if (token.type === 'paren' && token.value === '(') {
      token = tokens[++current]
      const expression = {
        type: ' CallExpression',
        name: token.value,
        params: [],
      }
      token = tokens[++current]
      //获取参数
      while (token.value !== ')') {
        expression.params.push(walk())
        token = tokens[current]
      }
      current++
      return expression
    }
    throw new TypeError(`Unknown token:'${token.type}'`)
  }
  const ast = {
    type: 'Program', //根节点
    body: [walk()], //成员数组，每一行都是一个成员
  }

  return ast
}
