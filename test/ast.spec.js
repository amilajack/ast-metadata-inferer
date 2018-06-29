import fs from 'fs';
import path from 'path';
import AstNodeTypeVerifier from '../src';

jest.setTimeout(2000000);

describe('AstNodeTypeVerifier', () => {
  it('should return basic output', async () => {
    const [record, ...records] = await AstNodeTypeVerifier();
    expect(record).toHaveProperty('apiType');
    expect(record).toHaveProperty('type');
    expect(record).toHaveProperty('protoChain');
    expect(record).toHaveProperty('protoChainId');
    expect(record).toHaveProperty('astNodeType');
    expect(record).toHaveProperty('isStatic');
    // expect(record).toMatchSnapshot();

    records.forEach((_record) => {
      expect(_record).toHaveProperty('apiType');
      expect(_record).toHaveProperty('type');
      expect(_record).toHaveProperty('protoChain');
      expect(_record).toHaveProperty('protoChainId');
      expect(_record).toHaveProperty('astNodeType');
      expect(_record).toHaveProperty('isStatic');
    });

    const filepath = path.join(__dirname, '..', 'meta.json');
    const file = await fs.promises.readFile(filepath);

    const recordsCount = JSON.parse(file.toString()).length;
    expect(recordsCount).toBeGreaterThanOrEqual(8000);
    expect(recordsCount.length).toMatchSnapshot();

    console.log(`${recordsCount} records in meta.json`);
  }, 1000000000);
});
