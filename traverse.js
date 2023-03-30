module.exports = function traverse(ast, visitors) {
  function walkNode(node, parent) {
    const method = visitors[node.type]
    if (method) {
      method(node, parent)
    }
    //遍历根节点的每个子节点
    if (node.type === 'Program') {
      walkNodes(node.body, node)
    } else if (node.type === 'CallExpression') {
      //处理CallExpression的params数组节点
      walkNodes(node.params, node)
    }
  }
  function walkNodes(nodes, parent) {
    nodes.forEach((node) => walkNode(node, parent))
  }
  //初始化第一次行走
  walkNode(ast, null)
}
