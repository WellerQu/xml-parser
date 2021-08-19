# XML Parser

Used to parse strings in XML format into DATA in JSON format, and the index position of the data in the original string.

## Usage

```typescript
const str = `
<abc    abc-attr="abc-value">
  Hello
  <item />
  World
  <item>     </item>
</abc>
`
const doc = parse(str)

{
  expect(doc.root?.location).not.toBeUndefined()

  const location = doc.root?.location
  expect(str.slice(location?.[0], location?.[1])).toBe('<abc    abc-attr="abc-value">')
}
{
  expect(doc.root?.attributes[0].location).not.toBeUndefined()

  const location = doc.root?.attributes[0].location
  expect(str.slice(location?.[0], location?.[1])).toBe(doc.root?.attributes[0].value)
}
{
  expect(doc.root?.children[0].location).not.toBeUndefined()

  const location = doc.root?.children[0].location
  expect(str.slice(location?.[0], location?.[1])).toBe((doc.root?.children[0] as XMLTextNode).text)
}
```

## Data structure

```typescript
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
```
