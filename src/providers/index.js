// @flow
import MdnCompatData from './MdnCompatDataProvider';
import MsApiCatalogProvider from './MsApiCatalogProvider';
import type { RecordType } from '../types';

export default async function Providers(): Promise<Array<RecordType>> {
  const records = await Promise.all([MdnCompatData(), MsApiCatalogProvider()]);

  const map1: Map<string, RecordType> = new Map();
  const map2: Map<string, RecordType> = new Map();

  records[0].forEach(record => {
    map1.set(record.protoChainId, record);
  });

  records[1].forEach(record => {
    map2.set(record.protoChainId, record);
  });

  map1.forEach((record, key) => {
    if (map2.has(key)) {
      map2.delete(key);
    }
  });

  return [...map1.values(), ...map2.values()].filter(
    record =>
      !record.protoChain.includes('RegExp') &&
      !record.protoChainId.includes('@@')
  );
}
