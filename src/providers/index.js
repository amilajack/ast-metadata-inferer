// @flow
import MdnCompatData from './MdnCompatDataProvider';
import MsApiCatalogProvider from './MsApiCatalogProvider';

export type RecordType = {
  protoChain: Array<string>,
  protoChainId: string
};

export default async function Providers() {
  const records = await Promise.all([
    MdnCompatData().filter(record => !record.protoChain.includes('RegExp')),
    MsApiCatalogProvider().filter(record => !record.protoChain.includes('RegExp'))
  ]);
  return [...records[0], ...records[1]];
}
