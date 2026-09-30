import mdnCompatData from "./mdn";
// @TODO: Needs to return compat records
// import MsApiCatalogProvider from "./MsApiCatalogProvider";
import type { ProviderApiMetadata } from "../types";

// BCD also lists values such as `Permissions.permission_clipboard-read` that code can't write as `a.b`
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

export default async function Providers(): Promise<ProviderApiMetadata[]> {
  const [mdnRecords] = await Promise.all([mdnCompatData()]);
  const map: Map<string, ProviderApiMetadata> = new Map<
    string,
    ProviderApiMetadata
  >(mdnRecords.map((record) => [record.protoChainId, record]));

  return Array.from(map.values()).filter(
    (record) =>
      !record.protoChain.includes("RegExp") &&
      !record.protoChainId.includes("@@") &&
      record.protoChain.every((name) => IDENTIFIER.test(name))
  );
}
