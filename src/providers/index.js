// @flow
import MdnCompatData from './MdnCompatDataProvider';
import MsApiCatalogProvider from './MsApiCatalogProvider';

export default async function Providers() {
  const records = await Promise.all([MdnCompatData(), MsApiCatalogProvider()]);

  const map1 = new Map();
  const map2 = new Map();

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
