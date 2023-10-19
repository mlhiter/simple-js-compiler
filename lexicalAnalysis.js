const NONEORALLSPACE = /^[ ]*$/ //空或者全是空格
const FRONTLASTBLANK = /(^\s*)|(\s*$)/g //字符串前后的空白字符
const NUMBER = /^\d$/ //单个数字字符
/**
 * 词法分析第一步：源代码预处理
 * @param {string} sourceCode 源代码
 * @returns {string} 预处理后的源代码
 * @description 删除注释（单行+多行）
 */
function preprocess(sourceCode) {
  let codeList = sourceCode.split('\n')

  let afterProcessCode = ''

  let i = 0
  // 遍历每一行代码
  while (i < codeList.length) {
    let codeLine = codeList[i]
    let index
    // 删除单行注释，保留//之前的句子
    index = codeLine.indexOf('//')
    if (index != -1) {
      codeLine = codeLine.slice(0, index)
      if (NONEORALLSPACE.test(codeLine)) {
        i++
        continue
      }
    }

    // 删除多行注释，只删除一对/*和*/之间的内容，目前不支持一行中有多对多行注释符号
    index = codeLine.indexOf('/*')
    if (index != -1) {
      // codeLine1保存 /*之前的句子
      let codeLine1 = codeLine.slice(0, index)

      index = codeLine.indexOf('*/')

      // 多行注释结束符不在当前行,往后遍历直到找到*/
      while (index == -1) {
        i++
        codeLine = codeList[i]
        index = codeLine.indexOf('*/')
      }

      // codeLine2保存 */之后的句子
      index = index + 2
      let codeLine2 = codeLine.slice(index)
      codeLine = codeLine1 + ' ' + codeLine2
      if (NONEORALLSPACE.test(codeLine)) {
        i++
        continue
      }
    }

    // 删除注释之后如果该行句子不空，则去除空格、tab、回车等空白字符之后，
    if (!NONEORALLSPACE.test(codeLine)) {
      let words = codeLine.split()
      // 去除空列表
      if (words.length > 0) {
        words.forEach((word) => {
          afterProcessCode += word + ' '
        })
        afterProcessCode += '/n'
      }
    }
    i++
  }
  return afterProcessCode
}

/**
 * 词法分析第二步：tokenizer
 * @param {string} afterProcessCode 预处理后的源代码
 * @returns {Array} species
 * @description 识别关键字、运算符、界符、数字、字符串、标识符、以及错误
 */
