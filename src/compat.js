// @flow
import fs from 'fs';
import path from 'path';
import AstMetadataInferer from '.';
import MdnComaptDataProvider from './providers/MdnCompatDataProvider';

export default async function Compat() {
  const records = await AstMetadataInferer();
  // Add all the corresponding compat data for each inferred ast node
  const compatDataMap = new Map(
    MdnComaptDataProvider().map(e => [e.protoChainId, e])
  );
  const apisWithCompatRecords = records
    .filter(api => compatDataMap.has(api.protoChainId))
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
