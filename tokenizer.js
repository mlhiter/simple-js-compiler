const LETTERS = /[a-z]/i //匹配字母，i表示忽略大小写
const WHITESPACE = /\s/ //匹配空格
const NUMBERS = /\d/ //匹配数字

module.exports = function tokenizer(input) {
  const tokens = []
  let current = 0
  while (current < input.length) {
    let char = input[current]
    //条件判断
    //左括号
    if (char === '(' || char === ')') {
      tokens.push({
        type: 'paren',
        value: char,
      })
      current++
      continue
    }
    //连续字符串
    if (LETTERS.test(char)) {
      let value = ''
      while (LETTERS.test(char)) {
        value += char
        char = input[++current]
      }
      tokens.push({
        type: 'name',
        value,
      })
      continue
    }
    //空格
    //空格不需要存储
    if (WHITESPACE.test(char)) {
      current++
      continue
    }
    //数字
    if (NUMBERS.test(char)) {
      let value = ''
      while (NUMBERS.test(char)) {
        value += char
        char = input[++current]
      }
      tokens.push({
        type: 'number',
        value,
      })
      continue
    }
    //如果都不满足就抛出错误
    throw new TypeError(`unknown char:'${char}'`)
  }
  return tokens
}
