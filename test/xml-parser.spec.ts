import { parse, XMLNode, XMLTextNode } from '../src/xml-parser'

describe('test parse', () => {
  it('there is declaration', () => {
    const str = '<?xml version="1.0" encoding="UTF-8"?>'
    const doc = parse(str)

    expect(doc).not.toBeUndefined()
    // TODO: 这个等有空了再写
    expect(doc.declaration).toBeUndefined()
    expect(doc.root).toBeUndefined()
  })

  it('there is not declaration', () => {
    const str = '<abc></abc>'
    const doc = parse(str)

    expect(doc.root).not.toBeUndefined()
    expect(doc.root?.name).toBe('abc')
  })

  it('single node', () => {
    const str = '<abc />'
    const doc = parse(str)

    expect(doc.root).not.toBeUndefined()
    expect(doc.root?.name).toBe('abc')
  })

  it('nested nodes', () => {
    const str = '<abc><item /></abc>'
    const doc = parse(str)

    expect(doc.root?.name).toBe('abc')
    expect(doc.root?.children).toHaveLength(1)
    expect((doc.root?.children[0] as XMLNode).name).toBe('item')
  })

  it('more children', () => {
    const str = '<abc><item /><item /></abc>'
    const doc = parse(str)

    expect(doc.root?.children).toHaveLength(2)
    expect((doc.root?.children[0] as XMLNode).name).toBe('item')
    expect((doc.root?.children[1] as XMLNode).name).toBe('item')
  })

  it('there are some texts in children', () => {
    const str = '<abc>Hello<item />World<item /></abc>'
    const doc = parse(str)

    expect(doc.root?.children).toHaveLength(4)
    expect((doc.root?.children[0] as XMLTextNode).text).toBe('Hello')
    expect((doc.root?.children[1] as XMLNode).name).toBe('item')
    expect((doc.root?.children[2] as XMLTextNode).text).toBe('World')
    expect((doc.root?.children[3] as XMLNode).name).toBe('item')
  })

  it('there are some attributes in XMLNode', () => {
    const str = '<abc attr1="abc-value-1" attr2="abc-value-2">Hello<item item-attr="item-value" />World<item /></abc>'
    const doc = parse(str)

    expect(doc.root?.attributes).toHaveLength(2)
    expect(doc.root?.attributes[0].name).toBe('attr1')
    expect(doc.root?.attributes[0].value).toBe('abc-value-1')
    expect(doc.root?.attributes[1].name).toBe('attr2')
    expect(doc.root?.attributes[1].value).toBe('abc-value-2')
    expect((doc.root?.children[1] as XMLNode).attributes[0].name).toBe('item-attr')
    expect((doc.root?.children[1] as XMLNode).attributes[0].value).toBe('item-value')
    expect((doc.root?.children[3] as XMLNode).attributes).toHaveLength(0)
  })

  it('there are some CRLF or Space in xml string', () => {
    const str = `
    <abc    abc-attr="abc-value">
      Hello
      <item />
      World
      <item>     </item>
    </abc>
    `
    const doc = parse(str)

    expect(doc.root?.name).toBe('abc')
    expect(doc.root?.attributes[0].name).toBe('abc-attr')
    expect(doc.root?.attributes[0].value).toBe('abc-value')
    expect((doc.root?.children[0] as XMLTextNode).text).toBe('Hello')
    expect((doc.root?.children[3] as XMLNode).children).toHaveLength(0)
  })

  it('every element has the location', () => {
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
  })
})