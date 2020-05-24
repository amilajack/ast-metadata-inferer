import browserCompatData from "mdn-browser-compat-data";
import interceptAndNormalize from "../../helpers/normalize-protochain";
import { ApiMetadata, Language, APIKind } from "../../types";

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

  const normalizedBrowserCompatApis = [
    ...Object.entries(browserCompatData.api).map(([name, api]) => ({
      ...api,
      name,
      kind: APIKind.Web,
    })),
    ...Object.entries(browserCompatData.javascript.builtins).map(
      ([name, api]) => ({
        ...api,
        name,
        kind: APIKind.ES,
      })
    ),
  ];

  normalizedBrowserCompatApis.forEach((api) => {
    // ex. 'Window'
    // ex. Window {... }
    const { name } = api;
    const normalizedApi = interceptAndNormalize(name);

    apiMetadata.push({
      id: normalizedApi,
      name,
      language: Language.JS,
      protoChain: [normalizedApi],
      protoChainId: normalizedApi,
      kind: api.kind,
      // eslint-disable-next-line no-underscore-dangle
      compat: api.__compat || api,
    });

    // ex. ['alert', 'document', ...]
    Object.entries(api).forEach(([childName, childApi]) => {
      const protoChainId = [normalizedApi, childName].join(".");
      apiMetadata.push({
        id: protoChainId,
        name: childName,
        language: Language.JS,
        kind: api.kind,
        protoChain: [normalizedApi, childName],
        protoChainId,
        // eslint-disable-next-line no-underscore-dangle
        compat: childApi?.__compat || childApi || api,
      });
    });
  });

  return apiMetadata;
}
