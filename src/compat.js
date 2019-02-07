// @flow
import fs from 'fs';
import path from 'path';
import mdnBrowserCompatData from 'mdn-browser-compat-data';
import AstMetadataInferer from '.';

export default async function Compat() {
  const records = await AstMetadataInferer();
  // Add all the corresponding compat data for each inferred ast node
  const compatDataMap = new Map([
    ...Object.entries(mdnBrowserCompatData.api),
    ...Object.entries(mdnBrowserCompatData.javascript.builtins)
  ]);
  const apisWithCompatRecords = records
    .filter(api => {
      const hasCompatRecord = compatDataMap.has(api.protoChain[0]);
      if (!hasCompatRecord) return false;
      if (api.protoChain.length >= 2) {
        const item = compatDataMap.get(api.protoChain[0]);
        return api.protoChain[1] in item;
      }
      return true;
    })
    .map(api => {
      const compatRecord = compatDataMap.get(api.protoChain[0]);

      const { __compat: compat } =
        api.protoChain.length >= 2
          ? compatRecord[api.protoChain[1]] || compatRecord
          : compatRecord;

      return {
        ...api,
        compat: compat || compatRecord
      };
    });

  const compatRecordsFile = path.join(__dirname, '..', 'compat.json');
  await fs.promises.writeFile(
    compatRecordsFile,
    JSON.stringify(apisWithCompatRecords)
  );

  return apisWithCompatRecords;
}

if (require.main === module) {
  (async () => {
    await Compat();
  })();
}
