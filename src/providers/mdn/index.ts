/* eslint @typescript-eslint/ban-ts-ignore: off, no-underscore-dangle: off */
import browserCompatData from "@mdn/browser-compat-data";
import interceptAndNormalize from "../../helpers/normalize-protochain";
import { ProviderApiMetadata, Language, APIKind } from "../../types";

// `version_added: true` or `version_added: "some browser version number"`
// means that the feature has been implemented in the browser. When `true`,
// a specific version is unknown. `version_added: false` means that the browser
// does not support the feature, and never has. `version_added: null` means that
// we have no idea if the browser has support for the feature. (A major goal is to
// get rid of as many of the `null` values we can and replace them with real data
// from the browsers.)
//
// See https://github.com/mdn/browser-compat-data/issues/3425#issuecomment-462176276

// BCD suffixes static members only to keep them apart from prototype members of the same name.
// See https://github.com/mdn/browser-compat-data/blob/main/docs/data-guidelines/api.md#static-api-members
const BCD_STATIC_MEMBER_SUFFIX = "_static";

function isStaticMemberKey(key: string): boolean {
  return key.endsWith(BCD_STATIC_MEMBER_SUFFIX);
}

function memberName(key: string): string {
  if (isStaticMemberKey(key)) {
    return key.slice(0, -BCD_STATIC_MEMBER_SUFFIX.length);
  }
  return key;
}

export default function mdnComaptDataProvider(): ProviderApiMetadata[] {
  const apiMetadata: ProviderApiMetadata[] = [];

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
      // @ts-ignore
      compat: api.__compat || api,
    });

    // ex. ['alert', 'document', ...]
    const members = Object.entries(api);
    const staticMemberNames = new Set(
      members
        .map(([key]) => key)
        .filter(isStaticMemberKey)
        .map(memberName)
    );
    members.forEach(([childName, childApi]) => {
      const name = memberName(childName);
      // On a name clash keep the static member: `Response.json` in code is the static access
      if (!isStaticMemberKey(childName) && staticMemberNames.has(name)) {
        return;
      }
      const protoChainId = [normalizedApi, name].join(".");
      apiMetadata.push({
        id: protoChainId,
        name,
        language: Language.JS,
        kind: api.kind,
        protoChain: [normalizedApi, name],
        protoChainId,
        // eslint-disable-next-line no-underscore-dangle
        // @ts-ignore
        compat: childApi?.__compat || childApi || api,
      });
    });
  });

  return apiMetadata;
}
