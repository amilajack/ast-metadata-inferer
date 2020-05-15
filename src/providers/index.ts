import mdnCompatData from "./mdn";
// @TODO: Needs to return compat records
// import MsApiCatalogProvider from "./MsApiCatalogProvider";
import type { ApiMetadata } from "../types";

export default async function Providers(): Promise<Array<ApiMetadata>> {
  const [mdnRecords] = await Promise.all([mdnCompatData()]);
  const map: Map<string, ApiMetadata> = new Map<string, ApiMetadata>(
    mdnRecords.map((record) => [record.protoChainId, record])
  );

  return Array.from(map.values()).filter(
    (record) =>
      !record.protoChain.includes("RegExp") &&
      !record.protoChainId.includes("@@")
  );
}
