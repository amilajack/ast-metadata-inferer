// @flow
import browserCompatData from 'mdn-browser-compat-data';
import { interceptAndFormat } from '../MsApiCatalogProvider';
import type { RecordType } from '../../types';

export default function MdnComaptDataProvider(): Array<RecordType> {
  const records = [];

  const dict = {
    ...browserCompatData.api,
    ...browserCompatData.javascript.builtins
  };

  const browserCompatDataApis = Object.keys(dict);

  for (let i = 0; i < browserCompatDataApis.length; i += 1) {
    // ex. 'Window'
    const apiName = browserCompatDataApis[i];
    // ex. Window {... }
    const apiObject = dict[apiName];

    records.push({
      apiType: 'js-api',
      type: 'js-api',
      protoChain: [interceptAndFormat(apiName)],
      protoChainId: interceptAndFormat(apiName),
      compat: apiObject.__compat || apiObject
    });

    // ex. ['alert', 'document', ...]
    const apis = Object.keys(apiObject);

    for (let j = 0; j < apis.length; j += 1) {
      records.push({
        apiType: 'js-api',
        type: 'js-api',
        protoChain: [interceptAndFormat(apiName), apis[j]],
        protoChainId: [interceptAndFormat(apiName), apis[j]].join('.'),
        compat: apiObject[apis[j]].__compat || apiObject[apis[j]] || apiObject
      });
    }
  }

  return records;
}
