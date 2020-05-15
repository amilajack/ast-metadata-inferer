import fs from "fs";
import path from "path";
import providers from "./providers";
import astNodeTypesTester from "./helpers/ast-node-types-tester";
import { ApiMetadata } from "./types";

const API_BLACKLIST = ["close", "confirm", "print"];

export default async function astMetadataInferer(): Promise<ApiMetadata[]> {
  // @HACK: Temporarily ignoring the last 1K records because they
  //        cause issues for some unknown reason. They prevent
  //        AstMetadataInferer from returning
  const providerResults = await providers();
  const records = providerResults.filter(
    (metadata) => !API_BLACKLIST.includes(metadata.name)
  );
  const file = path.join(__dirname, "..", "metadata.json");

  if (fs.existsSync(file)) {
    await fs.promises.unlink(file);
  }

  const promises = [];
  const parallelisim = 4;
  const eachRecordsSize = Math.floor(records.length / parallelisim);

  for (let i = 0; i < parallelisim; i += 1) {
    const recordsSliceEnd =
      i === parallelisim ? records.length + 1 : (i + 1) * eachRecordsSize;
    const recordsSlice = records.slice(i * eachRecordsSize, recordsSliceEnd);
    promises.push(astNodeTypesTester(recordsSlice));
  }

  const recordsWithMetadata = await Promise.all(promises).then((res) =>
    res.reduce((p, c) => p.concat(c), [])
  );

  await fs.promises.writeFile(file, JSON.stringify(recordsWithMetadata));

  return recordsWithMetadata;
}
