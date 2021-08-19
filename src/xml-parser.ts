interface Token {
  type: 'tagStart' | 'tagEnd' | 'tagSingle' | 'text' | 'declaration' | 'space',
  location: [number, number],
  content: string
}

interface XMLSchema {
  location: [number, number]
}

/**
 * 文档声明
 */
export interface XMLDeclaration extends XMLSchema {
  /**
   * 版本
   */
  version: string
  /**
   * 编码格式
   */
  encoding: string
}

/**
 * 文档节点属性
 */
export interface XMLAttribute extends XMLSchema {
  /**
   * 属性名称
   */
  name: string
  /**
   * 属性值
   */
  value: string
}

/**
 * 文档文本节点
 */
export interface XMLTextNode extends XMLSchema {
  /**
   * 节点内容
   */
  text: string
}

/**
 * 文档节点
 */
export interface XMLNode extends XMLSchema {
  /**
   * 节点名称
   */
  name: string
  /**
   * 节点属性集合
   */
  attributes: XMLAttribute[]
  /**
   * 子节点集合
   */
  children: (XMLNode | XMLTextNode)[],
}

/**
 * XML 文档对象
 */
export interface XMLDocument {
  /**
   * 文档声明
   */
  declaration?: XMLDeclaration
  /**
   * 文档根节点
   */
  root: XMLNode | undefined
}

const tokenizers: [RegExp, number, Token['type']][] = [
  [/^(<\?.*?\?>)/i, 1, 'declaration'],
  [/^([\r\n\s\t]+)/i, 1, 'space'],
  [/^(?:<([^>/]+)\/>)/i, 1, 'tagSingle'],
  [/^(?:<\/([^>]+)>)/, 1, 'tagEnd'],
  [/^(?:<([^>]+)>)/, 1, 'tagStart'],
  [/^([^<\r\n]+)/i, 1, 'text']
]

function lexer(source: string): Token[] {
  const tokens: Token[] = []

  let start = 0
  let tmp: string = source.slice(start)

  while (tmp.length > 0) {
    const length = tmp.length

    for (let i = 0; i < tokenizers.length; i++) {
      const [regExp, groupIndex, type] = tokenizers[i]
      const result = regExp.exec(tmp)

      if (result === null || result.length < 2) {
        continue
      }
      tokens.push({
        type,
        location: [start, start + result[0].length],
        content: result[groupIndex]
      })

      start += result[0].length

      tmp = source.slice(start)

      break
    }

    if (length === tmp.length) {
      throw new Error(`parse error: ${start} 处出现非预期的字符 ${tmp[0]}`)
    }
  }

  return tokens
}

function resolveAttributes(token: Token): XMLAttribute[] {
  const regExp = /\s*([a-zA-Z0-9:-]+)\s*=\s*("|')([^"']+)(\2)/i
  const attrs: XMLAttribute[] = []
  const initial = token.location[0]

  let content = token.content
  let result: RegExpMatchArray | null = regExp.exec(content)


  while (result) {
    const index = (result.index ?? 0) + token.content.length - content.length
    const start = result[0].length - result[3].length + index + initial
    const end = result[0].length + index + initial

    attrs.push({
      name: result[1],
      value: result[3],
      location: [start, end]
    })
    content = content.slice(result[0].length + (result.index ?? 0))
    result = regExp.exec(content)
  }

  return attrs
}

function resolveNodeName(token: Token): string {
  if (token.type !== 'tagSingle' && token.type !== 'tagStart') {
    return ''
  }

  const result = /^([^\s]+)/i.exec(token.content)
  if (!result || !result[1]) {
    return ''
  }

  return result[1]
}

function toXMLDocument(tokens: Token[]): XMLDocument {
  const analyzeStack: XMLNode[] = []
  const doc: XMLDocument = {
    root: undefined
  }

  let index = 0
  while (index < tokens.length) {
    const token = tokens[index]
    const top = analyzeStack[analyzeStack.length - 1]

    if (token.type === 'space') {
      // TODO: some code
    } else if (token.type === 'declaration') {
      // TODO: 等有空了再填
    } else if (token.type === 'tagSingle') {
      const node: XMLNode = {
        name: resolveNodeName(token),
        location: token.location,
        children: [],
        attributes: resolveAttributes(token)
      }

      if (top) {
        top.children.push(node)
      } else {
        analyzeStack.push(node)
      }
    } else if (token.type === 'tagStart') {
      const node: XMLNode = {
        name: resolveNodeName(token),
        location: token.location,
        children: [],
        attributes: resolveAttributes(token)
      }
      if (top) {
        top.children.push(node)
      }
      analyzeStack.push(node)
    } else if (token.type === 'tagEnd') {
      doc.root = analyzeStack.pop()
    } else if (token.type === 'text') {
      const node: XMLTextNode = {
        text: token.content,
        location: token.location
      }
      if (top) {
        top.children.push(node)
      }
    }

    index++
  }

  if (analyzeStack.length === 1 && !doc.root) {
    doc.root = analyzeStack[0]
  } else if (analyzeStack.length > 1) {
    throw new Error('parse error: XML format is wrong')
  }

  return doc
}

export const parse = (source: string): XMLDocument => {
  const tokens = lexer(source).filter(item => item.type !== 'space')

  const schema = toXMLDocument(tokens)
  return schema
}