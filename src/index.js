import Providers from './providers';
import AstNodeTypeTester from './helpers/AstNodeTypeTester';

export default async function AstNodeTypeVerifier() {
  const records = (await Providers()).slice(0, 10000);
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

  return Promise
    .all(promises)
    .then(res => res.reduce((p, c) => p.concat(c), []));
}
