export type ApiMetadata<T = API.JS> = {
  id: string;
  name: string;
  type: T;
  apiType?: T;
  protoChain: Array<string>;
  protoChainId: string;
  compat: Record<string, any>;
};

export type CssApiMetadata = ApiMetadata<API.CSS>;

export type JsApiMetadata = ApiMetadata<API.JS>;

export enum API {
  JS = "js-api",
  CSS = "css-api",
}
