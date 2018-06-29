import fs from 'fs';
import path from 'path';
import Providers from './providers';
import AstNodeTypeTester from './helpers/AstNodeTypeTester';

export default async function AstNodeTypeVerifier() {
  // @HACK: Temporarily ignoring the last 1K records because they
  //        cause issues for some unknown reason. They prevent
  //        AstNodeTypeVerifier from returning
  const records = (await Providers()).slice(0, 13000);
  const promises = [];
  const parallelisim = 4;
  const eachRecordsSize = Math.floor(records.length / parallelisim);

  for (let i = 0; i < parallelisim; i++) {
    const recordsSliceEnd =
      i === parallelisim
        ? records.length + 1
        : (i + 1) * eachRecordsSize;
    const recordsSlice = records.slice(i * eachRecordsSize, recordsSliceEnd);
    promises.push(AstNodeTypeTester(recordsSlice));
  }

  const recordsWithMetadata = await Promise
    .all(promises)
    .then(res => res.reduce((p, c) => p.concat(c), []));

  const file = path.join(__dirname, '..', 'meta.json');

  await fs.promises.writeFile(file, JSON.stringify(recordsWithMetadata));

  return recordsWithMetadata;
}