function tokenizer(afterProcessCode) {
  // 关键字，C语言共32个关键字
  const keywords = [
    'char', // 基本数据类型关键字
    'double',
    'float',
    'int',
    'void',
    'long', //类型修饰关键字
    'short',
    'signed',
    'unsigned',
    'struct', //复杂类型关键字
    'union',
    'enum',
    'sizeof',
    'typeof',
    'for', // 流程控制关键字
    'do',
    'while',
    'break',
    'continue',
    'if',
    'else',
    'goto',
    'switch',
    'case',
    'default',
    'return',
    'auto', // 存储级别关键字
    'extern',
    'register',
    'static',
    'const',
    'volatile',
  ]
  // 运算符
  const operators = [
    '+',
    '-',
    '*',
    '/',
    '%',
    '++',
    '--', // 算术运算符
    '==',
    '!=',
    '>',
    '<',
    '>=',
    '<=', // 关系运算符
    '&',
    '|', // 按位与，按位或（也是逻辑运算符的先导符）
    '&&',
    '||',
    '!', // 逻辑运算符
    '=',
    '+=',
    '-=',
    '+=',
    '/=',
    '%=', // 赋值运算符
  ]
  // 分界符
  const delimiters = ['{', '}', '[', ']', '(', ')', ',', '.', ';']

  // 存放单词种类
  let species = []

  // 按行读取每一行文字，存放入列表中
  let codeLines = afterProcessCode.split('\n') // 将换行符替换成空字符
  // 删除句子前后空白字符
  for (let i = 0; i < codeLines.length; i++) {
    codeLines[i] = codeLines[i].replace(FRONTLASTBLANK, '')
  }

  let row = 0
  while (row < codeLines.length) {
    let codeLine = codeLines[row]
    let i = 0

    while (i < codeLine.length) {
      // 0 - 空格：跳过空格。优先级：1
      if (codeLine[i] == ' ') {
        i++
        continue
      }

      // 7 - 分界符：分界符均为单字符，记录到单词序列中。优先级：1
      if (delimiters.indexOf(codeLine[i]) >= 0) {
        species.push(['分界符', 7, codeLine[i]])
        i++
        continue
      }

      // 8 - 运算符：分为单字符运算符和双字符运算符，解析后记录到单词序列中。优先级：1
      if (operators.indexOf(codeLine[i]) >= 0) {
        let temp = codeLine[i]
        i++
        // 双字符超前搜索
        if (operators.indexOf(temp + codeLine[i]) >= 0) {
          temp += codeLine[i]
          i++
        }
        species.push(['运算符', 8, temp])
        continue
      }

      // 3 - 浮点数，2 - 整数。优先级：2
      if (NUMBER.test(codeLine[i])) {
        let temp = '' // 用以接收未知长度的数字
        while (NUMBER.test(codeLine[i]) || codeLine[i] == '.') {
          temp += codeLine[i]
          i++
          // 超过一行的字符数则退出
          if (i > codeLine.length - 1) break
        }

        // 防止出现数字开头的非法标识符
        if (
          i == codeLine.length ||
          NUMBER.test(codeLine[i]) ||
          operators.indexOf(codeLine[i]) >= 0 ||
          delimiters.indexOf(codeLine[i]) >= 0 ||
          codeLine[i] == ' '
        ) {
          // 3 - 浮点数
          if (temp.indexOf('.') >= 0) {
            let index = temp.indexOf('.')
            // 0 - 错误：多个浮点
            if (temp.slice(index + 1).indexOf('.') > 0)
              species.push(['错误', -1, temp, '非法浮点数'])
            else species.push(['浮点数', 3, temp])
          }
          // 2 - 整数
          else species.push(['整数', 2, temp])
        } else {
          while (true) {
            if (
              i > codeLine.length - 1 ||
              codeLine[i] == ' ' ||
              operators.indexOf(codeLine[i]) >= 0 ||
              delimiters.indexOf(codeLine[i]) >= 0
            )
              break
            else temp += codeLine[i]
            i++
          }
          species.push(['错误', -1, temp, '非法标识符'])
        }

        continue
      }

      // 7 - 字符串常数.优先级：2
      if (codeLine[i] == '"' || codeLine[i] == "'") {
        let mark = codeLine[i]
        let temp = ''
        i++
        while (codeLine[i] != mark) {
          temp += codeLine[i]
          i += 1
          // 超过一行的字符数则退出
          if (i >= codeLine.length - 1) break
        }

        // 引号闭合
        if (codeLine[i] == mark) {
          species.push(['字符串常数', 5, temp])
        }

        // 引号未闭合
        else species.push(['错误', -1, temp, '引号未闭合'])

        i++
        continue
      }

      // 6 - 关键词，1 - 标识符。优先级：3
      let temp = ''
      while (true) {
        if (
          i > codeLine.length - 1 ||
          codeLine[i] == ' ' ||
          operators.indexOf(codeLine[i]) >= 0 ||
          delimiters.indexOf(codeLine[i]) >= 0
        )
          break
        else temp += codeLine[i]
        i++
      }
      i--

      // 6 - 关键字：检索出来的单词在关键字集合中
      if (keywords.indexOf(temp) >= 0) species.push(['关键字', 6, temp])
      // 检测非法标识符
      else {
        // 首字符应该为字母或下划线
        if (!(temp[0].match(/[a-zA-Z]/) || temp[0] == '_'))
          species.push(['错误', -1, temp, '非法标识符'])
        // 1 - 标识符：其他合法单词
        else species.push(['标识符', 1, temp])
      }
      i++
    }
    // 当前行的每个字符遍历完毕
    row++
  }
  return species
}

/**
 * 词法分析主函数
 * @returns {Array}
 * @description 删除注释（单行+多行）
 */
module.exports = function lexicalAnalysis() {
  let afterProcessCode = preprocess()

  var species = []
  species = tokenizer(afterProcessCode)

  let tokens = ''
  let flag = true //判断词法分析是否出现错误
  for (let i = 0; i < species.length; i++) {
    if (species[i][1] == -1) {
      tokens += "<span style='color:red'>"
      tokens += JSON.stringify(species[i]) + '&emsp;&emsp;'
      tokens += '</span>'
      flag = false
    } else {
      tokens += JSON.stringify(species[i]) + '&emsp;&emsp;'
    }
    if ((i + 1) % 5 == 0) {
      tokens += '</br>'
    }
  }

  document.getElementById('tokens').innerHTML = tokens

  return [species, flag]
}
