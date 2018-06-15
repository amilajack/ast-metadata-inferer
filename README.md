ast-node-type-verifier
======================
Given a list of API's, return their AST node type

```js
import astNodeTypeCheck from 'ast-node-type-verifier'

const records = [{
  apiType: 'js-api',
  protoChain: ['Array', 'push'], // corresponds to Array.prototype.push api
}]

astNodeTypeCheck(records)
```
