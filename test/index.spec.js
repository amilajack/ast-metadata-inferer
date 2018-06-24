import astNodeTypeVerifier from '../src/providers';

jest.setTimeout(20000);

describe('AstNodeTypeVerifier', () => {
  it('should return basic output', async () => {
    const [record] = await astNodeTypeVerifier();
    expect(record).toHaveProperty('apiType');
    expect(record).toHaveProperty('type');
    expect(record).toHaveProperty('protoChain');
    expect(record).toHaveProperty('protoChainId');
    expect(record).toHaveProperty('astNodeType');
    expect(record).toHaveProperty('isStatic');
    expect(record).toMatchSnapshot();
  });
});
