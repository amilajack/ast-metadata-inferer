import Providers from './providers';
import AstNodeTypeTester from './helpers/AstNodeTypeTester';

export default async function AstNodeTypeVerifier() {
  const records = await Providers();
  return AstNodeTypeTester(records);
}
