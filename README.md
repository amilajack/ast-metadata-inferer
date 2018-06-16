ast-node-type-verifier
======================
[![Build Status](https://travis-ci.org/amilajack/ast-node-type-verifier.svg?branch=master&maxAge=2592)](https://travis-ci.org/amilajack/ast-node-type-verifier)

Given a list of API's, return their AST node type

```js
import astNodeTypeCheck from 'ast-node-type-verifier'

const records = [{
  apiType: 'js-api',
  protoChain: ['Array', 'push'], // corresponds to Array.prototype.push api
}]

const records = await astNodeTypeCheck(records);
```

**NOTE: ONLY COMPAT WITH NODE 10**
