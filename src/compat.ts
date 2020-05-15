import fs from "fs";
import path from "path";
import astMetadataInferer from "./metadata";
import MdnComaptDataProvider from "./providers/mdn";
import { ApiMetadata } from "./types";

/**
 * Write compat.json file which contains API metadata and compat data
 */
export default async function Compat(): Promise<ApiMetadata[]> {
  const astMetadata = await astMetadataInferer();
  // Add all the corresponding compat data for each inferred ast node
  const compatDataMap = new Map(
    MdnComaptDataProvider().map((e) => [e.protoChainId, e])
  );
  const apisWithCompatRecords = astMetadata.filter((api) =>
    compatDataMap.has(api.protoChainId)
  );

  const compatRecordsFile = path.join(__dirname, "..", "compat.json");
  await fs.promises.writeFile(
    compatRecordsFile,
    JSON.stringify(apisWithCompatRecords)
  );

  return apisWithCompatRecords;
}

if (require.main === module) {
  Compat().catch((e) => {
    throw new Error(e);
  });
}
