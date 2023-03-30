const tokenizer = require('./tokenizer')
const parser = require('./parser')
const transformer = require('./transformer')
const generateCode = require('./generateCode')

module.exports = function compiler(input) {
  //1,语法分析
  //将输入字符串转换成基本的语言语法（块）
  const tokens = tokenizer(input)
  //2,句法分析
  //上一步我们只收集了所有语法片段，却忽略了他们之间的关系。
  //这一阶段就是在树状结构中表示lisp代码，包含将其转换为另一种语言的所有需要信息，叫做AST语法树。
  const lispAST = parser(tokens)
  //3，转换
  //将适合lisp的语法树变成适合javascript的语法树
  const jsAST = transformer(lispAST)
  //4,代码生成
  const jsCode = generateCode(jsAST)
  return lispAST
}
