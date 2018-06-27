import Providers from './providers';
import AstNodeTypeTester from './helpers/AstNodeTypeTester';

export default async function AstNodeTypeVerifier() {
  const records = await Providers();

  console.log(records.length + 'records')

  //
  for (const record of records) {
    try {
      await AstNodeTypeTester([record])
      console.log('✅')
    } catch(e) {
      console.log('⚠️')
      console.log(e, record)
    }
  }
  //

  return AstNodeTypeTester(records);
}
