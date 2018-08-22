/* eslint global-require: 0 */
import fs from 'fs';
import path from 'path';
import AstMetadataInferer from '../src';

jest.setTimeout(60000);

describe('AstMetadataInferer', () => {
  it('should return basic output', async () => {
    const [record, ...records] = await AstMetadataInferer();
    expect(record).toHaveProperty('apiType');
    expect(record).toHaveProperty('type');
    expect(record).toHaveProperty('protoChain');
    expect(record).toHaveProperty('protoChainId');
    expect(record).toHaveProperty('astNodeType');
    expect(record).toHaveProperty('isStatic');
    expect(record).toMatchSnapshot();

    records.forEach((_record) => {
      expect(_record).toHaveProperty('apiType');
      expect(_record).toHaveProperty('type');
      expect(_record).toHaveProperty('protoChain');
      expect(_record).toHaveProperty('protoChainId');
      expect(_record).toHaveProperty('astNodeType');
      expect(_record).toHaveProperty('isStatic');
    });
  });

  it('should write to meta.json correctly', async () => {
    const filepath = path.join(__dirname, '..', 'meta.json');
    const file = await fs.promises.readFile(filepath);

    expect(JSON.parse(file.toString())[0]).toMatchSnapshot();
    const recordsCount = JSON.parse(file.toString()).length;
    expect(recordsCount).toMatchSnapshot();
    expect(recordsCount).toMatchSnapshot();

    console.log(`${recordsCount} records in meta.json`);

    const AstMetadata = require('../meta');
    expect(AstMetadata).toHaveLength(recordsCount)
  });

  it('should expose meta.json in parsable format', () => {
    const AstMetadata = require('../meta');
    const querySelectorRecord =
      AstMetadata.find(record => record.protoChainId === 'document.querySelector');
    expect(querySelectorRecord).toMatchSnapshot();
  })
});
