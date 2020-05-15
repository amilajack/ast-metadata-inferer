import browserCompatData from "mdn-browser-compat-data";
import interceptAndNormalize from "../../helpers/normalize-protochain";
import { ApiMetadata, API } from "../../types";

// `version_added: true` or `version_added: "some browser version number"`
// means that the feature has been implemented in the browser. When `true`,
// a specific version is unknown. `version_added: false` means that the browser
// does not support the feature, and never has. `version_added: null` means that
// we have no idea if the browser has support for the feature. (A major goal is to
// get rid of as many of the `null` values we can and replace them with real data
// from the browsers.)
//
// See https://github.com/mdn/browser-compat-data/issues/3425#issuecomment-462176276

export default function mdnComaptDataProvider(): ApiMetadata[] {
  const apiMetadata: ApiMetadata[] = [];

  const dict = {
    ...browserCompatData.api,
    ...browserCompatData.javascript.builtins,
  };

  const browserCompatDataApis = Object.keys(dict);

  for (let i = 0; i < browserCompatDataApis.length; i += 1) {
    // ex. 'Window'
    const apiName = browserCompatDataApis[i];
    // ex. Window {... }
    const apiObject = dict[apiName];
    const normalizedApi = interceptAndNormalize(apiName);

    apiMetadata.push({
      id: normalizedApi,
      name: apiName,
      apiType: API.JS,
      type: API.JS,
      protoChain: [normalizedApi],
      protoChainId: normalizedApi,
      // eslint-disable-next-line no-underscore-dangle
      compat: apiObject.__compat || apiObject,
    });

    // ex. ['alert', 'document', ...]
    const apis = Object.keys(apiObject);

    for (let j = 0; j < apis.length; j += 1) {
      const protoChainId = [normalizedApi, apis[j]].join(".");
      apiMetadata.push({
        id: protoChainId,
        name: apiName,
        apiType: API.JS,
        type: API.JS,
        protoChain: [normalizedApi, apis[j]],
        protoChainId,
        // eslint-disable-next-line no-underscore-dangle
        compat: apiObject[apis[j]].__compat || apiObject[apis[j]] || apiObject,
      });
    }
  }

  return apiMetadata;
}
