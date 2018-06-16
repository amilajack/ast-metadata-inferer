import astNodeTypeChecker from '../'

jest.setTimeout(20000)

describe('AstNodeTypeChecker', () => {
  it('should return basic output', async () => {
    const [record] = await astNodeTypeChecker();
    expect(record).toHaveProperty('apiType');
    expect(record).toHaveProperty('type');
    expect(record).toHaveProperty('protoChain');
    expect(record).toHaveProperty('protoChainId');
    expect(record).toHaveProperty('astNodeType');
    expect(record).toHaveProperty('isStatic');
    expect(record).toMatchSnapshot()
  })
})
